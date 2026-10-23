/*
 * Copy editor: every piece of website text, laid out like a document.
 * Click any text to edit it. Changes save automatically to
 * src/content/copy.json, and the website updates on its own.
 * Dev only: open http://localhost:5173/copy.html while `npm run dev` runs.
 */
import '../styles/theme.css'

type Json = string | number | boolean | Json[] | { [k: string]: Json }
type Kind = 'text' | 'number' | 'lines' | 'words'
type Path = (string | number)[]

const SECTIONS: Record<string, { name: string; note?: string }> = {
  nav: { name: 'Navigation' },
  hero: { name: 'Hero' },
  problem: { name: 'The problem' },
  attention: { name: 'Attention' },
  rule: { name: 'Our rule', note: 'The decisions are sample examples. Edit them to match how you really work.' },
  benefits: { name: 'What changes' },
  how: { name: 'How it works' },
  work: { name: 'Our work' },
  audience: { name: 'Who it’s for' },
  pricing: { name: 'Pricing', note: 'The two plan descriptions and feature lists are drafts.' },
  trial: { name: 'Trial reel' },
  faq: { name: 'FAQ' },
  team: { name: 'The team', note: 'Add your names and roles. For photos, send cut-out pictures (background removed) and I’ll add them.' },
  cta: { name: 'Final call to action' },
  footer: { name: 'Footer', note: 'Contact links are placeholders.' },
  lead: { name: 'Sign-up pop-up', note: 'Opens from every button. All of this text is a draft written for you to replace.' },
}

const LABELS: Record<string, string> = {
  label: 'Small label',
  title: 'Headline',
  titleLine1: 'Headline · line 1',
  titleLine2: 'Headline · line 2',
  titleA: 'Headline · line 1',
  titleB: 'Headline · line 2 (fills in on scroll)',
  sub: 'Subheading',
  body: 'Body text',
  body2: 'Body text · second paragraph',
  q: 'Question',
  a: 'Answer',
  who: 'Who it’s for',
  length: 'Length',
  caption: 'Caption words',
  name: 'Name',
  role: 'Role',
  reels: 'Reels per month (pack size)',
  features: 'Features · one per line',
  cta: 'Button',
  perReel: 'After the per-reel price',
  perMonth: 'After the monthly total',
  total: 'Total label',
  reelsUnit: 'Word after the number of reels',
  saveWith: 'Savings nudge on the smallest pack ({amount}, {reels} fill in)',
  saving: 'Savings on bigger packs ({amount} fills in)',
  simplePrice: 'Standard edit price per month ($)',
  complexPrice: 'Premium edit price per month ($)',
  desc: 'Description',
  tagline: 'Tagline',
  copyright: 'Copyright line',
  note: 'Line under the steps',
  text: 'What it is',
  tag: 'Tag on each reel',
  keptLabel: 'Column title · kept',
  cutLabel: 'Column title · left out',
  yesIntro: 'Good fit · intro line',
  yes: 'Good fit · one per line',
  noIntro: 'Not a fit · intro line',
  no: 'Not a fit · one per line',
  nameLabel: 'Name field',
  emailLabel: 'Email field',
  linkedinLabel: 'LinkedIn field',
  linkedinHint: 'LinkedIn field · example shown inside',
  submit: 'Send button',
  sending: 'Send button · while sending',
  doneTitle: 'After sending · headline',
  doneBody: 'After sending · text',
  close: 'Close button',
  fullLabel: 'Button on long reels · opens the full video',
  closeLabel: 'Full video · close button (for screen readers)',
  errName: 'Error · no name',
  errEmail: 'Error · bad email',
  errLinkedin: 'Error · bad LinkedIn link',
  errSend: 'Error · sending failed',
}

const GROUPS: Record<string, string> = {
  links: 'Menu link',
  points: 'Point',
  steps: 'Step',
  reels: 'Reel',
  plans: 'Plan',
  packs: 'Pack',
  members: 'Person',
  items: 'Question',
  outcomes: 'Outcome',
  decisions: 'Decision',
  explore: 'Explore link',
  contact: 'Contact link',
  legal: 'Legal link',
  secondary: 'Extra link',
  primary: 'Main button',
  moreLink: 'Link',
}

const HIDDEN = new Set(['href', 'photo', 'popular', 'keep', 'key'])
const BIG = new Set(['title', 'titleA', 'titleB', 'titleLine1', 'titleLine2', 'q', 'name'])

