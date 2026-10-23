import { gsap } from 'gsap'

/*
 * Shared pieces for the attention scenes: an audience seen from behind in
 * front of a reel, each person's gaze pivoting from a point on their head.
 * The variants draw people, gaze and reel in their own style but move the
 * same way: gazes start off pointing anywhere and drifting, then lock onto
 * the reel one by one as you scroll.
 */

export const LAV = '#c5a8f9'
export const INK = '#221c1c'
export const OAT = '#eee6dd'

export type Hair = 'short' | 'curly' | 'bun' | 'long' | 'cap'
export type Person = { x: number; s: number; away: number; hair: Hair }
export type Box = { x: number; y: number; w: number; h: number }
export type Layout = { w: number; h: number; reel: Box; headY: number; r: number; people: Person[] }

/** Where a person's gaze starts (a point on their head), and the angle and distance to the reel. */
export function aim(L: Layout, p: Person, focusY = 0.45) {
  const r = L.r * p.s
  const ox = p.x
  const oy = L.headY - r * 0.35
  const tx = L.reel.x + L.reel.w / 2
  const ty = L.reel.y + L.reel.h * focusY
  const angle = (Math.atan2(ty - oy, tx - ox) * 180) / Math.PI
  const len = Math.hypot(tx - ox, ty - oy)
  return { r, ox, oy, angle, len }
}

/* ------------------------------ people ------------------------------ */

/** Shoulders from behind, running off the bottom of the scene. */
export const shoulders = (x: number, headY: number, r: number, h: number) =>
  `M${x - r * 2.1} ${h + 10} C${x - r * 2.1} ${headY + r * 1.9} ${x - r * 1.4} ${headY + r * 1.25} ${x} ${headY + r * 1.2} C${x + r * 1.4} ${headY + r * 1.25} ${x + r * 2.1} ${headY + r * 1.9} ${x + r * 2.1} ${h + 10} Z`

/**
 * A person from behind: shoulders, neck, ears, head and a hairstyle.
 * `solid` fills everything; `line` draws it in ink outlines on the page colour.
 */
export function Figure({ x, headY, r, h, hair, mode, fill = INK, hairFill = '#141010' }: {
  x: number; headY: number; r: number; h: number; hair: Hair; mode: 'solid' | 'line'; fill?: string; hairFill?: string
}) {
  const line = mode === 'line'
  const skin = line ? { fill: OAT, stroke: INK, strokeWidth: 2.2, strokeLinejoin: 'round' as const } : { fill }
  const hairStyle = line ? { fill: OAT, stroke: INK, strokeWidth: 2.2, strokeLinejoin: 'round' as const } : { fill: hairFill }
  const y = headY
  return (
    <g>
      <path {...skin} d={shoulders(x, y, r, h)} />
      {line && <path d={`M${x - r * 0.42} ${y + r * 1.22} Q${x} ${y + r * 1.42} ${x + r * 0.42} ${y + r * 1.22}`} fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />}
      <rect {...skin} x={x - r * 0.34} y={y + r * 0.6} width={r * 0.68} height={r * 0.66} />
      <ellipse {...skin} cx={x - r * 0.86} cy={y + r * 0.1} rx={r * 0.13} ry={r * 0.24} />
      <ellipse {...skin} cx={x + r * 0.86} cy={y + r * 0.1} rx={r * 0.13} ry={r * 0.24} />
      <ellipse {...skin} cx={x} cy={y} rx={r * 0.88} ry={r} />
      <HairShape x={x} y={y} r={r} hair={hair} style={hairStyle} gap={line ? OAT : fill} />
    </g>
  )
}

