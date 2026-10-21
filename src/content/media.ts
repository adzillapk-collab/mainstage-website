// Free-licence Unsplash photos, hotlinked for the draft.
// Swap any of these for your own photos later; nothing else needs to change.
const unsplash = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

export const media = {
  hero: [
    { src: unsplash('1600896997793-b8ed3459a17f', 2000), alt: 'Founder speaking to camera in a dark studio', focus: '50% 30%' },
    { src: unsplash('1758598306845-8630d064a244', 2000), alt: 'Coach recording a talking-head video', focus: '50% 30%' },
    { src: unsplash('1713947506048-80f76419b2fe', 2000), alt: 'Consultant speaking to camera at her desk', focus: '50% 35%' },
  ],
  speakers: {
    founder: unsplash('1720805752653-10ddccea4c94', 900),
    podcast: unsplash('1581368129682-e2d66324045b', 900),
    coach: unsplash('1623591668430-b47452b66dd6', 900),
    creator: unsplash('1672825464495-f08d8efb81ad', 900),
    warm: unsplash('1573496359142-b8d87734a5a2', 900),
  },
}
