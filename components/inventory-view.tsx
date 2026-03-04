"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { CharacterPreview } from "@/components/character-preview"
import { getProfileAddress } from "@/lib/profile-address"
import type { CharacterState } from "@/lib/traits"
import { ArrowLeft, Package, Loader2, RefreshCw } from "lucide-react"

interface InventoryViewProps {
  onBack: () => void
}

type CharacterRow = {
  id: string
  owner_address: string
  background_id: string
  body_id: string
  head_id: string
  accessory_id: string
  noggles_id: string
  payment_tx_hash: string | null
  created_at: string
}

function rowToCharacter(row: CharacterRow): CharacterState {
  return {
    backgroundId: row.background_id,
    bodyId: row.body_id,
    headId: row.head_id,
    accessoryId: row.accessory_id,
    nogglesId: row.noggles_id,
  }
}

export function InventoryView({ onBack }: InventoryViewProps) {
  const [address, setAddress] = useState<string | null>(null)
  const [characters, setCharacters] = useState<CharacterRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInventory = async (owner: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/characters?owner=${encodeURIComponent(owner)}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? "Failed to load inventory")
      }
      const data = await res.json()
      setCharacters(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inventory")
      setCharacters([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const addr = getProfileAddress()
    setAddress(addr)
    if (addr) {
      fetchInventory(addr)
    } else {
      setCharacters([])
      setLoading(false)
      setError(null)
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onBack} aria-label="Back">
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
              <Package className="size-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">My inventory</h2>
              <p className="text-xs text-muted-foreground">
                Characters linked to your Circles address
              </p>
            </div>
          </div>
        </div>
        {address && (
          <div className="rounded-lg border border-border bg-card px-3 py-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Profile address
            </span>
            <p className="font-mono text-xs text-foreground break-all">
              {address.slice(0, 10)}…{address.slice(-8)}
            </p>
          </div>
        )}
      </div>

      {!address ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            No profile address set. Add your Circles address on the main page to view inventory.
          </p>
          <Button variant="outline" className="gap-2" onClick={onBack}>
            <ArrowLeft className="size-4" />
            Back to Character Forge
          </Button>
        </div>
      ) : loading ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading inventory…</p>
        </div>
      ) : error ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" className="gap-2" onClick={() => address && fetchInventory(address)}>
            <RefreshCw className="size-4" />
            Try again
          </Button>
        </div>
      ) : characters.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">No characters yet.</p>
          <p className="text-xs text-muted-foreground">
            Create a character (and pay 1 CRC) to see it here.
          </p>
          <Button variant="outline" className="gap-2" onClick={onBack}>
            <ArrowLeft className="size-4" />
            Back to Character Forge
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {characters.map((row) => (
            <div
              key={row.id}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3"
            >
              <CharacterPreview character={rowToCharacter(row)} size={140} />
              <span className="text-[10px] text-muted-foreground">
                {new Date(row.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
