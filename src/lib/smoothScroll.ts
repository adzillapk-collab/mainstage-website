import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

let lenis: Lenis | null = null

/** Holds the page still (e.g. while a pop-up is open) and lets it go again. */
export function setScrollLocked(locked: boolean) {
  if (locked) lenis?.stop()
  else lenis?.start()
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}

/** Lenis smooth scroll driven by GSAP's ticker so ScrollTrigger stays in sync. */
export function startSmoothScroll() {
  if (lenis || prefersReducedMotion()) return () => {}
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 })
  lenis.on('scroll', ScrollTrigger.update)
  const tick = (time: number) => lenis?.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  // Anchor links scroll smoothly through Lenis, offset for the fixed nav
  const onClick = (e: MouseEvent) => {
    const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null
    if (!a) return
    const id = a.getAttribute('href')
    if (!id || id === '#') return
    const el = document.querySelector(id)
    if (!el) return
    e.preventDefault()
    lenis?.scrollTo(el as HTMLElement, { offset: -72 })
  }
  document.addEventListener('click', onClick)

  return () => {
    document.removeEventListener('click', onClick)
    gsap.ticker.remove(tick)
    lenis?.destroy()
    lenis = null
  }
}
