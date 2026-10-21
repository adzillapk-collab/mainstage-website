import { useEffect } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { startSmoothScroll } from './lib/smoothScroll'
import { Nav } from './sections/Nav'
import { Hero } from './sections/Hero'
import { Problem } from './sections/Problem'
import { HowItWorks } from './sections/HowItWorks'
import { Work } from './sections/Work'
import { Pricing } from './sections/Pricing'
import { Team } from './sections/Team'
import { Faq } from './sections/Faq'
import { Closing } from './sections/Closing'

export default function App() {
  useEffect(() => {
    const stop = startSmoothScroll()
    // Recalculate trigger positions once fonts and images have settled
    const refresh = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh)
    window.addEventListener('load', refresh)
    return () => {
      stop()
      window.removeEventListener('load', refresh)
    }
  }, [])

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Work />
        <Pricing />
        <Team />
        <Faq />
      </main>
      <Closing />
    </>
  )
}