let data: Record<string, Json> = {}
const root = document.getElementById('editor')!

/* ------------------------------ saving ------------------------------ */
let saveTimer = 0
function setStatus(text: string, tone: 'ok' | 'busy' | 'bad') {
  const el = document.getElementById('status')
  if (!el) return
  el.textContent = text
  el.className = `meta rounded-full px-3 py-1.5 ${tone === 'ok' ? 'bg-ink/[.06] text-ink/70' : tone === 'busy' ? 'bg-lavender/40 text-ink' : 'bg-[#e07a5f]/20 text-[#9b3b22]'}`
}
function scheduleSave() {
  setStatus('Saving…', 'busy')
  window.clearTimeout(saveTimer)
  saveTimer = window.setTimeout(async () => {
    try {
      const res = await fetch('/__copy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!res.ok) throw new Error(await res.text())
      setStatus('All changes saved · website updated', 'ok')
    } catch {
      setStatus('Couldn’t save. Is the dev server running?', 'bad')
    }
  }, 700)
}

function setAt(path: Path, value: Json) {
  let o: any = data
  for (let i = 0; i < path.length - 1; i++) o = o[path[i]]
  o[path[path.length - 1]] = value
}

/* ------------------------------ fields ------------------------------ */
function kindOf(key: string, value: Json): Kind {
  if (typeof value === 'number') return 'number'
  if (Array.isArray(value)) return key === 'caption' ? 'words' : 'lines'
  return 'text'
}
function toText(kind: Kind, value: Json) {
  if (kind === 'words') return (value as string[]).join(' ')
  if (kind === 'lines') return (value as string[]).join('\n')
  return String(value)
}

function field(label: string, path: Path, key: string, value: Json) {
  const kind = kindOf(key, value)
  const wrap = document.createElement('div')
  wrap.className = 'field grid gap-1.5 border-t border-ink/10 py-4 md:grid-cols-[180px_1fr] md:gap-6'

  const lab = document.createElement('div')
  lab.className = 'meta pt-1 text-ink/45'
  lab.textContent = label

  const box = document.createElement('div')
  box.setAttribute('contenteditable', 'plaintext-only')
  box.spellcheck = true
  box.className = `rounded-[6px] px-2 py-1 -mx-2 outline-none transition-colors hover:bg-white/50 focus:bg-white focus:shadow-[0_0_0_1px_rgba(34,28,28,.15)] whitespace-pre-wrap ${
    BIG.has(key) ? 'font-serif text-[clamp(20px,2vw,26px)] leading-[1.2] tracking-[-0.02em]' : 'text-[16px] leading-[1.6]'
  }`
  box.textContent = toText(kind, value)

  box.addEventListener('keydown', (e) => {
    // single-line fields: Enter finishes editing instead of adding a line
    if (e.key === 'Enter' && kind !== 'lines') {
      e.preventDefault()
      box.blur()
    }
  })
  box.addEventListener('input', () => {
    const raw = box.innerText.replace(/ /g, ' ')
    let next: Json
    if (kind === 'number') {
      const n = Number(raw.replace(/[$,\s]/g, ''))
      if (!Number.isFinite(n) || raw.trim() === '') {
        box.classList.add('!bg-[#e07a5f]/15')
        setStatus('Numbers only in this field', 'bad')
        return
      }
      box.classList.remove('!bg-[#e07a5f]/15')
      next = n
    } else if (kind === 'words') {
      next = raw.trim().split(/\s+/).filter(Boolean)
    } else if (kind === 'lines') {
      next = raw.split('\n').map((s) => s.trim()).filter(Boolean)
    } else {
      next = raw.replace(/\n+/g, ' ').trim()
    }
    setAt(path, next)
    scheduleSave()
  })

  wrap.append(lab, box)
  return wrap
}

/** Walks a section and renders an editable field for every piece of text. */
function renderNode(container: HTMLElement, value: Json, path: Path, key: string, labelHint?: string) {
  if (HIDDEN.has(key)) return
  if (Array.isArray(value) && value.length && typeof value[0] === 'object') {
    value.forEach((item, i) => {
      // simple links: just one line, no heading
      const visible = Object.keys(item as object).filter((k) => !HIDDEN.has(k))
      if (visible.length === 1 && visible[0] === 'label') {
        container.append(field(`${GROUPS[key] ?? key} ${i + 1}`, [...path, i, 'label'], 'label', (item as any).label))
        return
      }
      const group = document.createElement('div')
      group.className = 'mt-6'
      const h = document.createElement('p')
      h.className = 'meta mb-1 text-ink'
      h.textContent = `${GROUPS[key] ?? key} ${i + 1}`
      group.append(h)
      renderNode(group, item, [...path, i], '', `${GROUPS[key] ?? key} ${i + 1}`)
      container.append(group)
    })
    return
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const keys = Object.keys(value).filter((k) => !HIDDEN.has(k))
    // a link/button with only a label: one field named after the group
    if (keys.length === 1 && keys[0] === 'label') {
      container.append(field(labelHint ?? GROUPS[key] ?? key, [...path, 'label'], 'label', (value as any).label))
      return
    }
    for (const k of keys) {
      const v = (value as any)[k]
      const isLeaf = typeof v !== 'object' || (Array.isArray(v) && (v.length === 0 || typeof v[0] !== 'object'))
      if (isLeaf) {
        container.append(field(LABELS[k] ?? k, [...path, k], k, v))
      } else if (Array.isArray(v)) {
        renderNode(container, v, [...path, k], k)
      } else {
        const hint = key === 'nav' && k === 'cta' ? 'Nav button' : key === 'nav' && k === 'secondary' ? 'Mobile menu link' : key === 'cta' && k === 'secondary' ? 'Second button' : GROUPS[k] ?? k
        renderNode(container, v, [...path, k], k, hint)
      }
    }
    return
  }
  container.append(field(labelHint ?? LABELS[key] ?? key, path, key, value))
}

/* ------------------------------ page ------------------------------ */
function render() {
  const order = Object.keys(SECTIONS).filter((k) => k in data)
  root.innerHTML = `
    <div class="min-h-screen bg-oat text-ink">
      <header class="sticky top-0 z-20 border-b border-ink/10 bg-oat/90 backdrop-blur">
        <div class="mx-auto flex h-14 max-w-[1100px] items-center justify-between gap-4 px-5">
          <span class="font-serif text-[20px] tracking-[-0.02em]">Main Stage <span class="text-ink/45">· Website copy</span></span>
          <div class="flex items-center gap-3">
            <span id="status" class="meta rounded-full bg-ink/[.06] px-3 py-1.5 text-ink/70">Click any text to edit</span>
            <a href="/" target="_blank" class="btn btn-ink !py-2.5">Open website ↗</a>
          </div>
        </div>
      </header>
      <div class="mx-auto grid max-w-[1100px] gap-10 px-5 py-12 md:grid-cols-[180px_1fr]">
        <nav class="hidden md:block">
          <div class="sticky top-24 grid gap-2 text-[14px]">
            ${order.map((k) => `<a href="#s-${k}" class="text-ink/60 hover:text-ink">${SECTIONS[k].name}</a>`).join('')}
          </div>
        </nav>
        <main id="sections" class="grid gap-16"></main>
      </div>
    </div>`

  const sections = document.getElementById('sections')!
  const intro = document.createElement('p')
  intro.className = 'text-[15px] leading-[1.6] text-ink/60'
  intro.textContent = 'Every word on the website, in page order. Click any text to change it. Changes save automatically and the website updates on its own.'
  sections.append(intro)

  for (const k of order) {
    const sec = document.createElement('section')
    sec.id = `s-${k}`
    sec.className = 'scroll-mt-24'
    const h = document.createElement('h2')
    h.className = 'font-serif text-[clamp(30px,3.2vw,44px)] leading-none tracking-[-0.03em]'
    h.textContent = SECTIONS[k].name
    sec.append(h)
    if (SECTIONS[k].note) {
      const n = document.createElement('p')
      n.className = 'mt-3 inline-block rounded-[6px] bg-lavender/35 px-3 py-1.5 text-[13px] text-ink/80'
      n.textContent = SECTIONS[k].note!
      sec.append(n)
    }
    const body = document.createElement('div')
    body.className = 'mt-6'
    renderNode(body, data[k], [k], k)
    sec.append(body)
    sections.append(sec)
  }
}

fetch('/__copy')
  .then((r) => r.json())
  .then((json) => {
    data = json
    render()
  })
  .catch(() => {
    root.innerHTML = '<p style="padding:40px;font-family:sans-serif">Couldn’t load the copy. Start the dev server (npm run dev) and open this page from http://localhost:5173/copy.html</p>'
  })