function HairShape({ x, y, r, hair, style, gap }: { x: number; y: number; r: number; hair: Hair; style: Record<string, unknown>; gap: string }) {
  const cap = `M${x - r * 0.86} ${y - r * 0.2} C${x - r * 0.8} ${y - r * 1.15} ${x + r * 0.8} ${y - r * 1.15} ${x + r * 0.86} ${y - r * 0.2} C${x + r * 0.45} ${y - r * 0.55} ${x - r * 0.45} ${y - r * 0.55} ${x - r * 0.86} ${y - r * 0.2} Z`
  switch (hair) {
    case 'curly':
      return (
        <g {...style}>
          {[-0.62, -0.32, 0, 0.32, 0.62].map((t, i) => (
            <circle key={i} cx={x + t * r} cy={y - r * (0.72 + (1 - Math.abs(t)) * 0.22)} r={r * 0.34} />
          ))}
        </g>
      )
    case 'bun':
      return (
        <g {...style}>
          <path d={cap} />
          <circle cx={x} cy={y - r * 1.12} r={r * 0.36} />
        </g>
      )
    case 'cap':
      // a cap worn backwards: crown plus the strap opening at the back
      return (
        <g {...style}>
          <path d={`M${x - r * 0.95} ${y - r * 0.05} C${x - r * 0.95} ${y - r * 1.25} ${x + r * 0.95} ${y - r * 1.25} ${x + r * 0.95} ${y - r * 0.05} Z`} />
          <path d={`M${x - r * 0.28} ${y - r * 0.05} C${x - r * 0.28} ${y - r * 0.32} ${x + r * 0.28} ${y - r * 0.32} ${x + r * 0.28} ${y - r * 0.05} Z`} fill={gap} />
        </g>
      )
    case 'long':
      // long hair in a ponytail, seen from behind: the hair sits on the head like
      // everyone else's (so the head and ears still show) and the tail hangs
      // down the back of the neck
      return (
        <g {...style}>
          <path d={cap} />
          <path d={`M${x - r * 0.24} ${y - r * 0.3} C${x - r * 0.42} ${y + r * 0.3} ${x - r * 0.36} ${y + r * 1.0} ${x - r * 0.08} ${y + r * 1.48} Q${x + r * 0.04} ${y + r * 1.58} ${x + r * 0.14} ${y + r * 1.44} C${x + r * 0.4} ${y + r * 0.98} ${x + r * 0.44} ${y + r * 0.28} ${x + r * 0.24} ${y - r * 0.3} Z`} />
        </g>
      )
    default:
      return <path {...style} d={cap} />
  }
}

/* ---------------------------- movement ------------------------------ */

type Q = (s: string) => Element[]
const data = (el: Element, k: string) => (el as HTMLElement).dataset[k]

/** Every element with data-origin pivots around that point. */
export function setOrigins(q: Q) {
  q('[data-origin]').forEach((el) => gsap.set(el, { svgOrigin: data(el, 'origin')! }))
  q('.gaze-aim').forEach((el) => gsap.set(el, { rotation: Number(data(el, 'angle')) }))
}

/**
 * How settled the gazes are: `v` for everyone (0 drifting → 1 settled), and
 * `each` per gaze, so a gaze stops drifting the moment it locks on.
 */
export type Calm = { v: number; each?: { v: number }[] }

/**
 * The drift: each gaze sways until it settles, and each head turns a touch
 * towards wherever its gaze points.
 */
export function startDrift(q: Q, calm: Calm, amount = 14, headTurn = 0.12) {
  const sway = q('.gaze-sway')
  const aims = q('.gaze-aim')
  const heads = q('.head-turn')
  const tick = (time: number) => {
    sway.forEach((el, i) => {
      const settled = Math.max(calm.v, calm.each?.[i]?.v ?? 0)
      const a = Math.sin(time * (0.7 + i * 0.13) + i * 1.9) * amount * (1 - settled)
      gsap.set(el, { rotation: a })
      const pointing = Number(gsap.getProperty(aims[i], 'rotation')) + a
      if (heads[i]) gsap.set(heads[i], { rotation: (pointing + 90) * headTurn })
    })
  }
  gsap.ticker.add(tick)
  return () => gsap.ticker.remove(tick)
}

/**
 * The scroll story shared by every variant: gazes start pointing away,
 * then one by one swing onto the reel. `onLock` adds a variant's own
 * moment for each person (a cone opening, a rim of light…).
 */
export function gazeStory(
  q: Q,
  scene: string,
  calm: Calm,
  scrollTrigger: ScrollTrigger.Vars,
  onLock: (tl: gsap.core.Timeline, i: number, at: number) => void,
) {
  const aims = q(`${scene} .gaze-aim`)
  const all = q('.gaze-aim')
  calm.each ??= all.map(() => ({ v: 0 }))
  const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger })
  tl.set(calm, { v: 0 }, 0).set(aims, { rotation: (_: number, el: Element) => Number(data(el, 'angle')) + Number(data(el, 'away')) }, 0)
  aims.forEach((el, i) => {
    const at = 0.4 + i * 0.45
    const own = calm.each![all.indexOf(el)]
    // as the gaze swings onto the reel its drift dies away, so it stays on it
    tl.set(own, { v: 0 }, 0)
      .to(el, { rotation: Number(data(el, 'angle')), duration: 1.2, ease: 'power2.inOut' }, at)
      .to(own, { v: 1, duration: 1.2, ease: 'power2.inOut' }, at)
    onLock(tl, i, at)
  })
  const end = 0.4 + aims.length * 0.45 + 1.2
  tl.to(calm, { v: 1, duration: end - 0.6 }, 0.4)
  return { tl, end }
}
