/** Simple marks for the platforms we export to. */
export function PlatformGlyph({ i }: { i: number }) {
  const common = 'h-[18px] w-[18px] shrink-0'
  switch (i) {
    case 0:
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
      )
    case 1:
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor"><path d="M14 3h3a4 4 0 0 0 4 4v3a7 7 0 0 1-4-1.3V15a6 6 0 1 1-6-6v3.2A2.8 2.8 0 1 0 14 15V3Z" /></svg>
      )
    case 2:
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="5" width="20" height="14" rx="4" /><path d="M10 9l5 3-5 3V9Z" fill="#23120b" /></svg>
      )
    case 3:
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="20" height="20" rx="4" /><path d="M7 10h2.5v7H7zM8.2 6.2a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8ZM11.5 10H14v1c.4-.7 1.3-1.2 2.4-1.2 2 0 2.6 1.3 2.6 3.2v4h-2.5v-3.6c0-.9-.2-1.6-1.1-1.6-1 0-1.4.7-1.4 1.7V17h-2.5v-7Z" fill="#23120b" /></svg>
      )
    case 4:
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><path d="M13.2 20v-6h2l.3-2.4h-2.3v-1.5c0-.7.2-1.1 1.2-1.1h1.2V6.9c-.6-.1-1.3-.1-1.9-.1-1.8 0-3 1.1-3 3.1v1.7H8.7V14h2v6h2.5Z" fill="#23120b" /></svg>
      )
    default:
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c3.3 0 5.5 2.3 5.5 5.6v2.3l1.6-.5c.5 0 .8.6.4 1l-1.8 1c.6 1.6 1.8 2.8 3.3 3.3-.3.8-1.5 1-2.6 1.2l-.4 1.1c-1-.2-2.2-.1-3.1.5-.8.5-1.6 1.1-2.9 1.1s-2.1-.6-2.9-1.1c-.9-.6-2.1-.7-3.1-.5l-.4-1.1c-1.1-.2-2.3-.4-2.6-1.2 1.5-.5 2.7-1.7 3.3-3.3l-1.8-1c-.4-.4-.1-1 .4-1l1.6.5V8.6C6.5 5.3 8.7 3 12 3Z" /></svg>
      )
  }
}
