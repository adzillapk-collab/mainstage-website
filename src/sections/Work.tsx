import { useEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { work } from '../content/copy'
import { LeadButton } from '../components/LeadForm'
import { hasPortfolio, media, portfolioUrl, type PortfolioReel } from '../content/media'
import { prefersReducedMotion, setScrollLocked } from '../lib/smoothScroll'

// Sample frames, shown until the portfolio videos are hooked up (MEDIA_BASE in content/media.ts)
const PHOTOS = [media.speakers.founder, media.speakers.coach, media.speakers.podcast, media.speakers.creator, media.speakers.warm]

type Style = 'simple' | 'complex'
type Reel = (typeof work.reels)[number]
type Item = { reel: Reel; src: string; style: Style; shape: 'wide' | 'tall'; video?: string; full?: string; fullLength?: string; name?: string }

// The real portfolio from the bucket; otherwise sample cards, simple and complex mixed (s / c)
const ORDER = 'scsscccssc'
const ITEMS: Item[] = hasPortfolio
  ? media.portfolio.map((p: PortfolioReel, i) => ({
      reel: work.reels[i % work.reels.length],
      name: p.name,
      src: portfolioUrl(p.file, 'webp'),
      video: portfolioUrl(p.file, 'mp4'),
      full: p.full ? portfolioUrl(p.full, 'mp4') : undefined,
      fullLength: p.fullLength,
      shape: p.shape,
      style: p.style,
    }))
  : ORDER.split('').map((code, i) => ({
      reel: work.reels[i % work.reels.length],
      src: PHOTOS[(i * 2) % PHOTOS.length],
      shape: 'tall' as const,
      style: code === 'c' ? 'complex' : 'simple',
    }))

// Card sizes: a tall reel, or a wide one about as big on screen
const CARD = { tall: 'aspect-[9/16] w-[clamp(150px,13vw,200px)]', wide: 'aspect-video w-[clamp(260px,23vw,356px)]' }

// Each style gets its own folder colour, so you can tell them apart before reading the tab
const FOLDER: Record<Style, { body: string; text: string; dot: string }> = {
  simple: { body: '#221c1c', text: '#f4f2ef', dot: '#f4f2ef' },
  complex: { body: '#c5a8f9', text: '#221c1c', dot: '#221c1c' },
}
// One measurement drives the whole folder, so the border around the reel is even and the corners line up
const RIM = 6 // the folder's border around the reel
const RADIUS = 14 // the folder's corners; the reel's corners are RADIUS - RIM
const TAB_H = 26
const SLANT = 18 // how far the tab's sloped edge runs out to the right

/**
 * Our work: one never-ending row of reels, simple and complex edits mixed.
 * Every reel sits in a folder whose tab says which kind of edit it is.
 * Hovering pauses the row and plays the reel under your cursor; on touch
 * screens, a tap does the same.
 */
export function Work() {
  const root = useRef<HTMLElement>(null)
  const [hovered, setHovered] = useState<number | null>(null)
  const [held, setHeld] = useState<number | null>(null)
  const [watching, setWatching] = useState<Item | null>(null)
  const playingIndex = watching ? -1 : held ?? hovered
  const row = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const grabbing = useReelRow(row, track, playingIndex !== null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('.work-head > *', {
        y: 18, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.work-head', start: 'top 80%' },
      })
      gsap.from('.work-row', {
        y: 40, autoAlpha: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '.work-row', start: 'top 85%' },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="work" data-nav="light" className="overflow-hidden bg-oat py-[clamp(96px,14vh,180px)] max-md:py-16 text-ink">
      <div className="work-head wrap mx-auto max-w-[900px] text-center">
        <p className="meta mb-6 text-ink/60">{work.label}</p>
        <h2 className="font-serif text-[clamp(44px,5.6vw,96px)] font-normal leading-[1] tracking-[-0.04em]">{work.title}</h2>
        <p className="mx-auto mt-5 max-w-[460px] text-[17px] leading-[1.5] text-ink/70">{work.sub}</p>
      </div>

      {/* the row: the list twice over, so the loop never shows a seam. The top padding gives a lifted folder room, so its tab isn't clipped.
          It drifts on its own; grab it to move it around, or swipe sideways. touch-action keeps up-down swipes scrolling the page. */}
      <div
        ref={row}
        className="work-row relative mt-[clamp(36px,6vh,72px)] touch-pan-y select-none pb-6 pt-3 [mask-image:linear-gradient(90deg,transparent,#000_5%,#000_95%,transparent)]"
        style={{ cursor: grabbing ? 'grabbing' : 'grab' }}
        onMouseLeave={() => {
          setHovered(null)
          setHeld(null)
        }}
      >
        <div ref={track} className="flex w-max items-end gap-[clamp(14px,1.4vw,24px)] pr-[clamp(14px,1.4vw,24px)] will-change-transform">
          {[...ITEMS, ...ITEMS].map((item, i) => (
            <Folder
              key={i}
              item={item}
              playing={playingIndex === i}
              onEnter={() => setHovered(i)}
              onTap={() => setHeld((h) => (h === i ? null : i))}
              onWatchFull={() => setWatching(item)}
              hiddenFromReaders={i >= ITEMS.length}
            />
          ))}
        </div>
      </div>

      <div className="mt-[clamp(48px,7vh,80px)] flex justify-center">
        <LeadButton source={`Our work · ${work.cta.label}`} className="btn btn-ink">{work.cta.label}</LeadButton>
      </div>

      {watching?.full && <FullPlayer src={watching.full} poster={watching.src} title={watching.name ?? ''} onClose={() => setWatching(null)} />}
    </section>
  )
}

// One full lap of the row, in seconds, when nobody is touching it
const LAP = 80

/**
 * The row's motion. It drifts left on its own (and stops while a reel is
 * playing). Grab it with the mouse or a finger to move it either way, and
 * let go to fling it; a sideways trackpad swipe or shift + scroll moves it
 * too. Up-down scrolling is left to the page. Returns whether it's grabbed.
 */
function useReelRow(row: RefObject<HTMLDivElement | null>, track: RefObject<HTMLDivElement | null>, paused: boolean) {
  const [grabbing, setGrabbing] = useState(false)
  const pausedRef = useRef(paused)
  pausedRef.current = paused

  useEffect(() => {
    const r = row.current
    const t = track.current
    if (!r || !t) return
    const still = prefersReducedMotion()
    let x = 0 // how far the row has moved (px, always between -half and 0)
    let v = 0 // fling speed after letting go (px/s)
    let half = t.scrollWidth / 2
    const ro = new ResizeObserver(() => (half = t.scrollWidth / 2))
    ro.observe(t)

    let drag: { id: number; startX: number; startPos: number; lastX: number; lastT: number } | null = null
    let moved = false // the press turned into a drag, so the click that ends it shouldn't count

    const tick = (_time: number, deltaMs: number) => {
      const dt = Math.min(deltaMs, 64) / 1000
      if (!drag) {
        if (Math.abs(v) > 5) {
          x += v * dt
          v *= Math.pow(0.05, dt) // the fling dies away in about a second
        } else {
          v = 0
          if (!pausedRef.current && !still) x -= (half / LAP) * dt
        }
      }
      if (half > 0) x = (((x % half) - half) % half) // wrap around, so the loop never ends
      t.style.transform = `translate3d(${x}px,0,0)`
    }
    gsap.ticker.add(tick)

    const down = (e: PointerEvent) => {
      if (e.button !== 0 || (e.target as HTMLElement).closest('button')) return
      drag = { id: e.pointerId, startX: e.clientX, startPos: x, lastX: e.clientX, lastT: performance.now() }
      moved = false
      v = 0
    }
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return
      const dx = e.clientX - drag.startX
      if (!moved && Math.abs(dx) > 6) {
        moved = true
        setGrabbing(true)
        r.setPointerCapture(e.pointerId)
      }
      if (!moved) return
      x = drag.startPos + dx
      const now = performance.now()
      const dt = (now - drag.lastT) / 1000
      if (dt > 0) v = v * 0.4 + ((e.clientX - drag.lastX) / dt) * 0.6
      drag.lastX = e.clientX
      drag.lastT = now
    }
    const up = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return
      if (!moved || performance.now() - drag.lastT > 90) v = 0 // held still before letting go: no fling
      drag = null
      setGrabbing(false)
      if (r.hasPointerCapture(e.pointerId)) r.releasePointerCapture(e.pointerId)
    }
    const swallowClick = (e: MouseEvent) => {
      if (!moved) return
      e.stopPropagation()
      e.preventDefault()
      moved = false
    }
    const wheel = (e: WheelEvent) => {
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0
      if (!dx) return // up-down scrolling belongs to the page
      e.preventDefault()
      e.stopPropagation()
      v = 0
      x -= dx
    }

    r.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    r.addEventListener('click', swallowClick, true)
    r.addEventListener('wheel', wheel, { passive: false })
    return () => {
      gsap.ticker.remove(tick)
      ro.disconnect()
      r.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      r.removeEventListener('click', swallowClick, true)
      r.removeEventListener('wheel', wheel)
    }
  }, [row, track])

  return grabbing
}

