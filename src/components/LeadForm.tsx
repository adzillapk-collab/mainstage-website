import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { lead } from '../content/copy'
import { setScrollLocked } from '../lib/smoothScroll'

/*
 * The sign-up pop-up every call-to-action opens: name, email and LinkedIn.
 * Any button can open it with <LeadButton source="…">; `source` says which
 * button it was (e.g. "Pricing · Standard edit") and is sent with the details.
 *
 * Where the details go: a Google Apps Script web app that adds a row to the
 * leads sheet and emails getmainstage@gmail.com (integrations/leads-to-google-sheet.gs).
 * Its URL goes in VITE_LEAD_ENDPOINT: in .env.local for the dev server, and in
 * Cloudflare Pages → Settings → Environment variables for the live site.
 * Without it, sending only works on the dev server, as a dry run.
 */
const ENDPOINT = (import.meta.env.VITE_LEAD_ENDPOINT as string | undefined) ?? ''
const OPEN = 'lead:open'

export function openLead(source: string) {
  window.dispatchEvent(new CustomEvent(OPEN, { detail: source }))
}

/** A button that opens the pop-up. Looks like whatever className says. */
export function LeadButton({ source, className = '', children }: { source: string; className?: string; children: ReactNode }) {
  return (
    <button type="button" className={className} onClick={() => openLead(source)}>
      {children}
    </button>
  )
}

type Fields = { name: string; email: string; linkedin: string }
type Errors = Partial<Record<keyof Fields, string>>
const EMPTY: Fields = { name: '', email: '', linkedin: '' }

// Accepts "linkedin.com/in/name", with or without https:// and www.
const LINKEDIN = /^(https?:\/\/)?([a-z]{2,3}\.)?linkedin\.com\/(in|pub)\/[^/\s?#]+\/?([?#].*)?$/i
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function check(f: Fields): Errors {
  const e: Errors = {}
  if (!f.name.trim()) e.name = lead.errName
  if (!EMAIL.test(f.email.trim())) e.email = lead.errEmail
  if (!LINKEDIN.test(f.linkedin.trim())) e.linkedin = lead.errLinkedin
  return e
}

const withHttps = (url: string) => (/^https?:\/\//i.test(url) ? url : `https://${url}`)

/** Mounted once in App; stays hidden until a LeadButton asks for it. */
export function LeadModal() {
  const [open, setOpen] = useState(false)
  const [source, setSource] = useState('')
  const [fields, setFields] = useState<Fields>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'failed'>('idle')
  const first = useRef<HTMLInputElement>(null)
  // hidden field only bots fill in; the sheet script ignores anything that has it
  const trap = useRef<HTMLInputElement>(null)
  const opener = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const onOpen = (e: Event) => {
      opener.current = document.activeElement as HTMLElement | null
      setSource((e as CustomEvent<string>).detail)
      setErrors({})
      setState((s) => (s === 'sending' ? s : 'idle'))
      setOpen(true)
    }
    window.addEventListener(OPEN, onOpen)
    return () => window.removeEventListener(OPEN, onOpen)
  }, [])

  const close = () => setOpen(false)

  useEffect(() => {
    if (!open) return
    setScrollLocked(true)
    const t = setTimeout(() => first.current?.focus(), 50)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', onKey)
      setScrollLocked(false)
      opener.current?.focus()
    }
  }, [open])

  const set = (k: keyof Fields) => (e: ChangeEvent<HTMLInputElement>) => {
    setFields((f) => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const found = check(fields)
    setErrors(found)
    if (Object.keys(found).length) return
    setState('sending')
    const payload = {
      name: fields.name.trim(),
      email: fields.email.trim(),
      linkedin: withHttps(fields.linkedin.trim()),
      source,
      page: window.location.href,
      website: trap.current?.value ?? '',
    }
    try {
      if (ENDPOINT) {
        // sent as plain text: Apps Script can't answer the extra check browsers
        // make before a JSON post, and it reads the body the same either way
        const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) })
        const out = await res.json().catch(() => ({ ok: false }))
        if (!res.ok || !out.ok) throw new Error(out.error ?? String(res.status))
      } else if (import.meta.env.DEV) {
        console.info('[lead] no VITE_LEAD_ENDPOINT set, dry run:', payload)
      } else {
        throw new Error('No lead endpoint configured')
      }
      setState('done')
      setFields(EMPTY)
    } catch {
      setState('failed')
    }
  }

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-end justify-center p-3 transition-opacity duration-300 sm:items-center sm:p-6 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      aria-hidden={!open}
    >
      {/* backdrop: click to close */}
      <div className="absolute inset-0 bg-ink/55 backdrop-blur-[2px]" onClick={close} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-title"
        data-lenis-prevent
        className={`relative max-h-[calc(100svh-24px)] w-full max-w-[440px] overflow-y-auto rounded-[14px] bg-oat p-6 text-ink shadow-[0_30px_80px_-30px_rgba(34,28,28,.6)] transition-transform duration-300 ease-out md:p-8 ${open ? 'translate-y-0' : 'translate-y-3'}`}
      >
        <button
          type="button"
          onClick={close}
          aria-label={lead.close}
          className="absolute right-3 top-3 grid h-9 w-9 cursor-pointer place-items-center rounded-full text-ink/60 transition-colors hover:bg-ink/[0.06] hover:text-ink"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 5l14 14M19 5L5 19" /></svg>
        </button>

        {state === 'done' ? (
          <div className="py-4">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-lavender">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>
            </span>
            <h2 id="lead-title" className="mt-5 font-serif text-[30px] leading-[1.05] tracking-[-0.02em]">{lead.doneTitle}</h2>
            <p className="mt-3 text-[15px] leading-[1.5] text-ink/70">{lead.doneBody}</p>
            <button type="button" onClick={close} className="btn btn-ink mt-7">{lead.close}</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <h2 id="lead-title" className="pr-8 font-serif text-[clamp(26px,3vw,32px)] leading-[1.05] tracking-[-0.02em]">{lead.title}</h2>
            <p className="mt-3 text-[15px] leading-[1.5] text-ink/70">{lead.sub}</p>

            <input ref={trap} type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-px w-px opacity-0" />

            <div className="mt-6 space-y-4">
              <Field label={lead.nameLabel} error={errors.name}>
                <input ref={first} type="text" name="name" autoComplete="name" value={fields.name} onChange={set('name')} className={input(errors.name)} />
              </Field>
              <Field label={lead.emailLabel} error={errors.email}>
                <input type="email" name="email" autoComplete="email" inputMode="email" value={fields.email} onChange={set('email')} className={input(errors.email)} />
              </Field>
              <Field label={lead.linkedinLabel} error={errors.linkedin}>
                <input type="url" name="linkedin" inputMode="url" placeholder={lead.linkedinHint} value={fields.linkedin} onChange={set('linkedin')} className={input(errors.linkedin)} />
              </Field>
            </div>

            {state === 'failed' && <p className="mt-4 text-[14px] text-[#9b3b22]" role="alert">{lead.errSend}</p>}

            <button type="submit" disabled={state === 'sending'} className="btn btn-ink mt-6 w-full justify-center !py-3.5 disabled:cursor-wait disabled:opacity-70">
              {state === 'sending' ? lead.sending : lead.submit}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

const input = (error?: string) =>
  `mt-1.5 block w-full rounded-[8px] border bg-mist px-3.5 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-ink ${error ? 'border-[#c0573a]' : 'border-ink/15'}`

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-[13px] font-medium text-ink/75">{label}</span>
      {children}
      {error && <span className="mt-1.5 block text-[13px] text-[#9b3b22]">{error}</span>}
    </label>
  )
}
