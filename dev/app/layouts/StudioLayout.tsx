import { Outlet, ScrollRestoration, useLocation, useNavigate } from 'react-router'
import { SiteHeader } from '../chrome/SiteHeader'

type Page = 'components' | 'foundations' | 'builder'

function pathToPage(pathname: string): Page {
  if (pathname.startsWith('/foundations')) return 'foundations'
  if (pathname.startsWith('/builder')) return 'builder'
  return 'components'
}

export function StudioLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const page = pathToPage(location.pathname)

  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteHeader
        page={page}
        onPageChange={(p) => navigate(`/${p}`)}
      />
      <Outlet />
      <ScrollRestoration />
    </div>
  )
}
