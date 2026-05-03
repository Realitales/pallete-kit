# Dev Studio: React Router + Architecture Restructure

**Date:** 2026-05-03
**Status:** Design approved; ready for plan-writing.
**Scope:** `dev/` directory only. Published library (`src/`) is untouched.

---

## 1. Context

The `dev/` directory is a Vite-served local studio (`npm run dev`) that consumes the published library from `src/`. It is never bundled into `dist/` (`vite-plugin-dts` excludes `dev/`; `vite.config.ts` lib-mode targets `src/index.ts`).

### Current state

- `dev/App.tsx` is a 2023-line file that owns:
  - Layout shell (`SiteHeader`, `SidebarNav`, `FooterNote`)
  - Page-state machine (`useState<'components' | 'foundations' | 'builder'>`)
  - Theme state (hook-only `useTheme` at line 198)
  - Scroll-spy via `IntersectionObserver` writing to local `useState<activeId>`
  - The `REGISTRY` of 7 component groups / 53 entries
  - All ~50 inline example render functions (`Ex_Button`, `Ex_Switch`, etc.) with their own hooks
  - Sub-components (`ComponentEntry`, `ComponentPreview`, `FoundationSection`, foundation sections)
- `dev/builder/` is already split into 9 small role-based files. No changes to its internal shape.
- No URL state. Refresh resets to `'components'`. No shareable links. Browser back/forward is a no-op.
- Library imports from `dev/` use relative paths (`'../../src'`, `'../src/styles/index.css'`) — fragile under any folder reorganization.

### Problems being addressed

1. God-file: layout + state + theme + registry + 50 example renderers in one file.
2. State-only navigation: no URLs, no deep links, no scroll restoration.
3. Layout shell knows about pages (`SiteHeader` takes `page` prop, `SidebarNav` takes `activeId` prop) — not actually generic.
4. Builder is special-cased: `page === 'builder' ? <Builder /> : <docs-layout>`.
5. Example renderers have no identity — anonymous functions inside the registry array, hooks owned by `ComponentEntry`'s render phase rather than the example itself.
6. Sidebar↔scroll coupling pushes state down through props instead of reading from the URL.
7. Brittle library-import paths.

### Driver

Architectural cleanup pass before the studio grows further. Near-term roadmap includes a future `pages/animations/` page (GSAP samples). The structure must absorb new top-level pages without restructure.

---

## 2. Decisions

