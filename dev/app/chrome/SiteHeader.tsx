import { MoonIcon, SunIcon } from 'lucide-react'
import { Button } from '@lib'
import { useTheme } from '../hooks/useTheme'

type Page = 'components' | 'foundations' | 'builder'

export function SiteHeader({
  page,
  onPageChange,
}: {
  page: Page
  onPageChange: (p: Page) => void
}) {
  const [theme, setTheme] = useTheme()
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            {/* 4-square paint-chip logo */}
            <div className="grid size-7 grid-cols-2 grid-rows-2 gap-px overflow-hidden rounded-[4px] bg-border">
              <div className="bg-fg" />
              <div className="bg-acid" />
              <div className="bg-muted-fg" />
              <div className="bg-border" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-lg font-semibold tracking-tight leading-none">
                palette<span className="acid-period">.</span>
              </span>
              <span className="tag text-muted-fg hidden sm:inline">v0.0.0</span>
            </div>
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            <PageNavLink
              active={page === 'components'}
              onClick={() => onPageChange('components')}
            >
              Components
            </PageNavLink>
            <PageNavLink
              active={page === 'foundations'}
              onClick={() => onPageChange('foundations')}
            >
              Foundations
            </PageNavLink>
            <PageNavLink
              active={page === 'builder'}
              onClick={() => onPageChange('builder')}
            >
              Builder
            </PageNavLink>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <span className="acid-dot inline-block size-1.5 rounded-full bg-acid" />
            <span className="tag text-muted-fg">Studio · live</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </Button>
        </div>
      </div>
    </header>
  )
}

function PageNavLink({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      data-active={active}
      className="text-muted-fg hover:text-fg data-[active=true]:text-fg relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
    >
      {children}
      {active && (
        <span className="absolute inset-x-3 -bottom-3 h-[2px] bg-acid" />
      )}
    </button>
  )
}
