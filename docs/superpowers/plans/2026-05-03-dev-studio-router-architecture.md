# Dev Studio: React Router + Architecture Restructure — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Decompose the 2023-line `dev/App.tsx` into a routed studio (`dev/{app,pages,shared}`) backed by react-router v7, with URL-as-truth for active item, two layouts replacing page-state branching, and a Context-backed theme provider.

**Architecture:** Three top-level folders in `dev/`: `app/` for cross-cutting (providers, layouts, chrome, hooks), `pages/` for per-route folders (`components/`, `foundations/`, `builder/`), and `shared/` for pure types. Single `router.tsx` mirrors `pages/`. Hash-based deep links, `replaceState`-driven scroll spy, `<ScrollRestoration/>` for cross-route. Builder folder moves intact; its internals don't change.

**Tech Stack:** React 19, Vite 6, TypeScript 5.6, react-router v7 (library mode, `createBrowserRouter`), Tailwind v4, Framer Motion 11.

**Spec:** `docs/superpowers/specs/2026-05-03-dev-studio-router-architecture-design.md`

**Verification model:** No test infra exists (explicit YAGNI). Each task verifies via:
- `bun run typecheck` — must pass with zero errors
- `bun dev` — smoke-test the affected page in the browser; check console for errors

Run dev server in a separate terminal at the start; leave it running across tasks.

**Package manager:** This project uses `bun` (see `bun.lock`). Never run `npm` commands — they create competing lockfiles and inconsistent installs.

**Commit discipline:** every task ends with a commit. Use Conventional Commits: `refactor:`, `feat:`, `chore:`. Branch from `main` (or current working branch); single feature branch is fine for the whole plan.

**Reference line numbers** below refer to `dev/App.tsx` at the start of the migration. After each move, the line numbers shift — work top-down within each phase, or re-grep before extracting.

---

## File Structure (post-migration)

```
dev/
  main.tsx                              # 10 lines: providers + router mount
  router.tsx                            # createBrowserRouter() — the route tree
  studio.css                            # was sandbox.css

  app/
    Providers.tsx
    layouts/
      DocsLayout.tsx
      StudioLayout.tsx
    chrome/
      SiteHeader.tsx
      DocsSidebar.tsx
      FoundationsSidebar.tsx
      FooterNote.tsx
      DocsHero.tsx
    hooks/
      useTheme.ts                       # Context-backed
      useHashSpy.ts
      useHashScrollOnMount.ts

  pages/
    components/
      ComponentsPage.tsx
      ComponentEntry.tsx
      ComponentPreview.tsx
      registry.ts
      groups/
        forms.tsx
        display.tsx
        navigation.tsx
        overlay.tsx
        disclosure.tsx
        data.tsx
        command.tsx

    foundations/
      FoundationsPage.tsx
      FoundationSection.tsx
      sections/
        Overview.tsx
        Colors.tsx
        Typography.tsx
        Spacing.tsx
        Radius.tsx
        Shadows.tsx
        Iconography.tsx

    builder/                            # moved from dev/builder/
      BuilderPage.tsx
      Builder.tsx
      Canvas.tsx
      Inspector.tsx
      Palette.tsx
      PlacedNode.tsx
      blocks.tsx
      store.ts
      ViewportToggle.tsx
      DeviceFrame.tsx

  shared/
    types.ts

REMOVED:
  dev/App.tsx
  dev/sandbox.css                       # renamed to dev/studio.css
  dev/builder/                          # contents moved to dev/pages/builder/
```

---

# PHASE 1 — Router scaffolding + path alias (no behavior change)

This phase lands `react-router` and the `@lib` alias without changing studio behavior. App.tsx remains the source of truth at the end of the phase; the router is a no-op wrapper.

---

### Task 1: Install react-router

**Files:**
- Modify: `package.json` (deps), `package-lock.json` (auto)

- [ ] **Step 1: Install**

```bash
bun add react-router@^7
```

- [ ] **Step 2: Verify version**

```bash
bun pm ls react-router
```

Expected: shows `react-router@7.x.x` (latest minor).

- [ ] **Step 3: Commit**

```bash
git add package.json bun.lock
git commit -m "chore: add react-router@^7"
```

---

### Task 2: Add @lib path alias to vite.config.ts

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1: Edit vite.config.ts** — add `resolve.alias` block

After the existing `plugins: [...]` block and before `build: {...}`, add:

```ts
resolve: {
  alias: {
    '@lib': resolve(__dirname, 'src'),
  },
},
```

The full top of the file should now look like:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dts from "vite-plugin-dts";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      include: ["src"],
      exclude: ["dev", "**/*.test.*", "**/*.stories.*"],
      tsconfigPath: "./tsconfig.build.json",
      rollupTypes: true,
    }),
  ],
  resolve: {
    alias: {
      '@lib': resolve(__dirname, 'src'),
    },
  },
  build: { /* unchanged */ },
  server: { /* unchanged */ },
});
```

- [ ] **Step 2: Verify dev server still starts**

In a separate terminal:

```bash
bun dev
```

Expected: Vite starts, no errors. Open the URL it prints; studio loads as before.

- [ ] **Step 3: Commit**

```bash
git add vite.config.ts
git commit -m "chore(dev): add @lib path alias in vite config"
```

---

### Task 3: Add @lib path alias to tsconfig.json and tsconfig.build.json

**Files:**
- Modify: `tsconfig.json`, `tsconfig.build.json`

- [ ] **Step 1: Edit tsconfig.json** — add `baseUrl` and `paths` to `compilerOptions`

```jsonc
{
  "compilerOptions": {
    // ... existing options ...
    "baseUrl": ".",
    "paths": {
      "@lib": ["src/index.ts"],
      "@lib/*": ["src/*"]
    }
  }
  // ... rest unchanged ...
}
```

- [ ] **Step 2: Edit tsconfig.build.json** — same `paths` config

If `tsconfig.build.json` extends `tsconfig.json`, the paths inherit. Verify by reading the file. If it does NOT extend, add the same `baseUrl` + `paths` block.

- [ ] **Step 3: Verify typecheck passes**

```bash
bun run typecheck
```

Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add tsconfig.json tsconfig.build.json
git commit -m "chore(dev): add @lib path alias in tsconfig"
```

---

### Task 4: Sweep existing library imports to use @lib

**Files:**
- Modify: `dev/main.tsx`, `dev/builder/Canvas.tsx`, `dev/builder/Inspector.tsx`, `dev/builder/blocks.tsx`, `dev/App.tsx`

- [ ] **Step 1: Update dev/main.tsx**

Change line 4 from:
```ts
import '../src/styles/index.css'
```
to:
```ts
import '@lib/styles/index.css'
```

- [ ] **Step 2: Update dev/builder/Canvas.tsx**

Change line 3 from:
```ts
import { Button } from '../../src'
```
to:
```ts
import { Button } from '@lib'
```

- [ ] **Step 3: Update dev/builder/Inspector.tsx**

The import block ends at line 13 with `} from '../../src'`. Change to `} from '@lib'`.

- [ ] **Step 4: Update dev/builder/blocks.tsx**

The import block ends at line 25 with `} from '../../src'`. Change to `} from '@lib'`.

- [ ] **Step 5: Update dev/App.tsx**

The big import block ends at line 191 with `} from '../src'`. Change to `} from '@lib'`.

- [ ] **Step 6: Verify typecheck + dev server**

```bash
bun run typecheck
```
Expected: zero errors.

Browser: refresh `bun dev` URL. Studio still loads identically. Console clean.

- [ ] **Step 7: Commit**

```bash
git add dev/main.tsx dev/builder/Canvas.tsx dev/builder/Inspector.tsx dev/builder/blocks.tsx dev/App.tsx
git commit -m "refactor(dev): sweep library imports to @lib alias"
```

---

### Task 5: Add minimal router scaffold (no-op wrapper)

**Files:**
- Create: `dev/router.tsx`
- Modify: `dev/main.tsx`

- [ ] **Step 1: Create dev/router.tsx**

```tsx
import { createBrowserRouter } from 'react-router'
import { App } from './App'

export const router = createBrowserRouter([
  { path: '*', element: <App /> },
])
```

- [ ] **Step 2: Update dev/main.tsx to render RouterProvider**

