import { useEffect, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export type NavTheme = 'dark' | 'light'

/**
 * Sections declare data-nav="dark" | "light". The nav takes the theme of
 * whichever section sits under it, like the Amperos header.
 */
export function useNavTheme(): NavTheme {
  const [theme, setTheme] = useState<NavTheme>('dark')

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-nav]'))
    const triggers = sections.map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: 'top 36px',
        end: 'bottom 36px',
        onToggle: (self) => {
          if (self.isActive) setTheme((el.dataset.nav as NavTheme) ?? 'dark')
        },
      }),
    )
    return () => triggers.forEach((t) => t.kill())
  }, [])

  return theme
}
