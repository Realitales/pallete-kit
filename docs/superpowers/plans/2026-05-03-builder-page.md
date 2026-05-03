# Builder Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a third sandbox page to Palette — a Figma-style free-form page builder where the team drags components from a left palette onto a Phone or Desktop viewport canvas, repositions them, edits their props in a right inspector, and persists work in localStorage.

**Architecture:** A new `dev/builder/` directory with focused per-concern files (Builder, Palette, Canvas, DeviceFrame, PlacedNode, Inspector, ViewportToggle). State lives in the existing `useBuilderStore` hook (already implemented). Drag-drop via `@dnd-kit/core` (already installed). `dev/App.tsx` is taught about a new `'builder'` page that swaps in the Builder layout in place of the existing sidebar/main shell.

**Tech Stack:** React 19, TypeScript, Tailwind v4, `@dnd-kit/core` 6.3.1, `@dnd-kit/utilities` 3.2.2, Bun, Vite. No test framework — verification is `bun run typecheck` plus targeted in-browser checks.

**Companion spec:** `docs/superpowers/specs/2026-05-03-builder-page-design.md`

**Project conventions to follow:**
- Imports: components from `'../../src'` (relative to `dev/builder/`).
- Styling: Tailwind v4 utilities + tokens (`bg-bg`, `text-fg`, `border-border`, `text-muted-fg`, `bg-acid`, etc., already defined in `src/styles/tokens.css`).
- Type-safety mode: strict; `noUnusedLocals` and `noUnusedParameters` are on. Avoid declaring unused imports.
- Verification gate: `bun run typecheck` after each task. Browser smoke at `http://localhost:5174/` (or wherever Vite landed).
- This repo is **not a git repo** — there is no `git commit` step. Each task ends with a "Checkpoint" marker confirming the task is verifiably complete.

---

## File Structure

```
dev/
├── App.tsx                            (modify — add 'builder' Page + render branch)
└── builder/
    ├── blocks.tsx           (exists, unchanged)
    ├── store.ts             (exists, unchanged)
    ├── Builder.tsx          (new — page entry: DndContext + 3-pane layout + handlers)
    ├── Palette.tsx          (new — left pane, draggable block list)
    ├── Canvas.tsx           (new — center pane: toolbar + DeviceFrame + droppable)
    ├── DeviceFrame.tsx      (new — desktop / phone chrome shells)
    ├── PlacedNode.tsx       (new — memoized absolutely-positioned draggable node)
    ├── Inspector.tsx        (new — right pane, schema-driven controls)
    └── ViewportToggle.tsx   (new — desktop / phone pill switcher)
```

Each file has one responsibility. The Builder coordinates everything; Palette / Canvas / Inspector are leaf panes; DeviceFrame / ViewportToggle / PlacedNode are pure visual primitives.

---

## Task 1 — Wire Builder page into App.tsx

**Goal:** Add `'builder'` to the page nav and render a stub Builder so navigation is verifiable before we build anything inside it.

**Files:**
- Modify: `dev/App.tsx`
- Create: `dev/builder/Builder.tsx`

- [ ] **Step 1: Create the Builder stub**

Create `dev/builder/Builder.tsx`:

```tsx
export function Builder() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
      <p className="text-muted-fg font-display text-xl italic">
        Builder coming online…
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Update the `Page` union type in `dev/App.tsx`**

Find the line:

```tsx
type Page = 'components' | 'foundations'
```

Change it to:

```tsx
type Page = 'components' | 'foundations' | 'builder'
```

- [ ] **Step 3: Import the Builder stub**

Near the top of `dev/App.tsx`, add:

```tsx
import { Builder } from './builder/Builder'
```

- [ ] **Step 4: Add a "Builder" link to `SiteHeader`**

Find the `<nav>` containing the `<PageNavLink>` for Components and Foundations. Add a third link:

```tsx
<PageNavLink
  active={page === 'builder'}
  onClick={() => onPageChange('builder')}
>
  Builder
</PageNavLink>
```

- [ ] **Step 5: Branch the main render in `App()`**

Find the JSX in the `App()` component that currently looks like:

```tsx
<div className="mx-auto flex max-w-screen-2xl">
  <SidebarNav page={page} activeId={activeId} />
  <main className="min-w-0 flex-1 px-6 py-10 lg:px-12">
    {page === 'components' ? <ComponentsPage /> : <FoundationsPage />}
    <FooterNote />
  </main>