Replace the file contents:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { router } from './router'
import '@lib/styles/index.css'
import './sandbox.css'

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root element')

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
```

- [ ] **Step 3: Verify typecheck + browser smoke**

```bash
bun run typecheck
```
Expected: zero errors.

Browser: refresh. Studio loads identically. URL is `/` (or whatever you opened); SiteHeader's tab buttons still toggle between components/foundations/builder via App.tsx's internal state. The router is present but inert.

Console: no react-router warnings about missing routes.

- [ ] **Step 4: Commit**

```bash
git add dev/router.tsx dev/main.tsx
git commit -m "feat(dev): scaffold react-router with no-op catch-all route"
```

---

# PHASE 2 — Extract layout chrome from App.tsx

This phase moves `SiteHeader`, `SidebarNav`, `FoundationsSidebar`, `FooterNote`, `DocsHero`, and `useTheme` out of App.tsx into `app/`. App.tsx still owns page state at end of phase.

---

### Task 6: Create dev/app/ folder structure and extract useTheme hook

**Files:**
- Create: `dev/app/hooks/useTheme.ts`
- Modify: `dev/App.tsx`

- [ ] **Step 1: Create dev/app/hooks/useTheme.ts**

Move the `Theme` type and `useTheme` hook (App.tsx lines 196-207). Keep it hook-only for now — Context promotion is Task 35.

```ts
import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document === 'undefined') return 'light'
    return (document.documentElement.dataset.theme as Theme) || 'light'
  })
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
  return [theme, setTheme]
}
```

- [ ] **Step 2: Update dev/App.tsx**

Delete the inline `useTheme` definition (was lines 196-207). Add import near the top of the file (alongside other relative imports):

```ts
import { useTheme } from './app/hooks/useTheme'
```

- [ ] **Step 3: Verify typecheck + smoke**

```bash
bun run typecheck
```

Browser: refresh. Theme toggle in header still works. No console errors.

- [ ] **Step 4: Commit**

```bash
git add dev/app/hooks/useTheme.ts dev/App.tsx
git commit -m "refactor(dev): extract useTheme to app/hooks/"
```

---

### Task 7: Extract SiteHeader to app/chrome/

**Files:**
- Create: `dev/app/chrome/SiteHeader.tsx`
- Modify: `dev/App.tsx`

The current SiteHeader takes `page: Page` and `onPageChange: (p: Page) => void` props. We're going to keep those props for now (App.tsx still owns page state) — and remove them in Phase 3 once routing takes over.

- [ ] **Step 1: Create dev/app/chrome/SiteHeader.tsx**

Copy the entire SiteHeader function from App.tsx (lines 318-410). At the top of the new file, add the imports it needs:

```tsx
import { motion } from 'framer-motion'
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
  // ... body copied verbatim from dev/App.tsx lines 320-410 ...
}
```

(Verbatim means the JSX, the `useTheme()` call, the tab buttons, the theme toggle — all of it. Do not modify behavior.)

- [ ] **Step 2: Update dev/App.tsx**

- Delete the inline `SiteHeader` definition (was lines 318-410).
- Add import: `import { SiteHeader } from './app/chrome/SiteHeader'`
- The existing `<SiteHeader page={page} onPageChange={setPage} />` JSX usage stays exactly as is.

- [ ] **Step 3: Verify typecheck + smoke**

```bash
bun run typecheck
```

Browser: refresh. Header renders identically. Tab clicks still navigate. Theme toggle still works.

- [ ] **Step 4: Commit**

```bash
git add dev/app/chrome/SiteHeader.tsx dev/App.tsx
git commit -m "refactor(dev): extract SiteHeader to app/chrome/"
```

---

### Task 8: Extract DocsSidebar (renamed from SidebarNav)

**Files:**
- Create: `dev/app/chrome/DocsSidebar.tsx`
- Modify: `dev/App.tsx`

The current `SidebarNav` component (App.tsx lines 411-455) takes `page` and `activeId` props. It internally branches: components page uses REGISTRY data, foundations page calls `<FoundationsSidebar/>`. We'll keep this shape now; in Phase 4 we'll split foundations into its own sidebar.

- [ ] **Step 1: Create dev/app/chrome/DocsSidebar.tsx**

Copy the SidebarNav function from App.tsx (lines 411-455). Rename it to `DocsSidebar`. Imports needed:

```tsx
type Page = 'components' | 'foundations' | 'builder'

// REGISTRY type + foundations sidebar items used inline by this component.
// For now, import them from App.tsx — Phase 4 moves them.

export function DocsSidebar({ page, activeId }: { page: Page; activeId: string }) {
  // ... body copied verbatim from dev/App.tsx lines 411-455 ...
}
```

NOTE: this component currently references `REGISTRY` (line 1507 of App.tsx) and `<FoundationsSidebar/>` (line 456). Those are still in App.tsx for now. To avoid circular dependencies temporarily, this Task is going to hit a snag. Resolve by:

- Inlining REGISTRY (just the data, not the renderers) into DocsSidebar.tsx as a temporary `SIDEBAR_GROUPS` const containing `{ label, entries: [{ id, name }] }` entries (no render functions needed for the sidebar).
- Importing `FoundationsSidebar` from App.tsx for now (export it from App.tsx temporarily).

Actually the cleanest interim is: keep the SidebarNav inside App.tsx for this task and SKIP this extraction until after the registry split (Phase 5). Update this task accordingly:

**Skip this task. Move it after Phase 5 (it becomes Task 30).** Mark this task as [n/a] and proceed to Task 9.

- [ ] **Step 1: Mark task skipped in plan; commit nothing**

(No changes; proceed to Task 9.)

---

### Task 9: Extract FooterNote and DocsHero to app/chrome/

**Files:**
- Create: `dev/app/chrome/FooterNote.tsx`, `dev/app/chrome/DocsHero.tsx`
- Modify: `dev/App.tsx`

- [ ] **Step 1: Create dev/app/chrome/FooterNote.tsx**

Copy from App.tsx lines 588-605:

```tsx
export function FooterNote() {
  return (
    <footer className="mt-32 border-t-2 border-fg pt-10 pb-12">
      {/* body copied verbatim from dev/App.tsx lines 590-604 */}
    </footer>
  )
}
```

- [ ] **Step 2: Create dev/app/chrome/DocsHero.tsx**

Copy from App.tsx lines 501-549. Add imports:

```tsx
import { motion } from 'framer-motion'

export function DocsHero() {
  // body copied verbatim from dev/App.tsx lines 502-548
}
```

- [ ] **Step 3: Update dev/App.tsx**

- Delete inline FooterNote (588-605) and DocsHero (501-549).
- Add imports:
  ```ts
  import { FooterNote } from './app/chrome/FooterNote'
  import { DocsHero } from './app/chrome/DocsHero'
  ```

- [ ] **Step 4: Verify typecheck + smoke**

```bash
bun run typecheck
```

Browser: refresh. Hero renders on components page. Footer renders. No regressions.

- [ ] **Step 5: Commit**

```bash
git add dev/app/chrome/FooterNote.tsx dev/app/chrome/DocsHero.tsx dev/App.tsx
git commit -m "refactor(dev): extract FooterNote and DocsHero to app/chrome/"
```

---

### Task 10: Create Providers component (no behavior change yet)

**Files:**
- Create: `dev/app/Providers.tsx`
- Modify: `dev/main.tsx`

This task pulls `TooltipProvider` and `Toaster` out of App.tsx into a Providers wrapper, mounted in main.tsx. ThemeProvider promotion is deferred to Task 35.

- [ ] **Step 1: Create dev/app/Providers.tsx**

```tsx
import { TooltipProvider, Toaster } from '@lib'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={200}>
      {children}
      <Toaster />
    </TooltipProvider>
  )
}
```

- [ ] **Step 2: Update dev/main.tsx**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { Providers } from './app/Providers'
import { router } from './router'
import '@lib/styles/index.css'
import './sandbox.css'

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root element')

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </React.StrictMode>,
)
```

- [ ] **Step 3: Update dev/App.tsx — remove the now-duplicate TooltipProvider + Toaster**

In App.tsx's `App()` function (around line 256-274), remove the wrapping `<TooltipProvider>` and the `<Toaster/>` inside it. The body should now render directly without those wrappers (they're handled by Providers in main.tsx).

Before:
```tsx
return (
  <TooltipProvider delayDuration={200}>
    <div className="min-h-screen bg-bg text-fg">
      {/* ... */}
      <Toaster />
    </div>
  </TooltipProvider>
)
```

After:
```tsx
return (
  <div className="min-h-screen bg-bg text-fg">
    {/* ... */}
  </div>
)
```

- [ ] **Step 4: Verify**

```bash
bun run typecheck
```

Browser: refresh. Tooltips still work (hover any tooltip-using component). Toasts still appear. No double-mounted providers.

- [ ] **Step 5: Commit**

```bash
git add dev/app/Providers.tsx dev/main.tsx dev/App.tsx
git commit -m "refactor(dev): hoist TooltipProvider and Toaster to app/Providers"
```

---

# PHASE 3 — Real routes; delete page-state machine

This phase replaces the `useState<Page>` machine with real routing. Layouts wrap routes. `<App/>` is dismantled; pages become route components.

---

### Task 11: Create DocsLayout and StudioLayout

**Files:**
- Create: `dev/app/layouts/DocsLayout.tsx`, `dev/app/layouts/StudioLayout.tsx`

Both layouts compose `SiteHeader` + `<Outlet/>`. DocsLayout adds the sidebar; StudioLayout doesn't. SiteHeader currently expects `page` and `onPageChange` props — we'll temporarily pass them, derived from `useLocation()`. Final cleanup of SiteHeader's props is in Task 13.

- [ ] **Step 1: Create dev/app/layouts/DocsLayout.tsx**

