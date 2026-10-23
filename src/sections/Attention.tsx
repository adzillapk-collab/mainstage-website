import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { problem } from '../content/copy'
import { prefersReducedMotion } from '../lib/smoothScroll'

/* ------------------------------------------------------------------ */
/* Illustrative retention curves: 60 bars = 30 seconds (0.5s each).    */
/* ------------------------------------------------------------------ */
const N = 60
const MARK = 6 // 0:03
const jitter = (i: number) => Math.sin(i * 1.7) * 1.6 + Math.sin(i * 0.43) * 1.2
const TYPICAL = Array.from({ length: N }, (_, i) => {
  const t = i * 0.5
  const v = t <= 3 ? 100 - (t / 3) * 58 : 42 * Math.exp(-(t - 3) / 14) + 6
  return Math.max(4, Math.min(100, v + (i ? jitter(i) : 0)))
})
const OURS = Array.from({ length: N }, (_, i) => Math.max(4, Math.min(100, 100 - i * 0.5 * 0.9 + (i ? jitter(i + 9) : 0))))

export function Problem() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        gsap.set('.bar-ours', { scaleY: 1 })
        gsap.set('.bar-typ', { opacity: 0.5 })
        return
      }

      // Second line of the headline fills in as you scroll
      gsap.fromTo(
        '.fill-word',
        { color: 'rgba(34,28,28,0.25)' },
        { color: 'rgba(34,28,28,1)', stagger: 0.15, ease: 'none', scrollTrigger: { trigger: '.problem-head', start: 'top 75%', end: 'top 35%', scrub: 0.6 } },
      )

      gsap.from('.problem-side > *', {
        y: 18, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.problem-head', start: 'top 75%' },
      })

      // The chart story: the average reel draws in and drops off,
      // then the Main Stage reel rises and holds.
      const chartStory = (scrollTrigger: ScrollTrigger.Vars) =>
        gsap
          .timeline({ scrollTrigger })
          .fromTo('.bar-typ', { scaleY: 0 }, { scaleY: 1, duration: 0.6, stagger: 0.018, ease: 'power2.out' })
          .fromTo('.chart-marker', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0.5)
          .fromTo('.label-typ', { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.4 }, '-=0.3')
          .to('.bar-typ', { opacity: 0.5, duration: 0.5 }, '+=0.6')
          .fromTo('.bar-ours', { scaleY: 0 }, { scaleY: 1, duration: 0.6, stagger: 0.018, ease: 'power2.out' }, '<')
          .fromTo('.label-ours', { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.4 }, '-=0.3')
          .to({}, { duration: 0.6 }) // a beat to read the result before moving on

      const mm = gsap.matchMedia()
      // Desktop: the section holds still and your scroll drives the chart
      mm.add('(min-width: 768px)', () => {
        chartStory({ trigger: '.problem-pin', start: 'top top', end: '+=140%', pin: true, scrub: 0.8, anticipatePin: 1 })
      })
      // Phones: plays on its own once it's on screen
      mm.add('(max-width: 767px)', () => {
        chartStory({ trigger: '.chart', start: 'top 72%', toggleActions: 'play none none none' })
      })

      gsap.from('.pain', {
        y: 20, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: '.pains', start: 'top 85%' },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="problem" data-nav="light" className="bg-oat pb-[clamp(88px,13vh,170px)] text-ink">
      <div className="wrap">
        {/* Pinned on desktop: headline + chart fill one screen while the chart plays */}
        <div className="problem-pin flex flex-col justify-center pt-[clamp(88px,13vh,170px)] md:h-[100svh] md:pb-[4vh] md:pt-[96px]">
        {/* Headline + side note, DeepJudge-style */}
        <div className="problem-head grid gap-10 md:grid-cols-12 md:gap-6">
          <h2 className="font-serif text-[clamp(40px,4.8vw,76px)] font-normal leading-[1] tracking-[-0.035em] md:col-span-8">
            {problem.titleA}
            <br />
            {problem.titleB.split(' ').map((w, i) => (
              <span key={i} className="fill-word">{w}{' '}</span>
            ))}
          </h2>
          <div className="problem-side md:col-span-3 md:col-start-10 md:pt-3">
            <p className="meta mb-4 text-ink/60">{problem.label}</p>
            <p className="text-[17px] leading-[1.5] text-ink/75">{problem.body}</p>
          </div>
        </div>

        {/* Attention chart */}
        <div className="chart mt-[clamp(48px,7vh,90px)]">
          <p className="mb-5 font-serif text-[clamp(20px,1.7vw,26px)] tracking-[-0.02em]">{problem.chartLabel}</p>

          <div className="relative h-[clamp(200px,34vh,360px)] border-b border-ink/25">
            <div className="flex h-full items-end gap-[2px] md:gap-[4px]">
              {TYPICAL.map((typ, i) => (
                <div key={i} className="relative h-full flex-1">
                  {/* Main Stage behind, typical in front: the lavender above each dark bar is the attention we add */}
                  <span className="bar-ours absolute inset-x-0 bottom-0 origin-bottom scale-y-0 rounded-t-[2px] bg-lavender" style={{ height: `${OURS[i]}%` }} />
                  <span className="bar-typ absolute inset-x-0 bottom-0 origin-bottom rounded-t-[2px] bg-ink" style={{ height: `${typ}%` }} />
                </div>
              ))}
            </div>

            {/* 0:03 marker */}
            <div className="chart-marker pointer-events-none absolute inset-y-0" style={{ left: `${((MARK + 0.5) / N) * 100}%` }}>
              <span className="absolute inset-y-0 border-l border-dashed border-ink/50" />
              <span className="absolute left-2 top-[44%] whitespace-nowrap rounded-[4px] bg-oat px-2.5 py-1.5 text-[13px] text-ink ring-1 ring-ink/20 md:text-[14px]">
                <span className="meta mr-1.5 text-ink/55">0:03</span>
                {problem.marker}
              </span>
            </div>

            {/* direct labels at the end of each curve */}
            <span
              className="label-ours pointer-events-none absolute right-0 whitespace-nowrap rounded-[4px] bg-ink px-2.5 py-1.5 text-[13px] text-mist md:text-[14px]"
              style={{ bottom: `calc(${OURS[N - 1]}% + 10px)` }}
            >
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-lavender" />
              {problem.legendOurs}
            </span>
            <span
              className="label-typ pointer-events-none absolute right-0 whitespace-nowrap rounded-[4px] bg-oat px-2.5 py-1.5 text-[13px] text-ink ring-1 ring-ink/20 md:text-[14px]"
              style={{ bottom: `calc(${TYPICAL[N - 1]}% + 10px)` }}
            >
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-ink" />
              {problem.legendTypical}
            </span>
          </div>

          <div className="meta mt-2 flex justify-between text-ink/50">
            {['0:00', '0:05', '0:10', '0:15', '0:20', '0:25', '0:30'].map((t) => <span key={t}>{t}</span>)}
          </div>
        </div>
        </div>

        {/* Pain points */}
        <div className="pains mt-[clamp(56px,9vh,110px)] grid gap-8 md:grid-cols-3 md:gap-6">
          {problem.points.map((p, i) => (
            <div key={p.title} className="pain border-t border-ink/25 pt-4">
              <p className="meta mb-6 text-ink/50">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="font-serif text-[clamp(22px,1.9vw,28px)] leading-[1.1] tracking-[-0.02em]">{p.title}</h3>
              <p className="mt-3 max-w-[340px] text-[16px] leading-[1.5] text-ink/70">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
