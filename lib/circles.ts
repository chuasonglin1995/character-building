const DEFAULT_CIRCLES_RPC_URL = "https://staging.circlesubi.network/"
const DEFAULT_CIRCLES_V2_RPC_URL = "https://rpc.aboutcircles.com/"
const DEFAULT_RECIPIENT_ADDRESS = "0x7B8a5a4673fcd082b742304032eA49D6bC6e01f5"
const DEFAULT_MINT_PRICE_CRC = 1
const DEFAULT_GNOSIS_EXPLORER_BASE_URL = "https://gnosisscan.io"

export type CirclesTransferEvent = {
  transactionHash: string
  from: string
  to: string
  data: string
  blockNumber: string
  timestamp: string
  transactionIndex: string
  logIndex: string
}

export const circlesConfig = {
  rpcUrl: process.env.NEXT_PUBLIC_CIRCLES_RPC_URL || DEFAULT_CIRCLES_RPC_URL,
  v2RpcUrl: process.env.NEXT_PUBLIC_CIRCLES_V2_RPC_URL || DEFAULT_CIRCLES_V2_RPC_URL,
  defaultRecipientAddress:
    process.env.NEXT_PUBLIC_DEFAULT_RECIPIENT_ADDRESS ||
    process.env.NEXT_PUBLIC_GATEWAY_ADDRESS ||
    DEFAULT_RECIPIENT_ADDRESS,
}

export function generatePaymentLink(recipientAddress: string, amountCRC: number, data: string): string {
  const encodedData = encodeURIComponent(data)
  return `https://app.gnosis.io/transfer/${recipientAddress}/crc?data=${encodedData}&amount=${amountCRC}`
}

export function getMintPriceCRC(): number {
  const raw = process.env.NEXT_PUBLIC_MINT_PRICE_CRC
  const parsed = raw ? Number(raw) : NaN
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_MINT_PRICE_CRC
  return parsed
}

export function getGnosisExplorerTxUrl(txHash: string): string {
  const base = process.env.NEXT_PUBLIC_GNOSIS_EXPLORER_BASE_URL || DEFAULT_GNOSIS_EXPLORER_BASE_URL
  const trimmedBase = base.replace(/\/+$/, "")
  return `${trimmedBase}/tx/${txHash}`
}

type BigIntString = string

export type CirclesV2TransferPathStep = {
  From: string
  To: string
  TokenOwner: string
  Value: BigIntString
}

export type CirclesV2FindPathResponse = {
  MaxFlow: BigIntString
  Transfers: CirclesV2TransferPathStep[]
}

type CirclesV2FindPathRpcResult = {
  jsonrpc: "2.0"
  id: number
  result?: CirclesV2FindPathResponse
  error?: {
    code: number
    message: string
    data?: unknown
  }
}

type CirclesQueryResultRow = unknown[]

type CirclesQueryResult = {
  columns: string[]
  rows: CirclesQueryResultRow[]
}

export async function circlesV2FindPath(
  source: string,
  sink: string,
  targetFlow: BigIntString,
): Promise<CirclesV2FindPathResponse> {
  const body = {
    jsonrpc: "2.0" as const,
    id: 1,
    method: "circlesV2_findPath",
    params: [
      {
        Source: source,
        Sink: sink,
        TargetFlow: targetFlow,
      },
    ],
  }

  const response = await fetch(circlesConfig.v2RpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`circlesV2_findPath failed: ${response.status} ${text}`)
  }

  const payload = (await response.json()) as CirclesV2FindPathRpcResult

  if (payload.error) {
    throw new Error(payload.error.message || "circlesV2_findPath returned an error")
  }

  if (!payload.result) {
    throw new Error("circlesV2_findPath returned no result")
  }

  return payload.result
}

interface QueryOptions {
  cursor?: string | null
  recipientAddress?: string | null
}

type TransferDataEventPayload = {
  event: string
  values: Record<string, unknown>
}

type TransferDataQueryResult = {
  events?: TransferDataEventPayload[]
  hasMore?: boolean
  nextCursor?: string | null
}

function mapTransferEvents(events: TransferDataEventPayload[] = []): CirclesTransferEvent[] {
  return events.map((item) => {
    const values = item.values ?? {}
    return {
      transactionHash: String(values.transactionHash ?? ""),
      from: String(values.from ?? ""),
      to: String(values.to ?? ""),
      data: String(values.data ?? ""),
      blockNumber: String(values.blockNumber ?? ""),
      timestamp: String(values.timestamp ?? ""),
      transactionIndex: String(values.transactionIndex ?? ""),
      logIndex: String(values.logIndex ?? ""),
    }
  })
}

