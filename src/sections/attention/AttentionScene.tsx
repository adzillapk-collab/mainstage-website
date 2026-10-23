import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { attention } from '../../content/copy'
import { prefersReducedMotion } from '../../lib/smoothScroll'
import { Figure, INK, LAV, aim, gazeStory, setOrigins, startDrift, type Layout } from './shared'

/*
 * Attention, as a scene: a reel on a phone in the background and an
 * audience in front of it, seen from behind, each with a soft lavender beam
 * of attention from a point on their head. The beams drift about at first,
 * then lock onto the reel one by one as you scroll, and the reel starts
 * playing. The beams are the only lavender in the scene, so they carry it.
 * The headline is centred and told in two beats: "Most reels look basic."
 * while the beams scatter, then "Very few hold attention." (with the note)
 * as they lock on. Desktop holds the section still while this plays.
 * Around the phone, other reels float about, faded and cluttered: the busy
 * ones nobody stays for. They clear away as attention locks onto ours.
 */

// `busy`: the other reels floating around, as [x, y, width] in the scene's units
type SceneLayout = Layout & { busy: [number, number, number][] }

const DESKTOP: SceneLayout = {
  w: 1500, h: 640, reel: { x: 610, y: 8, w: 280, h: 498 }, headY: 548, r: 52,
  people: [
    { x: 290, s: 1.0, away: -50, hair: 'bun' },
    { x: 525, s: 1.1, away: 40, hair: 'short' },
    { x: 750, s: 1.18, away: -34, hair: 'curly' },
    { x: 975, s: 1.08, away: 52, hair: 'long' },
    { x: 1210, s: 1.0, away: -44, hair: 'cap' },
  ],
  busy: [
    [70, 30, 96], [250, 130, 78], [96, 250, 70], [410, 20, 86], [440, 230, 62],
    [1010, 30, 90], [1200, 120, 100], [1352, 24, 74], [1078, 250, 66], [1340, 268, 80],
  ],
}
const PHONE: SceneLayout = {
  w: 400, h: 660, reel: { x: 112, y: 14, w: 176, h: 313 }, headY: 512, r: 42,
  people: [
    { x: 72, s: 0.95, away: -46, hair: 'long' },
    { x: 202, s: 1.12, away: 38, hair: 'curly' },
    { x: 330, s: 0.98, away: -52, hair: 'cap' },
  ],
  busy: [[16, 36, 64], [26, 200, 52], [322, 26, 60], [330, 196, 50]],
}

export function AttentionScene() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const calm = { v: 0 }
      setOrigins(q)
      if (prefersReducedMotion()) {
        gsap.set(q('.swap-a, .busy'), { autoAlpha: 0 })
        return
      }
      const stopDrift = startDrift(q, calm, 13, 0.05)

      // the busy reels bob about on their own, each at its own pace
      const floaters = q('.busy-float')
      const bob = (time: number) =>
        floaters.forEach((el, i) => gsap.set(el, { y: Math.sin(time * (0.5 + (i % 4) * 0.12) + i * 2.1) * 8, x: Math.cos(time * 0.35 + i) * 4 }))
      gsap.ticker.add(bob)

      const story = (scene: string, scrollTrigger: ScrollTrigger.Vars) => {
        const cones = q(`${scene} .cone`)
        const a = q('.swap-a .word')
        const b = q('.swap-b .word')
        const { tl, end } = gazeStory(q, scene, calm, scrollTrigger, (t, i, at) => {
          t.to(cones[i], { scaleX: 1, scaleY: 1, opacity: 1, duration: 1, ease: 'power2.out' }, at + 0.45)
        })
        tl.set(cones, { scaleX: 0.5, scaleY: 0.22, opacity: 0.7 }, 0)
          .set(q(`${scene} .reel-on`), { opacity: 0 }, 0)
          .to(q(`${scene} .reel-on`), { opacity: 1, duration: end * 0.4 }, end * 0.5)
          // beat one while they scatter, beat two as they lock on
          .set(a, { autoAlpha: 1, y: 0 }, 0)
          .set(b, { autoAlpha: 0, y: 36 }, 0)
          .to(a, { autoAlpha: 0, y: -36, stagger: 0.08, duration: 0.6, ease: 'power2.in' }, end * 0.36)
          .to(b, { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out' }, '>-0.05')
          // the busy reels clear away as attention gathers on ours
          .set(q(`${scene} .busy`), { autoAlpha: 1, scale: 1 }, 0)
          .to(q(`${scene} .busy`), { autoAlpha: 0, scale: 0.9, duration: 0.7, ease: 'power2.in', stagger: { each: 0.18, from: 'random' } }, end * 0.18)
          .to({}, { duration: 0.8 })
      }

      const mm = gsap.matchMedia()
      mm.add('(min-width: 768px)', () => story('.scene-desktop', { trigger: q('.as-pin')[0], start: 'top top', end: '+=170%', pin: true, scrub: 0.7, anticipatePin: 1 }))
      mm.add('(max-width: 767px)', () => story('.scene-phone', { trigger: q('.as-head')[0], start: 'top 60%', end: '+=520', scrub: 0.7 }))

      return () => {
        stopDrift()
        gsap.ticker.remove(bob)
      }
    },
    { scope: root },
  )

  const heading = 'font-serif text-[clamp(40px,5.6vw,92px)] font-normal leading-[1] tracking-[-0.04em] [grid-area:1/1]'
  return (
    <section ref={root} id="attention-scene" data-nav="light" className="relative overflow-hidden bg-oat text-ink">
      <div className="as-pin flex flex-col pt-16 md:h-[100svh] md:pt-[104px]">
        <div className="as-head wrap shrink-0 text-center">
          {/* both halves share one spot; the second replaces the first */}
          <div className="grid">
            <h2 className={`swap-a ${heading}`}>
              <Words text={attention.titleA} />
            </h2>
            <h2 className={`swap-b ${heading}`}>
              <Words text={attention.titleB} markLast />
            </h2>
          </div>
        </div>
        <div className="mt-6 flex min-h-0 flex-1 items-end justify-center md:mt-[2vh]">
          <Scene layout={DESKTOP} name="desktop" className="hidden md:block" maxHeight="calc(100svh - 104px - 2vh - clamp(40px, 5.6vw, 92px) - 76px - 3vh)" />
          <Scene layout={PHONE} name="phone" className="w-full max-w-[460px] md:hidden" />
        </div>
        {/* the note sits under the visual and arrives with the second line; two lines on desktop */}
        <p className="swap-b mx-auto mt-6 max-w-[560px] px-4 shrink-0 pb-16 text-center text-[15px] leading-[1.5] text-ink/70 [text-wrap:balance] md:mt-5 md:max-w-[680px] md:pb-[3vh] md:text-[16px]">
          <span className="word inline-block">{attention.body}</span>
        </p>
      </div>
    </section>
  )
}