```tsx
import { Outlet, ScrollRestoration, useLocation, useNavigate } from 'react-router'
import { SiteHeader } from '../chrome/SiteHeader'
// DocsSidebar will be created in Task 30. For now, inline the existing
// SidebarNav from App.tsx by importing it. (Phase 5 cleanup.)
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
```

- [ ] **Step 2: Create dev/app/layouts/StudioLayout.tsx**

```tsx
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
```

NOTE on the duplicated `pathToPage` helper: it's intentionally inlined per layout for now to keep imports flat. We can extract to `app/utils/path.ts` later if a third layout appears.

- [ ] **Step 3: Update dev/App.tsx — temporarily export SidebarNav**

Add `export` keyword to the SidebarNav function declaration so DocsLayout can import it. Will be removed in Task 13.

```ts
export function SidebarNav({ page, activeId }: { page: Page; activeId: string }) {
```

- [ ] **Step 4: Verify typecheck**

```bash
bun run typecheck
```
Expected: zero errors.

- [ ] **Step 5: Commit**

```bash
git add dev/app/layouts/DocsLayout.tsx dev/app/layouts/StudioLayout.tsx dev/App.tsx
git commit -m "feat(dev): add DocsLayout and StudioLayout"
```

---

### Task 12: Wire up real routes in router.tsx

**Files:**
- Modify: `dev/router.tsx`

This is the moment routing actually drives navigation. After this task, `/components`, `/foundations`, `/builder` are real URLs.

- [ ] **Step 1: Update dev/router.tsx**

Replace contents:

```tsx
import { createBrowserRouter, redirect } from 'react-router'
import { DocsLayout } from './app/layouts/DocsLayout'
import { StudioLayout } from './app/layouts/StudioLayout'
import { ComponentsPage, FoundationsPage } from './App'
import { Builder } from './builder/Builder'

// Temporary builder route component until Task 21 creates BuilderPage.
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
```

- [ ] **Step 2: Update dev/App.tsx — export ComponentsPage and FoundationsPage**

Add `export` to both:

```ts
export function ComponentsPage() { ... }
export function FoundationsPage() { ... }
```

- [ ] **Step 3: Verify typecheck + smoke**

```bash
bun run typecheck
```

Browser: refresh on `/`. Should redirect to `/components`. Click sidebar header tabs — URL changes to `/foundations` and `/builder`. Refresh on each — page persists. Browser back button works.

- [ ] **Step 4: Commit**

```bash
git add dev/router.tsx dev/App.tsx
git commit -m "feat(dev): wire real routes for components, foundations, builder"
```

---

### Task 13: Delete page-state machine from App.tsx

**Files:**
- Modify: `dev/App.tsx`

After Task 12, the `App()` function in dev/App.tsx is no longer rendered (router renders ComponentsPage/FoundationsPage directly). We can delete it, plus the page-state useState and the IntersectionObserver that derived activeId.

- [ ] **Step 1: Delete the App() function from dev/App.tsx**

Lines roughly 228-275. Delete the entire `export function App()` declaration including its body.

- [ ] **Step 2: Delete the `Page` type from dev/App.tsx**

Line 226 (`type Page = 'components' | 'foundations' | 'builder'`). The Page type still lives inside the layouts and SiteHeader; remove the App.tsx-level one to avoid confusion.

- [ ] **Step 3: Verify**

```bash
bun run typecheck
```

Browser: refresh /components, /foundations, /builder. All three pages render. Sidebar still shows. The sidebar's active-item highlight may now be stale (it's wired off `activeId` derived from URL hash, which is empty after navigation) — that's expected; we fix it in Phase 6.

- [ ] **Step 4: Commit**

```bash
git add dev/App.tsx
git commit -m "refactor(dev): delete page-state machine; routes now drive page selection"
```

---

# PHASE 4 — Move pages out of App.tsx; relocate builder folder

This phase extracts ComponentsPage and FoundationsPage into `pages/`, moves the builder folder, and deletes App.tsx entirely.

---

### Task 14: Create pages/components/ComponentsPage.tsx

**Files:**
- Create: `dev/pages/components/ComponentsPage.tsx`
- Modify: `dev/App.tsx`, `dev/router.tsx`

For now, the registry stays in App.tsx (Phase 5 splits it). ComponentsPage just imports REGISTRY from App.tsx temporarily.

- [ ] **Step 1: Create dev/pages/components/ComponentsPage.tsx**

Copy the ComponentsPage function from App.tsx (lines 277-313). The function references `REGISTRY` (still in App.tsx), `ComponentEntry` (still in App.tsx — moves in Task 16), and `DocsHero` (already in app/chrome/).

```tsx
import { DocsHero } from '../../app/chrome/DocsHero'
import { REGISTRY, ComponentEntry, FooterNote } from '../../App'

export function ComponentsPage() {
  // body copied verbatim from dev/App.tsx lines 278-313
}
```

- [ ] **Step 2: Update dev/App.tsx**

- Delete the inline ComponentsPage (lines 277-313).
- Add `export` to REGISTRY (line 1507): `export const REGISTRY: Group[] = [`
- Add `export` to ComponentEntry (line 550): `export function ComponentEntry({ entry, num }: ...)`

- [ ] **Step 3: Update dev/router.tsx**

Change import:

```ts
import { ComponentsPage } from './pages/components/ComponentsPage'
import { FoundationsPage } from './App'
```

- [ ] **Step 4: Verify**

```bash
bun run typecheck
```

Browser: /components renders identically.

- [ ] **Step 5: Commit**

```bash
git add dev/pages/components/ComponentsPage.tsx dev/App.tsx dev/router.tsx
git commit -m "refactor(dev): move ComponentsPage to pages/components/"
```

---

### Task 15: Create pages/foundations/FoundationsPage.tsx

**Files:**
- Create: `dev/pages/foundations/FoundationsPage.tsx`
- Modify: `dev/App.tsx`, `dev/router.tsx`

Foundations sections still live in App.tsx (Phase 7 splits them). FoundationsPage imports them temporarily.

- [ ] **Step 1: Create dev/pages/foundations/FoundationsPage.tsx**

Copy lines 1601-1617 (the FoundationsPage function). Determine which sections it composes by reading those lines. Imports needed:

```tsx
import {
  FoundationsOverview,
  FoundationsColors,
  FoundationsTypography,
  FoundationsSpacing,
  FoundationsRadius,
  FoundationsShadows,
  FoundationsIcons,
} from '../../App'

export function FoundationsPage() {
  // body copied verbatim from dev/App.tsx lines 1601-1617
}
```

- [ ] **Step 2: Update dev/App.tsx**

- Delete the inline FoundationsPage (lines 1601-1617).
- Add `export` to each foundation section function (FoundationsOverview at line 1654, FoundationsColors at 1778, FoundationsTypography at 1836, FoundationsSpacing at 1894, FoundationsRadius at 1924, FoundationsShadows at 1955, FoundationsIcons at 1986).

- [ ] **Step 3: Update dev/router.tsx**

Change import to:

```ts
import { FoundationsPage } from './pages/foundations/FoundationsPage'
```

Remove the now-unused `FoundationsPage` import from `./App`.

- [ ] **Step 4: Verify**

```bash
bun run typecheck
```

Browser: /foundations renders identically.

- [ ] **Step 5: Commit**

```bash
git add dev/pages/foundations/FoundationsPage.tsx dev/App.tsx dev/router.tsx
git commit -m "refactor(dev): move FoundationsPage to pages/foundations/"
```

---

### Task 16: Create pages/components/ComponentEntry.tsx and ComponentPreview.tsx

**Files:**
- Create: `dev/pages/components/ComponentEntry.tsx`, `dev/pages/components/ComponentPreview.tsx`
- Modify: `dev/App.tsx`, `dev/pages/components/ComponentsPage.tsx`

- [ ] **Step 1: Create dev/pages/components/ComponentPreview.tsx**

Copy from App.tsx lines 567-586:

```tsx
export function ComponentPreview({
  children,
  num,
}: {
  children: React.ReactNode
  num: string
}) {
  // body copied verbatim from dev/App.tsx lines 574-585
}
```

- [ ] **Step 2: Create dev/pages/components/ComponentEntry.tsx**

Copy from App.tsx lines 550-565. The Entry type (line 212-217 in App.tsx) needs to come along — for now, also import it from App.tsx (Phase 5 moves it to shared/types.ts):

```tsx
import { ComponentPreview } from './ComponentPreview'
import type { Entry } from '../../App'

export function ComponentEntry({ entry, num }: { entry: Entry; num: string }) {
  // body copied verbatim from dev/App.tsx lines 551-564
}
```

- [ ] **Step 3: Update dev/App.tsx**

- Delete inline ComponentEntry (lines 550-565) and ComponentPreview (lines 567-586).
- Add `export` to the `Entry` type (around line 212): `export type Entry = { ... }`

- [ ] **Step 4: Update dev/pages/components/ComponentsPage.tsx**

Replace the import line:

