import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { team } from '../content/copy'
import { prefersReducedMotion } from '../lib/smoothScroll'
import { NAME_PATHS } from './team/namePaths'

/**
 * Cruise-style team row: centred headline, then the three of you as
 * cut-out photos standing on a thin "stage floor", cropped at the waist.
 * Photos are cut-outs with the background removed (in public/team, set in copy.json).
 * Each person appears behind a lavender wash that rises through their
 * silhouette from the bottom up, leaving the photo behind it. Names: on
 * desktop, hovering a person turns the cursor into a lavender arrow carrying
 * their name; on phones each name is written along the curve of that person's
 * head and slides into place.
 */
export function Team() {
  const root = useRef<HTMLElement>(null)
  const row = useRef<HTMLDivElement>(null)
  const tag = useRef<HTMLDivElement>(null)
  const { over, label, setOver, onMove } = useNameCursor(row, tag)
  // the photos only download as you scroll near them; the wash (which reuses
  // the photo as its outline) waits for each one so it can't fetch it early
  const [ready, setReady] = useState<boolean[]>([])

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('.team-copy > *', {
        y: 18, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.team-copy', start: 'top 80%' },
      })
      // The lavender wash rises through each person in turn, then the names slide in
      gsap
        .timeline({ scrollTrigger: { trigger: '.team-row', start: 'top 75%' } })
        .fromTo('.member-photo', { '--p': '-30%' }, { '--p': '130%', duration: 1.6, ease: 'power2.inOut', stagger: 0.22 })
        .from(
          '.name-arc',
          { autoAlpha: 0, attr: { startOffset: (_: number, el: Element) => `${Number((el as SVGElement).dataset.at) - 12}%` }, duration: 1.1, ease: 'power3.out', stagger: 0.18 },
          '-=0.7',
        )
    },
    { scope: root },
  )

  return (
    <section ref={root} id="team" data-nav="light" className="overflow-hidden bg-oat pt-[clamp(96px,14vh,180px)] max-md:pt-16 text-ink">
      <div className="team-copy wrap flex flex-col items-center text-center">
        <p className="meta mb-5 text-ink/60">{team.label}</p>
        <h2 className="max-w-[760px] font-serif text-[clamp(40px,4.6vw,76px)] font-normal leading-[1] tracking-[-0.04em]">{team.title}</h2>
        <p className="mt-6 max-w-[520px] text-[17px] leading-[1.55] text-ink/70">{team.body}</p>
      </div>

      {/* The row of people, standing on the stage floor */}
      <div ref={row} onPointerMove={onMove} onPointerLeave={() => setOver(null)} style={{ cursor: over === null ? undefined : 'none' }} className="team-row relative mx-auto mt-[clamp(48px,8vh,96px)] flex h-[clamp(200px,min(44vh,60vw),500px)] max-w-[1100px] items-end justify-center border-b border-ink/25 px-3">
        {team.members.map((m, i) => {
          const middle = i === 1
          return (
            <figure
              key={i}
              className={`relative flex h-full w-[clamp(120px,27vw,330px)] items-end justify-center ${middle ? 'max-md:left-[4vw]' : '-mx-[3vw] md:-mx-6'}`}
            >
              {/* only the photos stack (middle in front), so every name stays on top */}
              {/* the hovered person comes to the front so their outline shows in full */}
              <div className={`member-body relative flex w-full items-end justify-center ${middle ? 'z-10 h-full' : 'z-0 h-[90%]'} ${over === i ? '!z-20' : ''}`}>
                {m.photo ? (
                  // --p is how far up the wash has risen: 130% (the default) means fully shown
                  <span
                    className="member-photo relative block h-full shrink-0 transition-[filter] duration-300 ease-out"
                    style={{ '--p': '130%', filter: over === null ? LOOK.rest : over === i ? LOOK.selected : LOOK.others } as CSSProperties}
                  >
                    <img
                      src={m.photo}
                      alt={m.role ? `${m.name}, ${m.role}` : m.name}
                      loading="lazy"
                      onLoad={() => setReady((r) => Object.assign([...r], { [i]: true }))}
                      className="block h-full w-auto max-w-none object-contain object-bottom"
                      style={REVEAL}
                    />
                    {/* the lavender wash, cut to the person's own outline */}
                    {ready[i] && <span className="pointer-events-none absolute inset-0" style={wash(m.photo)} aria-hidden />}
                    {NAME_PATHS[m.photo] && <NameArc id={`name-arc-${i}`} name={m.name} shape={NAME_PATHS[m.photo]} />}
                  </span>
                ) : (
                  <Silhouette />
                )}
              </div>

            </figure>
          )
        })}

        {/* desktop: the name-tag cursor */}
        <div ref={tag} className={`pointer-events-none absolute left-0 top-0 z-30 hidden transition-opacity duration-200 md:block ${over === null ? 'opacity-0' : 'opacity-100'}`} aria-hidden>
          <svg width="16" height="18" viewBox="0 0 16 18" className="block">
            <path d="M1.5 1.5 L14 9.2 L8.2 10.4 L5.4 16 Z" fill="#c5a8f9" stroke="#221c1c" strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
          <span className="ml-3 mt-0.5 block whitespace-nowrap rounded-full bg-lavender px-3 py-1.5 text-[13px] font-medium leading-none text-ink shadow-[0_6px_16px_-8px_rgba(34,28,28,.5)]">
            {label}
          </span>
        </div>
      </div>
    </section>
  )
}

