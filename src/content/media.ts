// Free-licence Unsplash photos, hotlinked for the draft.
// Swap any of these for your own photos later; nothing else needs to change.
const unsplash = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

// A clip is a short silent loop in /public/hero plus a still of its first frame.
export type Clip = { video: string; poster: string; shape: 'wide' | 'tall' }
const clip = (name: string, shape: Clip['shape']): Clip => ({ video: `/hero/${name}.mp4`, poster: `/hero/${name}.webp`, shape })

// Where the portfolio videos live: the R2 bucket's public address, e.g.
// https://media.yourdomain.com/ (set VITE_MEDIA_BASE in .env.local before
// building). Without it, Our work shows sample cards instead.
export const MEDIA_BASE = ((import.meta.env.VITE_MEDIA_BASE as string | undefined) ?? '').replace(/\/?$/, '/')
export const hasPortfolio = MEDIA_BASE !== '/'

export type PortfolioReel = {
  name: string
  file: string
  shape: 'wide' | 'tall'
  style: 'simple' | 'complex'
  full?: string
  fullLength?: string
}
export const portfolioUrl = (file: string, ext: 'mp4' | 'webp') => `${MEDIA_BASE}${encodeURIComponent(file)}.${ext}`

const speakers = {
  founder: unsplash('1720805752653-10ddccea4c94', 900),
  podcast: unsplash('1581368129682-e2d66324045b', 900),
  coach: unsplash('1623591668430-b47452b66dd6', 900),
  creator: unsplash('1672825464495-f08d8efb81ad', 900),
  warm: unsplash('1573496359142-b8d87734a5a2', 900),
}

export const media = {
  // sample photos for Our work, only used when no portfolio is set up (VITE_MEDIA_BASE empty)
  speakers,
  // Hero belts: one slot per client. Their raw footage runs into the stage on
  // the left; their finished edit comes out on the right. shape: 'wide' for
  // 16:9 edits, 'tall' for 9:16 reels; each card takes its clip's shape.
  // Wide and tall edits alternate.
  heroClients: [
    { name: 'Jimmy', raw: clip('jimmy-before', 'wide'), edit: clip('jimmy-after', 'wide') },
    { name: 'Creator Comeup', raw: clip('creator-before', 'wide'), edit: clip('creator-after', 'tall') },
    { name: 'Speaking coach', raw: clip('coach-before', 'wide'), edit: clip('coach-after', 'wide') },
    { name: 'Aliefiya', raw: clip('aliefiya-before', 'wide'), edit: clip('aliefiya-after', 'tall') },
    { name: 'VSLs are dead', raw: clip('vsl-before', 'wide'), edit: clip('vsl-after', 'wide') },
    { name: 'Airbnb', raw: clip('airbnb-before', 'wide'), edit: clip('airbnb-after', 'tall') },
  ],
  // Our work: the portfolio, in carousel order. The files live in the R2 bucket
  // (see MEDIA_BASE below); each has a still of the same name (.webp).
  // shape: 'wide' 16:9 or 'tall' 9:16 · style: which folder tab it gets.
  // `full`: for long edits, the card plays a highlight cut and a button opens
  // the whole video, which only loads when someone asks for it.
  portfolio: [
    { name: 'Creator Comeup', file: 'creator-comeup', shape: 'tall', style: 'simple' },
    { name: 'Jimmy Lai', file: 'jimmy-highlight', full: 'jimmy-full', fullLength: '13 min', shape: 'wide', style: 'complex' },
    { name: 'Airbnb', file: 'airbnb', shape: 'tall', style: 'complex' },
    { name: 'Speaking coach', file: 'speaking-coach', shape: 'wide', style: 'complex' },
    { name: 'Aliefiya', file: 'aliefiya-quiz', shape: 'tall', style: 'simple' },
    { name: 'VSLs are dead', file: 'vsls-are-dead', shape: 'wide', style: 'complex' },
    { name: 'Traffic', file: 'alefiya-traffic', shape: 'wide', style: 'complex' },
    { name: 'Jacob Hill', file: 'jacob-hill', shape: 'wide', style: 'complex' },
  ] as PortfolioReel[],
}
