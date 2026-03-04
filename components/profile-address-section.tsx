"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getProfileAddress,
  setProfileAddress as saveProfileAddress,
  clearProfileAddress,
} from "@/lib/profile-address"
import { User, Package, Trash2 } from "lucide-react"
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

  useEffect(() => {
    setSavedAddress(getProfileAddress())
  }, [])

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
      <div className="flex gap-2">
        <Input
          id="profile-address"
          placeholder={savedAddress ? `${savedAddress.slice(0, 10)}…${savedAddress.slice(-8)}` : "0x…"}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="font-mono text-sm"
          spellCheck={false}
        />
        {savedAddress ? (
          <>
            <Button variant="outline" size="sm" onClick={handleSave} disabled={!address.trim()}>
              Update
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground">
              <Trash2 className="size-4" />
            </Button>
          </>
        ) : (
          <Button size="sm" onClick={handleSave} disabled={!address.trim()}>
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
