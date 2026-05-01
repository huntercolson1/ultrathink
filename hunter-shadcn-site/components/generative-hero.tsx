import { cn } from "@/lib/utils"

/* ── Seeded PRNG (mulberry32) ──────────────────────────────────── */

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ── 1-D value noise with quintic interpolation ────────────────── */

function createNoise(rng: () => number) {
  const T = 512
  const table = Array.from({ length: T }, () => rng())
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)
  return (x: number) => {
    const xi = Math.floor(x)
    const xf = x - xi
    const i = ((xi % T) + T) % T
    return table[i] + fade(xf) * (table[(i + 1) % T] - table[i])
  }
}

/* ── Fractional Brownian Motion ────────────────────────────────── */

function fbm(
  noise: (x: number) => number,
  x: number,
  octaves: number,
  lacunarity = 2.0,
  gain = 0.5
) {
  let v = 0,
    a = 1,
    f = 1,
    m = 0
  for (let i = 0; i < octaves; i++) {
    v += a * noise(x * f)
    m += a
    a *= gain
    f *= lacunarity
  }
  return v / m
}

/* ── Deterministic string → seed ───────────────────────────────── */

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return Math.abs(h) || 1
}

/* ── Palettes ──────────────────────────────────────────────────── */

const PALETTE_CSS = [
  "var(--accent-warm)",
  "var(--accent-warm)",
  "var(--accent-sage)",
  "var(--accent-blue)",
  "var(--foreground)",
]

const PALETTE_HEX = ["#d97757", "#d97757", "#788c5d", "#6a9bcc", "#3d3830"]

/* ── Strata path generator ─────────────────────────────────────── */

function generateStrata(
  seed: number,
  W: number,
  H: number,
  layerCount: number,
  step: number,
  paletteSize: number,
  alphaBase: number,
  alphaRange: number
) {
  const rng = mulberry32(seed)
  const noise = createNoise(rng)

  const layers: {
    fillD: string
    colorIdx: number
    fillA: number
  }[] = []

  for (let i = 0; i < layerCount; i++) {
    const colorIdx = Math.floor(rng() * paletteSize)
    const fillA = +(alphaBase + rng() * alphaRange).toFixed(3)
    const ns = 0.001 + rng() * 0.0025
    const amp = H * (0.12 + rng() * 0.22)
    const baseY = H * (0.1 + (i / layerCount) * 0.58)
    const off = rng() * 10000
    const oct = 3 + Math.floor(rng() * 3)

    let fillD = `M-2 ${H + 2}`

    for (let x = -2; x <= W + 2; x += step) {
      const y = (baseY + (fbm(noise, x * ns + off, oct) - 0.5) * amp).toFixed(1)
      fillD += ` L${x} ${y}`
    }

    fillD += ` L${W + 2} ${H + 2}Z`
    layers.push({ fillD, colorIdx, fillA })
  }

  return layers
}

/* ── Favicon data URI ──────────────────────────────────────────── */

export function generateFaviconDataUri(seed = 7): string {
  const W = 32,
    H = 32
  const layers = generateStrata(seed, W, H, 4, 1, PALETTE_HEX.length, 0.15, 0.2)

  let paths = ""
  for (const l of layers) {
    paths += `<path d="${l.fillD}" fill="${PALETTE_HEX[l.colorIdx]}" opacity="${l.fillA.toFixed(2)}"/>`
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#f5f3ee"/>${paths}</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/* ── Component ─────────────────────────────────────────────────── */

interface GenerativeHeroProps {
  seed?: number | string
  variant?: "hero" | "banner"
  className?: string
}

export function GenerativeHero({
  seed = 7,
  variant = "hero",
  className,
}: GenerativeHeroProps) {
  const seedNum = typeof seed === "string" ? hashString(seed) : seed

  const W = 1200
  const H = variant === "hero" ? 240 : 140
  const isHero = variant === "hero"

  const layers = generateStrata(
    seedNum,
    W,
    H,
    isHero ? 7 : 5,
    4,
    PALETTE_CSS.length,
    isHero ? 0.035 : 0.045,
    isHero ? 0.055 : 0.06
  )

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn(
        "pointer-events-none w-full select-none",
        isHero ? "h-[120px] sm:h-[160px]" : "h-[56px] sm:h-[84px]",
        isHero
          ? "[mask-image:linear-gradient(to_bottom,black_55%,transparent_100%)]"
          : "[mask-image:linear-gradient(to_bottom,black_60%,transparent_97%)]",
        className
      )}
    >
      {layers.map((l, i) => (
        <path
          key={i}
          d={l.fillD}
          fill={PALETTE_CSS[l.colorIdx]}
          opacity={l.fillA}
        />
      ))}
    </svg>
  )
}
