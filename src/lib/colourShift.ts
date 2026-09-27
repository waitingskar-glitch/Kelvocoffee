/**
 * Idle colour shifts for the traced illustrations (HotColdBand, StoryArt).
 * A layer eases between its own colour and a near neighbour in the same hue
 * family, so the drawing never changes character: coffee tones deepen or
 * lift a touch, the hot splash warms towards red, the cold one cools towards
 * cyan, the Whiskey pouch glows a shade. Greys, whites and near-blacks never
 * shift.
 */

export type ShiftPart = 'coffee' | 'hot' | 'cold' | 'whiskey'

/** Hex colour to HSL (h in degrees, s and l 0-1). */
function toHsl(hex: string): [number, number, number] {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [h * 60, s, l]
}

/** The colour a layer shifts towards while idling, or null if it should hold still. */
export function shiftedColour(hex: string, index: number, part: ShiftPart): string | null {
  if (!hex.startsWith('#')) return null
  const [h, s, l] = toHsl(hex)
  if (s < 0.3 || l > 0.93 || l < 0.12) return null
  const coffee = h >= 10 && h <= 50
  if (part === 'coffee' && !coffee) return null
  // The Whiskey pouch: only its coral (reds), never the coffee in front of it.
  if (part === 'whiskey' && !(h < 14 || h > 340)) return null
  const dh = part === 'coffee' ? 2.4 : part === 'hot' ? -4.7 : part === 'cold' ? 5.9 : -3
  const dl =
    part === 'coffee' ? (index % 2 ? 0.041 : -0.041) : part === 'whiskey' ? (index % 2 ? 0.03 : -0.025) : index % 2 ? 0.03 : -0.024
  const nh = (((h + dh) % 360) + 360) % 360
  const ns = Math.min(1, s * 1.08)
  const nl = Math.min(0.95, Math.max(0.1, l + dl))
  return `hsl(${nh.toFixed(0)} ${(ns * 100).toFixed(0)}% ${(nl * 100).toFixed(0)}%)`
}
