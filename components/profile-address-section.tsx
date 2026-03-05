"use client"

import { useMemo, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getProfileAddress,
  setProfileAddress as saveProfileAddress,
  clearProfileAddress,
} from "@/lib/profile-address"
import { circlesConfig, getMintPriceCRC } from "@/lib/circles"
import { useCirclesTrust } from "@/hooks/use-circles-trust"
import { User, Package, Trash2, AlertTriangle, CheckCircle2, Loader2, Info, Copy, Check, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProfileAddressSectionProps {
  onViewInventory?: () => void
  className?: string
  compact?: boolean
}

export function ProfileAddressSection({
  onViewInventory,
  className,
  compact = false,
}: ProfileAddressSectionProps) {
  const [address, setAddress] = useState("")
  const [savedAddress, setSavedAddress] = useState<string | null>(null)
  const [justSaved, setJustSaved] = useState(false)
  const [copiedDev, setCopiedDev] = useState(false)

  const amountCrc = useMemo(() => getMintPriceCRC(), [])

  const currentAddress = (address || savedAddress || "").trim()
  const shouldCheckTrust = currentAddress.length >= 40

  const { status: trustStatus, hasExplicitTrust, sink, error: trustError } = useCirclesTrust({
    userAddress: shouldCheckTrust ? currentAddress : null,
    amountCrc,
  })

  const devRecipientAddress = sink || circlesConfig.defaultRecipientAddress
  const devLabel = "godmodeon"

  useEffect(() => {
    setSavedAddress(getProfileAddress())
  }, [])

  const handleCopyDevAddress = async () => {
    try {
      await navigator.clipboard.writeText(devRecipientAddress)
      setCopiedDev(true)
      setTimeout(() => setCopiedDev(false), 2000)
    } catch {
      // ignore clipboard failures (permissions, non-secure context, etc.)
    }
  }

  const handleSave = () => {
    const trimmed = address.trim()
    if (!trimmed) return
    const normalized = trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`
    if (normalized.length < 42) return
    saveProfileAddress(normalized)
    setSavedAddress(normalized)
    setAddress("")
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)
  }

  const handleClear = () => {
    clearProfileAddress()
    setSavedAddress(null)
    setAddress("")
  }

  if (compact && savedAddress) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="text-xs text-muted-foreground">
          Profile: <span className="font-mono">{savedAddress.slice(0, 8)}…{savedAddress.slice(-6)}</span>
        </span>
        {onViewInventory && (
          <Button variant="outline" size="sm" onClick={onViewInventory} className="gap-1">
            <Package className="size-3.5" />
            My inventory
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground hover:text-destructive">
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="profile-address" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
        <User className="size-3.5" />
        Your Circles address
      </Label>
      <p className="text-[11px] text-muted-foreground">
        Paste your Gnosis/Circles address to view or claim your inventory on this device.
      </p>
      <div className="flex flex-col gap-2">
        <Input
          id="profile-address"
          placeholder={savedAddress ? `${savedAddress.slice(0, 10)}…${savedAddress.slice(-8)}` : "0x…"}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="font-mono text-sm"
          spellCheck={false}
        />
        <div className="min-h-6 text-[11px]">
          {!shouldCheckTrust && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Info className="size-3" />
              <span>
                Enter your Circles address to check if you have explicitly trusted this app’s address.
              </span>
            </div>
          )}
          {shouldCheckTrust && trustStatus === "loading" && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Loader2 className="size-3 animate-spin" />
              <span>Checking your Circles trust to this app…</span>
            </div>
          )}
          {shouldCheckTrust && trustStatus === "ready" && hasExplicitTrust && (
            <div className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 className="size-3" />
              <span>
                You have explicitly trusted this app’s address in Circles.
              </span>
            </div>
          )}
          {shouldCheckTrust && trustStatus === "ready" && hasExplicitTrust === false && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-amber-600">
                <AlertTriangle className="size-3" />
                <span>
                  You have not yet explicitly trusted this app’s address in Circles.
                </span>
              </div>
              <div className="rounded-md border border-border bg-card px-2.5 py-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      App address ({devLabel})
                    </div>
                    <div className="font-mono text-[11px] text-foreground break-all">
                      {devRecipientAddress}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleCopyDevAddress}
                    aria-label="Copy app address"
                  >
                    {copiedDev ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
                  </Button>
                </div>
                <div className="mt-2 flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={handleCopyDevAddress}
                  >
                    {copiedDev ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    {copiedDev ? "Copied" : "Copy address"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="gap-1.5"
                    asChild
                  >
                    <a href="https://app.gnosis.io/" target="_blank" rel="noreferrer">
                      <ExternalLink className="size-3.5" />
                      Open Gnosis Wallet
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}
          {shouldCheckTrust && trustStatus === "error" && (
            <div className="flex items-center gap-1.5 text-destructive">
              <AlertTriangle className="size-3" />
              <span>{trustError || "Couldn’t check Circles trust right now. Try again later."}</span>
            </div>
          )}
        </div>
        {savedAddress ? (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSave} disabled={!address.trim()}>
              Update
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground">
              <Trash2 className="size-4" />
            </Button>
          </div>
        ) : (
          <Button size="sm" onClick={handleSave} disabled={!address.trim()} className="w-fit">
            {justSaved ? "Saved" : "Save"}
          </Button>
        )}
      </div>
      {savedAddress && onViewInventory && (
        <Button variant="secondary" size="sm" className="w-full gap-2" onClick={onViewInventory}>
          <Package className="size-4" />
          View my inventory
        </Button>
      )}
    </div>
  )
}
