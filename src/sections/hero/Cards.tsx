/* The two "before / after" objects used in the hero visuals. */

type RawProps = { src: string; name: string; time: string; mumble: string; className?: string }

/** Unedited footage: flat, grey, landscape, full of ums. */
export function RawClip({ src, name, time, mumble, className = '' }: RawProps) {
  return (
    <div className={`overflow-hidden rounded-lg border border-cream/15 bg-[#3a2d27] shadow-[0_24px_50px_-20px_rgba(0,0,0,.8)] ${className}`}>
      <div className="relative aspect-video">
        <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover [filter:grayscale(.75)_contrast(.82)_brightness(1.08)]" />
        <div className="absolute inset-0 bg-[#9a8f88]/20" />
        <span className="absolute left-2 top-2 flex items-center gap-1 rounded bg-black/45 px-1.5 py-0.5 font-mono text-[9px] text-white/85">
          <span className="h-1.5 w-1.5 rounded-full bg-[#e0584a]" /> REC
        </span>
        <span className="absolute right-2 top-2 rounded bg-black/45 px-1.5 py-0.5 font-mono text-[9px] text-white/80">{time}</span>
        <span className="absolute bottom-2 left-2 rounded bg-black/45 px-1.5 py-0.5 text-[10px] italic text-white/75">{mumble}</span>
      </div>
      <div className="px-2.5 py-1.5 font-mono text-[10px] text-cream/50">{name}</div>
    </div>
  )
}

type ReelProps = { src: string; title: string; caption: string[]; hit: number; className?: string }

/** The finished reel: vertical, warm, titled and captioned. */
export function ReelCard({ src, title, caption, hit, className = '' }: ReelProps) {
  return (
    <div className={`relative aspect-[9/16] overflow-hidden rounded-[14px] border border-cream/20 bg-espresso shadow-[0_30px_60px_-20px_rgba(0,0,0,.85)] ${className}`}>
      <img src={src} alt="" className="warm-photo absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />
      {/* story-style progress */}
      <div className="absolute inset-x-2 top-2 h-[3px] overflow-hidden rounded-full bg-white/30">
        <div className="reel-progress h-full w-full origin-left rounded-full bg-white" />
      </div>
      {/* title card */}
      <div className="absolute inset-x-[9%] top-[9%] rounded-md bg-cream px-2 py-1.5 text-center font-serif text-[clamp(11px,1.2vw,15px)] leading-[1.05] tracking-tight text-espresso shadow-lg">
        {title}
      </div>
      {/* captions */}
      <div className="absolute inset-x-2 bottom-[10%] flex flex-wrap justify-center gap-x-[3px] text-center text-[clamp(10px,1vw,13px)] font-semibold leading-tight text-white [text-shadow:0_1px_8px_rgba(0,0,0,.6)]">
        {caption.map((w, i) => (
          <span key={i} className={i === hit ? 'rounded bg-lavender px-[2px] text-espresso' : ''}>{w}</span>
        ))}
      </div>
    </div>
  )
}