</div>
```

Replace with:

```tsx
{page === 'builder' ? (
  <Builder />
) : (
  <div className="mx-auto flex max-w-screen-2xl">
    <SidebarNav page={page} activeId={activeId} />
    <main className="min-w-0 flex-1 px-6 py-10 lg:px-12">
      {page === 'components' ? <ComponentsPage /> : <FoundationsPage />}
      <FooterNote />
    </main>
  </div>
)}
```

- [ ] **Step 6: Typecheck**

Run: `bun run typecheck`
Expected: clean, no errors.

- [ ] **Step 7: Browser smoke**

Open the dev server. Click "Builder" in the header. Verify:
- The "Builder coming online…" stub renders.
- The "Builder" link gets the lime underline (active state).
- Clicking back to Components / Foundations restores those pages.

- [ ] **Step 8: Checkpoint**

Task 1 complete. The page nav supports three pages.

---

## Task 2 — Three-pane shell wired to the store

**Goal:** Build the Builder's three-pane layout with stub Palette / Canvas / Inspector and wire the existing `useBuilderStore` hook.

**Files:**
- Modify: `dev/builder/Builder.tsx`
- Create: `dev/builder/Palette.tsx` (stub)
- Create: `dev/builder/Canvas.tsx` (stub)
- Create: `dev/builder/Inspector.tsx` (stub)

- [ ] **Step 1: Stub `dev/builder/Palette.tsx`**

```tsx
export function Palette() {
  return (
    <aside className="w-60 shrink-0 overflow-y-auto border-r border-border bg-card">
      <div className="px-4 py-5">
        <p className="font-display text-fg text-base font-semibold">Blocks</p>
        <p className="text-muted-fg mt-1 text-xs">Drag onto the canvas</p>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Stub `dev/builder/Canvas.tsx`**

```tsx
import type { Viewport } from './store'

export function Canvas({ viewport }: { viewport: Viewport }) {
  return (
    <div className="relative flex flex-1 flex-col items-center overflow-auto bg-muted/30 p-8">
      <p className="text-muted-fg tag mb-4">Viewport: {viewport}</p>
      <div className="rounded-md border border-border bg-bg p-12">
        Canvas goes here
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Stub `dev/builder/Inspector.tsx`**

```tsx
import type { CanvasNode } from './store'

export function Inspector({ node }: { node: CanvasNode | null }) {
  return (
    <aside className="w-[300px] shrink-0 overflow-y-auto border-l border-border bg-card">
      <div className="px-4 py-5">
        <p className="font-display text-fg text-base font-semibold">Inspector</p>
        <p className="text-muted-fg mt-1 text-xs">
          {node ? `Selected: ${node.type}` : 'Select a block to edit'}
        </p>
      </div>
    </aside>
  )
}
```

- [ ] **Step 4: Wire the store + render the three panes from `Builder.tsx`**

Replace the entirety of `dev/builder/Builder.tsx` with:

```tsx
import { useBuilderStore } from './store'
import { Palette } from './Palette'
import { Canvas } from './Canvas'
import { Inspector } from './Inspector'

export function Builder() {
  const store = useBuilderStore()
  const selectedNode =
    store.nodes.find((n) => n.id === store.selectedId) ?? null

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <Palette />
      <Canvas viewport={store.viewport} />
      <Inspector node={selectedNode} />
    </div>
  )
}
```

- [ ] **Step 5: Typecheck**

Run: `bun run typecheck`
Expected: clean.

- [ ] **Step 6: Browser smoke**

Reload the Builder page. Verify:
- Three panes render side by side: 240px / flex-1 / 300px.
- The middle pane shows "Viewport: desktop".
- Switching to Components or Foundations and back keeps the layout sound.

- [ ] **Step 7: Verify localStorage persistence still works**

In the browser console, run:

```js
localStorage.setItem('palette-builder-v1', JSON.stringify({
  nodes: [{ id: 'manual', type: 'Button', x: 100, y: 100, props: { children: 'Hello', variant: 'default', size: 'default' } }],
  viewport: 'phone',
}))
```

Reload. The Canvas should now read "Viewport: phone".

Reset:
```js
localStorage.removeItem('palette-builder-v1')
```

- [ ] **Step 8: Checkpoint**

Task 2 complete. Shell is in place, store hook is wired, persistence round-trips.

---

## Task 3 — DeviceFrame: desktop variant

**Goal:** Build the desktop browser-chrome frame and embed it in the Canvas. The interior element receives the well-known DOM id used later for drop position math.

**Files:**
- Create: `dev/builder/DeviceFrame.tsx`
- Modify: `dev/builder/Canvas.tsx`

- [ ] **Step 1: Create `dev/builder/DeviceFrame.tsx` with desktop only**

```tsx
import type { Viewport } from './store'

export function DeviceFrame({
  variant,
  children,
}: {
  variant: Viewport
  children?: React.ReactNode
}) {
  if (variant === 'desktop') {
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <DesktopChromeBar />
        <div
          id="builder-canvas-content"
          className="grid-paper relative bg-bg"
          style={{ width: 1280, height: 768 }}
        >
          {children}
        </div>
      </div>
    )
  }
  // Phone branch added in Task 4.
  return null
}

function DesktopChromeBar() {
  return (
    <div className="flex h-8 items-center gap-3 border-b border-border bg-card px-3">
      <div className="flex items-center gap-1.5">
        <span className="block size-2.5 rounded-full bg-muted" />
        <span className="block size-2.5 rounded-full bg-muted" />
        <span className="block size-2.5 rounded-full bg-muted" />
      </div>
      <div className="bg-muted/60 mx-auto rounded-full px-3 py-0.5">
        <span className="font-mono text-muted-fg text-[10px]">
          palette.studio/preview
        </span>
      </div>
      <div className="size-2.5" /> {/* spacer to balance traffic-light gutter */}
    </div>
  )
}
```

- [ ] **Step 2: Render the frame from `Canvas.tsx`**

Replace `dev/builder/Canvas.tsx` with:

```tsx
import type { Viewport } from './store'
import { DeviceFrame } from './DeviceFrame'

export function Canvas({ viewport }: { viewport: Viewport }) {
  return (
    <div className="relative flex flex-1 flex-col items-center overflow-auto bg-muted/30 px-8 py-10">
      <DeviceFrame variant={viewport} />
    </div>
  )
}
```

- [ ] **Step 3: Typecheck**

Run: `bun run typecheck`
Expected: clean.

- [ ] **Step 4: Browser smoke**

Reload Builder. Verify:
- The desktop frame renders centered: rounded corners, border, shadow.
- Top chrome bar shows three muted dots, centered "palette.studio/preview" pill.
- Inner area is 1280×768, with the faint blueprint grid visible.
- Inspecting the inner element shows `id="builder-canvas-content"`.

- [ ] **Step 5: Checkpoint**

Task 3 complete. Desktop frame is in place.

---

## Task 4 — ViewportToggle + phone variant

**Goal:** Allow switching the canvas between Desktop and Phone frames via a pill switcher above the canvas.

**Files:**
- Modify: `dev/builder/DeviceFrame.tsx`
- Create: `dev/builder/ViewportToggle.tsx`
- Modify: `dev/builder/Canvas.tsx`
- Modify: `dev/builder/Builder.tsx`

- [ ] **Step 1: Add the phone branch to `DeviceFrame.tsx`**

Replace the placeholder `// Phone branch added in Task 4.` and the `return null` with:

