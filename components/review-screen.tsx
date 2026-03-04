"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CharacterPreview } from "@/components/character-preview"
import {
  TRAIT_CATEGORIES,
  RARITY_COLORS,
  type CharacterState,
  type Rarity,
} from "@/lib/traits"
import { circlesConfig, generatePaymentLink, getMintPriceCRC } from "@/lib/circles"
import { usePaymentWatcher, type PaymentWatchStatus } from "@/hooks/use-payment-watcher"
import { ArrowLeft, Sparkles, Check, Loader2, ExternalLink, PlayCircle, PauseCircle } from "lucide-react"

interface ReviewScreenProps {
  character: CharacterState
  onBack: () => void
  onMint: (paymentTxHash: string, ownerAddress: string) => void
  isMinting: boolean
}

function getSelectedTraitName(categoryId: string, character: CharacterState): { name: string; rarity: Rarity } | null {
  const category = TRAIT_CATEGORIES.find((c) => c.id === categoryId)
  if (!category) return null

  const keyMap: Record<string, keyof CharacterState> = {
    background: "backgroundId",
    body: "bodyId",
    head: "headId",
    accessory: "accessoryId",
    noggles: "nogglesId",
  }

  const traitKey = keyMap[categoryId]
  if (!traitKey) return null

  const selectedId = character[traitKey]
  const option = category.options.find((o) => o.id === selectedId)
  return option ? { name: option.name, rarity: option.rarity } : null
}

function getColorSwatch(categoryId: string, character: CharacterState): string | null {
  // Nouns-style traits are pre-colored SVGs; no separate color state.
  return null
}

function makePaymentDataValue(uniqueSuffix?: string) {
  const suffix = uniqueSuffix ?? `${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 10)}`
  return `character-mint:${suffix}`
}

function getStatusLabel(status: PaymentWatchStatus) {
  switch (status) {
    case "idle":
      return "Idle"
    case "waiting":
      return "Waiting"
    case "confirmed":
      return "Confirmed"
    case "error":
      return "Error"
    default:
      return status
  }
}