/** A line of text as separate words, so each can move on its own; the last one can carry a lavender highlight. */
function Words({ text, markLast = false }: { text: string; markLast?: boolean }) {
  const words = text.split(' ')
  return (
    <>
      {words.map((w, i) => (
        <span
          key={i}
          className={`word inline-block ${markLast && i === words.length - 1 ? 'bg-[linear-gradient(transparent_58%,#c5a8f9_58%,#c5a8f9_92%,transparent_92%)]' : ''}`}
        >
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </>
  )
}

function Scene({ layout: L, name, className = '', maxHeight }: { layout: SceneLayout; name: string; className?: string; maxHeight?: string }) {
  const R = L.reel
  const id = (s: string) => `as-${name}-${s}`
  const sx = R.x + 1.5
  const sy = R.y + 1.5
  const sw = R.w - 3
  const sh = R.h - 3
  const cx = sx + sw / 2
  return (
    <div
      className={`scene-${name} relative ${className}`}
      // keeps its shape: as wide as it can be without getting taller than maxHeight
      style={{ aspectRatio: `${L.w} / ${L.h}`, width: maxHeight ? `min(100%, calc(${maxHeight} * ${L.w / L.h}))` : undefined }}
    >
      <svg viewBox={`0 0 ${L.w} ${L.h}`} className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id={id('cone')} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={LAV} stopOpacity="0.95" />
            <stop offset="0.4" stopColor={LAV} stopOpacity="0.45" />
            <stop offset="1" stopColor={LAV} stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id={id('bust')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a3131" />
            <stop offset="1" stopColor="#161111" />
          </linearGradient>
          <filter id={id('soft')} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <clipPath id={id('clip')}>
            <rect x={sx} y={sy} width={sw} height={sh} rx="25" />
          </clipPath>
        </defs>

        {/* the other reels, floating about: faded, cluttered, ignored */}
        {L.busy.map(([x, y, w], i) => (
          <g key={i} className="busy" data-origin={`${x + w / 2} ${y + w * 0.89}`}>
            <g className="busy-float">
              <BusyReel x={x} y={y} w={w} seed={i} />
            </g>
          </g>
        ))}

        {/* the reel on its phone, kept minimal: a thin outline, idle with a play
            mark, then a single speaker icon once it's playing */}
        <rect x={R.x} y={R.y} width={R.w} height={R.h} rx="28" fill="#e4dacd" />
        <g clipPath={`url(#${id('clip')})`}>
          <path d={`M${cx - 12} ${sy + sh / 2 - 15} L${cx + 15} ${sy + sh / 2} L${cx - 12} ${sy + sh / 2 + 15} Z`} fill={INK} opacity="0.3" />
          <g className="reel-on">
            <rect x={sx} y={sy} width={sw} height={sh} fill="#f4f2ef" />
            <UserIcon cx={cx} cy={sy + sh * 0.5} size={sw * 0.62} />
          </g>
        </g>
        {/* the outline goes on top so the lit screen never covers it */}
        <rect x={R.x} y={R.y} width={R.w} height={R.h} rx="28" fill="none" stroke={INK} strokeWidth="3" />

        {/* the audience, with soft beams of attention */}
        {L.people.map((p, i) => {
          const { r, ox, oy, angle, len } = aim(L, p, 0.5)
          const o = `${ox} ${oy}`
          const half = R.w * 0.42
          return (
            <g key={i}>
              <g className="gaze-sway" data-origin={o}>
                <g className="gaze-aim" data-origin={o} data-angle={angle} data-away={p.away}>
                  <path className="cone" data-origin={o} d={`M${ox} ${oy} L${ox + len} ${oy - half} L${ox + len} ${oy + half} Z`} fill={`url(#${id('cone')})`} filter={`url(#${id('soft')})`} />
                </g>
              </g>
              <g className="head-turn" data-origin={`${p.x} ${L.h}`}>
                <Figure x={p.x} headY={L.headY} r={r} h={L.h} hair={p.hair} mode="solid" fill={`url(#${id('bust')})`} hairFill="#120e0e" />
                <circle cx={ox} cy={oy} r={r * 0.22} fill={LAV} opacity="0.35" />
                <circle cx={ox} cy={oy} r={r * 0.1} fill={LAV} />
              </g>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/** A classic user icon (round head over rounded shoulders), centred on (cx, cy), `size` wide. */
function UserIcon({ cx, cy, size }: { cx: number; cy: number; size: number }) {
  const head = size * 0.27
  const gap = size * 0.06
  const half = size / 2
  const shoulders = size * 0.42 // how tall the shoulders are
  const top = cy - (head * 2 + gap + shoulders) / 2
  const headY = top + head
  const base = top + head * 2 + gap + shoulders
  return (
    <g fill={INK}>
      <circle cx={cx} cy={headY} r={head} />
      <path d={`M${cx - half} ${base} C${cx - half} ${base - shoulders * 1.25} ${cx + half} ${base - shoulders * 1.25} ${cx + half} ${base} Z`} />
    </g>
  )
}

/**
 * One of the other reels: small, faded and crowded with bits (stickers,
 * stacked captions, a big title), the kind people scroll past.
 */
function BusyReel({ x, y, w, seed }: { x: number; y: number; w: number; seed: number }) {
  const h = w * (16 / 9)
  const cx = x + w / 2
  const tone = ['#d9d0c6', '#d3c9be', '#ddd5cc'][seed % 3]
  const bit = '#b9aea3'
  return (
    <g opacity={0.55 + (seed % 3) * 0.12}>
      <rect x={x} y={y} width={w} height={h} rx={w * 0.12} fill={tone} />
      {/* the speaker */}
      <circle cx={cx} cy={y + h * 0.46} r={w * 0.15} fill={bit} />
      <path d={`M${cx - w * 0.3} ${y + h} C${cx - w * 0.3} ${y + h * 0.72} ${cx - w * 0.17} ${y + h * 0.64} ${cx} ${y + h * 0.64} C${cx + w * 0.17} ${y + h * 0.64} ${cx + w * 0.3} ${y + h * 0.72} ${cx + w * 0.3} ${y + h} Z`} fill={bit} />
      {/* the clutter: a loud title, stickers, captions stacked on captions */}
      <rect x={x + w * 0.1} y={y + h * 0.08} width={w * 0.8} height={h * 0.07} rx={w * 0.03} fill="#c4b8ab" />
      <circle cx={x + w * (seed % 2 ? 0.78 : 0.24)} cy={y + h * 0.27} r={w * 0.1} fill="#c9bdb0" />
      <rect x={x + w * (seed % 2 ? 0.12 : 0.56)} y={y + h * 0.22} width={w * 0.3} height={h * 0.05} rx={w * 0.025} fill="#cbbfb2" />
      <rect x={x + w * 0.14} y={y + h * 0.74} width={w * 0.72} height={h * 0.045} rx={w * 0.02} fill="#efe9e2" />
      <rect x={x + w * 0.22} y={y + h * 0.81} width={w * 0.56} height={h * 0.045} rx={w * 0.02} fill="#efe9e2" />
      <rect x={x + w * 0.3} y={y + h * 0.88} width={w * 0.4} height={h * 0.04} rx={w * 0.02} fill="#e4dacd" />
    </g>
  )
}
