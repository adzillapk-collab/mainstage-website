import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { media } from '../../content/media'
import { prefersReducedMotion } from '../../lib/smoothScroll'
import { ReelCard } from '../hero/Cards'
import { PlatformGlyph } from '../../components/ui/PlatformGlyph'

/** Replays its little animation every time it becomes the active step. */
function useStepAnim(active: boolean, build: (tl: gsap.core.Timeline, q: (s: string) => Element[]) => void) {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      if (!active || !ref.current) return
      const q = gsap.utils.selector(ref) as (s: string) => Element[]
      const tl = gsap.timeline()
      build(tl, q)
      if (prefersReducedMotion()) tl.progress(1)
    },
    { scope: ref, dependencies: [active], revertOnUpdate: true },
  )
  return ref
}

/* 01 · Your raw footage arrives */
export function FootageVisual({ active }: { active: boolean }) {
  const ref = useStepAnim(active, (tl, q) => {
    tl.from(q('.fv-card'), { y: 30, autoAlpha: 0, duration: 0.7, ease: 'power3.out' })
      .fromTo(q('.fv-bar'), { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: 'power1.inOut' }, 0.3)
      .from(q('.fv-done'), { autoAlpha: 0, y: 6, duration: 0.4 }, '>-0.1')
      .from(q('.fv-brief'), { autoAlpha: 0, y: 10, duration: 0.5, stagger: 0.12 }, '<0.1')
  })
  return (
    <div ref={ref} className="flex h-full w-full items-center justify-center p-6">
      <div className="fv-card w-full max-w-[420px] overflow-hidden rounded-[10px] bg-mist text-ink shadow-[0_30px_60px_-30px_rgba(0,0,0,.8)]">
        <div className="relative aspect-video">
          <img src={media.speakers.founder} alt="" className="h-full w-full object-cover object-[50%_18%] [filter:grayscale(1)_contrast(.85)_brightness(1.08)]" />
          <span className="meta absolute left-3 top-3 rounded bg-black/55 px-2 py-1 text-white/90">Raw footage</span>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between text-[14px]">
            <span>raw_take_03.mov</span>
            <span className="fv-done meta rounded bg-ink px-2 py-1 text-mist">Received ✓</span>
          </div>
          <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-ink/10">
            <div className="fv-bar h-full origin-left bg-lavender" />
          </div>
          <div className="mt-4 grid gap-2 text-[13px] text-ink/70">
            <p className="fv-brief"><span className="meta mr-2 text-ink/45">About</span>Why most hooks fail</p>
            <p className="fv-brief"><span className="meta mr-2 text-ink/45">For</span>Founders on LinkedIn</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* 02 · You approve the plan on your own video */
export function PlanVisual({ active }: { active: boolean }) {
  const ref = useStepAnim(active, (tl, q) => {
    tl.from(q('.pv-frame'), { y: 30, autoAlpha: 0, duration: 0.7, ease: 'power3.out' })
      .from(q('.pv-box'), { autoAlpha: 0, scale: 0.92, duration: 0.5, stagger: 0.35, ease: 'power3.out' }, 0.5)
      .to(q('.pv-btn'), { scale: 0.95, duration: 0.12, yoyo: true, repeat: 1 }, '+=0.5')
      .to(q('.pv-btn-idle'), { autoAlpha: 0, duration: 0.2 }, '<0.1')
      .fromTo(q('.pv-btn-done'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, '<')
  })
  return (
    <div ref={ref} className="flex h-full w-full items-center justify-center p-6">
      <div className="pv-frame flex flex-col items-center gap-4">
        <div className="relative aspect-[9/16] h-[min(52vh,440px)] overflow-hidden rounded-[12px] bg-ink-2 shadow-[0_30px_60px_-30px_rgba(0,0,0,.8)]">
          <img src={media.speakers.founder} alt="" className="warm-photo h-full w-full object-cover" />
          <div className="pv-box absolute inset-x-[8%] top-[7%] h-[16%] rounded-[6px] border-[1.5px] border-dashed border-lavender bg-lavender/15">
            <span className="meta absolute -top-[22px] left-0 rounded bg-lavender px-1.5 py-0.5 text-ink">Title</span>
          </div>
          <div className="pv-box absolute right-[8%] top-[42%] h-[13%] w-[44%] rounded-[6px] border-[1.5px] border-dashed border-lavender bg-lavender/15">
            <span className="meta absolute -top-[22px] left-0 rounded bg-lavender px-1.5 py-0.5 text-ink">Stat</span>
          </div>
          <div className="pv-box absolute inset-x-[10%] bottom-[9%] h-[9%] rounded-[6px] border-[1.5px] border-dashed border-mist/80 bg-black/15">
            <span className="meta absolute -top-[22px] left-0 rounded bg-mist px-1.5 py-0.5 text-ink">Captions</span>
          </div>
        </div>
        <span className="pv-btn relative inline-grid rounded-[6px] bg-mist px-4 py-2.5 text-[13px] uppercase tracking-[0.06em] text-ink">
          <span className="pv-btn-idle col-start-1 row-start-1">Approve plan</span>
          <span className="pv-btn-done col-start-1 row-start-1 text-center opacity-0">Approved ✓</span>
        </span>
      </div>
    </div>
  )
}

/* 03 · Your finished reel, ready for every platform */
export function PostVisual({ active }: { active: boolean }) {
  const ref = useStepAnim(active, (tl, q) => {
    tl.from(q('.po-reel'), { y: 30, autoAlpha: 0, duration: 0.7, ease: 'power3.out' })
      .fromTo(q('.reel-progress'), { scaleX: 0 }, { scaleX: 1, duration: 4, ease: 'none' }, 0.4)
      .from(q('.po-plat'), { autoAlpha: 0, y: 8, duration: 0.4, stagger: 0.12 }, 0.5)
      .from(q('.po-ready'), { autoAlpha: 0, y: 6, duration: 0.4 }, '>-0.1')
  })
  return (
    <div ref={ref} className="flex h-full w-full items-center justify-center p-6">
      <div className="flex flex-col items-center gap-5">
        <div className="po-reel w-[min(26vh,220px)]">
          <ReelCard src={media.speakers.founder} title="Why most hooks fail" caption={['nobody', 'watches', 'past', 'second', 'three']} hit={3} />
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {['Instagram', 'TikTok', 'YouTube', 'LinkedIn'].map((p, i) => (
            <span key={p} className="po-plat inline-flex items-center gap-1.5 rounded-full border border-mist/20 px-3 py-1.5 text-[12px] text-mist/85">
              <PlatformGlyph i={[0, 1, 2, 3][i]} /> {p}
            </span>
          ))}
        </div>
        <span className="po-ready meta inline-flex items-center gap-2 text-mist/70">
          <span className="h-1.5 w-1.5 rounded-full bg-lavender" /> Ready to post
        </span>
      </div>
    </div>
  )
}
