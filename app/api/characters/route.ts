import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"
import type { CharacterState } from "@/lib/traits"

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function getSupabase() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey)
}

function normalizeAddress(owner: string): string {
  const trimmed = owner.trim()
  if (!trimmed) return ""
  const lower = trimmed.toLowerCase()
  return lower.startsWith("0x") ? lower : `0x${lower}`
}

type CreateBody = {
  ownerAddress: string
  character: CharacterState
  paymentTxHash?: string
}

function validateCharacter(c: unknown): c is CharacterState {
  if (!c || typeof c !== "object") return false
  const o = c as Record<string, unknown>
  return (
    typeof o.backgroundId === "string" &&
    typeof o.bodyId === "string" &&
    typeof o.headId === "string" &&
    typeof o.accessoryId === "string" &&
    typeof o.nogglesId === "string"
  )
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      )
    }

    const body = (await request.json()) as unknown
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }

    const { ownerAddress, character, paymentTxHash } = body as CreateBody
    const owner = typeof ownerAddress === "string" ? ownerAddress : ""
    const normalizedOwner = normalizeAddress(owner)
    if (!normalizedOwner) {
      return NextResponse.json(
        { error: "ownerAddress is required" },
        { status: 400 }
      )
    }
    if (!validateCharacter(character)) {
      return NextResponse.json(
        { error: "character must include backgroundId, bodyId, headId, accessoryId, nogglesId" },
        { status: 400 }
      )
    }

    const supabase = getSupabase()
    const { data, error } = await supabase
      .from("characters")
      .insert({
        owner_address: normalizedOwner,
        background_id: character.backgroundId,
        body_id: character.bodyId,
        head_id: character.headId,
        accessory_id: character.accessoryId,
        noggles_id: character.nogglesId,
        payment_tx_hash: typeof paymentTxHash === "string" ? paymentTxHash : null,
      })
      .select("id, created_at")
      .single()

    if (error) {
      console.error("[POST /api/characters] Supabase error:", error.message, error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error("[POST /api/characters]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const owner = searchParams.get("owner")
    const normalizedOwner = owner ? normalizeAddress(owner) : ""
    if (!normalizedOwner) {
      return NextResponse.json(
        { error: "owner query parameter is required" },
        { status: 400 }
      )
    }

    const supabase = getSupabase()
    const { data, error } = await supabase
      .from("characters")
      .select("id, owner_address, background_id, body_id, head_id, accessory_id, noggles_id, payment_tx_hash, created_at")
      .eq("owner_address", normalizedOwner)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[GET /api/characters] Supabase error:", error.message, error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error("[GET /api/characters]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    )
  }
}