export function ReviewScreen({ character, onBack, onMint, isMinting }: ReviewScreenProps) {
  // Compute rarity score
  const rarityOrder: Record<Rarity, number> = {
    Common: 1,
    Uncommon: 2,
    Rare: 3,
    Legendary: 4,
  }

  const traitCategories = ["background", "body", "head", "accessory", "noggles"]
  const traits = traitCategories
    .map((id) => ({ id, ...(getSelectedTraitName(id, character) || { name: "None", rarity: "Common" as Rarity }) }))
    .filter((t) => t.name !== "None")

  const avgRarity = traits.length > 0
    ? traits.reduce((sum, t) => sum + rarityOrder[t.rarity], 0) / traits.length
    : 1

  const overallRarity: Rarity =
    avgRarity >= 3.5 ? "Legendary" : avgRarity >= 2.5 ? "Rare" : avgRarity >= 1.5 ? "Uncommon" : "Common"

  const [watching, setWatching] = useState(false)
  const [uniqueSuffix] = useState(() => `${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 10)}`)
  const dataValue = useMemo(
    () => makePaymentDataValue(uniqueSuffix),
    [uniqueSuffix],
  )
  const recipient = circlesConfig.defaultRecipientAddress
  const amountCRC = getMintPriceCRC()
  const paymentLink = useMemo(
    () => generatePaymentLink(recipient, amountCRC, dataValue),
    [recipient, amountCRC, dataValue],
  )

  const { status: paymentStatus, payment, error: paymentError } = usePaymentWatcher({
    enabled: watching && Boolean(paymentLink),
    dataValue,
    minAmountCRC: amountCRC,
    recipientAddress: recipient,
  })

  const canMint = paymentStatus === "confirmed" && Boolean(payment?.transactionHash)
  const dataPreview =
    dataValue.length > 24 ? `${dataValue.slice(0, 20)}…${dataValue.slice(-4)}` : dataValue

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <div className="flex w-full max-w-4xl flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-12">
        {/* Character */}
        <div className="relative flex flex-col items-center gap-4">
          <div className="relative rounded-2xl border-2 border-primary/30 bg-card p-6">
            <CharacterPreview character={character} size={280} />
            {/* Glow effect */}
            <div
              className="absolute inset-0 rounded-2xl opacity-20 blur-xl -z-10"
              style={{ backgroundColor: RARITY_COLORS[overallRarity] }}
            />
          </div>
          <Badge
            className="text-sm px-4 py-1"
            style={{
              backgroundColor: RARITY_COLORS[overallRarity],
              color: overallRarity === "Legendary" || overallRarity === "Uncommon" ? "#000" : "#fff",
            }}
          >
            {overallRarity} Character
          </Badge>
        </div>

        {/* Trait summary */}
        <div className="flex flex-1 flex-col gap-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground text-balance">Review Your Character</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Confirm your trait selections and Circles payment before creating your character.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {TRAIT_CATEGORIES.map((cat) => {
              const trait = getSelectedTraitName(cat.id, character)
              const color = getColorSwatch(cat.id, character)

              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-20">
                      {cat.label}
                    </span>
                    {color && (
                      <span
                        className="size-4 rounded-full border border-border"
                        style={{ backgroundColor: color }}
                      />
                    )}
                    <span className="text-sm font-medium text-card-foreground">
                      {trait?.name || "Default"}
                    </span>
                  </div>
                  {trait && (
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: RARITY_COLORS[trait.rarity] }}
                    >
                      {trait.rarity}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Uniqueness check (simulated) */}
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-3">
            <Check className="size-4 text-primary" />
            <span className="text-sm text-foreground">
              This combination is unique. Ready to mint.
            </span>
          </div>

          <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">
                  Circles payment required
                </span>
                <span className="text-sm text-foreground">
                  Send {amountCRC} CRC to this app via Gnosis App to unlock creation.
                </span>
                <span className="text-xs text-muted-foreground">
                  Data (used to match your payment):{" "}
                  <span className="font-mono break-all">{dataPreview}</span>
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                {getStatusLabel(paymentStatus)}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                className="gap-1"
                asChild
                disabled={!paymentLink}
              >
                <a href={paymentLink} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-3.5" />
                  Open in Gnosis App
                </a>
              </Button>
              <Button
                type="button"
                size="sm"
                variant={watching ? "outline" : "secondary"}
                className="gap-1"
                disabled={!paymentLink}
                onClick={() => setWatching((prev) => !prev)}
              >
                {watching ? (
                  <>
                    <PauseCircle className="size-3.5" />
                    Stop monitoring
                  </>
                ) : (
                  <>
                    <PlayCircle className="size-3.5" />
                    Start monitoring
                  </>
                )}
              </Button>
            </div>
            {paymentStatus === "waiting" && (
              <p className="text-xs text-muted-foreground">
                Waiting for a {amountCRC} CRC payment with this data to arrive at the recipient address.
              </p>
            )}
            {paymentStatus === "confirmed" && payment?.transactionHash && (
              <p className="text-xs text-emerald-600">
                Circles payment detected on-chain. You can now create your character.
              </p>
            )}
            {paymentStatus === "error" && paymentError && (
              <p className="text-xs text-destructive">
                Payment check failed: {paymentError}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} className="gap-2">
              <ArrowLeft className="size-4" />
              Edit
            </Button>
            <Button
              onClick={() => {
                if (payment?.transactionHash && payment?.from && canMint) {
                  onMint(payment.transactionHash, payment.from)
                }
              }}
              disabled={isMinting || !canMint}
              className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              size="lg"
            >
              {isMinting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Create after 1 CRC payment
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            This app creates your character after a 1 CRC Circles payment. No separate NFT mint transaction is sent.
          </p>
        </div>
      </div>
    </div>
  )
}