| # | Decision | Why |
|---|----------|-----|
| D1 | React Router lives in `dev/` only. Library stays router-free. | Component libraries that depend on a router force consumers to use it (or work around it) and conflict with Next.js / TanStack Router consumers. |
| D2 | React Router v7 in library mode (`createBrowserRouter`). | v7 lib mode ≈ v6 + better APIs; framework mode is heavy and unnecessary for an SPA studio. |
| D3 | `BrowserRouter` (clean URLs), not `HashRouter`. | Vite dev handles SPA fallback. No static-host requirement today. Trivially swappable later. |
| D4 | Three top-level routes: `/components`, `/foundations`, `/builder`. `/` redirects to `/components`. | Mirrors today's page-state model. |
| D5 | Hash-based deep links within pages (`/components#switch`). | Preserves the existing one-long-scroll UX. URL becomes the single source of truth for active item. |
| D6 | Single `router.tsx` file mirroring `pages/` 1:1. No file-based routing plugin. No per-route config files. | For 3-8 routes, a single grep-able file beats either alternative. |
| D7 | Two layouts (`DocsLayout`, `StudioLayout`), composed by parent route entries. | Eliminates `if (page === 'builder')` branching. |
| D8 | Three-folder top-level partition: `app/`, `pages/`, `shared/`. | Folder-by-feature reads better than folder-by-type for SPAs above ~10 files. Three folders cover cross-cutting / per-route / no-React utility — anything more is invented structure. |
| D9 | Per-group example files (`groups/forms.tsx`, etc.). One file per registry group. | 7 files of ~7-18 examples each is the right granularity at 53 entries. Per-component would be 53 tiny files; mega-file is what we're escaping. |
| D10 | Promote example renderers from `() => React.ReactNode` to `React.ComponentType`. Rename `Ex_Foo` → `FooExample`. ComponentEntry renders via `<entry.Component />`. | Today's pattern puts example hooks inside ComponentEntry's hook list — fragile. Promoting examples to real components gives each its own hook list, DevTools identity, and Strict Mode lifecycle. |
| D11 | Promote `useTheme` from hook-only (today) to Context-backed Provider. | Today works because a single component calls it. Once chrome is split across multiple files, multiple consumers would desync. Small justified upgrade. |
| D12 | `app/Providers` wraps `<RouterProvider />`. Never the inverse. Never inside layouts. | Prevents provider remount on navigation. Theme/toast/tooltip context survives all routes. |
| D13 | URL is the single source of truth for active item. No `useState<activeId>`. | `useHashSpy(selector)` writes to URL via `history.replaceState`. `DocsSidebar` reads via `useLocation().hash`. |
| D14 | Path alias `@lib` → `./src` configured in `vite.config.ts`, `tsconfig.json`, `tsconfig.build.json`. All current `'../../src'` and `'../src/styles/...'` imports swept to `'@lib/...'`. | Future folder reorganizations within `dev/` never break library imports. One-time setup cost. |
| D15 | Builder folder moves from `dev/builder/` to `dev/pages/builder/`. Internal organization unchanged. New `BuilderPage.tsx` is the only addition. | The builder is genuinely a different kind of thing than docs pages. Cohesion over symmetry. |
| D16 | `<ScrollRestoration />` rendered inside each layout. `useHashScrollOnMount()` hook handles cold-load deep links. | React Router does neither automatically. Without explicit handling, navigation feels broken. |

---

## 3. Architecture

### 3.1 Folder structure

```
dev/
  main.tsx                              # 10 lines: providers + router mount
  router.tsx                            # createBrowserRouter() — the route tree
  studio.css                            # was sandbox.css

  app/                                  # cross-cutting concerns
    Providers.tsx                       # ThemeProvider + TooltipProvider + Toaster
    layouts/
      DocsLayout.tsx                    # SiteHeader + DocsSidebar + <Outlet/> + <ScrollRestoration/>
      StudioLayout.tsx                  # SiteHeader + <Outlet/> + <ScrollRestoration/>
    chrome/
      SiteHeader.tsx                    # generic; reads active page from useLocation()
      DocsSidebar.tsx                   # reads active item from useLocation().hash
      FooterNote.tsx
    hooks/
      useTheme.ts                       # Context-backed; provides [theme, setTheme]
      useHashSpy.ts                     # IntersectionObserver -> location.hash via replaceState
      useHashScrollOnMount.ts           # scrolls to hash element on cold-load + hash changes

  pages/                                # one folder per route
    components/
      ComponentsPage.tsx                # composes groups; calls useHashSpy('[data-component]')
      ComponentEntry.tsx                # per-entry article wrapper
      ComponentPreview.tsx              # bordered preview box
      registry.ts                       # const groups = [...formGroup, ...]
      groups/
        forms.tsx                       # exports { label, entries } + per-entry components
        display.tsx
        navigation.tsx
        overlay.tsx
        disclosure.tsx
        data.tsx
        command.tsx

    foundations/
      FoundationsPage.tsx               # composes sections; calls useHashSpy('[data-foundation]')
      FoundationSection.tsx             # shared section wrapper
      sections/
        Overview.tsx
        Colors.tsx
        Typography.tsx
        Spacing.tsx
        Radius.tsx
        Shadows.tsx
        Iconography.tsx

    builder/                            # was dev/builder/ — moved with minimal disruption
      BuilderPage.tsx                   # thin route component wrapping existing Builder
      Builder.tsx                       # (existing)
      Canvas.tsx                        # (existing)
      Inspector.tsx                     # (existing)
      Palette.tsx                       # (existing)
      PlacedNode.tsx                    # (existing)
      blocks.tsx                        # (existing)
      store.ts                          # (existing)
      ViewportToggle.tsx                # (existing)
      DeviceFrame.tsx                   # (existing)

  shared/                               # no React tree dependency
    types.ts                            # GroupMeta, EntryMeta, FoundationSectionMeta

REMOVED:
  dev/App.tsx
  dev/sandbox.css                       # renamed to dev/studio.css
```

