import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { pricing, trial } from '../content/copy'
import { LeadButton } from '../components/LeadForm'
import { prefersReducedMotion } from '../lib/smoothScroll'

// whole dollars, or cents when a price has them (e.g. $67.50)
const fmt = (n: number) => {
  const cents = Math.round(n * 100) % 100 !== 0
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 })}`
}
const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, k) => String(values[k] ?? ''))

type Plan = (typeof pricing.plans)[number]
type Pack = (typeof pricing.packs)[number]
const priceOf = (plan: Plan, pack: Pack) => Number(plan.key === 'complex' ? pack.complexPrice : pack.simplePrice)

// The two edit types wear the same colours as their folders in Our work
const LOOK = {
  simple: { card: 'bg-ink text-mist', soft: 'text-mist/60', line: 'border-mist/15', pill: 'bg-mist text-ink', idle: 'text-mist/70 hover:text-mist', track: 'bg-mist/[0.08]', btn: 'btn-oat !px-5 !py-3.5 !text-[13px]', dot: 'bg-mist' },
  complex: { card: 'bg-lavender text-ink', soft: 'text-ink/60', line: 'border-ink/15', pill: 'bg-ink text-mist', idle: 'text-ink/70 hover:text-ink', track: 'bg-ink/[0.08]', btn: 'btn-ink', dot: 'bg-ink' },
} as const

/**
 * Pricing: one card per kind of edit. Inside each, pick how many reels a
 * month; the price per reel, the monthly total and what you save update as
 * you switch. The
 * trial offer sits right underneath, for anyone not ready for a pack.
 */
export function Pricing() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('.pricing-head > *', {
        y: 18, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.pricing-head', start: 'top 80%' },
      })
      gsap.from('.plan', {
        y: 40, autoAlpha: 0, duration: 1, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: '.plans', start: 'top 82%' },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="pricing" data-nav="light" className="bg-oat py-[clamp(96px,14vh,180px)] max-md:py-16 text-ink">
      <div className="wrap">
        <div className="pricing-head mx-auto max-w-[820px] text-center">
          <p className="meta mb-6 text-ink/60">{pricing.label}</p>
          <h2 className="font-serif text-[clamp(44px,5.4vw,88px)] font-normal leading-[1] tracking-[-0.04em] [text-wrap:balance]">{pricing.title}</h2>
          <p className="mx-auto mt-5 max-w-[460px] text-[17px] leading-[1.5] text-ink/70">{pricing.sub}</p>
        </div>

        {/* the cards sit in a narrower column than the page, so they read as a compact set */}
        <div className="mx-auto max-w-[960px]">
          <div className="plans mt-[clamp(40px,7vh,80px)] grid gap-4 md:grid-cols-2">
            {pricing.plans.map((plan) => (
              <PlanCard key={plan.key} plan={plan} />
            ))}
          </div>

          {/* the trial: one reel first, for anyone not ready for a pack */}
          <div id="trial" className="plan mt-4 grid scroll-mt-24 gap-6 rounded-[14px] bg-oat-2 p-6 text-ink md:grid-cols-2 md:gap-8 md:p-8">
            <div>
              <p className="meta mb-4 text-ink/60">{trial.label}</p>
              <h3 className="font-serif text-[clamp(28px,2.6vw,40px)] font-normal leading-[1.05] tracking-[-0.03em] [text-wrap:balance]">{trial.title}</h3>
            </div>
            <div className="flex flex-col items-start md:justify-end">
              <p className="text-[16px] leading-[1.5] text-ink/80">{trial.body}</p>
              <p className="mt-2.5 text-[15px] leading-[1.5] text-ink/65">{trial.body2}</p>
              <LeadButton source={`Trial reel · ${trial.cta.label}`} className="btn btn-ink mt-6">{trial.cta.label}</LeadButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PlanCard({ plan }: { plan: Plan }) {
  const look = LOOK[plan.key as keyof typeof LOOK]
  const [pick, setPick] = useState(1)
  const pack = pricing.packs[pick]
  const smallest = pricing.packs[0]
  const largest = pricing.packs[pricing.packs.length - 1]

  const price = priceOf(plan, pack)
  const perReel = price / pack.reels
  // What a pack saves against buying the same reels at the smallest pack's rate
  const savingOn = (p: Pack) => (priceOf(plan, smallest) / smallest.reels) * p.reels - priceOf(plan, p)
  const badge =
    pick === 0
      ? fill(pricing.saveWith, { amount: fmt(savingOn(largest)), reels: largest.reels })
      : fill(pricing.saving, { amount: fmt(savingOn(pack)) })

  return (
    <div className={`plan flex flex-col rounded-[14px] p-6 md:p-8 ${look.card}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-[clamp(24px,2vw,30px)] leading-[1.1] tracking-[-0.02em]">{plan.name}</h3>
          {/* two lines tall either way, so both cards' prices line up */}
          <p className={`mt-2 min-h-[2.9em] max-w-[280px] text-[14px] leading-[1.45] ${look.soft}`}>{plan.desc}</p>
        </div>
        <span className={`meta rounded-full px-3 py-1.5 ${look.pill}`}>{badge}</span>
      </div>

      {/* the price, per reel, and the month in total */}
      <div className="mt-6 flex items-baseline gap-2">
        <Count value={perReel} className="font-serif text-[clamp(44px,4vw,64px)] leading-none tracking-[-0.04em]" />
        <span className={`meta ${look.soft}`}>{pricing.perReel}</span>
      </div>
      <p className={`mt-2 text-[14px] ${look.soft}`}>
        {pricing.total} <Count value={price} className="font-medium" /> {pricing.perMonth}
      </p>

      {/* how many reels a month */}
      <div className={`mt-6 grid grid-cols-3 gap-1 rounded-full p-1 ${look.track}`} role="radiogroup" aria-label={plan.name}>
        {pricing.packs.map((p, i) => (
          <button
            key={p.reels}
            type="button"
            role="radio"
            aria-checked={pick === i}
            onClick={() => setPick(i)}
            className={`rounded-full px-2 py-2 text-[14px] transition-colors duration-300 ${pick === i ? look.pill : look.idle}`}
          >
            {p.reels} {pricing.reelsUnit}
          </button>
        ))}
      </div>

      <ul className={`mt-6 space-y-2 border-t pt-5 text-[14px] ${look.line}`}>
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-3">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${look.dot}`} />
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-7">
        <LeadButton source={`Pricing · ${plan.name} · ${pack.reels} ${pricing.reelsUnit}`} className={`btn w-full justify-center ${look.btn}`}>{plan.cta}</LeadButton>
      </div>
    </div>
  )
}

/** A number that counts to its new value whenever it changes. */
function Count({ value, className = '' }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const shown = useRef(value)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion()) {
      el.textContent = fmt(value)
      shown.current = value
      return
    }
    const n = { v: shown.current }
    const tween = gsap.to(n, {
      v: value,
      duration: 0.5,
      ease: 'power2.out',
      // whole dollars while counting, the exact price once it lands
      onUpdate: () => {
        el.textContent = fmt(Math.round(n.v))
        shown.current = n.v
      },
      onComplete: () => {
        el.textContent = fmt(value)
      },
    })
    return () => {
      tween.kill()
    }
  }, [value])
  return <span ref={ref} className={className}>{fmt(value)}</span>
}
