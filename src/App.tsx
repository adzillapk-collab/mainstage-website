import { useEffect } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { startSmoothScroll } from './lib/smoothScroll'
import { Nav } from './sections/Nav'
import { Hero } from './sections/Hero'
import { AttentionScene } from './sections/attention/AttentionScene'
import { Problem } from './sections/Problem'
import { OurRule } from './sections/OurRule'
import { Benefits } from './sections/Benefits'
import { HowItWorks } from './sections/HowItWorks'
import { Work } from './sections/Work'
import { Audience } from './sections/Audience'
import { Pricing } from './sections/Pricing'
import { Team } from './sections/Team'
import { Faq } from './sections/Faq'
import { Closing } from './sections/Closing'
import { LeadModal } from './components/LeadForm'

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
        <AttentionScene />
        <OurRule />
        <Benefits />
        <HowItWorks />
        <Work />
        <Audience />
        <Pricing />
        <Faq />
        <Team />
      </main>
      <Closing />
      <LeadModal />
    </>
  )
}
