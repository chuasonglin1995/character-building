"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { TraitGrid, SelectedTraitInfo } from "@/components/trait-grid"
import {
  TRAIT_CATEGORIES,
  type CharacterState,
} from "@/lib/traits"

interface TraitPanelProps {
  activeCategory: string
  character: CharacterState
  onTraitChange: (categoryId: string, traitId: string) => void
}

const TRAIT_KEY_MAP: Record<string, keyof CharacterState> = {
  background: "backgroundId",
  body: "bodyId",
  head: "headId",
  accessory: "accessoryId",
  noggles: "nogglesId",
}

export function TraitPanel({
  activeCategory,
  character,
  onTraitChange,
}: TraitPanelProps) {
  const category = TRAIT_CATEGORIES.find((c) => c.id === activeCategory)
  if (!category) return null

  const traitKey = TRAIT_KEY_MAP[activeCategory]
  const selectedTraitId = traitKey ? character[traitKey] : undefined
  const selectedOption = category.options.find((o) => o.id === selectedTraitId)

  return (
    <div className="flex flex-col gap-4">
      {/* Current selection info */}
      {selectedOption && <SelectedTraitInfo option={selectedOption} />}

      {/* Trait grid */}
      {category.options.length > 1 && (
        <ScrollArea className="h-[320px] pr-2">
          <TraitGrid
            options={category.options}
            selectedId={selectedTraitId || ""}
            onSelect={(id) => onTraitChange(activeCategory, id)}
          />
        </ScrollArea>
      )}
    </div>
  )
}
