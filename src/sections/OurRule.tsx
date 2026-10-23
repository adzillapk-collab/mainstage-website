import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { rule } from '../content/copy'
import { prefersReducedMotion } from '../lib/smoothScroll'

/**
 * Our rule: one big list of ideas. As you scroll past it, each
 * one is marked: highlighted if it goes in, struck through if it's left out.
 */
export function OurRule() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        gsap.set('.rc-keep .rc-text', { backgroundSize: '100% 72%' })
        gsap.set('.rc-cut .rc-text', { backgroundSize: '100% 2px', color: 'rgba(34,28,28,.3)' })
        gsap.set('.rc-tag', { autoAlpha: 1 })
        return
      }
      gsap.from('.rc-head > *', {
        y: 18, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.rc-head', start: 'top 80%' },
      })

      // Your scroll marks the list, one idea at a time
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.rc-list', start: 'top 70%', end: 'bottom 45%', scrub: 0.6 } })
      rule.decisions.forEach((d, i) => {
        const row = `.rc-row-${i}`
        if (d.keep) {
          tl.to(`${row} .rc-text`, { backgroundSize: '100% 72%', duration: 1, ease: 'none' })
        } else {
          tl.to(`${row} .rc-text`, { backgroundSize: '100% 2px', duration: 1, ease: 'none' })
            .to(`${row} .rc-text`, { color: 'rgba(34,28,28,.3)', duration: 0.6 }, '<0.3')
        }
        tl.to(`${row} .rc-tag`, { autoAlpha: 1, duration: 0.3 }, '<0.5')
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="rule" data-nav="light" className="bg-oat py-[clamp(88px,13vh,170px)] max-md:py-16 text-ink">
      <div className="wrap grid gap-12 md:grid-cols-12 md:gap-6">
        <div className="rc-head md:sticky md:top-28 md:col-span-5 md:self-start">
          <p className="meta mb-6 text-ink/60">{rule.label}</p>
          <h2 className="font-serif text-[clamp(38px,4vw,64px)] font-normal leading-[1.02] tracking-[-0.035em] [text-wrap:balance]">
            {rule.titleA} {rule.titleB}
          </h2>
          <p className="mt-6 max-w-[420px] text-[17px] leading-[1.5] text-ink/70">{rule.body}</p>
        </div>

        <ol className="rc-list md:col-span-7">
          {rule.decisions.map((d, i) => (
            <li
              key={d.text}
              className={`rc-row-${i} ${d.keep ? 'rc-keep' : 'rc-cut'} grid grid-cols-[32px_1fr_auto] items-center gap-4 border-t border-ink/15 py-[clamp(14px,2.2vh,22px)] last:border-b md:grid-cols-[44px_1fr_auto]`}
            >
              <span className="meta text-ink/40">{String(i + 1).padStart(2, '0')}</span>
              <div>
                {/* inline marks, so a two-line idea is marked on both lines */}
                <span
                  className="rc-text box-decoration-clone bg-no-repeat px-1 font-serif text-[clamp(24px,2.5vw,40px)] leading-[1.15] tracking-[-0.02em]"
                  style={
                    d.keep
                      ? { backgroundImage: 'linear-gradient(rgba(197,168,249,.75), rgba(197,168,249,.75))', backgroundPosition: '0 62%', backgroundSize: '0% 72%' }
                      : { backgroundImage: 'linear-gradient(rgba(34,28,28,.55), rgba(34,28,28,.55))', backgroundPosition: '0 58%', backgroundSize: '0% 2px' }
                  }
                >
                  {d.text}
                </span>
              </div>
              <span className={`rc-tag meta whitespace-nowrap opacity-0 ${d.keep ? 'text-ink' : 'text-ink/40'}`}>
                {d.keep ? rule.keptLabel : rule.cutLabel}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
