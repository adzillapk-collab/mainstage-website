import { useState } from 'react'
import { nav } from '../content/copy'
import { Logo } from '../components/ui/Logo'

/** Floating charcoal nav bar, like DeepJudge. Same look on every section. */
export function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3 md:top-4">
      <div className="mx-auto max-w-[880px] rounded-[10px] bg-ink text-mist shadow-[0_12px_30px_-12px_rgba(34,28,28,.45)]">
        <div className="flex h-[48px] items-center justify-between pl-4 pr-[9px]">
          <a href="#top" aria-label="Main Stage home">
            <Logo className="h-[18px] w-auto" />
          </a>

          <nav className="hidden items-center gap-7 text-[13px] md:flex" aria-label="Main">
            {nav.links.map((l) => (
              <a key={l.href} href={l.href} className="text-mist/80 transition-colors hover:text-mist">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a href={nav.cta.href} className="btn btn-oat">{nav.cta.label}</a>
            <button
              className="grid h-9 w-9 place-items-center md:hidden"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              <span className="relative block h-3 w-5">
                <span className={`absolute left-0 h-[1.5px] w-5 bg-current transition-transform duration-300 ${open ? 'top-1.5 rotate-45' : 'top-0'}`} />
                <span className={`absolute left-0 h-[1.5px] w-5 bg-current transition-transform duration-300 ${open ? 'top-1.5 -rotate-45' : 'top-3'}`} />
              </span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`overflow-hidden transition-[max-height] duration-500 md:hidden ${open ? 'max-h-80' : 'max-h-0'}`}>
          <nav className="flex flex-col gap-1 px-4 pb-5 pt-1" aria-label="Mobile">
            {[...nav.links, nav.secondary].map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-2 font-serif text-2xl">
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
