import { useEffect, useState } from "react"

type TrustStatus = "idle" | "loading" | "ready" | "error"

interface CirclesTrustOptions {
  userAddress: string | null
  amountCrc: number
  debounceMs?: number
}

export interface CirclesTrustResult {
  status: TrustStatus
  hasExplicitTrust?: boolean
  sink?: string
  canSend?: boolean
  maxFlowAtto?: string
  targetFlowAtto?: string
  error?: string | null
}

type CanSendResponse = {
  canSend?: boolean
  hasExplicitTrust?: boolean
  maxFlowAtto?: string
  targetFlowAtto?: string
  transfers?: unknown[]
  source: string
  sink: string
}

function normalizeAddress(address: string): string {
  const trimmed = address.trim().toLowerCase()
  if (!trimmed) return ""
  return trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`
}

export function useCirclesTrust({ userAddress, amountCrc, debounceMs = 500 }: CirclesTrustOptions): CirclesTrustResult {
  const [state, setState] = useState<CirclesTrustResult>({ status: "idle", error: null })

  useEffect(() => {
    const normalizedAddress = userAddress ? normalizeAddress(userAddress) : ""

    if (!normalizedAddress || !Number.isFinite(amountCrc) || amountCrc <= 0) {
      setState({ status: "idle", error: null })
      return
    }

    let cancelled = false
    let timeoutId: NodeJS.Timeout | null = null
    const controller = new AbortController()

    const run = async () => {
      if (cancelled) return
      setState((prev) => ({ ...prev, status: "loading", error: null }))

      try {
        const res = await fetch("/api/circles/can-send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userAddress: normalizedAddress,
            amountCrc,
          }),
          signal: controller.signal,
        })

        if (cancelled) return

        if (!res.ok) {
          let message = `Request failed with status ${res.status}`
          try {
            const data = (await res.json()) as { error?: string }
            if (data?.error) {
              message = data.error
            }
          } catch {
            // ignore JSON parse errors, fall back to generic message
          }
          setState({ status: "error", error: message })
          return
        }

        const data = (await res.json()) as CanSendResponse
        setState({
          status: "ready",
          hasExplicitTrust: Boolean(data.hasExplicitTrust),
          sink: data.sink,
          canSend: Boolean(data.canSend),
          maxFlowAtto: data.maxFlowAtto,
          targetFlowAtto: data.targetFlowAtto,
          error: null,
        })
      } catch (err) {
        if (cancelled) return
        if (err instanceof DOMException && err.name === "AbortError") {
          return
        }
        const message = err instanceof Error ? err.message : "Failed to check Circles trust"
        setState({ status: "error", error: message })
      }
    }

    timeoutId = setTimeout(run, debounceMs)

    return () => {
      cancelled = true
      controller.abort()
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [userAddress, amountCrc, debounceMs])

  return state
}

