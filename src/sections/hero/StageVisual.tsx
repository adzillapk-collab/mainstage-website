import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { media } from '../../content/media'
import { prefersReducedMotion } from '../../lib/smoothScroll'
import type { Clip } from '../../content/media'
import { EditCard, LoopVideo } from './Cards'
import { LogoIcon } from '../../components/ui/Logo'

// Raw footage on the film strip (left), finished edits (right)
// (one of each per client). The belts move right, so the rightmost card
// reaches the stage first; laying the clients out in reverse makes them
// pass through in list order.
const CLIENTS = [...media.heroClients].reverse()
const RAW = CLIENTS.map((c) => c.raw)
const EDITS = CLIENTS.map((c) => c.edit)

// Seconds for each client to pass through the stage
const PER_ITEM = 5
// Each belt holds the clients several times over so it never runs out at any screen width
const COPIES = 4

/**
 * Raw footage runs into the Main Stage and comes out as finished edits.
 * The belts step one client at a time: in each step, the left belt slides
 * by one raw frame (so it goes into the stage) while the right belt slides
 * by one edit slot (so it comes out). Every frame and every slot is the
 * same width, so each step is the same distance in the same time: both
 * belts run at one steady speed and each raw clip stays paired with its edit.
 */
export function StageVisual() {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(ref)
      if (prefersReducedMotion()) return
      const n = RAW.length

      /**
       * Belt positions, one per step. Starts with item `from` touching `edge`
       * (its right edge on it) and moves right one item at a time, so the
       * items cross the edge in the order from, from-1, from-2, ...
       */
      const stops = (track: HTMLElement, from: number, edge: number) => {
        const items = [...track.children] as HTMLElement[]
        const gap = items[1].offsetLeft - items[0].offsetLeft - items[0].offsetWidth
        let x = edge - (items[from].offsetLeft + items[from].offsetWidth)
        const xs = [x]
        for (let j = 0; j < n; j++) {
          x += items[from - j].offsetWidth + gap
          xs.push(x)
        }
        return xs
      }

      let belts: gsap.core.Timeline | null = null
      const build = () => {
        const at = belts?.time() ?? 0
        belts?.kill()
        const film = q('.film-track')[0] as HTMLElement
        const reel = q('.reel-track')[0] as HTMLElement
        // client 1 starts beside the stage on the left, about to go in; its
        // edit starts just behind the stage on the right, about to come out
        const filmXs = stops(film, COPIES * n - 1, film.parentElement!.clientWidth)
        const reelXs = stops(reel, 2 * n - 1, 0)
        gsap.set(film, { x: filmXs[0] })
        gsap.set(reel, { x: reelXs[0] })
        belts = gsap.timeline({ repeat: -1, defaults: { ease: 'none', duration: PER_ITEM } })
        for (let j = 0; j < n; j++) {
          belts.to(film, { x: filmXs[j + 1] }, j * PER_ITEM).to(reel, { x: reelXs[j + 1] }, j * PER_ITEM)
        }
        belts.time(at)
      }
      build()

      // card sizes follow the window, so re-measure when it changes
      let timer = 0
      const onResize = () => {
        clearTimeout(timer)
        timer = window.setTimeout(build, 200)
      }
      window.addEventListener('resize', onResize)

      // The icon keeps turning
      const spin = gsap.to(q('.stage-icon'), { rotate: 360, duration: 13, ease: 'none', repeat: -1 })

      const all = () => [belts!, spin]
      ScrollTrigger.create({
        // one steady pace: scrolling doesn't speed the belts up, they just
        // pause while the hero is off screen
        trigger: ref.current,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => all().forEach((t) => (self.isActive ? t.play() : t.pause())),
      })

      gsap
        .timeline({ delay: 0.8, defaults: { ease: 'power3.out' } })
        .from(q('.stage'), { y: 30, autoAlpha: 0, duration: 1 })
        .from(q('.belt'), { autoAlpha: 0, duration: 1 }, '<0.2')
      return () => {
        window.removeEventListener('resize', onResize)
        clearTimeout(timer)
        belts?.kill()
      }
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className="flex min-h-0 flex-1 flex-col">
      {/* belts + stage take whatever height is left; items scale with the window height */}
      <div
        className="relative left-1/2 min-h-[260px] w-screen flex-1 -translate-x-1/2 md:min-h-[190px]"
        style={{ '--icon': 'clamp(72px, min(12vh, 22vw), 130px)', '--tall': 'clamp(90px, min(21vh, 30vw), 230px)', '--film': 'clamp(120px, min(29vh, 38vw), 300px)' } as React.CSSProperties}
      >
        {/* LEFT · raw footage film strip, ends tucked under the icon */}
        <div className="belt absolute left-0 right-[calc(50%_+_var(--icon)*0.3)] top-1/2 -translate-y-1/2 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_16%,#000_94%,transparent)]">
          <div className="film-track flex w-max">
            {Array.from({ length: COPIES }, () => RAW).flat().map((c, i) => <FilmFrame key={i} clip={c} />)}
          </div>
        </div>

        {/* RIGHT · finished edits, each card shaped like its clip (wide edit or tall reel) */}
        <div className="belt absolute left-[calc(50%_+_var(--icon)*0.3)] right-0 top-1/2 -translate-y-1/2 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_5%,#000_84%,transparent)]">
          {/* room above and below so the cards' soft shadow isn't clipped by the belt */}
          <div className="reel-track flex w-max items-center gap-4 py-12 md:gap-5">
            {/* every client gets the same slot width (a tall reel sits centred in it),
                so the belt moves the same distance for each client and never speeds up */}
            {Array.from({ length: COPIES }, () => EDITS).flat().map((c, i) => (
              <div key={i} className="flex w-[min(calc(var(--tall)*2.1),70vw)] shrink-0 justify-center">
                <div className={c.shape === 'tall' ? 'w-[var(--tall)]' : 'w-full'}>
                  <EditCard clip={c} />
                </div>
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

      {/* breathing room before the next section, and room for the cards' shadow */}
      <div className="h-[clamp(28px,4vh,40px)] shrink-0" />
    </div>
  )
}

/**
 * One frame of unedited footage on a film strip. Every frame is the same
 * width so the strip moves at a steady pace; tall footage sits centred in it.
 */
function FilmFrame({ clip }: { clip: Clip }) {
  const tall = clip.shape === 'tall'
  return (
    <div className="w-[var(--film)] shrink-0 bg-ink px-[3px]">
      <Sprockets />
      <div className="flex aspect-video justify-center">
        <div className={`overflow-hidden rounded-[2px] ${tall ? 'aspect-[9/16] h-full' : 'h-full w-full'}`}>
          {/* raw footage stays black and white; colour only comes out of the stage */}
          <LoopVideo clip={clip} className="[filter:grayscale(1)_contrast(.85)_brightness(1.08)]" />
        </div>
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