```tsx
import { REGISTRY, ComponentEntry, FooterNote } from '../../App'
```

with:

```tsx
import { REGISTRY, FooterNote } from '../../App'
import { ComponentEntry } from './ComponentEntry'
```

NOTE: FooterNote is still imported from App.tsx because it's used here. We'll fix that in the next sub-step or keep it imported from app/chrome/ if Task 9 already extracted it. If FooterNote is in `app/chrome/FooterNote.tsx`, change the import to `import { FooterNote } from '../../app/chrome/FooterNote'`.

- [ ] **Step 5: Verify + commit**

```bash
bun run typecheck
```

Browser: /components renders identically.

```bash
git add dev/pages/components/ComponentEntry.tsx dev/pages/components/ComponentPreview.tsx dev/App.tsx dev/pages/components/ComponentsPage.tsx
git commit -m "refactor(dev): extract ComponentEntry and ComponentPreview to pages/components/"
```

---

### Task 17: Move dev/builder/ to dev/pages/builder/ and add BuilderPage

**Files:**
- Move: `dev/builder/*` → `dev/pages/builder/*` (9 files)
- Create: `dev/pages/builder/BuilderPage.tsx`
- Modify: `dev/router.tsx`

Because Phase 1 set up the `@lib` alias, the builder files no longer have any `'../../src'` imports. The move is purely path-only — no import edits.

- [ ] **Step 1: Verify no builder file uses relative `../`-up imports**

```bash
grep -rn "from '\.\./\.\./" dev/builder/
```

Expected output: empty (or only `'./xxx'` sibling imports). If any `'../../'` or `'../'` imports appear, abort and fix them by switching to `@lib` first.

- [ ] **Step 2: Create dev/pages/builder/ and move all 9 files**

```bash
mkdir -p dev/pages/builder
git mv dev/builder/Builder.tsx       dev/pages/builder/Builder.tsx
git mv dev/builder/Canvas.tsx        dev/pages/builder/Canvas.tsx
git mv dev/builder/Inspector.tsx     dev/pages/builder/Inspector.tsx
git mv dev/builder/Palette.tsx       dev/pages/builder/Palette.tsx
git mv dev/builder/PlacedNode.tsx    dev/pages/builder/PlacedNode.tsx
git mv dev/builder/blocks.tsx        dev/pages/builder/blocks.tsx
git mv dev/builder/store.ts          dev/pages/builder/store.ts
git mv dev/builder/ViewportToggle.tsx dev/pages/builder/ViewportToggle.tsx
git mv dev/builder/DeviceFrame.tsx   dev/pages/builder/DeviceFrame.tsx
rmdir dev/builder
```

- [ ] **Step 3: Create dev/pages/builder/BuilderPage.tsx**

```tsx
import { Builder } from './Builder'

export function BuilderPage() {
  return <Builder />
}
```

- [ ] **Step 4: Update dev/router.tsx**

Replace:

```ts
import { Builder } from './builder/Builder'

function BuilderPage() {
  return <Builder />
}
```

with:

```ts
import { BuilderPage } from './pages/builder/BuilderPage'
```

- [ ] **Step 5: Verify**

```bash
bun run typecheck
```

Browser: navigate to /builder. Drag-drop sandbox works as before.

- [ ] **Step 6: Commit**

```bash
git add dev/pages/builder/ dev/router.tsx
git commit -m "refactor(dev): move builder to pages/builder/ with BuilderPage wrapper"
```

---

# PHASE 5 — Split registry into per-group files

This phase extracts the 53 example renderers into 7 group files and creates the registry assembly point. After this, App.tsx no longer holds REGISTRY or the Ex_* functions.

---

### Task 18: Create shared/types.ts with EntryMeta and GroupMeta

**Files:**
- Create: `dev/shared/types.ts`

We rename `Entry` → `EntryMeta` and `Group` → `GroupMeta` for clarity, and switch `render: () => React.ReactNode` to `Component: React.ComponentType` (D10 in spec). The renderer rename happens in Task 26.

For NOW, define the new types in shared/types.ts but keep the old `Entry`/`Group` aliases as well so existing code keeps compiling during the migration.

- [ ] **Step 1: Create dev/shared/types.ts**

```ts
import type React from 'react'

export type EntryMeta = {
  id: string
  name: string
  description: string
  // Component-typed (not function-typed) so each example owns its own hook list,
  // DevTools identity, and Strict Mode lifecycle.
  Component: React.ComponentType
}

export type GroupMeta = {
  label: string
  entries: EntryMeta[]
}

// Legacy aliases to ease migration. Remove after Task 26.
export type LegacyEntry = {
  id: string
  name: string
  description: string
  render: () => React.ReactNode
}
export type LegacyGroup = {
  label: string
  entries: LegacyEntry[]
}
```

- [ ] **Step 2: Update dev/pages/components/ComponentEntry.tsx import**

ComponentEntry currently imports `type { Entry }` from `'../../App'`. After Task 25 deletes that type from App.tsx, the import would break. Redirect now to use the legacy alias:

Replace:
```ts
import type { Entry } from '../../App'
```
with:
```ts
import type { LegacyEntry as Entry } from '../../shared/types'
```

(Task 26 changes this further to `EntryMeta` once renderers are promoted.)

- [ ] **Step 3: Verify**

```bash
bun run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add dev/shared/types.ts dev/pages/components/ComponentEntry.tsx
git commit -m "feat(dev): add EntryMeta and GroupMeta types in shared/"
```

---

### Task 19: Create pages/components/groups/forms.tsx

**Files:**
- Create: `dev/pages/components/groups/forms.tsx`

Move 18 example functions from App.tsx into this file. **Move, don't copy** — the originals get deleted as we go (final cleanup in Task 25).

For each Ex_* function: copy verbatim (preserving its hooks and JSX), and add it to the file's `formGroup` GroupMeta entry list.

The 18 functions for Form group (with their App.tsx line numbers):
- `Ex_Button` (610), `Ex_ButtonGroup` (623), `Ex_Input` (633), `Ex_InputGroup` (641), `Ex_InputOTP` (652), `Ex_Textarea` (670), `Ex_Label` (678), `Ex_Field` (687), `Ex_Checkbox` (699), `Ex_RadioGroup` (714), `Ex_Switch` (733), `Ex_Slider` (742), `Ex_Toggle` (751), `Ex_ToggleGroup` (759), `Ex_Select` (769), `Ex_NativeSelect` (785), `Ex_Combobox` (798), `Ex_DatePicker` (809)

- [ ] **Step 1: Create dev/pages/components/groups/forms.tsx with imports**

```tsx
import { useState } from 'react'
import {
  Button,
  ButtonGroup,
  ButtonGroupSeparator,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  Textarea,
  Label,
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Switch,
  Slider,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  NativeSelect,
  Combobox,
  DatePicker,
} from '@lib'
// Add any other lib imports referenced by the 18 example functions.
// Reference dev/App.tsx top-of-file imports (lines 21-191) for the master list.

import type { GroupMeta } from '../../../shared/types'
```

- [ ] **Step 2: Copy each Ex_* function verbatim into the file**

Paste them in the order listed above. Keep their `Ex_` prefixed names for now — they'll be renamed to `*Example` in Task 26.

- [ ] **Step 3: Add formGroup export at the bottom**

```tsx
// LEGACY render shape — converted to Component shape in Task 26.
import type { LegacyGroup } from '../../../shared/types'

export const formGroup: LegacyGroup = {
  label: 'Form',
  entries: [
    { id: 'button',        name: 'Button',         description: 'Triggers an action or event.',     render: Ex_Button },
    { id: 'button-group',  name: 'Button Group',   description: 'Group of related buttons.',        render: Ex_ButtonGroup },
    { id: 'checkbox',      name: 'Checkbox',       description: 'Single binary on/off control.',    render: Ex_Checkbox },
    { id: 'combobox',      name: 'Combobox',       description: 'Searchable select powered by cmdk.', render: Ex_Combobox },
    { id: 'date-picker',   name: 'Date Picker',    description: 'Calendar inside a popover.',       render: Ex_DatePicker },
    { id: 'field',         name: 'Field',          description: 'Wraps label, control and description.', render: Ex_Field },
    { id: 'input',         name: 'Input',          description: 'Single-line text input.',          render: Ex_Input },
    { id: 'input-group',   name: 'Input Group',    description: 'Input with addons or icons.',      render: Ex_InputGroup },
    { id: 'input-otp',     name: 'Input OTP',      description: 'One-time-passcode input.',         render: Ex_InputOTP },
    { id: 'label',         name: 'Label',          description: 'Renders an accessible label.',     render: Ex_Label },
    { id: 'native-select', name: 'Native Select',  description: 'Styled native <select>.',          render: Ex_NativeSelect },
    { id: 'radio-group',   name: 'Radio Group',    description: 'Single-choice button group.',      render: Ex_RadioGroup },
    { id: 'select',        name: 'Select',         description: 'Custom select dropdown.',          render: Ex_Select },
    { id: 'slider',        name: 'Slider',         description: 'Range input.',                     render: Ex_Slider },
    { id: 'switch',        name: 'Switch',         description: 'On/off toggle.',                   render: Ex_Switch },
    { id: 'textarea',      name: 'Textarea',       description: 'Multi-line text input.',           render: Ex_Textarea },
    { id: 'toggle',        name: 'Toggle',         description: 'Pressable on/off button.',         render: Ex_Toggle },
    { id: 'toggle-group',  name: 'Toggle Group',   description: 'Group of pressable toggles.',      render: Ex_ToggleGroup },
  ],
}
```

