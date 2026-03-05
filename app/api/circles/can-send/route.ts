import { NextRequest, NextResponse } from "next/server"
import { circlesConfig, circlesV2FindPath, hasDirectTrust } from "@/lib/circles"

function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim())
}

function normalizeAddress(address: string): string {
  const trimmed = address.trim().toLowerCase()
  if (!trimmed) return ""
  return trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`
}

function crcToAtto(crc: number): string {
  if (!Number.isFinite(crc) || crc <= 0) {
    throw new Error("Amount must be a positive number")
  }
  const whole = Math.trunc(crc)
  const frac = crc - whole
  const wholePart = BigInt(whole) * BigInt("1000000000000000000")
  const fracPart = BigInt(Math.round(frac * 1e9)) * BigInt("1000000000")
  return (wholePart + fracPart).toString()
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { userAddress, amountCrc } = body as {
      userAddress?: string
      amountCrc?: number
    }

    const normalizedUserAddress = typeof userAddress === "string" ? normalizeAddress(userAddress) : ""
    if (!normalizedUserAddress || !isValidAddress(normalizedUserAddress)) {
      return NextResponse.json({ error: "Invalid userAddress" }, { status: 400 })
    }

    const devAddress =
      process.env.NEXT_PUBLIC_DEV_RECIPIENT_ADDRESS ||
      process.env.NEXT_PUBLIC_DEFAULT_RECIPIENT_ADDRESS ||
      process.env.NEXT_PUBLIC_GATEWAY_ADDRESS ||
      circlesConfig.defaultRecipientAddress

    const normalizedDevAddress = normalizeAddress(devAddress)
    if (!normalizedDevAddress || !isValidAddress(normalizedDevAddress)) {
      return NextResponse.json({ error: "Server misconfigured: invalid dev recipient address" }, { status: 500 })
    }

    const hasExplicitTrust = await hasDirectTrust(normalizedUserAddress, normalizedDevAddress)

    const amountNumber =
      typeof amountCrc === "number"
        ? amountCrc
        : Number.isFinite(Number(amountCrc))
          ? Number(amountCrc)
          : 0

    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      return NextResponse.json({ error: "amountCrc must be a positive number" }, { status: 400 })
    }

    const targetFlow = crcToAtto(amountNumber)

    const result = await circlesV2FindPath(normalizedUserAddress, normalizedDevAddress, targetFlow)

    const rawMaxFlow = typeof result.MaxFlow === "string" && result.MaxFlow !== "" ? result.MaxFlow : "0"

    let maxFlow: bigint
    let target: bigint

    try {
      maxFlow = BigInt(rawMaxFlow)
      target = BigInt(targetFlow)
    } catch (e) {
      console.warn("[POST /api/circles/can-send] Failed to parse BigInt values from Circles response", {
        rawMaxFlow,
        targetFlow,
        error: e,
      })
      // If we cannot parse the response, fall back to treating this as no available flow
      return NextResponse.json({
        canSend: false,
        hasExplicitTrust,
        maxFlowAtto: "0",
        targetFlowAtto: targetFlow,
        transfers: result.Transfers ?? [],
        source: normalizedUserAddress,
        sink: normalizedDevAddress,
      })
    }

    const canSend = maxFlow >= target

    return NextResponse.json({
      canSend,
      hasExplicitTrust,
      maxFlowAtto: rawMaxFlow,
      targetFlowAtto: targetFlow,
      transfers: result.Transfers,
      source: normalizedUserAddress,
      sink: normalizedDevAddress,
    })
  } catch (error) {
    console.error("[POST /api/circles/can-send]", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}