### 3.2 Import-direction rules

```
   main.tsx
       │
       ▼
  app/Providers.tsx ──►  @lib  (consumes library)
       │
       ▼
   router.tsx ────────►  app/layouts/*.tsx
                              │
                              ▼
                        app/chrome/*.tsx ──►  app/hooks/*.ts ──►  shared/types.ts
                              │
                              ▼
                        pages/<route>/<Page>.tsx
                              │
                              ▼
                        pages/<route>/<internals> ──►  @lib  (consumes library)
```

- `app/` may import from `shared/` and `@lib`. Never from `pages/`.
- `pages/` may import from `app/`, `shared/`, `@lib`. Never from sibling pages.
- `shared/` imports nothing local. Pure types and utilities.
- Within a page folder, siblings may import each other freely. Across pages — never.

Cycles are impossible by construction.

### 3.3 Registry pattern

```ts
// shared/types.ts
export type EntryMeta = {
  id: string
  name: string
  description: string
  // Component-typed (not function-typed) so each example owns its own hook list,
  // DevTools identity, and Strict Mode lifecycle.
  Component: React.ComponentType
}
export type GroupMeta = { label: string; entries: EntryMeta[] }
```

```tsx
// pages/components/groups/forms.tsx
import { Switch } from '@lib'
import type { GroupMeta } from '../../../shared/types'

function SwitchExample() { return <Switch defaultChecked /> }

export const formGroup: GroupMeta = {
  label: 'Form',
  entries: [
    { id: 'switch', name: 'Switch', description: 'On/off toggle.', Component: SwitchExample },
    // ...
  ],
}
```

```ts
// pages/components/registry.ts
import { formGroup } from './groups/forms'
import { displayGroup } from './groups/display'
// ...
export const groups: GroupMeta[] = [
  formGroup, displayGroup, navigationGroup,
  overlayGroup, disclosureGroup, dataGroup, commandGroup,
]
```

```tsx
// pages/components/ComponentEntry.tsx
export function ComponentEntry({ entry, num }: { entry: EntryMeta; num: string }) {
  return (
    <article id={entry.id} data-component className="scroll-mt-20">
      {/* heading + description */}
      <ComponentPreview num={num}>
        <entry.Component />
      </ComponentPreview>
    </article>
  )
}
```

**Adding a new component example = one file edit** (the relevant group file).

### 3.4 Routing topology

```tsx
// dev/router.tsx
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

**HMR caveat:** changes to the route tree in `router.tsx` require a full reload. Page components hot-reload normally.

### 3.5 Hash deep links + scroll behavior

- **Each page calls `useHashSpy(selector)`** with its own data-attribute. ComponentsPage uses `[data-component]`; FoundationsPage uses `[data-foundation]`. The hook is shared (`app/hooks/useHashSpy.ts`); the selector is page-owned.
- **`useHashSpy` MUST use `history.replaceState({}, '', '#id')`.** Never `pushState` (pollutes history). Never `location.hash = 'id'` (triggers native scroll-jump). Encode this in a comment so it doesn't get "simplified" later.
- **DocsSidebar reads `useLocation().hash`** to highlight the active item. No prop drilling, no state mirroring.
- **Cross-route scroll restoration:** `<ScrollRestoration />` (from `react-router`) rendered inside each layout. Only one layout mounts per route, so there is no double-firing concern.
- **Cold-load deep links** (`/components#switch` typed in address bar): each page calls `useHashScrollOnMount()`, which reads `useLocation().hash`, finds the element, and `scrollIntoView({ behavior: 'instant' })`. React Router does NOT do this for you.