// Hovered on desktop: a thin lavender outline that hugs the person, like a
// selected layer in an editing app (four 2px shadows make an even stroke),
// while everyone else goes black and white. All three states use the same
// list of filters so they fade smoothly into each other.
const outline = (color: string) => ['2px 0', '-2px 0', '0 2px', '0 -2px'].map((o) => `drop-shadow(${o} 0 ${color})`).join(' ')
const LOOK = {
  selected: `grayscale(0) ${outline('#c5a8f9')}`,
  others: `grayscale(1) ${outline('transparent')}`,
  rest: `grayscale(0) ${outline('transparent')}`,
}

// The photo shows from the bottom up to just behind the wash, with a soft edge
const REVEAL: CSSProperties = {
  maskImage: 'linear-gradient(to top, #000 calc(var(--p) - 4%), transparent calc(var(--p) + 6%))',
  WebkitMaskImage: 'linear-gradient(to top, #000 calc(var(--p) - 4%), transparent calc(var(--p) + 6%))',
}

/** A lavender band at the --p line, shaped by the photo's own outline. */
function wash(photo: string): CSSProperties {
  const band = 'linear-gradient(to top, transparent calc(var(--p) - 20%), #000 calc(var(--p) - 4%), #000 calc(var(--p) + 6%), transparent calc(var(--p) + 24%))'
  const layers = `url("${photo}"), ${band}`
  return {
    background: '#c5a8f9',
    maskImage: layers,
    WebkitMaskImage: layers,
    maskSize: '100% 100%',
    WebkitMaskSize: '100% 100%',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskComposite: 'intersect',
    WebkitMaskComposite: 'source-in',
  }
}

/**
 * Which person is under the mouse, read from the photos' own pixels so the
 * empty corners of a cut-out don't count (the middle person is in front), and
 * a tag that follows the mouse.
 */