/** A folder with a reel inside. The tab names the kind of edit; nothing covers the reel itself. */
function Folder({ item, playing, onEnter, onTap, onWatchFull, hiddenFromReaders }: {
  item: Item
  playing: boolean
  onEnter: () => void
  onTap: () => void
  onWatchFull: () => void
  hiddenFromReaders: boolean
}) {
  const f = FOLDER[item.style]
  return (
    <div
      className="relative shrink-0 transition-transform duration-500 ease-out hover:-translate-y-1.5"
      style={{ paddingTop: TAB_H }}
      onMouseEnter={onEnter}
      // a tap holds a reel on touch screens; with a mouse, hovering is all it takes
      onPointerUp={(e) => e.pointerType !== 'mouse' && onTap()}
      aria-hidden={hiddenFromReaders || undefined}
      aria-label={hiddenFromReaders ? undefined : work[item.style].tag}
    >
      {/* the tab: square on the left, a sloped edge on the right that runs down into the folder */}
      <span
        className="absolute left-0 top-0 flex min-w-[40%] items-center gap-1.5 pl-2.5 pr-1 md:gap-2 md:pl-3 md:pr-1.5"
        style={{ height: TAB_H + 1, background: f.body, color: f.text, borderRadius: `${RADIUS - 6}px 0 0 0` }}
      >
        <span className="h-1.5 w-1.5 rounded-full opacity-70" style={{ background: f.dot }} />
        <span className="meta text-[9px] tracking-[0.06em] md:text-[10px] md:tracking-[0.08em]">{work[item.style].tag}</span>
        <svg
          className="absolute bottom-0"
          style={{ left: 'calc(100% - 1px)' }} // overlap by a pixel so no seam shows
          width={SLANT}
          height={TAB_H + 1}
          viewBox={`0 0 ${SLANT} ${TAB_H + 1}`}
          aria-hidden
        >
          {/* a straight slope, softened only slightly at the top and where it meets the folder */}
          <path
            d={`M0 0 H2 C4.5 0 5.6 1.2 6.4 3.4 L${SLANT - 5} ${TAB_H - 2.5} C${SLANT - 4} ${TAB_H} ${SLANT - 2} ${TAB_H + 1} ${SLANT} ${TAB_H + 1} H0 Z`}
            fill={f.body}
          />
        </svg>
      </span>

      {/* the folder: an even rim around the reel */}
      <div
        className="relative shadow-[0_20px_36px_-26px_rgba(34,28,28,.6)]"
        style={{ background: f.body, padding: RIM, borderRadius: `0 ${RADIUS}px ${RADIUS}px ${RADIUS}px` }}
      >
        <ReelCard item={item} playing={playing} onWatchFull={onWatchFull} />
      </div>
    </div>
  )
}

