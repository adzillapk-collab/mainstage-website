import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { cta, footer } from '../content/copy'
import { LeadButton } from '../components/LeadForm'
import { Logo, LogoIcon } from '../components/ui/Logo'
import { prefersReducedMotion } from '../lib/smoothScroll'

/** Final call to action + footer, one charcoal block like DeepJudge's ending. */
export function Closing() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.to('.cta-icon', { rotate: 360, duration: 40, ease: 'none', repeat: -1 })
      gsap.from('.cta-copy > *', {
        y: 24, autoAlpha: 0, duration: 1, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.cta-copy', start: 'top 80%' },
      })
      gsap.from('.footer-mark', {
        yPercent: 40, autoAlpha: 0, duration: 1.4, ease: 'power3.out',
        scrollTrigger: { trigger: '.footer-mark', start: 'top 95%' },
      })
    },
    { scope: root },
  )

  return (
    <footer ref={root} id="book" data-nav="dark" className="relative overflow-hidden bg-ink text-mist">
      {/* ---------- CTA ---------- */}
      <div className="wrap relative py-[clamp(110px,18vh,220px)] max-md:py-20">
        {/* your icon, turning slowly and faintly in the background */}
        <LogoIcon className="cta-icon pointer-events-none absolute right-[-6%] top-1/2 w-[min(46vw,560px)] -translate-y-1/2 text-mist/[0.04] md:right-[2%]" />

        <div className="cta-copy relative max-w-[900px]">
          <h2 className="font-serif text-[clamp(48px,7vw,116px)] font-normal leading-[0.95] tracking-[-0.045em]">{cta.title}</h2>
          <p className="mt-7 max-w-[520px] text-[17px] leading-[1.5] text-mist/70 md:text-[19px]">{cta.sub}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <LeadButton source={`Closing · ${cta.primary.label}`} className="btn btn-oat !px-5 !py-3.5 !text-[13px]">{cta.primary.label}</LeadButton>
            <LeadButton source={`Closing · ${cta.secondary.label}`} className="btn btn-line !border-mist/30 !text-mist hover:!border-mist hover:!bg-mist/5">{cta.secondary.label}</LeadButton>
          </div>
        </div>
      </div>

      {/* ---------- Footer ---------- */}
      <div className="wrap border-t border-mist/15 pt-14">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-12 md:gap-6">
          <div className="col-span-2 md:col-span-5">
            <Logo className="h-[22px] w-auto" />
            <p className="mt-5 max-w-[340px] text-[15px] leading-[1.55] text-mist/60">{footer.tagline}</p>
          </div>
          <FooterCol title="Explore" links={footer.explore} className="md:col-span-2 md:col-start-8" />
          <FooterCol title="Contact" links={footer.contact} className="md:col-span-2 md:col-start-11" />
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-mist/10 py-6 text-[13px] text-mist/50">
          <span>{footer.copyright}</span>
          <div className="flex gap-6">
            {footer.legal.map((l) => (
              <a key={l.label} href={l.href} className="transition-colors hover:text-mist">{l.label}</a>
            ))}
          </div>
        </div>
      </div>

      {/* giant faint wordmark along the bottom edge */}
      <div className="footer-mark pointer-events-none -mb-[2.2vw] px-3 md:px-6" aria-hidden>
        <Logo className="h-auto w-full text-mist/[0.06]" title="" />
      </div>
    </footer>
  )
}

function FooterCol({ title, links, className = '' }: { title: string; links: { label: string; href: string }[]; className?: string }) {
  return (
    <div className={className}>
      <p className="meta mb-5 text-mist/45">{title}</p>
      <ul className="grid gap-3 text-[15px]">
        {links.map((l) => (
          <li key={l.label}>
            {/* outside links (Instagram, LinkedIn) open in a new tab so the site stays open */}
            <a
              href={l.href}
              {...(/^https?:/.test(l.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="text-mist/80 transition-colors hover:text-mist"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
