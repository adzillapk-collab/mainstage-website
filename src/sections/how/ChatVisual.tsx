import { useEffect, useState, type ReactNode } from 'react'
import { LogoIcon } from '../../components/ui/Logo'
import { PlatformGlyph } from '../../components/ui/PlatformGlyph'
import { prefersReducedMotion } from '../../lib/smoothScroll'

/*
 * How it works as one short chat that grows with the active step
 * (0 record and send, 1 approve, 2 post): you send a video, we send back the
 * direction, you approve, the finished reel arrives.
 */
type Props = { step: number }
// Stills from a real job (Jimmy): his raw take, then frames from our edit
const STILLS = { raw: '/how/jimmy-raw.webp', direction: '/how/jimmy-direction.webp', final: '/how/jimmy-final.webp' }

/** True a moment after `on` turns true: for a second beat inside a step. */
function useLater(on: boolean, delay: number) {
  const [later, setLater] = useState(false)
  useEffect(() => {
    if (!on) {
      setLater(false)
      return
    }
    const t = setTimeout(() => setLater(true), prefersReducedMotion() ? 0 : delay)
    return () => clearTimeout(t)
  }, [on, delay])
  return later
}

const fade = (on: boolean) => `transition-all duration-500 ease-out ${on ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'}`

/* ------------------------------------------------------------------ */
/* C · The whole job is one short chat                                 */
/* ------------------------------------------------------------------ */
export function ChatVisual({ step }: Props) {
  // your approval follows a beat after our direction, and is always in before the finished reel
  const approved = useLater(step >= 1, 1100) || step >= 2
  const shown = (n: number) => step >= n

  return (
    // sized so the whole conversation fits, first message included
    <div className="flex h-full w-full items-center justify-center p-5 md:p-8">
      <div className="flex w-full max-w-[400px] flex-col gap-2.5">
        {/* you: the video and a few lines */}
        <Bubble mine show={shown(0)}>
          <span className="relative block aspect-video w-[150px] overflow-hidden rounded-[10px]">
            <img src={STILLS.raw} alt="" className="h-full w-full object-cover [filter:grayscale(1)_contrast(.85)_brightness(1.08)]" />
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-black/55 text-white">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z" /></svg>
              </span>
            </span>
          </span>
          <span className="mt-2 flex flex-col gap-1.5 px-1 pb-1">
            <span className="h-1.5 w-[85%] rounded-full bg-ink/25" />
            <span className="h-1.5 w-[60%] rounded-full bg-ink/15" />
          </span>
        </Bubble>

        {/* us: the direction, on your own video */}
        <Bubble show={shown(1)}>
          <span className="relative block aspect-[4/5] w-[96px] overflow-hidden rounded-[10px]">
            <img src={STILLS.direction} alt="" className="h-full w-full object-cover" />
            <span className="absolute inset-x-[10%] top-[10%] h-[14%] rounded-[5px] border-[1.5px] border-dashed border-lavender bg-lavender/15" />
            <span className="absolute inset-x-[12%] bottom-[10%] h-[10%] rounded-[5px] border-[1.5px] border-dashed border-mist/80 bg-black/15" />
          </span>
        </Bubble>

        {/* you: approved */}
        <Bubble mine show={approved}>
          <span className="flex items-center gap-2 px-1 text-[14px]">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-lavender">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>
            </span>
            <span className="h-1.5 w-16 rounded-full bg-ink/25" />
          </span>
        </Bubble>

        {/* us: the finished reel, ready to post */}
        <Bubble show={shown(2)} delay={350}>
          {/* the reel, with where it can go beside it */}
          <span className="flex items-end gap-3">
            <span className="relative block aspect-[9/16] w-[76px] overflow-hidden rounded-[10px]">
              <img src={STILLS.final} alt="" className="h-full w-full object-cover" />
            </span>
            <span className="grid grid-cols-2 gap-2 pb-1 pr-1 text-mist/75">
              {[0, 1, 2, 3].map((i) => <PlatformGlyph key={i} i={i} />)}
            </span>
          </span>
        </Bubble>
      </div>
    </div>
  )
}

function Bubble({ mine = false, show, delay = 0, children }: { mine?: boolean; show: boolean; delay?: number; children: ReactNode }) {
  return (
    <div className={`flex items-end gap-2 ${mine ? 'flex-row-reverse' : ''} ${fade(show)}`} style={{ transitionDelay: show ? `${delay}ms` : '0ms' }}>
      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${mine ? 'bg-mist/15 text-[10px] text-mist/70' : 'bg-lavender text-ink'}`}>
        {mine ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="9" r="3.5" /><path d="M5.5 19c1.2-3.2 3.6-4.8 6.5-4.8s5.3 1.6 6.5 4.8" /></svg>
        ) : (
          <LogoIcon className="h-3.5 w-auto" />
        )}
      </span>
      <div className={`rounded-[16px] p-2 ${mine ? 'rounded-br-[4px] bg-mist text-ink' : 'rounded-bl-[4px] bg-[#3a3131] text-mist'}`}>{children}</div>
    </div>
  )
}
