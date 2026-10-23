import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/theme.css'
import { legal } from '../content/legal'
import { footer } from '../content/copy'
import { Logo } from '../components/ui/Logo'

/*
 * One layout for the three legal pages (terms.html, privacy.html,
 * refunds.html). Each page names its document on <body data-doc="…">.
 */
type Key = keyof typeof legal
const key = (document.body.dataset.doc ?? 'privacy') as Key
const doc = legal[key]
document.title = `${doc.title} | Main Stage`

function LegalPage() {
  return (
    <div className="min-h-screen bg-oat text-ink">
      <header className="wrap flex items-center justify-between py-6">
        <a href="/" aria-label="Main Stage home">
          <Logo className="h-[20px] w-auto text-ink" />
        </a>
        <a href="/" className="text-[14px] text-ink/60 transition-colors hover:text-ink">← Back to the site</a>
      </header>

      <main className="wrap pb-24 pt-[clamp(32px,8vh,96px)]">
        <article className="mx-auto max-w-[720px]">
          <p className="meta text-ink/50">Last updated {doc.updated}</p>
          <h1 className="mt-4 font-serif text-[clamp(40px,5vw,72px)] font-normal leading-[1] tracking-[-0.035em]">{doc.title}</h1>
          <p className="mt-8 text-[18px] leading-[1.6] text-ink/80">{doc.intro}</p>

          {doc.sections.map((s) => (
            <section key={s.heading} className="mt-12 border-t border-ink/10 pt-8">
              <h2 className="font-serif text-[clamp(24px,2.4vw,32px)] leading-[1.15] tracking-[-0.02em]">{s.heading}</h2>
              {s.body.map((p, i) => (
                <p key={i} className="mt-4 text-[16px] leading-[1.65] text-ink/75">{p}</p>
              ))}
            </section>
          ))}
        </article>
      </main>

      <footer className="border-t border-ink/10">
        <div className="wrap flex flex-wrap items-center justify-between gap-4 py-6 text-[13px] text-ink/50">
          <span>{footer.copyright}</span>
          <nav className="flex gap-6" aria-label="Legal">
            {footer.legal.map((l) => (
              <a key={l.label} href={l.href} className={`transition-colors hover:text-ink ${l.href.includes(key) ? 'text-ink' : ''}`}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LegalPage />
  </StrictMode>,
)
