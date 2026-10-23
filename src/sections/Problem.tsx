import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { problem } from '../content/copy'
import { prefersReducedMotion } from '../lib/smoothScroll'

/**
 * The problem: the headline, centred, on its own charcoal band so it reads
 * apart from the oat sections around it. Like the attention section's
 * headline, the second line fills in word by word as you scroll.
 */
export function Problem() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('.pb-line', {
        y: 24, autoAlpha: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: root.current, start: 'top 80%' },
      })
      gsap.fromTo(
        '.pb-word',
        { color: 'rgba(244,242,239,0.25)' },
        { color: 'rgba(244,242,239,1)', stagger: 0.15, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 75%', end: 'top 25%', scrub: 0.6 } },
      )
    },
    { scope: root },
  )

  return (
    <section ref={root} id="problem" data-nav="dark" className="bg-ink text-mist">
      <div className="flex flex-col items-center px-4 py-[clamp(96px,15vh,190px)] max-md:py-20 text-center">
        <h2 className="pb-line font-serif text-[clamp(44px,6.4vw,112px)] font-normal leading-[1.02] tracking-[-0.04em]">
          <span className="block [text-wrap:balance]">{problem.titleA}</span>
          <span className="block [text-wrap:balance]">
            {problem.titleB.split(' ').map((w, i) => (
              <span key={i} className="pb-word">{w}{' '}</span>
            ))}
          </span>
        </h2>
      </div>
    </section>
  )
}