(Descriptions sourced from App.tsx REGISTRY entries 1511-1528.)

- [ ] **Step 4: Verify (do NOT delete originals from App.tsx yet)**

```bash
bun run typecheck
```

Both old and new copies of Ex_Button etc. coexist temporarily. App.tsx's REGISTRY still references the App.tsx-local Ex_* — that's fine.

- [ ] **Step 5: Commit**

```bash
git add dev/pages/components/groups/forms.tsx
git commit -m "feat(dev): extract Form group examples to pages/components/groups/forms.tsx"
```

---

### Task 20: Create pages/components/groups/display.tsx

**Files:**
- Create: `dev/pages/components/groups/display.tsx`

Display group has 13 entries. Functions to move (App.tsx line):
`Ex_Calendar` (813), `Ex_Alert` (822), `Ex_Avatar` (836), `Ex_Badge` (850), `Ex_Card` (861), `Ex_Kbd` (880), `Ex_Progress` (890), `Ex_Separator` (898), `Ex_Skeleton` (915), `Ex_Spinner` (927), `Ex_AspectRatio` (935), `Ex_Empty` (947), `Ex_Item` (966).

- [ ] **Step 1: Create file with imports**

```tsx
import {
  Calendar, Alert, AlertDescription, AlertTitle,
  Avatar, AvatarFallback, AvatarImage,
  Badge,
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
  Kbd, KbdGroup,
  Progress,
  Separator,
  Skeleton, Spinner,
  AspectRatio,
  Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle,
  Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle,
} from '@lib'
import type { LegacyGroup } from '../../../shared/types'
```

(Verify the import list against actual usage in the moved functions; add any I missed.)

- [ ] **Step 2: Paste the 13 Ex_* function definitions verbatim** (in the order listed above).

- [ ] **Step 3: Add displayGroup export**

```tsx
export const displayGroup: LegacyGroup = {
  label: 'Display',
  entries: [
    { id: 'alert',        name: 'Alert',         description: 'Static callout box.',                   render: Ex_Alert },
    { id: 'aspect-ratio', name: 'Aspect Ratio',  description: 'Constrains child to a ratio.',          render: Ex_AspectRatio },
    { id: 'avatar',       name: 'Avatar',        description: 'User image with fallback.',             render: Ex_Avatar },
    { id: 'badge',        name: 'Badge',         description: 'Small status / label pill.',            render: Ex_Badge },
    { id: 'calendar',     name: 'Calendar',      description: 'Date grid (react-day-picker).',         render: Ex_Calendar },
    { id: 'card',         name: 'Card',          description: 'Container with header / content / footer.', render: Ex_Card },
    { id: 'empty',        name: 'Empty',         description: 'Empty-state placeholder.',              render: Ex_Empty },
    { id: 'item',         name: 'Item',          description: 'Generic list item.',                    render: Ex_Item },
    { id: 'kbd',          name: 'Kbd',           description: 'Keyboard key glyph.',                   render: Ex_Kbd },
    { id: 'progress',     name: 'Progress',      description: 'Linear progress bar.',                  render: Ex_Progress },
    { id: 'separator',    name: 'Separator',     description: 'Visual divider line.',                  render: Ex_Separator },
    { id: 'skeleton',     name: 'Skeleton',      description: 'Loading placeholder.',                  render: Ex_Skeleton },
    { id: 'spinner',      name: 'Spinner',       description: 'Indeterminate loading.',                render: Ex_Spinner },
  ],
}
```

- [ ] **Step 4: Verify**

```bash
bun run typecheck
```

- [ ] **Step 5: Commit**

```bash
git add dev/pages/components/groups/display.tsx
git commit -m "feat(dev): extract Display group examples"
```

---

### Task 21: Create pages/components/groups/navigation.tsx

**Files:**
- Create: `dev/pages/components/groups/navigation.tsx`

Navigation has 6 entries. Functions to move (App.tsx line):
`Ex_Breadcrumb` (989), `Ex_Menubar` (1048), `Ex_NavigationMenu` (1009), `Ex_Pagination` (1077), `Ex_Sidebar` (1123), `Ex_Tabs` (1106).

- [ ] **Step 1: Create file with imports**

```tsx
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
  Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger,
  NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger,
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
  // Sidebar exports — copy from dev/App.tsx top-of-file as referenced by Ex_Sidebar
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@lib'
import type { LegacyGroup } from '../../../shared/types'
```

- [ ] **Step 2: Paste the 6 Ex_* function definitions verbatim.**

- [ ] **Step 3: Add navigationGroup export**

```tsx
export const navigationGroup: LegacyGroup = {
  label: 'Navigation',
  entries: [
    { id: 'breadcrumb',      name: 'Breadcrumb',      description: 'Hierarchical nav trail.', render: Ex_Breadcrumb },
    { id: 'menubar',         name: 'Menubar',         description: 'App-style top menu bar.', render: Ex_Menubar },
    { id: 'navigation-menu', name: 'Navigation Menu', description: 'Site nav with mega-menu.', render: Ex_NavigationMenu },
    { id: 'pagination',      name: 'Pagination',      description: 'Page-number controls.', render: Ex_Pagination },
    { id: 'sidebar',         name: 'Sidebar',         description: 'Composable app sidebar.', render: Ex_Sidebar },
    { id: 'tabs',            name: 'Tabs',            description: 'Tab panel switcher.', render: Ex_Tabs },
  ],
}
```

- [ ] **Step 4: typecheck**
- [ ] **Step 5: Commit** `feat(dev): extract Navigation group examples`

---

### Task 22: Create pages/components/groups/overlay.tsx

**Files:**
- Create: `dev/pages/components/groups/overlay.tsx`

Overlay has 10 entries. Functions to move (App.tsx line):
`Ex_AlertDialog` (1133), `Ex_ContextMenu` (1306), `Ex_Dialog` (1155), `Ex_Drawer` (1184), `Ex_DropdownMenu` (1274), `Ex_HoverCard` (1240), `Ex_Popover` (1224), `Ex_Sheet` (1206), `Ex_Sonner` (1322), `Ex_Tooltip` (1263).

- [ ] **Step 1: Create file with imports**

```tsx
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger,
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
  Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
  HoverCard, HoverCardContent, HoverCardTrigger,
  Popover, PopoverContent, PopoverTrigger,
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
  Tooltip, TooltipContent, TooltipTrigger,
  toast,  // for Ex_Sonner
  Button, // for various trigger buttons
} from '@lib'
import type { LegacyGroup } from '../../../shared/types'
```

- [ ] **Step 2: Paste the 10 Ex_* function definitions verbatim.**

- [ ] **Step 3: Add overlayGroup export**

```tsx
export const overlayGroup: LegacyGroup = {
  label: 'Overlay',
  entries: [
    { id: 'alert-dialog',  name: 'Alert Dialog',  description: 'Confirmation modal.',        render: Ex_AlertDialog },
    { id: 'context-menu',  name: 'Context Menu',  description: 'Right-click menu.',           render: Ex_ContextMenu },
    { id: 'dialog',        name: 'Dialog',        description: 'Modal window.',                render: Ex_Dialog },
    { id: 'drawer',        name: 'Drawer',        description: 'Bottom-sheet drawer (vaul).', render: Ex_Drawer },
    { id: 'dropdown-menu', name: 'Dropdown Menu', description: 'Click-trigger menu.',         render: Ex_DropdownMenu },
    { id: 'hover-card',    name: 'Hover Card',    description: 'Preview popover on hover.',   render: Ex_HoverCard },
    { id: 'popover',       name: 'Popover',       description: 'Floating panel.',              render: Ex_Popover },
    { id: 'sheet',         name: 'Sheet',         description: 'Edge-anchored dialog.',        render: Ex_Sheet },
    { id: 'sonner',        name: 'Sonner',        description: 'Toast notifications.',         render: Ex_Sonner },
    { id: 'tooltip',       name: 'Tooltip',       description: 'Hover / focus tooltip.',       render: Ex_Tooltip },
  ],
}
```

- [ ] **Step 4: typecheck**
- [ ] **Step 5: Commit** `feat(dev): extract Overlay group examples`

---

### Task 23: Create disclosure.tsx, data.tsx, command.tsx (three small groups in one task)

**Files:**
- Create: `dev/pages/components/groups/disclosure.tsx`, `data.tsx`, `command.tsx`

