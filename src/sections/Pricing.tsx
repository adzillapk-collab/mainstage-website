import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { pricing } from '../content/copy'
import { prefersReducedMotion } from '../lib/smoothScroll'

const fmt = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`

export function Pricing() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('.pricing-head > *', {
        y: 18, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.pricing-head', start: 'top 80%' },
      })

      const cards = gsap.utils.toArray<HTMLElement>('.plan')
      gsap.from(cards, {
        y: 40, autoAlpha: 0, duration: 1, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: '.plans', start: 'top 82%' },
      })

      // Prices count up as the cards arrive
      cards.forEach((card, i) => {
        const el = card.querySelector<HTMLElement>('.plan-price')
        if (!el) return
        const target = pricing.plans[i].price
        const n = { v: 0 }
        gsap.to(n, {
          v: target, duration: 1.2, delay: 0.15 + i * 0.12, ease: 'power3.out',
          onUpdate: () => { el.textContent = fmt(n.v) },
          scrollTrigger: { trigger: '.plans', start: 'top 82%' },
        })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="pricing" data-nav="light" className="bg-oat py-[clamp(96px,14vh,180px)] text-ink">
      <div className="wrap">
        <div className="pricing-head grid gap-8 md:grid-cols-12 md:gap-6">
          <h2 className="font-serif text-[clamp(44px,5.4vw,88px)] font-normal leading-[1] tracking-[-0.04em] md:col-span-8">{pricing.title}</h2>
          <div className="md:col-span-3 md:col-start-10 md:pt-3">
            <p className="meta mb-4 text-ink/60">{pricing.label}</p>
            <p className="text-[17px] leading-[1.5] text-ink/75">{pricing.sub}</p>
          </div>
        </div>

        <div className="plans mt-[clamp(48px,8vh,96px)] grid gap-4 md:grid-cols-3 md:gap-5">
          {pricing.plans.map((p) => {
            const dark = !!p.popular
            return (
              <div
                key={p.name}
                className={`plan group flex flex-col rounded-[14px] p-7 transition-transform duration-500 ease-out hover:-translate-y-1 md:p-8 ${
                  dark ? 'bg-ink text-mist' : 'border border-ink/15 bg-oat-2/40'
                }`}
              >
                <div className="flex h-6 items-center justify-between">
                  <span className="meta">{p.name}</span>
                  {dark && <span className="meta rounded-[4px] bg-lavender px-2 py-1 text-ink">Most popular</span>}
                </div>

                <div className="mt-10 flex items-baseline gap-2">
                  <span className="plan-price font-serif text-[clamp(52px,4.6vw,76px)] leading-none tracking-[-0.04em]">{fmt(p.price)}</span>
                  <span className={`meta ${dark ? 'text-mist/55' : 'text-ink/50'}`}>/ month</span>
                </div>
                <p className={`mt-3 text-[15px] ${dark ? 'text-mist/70' : 'text-ink/65'}`}>
                  {p.reels} reels · about {fmt(p.perReel)} each
                </p>

                <ul className={`mt-8 border-t ${dark ? 'border-mist/15' : 'border-ink/15'}`}>
                  {p.features.map((f) => (
                    <li key={f} className={`flex items-center gap-3 border-b py-3 text-[15px] ${dark ? 'border-mist/10' : 'border-ink/10'}`}>
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dark ? 'bg-lavender' : 'bg-ink'}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-10">
                  <a href="#book" className={`btn w-full justify-center ${dark ? 'btn-oat !px-5 !py-3.5 !text-[13px]' : 'btn-ink'}`}>
                    {p.cta}
                  </a>
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-10 text-center text-[16px] text-ink/70">
          {pricing.more}{' '}
          <a href={pricing.moreLink.href} className="text-ink underline decoration-ink/30 underline-offset-4 transition-colors hover:decoration-ink">
            {pricing.moreLink.label} →
          </a>
        </p>
      </div>
    </section>
  )
}
