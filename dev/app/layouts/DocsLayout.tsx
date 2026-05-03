import { Outlet, ScrollRestoration, useLocation, useNavigate } from 'react-router'
import { SiteHeader } from '../chrome/SiteHeader'
// SidebarNav is still in App.tsx; we import it temporarily.
// Phase 6 / Task 30 moves it to dev/app/chrome/DocsSidebar.tsx.
import { SidebarNav as DocsSidebar } from '../../App'

type Page = 'components' | 'foundations' | 'builder'

function pathToPage(pathname: string): Page {
  if (pathname.startsWith('/foundations')) return 'foundations'
  if (pathname.startsWith('/builder')) return 'builder'
  return 'components'
}

export function DocsLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const page = pathToPage(location.pathname)
  const activeId = location.hash.slice(1) || (page === 'components' ? 'button' : 'overview')

  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteHeader
        page={page}
        onPageChange={(p) => navigate(`/${p}`)}
      />
      <div className="mx-auto flex max-w-screen-2xl">
        <DocsSidebar page={page} activeId={activeId} />
        <main className="min-w-0 flex-1 px-6 py-10 lg:px-12">
          <Outlet />
        </main>
      </div>
      <ScrollRestoration />
    </div>
  )
}