Disclosure (3 entries): `Ex_Accordion` (1414), `Ex_Collapsible` (1435), `Ex_ScrollArea` (1456).
Data (2 entries): `Ex_Table` (1338), `Ex_DataTable` (1382).
Command (1 entry): `Ex_Command` (1472).

- [ ] **Step 1: Create disclosure.tsx**

```tsx
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
  Collapsible, CollapsibleContent, CollapsibleTrigger,
  ScrollArea,
  Button,  // for collapsible trigger button if used
} from '@lib'
import type { LegacyGroup } from '../../../shared/types'

// paste Ex_Accordion, Ex_Collapsible, Ex_ScrollArea verbatim

export const disclosureGroup: LegacyGroup = {
  label: 'Disclosure',
  entries: [
    { id: 'accordion',   name: 'Accordion',   description: 'Vertically collapsing sections.', render: Ex_Accordion },
    { id: 'collapsible', name: 'Collapsible', description: 'Single expand / collapse region.', render: Ex_Collapsible },
    { id: 'scroll-area', name: 'Scroll Area', description: 'Custom-styled scrollbars.',        render: Ex_ScrollArea },
  ],
}
```

- [ ] **Step 2: Create data.tsx**

```tsx
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  DataTable,
} from '@lib'
import type { LegacyGroup } from '../../../shared/types'

// paste Ex_Table, Ex_DataTable verbatim

export const dataGroup: LegacyGroup = {
  label: 'Data',
  entries: [
    { id: 'table',      name: 'Table',      description: 'Styled <table> primitives.', render: Ex_Table },
    { id: 'data-table', name: 'Data Table', description: 'Tanstack-table powered.',     render: Ex_DataTable },
  ],
}
```

- [ ] **Step 3: Create command.tsx**

```tsx
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
  CommandSeparator, CommandShortcut,
} from '@lib'
import type { LegacyGroup } from '../../../shared/types'

// paste Ex_Command verbatim

export const commandGroup: LegacyGroup = {
  label: 'Command',
  entries: [
    { id: 'command', name: 'Command', description: 'Command palette / fuzzy menu.', render: Ex_Command },
  ],
}
```

- [ ] **Step 4: typecheck**
- [ ] **Step 5: Commit** `feat(dev): extract Disclosure, Data, Command group examples`

---

### Task 24: Create pages/components/registry.ts

**Files:**
- Create: `dev/pages/components/registry.ts`

- [ ] **Step 1: Create dev/pages/components/registry.ts**

```ts
import type { LegacyGroup } from '../../shared/types'
import { formGroup } from './groups/forms'
import { displayGroup } from './groups/display'
import { navigationGroup } from './groups/navigation'
import { overlayGroup } from './groups/overlay'
import { disclosureGroup } from './groups/disclosure'
import { dataGroup } from './groups/data'
import { commandGroup } from './groups/command'

export const groups: LegacyGroup[] = [
  formGroup,
  displayGroup,
  navigationGroup,
  overlayGroup,
  disclosureGroup,
  dataGroup,
  commandGroup,
]
```

- [ ] **Step 2: Update dev/pages/components/ComponentsPage.tsx** to use the new registry

Replace:

```ts
import { REGISTRY, FooterNote } from '../../App'
```

with:

```ts
import { groups as REGISTRY } from './registry'
import { FooterNote } from '../../app/chrome/FooterNote'
```

The variable rename `groups as REGISTRY` keeps the inner code unchanged.

- [ ] **Step 3: Verify**

```bash
bun run typecheck
```

Browser: /components renders all 53 examples. The new registry is now driving the page.

- [ ] **Step 4: Commit**

```bash
git add dev/pages/components/registry.ts dev/pages/components/ComponentsPage.tsx
git commit -m "feat(dev): assemble component registry from per-group files"
```

---

### Task 25: Delete REGISTRY and Ex_* functions from App.tsx

**Files:**
- Modify: `dev/App.tsx`

Now that ComponentsPage uses the new registry, the App.tsx-local copies are dead code.

- [ ] **Step 1: Delete REGISTRY definition** (App.tsx ~lines 1505-1596)

- [ ] **Step 2: Delete all Ex_* function definitions** (App.tsx ~lines 610-1503)

- [ ] **Step 3: Delete the inline `Entry` and `Group` types** if still present (App.tsx around lines 212-219). The shared/types.ts versions are now canonical.

- [ ] **Step 4: Verify**

```bash
bun run typecheck
```

Browser: /components renders. There may be import warnings if anything still references App.tsx's deleted symbols — fix by importing from new locations.

- [ ] **Step 5: Commit**

```bash
git add dev/App.tsx
git commit -m "refactor(dev): delete REGISTRY and Ex_* functions from App.tsx"
```

---

### Task 26: Promote example renderers to React.ComponentType

**Files:**
- Modify: all 7 group files in `dev/pages/components/groups/`
- Modify: `dev/pages/components/registry.ts`
- Modify: `dev/pages/components/ComponentEntry.tsx`
- Modify: `dev/shared/types.ts`

Rename `Ex_Foo` → `FooExample`, change `EntryMeta` to `Component` field, ComponentEntry renders `<entry.Component />`.

- [ ] **Step 1: For each group file, rename functions and update entries**

Example for `forms.tsx`:

```tsx
// Before:
function Ex_Switch() { return <Switch defaultChecked /> }

// After:
function SwitchExample() { return <Switch defaultChecked /> }
```

And in the GroupMeta entries:

```tsx
// Before:
{ id: 'switch', name: 'Switch', description: '...', render: Ex_Switch }

// After:
{ id: 'switch', name: 'Switch', description: '...', Component: SwitchExample }
```

Switch the type annotation from `LegacyGroup` to `GroupMeta`:

```tsx
import type { GroupMeta } from '../../../shared/types'

export const formGroup: GroupMeta = {
  label: 'Form',
  entries: [
    { id: 'switch', name: 'Switch', description: '...', Component: SwitchExample },
    // ...
  ],
}
```

Apply this to all 7 group files.

- [ ] **Step 2: Update dev/pages/components/registry.ts** to use GroupMeta

```ts
import type { GroupMeta } from '../../shared/types'
import { formGroup } from './groups/forms'
// ... etc

export const groups: GroupMeta[] = [
  formGroup, displayGroup, navigationGroup,
  overlayGroup, disclosureGroup, dataGroup, commandGroup,
]
```

- [ ] **Step 3: Update dev/pages/components/ComponentEntry.tsx**

```tsx
import { ComponentPreview } from './ComponentPreview'
import type { EntryMeta } from '../../shared/types'

export function ComponentEntry({ entry, num }: { entry: EntryMeta; num: string }) {
  return (
    <article id={entry.id} data-component className="scroll-mt-20">
      <div className="flex items-baseline gap-3">
        <span className="tag text-muted-fg tabular">{num}</span>
        <h3 className="font-display text-xl font-semibold tracking-tight">
          {entry.name}
        </h3>
      </div>
      <p className="text-muted-fg mt-1 ml-8 text-sm leading-relaxed">
        {entry.description}
      </p>
      <ComponentPreview num={num}>
        <entry.Component />
      </ComponentPreview>
    </article>
  )
}
```

(Replaces the previous `{entry.render()}` call with `<entry.Component />`.)

- [ ] **Step 4: Delete LegacyEntry and LegacyGroup from shared/types.ts**

- [ ] **Step 5: Verify**

```bash
bun run typecheck
```

Browser: /components renders. Each example example should now appear as its own component in React DevTools (verify by inspecting one example with React DevTools).

- [ ] **Step 6: Commit**

```bash
git add dev/pages/components/groups/ dev/pages/components/registry.ts dev/pages/components/ComponentEntry.tsx dev/shared/types.ts
git commit -m "refactor(dev): promote example renderers to React.ComponentType"
```

---

# PHASE 6 — Split foundations into per-section files

This phase extracts the 7 foundation sections plus the FoundationSection wrapper. Mirrors the components groups extraction but smaller scope.

---

### Task 27: Create pages/foundations/FoundationSection.tsx

**Files:**
- Create: `dev/pages/foundations/FoundationSection.tsx`
- Modify: `dev/App.tsx`

- [ ] **Step 1: Copy FoundationSection from App.tsx (lines 1618-1650) to the new file**

Note: this component uses a module-level counter (`foundationsCounter`). Move that counter into the file too. It must reset per page mount; check the existing implementation and decide whether to use `useId` or pass a number prop. For now, copy the existing pattern verbatim.

```tsx
import { useMemo } from 'react'

let foundationsCounter = 0

export function FoundationSection({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children: React.ReactNode
}) {
  const num = useMemo(() => {
    foundationsCounter += 1
    return String(foundationsCounter).padStart(2, '0')
  }, [])
  return (
    <section id={id} data-foundation className="scroll-mt-20 mt-20 first:mt-0">
      {/* body copied from dev/App.tsx lines 1635-1647 */}
    </section>
  )
}

export function resetFoundationsCounter() {
  foundationsCounter = 0
}
```

The counter reset is needed so re-mounting `FoundationsPage` doesn't keep incrementing. FoundationsPage will call this on mount in Task 28.

