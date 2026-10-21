import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { work } from '../content/copy'
import { media } from '../content/media'
import { prefersReducedMotion } from '../lib/smoothScroll'

// Sample frames until real client reels are added (swap for <video> later)
const SRC = [media.speakers.founder, media.speakers.coach, media.speakers.podcast, media.speakers.creator]

export function Work() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('.work-head > *', {
        y: 18, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.work-head', start: 'top 80%' },
      })
      gsap.from('.work-card', {
        y: 40, autoAlpha: 0, duration: 1, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.work-grid', start: 'top 85%' },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="work" data-nav="light" className="bg-oat py-[clamp(96px,14vh,180px)] text-ink">
      <div className="wrap">
        <div className="work-head grid gap-8 md:grid-cols-12 md:gap-6">
          <h2 className="font-serif text-[clamp(44px,5.4vw,88px)] font-normal leading-[1] tracking-[-0.04em] md:col-span-8">{work.title}</h2>
          <div className="md:col-span-3 md:col-start-10 md:pt-3">
            <p className="meta mb-4 text-ink/60">{work.label}</p>
            <p className="text-[17px] leading-[1.5] text-ink/75">{work.sub}</p>
          </div>
        </div>

        <div className="work-grid -mx-4 mt-[clamp(48px,8vh,96px)] flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
          {work.reels.map((r, i) => (
            <WorkCard key={r.title} src={SRC[i % SRC.length]} {...r} />
          ))}
        </div>
      </div>
    </section>
  )
}

type CardProps = { src: string; who: string; length: string; title: string; caption: string[] }

/** A reel that "plays" on hover (or tap): progress runs, captions light up word by word. */
function WorkCard({ src, who, length, title, caption }: CardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(ref)
      tl.current = gsap
        .timeline({ paused: true })
        .to(q('.wc-play'), { autoAlpha: 0, scale: 0.8, duration: 0.25 }, 0)
        .to(q('.wc-photo'), { scale: 1.04, duration: 0.6, ease: 'power2.out' }, 0)
        .fromTo(q('.wc-progress'), { scaleX: 0 }, { scaleX: 1, duration: 3.2, ease: 'none' }, 0)
        .fromTo(
          q('.wc-word'),
          { backgroundColor: 'rgba(197,168,249,0)', color: '#ffffff' },
          { backgroundColor: '#c5a8f9', color: '#221c1c', duration: 0.12, stagger: { each: 0.6, yoyo: true, repeat: 1 } },
          0.3,
        )
    },
    { scope: ref },
  )

  const play = () => tl.current?.restart()
  const stop = () => {
    tl.current?.pause()
    tl.current?.progress(0)
  }

  return (
    <div
      ref={ref}
      className="work-card w-[62vw] max-w-[260px] shrink-0 snap-start md:w-auto md:max-w-none"
      onMouseEnter={play}
      onMouseLeave={stop}
      onClick={play}
    >
      <div className="relative aspect-[9/16] cursor-pointer overflow-hidden rounded-[12px] bg-ink">
        <img src={src} alt="" className="wc-photo warm-photo absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />
        <div className="absolute inset-x-3 top-3 h-[3px] overflow-hidden rounded-full bg-white/30">
          <div className="wc-progress h-full origin-left scale-x-0 rounded-full bg-white" />
        </div>
        <div className="absolute inset-x-[9%] top-[8%] rounded-[6px] bg-mist px-2 py-1.5 text-center font-serif text-[clamp(13px,1.2vw,17px)] leading-[1.05] tracking-tight text-ink shadow-lg">
          {title}
        </div>
        <div className="absolute inset-x-3 bottom-[9%] flex flex-wrap justify-center gap-x-[4px] text-center text-[clamp(12px,1.05vw,15px)] font-semibold leading-tight text-white [text-shadow:0_1px_8px_rgba(0,0,0,.6)]">
          {caption.map((w, i) => (
            <span key={i} className="wc-word rounded px-[2px]">{w}</span>
          ))}
        </div>
        <span className="wc-play absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-mist/90 text-ink shadow-lg">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7 4l13 8-13 8z" /></svg>
        </span>
      </div>
      <div className="meta mt-3 flex justify-between text-ink/60">
        <span>{who}</span>
        <span>{length}</span>
      </div>
    </div>
  )
}
