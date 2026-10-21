import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '../../lib/smoothScroll'

type Props = {
  children: React.ReactNode
  className?: string
  delay?: number
  y?: number
  /** Animate direct children one after another instead of the wrapper */
  stagger?: number
  as?: 'div' | 'section' | 'li' | 'p'
}

/** Amperos-style blur + fade + rise as content enters the viewport. */
export function Reveal({ children, className, delay = 0, y = 24, stagger, as = 'div' }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!ref.current || prefersReducedMotion()) return
      const targets = stagger ? Array.from(ref.current.children) : ref.current
      gsap.fromTo(
        targets,
        { autoAlpha: 0, y, filter: 'blur(10px)' },
        {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1.1,
          ease: 'power3.out',
          delay,
          stagger: stagger ?? 0,
          scrollTrigger: { trigger: ref.current, start: 'top 85%' },
        },
      )
    },
    { scope: ref },
  )

  const Tag = as as 'div'
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
