import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { team } from '../content/copy'
import { prefersReducedMotion } from '../lib/smoothScroll'

/**
 * Cruise-style team row: centred headline, then the three of you as
 * cut-out photos standing on a thin "stage floor", cropped at the waist.
 * Photos should be PNGs with the background removed (set `photo` in copy.ts).
 */
export function Team() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('.team-copy > *', {
        y: 18, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.team-copy', start: 'top 80%' },
      })
      // People rise onto the stage, middle one last
      gsap.from('.member-body', {
        yPercent: 35, autoAlpha: 0, duration: 1.2, ease: 'power3.out', stagger: { each: 0.12, from: 'edges' },
        scrollTrigger: { trigger: '.team-row', start: 'top 85%' },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="team" data-nav="light" className="overflow-hidden bg-oat pt-[clamp(96px,14vh,180px)] text-ink">
      <div className="team-copy wrap flex flex-col items-center text-center">
        <p className="meta mb-5 text-ink/60">{team.label}</p>
        <h2 className="max-w-[760px] font-serif text-[clamp(40px,4.6vw,76px)] font-normal leading-[1] tracking-[-0.04em]">{team.title}</h2>
        <p className="mt-6 max-w-[520px] text-[17px] leading-[1.55] text-ink/70">{team.body}</p>
      </div>

      {/* The row of people, standing on the stage floor */}
      <div className="team-row relative mx-auto mt-[clamp(48px,8vh,96px)] flex h-[clamp(260px,44vh,500px)] max-w-[1100px] items-end justify-center border-b border-ink/25 px-3">
        {team.members.map((m, i) => {
          const middle = i === 1
          return (
            <figure
              key={i}
              className={`group relative flex h-full w-[clamp(120px,27vw,330px)] items-end justify-center ${middle ? 'z-10' : 'z-0 -mx-[3vw] md:-mx-6'}`}
            >
              <div className={`member-body flex w-full items-end justify-center ${middle ? 'h-full' : 'h-[90%]'}`}>
                {m.photo ? (
                  <img src={m.photo} alt={`${m.name}, ${m.role}`} className="h-full w-auto max-w-none object-contain object-bottom" />
                ) : (
                  <Silhouette />
                )}
              </div>
              <figcaption className="pointer-events-none absolute left-1/2 top-[2%] -translate-x-1/2 whitespace-nowrap rounded-[4px] bg-ink px-2.5 py-1.5 text-[12px] text-mist opacity-0 transition-opacity duration-300 group-hover:opacity-100 max-md:opacity-100">
                {m.name} <span className="text-mist/55">· {m.role}</span>
              </figcaption>
            </figure>
          )
        })}
      </div>
    </section>
  )
}

/** Neutral stand-in until real cut-out photos arrive. */
function Silhouette() {
  return (
    <svg viewBox="0 0 200 250" className="h-full w-auto" aria-hidden>
      {/* solid fill so overlapping shapes don't darken */}
      <g fill="#ddd2c6">
        <ellipse cx="100" cy="64" rx="34" ry="42" />
        <path d="M18 250 C20 192 48 160 84 152 L86 112 L114 112 L116 152 C152 160 180 192 182 250 Z" />
      </g>
    </svg>
  )
}