```tsx
  return (
    <div
      className="relative overflow-hidden border-[6px] border-fg bg-card"
      style={{ borderRadius: 44, width: 390, height: 844 }}
    >
      <PhoneNotch />
      <div
        id="builder-canvas-content"
        className="grid-paper relative bg-bg"
        style={{ width: 390, height: 800, marginTop: 44 - 6 /* offset chrome bar baseline */ }}
      >
        {children}
      </div>
    </div>
  )
}

function PhoneNotch() {
  return (
    <div className="absolute left-1/2 top-2 z-10 h-6 w-28 -translate-x-1/2 rounded-full bg-fg" />
  )
}
```

(Replace the file's `function DesktopChromeBar()` block with both `DesktopChromeBar` and `PhoneNotch` as siblings — keep `DesktopChromeBar` intact.)

For clarity, the full file after this step should be:

```tsx
import type { Viewport } from './store'

export function DeviceFrame({
  variant,
  children,
}: {
  variant: Viewport
  children?: React.ReactNode
}) {
  if (variant === 'desktop') {
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <DesktopChromeBar />
        <div
          id="builder-canvas-content"
          className="grid-paper relative bg-bg"
          style={{ width: 1280, height: 768 }}
        >
          {children}
        </div>
      </div>
    )
  }
  return (
    <div
      className="relative overflow-hidden border-[6px] border-fg bg-card"
      style={{ borderRadius: 44, width: 390, height: 844 }}
    >
      <PhoneNotch />
      <div
        id="builder-canvas-content"
        className="grid-paper relative bg-bg"
        style={{ width: 390, height: 800 }}
      >
        {children}
      </div>
    </div>
  )
}

function DesktopChromeBar() {
  return (
    <div className="flex h-8 items-center gap-3 border-b border-border bg-card px-3">
      <div className="flex items-center gap-1.5">
        <span className="block size-2.5 rounded-full bg-muted" />
        <span className="block size-2.5 rounded-full bg-muted" />
        <span className="block size-2.5 rounded-full bg-muted" />
      </div>
      <div className="bg-muted/60 mx-auto rounded-full px-3 py-0.5">
        <span className="font-mono text-muted-fg text-[10px]">
          palette.studio/preview
        </span>
      </div>
      <div className="size-2.5" />
    </div>
  )
}

function PhoneNotch() {
  return (
    <div className="absolute left-1/2 top-2 z-10 h-6 w-28 -translate-x-1/2 rounded-full bg-fg" />
  )
}
```

- [ ] **Step 2: Create `dev/builder/ViewportToggle.tsx`**

```tsx
import type { Viewport } from './store'

export function ViewportToggle({
  value,
  onChange,
}: {
  value: Viewport
  onChange: (v: Viewport) => void
}) {
  return (
    <div className="bg-card inline-flex items-center gap-0 rounded-md border border-border p-0.5 text-sm">
      <ToggleButton active={value === 'desktop'} onClick={() => onChange('desktop')}>
        Desktop
      </ToggleButton>
      <ToggleButton active={value === 'phone'} onClick={() => onChange('phone')}>
        Phone
      </ToggleButton>
    </div>
  )
}

function ToggleButton({
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
      className="text-muted-fg data-[active=true]:bg-bg data-[active=true]:text-fg relative rounded-[5px] px-3 py-1 font-medium transition-colors hover:text-fg"
    >
      {children}
      {active && (
        <span className="absolute inset-x-2 -bottom-[3px] h-[2px] bg-acid" />
      )}
    </button>
  )
}
```

- [ ] **Step 3: Add a Canvas toolbar that hosts ViewportToggle**

Replace `dev/builder/Canvas.tsx`:

```tsx
import type { Viewport } from './store'
import { DeviceFrame } from './DeviceFrame'
import { ViewportToggle } from './ViewportToggle'

export function Canvas({
  viewport,
  onViewportChange,
}: {
  viewport: Viewport
  onViewportChange: (v: Viewport) => void
}) {
  return (
    <div className="relative flex flex-1 flex-col items-center overflow-auto bg-muted/30">
      <div className="sticky top-0 z-20 flex w-full items-center justify-between border-b border-border bg-bg/80 px-4 py-2 backdrop-blur">
        <ViewportToggle value={viewport} onChange={onViewportChange} />
        <span className="tag text-muted-fg tabular">
          {viewport === 'desktop' ? '1280 × 800' : '390 × 844'}
        </span>
      </div>
      <div className="flex min-h-[calc(100vh-3.5rem-3rem)] w-full items-center justify-center px-8 py-10">
        <DeviceFrame variant={viewport} />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Pass the setter from Builder**

In `dev/builder/Builder.tsx`, update the `<Canvas>` element to pass `onViewportChange`:

```tsx
<Canvas viewport={store.viewport} onViewportChange={store.setViewport} />
```

- [ ] **Step 5: Typecheck**

Run: `bun run typecheck`
Expected: clean.

- [ ] **Step 6: Browser smoke**

Reload Builder. Verify:
- Toolbar above canvas shows the two-button pill (Desktop active by default).
- Clicking Phone switches the frame to a 390×844 phone shape with a notch and rounded corners.
- The size readout on the right (`1280 × 800` / `390 × 844`) updates.
- Refreshing the page restores the viewport choice.

- [ ] **Step 7: Checkpoint**

Task 4 complete. Both viewport frames work and persist.

---

## Task 5 — Palette + DndContext + palette → canvas drop (with DragOverlay preview)

**Goal:** Make the left palette draggable. Drop a palette item onto the canvas and a node appears at the cursor position. While dragging, a real preview of the block (rendered at default props) follows the cursor via `<DragOverlay>`.

**Files:**
- Modify: `dev/builder/Builder.tsx`
- Modify: `dev/builder/DeviceFrame.tsx`
- Modify: `dev/builder/Palette.tsx`
- Modify: `dev/builder/Canvas.tsx`

**Order matters:** dnd-kit hooks (`useDraggable` / `useDroppable`) throw at render time if there's no `<DndContext>` ancestor. Steps 1 and 2 install the DndContext + droppable before any draggable hooks fire, so the page never enters a half-broken state.

- [ ] **Step 1: Wrap Builder in `<DndContext>` with empty handlers + DragOverlay shell**

Replace `dev/builder/Builder.tsx`:

```tsx
import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useBuilderStore } from './store'
import { BLOCKS } from './blocks'
import { Palette } from './Palette'
import { Canvas } from './Canvas'
import { Inspector } from './Inspector'

