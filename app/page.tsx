"use client"

import { useState, useCallback } from "react"
import { CharacterPreview } from "@/components/character-preview"
import { TraitPanel } from "@/components/trait-panel"
import { ReviewScreen } from "@/components/review-screen"
import { MintSuccess } from "@/components/mint-success"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  TRAIT_CATEGORIES,
  DEFAULT_CHARACTER,
  type CharacterState,
} from "@/lib/traits"
import {
  Shuffle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Scissors,
  Smile,
  Palette,
  Shirt,
  Star,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ProfileAddressSection } from "@/components/profile-address-section"
import { InventoryView } from "@/components/inventory-view"

type AppStep = "customize" | "review" | "success" | "inventory"

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  background: <Palette className="size-4" />,
  body: <Shirt className="size-4" />,
  head: <Smile className="size-4" />,
  accessory: <Star className="size-4" />,
  noggles: <Scissors className="size-4" />,
}

function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomCharacter(): CharacterState {
  return {
    backgroundId: randomFromArray(TRAIT_CATEGORIES.find((c) => c.id === "background")!.options).id,
    bodyId: randomFromArray(TRAIT_CATEGORIES.find((c) => c.id === "body")!.options).id,
    headId: randomFromArray(TRAIT_CATEGORIES.find((c) => c.id === "head")!.options).id,
    accessoryId: randomFromArray(TRAIT_CATEGORIES.find((c) => c.id === "accessory")!.options).id,
    nogglesId: randomFromArray(TRAIT_CATEGORIES.find((c) => c.id === "noggles")!.options).id,
  }
}

export default function CharacterForge() {
  const [step, setStep] = useState<AppStep>("customize")
  const [character, setCharacter] = useState<CharacterState>(DEFAULT_CHARACTER)
  const [activeCategory, setActiveCategory] = useState("background")
  const [isMinting, setIsMinting] = useState(false)
  const [txHash, setTxHash] = useState("")
  const [ownerAddress, setOwnerAddress] = useState("")
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleTraitChange = useCallback((categoryId: string, traitId: string) => {
    setCharacter((prev) => {
      const keyMap: Record<string, keyof CharacterState> = {
        background: "backgroundId",
        body: "bodyId",
        head: "headId",
        accessory: "accessoryId",
        noggles: "nogglesId",
      }
      const key = keyMap[categoryId]
      if (!key) return prev
      return { ...prev, [key]: traitId }
    })
  }, [])

  const handleRandomize = useCallback(() => {
    setCharacter(getRandomCharacter())
  }, [])

  const handleReset = useCallback(() => {
    setCharacter(DEFAULT_CHARACTER)
  }, [])

  const handleMint = useCallback(async (paymentTxHash: string, ownerAddr: string) => {
    setIsMinting(true)
    setSaveError(null)
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setTxHash(paymentTxHash)
    setOwnerAddress(ownerAddr)

    try {
      const res = await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerAddress: ownerAddr,
          character: character,
          paymentTxHash: paymentTxHash,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setSaveError(data.error ?? "Failed to save character to inventory")
      }
    } catch {
      setSaveError("Failed to save character to inventory")
    }

    setIsMinting(false)
    setStep("success")
  }, [character])

  const handleCreateAnother = useCallback(() => {
    setCharacter(DEFAULT_CHARACTER)
    setStep("customize")
    setTxHash("")
    setOwnerAddress("")
    setSaveError(null)
  }, [])

  if (step === "inventory") {
    return (
      <InventoryView onBack={() => setStep("customize")} />
    )
  }

  if (step === "review") {
    return (
      <ReviewScreen
        character={character}
        onBack={() => setStep("customize")}
        onMint={handleMint}
        isMinting={isMinting}
      />
    )
  }

  if (step === "success") {
    return (
      <MintSuccess
        character={character}
        txHash={txHash}
        ownerAddress={ownerAddress}
        saveError={saveError}
        onCreateAnother={handleCreateAnother}
      />
    )
  }

  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      {/* Left side: Character preview */}
      <div className="relative flex flex-1 flex-col items-center justify-center gap-6 p-6 lg:p-12">
        {/* Header */}
        <div className="flex w-full items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Character Forge</h1>
            <p className="text-sm text-muted-foreground">Customize. Create. Mint.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary/40 text-primary gap-1.5">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              Gnosis Chain
            </Badge>
          </div>
        </div>

        {/* Character display */}
        <div className="relative flex flex-1 items-center justify-center">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative">
            {/* Shadow under character */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-4 w-40 rounded-full bg-foreground/10 blur-md" />
            <CharacterPreview character={character} size={340} className="relative z-10" />
          </div>
        </div>

        {/* Action bar */}
        <div className="flex w-full items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRandomize} className="gap-2">
            <Shuffle className="size-3.5" />
            Randomize
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
          <div className="flex-1" />
          <Button
            onClick={() => setStep("review")}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
          >
            <Sparkles className="size-4" />
            Create
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Right side: Trait panel */}
      <aside className="flex w-full flex-col border-l border-border bg-card lg:w-[380px] xl:w-[420px]">
        {/* Profile address + inventory */}
        <div className="border-b border-border p-4">
          <ProfileAddressSection onViewInventory={() => setStep("inventory")} />
        </div>
        {/* Category tabs (vertical on desktop) */}
        <div className="flex lg:flex-col lg:h-full">
          {/* Category list */}
          <ScrollArea className="w-full lg:w-auto">
            <nav className="flex gap-1 p-3 lg:flex-col lg:border-b-0 lg:border-r-0 overflow-x-auto" aria-label="Trait categories">
              {TRAIT_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all whitespace-nowrap",
                      "hover:bg-secondary/80 hover:text-secondary-foreground",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/30"
                        : "text-muted-foreground border border-transparent"
                    )}
                  >
                    {CATEGORY_ICONS[cat.id]}
                    <span>{cat.label}</span>
                    {isActive && (
                      <ChevronRight className="ml-auto size-3.5 text-primary lg:block hidden" />
                    )}
                  </button>
                )
              })}
            </nav>
          </ScrollArea>

          {/* Trait options */}
          <div className="flex-1 p-4 lg:p-5">
            <TraitPanel
              activeCategory={activeCategory}
              character={character}
              onTraitChange={handleTraitChange}
            />
          </div>
        </div>
      </aside>
    </main>
  )
}