/** One reel. Simple edits stay clean; complex edits carry a graphic and a cut-in. Plays while hovered. */
function ReelCard({ item, playing, onWatchFull }: { item: Item; playing: boolean; onWatchFull: () => void }) {
  const { reel, src, style } = item
  const complex = style === 'complex'
  const [hit, setHit] = useState(-1)

  useEffect(() => {
    if (!playing) {
      setHit(-1)
      return
    }
    let i = -1
    setHit((i = 0))
    const id = setInterval(() => setHit((i = (i + 1) % reel.caption.length)), 550)
    return () => clearInterval(id)
  }, [playing, reel.caption.length])

  // A real reel: the video itself, nothing drawn on top
  if (item.video) return <VideoReel item={item} playing={playing} onWatchFull={onWatchFull} />

  return (
    <div className={`relative overflow-hidden bg-ink ${CARD[item.shape]}`} style={{ borderRadius: RADIUS - RIM }}>
      <img
        src={src}
        alt=""
        loading="lazy"
        className={`warm-photo absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out ${playing && complex ? 'scale-[1.08]' : 'scale-100'}`}
      />
      <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

      {/* progress, while playing */}
      <span className="absolute inset-x-2.5 top-2.5 h-[3px] overflow-hidden rounded-full bg-white/25">
        {playing && <span className="block h-full w-full origin-left rounded-full bg-white" style={{ animation: 'work-fill 3.2s linear both' }} />}
      </span>

      {/* title */}
      <span
        className={`absolute inset-x-[8%] top-[10%] rounded-[6px] px-2 py-1.5 text-center font-serif text-[clamp(12px,1vw,15px)] leading-[1.05] tracking-tight shadow-lg ${
          complex ? 'bg-ink text-mist' : 'bg-mist text-ink'
        }`}
      >
        {reel.title}
      </span>

      {complex && (
        <>
          {/* a supporting graphic and a cut-in, kept to the lower third so the face stays clear */}
          <span className="absolute right-[7%] top-[60%] w-[40%] rounded-[6px] bg-mist p-1.5 shadow-lg">
            <svg viewBox="0 0 100 44" className="block w-full">
              <line x1="16" y1="2" x2="16" y2="38" stroke="#221c1c" strokeOpacity=".4" strokeDasharray="2 2" />
              <polyline points="0,4 16,28 34,32 56,34 78,35 100,36" fill="none" stroke="#221c1c" strokeWidth="3" strokeLinejoin="round" />
              <line x1="0" y1="40" x2="100" y2="40" stroke="#221c1c" strokeOpacity=".25" />
            </svg>
          </span>
          <span className="absolute left-[7%] top-[58%] aspect-square w-[26%] overflow-hidden rounded-[6px] ring-2 ring-mist">
            <img src={PHOTOS[(PHOTOS.indexOf(src) + 2) % PHOTOS.length]} alt="" loading="lazy" className="warm-photo h-full w-full object-cover" />
          </span>
        </>
      )}

      {/* captions */}
      <span
        className={`absolute inset-x-2 bottom-[8%] flex flex-wrap justify-center gap-x-[4px] text-center font-semibold leading-tight text-white [text-shadow:0_1px_8px_rgba(0,0,0,.6)] ${
          complex ? 'text-[clamp(13px,1.1vw,16px)]' : 'text-[clamp(11px,0.9vw,13px)]'
        }`}
      >
        {reel.caption.map((w, i) => (
          <span key={i} className={`rounded px-[2px] ${i === hit || (!playing && i === 1) ? 'bg-lavender text-ink [text-shadow:none]' : ''}`}>
            {w}
          </span>
        ))}
      </span>
    </div>
  )
}

