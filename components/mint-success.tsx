"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CharacterPreview } from "@/components/character-preview"
import type { CharacterState } from "@/lib/traits"
import { getGnosisExplorerTxUrl } from "@/lib/circles"
import { ExternalLink, Share2, Copy, Check } from "lucide-react"

interface MintSuccessProps {
  character: CharacterState
  txHash: string
  onCreateAnother: () => void
}

export function MintSuccess({ character, txHash, onCreateAnother }: MintSuccessProps) {
  const [copied, setCopied] = useState(false)
  const gnosisExplorerUrl = getGnosisExplorerTxUrl(txHash)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(gnosisExplorerUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "My Character Forge character",
        text: "Check out the character I just created in Character Forge using a Circles payment on Gnosis Chain.",
        url: gnosisExplorerUrl,
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Success animation */}
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <div className="relative flex size-16 items-center justify-center rounded-full bg-primary">
            <Check className="size-8 text-primary-foreground" />
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-foreground text-balance">Character Created</h2>
          <p className="mt-2 text-muted-foreground">
            Your character is now saved in Character Forge. The link below shows the Circles CRC payment used to create it on Gnosis Chain (not a separate NFT mint transaction).
          </p>
        </div>

        {/* Character card */}
        <div className="relative rounded-2xl border-2 border-primary/30 bg-card p-8">
          <CharacterPreview character={character} size={240} />
          {/* Sparkle overlay */}
          <div className="absolute inset-0 rounded-2xl bg-primary/5" />
        </div>

        {/* Transaction info */}
        <div className="flex flex-col gap-3 w-full max-w-md">
          <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Transaction Hash
              </span>
              <span className="text-xs font-mono text-card-foreground">
                {txHash.slice(0, 10)}...{txHash.slice(-8)}
              </span>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={handleCopy}>
              {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
            </Button>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 gap-2" asChild>
              <a href={gnosisExplorerUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" />
                View on Explorer
              </a>
            </Button>
            <Button variant="outline" className="flex-1 gap-2" onClick={handleShare}>
              <Share2 className="size-4" />
              Share
            </Button>
          </div>

          <Button onClick={onCreateAnother} className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
            Create Another Character
          </Button>
        </div>
      </div>
    </div>
  )
}