### 3.6 Provider boundary

```tsx
// dev/main.tsx
ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>
)

// dev/app/Providers.tsx
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

`useTheme` is promoted from hook-only to Context-backed:

```tsx
// dev/app/hooks/useTheme.ts
const ThemeContext = React.createContext<{
  theme: 'light' | 'dark'
  setTheme: (t: 'light' | 'dark') => void
} | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    (document.documentElement.dataset.theme as 'light' | 'dark') || 'light'
  )
  useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
```

### 3.7 Path alias setup

- **vite.config.ts**: `resolve.alias: { '@lib': resolve(__dirname, 'src') }`
- **tsconfig.json**: `baseUrl: '.'`, `paths: { '@lib': ['src/index.ts'], '@lib/*': ['src/*'] }`
- **tsconfig.build.json**: same paths config (kept aligned even though dts excludes `dev/`)
- **One-time sweep**: 4 files have library imports today — `dev/main.tsx`, `dev/builder/Canvas.tsx`, `dev/builder/Inspector.tsx`, `dev/builder/blocks.tsx`. All convert from `'../../src'` / `'../src/styles/index.css'` to `'@lib'` / `'@lib/styles/index.css'`.

After this, the builder folder move (Step 4) is purely path-only.

---

## 4. Migration Plan

Each step is independently shippable. Studio stays functional at every commit.

| Step | Action | Risk |
|------|--------|------|
| 1 | Install `react-router@^7`. Configure `@lib` alias in `vite.config.ts` + both tsconfigs. Sweep 4 files' library imports to `@lib`. Wrap root with `<Providers><RouterProvider router={router}/></Providers>` where `router` has one catch-all route pointing to `<App />`. App.tsx unchanged. | Low — no behavior change. |
| 2 | Extract `SiteHeader`, `SidebarNav` (renamed `DocsSidebar`), `FooterNote` from App.tsx into `app/chrome/`. SiteHeader reads active page from `useLocation()`. App.tsx no longer prop-drills `page`/`activeId`. The current hook-only `useTheme` moves to `app/hooks/useTheme.ts` unchanged (still a hook; promotion to Context happens in step 8). | Low — pure extraction. |
| 3 | Create `app/layouts/DocsLayout.tsx` + `StudioLayout.tsx`. Update `router.tsx` with real routes. Pages still defined in App.tsx but imported from there. **DELETE the `useState<Page>` + page-switching effect.** Routing replaces it. | Medium — first behavior-affecting step; smoke-test all three pages. |
| 4 | Move `ComponentsPage`, `FoundationsPage` into `pages/`. Move `dev/builder/*` to `dev/pages/builder/*` (path-only, no import edits — alias already in place). Add `BuilderPage.tsx`. **DELETE `dev/App.tsx`.** | Low — file moves only. |
| 4.5 | Promote example renderers: rename `Ex_Foo` → `FooExample`, change `EntryMeta.render: () => ReactNode` → `Component: React.ComponentType`, ComponentEntry renders `<entry.Component />`. | Low — mechanical rename across 53 entries. |
| 5 | Split registry: per-group files under `pages/components/groups/`. Each exports a `GroupMeta`. `pages/components/registry.ts` imports and concatenates. ComponentsPage consumes `groups`. | Low — moving code, not changing it. |
| 6 | Split foundations: extract `FoundationSection.tsx` wrapper. One section per file under `pages/foundations/sections/`. FoundationsPage composes them in order. | Low. |
| 7 | Replace scroll-spy state with URL: create `useHashSpy` and `useHashScrollOnMount` in `app/hooks/`. Each page calls `useHashSpy(selector)`. DocsSidebar reads `useLocation().hash`. **DELETE the `activeId` useState** in App layer. Add `<ScrollRestoration />` inside each layout. | Medium — touches sidebar highlighting; verify deep-link UX manually. |
| 8 | Promote `useTheme` to Context-backed Provider in `app/hooks/useTheme.ts`. ThemeProvider added to `Providers`. | Low. |

After step 8: `dev/App.tsx` is gone, every concern lives in exactly one place, the structure matches §3.1 exactly.

---

## 5. Open Questions (resolve at spec review)

**Q1. Builder routing — single-state or sub-routes later?**
Default: single `/builder` route with no URL-encoded state. If you anticipate saved/shareable builder layouts (e.g., `/builder/<doc-id>`), the StudioLayout's children array gets one extra route — no structural change. Confirm: single-state is correct for this pass?

**Q2. Animations page (GSAP) — confirmed as future, not now.**
Confirmed in design discussion. `pages/animations/` slots in later as a third top-level page mirroring `pages/components/` shape. No GSAP install, no animations folder in this pass. Listed here so the assumption is captured in writing.

---

## 6. YAGNI — explicitly NOT building

These were considered and rejected as not warranted today. Each fits the structure cleanly later if needed:

- **MDX support** for foundations text. Add later by changing a section file's import.
- **Prop documentation per component.** Extend `EntryMeta` with optional `propsTable?: PropDef[]`; ComponentEntry conditionally renders. No new files.
- **Code-source preview / copy-as-source.** Extend `EntryMeta` with optional `source?: string`. No new files.
- **Plugin/extension system.** Internal lib; no third-party consumers.
- **Theme registry / multi-brand switching in studio.** Multi-brand is a *library* concern; studio is single-tenant for development.
- **Test infrastructure.** None in repo today. Out of scope.
- **Builder URL serialization (`/builder/<id>`).** Builder has no persisted state. If added, slots into the StudioLayout children array.
- **Per-component routes (`/components/switch`).** Hash deep links cover this without UX rewrite.
- **Barrel files at every folder level.** Use barrels only at the registry assembly point (`pages/components/registry.ts`). Otherwise explicit imports.
- **Reorganizing `src/components/` flat structure.** Out of scope; would have consumer impact.
- **Route-based code-splitting (`React.lazy()`).** Studio bundle is small enough today. When `pages/animations/` lands with GSAP + plugins, lazy is a 5-line refactor: wrap each route's `element` with `<Suspense>` + a lazy-imported page.
- **Animations page (GSAP samples).** Pre-validated: slots into `pages/animations/` when needed; same shape as `pages/components/`.

---

## 7. Out of scope (will not be touched)

- `src/` library structure or any of its files.
- Library bundle / build configuration (`vite.config.ts` `build.lib` block, dts plugin).
- Tailwind v4 config or CSS token files (`src/styles/`).
- Existing builder internals (Canvas, Inspector, Palette, store, etc.) — folder moves, not edits.

---

## 8. Success Criteria

When the migration is complete:

1. `dev/App.tsx` no longer exists.
2. `dev/router.tsx` lists 3 routes; visiting `/`, `/components`, `/foundations`, `/builder` works; refresh preserves the page; back/forward navigates correctly.
3. Visiting `/components#switch` cold-loads with the Switch section in view.
4. Scrolling the components page updates the URL hash; the sidebar highlights the section under the viewport.
5. The studio bundle (`vite build` of `dev/` if invoked, otherwise `npm run dev`) imports nothing from `react-router` into `dist/`. `dist/` is byte-equivalent to before the refactor for the library output.
6. Adding a new component example requires editing exactly one file: the relevant `pages/components/groups/<group>.tsx`.
7. Theme toggle in any chrome component (header today, possibly sidebar/toolbar later) reflects in all other consumers without page reload.
8. No file in `dev/app/` imports from `dev/pages/`. No file in `dev/pages/<route>/` imports from another page's folder.
