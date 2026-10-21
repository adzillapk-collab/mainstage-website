import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { faq } from '../content/copy'
import { prefersReducedMotion } from '../lib/smoothScroll'

export function Faq() {
  const root = useRef<HTMLElement>(null)
  const [open, setOpen] = useState<number | null>(0)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('.faq-head > *', {
        y: 18, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.faq-head', start: 'top 80%' },
      })
      gsap.from('.faq-item', {
        y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.07, ease: 'power3.out',
        scrollTrigger: { trigger: '.faq-list', start: 'top 82%' },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="faq" data-nav="light" className="bg-oat py-[clamp(96px,14vh,180px)] text-ink">
      <div className="wrap grid gap-12 md:grid-cols-12 md:gap-6">
        {/* Headline stays in view while you read */}
        <div className="md:col-span-4">
          <div className="faq-head md:sticky md:top-[120px]">
            <p className="meta mb-5 text-ink/60">{faq.label}</p>
            <h2 className="font-serif text-[clamp(40px,4.4vw,72px)] font-normal leading-[1] tracking-[-0.04em]">{faq.title}</h2>
          </div>
        </div>

        <div className="faq-list border-t border-ink/20 md:col-span-7 md:col-start-6">
          {faq.items.map((item, i) => {
            const on = open === i
            return (
              <div key={item.q} className="faq-item border-b border-ink/20">
                <button
                  type="button"
                  onClick={() => setOpen(on ? null : i)}
                  aria-expanded={on}
                  className="group flex w-full items-center justify-between gap-6 py-6 text-left md:py-7"
                >
                  <span className="font-serif text-[clamp(21px,1.8vw,28px)] leading-[1.15] tracking-[-0.02em]">{item.q}</span>
                  {/* plus that turns into a cross */}
                  <span className={`relative h-5 w-5 shrink-0 transition-transform duration-500 ease-out ${on ? 'rotate-45' : 'group-hover:rotate-90'}`} aria-hidden>
                    <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-ink" />
                    <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-ink" />
                  </span>
                </button>
                <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${on ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="min-h-0 overflow-hidden">
                    <p className="pb-7 pr-10 text-[16px] leading-[1.6] text-ink/70 md:text-[17px]">{item.a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