- [ ] **Step 2: Delete inline FoundationSection from App.tsx**

- [ ] **Step 3: Verify**

```bash
bun run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add dev/pages/foundations/FoundationSection.tsx dev/App.tsx
git commit -m "refactor(dev): extract FoundationSection wrapper"
```

---

### Task 28: Create pages/foundations/sections/* (7 files)

**Files:**
- Create: `dev/pages/foundations/sections/Overview.tsx`, `Colors.tsx`, `Typography.tsx`, `Spacing.tsx`, `Radius.tsx`, `Shadows.tsx`, `Iconography.tsx`
- Modify: `dev/pages/foundations/FoundationsPage.tsx`
- Modify: `dev/App.tsx`

Source line ranges in App.tsx:
- `FoundationsOverview` — 1654 to ~1777
- `FoundationsColors` — 1778 to ~1835
- `FoundationsTypography` — 1836 to ~1893
- `FoundationsSpacing` — 1894 to ~1923
- `FoundationsRadius` — 1924 to ~1954
- `FoundationsShadows` — 1955 to ~1985
- `FoundationsIcons` — 1986 to ~2022

The exact end-line of each is just before the next function declaration. Re-grep before extracting if line counts have shifted.

- [ ] **Step 1: Create Overview.tsx**

```tsx
import { motion } from 'framer-motion'

export function Overview() {
  // body from dev/App.tsx FoundationsOverview function, lines ~1655-1776
}
```

- [ ] **Step 2: Create Colors.tsx**

```tsx
import { FoundationSection } from '../FoundationSection'
// Add other imports as referenced by the function body.

export function Colors() {
  // body from dev/App.tsx FoundationsColors, lines ~1779-1834
}
```

- [ ] **Step 3: Create Typography.tsx, Spacing.tsx, Radius.tsx, Shadows.tsx, Iconography.tsx**

Same pattern. Each file exports the named section component.

- [ ] **Step 4: Update dev/pages/foundations/FoundationsPage.tsx**

```tsx
import { useEffect } from 'react'
import { resetFoundationsCounter } from './FoundationSection'
import { Overview } from './sections/Overview'
import { Colors } from './sections/Colors'
import { Typography } from './sections/Typography'
import { Spacing } from './sections/Spacing'
import { Radius } from './sections/Radius'
import { Shadows } from './sections/Shadows'
import { Iconography } from './sections/Iconography'
import { FooterNote } from '../../app/chrome/FooterNote'

export function FoundationsPage() {
  useEffect(() => { resetFoundationsCounter() }, [])
  return (
    <>
      <Overview />
      <Colors />
      <Typography />
      <Spacing />
      <Radius />
      <Shadows />
      <Iconography />
      <FooterNote />
    </>
  )
}
```

- [ ] **Step 5: Delete the seven Foundations* functions from App.tsx**

- [ ] **Step 6: Verify**

```bash
bun run typecheck
```

Browser: /foundations renders all 7 sections in order. Section numbering (01, 02, ...) is correct.

- [ ] **Step 7: Commit**

```bash
git add dev/pages/foundations/sections/ dev/pages/foundations/FoundationsPage.tsx dev/App.tsx
git commit -m "refactor(dev): split foundation sections into per-section files"
```

---

### Task 29: Move FoundationsSidebar into app/chrome/

**Files:**
- Create: `dev/app/chrome/FoundationsSidebar.tsx`
- Modify: `dev/App.tsx`

- [ ] **Step 1: Create dev/app/chrome/FoundationsSidebar.tsx**

Copy from App.tsx lines 456-500. The component currently takes `{ activeId }` prop; keep that for now.

```tsx
export function FoundationsSidebar({ activeId }: { activeId: string }) {
  // body copied verbatim from dev/App.tsx lines 457-499
}
```

- [ ] **Step 2: Delete inline FoundationsSidebar from App.tsx**

- [ ] **Step 3: Verify**

```bash
bun run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add dev/app/chrome/FoundationsSidebar.tsx dev/App.tsx
git commit -m "refactor(dev): extract FoundationsSidebar to app/chrome/"
```

---

### Task 30: Move SidebarNav (now DocsSidebar) into app/chrome/

**Files:**
- Create: `dev/app/chrome/DocsSidebar.tsx`
- Modify: `dev/App.tsx`, `dev/app/layouts/DocsLayout.tsx`

The SidebarNav references REGISTRY (now in `pages/components/registry.ts` as `groups`) and FoundationsSidebar (now in `app/chrome/`). It internally branches on `page` to render the right list.

- [ ] **Step 1: Create dev/app/chrome/DocsSidebar.tsx**

```tsx
import { groups } from '../../pages/components/registry'
import { FoundationsSidebar } from './FoundationsSidebar'

type Page = 'components' | 'foundations' | 'builder'

export function DocsSidebar({ page, activeId }: { page: Page; activeId: string }) {
  if (page === 'foundations') return <FoundationsSidebar activeId={activeId} />
  // body for components sidebar copied from dev/App.tsx lines 411-455.
  // Reference `groups` instead of `REGISTRY`.
  // ...
}
```

When copying, replace any `REGISTRY` reference with `groups`.

- [ ] **Step 2: Delete inline SidebarNav from App.tsx**

Also remove the temporary `export` keyword you added in Task 11.

- [ ] **Step 3: Update dev/app/layouts/DocsLayout.tsx**

Change:

```ts
import { SidebarNav as DocsSidebar } from '../../App'
```

to:

```ts
import { DocsSidebar } from '../chrome/DocsSidebar'
```

- [ ] **Step 4: Verify**

```bash
bun run typecheck
```

Browser: /components and /foundations both render the correct sidebar.

- [ ] **Step 5: Commit**

```bash
git add dev/app/chrome/DocsSidebar.tsx dev/App.tsx dev/app/layouts/DocsLayout.tsx
git commit -m "refactor(dev): extract DocsSidebar to app/chrome/"
```

---

### Task 31: Delete dev/App.tsx

**Files:**
- Delete: `dev/App.tsx`
- Modify: `dev/pages/components/ComponentsPage.tsx` (if it still imports anything from App.tsx)

- [ ] **Step 1: Verify nothing still imports from dev/App.tsx**

```bash
grep -rn "from '\.\./App'" dev/
grep -rn "from '\.\./\.\./App'" dev/
```

Expected: empty output. If matches appear, fix those imports first to point at the canonical new locations (e.g., `app/chrome/FooterNote`, `pages/components/registry`, `shared/types`).

- [ ] **Step 2: Delete dev/App.tsx**

```bash
git rm dev/App.tsx
```

- [ ] **Step 3: Verify**

```bash
bun run typecheck
```

Browser: full smoke — /, /components, /foundations, /builder all render. No regressions.

- [ ] **Step 4: Commit**

```bash
git commit -m "refactor(dev): delete App.tsx — all concerns relocated"
```

---

### Task 32: Rename dev/sandbox.css to dev/studio.css

**Files:**
- Rename: `dev/sandbox.css` → `dev/studio.css`
- Modify: `dev/main.tsx`

- [ ] **Step 1: Rename**

```bash
git mv dev/sandbox.css dev/studio.css
```

- [ ] **Step 2: Update dev/main.tsx**

Change `import './sandbox.css'` → `import './studio.css'`.

- [ ] **Step 3: Verify**

```bash
bun run typecheck
```

Browser: refresh. Visual styling unchanged.

- [ ] **Step 4: Commit**

```bash
git add dev/main.tsx dev/studio.css
git commit -m "chore(dev): rename sandbox.css to studio.css"
```

---

# PHASE 7 — URL-as-truth (hash spy + scroll restoration)

This phase replaces the layout-driven `activeId` derivation with hooks that write to and read from `location.hash` directly.

---

### Task 33: Create useHashSpy hook

**Files:**
- Create: `dev/app/hooks/useHashSpy.ts`

- [ ] **Step 1: Create dev/app/hooks/useHashSpy.ts**

```ts
import { useEffect } from 'react'

/**
 * Watch DOM elements matching `selector` for visibility, and update
 * `location.hash` to the topmost-visible element's id.
 *
 * MUST use history.replaceState — assigning location.hash = '...' triggers
 * native browser scroll-jump and breaks user scrolling. pushState pollutes
 * history with one entry per scrolled section.
 */
export function useHashSpy(selector: string) {
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>(selector)
    if (sections.length === 0) return

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (!visible) return
        const id = visible.target.id
        const next = `#${id}`
        if (window.location.hash !== next) {
          window.history.replaceState({}, '', next)
        }
      },
      { rootMargin: '-80px 0px -65% 0px', threshold: 0 },
    )
    sections.forEach((s) => obs.observe(s))
    return () => obs.disconnect()
  }, [selector])
}
```

- [ ] **Step 2: Verify typecheck**

```bash
bun run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add dev/app/hooks/useHashSpy.ts
git commit -m "feat(dev): add useHashSpy hook"
```

---

### Task 34: Create useHashScrollOnMount hook

**Files:**
- Create: `dev/app/hooks/useHashScrollOnMount.ts`

- [ ] **Step 1: Create dev/app/hooks/useHashScrollOnMount.ts**

```ts
import { useEffect } from 'react'
import { useLocation } from 'react-router'

