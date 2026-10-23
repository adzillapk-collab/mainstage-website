import { useEffect, useRef } from 'react'
import type { Clip } from '../../content/media'
import { prefersReducedMotion } from '../../lib/smoothScroll'

/**
 * A short silent loop that only plays while you can see it. The video file
 * isn't fetched until the card first comes into view (the still frame shows
 * until then); off screen (slid out of the belt, or the hero scrolled away)
 * it pauses. If the browser won't autoplay (low power mode, reduced motion)
 * the still frame stays, so the card never looks empty.
 */
export function LoopVideo({ clip, className = '' }: { clip: Clip; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = ref.current
    if (!v || !clip.video || prefersReducedMotion()) return
    let loaded = false
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!loaded) {
            loaded = true
            v.src = clip.video!
          }
          v.play().catch(() => {})
        } else v.pause()
      },
      { rootMargin: '0px 80px' },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [clip.video])

  if (!clip.video) return <img src={clip.poster} alt="" loading="lazy" className={`h-full w-full object-cover ${className}`} />

  return (
    <video
      ref={ref}
      poster={clip.poster}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      aria-hidden
      className={`h-full w-full object-cover ${className}`}
    />
  )
}

/** A finished edit coming out of the stage, shaped like the clip itself. */
export function EditCard({ clip }: { clip: Clip }) {
  return (
    <div className={`relative overflow-hidden rounded-[14px] bg-ink shadow-[0_10px_28px_-12px_rgba(34,28,28,.2)] ${clip.shape === 'tall' ? 'aspect-[9/16]' : 'aspect-video'}`}>
      <LoopVideo clip={clip} />
    </div>
  )
}
