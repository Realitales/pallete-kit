import { createBrowserRouter, redirect } from 'react-router'
import { DocsLayout } from './app/layouts/DocsLayout'
import { StudioLayout } from './app/layouts/StudioLayout'
import { ComponentsPage, FoundationsPage } from './App'
import { Builder } from './builder/Builder'

// Temporary BuilderPage — replaced with a proper one in Task 21 (Phase 4).
function BuilderPage() {
  return <Builder />
}

export const router = createBrowserRouter([
  {
    element: <DocsLayout />,
    children: [
      { index: true, loader: () => redirect('/components') },
      { path: '/components',  element: <ComponentsPage /> },
      { path: '/foundations', element: <FoundationsPage /> },
    ],
  },
  {
    element: <StudioLayout />,
    children: [
      { path: '/builder', element: <BuilderPage /> },
    ],
  },
])
