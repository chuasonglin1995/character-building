"use client"

import type { CharacterState, TraitOption } from "@/lib/traits"
import { getTraitOption } from "@/lib/traits"
import { cn } from "@/lib/utils"

interface CharacterPreviewProps {
  character: CharacterState
  className?: string
  /**
   * Render size in pixels (width and height).
   */
  size?: number
}

function getLayerTrait(categoryId: string, traitId: string): TraitOption | undefined {
  if (!traitId) return undefined
  return getTraitOption(categoryId, traitId)
}

export function CharacterPreview({ character, className, size = 320 }: CharacterPreviewProps) {
  const background = getLayerTrait("background", character.backgroundId)
  const body = getLayerTrait("body", character.bodyId)
  const head = getLayerTrait("head", character.headId)
  const accessory = getLayerTrait("accessory", character.accessoryId)
  const noggles = getLayerTrait("noggles", character.nogglesId)

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card",
        "shadow-sm",
        className
      )}
      style={{ width: size, height: size }}
      aria-label="Character preview"
      role="img"
    >
      {/* Layers render bottom to top: Background → Body → Head → Accessory → Noggles */}
      {background && (
        <img
          src={background.preview}
          alt={background.name}
          className="absolute inset-0 h-full w-full object-contain"
        />
      )}

      {body && (
        <img
          src={body.preview}
          alt={body.name}
          className="absolute inset-0 h-full w-full object-contain"
        />
      )}

      {head && (
        <img
          src={head.preview}
          alt={head.name}
          className="absolute inset-0 h-full w-full object-contain"
        />
      )}

      {accessory && (
        <img
          src={accessory.preview}
          alt={accessory.name}
          className="absolute inset-0 h-full w-full object-contain"
        />
      )}

      {noggles && (
        <img
          src={noggles.preview}
          alt={noggles.name}
          className="absolute inset-0 h-full w-full object-contain"
        />
      )}
    </div>
  )
}
