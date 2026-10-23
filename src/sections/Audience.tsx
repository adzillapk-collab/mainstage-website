import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { audience } from '../content/copy'
import { prefersReducedMotion } from '../lib/smoothScroll'

/** Who it's for: a good-fit list that ticks itself off, beside a short not-a-fit list. */
export function Audience() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('.aud-head > *', {
        y: 18, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.aud-head', start: 'top 80%' },
      })
      gsap.from('.aud-card', {
        y: 40, autoAlpha: 0, duration: 1, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: '.aud-grid', start: 'top 85%' },
      })
      // Each good-fit row ticks off in turn
      gsap
        .timeline({ scrollTrigger: { trigger: '.aud-yes', start: 'top 75%' } })
        .from('.aud-yes li', { autoAlpha: 0, y: 12, duration: 0.6, stagger: 0.28, ease: 'power3.out' })
        .fromTo('.aud-tick', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.45, stagger: 0.28, ease: 'power2.out' }, 0.25)
      gsap.from('.aud-no li', {
        autoAlpha: 0, y: 12, duration: 0.6, stagger: 0.2, ease: 'power3.out',
        scrollTrigger: { trigger: '.aud-no', start: 'top 80%' },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="who" data-nav="light" className="bg-oat py-[clamp(88px,13vh,170px)] max-md:py-16 text-ink">
      <div className="wrap">
        <div className="aud-head max-w-[900px]">
          <p className="meta mb-6 text-ink/60">{audience.label}</p>
          <h2 className="font-serif text-[clamp(40px,4.6vw,76px)] font-normal leading-[1] tracking-[-0.035em] [text-wrap:balance]">{audience.title}</h2>
        </div>

        <div className="aud-grid mt-[clamp(48px,8vh,96px)] grid gap-5 md:grid-cols-12">
          {/* Good fit */}
          <div className="aud-card rounded-[14px] bg-ink p-6 text-mist md:col-span-7 md:p-10">
            <p className="text-[17px] leading-[1.5] text-mist/70">{audience.yesIntro}</p>
            <ul className="aud-yes mt-6">
              {audience.yes.map((t) => (
                <li key={t} className="flex gap-4 border-t border-mist/15 py-5 last:pb-0">
                  <span className="mt-[3px] grid h-6 w-6 shrink-0 place-items-center rounded-full bg-lavender text-ink">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                      <path className="aud-tick" d="M2.5 6.2l2.3 2.3L9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" />
                    </svg>
                  </span>
                  <span className="font-serif text-[clamp(20px,1.7vw,26px)] leading-[1.2] tracking-[-0.015em]">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Not a fit */}
          <div className="aud-card rounded-[14px] border border-ink/20 p-6 md:col-span-5 md:self-start md:p-10">
            <p className="text-[17px] leading-[1.5] text-ink/70">{audience.noIntro}</p>
            <ul className="aud-no mt-6">
              {audience.no.map((t) => (
                <li key={t} className="flex gap-4 border-t border-ink/15 py-5 last:pb-0">
                  <span className="mt-[3px] grid h-6 w-6 shrink-0 place-items-center rounded-full border border-ink/30 text-ink/50">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                      <path d="M2.5 2.5l5 5M7.5 2.5l-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </span>
                  <span className="font-serif text-[clamp(20px,1.7vw,26px)] leading-[1.2] tracking-[-0.015em] text-ink/60">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
