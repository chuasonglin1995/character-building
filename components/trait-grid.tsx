"use client"

import { cn } from "@/lib/utils"
import type { TraitOption, Rarity } from "@/lib/traits"
import { RARITY_COLORS } from "@/lib/traits"

interface TraitGridProps {
  options: TraitOption[]
  selectedId: string
  onSelect: (id: string) => void
}

function RarityDot({ rarity }: { rarity: Rarity }) {
  return (
    <span
      className="size-1.5 rounded-full shrink-0"
      style={{ backgroundColor: RARITY_COLORS[rarity] }}
      aria-label={rarity}
    />
  )
}

export function TraitGrid({ options, selectedId, onSelect }: TraitGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onSelect(option.id)}
          className={cn(
            "relative flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-all",
            "hover:border-primary/50 hover:bg-secondary/50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            selectedId === option.id
              ? "border-primary bg-primary/10"
              : "border-border bg-card"
          )}
        >
          {/* Trait thumbnail */}
          <div className="flex size-10 items-center justify-center rounded-md bg-muted overflow-hidden">
            <img
              src={option.preview}
              alt={option.name}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex items-center gap-1">
            <RarityDot rarity={option.rarity} />
            <span className="text-[10px] font-medium text-card-foreground leading-tight text-center truncate max-w-full">
              {option.name}
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}

export function SelectedTraitInfo({ option }: { option: TraitOption | undefined }) {
  if (!option) return null

  return (
    <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
      <RarityDot rarity={option.rarity} />
      <span className="text-sm font-medium text-card-foreground">{option.name}</span>
      <span
        className="ml-auto text-[10px] font-semibold uppercase tracking-wider"
        style={{ color: RARITY_COLORS[option.rarity] }}
      >
        {option.rarity}
      </span>
    </div>
  )
}