export async function hasDirectTrust(truster: string, trustee: string): Promise<boolean> {
  const normalizedTruster = normalizeAddress(truster)
  const normalizedTrustee = normalizeAddress(trustee)

  if (!normalizedTruster || !normalizedTrustee) {
    return false
  }

  const body = {
    jsonrpc: "2.0" as const,
    id: 1,
    method: "circles_query",
    params: [
      {
        Namespace: "V_CrcV2",
        Table: "TrustRelations",
        Columns: ["truster", "trustee", "expiryTime"],
        Filter: [
          {
            Type: "Conjunction",
            ConjunctionType: "And",
            Predicates: [
              {
                Type: "FilterPredicate",
                FilterType: "Equals",
                Column: "truster",
                Value: normalizedTruster,
              },
              {
                Type: "FilterPredicate",
                FilterType: "Equals",
                Column: "trustee",
                Value: normalizedTrustee,
              },
            ],
          },
        ],
        Limit: 1,
      },
    ],
  }

  const response = await fetch(circlesConfig.v2RpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`circles_query TrustRelations failed: ${response.status} ${text}`)
  }

  const payload = (await response.json()) as {
    result?: CirclesQueryResult
    error?: { message?: string }
  }

  if (payload.error) {
    throw new Error(payload.error.message || "circles_query TrustRelations returned an error")
  }

  const result = payload.result
  if (!result || !Array.isArray(result.rows)) {
    return false
  }

  return result.rows.length > 0
}

async function circlesEventsQuery(
  options: QueryOptions = {},
): Promise<{ events: CirclesTransferEvent[]; hasMore: boolean; nextCursor: string | null }> {
  const recipientAddress = normalizeAddress(options.recipientAddress ?? "")
  const body = {
    jsonrpc: "2.0",
    id: 1,
    method: "circles_events",
    params: [recipientAddress ?? options.cursor ?? null, null, null, ["CrcV2_TransferData"]],
  }

  const response = await fetch(circlesConfig.rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`circles_events failed: ${response.status} ${text}`)
  }

  const payload = await response.json()

  if (payload.error) {
    throw new Error(payload.error.message || "circles_events returned an error")
  }

  const result = (payload.result || {}) as TransferDataQueryResult
  return {
    events: mapTransferEvents(result.events),
    hasMore: Boolean(result.hasMore),
    nextCursor: result.nextCursor ?? null,
  }
}

export async function fetchTransferDataEvents(
  limit: number = 100,
  recipientAddress?: string | null,
): Promise<CirclesTransferEvent[]> {
  const normalizedRecipient = normalizeAddress(recipientAddress ?? "")

  if (!normalizedRecipient) {
    const events: CirclesTransferEvent[] = []
    let cursor: string | null = null
    let hasMore = true

    while (hasMore && events.length < limit) {
      const response = await circlesEventsQuery({ cursor })
      events.push(...response.events)
      hasMore = response.hasMore
      cursor = response.nextCursor

      if (!cursor) {
        break
      }
    }

    return events.slice(0, limit)
  }

  const response = await circlesEventsQuery({ recipientAddress: normalizedRecipient })
  return response.events.slice(0, limit)
}

function normalizeString(value: string): string {
  return value.trim().toLowerCase()
}

function normalizeHex(value: string): string | null {
  const trimmed = normalizeString(value)
  if (!trimmed) return null
  if (trimmed.startsWith("\\x")) {
    return `0x${trimmed.slice(2)}`
  }
  if (trimmed.startsWith("0x")) {
    return trimmed
  }
  if (/^[0-9a-f]+$/.test(trimmed)) {
    return `0x${trimmed}`
  }
  return null
}

function normalizeAddress(value: string): string | null {
  const trimmed = normalizeString(value)
  if (!trimmed) return null
  return trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`
}

function addressesMatch(a: string, b: string): boolean {
  const left = normalizeAddress(a)
  const right = normalizeAddress(b)
  return Boolean(left && right && left === right)
}

function utf8ToHex(value: string): string {
  const encoder = new TextEncoder()
  return Array.from(encoder.encode(value))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

function hexToUtf8(hexValue: string): string | null {
  try {
    const hex = hexValue.startsWith("0x") ? hexValue.slice(2) : hexValue
    if (!hex || hex.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(hex)) {
      return null
    }
    const bytes = new Uint8Array(
      hex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
    )
    return new TextDecoder().decode(bytes)
  } catch {
    return null
  }
}

function eventMatchesData(dataField: string, dataValue: string): boolean {
  const target = normalizeString(dataValue)
  if (!target) return false

  const targetHex = utf8ToHex(target)
  const targetCandidates = new Set<string>([target, targetHex, `0x${targetHex}`])

  if (target.startsWith("0x")) {
    targetCandidates.add(target.slice(2))
  }

  const eventRaw = normalizeString(dataField)
  if (targetCandidates.has(eventRaw)) {
    return true
  }

  const eventHex = normalizeHex(eventRaw)
  if (eventHex) {
    if (targetCandidates.has(eventHex) || targetCandidates.has(eventHex.slice(2))) {
      return true
    }
    const eventUtf8 = hexToUtf8(eventHex)
    if (eventUtf8 && targetCandidates.has(normalizeString(eventUtf8))) {
      return true
    }
  }

  return false
}

export async function checkPaymentReceived(
  dataValue: string,
  minAmountCRC: number,
  recipientAddress?: string | null,
): Promise<CirclesTransferEvent | null> {
  if (!dataValue || minAmountCRC <= 0) return null

  const normalizedRecipient = normalizeAddress(recipientAddress ?? "")
  const events = await fetchTransferDataEvents(200, normalizedRecipient)

  for (const event of events) {
    if (!event.data) continue
    if (normalizedRecipient && !addressesMatch(event.to, normalizedRecipient)) {
      continue
    }
    if (eventMatchesData(event.data, dataValue)) {
      return event
    }
  }

  return null
}

