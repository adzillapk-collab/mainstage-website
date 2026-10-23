import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { how } from '../content/copy'
import { prefersReducedMotion } from '../lib/smoothScroll'
import { ChatVisual } from './how/ChatVisual'

/**
 * DeepJudge-style numbered panel. On desktop the panel holds still and each
 * stretch of scrolling moves to the next step; phones get a simple stack.
 * The visual tells the whole job as one short chat that grows with each step.
 */
export function HowItWorks() {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)

  useGSAP(
    () => {
      gsap.from('.how-panel', {
        y: 40, autoAlpha: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '.how-panel', start: 'top 85%' },
      })
      const mm = gsap.matchMedia()
      // Phones don't pin, so the chat plays through by itself once it's in view
      // (otherwise only the first message shows and the rest of the box sits empty)
      mm.add('(max-width: 767px)', () => {
        if (prefersReducedMotion()) {
          setActive(how.steps.length - 1)
          return
        }
        // starts as soon as the chat box peeks in, with quick beats between messages
        // (your approval lands ~1.1s after our direction, just before the finished reel)
        const tl = gsap.timeline({ scrollTrigger: { trigger: '.how-chat', start: 'top 90%' } })
        for (let i = 1; i < how.steps.length; i++) tl.call(() => setActive(i), [], 0.2 + (i - 1) * 0.9)
      })
      if (prefersReducedMotion()) return

      mm.add('(min-width: 768px)', () => {
        gsap.timeline({
          scrollTrigger: {
            trigger: '.how-pin',
            start: 'top top',
            end: `+=${how.steps.length * 80}%`,
            pin: true,
            anticipatePin: 1,
            onUpdate: (self) => setActive(Math.min(how.steps.length - 1, Math.floor(self.progress * how.steps.length))),
          },
        })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="how" data-nav="light" className="bg-oat text-mist">
      <div className="how-pin flex flex-col justify-center px-3 pb-[clamp(48px,8vh,96px)] pt-[clamp(48px,8vh,96px)] md:h-[100svh] md:pb-[3vh] md:pt-[84px]">
        <div className="how-panel mx-auto w-full max-w-[86.815rem] rounded-[14px] bg-ink md:h-full">
          <div className="grid h-full gap-10 p-6 md:grid-cols-12 md:gap-8 md:p-12">
            {/* Left: headline + numbered steps */}
            <div className="flex flex-col md:col-span-5">
              <p className="meta mb-5 text-mist/55">{how.label}</p>
              <h2 className="font-serif text-[clamp(36px,3.8vw,60px)] font-normal leading-[1] tracking-[-0.035em] [text-wrap:balance]">
                {how.title.split(/(?<=\.)\s+/).map((line) => <span key={line} className="block">{line}</span>)}
              </h2>

              <ol className="mt-10 md:mt-auto">
                {how.steps.map((s, i) => {
                  const on = active === i
                  return (
                    <li key={s.title} className="border-t border-mist/15">
                      <button
                        type="button"
                        onClick={() => setActive(i)}
                        className="flex w-full items-baseline gap-5 py-4 text-left md:py-5"
                        aria-expanded={on}
                      >
                        <span className={`meta transition-colors duration-500 ${on ? 'text-lavender' : 'text-mist/40'}`}>{String(i + 1).padStart(2, '0')}</span>
                        <span className={`font-serif text-[clamp(22px,1.9vw,30px)] tracking-[-0.02em] transition-colors duration-500 max-md:text-mist ${on ? 'text-mist' : 'text-mist/40'}`}>{s.title}</span>
                      </button>
                      {/* body expands for the active step (always open on phones) */}
                      <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out max-md:grid-rows-[1fr] max-md:opacity-100 ${on ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                        <div className="min-h-0 overflow-hidden">
                          <p className="pb-5 pl-[38px] text-[15px] leading-[1.55] text-mist/70 md:text-[16px]">{s.body}</p>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ol>
              <p className="mt-6 text-[16px] leading-[1.5] text-mist/65 md:text-[17px]">{how.note}</p>
            </div>

            {/* Right: the chat, up to the active step */}
            <div className="how-chat relative min-h-[540px] overflow-hidden rounded-[10px] bg-ink-2 md:col-span-7 md:min-h-0" aria-hidden>
              <ChatVisual step={active} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