export function Builder() {
  const store = useBuilderStore()
  const selectedNode =
    store.nodes.find((n) => n.id === store.selectedId) ?? null

  const [activeDragType, setActiveDragType] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  )

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as
      | { kind: 'palette'; type: string }
      | { kind: 'placed' }
      | undefined
    if (data?.kind === 'palette') setActiveDragType(data.type)
  }

  function handleDragEnd(_event: DragEndEvent) {
    setActiveDragType(null)
    // Palette branch wired in Step 4; placed branch wired in Task 8.
  }

  function handleDragCancel() {
    setActiveDragType(null)
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex h-[calc(100vh-3.5rem)]">
        <Palette />
        <Canvas viewport={store.viewport} onViewportChange={store.setViewport} />
        <Inspector node={selectedNode} />
      </div>
      <DragOverlay dropAnimation={null}>
        {activeDragType ? <PalettePreview type={activeDragType} /> : null}
      </DragOverlay>
    </DndContext>
  )
}

function PalettePreview({ type }: { type: string }) {
  const schema = BLOCKS[type]
  if (!schema) return null
  return (
    <div className="pointer-events-none opacity-80 shadow-lg">
      {schema.render(schema.defaultProps)}
    </div>
  )
}
```

- [ ] **Step 2: Add `useDroppable` to the canvas interior in `DeviceFrame.tsx`**

The element with id `builder-canvas-content` already exists; we add the dnd-kit droppable to the same element. Add at the top of `DeviceFrame.tsx`:

```tsx
import { useDroppable } from '@dnd-kit/core'
```

Add this helper just below the imports:

```tsx
function CanvasInterior({
  width,
  height,
  children,
}: {
  width: number
  height: number
  children?: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' })
  return (
    <div
      ref={setNodeRef}
      id="builder-canvas-content"
      data-over={isOver}
      className="grid-paper relative bg-bg"
      style={{ width, height }}
    >
      {children}
    </div>
  )
}
```

Replace the two inline interior `<div id="builder-canvas-content" …>` blocks with `<CanvasInterior … />`. The desktop branch becomes:

```tsx
<CanvasInterior width={1280} height={768}>{children}</CanvasInterior>
```

The phone branch becomes:

```tsx
<CanvasInterior width={390} height={800}>{children}</CanvasInterior>
```

- [ ] **Step 3: Replace `dev/builder/Palette.tsx` with the draggable palette**

```tsx
import { useDraggable } from '@dnd-kit/core'
import { BLOCKS, BLOCK_GROUPS } from './blocks'

export function Palette() {
  return (
    <aside className="w-60 shrink-0 overflow-y-auto border-r border-border bg-card">
      <div className="px-4 py-5">
        <p className="font-display text-fg text-base font-semibold">Blocks</p>
        <p className="text-muted-fg mt-1 text-xs">Drag onto the canvas</p>
      </div>
      <div className="px-3 pb-6">
        {BLOCK_GROUPS.map((g) => (
          <div key={g.label} className="mb-4">
            <p className="tag text-muted-fg mb-2 px-2">{g.label}</p>
            <ul className="space-y-1">
              {g.types.map((t) => (
                <PaletteItem key={t} type={t} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  )
}

function PaletteItem({ type }: { type: string }) {
  const schema = BLOCKS[type]
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${type}`,
    data: { kind: 'palette', type },
  })
  return (
    <li>
      <button
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        data-dragging={isDragging}
        className="hover:bg-muted hover:text-fg data-[dragging=true]:opacity-30 flex w-full cursor-grab items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors active:cursor-grabbing"
      >
        <span className="bg-border h-2 w-2 rounded-sm" />
        <span>{schema?.label ?? type}</span>
      </button>
    </li>
  )
}
```

Note: no `transform` or `CSS.Translate` on the source element — the visual ghost during drag is rendered exclusively by the `<DragOverlay>` we wired in Step 1. The source button just dims to 30% opacity to show "this one is being dragged."

- [ ] **Step 4: Wire the `onDragEnd` palette branch**

In `dev/builder/Builder.tsx`, replace the body of `handleDragEnd` with the palette logic:

```tsx
  function handleDragEnd(event: DragEndEvent) {
    setActiveDragType(null)
    const { active, over, delta, activatorEvent } = event
    const data = active.data.current as
      | { kind: 'palette'; type: string }
      | { kind: 'placed' }
      | undefined
    if (!data) return

    if (data.kind === 'palette' && over?.id === 'canvas') {
      const canvas = document.getElementById('builder-canvas-content')
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const e = activatorEvent as PointerEvent
      const dropX = e.clientX + delta.x - rect.left
      const dropY = e.clientY + delta.y - rect.top
      store.addNode(data.type, dropX, dropY)
    }
    // Placed-move branch added in Task 8.
  }
```

- [ ] **Step 5: Render placed nodes inside the canvas interior**

Pass `nodes` into `Canvas` and on into `DeviceFrame`. Replace `dev/builder/Canvas.tsx`:

```tsx
import type { CanvasNode, Viewport } from './store'
import { DeviceFrame } from './DeviceFrame'
import { ViewportToggle } from './ViewportToggle'

export function Canvas({
  viewport,
  onViewportChange,
  nodes,
}: {
  viewport: Viewport
  onViewportChange: (v: Viewport) => void
  nodes: CanvasNode[]
}) {
  return (
    <div className="relative flex flex-1 flex-col items-center overflow-auto bg-muted/30">
      <div className="sticky top-0 z-20 flex w-full items-center justify-between border-b border-border bg-bg/80 px-4 py-2 backdrop-blur">
        <ViewportToggle value={viewport} onChange={onViewportChange} />
        <span className="tag text-muted-fg tabular">
          {viewport === 'desktop' ? '1280 × 800' : '390 × 844'}
        </span>
      </div>
      <div className="flex min-h-[calc(100vh-3.5rem-3rem)] w-full items-center justify-center px-8 py-10">
        <DeviceFrame variant={viewport}>
          {nodes.map((n) => (
            <PlacedStub key={n.id} node={n} />
          ))}
        </DeviceFrame>
      </div>
    </div>
  )
}

function PlacedStub({ node }: { node: CanvasNode }) {
  return (
    <div
      className="absolute rounded border border-acid bg-card px-2 py-1 text-xs"
      style={{ left: node.x, top: node.y }}
    >
      {node.type}
    </div>
  )
}
```

(`PlacedStub` is temporary — Task 6 replaces it with the real `PlacedNode`.)

- [ ] **Step 6: Pass `nodes` from Builder to Canvas**

In `dev/builder/Builder.tsx`, update the `<Canvas>` JSX:

```tsx
<Canvas
  viewport={store.viewport}
  onViewportChange={store.setViewport}
  nodes={store.nodes}
/>
```

- [ ] **Step 7: Typecheck**

Run: `bun run typecheck`
Expected: clean.

- [ ] **Step 8: Browser smoke**

Reload Builder. Verify:
- The Palette lists 13 items grouped by Content / Form / Display.
- Hovering a palette item shows the grab cursor.
- Press-and-drag a palette item — the source button dims to 30%, and a **full preview of the block** (e.g. an actual styled Button) follows the cursor.
- Drop inside the desktop canvas — a small `acid-bordered` stub appears at roughly the cursor position (the real PlacedNode comes in Task 6).
- The stub label matches the dropped type ("Button", "Card", etc.).
- Drop a palette item *outside* the canvas (gray gutter) — nothing happens; the preview disappears, no node added.
- Refresh — dropped nodes persist.

- [ ] **Step 9: Reset state for Task 6**

In the browser console:
```js
localStorage.removeItem('palette-builder-v1')
```
Reload.

- [ ] **Step 10: Checkpoint**

Task 5 complete. Palette items drag with a full-block preview overlay; dropping creates a node at the cursor position.

---

## Task 6 — PlacedNode component (memoized, real renders)

**Goal:** Replace the temporary `PlacedStub` with `PlacedNode`, which renders the actual block via `BLOCKS[type].render()` and is memoized for re-render economy.

**Files:**
- Create: `dev/builder/PlacedNode.tsx`
- Modify: `dev/builder/Canvas.tsx`

- [ ] **Step 1: Create `dev/builder/PlacedNode.tsx`**

```tsx
import { memo } from 'react'
import type { CanvasNode } from './store'
import { BLOCKS } from './blocks'

type Props = {
  node: CanvasNode
}

function PlacedNodeInner({ node }: Props) {
  const schema = BLOCKS[node.type]
  if (!schema) return null
  return (
    <div
      className="absolute"
      style={{ left: node.x, top: node.y }}
      data-node-id={node.id}
    >
      {schema.render(node.props)}
    </div>
  )
}

export const PlacedNode = memo(PlacedNodeInner)
```

- [ ] **Step 2: Use it from Canvas**

In `dev/builder/Canvas.tsx`, replace the `PlacedStub` import/usage with `PlacedNode`. Drop the `PlacedStub` definition entirely. The DeviceFrame children block becomes:

```tsx
<DeviceFrame variant={viewport}>
  {nodes.map((n) => (
    <PlacedNode key={n.id} node={n} />
  ))}
</DeviceFrame>
```

Add the import at the top:

```tsx
import { PlacedNode } from './PlacedNode'
```

Remove the now-unused `import type { CanvasNode }` if it isn't needed elsewhere in the file (it is — keep it).

- [ ] **Step 3: Typecheck**

Run: `bun run typecheck`
Expected: clean.

- [ ] **Step 4: Browser smoke**

Reload. Drop a few different blocks: Button, Card, Alert, Badge, Heading. Verify:
- Each renders as the actual styled component, not a debug stub.
- Cards keep their fixed widths (320, 380 etc.); Button hugs its text.
- Multiple blocks can coexist; they overlap if dropped on top of each other.
- Refreshing preserves them.

- [ ] **Step 5: Checkpoint**

Task 6 complete. Real components render on the canvas at their drop positions.

---

## Task 7 — Click-to-select + canvas-click-to-deselect + selection ring

**Goal:** Clicking a placed node selects it (visual lime ring); clicking empty canvas deselects.

**Files:**
- Modify: `dev/builder/PlacedNode.tsx`
- Modify: `dev/builder/Canvas.tsx`
- Modify: `dev/builder/Builder.tsx`

- [ ] **Step 1: Extend `PlacedNode.tsx` with selection props and the ring**

```tsx
import { memo } from 'react'
import type { CanvasNode } from './store'
import { BLOCKS } from './blocks'

type Props = {
  node: CanvasNode
  selected: boolean
  onSelect: (id: string) => void
}

function PlacedNodeInner({ node, selected, onSelect }: Props) {
  const schema = BLOCKS[node.type]
  if (!schema) return null
  return (
    <div
      className="absolute"
      style={{ left: node.x, top: node.y }}
      data-node-id={node.id}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(node.id)
      }}
    >
      <div className="relative">
        {schema.render(node.props)}
        {selected && (
          <div className="ring-acid pointer-events-none absolute -inset-1 rounded-md ring-2" />
        )}
      </div>
    </div>
  )
}

export const PlacedNode = memo(PlacedNodeInner)
```

- [ ] **Step 2: Pass selection state from Canvas → PlacedNode**

Update `dev/builder/Canvas.tsx` to accept `selectedId` and `onSelect` props and forward them:

Replace the props signature:

```tsx
export function Canvas({
  viewport,
  onViewportChange,
  nodes,
  selectedId,
  onSelect,
  onCanvasClick,
}: {
  viewport: Viewport
  onViewportChange: (v: Viewport) => void
  nodes: CanvasNode[]
  selectedId: string | null
  onSelect: (id: string) => void
  onCanvasClick: () => void
}) {
```

Pass `onCanvasClick` to the inner content wrapper that surrounds the device frame:

```tsx
<div
  className="flex min-h-[calc(100vh-3.5rem-3rem)] w-full items-center justify-center px-8 py-10"
  onClick={onCanvasClick}
>
  <DeviceFrame variant={viewport}>
    {nodes.map((n) => (
      <PlacedNode
        key={n.id}
        node={n}
        selected={n.id === selectedId}
        onSelect={onSelect}
      />
    ))}
  </DeviceFrame>
</div>
```

The `onClick` here fires on bare canvas clicks but not on placed-node clicks (because PlacedNode calls `e.stopPropagation()`).

- [ ] **Step 3: Wire from Builder.tsx using `useCallback`**

Update `dev/builder/Builder.tsx`. Add `useCallback` import:

```tsx
import { useCallback } from 'react'
```

Inside `Builder()`, define stable callbacks:

```tsx
const onSelect = useCallback(
  (id: string) => store.setSelectedId(id),
  [store.setSelectedId],
)
const onCanvasClick = useCallback(
  () => store.setSelectedId(null),
  [store.setSelectedId],
)
```

Pass them to `<Canvas>`:

```tsx
<Canvas
  viewport={store.viewport}
  onViewportChange={store.setViewport}
  nodes={store.nodes}
  selectedId={store.selectedId}
  onSelect={onSelect}
  onCanvasClick={onCanvasClick}
/>
```

- [ ] **Step 4: Typecheck**

Run: `bun run typecheck`
Expected: clean.

- [ ] **Step 5: Browser smoke**

Reload. Drop a few blocks. Verify:
- Clicking a block draws a 2px lime ring 4px outside its bounds.
- The Inspector pane updates its hint to show the selected block type.
- Clicking another block transfers selection.
- Clicking empty canvas (the gray gutter or inside the frame on bare grid) deselects (Inspector returns to "Select a block to edit").
- Dragging a palette item still works and the dropped block becomes selected.

- [ ] **Step 6: Checkpoint**

Task 7 complete. Selection works, ring is visible, deselect works.

---

## Task 8 — Drag placed nodes to move them

**Goal:** Click-and-drag a placed node to reposition it. Quick clicks (under 4px) still select.

**Files:**
- Modify: `dev/builder/PlacedNode.tsx`
- Modify: `dev/builder/Builder.tsx`

- [ ] **Step 1: Extend PlacedNode to be draggable**

Replace `dev/builder/PlacedNode.tsx`:

```tsx
import { memo } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { CanvasNode } from './store'
import { BLOCKS } from './blocks'

type Props = {
  node: CanvasNode
  selected: boolean
  onSelect: (id: string) => void
}

function PlacedNodeInner({ node, selected, onSelect }: Props) {
  const schema = BLOCKS[node.type]
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: node.id, data: { kind: 'placed' } })

  if (!schema) return null

  const style: React.CSSProperties = {
    left: node.x,
    top: node.y,
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      className="absolute"
      style={style}
      data-node-id={node.id}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(node.id)
      }}
    >
      <div className="relative">
        {schema.render(node.props)}
        {selected && (
          <div className="ring-acid pointer-events-none absolute -inset-1 rounded-md ring-2" />
        )}
      </div>
    </div>
  )
}

export const PlacedNode = memo(PlacedNodeInner)
```

- [ ] **Step 2: Add the placed branch to `onDragEnd` in Builder.tsx**

Replace the comment `// Placed-move branch added in Task 8.` with:

```tsx
    if (data.kind === 'placed') {
      store.moveNode(active.id as string, delta.x, delta.y)
    }
```

- [ ] **Step 3: Typecheck**

Run: `bun run typecheck`
Expected: clean.

- [ ] **Step 4: Browser smoke**

Reload. Drop several blocks. Verify:
- Press-and-drag a placed block — it follows the cursor while you hold.
- Releasing commits the new position.
- A quick click (under 4px movement) still selects without moving.
- Dragging into negative space (off the top-left of the canvas) clamps to (0, 0) — the block won't escape upward or leftward.
- Dragging right or down past the frame edge lets the block scroll out (canvas pane scrolls).
- Refreshing preserves all positions.
- Clicking empty canvas after a drag deselects.

- [ ] **Step 5: Checkpoint**

Task 8 complete. Placed nodes are repositionable.

---

## Task 9 — Inspector with schema-driven controls

**Goal:** Editing controls in the inspector live-updates the selected block. Implements text, textarea, select, and boolean control kinds.

**Files:**
- Modify: `dev/builder/Inspector.tsx`
- Modify: `dev/builder/Builder.tsx`

- [ ] **Step 1: Replace `dev/builder/Inspector.tsx`**

```tsx
import { TrashIcon } from 'lucide-react'
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from '../../src'
import type { CanvasNode } from './store'
import { BLOCKS, type Control } from './blocks'

type Props = {
  node: CanvasNode | null
  onChange: (id: string, key: string, value: unknown) => void
  onDelete: (id: string) => void
}

export function Inspector({ node, onChange, onDelete }: Props) {
  return (
    <aside className="w-[300px] shrink-0 overflow-y-auto border-l border-border bg-card">
      {!node ? <EmptyHint /> : <InspectorBody node={node} onChange={onChange} onDelete={onDelete} />}
    </aside>
  )
}

function EmptyHint() {
  return (
    <div className="flex h-full items-center justify-center px-6 py-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="size-1.5 rounded-full bg-acid" />
        <p className="text-muted-fg text-sm">
          Select a block to edit its properties
        </p>
      </div>
    </div>
  )
}

function InspectorBody({
  node,
  onChange,
  onDelete,
}: {
  node: CanvasNode
  onChange: (id: string, key: string, value: unknown) => void
  onDelete: (id: string) => void
}) {
  const schema = BLOCKS[node.type]
  if (!schema) return null
  return (
    <div>
      <header className="flex items-start justify-between gap-2 border-b border-border px-4 py-4">
        <div>
          <p className="tag text-muted-fg">{schema.group}</p>
          <h3 className="font-display text-fg text-lg font-semibold">
            {schema.label}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete block"
          onClick={() => onDelete(node.id)}
        >
          <TrashIcon />
        </Button>
      </header>
      <div className="grid gap-4 px-4 py-5">
        {schema.controls.map((c) => (
          <ControlField
            key={c.key}
            control={c}
            value={node.props[c.key]}
            onChange={(v) => onChange(node.id, c.key, v)}
          />
        ))}
      </div>
      <footer className="border-t border-border px-4 py-4">
        <p className="tag text-muted-fg mb-2">Position</p>
        <div className="flex gap-3 font-mono text-xs text-fg tabular">
          <span>x: {node.x}</span>
          <span>y: {node.y}</span>
        </div>
      </footer>
    </div>
  )
}

function ControlField({
  control,
  value,
  onChange,
}: {
  control: Control
  value: unknown
  onChange: (v: unknown) => void
}) {
  if (control.kind === 'text') {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs">{control.label}</Label>
        <Input
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    )
  }
  if (control.kind === 'textarea') {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs">{control.label}</Label>
        <Textarea
          rows={3}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    )
  }
  if (control.kind === 'select') {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs">{control.label}</Label>
        <Select value={String(value ?? '')} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {control.options.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }
  if (control.kind === 'boolean') {
    return (
      <div className="flex items-center justify-between">
        <Label className="text-xs">{control.label}</Label>
        <Switch checked={Boolean(value)} onCheckedChange={onChange} />
      </div>
    )
  }
  return null
}
```

- [ ] **Step 2: Pass `onChange` and `onDelete` from Builder**

In `dev/builder/Builder.tsx`, define stable callbacks via `useCallback`:

```tsx
const onPropChange = useCallback(
  (id: string, key: string, value: unknown) => store.updateProp(id, key, value),
  [store.updateProp],
)
const onDelete = useCallback(
  (id: string) => store.removeNode(id),
  [store.removeNode],
)
```

Update the `<Inspector>` JSX:

```tsx
<Inspector node={selectedNode} onChange={onPropChange} onDelete={onDelete} />
```

- [ ] **Step 3: Typecheck**

Run: `bun run typecheck`
Expected: clean.

- [ ] **Step 4: Browser smoke**

Reload. Drop a Button, then click it. Verify:
- Inspector shows the group "Form", label "Button", a trash icon.
- Three controls render: Text (input), Variant (select), Size (select).
- Editing the Text live-updates the button label as you type.
- Switching Variant changes the button style instantly.
- Position section reads `x: …  y: …` matching the dropped position.
- Click the trash icon — block disappears, Inspector reverts to empty hint.

Test other blocks:
- Drop a Card, edit Title and Content (text + textarea).
- Drop a Switch, toggle the boolean control — the placed Switch updates.
- Drop an Alert, switch Variant between default and destructive — placed Alert recolors.

- [ ] **Step 5: Checkpoint**

Task 9 complete. Inspector edits all 4 control kinds and live-updates placed nodes.

---

## Task 10 — Keyboard delete with editable guard

**Goal:** Pressing `Delete` or `Backspace` while a block is selected removes it. Pressing `Backspace` while editing in an inspector input does NOT delete the block.

**Files:**
- Modify: `dev/builder/Builder.tsx`

- [ ] **Step 1: Add `useEffect` for the keydown listener**

At the top of the file, add `useEffect` to the existing React import:

```tsx
import { useCallback, useEffect } from 'react'
```

Inside `Builder()`, after the callbacks and before `return`:

```tsx
useEffect(() => {
  function onKey(e: KeyboardEvent) {
    if (e.key !== 'Delete' && e.key !== 'Backspace') return
    if (!store.selectedId) return
    const t = e.target as HTMLElement | null
    if (t && t.matches('input, textarea, [contenteditable=true]')) return
    e.preventDefault()
    store.removeNode(store.selectedId)
  }
  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
}, [store.selectedId, store.removeNode])
```

- [ ] **Step 2: Typecheck**

Run: `bun run typecheck`
Expected: clean.

- [ ] **Step 3: Browser smoke — happy path**

Reload. Drop a Button. Click to select. Press Delete. Verify:
- The block disappears.
- Inspector reverts to the empty hint.
- Press Delete again with nothing selected — nothing happens.

- [ ] **Step 4: Browser smoke — guard**

Drop a Card. Click to select. Click into the inspector's "Title" input. Press Backspace several times. Verify:
- The Title text shortens character-by-character.
- The Card is NOT deleted while you edit.
- Click out of the input back onto the canvas. Press Backspace once. Now the Card is deleted.

Repeat with the Textarea (Card content) — same behavior.

- [ ] **Step 5: Checkpoint**

Task 10 complete. Keyboard delete works and respects editable focus.

---

## Task 11 — Clear button in canvas toolbar

**Goal:** A small ghost-styled "× Clear" button in the canvas toolbar empties the canvas after a confirm.

**Files:**
- Modify: `dev/builder/Canvas.tsx`

- [ ] **Step 1: Add `onClear` to Canvas props and a button to the toolbar**

Update `dev/builder/Canvas.tsx`. First, extend the props:

```tsx
import { XIcon } from 'lucide-react'
import { Button } from '../../src'

export function Canvas({
  viewport,
  onViewportChange,
  nodes,
  selectedId,
  onSelect,
  onCanvasClick,
  onClear,
}: {
  viewport: Viewport
  onViewportChange: (v: Viewport) => void
  nodes: CanvasNode[]
  selectedId: string | null
  onSelect: (id: string) => void
  onCanvasClick: () => void
  onClear: () => void
}) {
```

Replace the right-side label in the toolbar so it sits next to a Clear button:

```tsx
<div className="sticky top-0 z-20 flex w-full items-center justify-between border-b border-border bg-bg/80 px-4 py-2 backdrop-blur">
  <ViewportToggle value={viewport} onChange={onViewportChange} />
  <div className="flex items-center gap-3">
    <span className="tag text-muted-fg tabular">
      {viewport === 'desktop' ? '1280 × 800' : '390 × 844'}
    </span>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        if (nodes.length === 0) return
        if (window.confirm(`Clear all ${nodes.length} blocks from the canvas?`)) {
          onClear()
        }
      }}
      disabled={nodes.length === 0}
    >
      <XIcon /> Clear
    </Button>
  </div>
</div>
```

- [ ] **Step 2: Pass `onClear` from Builder**

In `dev/builder/Builder.tsx`, add a callback:

```tsx
const onClear = useCallback(() => store.clearAll(), [store.clearAll])
```

Add it to the `<Canvas>` JSX:

```tsx
<Canvas
  viewport={store.viewport}
  onViewportChange={store.setViewport}
  nodes={store.nodes}
  selectedId={store.selectedId}
  onSelect={onSelect}
  onCanvasClick={onCanvasClick}
  onClear={onClear}
/>
```

- [ ] **Step 3: Typecheck**

Run: `bun run typecheck`
Expected: clean.

- [ ] **Step 4: Browser smoke**

Reload. Verify:
- With no blocks on the canvas, the Clear button is disabled.
- Drop several blocks. Click Clear. The browser confirms — accept.
- All blocks disappear; Inspector reverts to empty hint; toolbar Clear button is disabled again.
- Drop another block. Click Clear, then Cancel — the block stays.

- [ ] **Step 5: Checkpoint**

Task 11 complete. Clear is wired and gated by confirm.

---

## Task 12 — End-to-end smoke + final typecheck/build

**Goal:** Confirm the full Builder works against the spec's acceptance criteria.

**Files:** none modified.

- [ ] **Step 1: Reset state**

In the browser console:
```js
localStorage.removeItem('palette-builder-v1')
```
Reload Builder.

- [ ] **Step 2: Drag-and-drop verification**

For each of these block types, drag from Palette to canvas and verify the result renders correctly: Heading, Paragraph, Button, Input, Textarea, Select, Checkbox, Switch, Card, Alert, Badge, Avatar, Separator. (13 total.)

- [ ] **Step 3: Reposition verification**

Pick one of each kind and drag it to a new position on the canvas. Confirm:
- Selection ring follows the block during drag.
- Drop commits the new x/y.
- Inspector position field updates.

- [ ] **Step 4: Inspector edit verification**

For one block of each control kind:
- text → edit Heading text
- textarea → edit Paragraph text
- select → switch Button variant
- boolean → toggle Switch checked

Confirm each updates live and persists across refresh.

- [ ] **Step 5: Delete verification**

Select a block, hit Delete — gone. Drop another, click trash icon in inspector — gone.

- [ ] **Step 6: Viewport verification**

Toggle to Phone. Confirm:
- Frame switches to a 390×844 phone with a notch.
- Already-placed blocks remain at the same x/y (some may now be off-screen — expected; canvas scrolls).
- Drop a new block; it places relative to the phone canvas.
- Toggle back to Desktop; positions preserved.

- [ ] **Step 7: Theme toggle verification**

While Builder is open with several blocks, toggle the dark theme. Confirm:
- Frames recolor (border, chrome bar, phone bezel).
- Blocks recolor.
- Selection ring stays acid-lime in both themes.

- [ ] **Step 8: Persistence verification**

Refresh the page. Confirm the canvas state is restored.

- [ ] **Step 9: Page-switch verification**

Click to Components, then Foundations, then back to Builder. Confirm Builder state was preserved.

- [ ] **Step 10: Console clean**

Open DevTools Console. Repeat the above interactions. Confirm: no errors, no warnings.

- [ ] **Step 11: Final typecheck**

Run: `bun run typecheck`
Expected: clean, no errors.

- [ ] **Step 12: Final build**

Run: `bun run build`
Expected: clean, dist outputs match the previous build size (within ~1 kB) — Builder is dev-only and doesn't affect the published library bundle.

- [ ] **Step 13: Checkpoint**

Task 12 complete. Builder is shipped per the v1 spec.
