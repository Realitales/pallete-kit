import { motion } from 'framer-motion'

export function DocsHero() {
  return (
    <motion.div
      className="mb-12 max-w-3xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="tag text-muted-fg mb-6 flex items-center gap-3">
        <span>Studio</span>
        <span className="bg-border h-px w-6" />
        <span>The library</span>
      </div>
      <h1
        className="font-display text-fg leading-[0.95] tracking-tight"
        style={{ fontSize: 'clamp(2.75rem, 6.5vw, 5.5rem)' }}
      >
        Components<span className="acid-period">.</span>
      </h1>
      <p className="text-muted-fg mt-6 max-w-xl text-base leading-relaxed">
        Fifty-three primitives built on{' '}
        <a
          className="text-fg underline underline-offset-4 decoration-acid decoration-2"
          href="https://radix-ui.com"
          target="_blank"
          rel="noreferrer"
        >
          Radix
        </a>{' '}
        and{' '}
        <a
          className="text-fg underline underline-offset-4 decoration-acid decoration-2"
          href="https://tailwindcss.com"
          target="_blank"
          rel="noreferrer"
        >
          Tailwind v4
        </a>
        . Themable through <code className="font-mono text-sm text-fg">@theme</code>,
        composable through <code className="font-mono text-sm text-fg">asChild</code> and{' '}
        <code className="font-mono text-sm text-fg">className</code>.
      </p>
    </motion.div>
  )
}
