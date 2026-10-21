import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { media } from '../../content/media'
import { prefersReducedMotion } from '../../lib/smoothScroll'
import { ReelCard } from './Cards'
import { LogoIcon } from '../../components/ui/Logo'

// Raw footage frames on the film strip (left)
const RAW = [media.speakers.founder, media.speakers.coach, media.speakers.podcast, media.speakers.creator, media.speakers.warm, media.speakers.founder]

// Finished reels (right)
const REELS = [
  { src: media.speakers.founder, title: 'Why most hooks fail', caption: ['nobody', 'watches', 'past', 'second', 'three'], hit: 3 },
  { src: media.speakers.coach, title: 'Stop posting more', caption: ['post', 'better,', 'not', 'more'], hit: 1 },
  { src: media.speakers.podcast, title: 'The 3-second rule', caption: ['earn', 'the', 'next', 'ten'], hit: 0 },
  { src: media.speakers.creator, title: 'One idea per reel', caption: ['say', 'one', 'thing', 'well'], hit: 2 },
  { src: media.speakers.warm, title: 'Talk like a human', caption: ['less', 'script,', 'more', 'you'], hit: 3 },
]

const BEAT = 2.6 // one frame in, one reel out

/** Raw footage runs into the Main Stage and comes out as finished reels. */
export function StageVisual() {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(ref)
      if (prefersReducedMotion()) return

      const film = gsap.fromTo(q('.film-track'), { xPercent: -50 }, { xPercent: 0, duration: BEAT * RAW.length, ease: 'none', repeat: -1 })
      const reels = gsap.fromTo(q('.reel-track'), { xPercent: -50 }, { xPercent: 0, duration: BEAT * REELS.length, ease: 'none', repeat: -1 })
      // The icon keeps turning
      const spin = gsap.to(q('.stage-icon'), { rotate: 360, duration: BEAT * 5, ease: 'none', repeat: -1 })

      const belts = [film, reels, spin]
      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const boost = 1 + Math.min(3, Math.abs(self.getVelocity()) / 800)
          belts.forEach((t) => gsap.to(t, { timeScale: boost, duration: 0.2, overwrite: true }))
          gsap.delayedCall(0.25, () => belts.forEach((t) => gsap.to(t, { timeScale: 1, duration: 1, overwrite: true })))
        },
        onToggle: (self) => belts.forEach((t) => (self.isActive ? t.play() : t.pause())),
      })

      gsap
        .timeline({ delay: 0.8, defaults: { ease: 'power3.out' } })
        .from(q('.stage'), { y: 30, autoAlpha: 0, duration: 1 })
        .from(q('.belt'), { autoAlpha: 0, duration: 1 }, '<0.2')
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className="flex min-h-0 flex-1 flex-col">
      {/* belts + stage take whatever height is left; items scale with the window height */}
      <div
        className="relative left-1/2 min-h-[260px] w-screen flex-1 -translate-x-1/2 md:min-h-[190px]"
        style={{ '--icon': 'clamp(72px, min(12vh, 22vw), 130px)' } as React.CSSProperties}
      >
        {/* LEFT · raw footage film strip, ends tucked under the icon */}
        <div className="belt absolute left-0 right-[calc(50%_+_var(--icon)*0.3)] top-1/2 -translate-y-1/2 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_16%,#000_94%,transparent)]">
          <div className="film-track flex w-max">
            {[...RAW, ...RAW].map((src, i) => <FilmFrame key={i} src={src} />)}
          </div>
        </div>

        {/* RIGHT · finished reels */}
        <div className="belt absolute left-[calc(50%_+_var(--icon)*0.3)] right-0 top-1/2 -translate-y-1/2 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_5%,#000_84%,transparent)]">
          <div className="reel-track flex w-max gap-4 md:gap-5">
            {[...REELS, ...REELS].map((r, i) => (
              <div key={i} className="w-[clamp(90px,min(21vh,30vw),230px)] shrink-0">
                <ReelCard src={r.src} title={r.title} caption={r.caption} hit={r.hit} />
              </div>
            ))}
          </div>
        </div>

        {/* CENTRE · the Main Stage icon, always turning */}
        <div className="stage absolute left-1/2 top-1/2 z-10 w-[var(--icon)] -translate-x-1/2 -translate-y-1/2">
          {/* soft beige halo (page colour) so the film and reels fade into the icon */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[260%] -translate-x-1/2 -translate-y-1/2 rounded-full [background:radial-gradient(closest-side,#eee6dd_45%,rgba(238,230,221,0))]" />
          <LogoIcon className="stage-icon relative block h-auto w-full text-ink" title="Main Stage" />
        </div>
      </div>

      {/* breathing room before the next section */}
      <div className="h-[clamp(24px,5vh,56px)] shrink-0" />
    </div>
  )
}

/** One frame of unedited footage on a film strip: grey, flat, landscape. */
function FilmFrame({ src }: { src: string }) {
  return (
    <div className="w-[clamp(120px,min(29vh,38vw),300px)] shrink-0 bg-ink px-[3px]">
      <Sprockets />
      <div className="aspect-video overflow-hidden rounded-[2px]">
        <img src={src} alt="" className="h-full w-full object-cover [filter:grayscale(1)_contrast(.82)_brightness(1.1)]" />
      </div>
      <Sprockets />
    </div>
  )
}

function Sprockets() {
  return (
    <div
      className="h-[14px] md:h-[18px]"
      style={{
        backgroundImage: 'linear-gradient(90deg, transparent 5px, #eee6dd 5px, #eee6dd 11px, transparent 11px)',
        backgroundSize: '16px 6px',
        backgroundRepeat: 'repeat-x',
        backgroundPosition: '0 center',
      }}
    />
  )
}