function useNameCursor(row: RefObject<HTMLDivElement | null>, tag: RefObject<HTMLDivElement | null>) {
  const [over, setOver] = useState<number | null>(null)
  const [label, setLabel] = useState('')
  const maps = useRef<{ data: Uint8ClampedArray; w: number; h: number }[]>([])
  const move = useRef<{ x: (v: number) => void; y: (v: number) => void } | null>(null)

  useEffect(() => {
    const imgs = [...(row.current?.querySelectorAll<HTMLImageElement>('.member-photo img') ?? [])]
    imgs.forEach((img, i) => {
      const read = () => {
        const w = Math.round(img.naturalWidth / 4)
        const h = Math.round(img.naturalHeight / 4)
        const c = document.createElement('canvas')
        c.width = w
        c.height = h
        const ctx = c.getContext('2d', { willReadFrequently: true })
        if (!ctx) return
        ctx.drawImage(img, 0, 0, w, h)
        maps.current[i] = { data: ctx.getImageData(0, 0, w, h).data, w, h }
      }
      if (img.complete && img.naturalWidth) read()
      else img.addEventListener('load', read, { once: true })
    })
    if (tag.current) {
      const x = gsap.quickTo(tag.current, 'x', { duration: 0.18, ease: 'power3.out' })
      const y = gsap.quickTo(tag.current, 'y', { duration: 0.18, ease: 'power3.out' })
      move.current = { x, y }
    }
  }, [row, tag])

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    // desktop only: phones and tablets in portrait get no hover selection
    if (e.pointerType !== 'mouse' || !row.current || !window.matchMedia('(min-width: 768px)').matches) return
    const imgs = [...row.current.querySelectorAll<HTMLImageElement>('.member-photo img')]
    let hit: number | null = null
    // front to back: the middle person stands in front of the other two
    for (const i of [1, 0, 2]) {
      const img = imgs[i]
      const map = maps.current[i]
      if (!img || !map) continue
      const r = img.getBoundingClientRect()
      if (e.clientX < r.left || e.clientX >= r.right || e.clientY < r.top || e.clientY >= r.bottom) continue
      const px = Math.floor(((e.clientX - r.left) / r.width) * map.w)
      const py = Math.floor(((e.clientY - r.top) / r.height) * map.h)
      if (map.data[(py * map.w + px) * 4 + 3] > 60) {
        hit = i
        break
      }
    }
    const box = row.current.getBoundingClientRect()
    const first = over === null
    move.current?.x(e.clientX - box.left)
    move.current?.y(e.clientY - box.top)
    if (first && hit !== null && tag.current) gsap.set(tag.current, { x: e.clientX - box.left, y: e.clientY - box.top })
    if (hit !== over) setOver(hit)
    if (hit !== null) setLabel(team.members[hit].name)
  }

  return { over, label, setOver, onMove }
}

/**
 * Phones: the name written along the curve of the person's head. The curve is in the
 * photo's own pixels, so the text size is worked out from how big the photo
 * is drawn: 15px on phones, growing to 20px on large screens.
 */
function NameArc({ id, name, shape }: { id: string; name: string; shape: { w: number; h: number; d: string; at: number } }) {
  const ref = useRef<SVGSVGElement>(null)
  // photo pixels per screen pixel, and the text size on screen
  const [fit, setFit] = useState({ units: 5, px: 15 })
  useEffect(() => {
    const svg = ref.current
    if (!svg) return
    const ro = new ResizeObserver(() => {
      const h = svg.clientHeight
      if (h) setFit({ units: shape.h / h, px: Math.min(20, Math.max(15, h * 0.045)) })
    })
    ro.observe(svg)
    return () => ro.disconnect()
  }, [shape.h])
  return (
    <svg ref={ref} viewBox={`0 0 ${shape.w} ${shape.h}`} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible md:hidden" aria-hidden>
      <path id={id} d={shape.d} fill="none" />
      <text className="font-serif" fill="#221c1c" fontSize={fit.px * fit.units} letterSpacing={0.4 * fit.units}>
        <textPath className="name-arc" href={`#${id}`} startOffset={`${shape.at}%`} data-at={shape.at} textAnchor="middle">{name}</textPath>
      </text>
    </svg>
  )
}

/** Neutral stand-in until real cut-out photos arrive. */
function Silhouette() {
  return (
    <svg viewBox="0 0 200 250" className="h-full w-auto" aria-hidden>
      {/* solid fill so overlapping shapes don't darken */}
      <g fill="#ddd2c6">
        <ellipse cx="100" cy="64" rx="34" ry="42" />
        <path d="M18 250 C20 192 48 160 84 152 L86 112 L114 112 L116 152 C152 160 180 192 182 250 Z" />
      </g>
    </svg>
  )
}
