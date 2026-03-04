"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { getProfileAddress } from "@/lib/profile-address"
import { ArrowLeft, Package } from "lucide-react"

interface InventoryViewProps {
  onBack: () => void
}

export function InventoryView({ onBack }: InventoryViewProps) {
  const [address, setAddress] = useState<string | null>(null)

  useEffect(() => {
    setAddress(getProfileAddress())
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <div className="flex w-full max-w-md flex-col gap-6 text-center">
        <div className="flex items-center justify-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-2xl border-2 border-primary/30 bg-primary/10">
            <Package className="size-7 text-primary" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">My inventory</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Characters linked to your Circles address will appear here.
          </p>
        </div>

        {address ? (
          <div className="rounded-lg border border-border bg-card px-4 py-3 text-left">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Your profile address
            </span>
            <p className="mt-1 font-mono text-sm text-foreground break-all">
              {address}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No profile address set. Add your Circles address on the main page to view inventory.
          </p>
        )}

        <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
          <p>
            When the app is connected to a backend, characters you create (paid with CRC from this address) will be saved and listed here. For now, each new character is tied to the payer address on-chain via the payment transaction.
          </p>
        </div>

        <Button variant="outline" className="gap-2" onClick={onBack}>
          <ArrowLeft className="size-4" />
          Back to Character Forge
        </Button>
      </div>
    </div>
  )
}
