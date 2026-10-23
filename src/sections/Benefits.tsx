import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { benefits } from '../content/copy'
import { prefersReducedMotion } from '../lib/smoothScroll'

const INK = '#221c1c'
const LAV = '#c5a8f9'
const line = { fill: 'none', stroke: INK, strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

const pad = (i: number) => String(i + 1).padStart(2, '0')

/** Plays each drawing's story once its own element scrolls into view. */
function playStories(q: (s: string) => Element[], selector: string, start = 'top 78%') {
  q(selector).forEach((el, i) => {
    const r = gsap.utils.selector(el)
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start } })
    tl.to({}, { duration: 0.3 })
    STORIES[i % STORIES.length](tl, r)
  })
}

/**
 * What changes: the section holds while the four outcomes slide past
 * sideways as you scroll, one large panel each. Each panel has a small line
 * drawing that plays once, showing the change it describes. Phones get a
 * simple stack.
 */
export function Benefits() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      if (prefersReducedMotion()) {
        // show every drawing in its finished state
        gsap.set(q('.oc-end'), { autoAlpha: 1 })
        gsap.set(q('.oc-start'), { autoAlpha: 0 })
        return
      }
      const mm = gsap.matchMedia()
      // Desktop: hold the section and slide the panels sideways with your scroll
      mm.add('(min-width: 768px)', () => {
        const track = q('.bs-track')[0] as HTMLElement
        const distance = () => track.scrollWidth - track.parentElement!.clientWidth
        gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: { trigger: q('.bs-pin')[0], start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true },
        })
      })
      playStories(q, '.bs-panel', 'top 75%')
    },
    { scope: root },
  )

  return (
    <section ref={root} id="benefits" data-nav="light" className="bg-oat text-ink">
      <div className="bs-pin flex flex-col justify-center overflow-hidden py-[clamp(88px,13vh,170px)] max-md:py-16 md:h-[100svh] md:py-0">
        <div className="wrap">
          <h2 className="max-w-[760px] font-serif text-[clamp(36px,3.8vw,60px)] font-normal leading-[1.04] tracking-[-0.03em] [text-wrap:balance]">{benefits.title}</h2>
        </div>

        <div className="mt-[clamp(32px,6vh,64px)] md:pl-[max(24px,calc((100vw-86.815rem)/2+24px))]">
          <div className="bs-track flex flex-col gap-4 px-4 md:w-max md:flex-row md:gap-5 md:px-0 md:pr-[10vw]">
            {benefits.outcomes.map((o, i) => {
              const Drawing = DRAWINGS[i % DRAWINGS.length]
              return (
                <div key={o.title} className="bs-panel grid gap-6 rounded-[14px] bg-oat-2 p-7 md:h-[min(52vh,440px)] md:w-[min(62vw,760px)] md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-center md:gap-10 md:p-10">
                  <div className="grid aspect-square w-full max-w-[200px] place-items-center rounded-[12px] bg-oat md:max-w-none" aria-hidden>
                    <Drawing />
                  </div>
                  <div>
                    <span className="meta text-ink/45">{pad(i)}</span>
                    <h3 className="mt-3 font-serif text-[clamp(28px,2.8vw,44px)] leading-[1.06] tracking-[-0.025em] [text-wrap:balance]">{o.title}</h3>
                    <p className="mt-4 text-[17px] leading-[1.55] text-ink/70">{o.body}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* The drawings. Each is a 100×100 line sketch; its story plays once.  */
/* Elements marked oc-start show before, oc-end show after.            */
/* ------------------------------------------------------------------ */
type Story = (tl: gsap.core.Timeline, q: (s: string) => Element[]) => void

/* 01 · Taken seriously: a speaker on a reel gets a "verified" tick */
function Serious() {
  return (
    <svg viewBox="0 0 100 100" className="w-[64%]">
      <rect x="28" y="14" width="44" height="72" rx="6" {...line} />
      <circle cx="50" cy="40" r="8" {...line} />
      <path d="M36 66 C 38 54, 62 54, 64 66" {...line} />
      <g className="oc-tick oc-end opacity-0">
        <circle cx="70" cy="22" r="9" fill={LAV} />
        <path d="M66 22 l3 3 l5 -6" {...line} strokeWidth={1.8} />
      </g>
    </svg>
  )
}
const seriousStory: Story = (tl, q) => {
  tl.fromTo(q('.oc-tick'), { autoAlpha: 0, scale: 0.3, transformOrigin: '70px 22px' }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(2.4)' }, '-=0.2')
}

/* 02 · Recognizable: three reels, their title bars slide into the same spot */
function Recognizable() {
  return (
    <svg viewBox="0 0 100 100" className="w-[78%]">
      {[12, 39, 66].map((x, i) => (
        <g key={x}>
          <rect x={x} y="24" width="22" height="52" rx="4" {...line} />
          <rect className="oc-bar" x={x + 4} y="31" width="14" height="5" rx="1.5" fill={LAV} data-from={[-12, 10, -4][i]} />
          <path d={`M${x + 5} 66 h12`} {...line} strokeWidth={1.4} />
        </g>
      ))}
    </svg>
  )
}
const recognizableStory: Story = (tl, q) => {
  const bars = q('.oc-bar')
  tl.from(bars, { y: (i) => Number((bars[i] as SVGElement).dataset.from), autoAlpha: 0.3, duration: 0.7, stagger: 0.12, ease: 'power3.out' }, '-=0.3')
}

/* 03 · Your week back: a busy week clears down to one recording day */
function WeekBack() {
  return (
    <svg viewBox="0 0 100 100" className="w-[80%]">
      {Array.from({ length: 7 }, (_, i) => {
        const x = 8 + i * 12.4
        return (
          <g key={i}>
            <rect x={x} y="36" width="9" height="28" rx="2" {...line} strokeWidth={1.3} />
            {i === 0 ? (
              <rect x={x + 1.5} y="37.5" width="6" height="25" rx="1" fill={LAV} />
            ) : (
              <rect className="oc-busy" x={x + 1.5} y="37.5" width="6" height="25" rx="1" fill={INK} opacity=".75" />
            )}
          </g>
        )
      })}
    </svg>
  )
}
const weekStory: Story = (tl, q) => {
  tl.fromTo(q('.oc-busy'), { scaleY: 1, transformOrigin: '50% 100%' }, { scaleY: 0, duration: 0.45, stagger: 0.08, ease: 'power2.in' }, '-=0.1')
}

/* 04 · Confidence: the "post" button gets pressed and turns into a tick */
function Confident() {
  return (
    <svg viewBox="0 0 100 100" className="w-[74%]">
      <rect x="26" y="10" width="48" height="56" rx="6" {...line} />
      <path d="M44 30 v16 l13 -8 z" {...line} />
      <g className="oc-btn">
        <rect x="20" y="74" width="60" height="16" rx="8" fill={INK} />
        <path className="oc-start" d="M40 82 h20 M54 77 l6 5 -6 5" fill="none" stroke="#f4f2ef" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path className="oc-end opacity-0" d="M44 82 l4 4 l8 -8" fill="none" stroke={LAV} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  )
}
const confidentStory: Story = (tl, q) => {
  tl.to(q('.oc-btn'), { scale: 0.92, transformOrigin: '50px 82px', duration: 0.12, yoyo: true, repeat: 1 }, '-=0.1')
    .to(q('.oc-start'), { autoAlpha: 0, duration: 0.15 }, '<0.1')
    .to(q('.oc-end'), { autoAlpha: 1, duration: 0.25 }, '>')
}

const DRAWINGS = [Serious, Recognizable, WeekBack, Confident]
const STORIES = [seriousStory, recognizableStory, weekStory, confidentStory]
