export type Rarity = "Common" | "Uncommon" | "Rare" | "Legendary"

export interface TraitOption {
  id: string
  name: string
  rarity: Rarity
  /**
   * Path to the SVG asset under `public/`.
   * Example: `/nouns-traits/Bodies/0-body-bege-bsod.svg`
   */
  preview: string
}

export interface TraitCategory {
  id: string
  label: string
  /**
   * Nouns-style traits are pre-colored SVGs, so we don't
   * expose color pickers for these categories.
   */
  hasColorPicker: boolean
  options: TraitOption[]
}

const RARITY_DEFAULT: Rarity = "Common"

export const RARITY_COLORS: Record<Rarity, string> = {
  Common: "#9CA3AF",
  Uncommon: "#34D399",
  Rare: "#60A5FA",
  Legendary: "#FBBF24",
}

function humanizeFilename(filename: string): string {
  const base = filename.replace(".svg", "")
  const parts = base.split("-")

  // Drop the numeric prefix and, if present, the type prefix (`body`, `head`, etc.)
  const nameParts =
    parts.length > 2
      ? parts.slice(2)
      : parts.length > 1
        ? parts.slice(1)
        : parts

  const name = nameParts.join(" ")

  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function makeTraitOption(folder: string, filename: string): TraitOption {
  const base = filename.replace(".svg", "")

  return {
    id: base,
    name: humanizeFilename(filename),
    rarity: RARITY_DEFAULT,
    preview: `/nouns-traits/${folder}/${filename}`,
  }
}

// Curated subsets from each Nouns-style trait folder.
// You can extend these lists with more filenames from `public/nouns-traits/*`
// following the same pattern.

const BACKGROUND_FILES = ["0-background-cool.svg", "1-background-warm.svg"] as const

const BODY_FILES = [
  "0-body-bege-bsod.svg",
  "1-body-bege-crt.svg",
  "2-body-blue-sky.svg",
  "3-body-bluegrey.svg",
  "4-body-cold.svg",
  "5-body-computerblue.svg",
  "6-body-darkbrown.svg",
  "7-body-darkpink.svg",
  "8-body-foggrey.svg",
  "9-body-gold.svg",
  "14-body-green.svg",
  "17-body-magenta.svg",
  "22-body-purple.svg",
  "23-body-red.svg",
  "26-body-slimegreen.svg",
  "28-body-teal.svg",
  "29-body-yellow.svg",
] as const

const HEAD_FILES = [
  "0-head-aardvark.svg",
  "1-head-abstract.svg",
  "2-head-ape.svg",
  "3-head-bag.svg",
  "4-head-bagpipe.svg",
  "5-head-banana.svg",
  "6-head-bank.svg",
  "7-head-baseball-gameball.svg",
  "8-head-basketball.svg",
  "9-head-bat.svg",
  "10-head-bear.svg",
  "12-head-beet.svg",
  "16-head-blackhole.svg",
  "17-head-blueberry.svg",
  "19-head-bonsai.svg",
  "24-head-brain.svg",
  "30-head-calendar.svg",
  "32-head-cannedham.svg",
  "33-head-car.svg",
  "35-head-cassettetape.svg",
  "36-head-cat.svg",
  "41-head-chart-bars.svg",
  "42-head-cheese.svg",
  "43-head-chefhat.svg",
  "44-head-cherry.svg",
  "45-head-chicken.svg",
  "50-head-cloud.svg",
  "51-head-clover.svg",
  "57-head-cordlessphone.svg",
  "61-head-crane.svg",
  "63-head-crown.svg",
  "64-head-crt-bsod.svg",
  "65-head-crystalball.svg",
  "66-head-diamond-blue.svg",
  "68-head-dictionary.svg",
  "72-head-doughnut.svg",
  "73-head-drill.svg",
  "74-head-duck.svg",
  "76-head-earth.svg",
  "78-head-faberge.svg",
  "79-head-factory-dark.svg",
  "81-head-fence.svg",
  "83-head-film-strip.svg",
  "85-head-firehydrant.svg",
  "86-head-flamingo.svg",
  "87-head-flower.svg",
  "91-head-gavel.svg",
  "94-head-gnome.svg",
  "95-head-goat.svg",
  "96-head-goldcoin.svg",
  "97-head-goldfish.svg",
  "98-head-grouper.svg",
  "99-head-hair.svg",
] as const

const ACCESSORY_FILES = [
  "0-accessory-1n.svg",
  "1-accessory-aardvark.svg",
  "2-accessory-axe.svg",
  "3-accessory-belly-chameleon.svg",
  "4-accessory-bird-flying.svg",
  "5-accessory-bird-side.svg",
  "6-accessory-bling-anchor.svg",
  "7-accessory-bling-anvil.svg",
  "8-accessory-bling-arrow.svg",
  "9-accessory-bling-cheese.svg",
  "10-accessory-bling-gold-ingot.svg",
  "11-accessory-bling-love.svg",
  "12-accessory-bling-mask.svg",
  "13-accessory-bling-rings.svg",
  "14-accessory-bling-scissors.svg",
  "15-accessory-bling-sparkles.svg",
  "16-accessory-body-gradient-checkerdisco.svg",
  "17-accessory-body-gradient-dawn.svg",
  "18-accessory-body-gradient-dusk.svg",
  "19-accessory-body-gradient-glacier.svg",
  "20-accessory-body-gradient-ice.svg",
  "21-accessory-body-gradient-pride.svg",
  "22-accessory-body-gradient-redpink.svg",
  "23-accessory-body-gradient-sunset.svg",
  "24-accessory-carrot.svg",
  "25-accessory-chain-logo.svg",
  "26-accessory-checker-RGB.svg",
  "27-accessory-checker-bigwalk-blue-prime.svg",
  "28-accessory-checker-bigwalk-greylight.svg",
  "29-accessory-checker-bigwalk-rainbow.svg",
  "30-accessory-checker-spaced-black.svg",
  "31-accessory-checker-spaced-white.svg",
  "32-accessory-checker-vibrant.svg",
  "33-accessory-checkers-big-green.svg",
  "35-accessory-checkers-black.svg",
  "36-accessory-checkers-blue.svg",
  "37-accessory-checkers-magenta-80.svg",
  "38-accessory-chicken.svg",
  "39-accessory-cloud.svg",
  "40-accessory-clover.svg",
  "41-accessory-collar-sunset.svg",
  "42-accessory-cow.svg",
  "45-accessory-dinosaur.svg",
  "46-accessory-dollar-bling.svg",
  "47-accessory-dragon.svg",
  "48-accessory-ducky.svg",
  "49-accessory-eth.svg",
  "50-accessory-eye.svg",
  "51-accessory-flash.svg",
  "52-accessory-fries.svg",
  "55-accessory-glasses.svg",
  "57-accessory-heart.svg",
  "61-accessory-insignia.svg",
  "63-accessory-lightbulb.svg",
  "64-accessory-lines-45-greens.svg",
  "65-accessory-lines-45-rose.svg",
  "66-accessory-lp.svg",
  "67-accessory-marsface.svg",
  "69-accessory-moon-block.svg",
  "70-accessory-none.svg",
  "71-accessory-oldshirt.svg",
  "72-accessory-pizza-bling.svg",
  "73-accessory-pocket-pencil.svg",
  "75-accessory-rainbow-steps.svg",
  "76-accessory-rgb.svg",
  "77-accessory-robot.svg",
  "78-accessory-safety-vest.svg",
  "79-accessory-scarf-clown.svg",
  "81-accessory-shirt-black.svg",
  "82-accessory-shrimp.svg",
  "83-accessory-slimesplat.svg",
  "84-accessory-small-bling.svg",
  "85-accessory-snowflake.svg",
  "86-accessory-stains-blood.svg",
  "87-accessory-stains-zombie.svg",
  "88-accessory-stripes-and-checks.svg",
  "89-accessory-stripes-big-red.svg",
  "90-accessory-stripes-blit.svg",
  "91-accessory-stripes-blue-med.svg",
  "92-accessory-stripes-brown.svg",
  "93-accessory-stripes-olive.svg",
  "94-accessory-stripes-red-cold.svg",
  "95-accessory-sunset.svg",
  "96-accessory-taxi-checkers.svg",
  "97-accessory-tee-yo.svg",
  "98-accessory-text-yolo.svg",
  "99-accessory-think.svg",
] as const

const NOGGLES_FILES = [
  "0-glasses-hip-rose.svg",
  "1-glasses-square-black-eyes-red.svg",
  "2-glasses-square-black-rgb.svg",
  "3-glasses-square-black.svg",
  "4-glasses-square-blue-med-saturated.svg",
  "5-glasses-square-blue.svg",
  "6-glasses-square-frog-green.svg",
  "7-glasses-square-fullblack.svg",
  "8-glasses-square-green-blue-multi.svg",
  "9-glasses-square-grey-light.svg",
  "10-glasses-square-guava.svg",
  "11-glasses-square-honey.svg",
  "12-glasses-square-magenta.svg",
  "13-glasses-square-orange.svg",
  "14-glasses-square-pink-purple-multi.svg",
  "15-glasses-square-red.svg",
  "16-glasses-square-smoke.svg",
  "17-glasses-square-teal.svg",
  "18-glasses-square-watermelon.svg",
  "19-glasses-square-yellow-orange-multi.svg",
  "20-glasses-square-yellow-saturated.svg",
  "21-glasses-deep-teal.svg",
  "22-glasses-grass.svg",
  "23-glasses-lavender.svg",
] as const

export const TRAIT_CATEGORIES: TraitCategory[] = [
  {
    id: "background",
    label: "Background",
    hasColorPicker: false,
    options: BACKGROUND_FILES.map((file) => makeTraitOption("Backgrounds", file)),
  },
  {
    id: "body",
    label: "Body",
    hasColorPicker: false,
    options: BODY_FILES.map((file) => makeTraitOption("Bodies", file)),
  },
  {
    id: "head",
    label: "Head",
    hasColorPicker: false,
    options: HEAD_FILES.map((file) => makeTraitOption("Heads", file)),
  },
  {
    id: "accessory",
    label: "Accessory",
    hasColorPicker: false,
    options: ACCESSORY_FILES.map((file) => makeTraitOption("Accessories", file)),
  },
  {
    id: "noggles",
    label: "Noggles",
    hasColorPicker: false,
    options: NOGGLES_FILES.map((file) => makeTraitOption("Noggles", file)),
  },
]

export interface CharacterState {
  backgroundId: string
  bodyId: string
  headId: string
  accessoryId: string
  nogglesId: string
}

export const DEFAULT_CHARACTER: CharacterState = {
  backgroundId: TRAIT_CATEGORIES.find((c) => c.id === "background")?.options[0]?.id ?? "",
  bodyId: TRAIT_CATEGORIES.find((c) => c.id === "body")?.options[0]?.id ?? "",
  headId: TRAIT_CATEGORIES.find((c) => c.id === "head")?.options[0]?.id ?? "",
  accessoryId: TRAIT_CATEGORIES.find((c) => c.id === "accessory")?.options[0]?.id ?? "",
  nogglesId: TRAIT_CATEGORIES.find((c) => c.id === "noggles")?.options[0]?.id ?? "",
}

export function getTraitOption(categoryId: string, traitId: string): TraitOption | undefined {
  const category = TRAIT_CATEGORIES.find((c) => c.id === categoryId)
  if (!category) return undefined
  return category.options.find((option) => option.id === traitId)
}
