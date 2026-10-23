import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { hero } from '../content/copy'
import { prefersReducedMotion } from '../lib/smoothScroll'
import { StageVisual } from './hero/StageVisual'

export function Hero() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('.hero-line', { yPercent: 105, duration: 1.1, stagger: 0.08 }, 0.2)
        .from('.hero-sub', { y: 16, autoAlpha: 0, duration: 0.9 }, 0.6)
    },
    { scope: root },
  )

  return (
    // Exactly one screen tall on laptops and desktops: copy on top, the visual fills the rest.
    // Phones just fit the content, so there's no empty band under the belts.
    <section
      ref={root}
      id="top"
      data-nav="light"
      className="relative flex flex-col overflow-hidden bg-oat pt-[104px] md:h-[100svh] md:min-h-[640px] md:pt-[max(124px,17vh)]"
    >
      <div className="wrap relative flex min-h-0 flex-1 flex-col">
        {/* Copy, centred */}
        <div className="mx-auto flex max-w-[1080px] shrink-0 flex-col items-center text-center">
          <h1 className="font-serif text-[clamp(48px,min(7.6vw,12.6vh),132px)] font-normal leading-[0.95] tracking-[-0.045em] text-ink">
            <span className="block overflow-hidden pb-[0.06em]"><span className="hero-line block">{hero.titleLine1}</span></span>
            <span className="block overflow-hidden pb-[0.06em]"><span className="hero-line block">{hero.titleLine2}</span></span>
          </h1>
          <p className="hero-sub mt-[clamp(16px,2.6vh,28px)] max-w-[560px] text-[17px] leading-[1.45] text-ink/75 md:text-[clamp(17px,2.2vh,20px)]">{hero.sub}</p>
        </div>

        {/* Footage → Main Stage → Reels, fills the remaining height */}
        <div className="mt-[clamp(24px,4vh,48px)] flex min-h-[300px] flex-1 flex-col md:min-h-0">
          <StageVisual />
        </div>
      </div>
    </section>
  )
}