/**
 * A real reel. It plays muted while hovered (or tapped) and rewinds when
 * you move on. The speaker button turns the sound on. Long edits show a
 * highlight cut here and a button that opens the whole video.
 */
function VideoReel({ item, playing, onWatchFull }: { item: Item; playing: boolean; onWatchFull: () => void }) {
  const { video: src, src: poster } = item
  const ref = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  // the still sits over the video and only steps aside once frames are actually showing
  const [showing, setShowing] = useState(false)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (playing) {
      v.play().catch(() => {})
    } else {
      v.pause()
      v.currentTime = 0
      setMuted(true)
      setShowing(false)
    }
  }, [playing])

  return (
    <div className={`relative overflow-hidden bg-ink ${CARD[item.shape]}`} style={{ borderRadius: RADIUS - RIM }}>
      {/* nothing downloads until the reel is played; the still shows until then */}
      <video ref={ref} src={src} muted={muted} loop playsInline preload="none" onPlaying={() => setShowing(true)} className="absolute inset-0 h-full w-full object-cover" />
      {/* the still: back on top as soon as the reel stops */}
      <img src={poster} alt="" loading="lazy" className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${playing && showing ? 'opacity-0' : 'opacity-100'}`} />
      {item.full && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onWatchFull()
          }}
          onPointerUp={(e) => e.stopPropagation()}
          className="absolute bottom-2.5 left-2.5 flex cursor-pointer items-center gap-1.5 rounded-full bg-mist/95 py-1.5 pl-2 pr-3 text-[12px] font-medium text-ink shadow-[0_6px_16px_-8px_rgba(0,0,0,.6)] transition-colors hover:bg-white"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7 4l13 8-13 8z" /></svg>
          {work.fullLabel}
          {item.fullLength && <span className="text-ink/55">· {item.fullLength}</span>}
        </button>
      )}
      {playing && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setMuted((m) => !m)
          }}
          onPointerUp={(e) => e.stopPropagation()}
          aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
          className="absolute bottom-2.5 right-2.5 grid h-8 w-8 place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
            {muted ? <path d="M17 9l5 6M22 9l-5 6" /> : <path d="M17 9c1.3 1.6 1.3 4.4 0 6M19.5 6.5c2.7 3 2.7 8 0 11" />}
          </svg>
        </button>
      )}
    </div>
  )
}

/**
 * The whole video, over the page. The file only starts loading when this
 * opens; closing it (button, Esc or clicking outside) stops it.
 */
function FullPlayer({ src, poster, title, onClose }: { src: string; poster: string; title: string; onClose: () => void }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    setScrollLocked(true)
    ref.current?.play().catch(() => {})
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      setScrollLocked(false)
    }
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10" role="dialog" aria-modal="true" aria-label={title} data-lenis-prevent>
      <div className="absolute inset-0 bg-ink/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[min(1200px,calc((100svh-120px)*16/9))]">
        <div className="mb-3 flex items-center justify-between text-mist">
          <span className="meta text-mist/70">{title}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label={work.closeLabel}
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-mist/10 text-mist transition-colors hover:bg-mist/20"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 5l14 14M19 5L5 19" /></svg>
          </button>
        </div>
        <video ref={ref} src={src} poster={poster} controls playsInline preload="auto" className="aspect-video w-full rounded-[12px] bg-black" />
      </div>
    </div>,
    document.body,
  )
}
