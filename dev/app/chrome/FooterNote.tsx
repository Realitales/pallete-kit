export function FooterNote() {
  return (
    <footer className="mt-32 border-t-2 border-fg pt-10 pb-12">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <p className="font-display text-fg text-2xl">
          palette<span className="acid-period">.</span>
        </p>
        <p className="tag text-muted-fg">
          Internal · Studio · v0.0.0
        </p>
      </div>
      <p className="text-muted-fg mt-6 max-w-md text-sm leading-relaxed">
        An internal React design system. Radix · Tailwind v4 · Framer Motion ·
        Sonner. Set in Bricolage Grotesque &amp; Azeret Mono.
      </p>
    </footer>
  )
}