/**
 * On mount and on hash change, scroll the element matching `location.hash`
 * into view. React Router does NOT do this automatically.
 */
export function useHashScrollOnMount() {
  const { hash } = useLocation()
  useEffect(() => {
    if (!hash) return
    const id = hash.slice(1)
    const el = document.getElementById(id)
    if (!el) return
    // instant — animated scroll on mount feels janky
    el.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' })
  }, [hash])
}
```

- [ ] **Step 2: Verify typecheck**

```bash
bun run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add dev/app/hooks/useHashScrollOnMount.ts
git commit -m "feat(dev): add useHashScrollOnMount hook"
```

---

### Task 35: Wire useHashSpy into pages; wire DocsSidebar to read URL

**Files:**
- Modify: `dev/pages/components/ComponentsPage.tsx`, `dev/pages/foundations/FoundationsPage.tsx`
- Modify: `dev/app/chrome/DocsSidebar.tsx`, `dev/app/chrome/FoundationsSidebar.tsx`
- Modify: `dev/app/layouts/DocsLayout.tsx`

- [ ] **Step 1: Add useHashSpy + useHashScrollOnMount calls in ComponentsPage**

```tsx
import { useHashSpy } from '../../app/hooks/useHashSpy'
import { useHashScrollOnMount } from '../../app/hooks/useHashScrollOnMount'

export function ComponentsPage() {
  useHashSpy('[data-component]')
  useHashScrollOnMount()
  // ... rest unchanged
}
```

- [ ] **Step 2: Same for FoundationsPage**

```tsx
useHashSpy('[data-foundation]')
useHashScrollOnMount()
```

- [ ] **Step 3: Update DocsSidebar to read activeId from useLocation**

Remove the `activeId` prop. Inside DocsSidebar:

```tsx
import { useLocation } from 'react-router'

export function DocsSidebar({ page }: { page: Page }) {
  const { hash } = useLocation()
  const activeId = hash.slice(1) || (page === 'components' ? 'button' : 'overview')
  if (page === 'foundations') return <FoundationsSidebar activeId={activeId} />
  // ... rest unchanged
}
```

- [ ] **Step 4: Update FoundationsSidebar similarly**

It can either keep its `activeId` prop (passed from DocsSidebar) or read from `useLocation` directly. Either works; pick the one that requires fewer downstream edits.

- [ ] **Step 5: Update DocsLayout to drop activeId derivation**

```tsx
export function DocsLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const page = pathToPage(location.pathname)

  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteHeader page={page} onPageChange={(p) => navigate(`/${p}`)} />
      <div className="mx-auto flex max-w-screen-2xl">
        <DocsSidebar page={page} />
        <main className="min-w-0 flex-1 px-6 py-10 lg:px-12">
          <Outlet />
        </main>
      </div>
      <ScrollRestoration />
    </div>
  )
}
```

- [ ] **Step 6: Verify**

```bash
bun run typecheck
```

Browser smoke:
- /components — scroll the page; URL hash updates as you pass each component section. Sidebar item highlights match the visible section.
- /components#switch — refresh; page loads scrolled to the Switch section.
- Switch to /foundations — same behavior with foundation sections.
- Click a sidebar item: page scrolls to that section, URL updates.
- Browser back/forward: navigates between routes correctly.

- [ ] **Step 7: Commit**

```bash
git add dev/pages/components/ComponentsPage.tsx dev/pages/foundations/FoundationsPage.tsx dev/app/chrome/DocsSidebar.tsx dev/app/chrome/FoundationsSidebar.tsx dev/app/layouts/DocsLayout.tsx
git commit -m "feat(dev): URL-as-truth via useHashSpy + useHashScrollOnMount"
```

---

# PHASE 8 — Promote useTheme to Context-backed Provider

Final cleanup: theme becomes Context-backed so multiple consumers stay in sync.

---

### Task 36: Refactor useTheme to Context-backed; mount ThemeProvider

**Files:**
- Modify: `dev/app/hooks/useTheme.ts`, `dev/app/Providers.tsx`

- [ ] **Step 1: Refactor dev/app/hooks/useTheme.ts**

```tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Theme = 'light' | 'dark'

type ThemeContextValue = {
  theme: Theme
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document === 'undefined') return 'light'
    return (document.documentElement.dataset.theme as Theme) || 'light'
  })
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme(): [Theme, (t: Theme) => void] {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return [ctx.theme, ctx.setTheme]
}
```

(Return shape stays as `[theme, setTheme]` so SiteHeader needs no changes.)

- [ ] **Step 2: Update dev/app/Providers.tsx to mount ThemeProvider**

```tsx
import { TooltipProvider, Toaster } from '@lib'
import { ThemeProvider } from './hooks/useTheme'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={200}>
        {children}
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  )
}
```

- [ ] **Step 3: Verify**

```bash
bun run typecheck
```

Browser: refresh. Theme toggle in header still works. Toggle, refresh — theme persists (DOM dataset is the persistence layer; that's unchanged). Switch routes; theme stays.

To verify the multi-consumer benefit, you can temporarily add a second `useTheme()` call in DocsSidebar (e.g., a debug `<span>{theme}</span>`) and confirm both update synchronously when the header toggle is clicked. Remove the debug code before commit.

- [ ] **Step 4: Commit**

```bash
git add dev/app/hooks/useTheme.ts dev/app/Providers.tsx
git commit -m "refactor(dev): promote useTheme to Context-backed ThemeProvider"
```

---

# PHASE 9 — Final cleanup and verification

---

### Task 37: Final smoke test against success criteria

**Files:** none (verification only)

- [ ] **Step 1: Verify each spec success criterion (§8 of spec)**

Open the spec at `docs/superpowers/specs/2026-05-03-dev-studio-router-architecture-design.md` §8. For each of the 8 criteria:

1. `dev/App.tsx` no longer exists — `ls dev/App.tsx` should fail.
2. router.tsx lists 3 routes; visiting /, /components, /foundations, /builder works; refresh preserves; back/forward works.
3. /components#switch cold-loads with Switch section in view.
4. Scrolling components page updates the URL hash; sidebar highlights match.
5. Library bundle byte-equivalent: run `bun run build` and verify dist/ contents look identical to prior build (tree, file sizes). Spot-check no `react-router` string in `dist/palette.js`:
   ```bash
   grep -c react-router dist/palette.js
   ```
   Expected: 0.
6. Adding a new component example = one file edit. Sanity check by mentally adding a hypothetical entry to `groups/forms.tsx` — confirm no other file would need to change.
7. Theme toggle reflects everywhere. Already verified in Task 36.
8. No `dev/app/` file imports from `dev/pages/`. Verify:
   ```bash
   grep -rn "from '.*pages/" dev/app/
   ```
   Expected: empty output.

   No `dev/pages/<route>/` file imports from another page's folder. Verify:
   ```bash
   grep -rn "from '.*pages/components" dev/pages/foundations/ dev/pages/builder/
   grep -rn "from '.*pages/foundations" dev/pages/components/ dev/pages/builder/
   grep -rn "from '.*pages/builder" dev/pages/components/ dev/pages/foundations/
   ```
   Expected: empty for all three.

- [ ] **Step 2: If all criteria pass, write a final summary commit**

If everything passes, no further code changes. Tag the migration:

```bash
git tag dev-studio-restructure-complete
git log --oneline -40
```

If anything fails, open a follow-up task and fix.

- [ ] **Step 3: (Optional) Update README or CLAUDE.md if either documents the dev/ folder layout**

```bash
grep -rn "dev/App\|dev/builder" README.md CLAUDE.md 2>/dev/null
```

If matches exist, update them to reference the new structure.

---

# Summary

| Phase | Tasks | What's done |
|-------|-------|-------------|
| 1 | 1–5 | react-router installed, @lib alias configured, no-op router scaffold |
| 2 | 6–10 | Theme/header/footer/hero/providers extracted; SidebarNav still in App.tsx |
| 3 | 11–13 | Layouts created; real routes wired; page-state machine deleted |
| 4 | 14–17 | Pages moved; ComponentEntry/Preview extracted; builder folder relocated |
| 5 | 18–26 | Registry split into 7 group files; renderers promoted to React.ComponentType |
| 6 | 27–32 | Foundations split; sidebar finally extracted; App.tsx deleted; sandbox.css renamed |
| 7 | 33–35 | useHashSpy + useHashScrollOnMount; URL-as-truth wired |
| 8 | 36 | useTheme promoted to Context-backed Provider |
| 9 | 37 | Final smoke + success-criterion verification |

Total: ~37 tasks (Task 8 was skipped/relocated; numbers in the plan are sequential post-skip).

Each task is independently shippable. Each task ends with a commit. After Task 37: structure matches spec §3.1 exactly.
