# Builder Page — Design

- **Date:** 2026-05-03
- **Status:** Approved (brainstorming)
- **Audience:** Implementer for the Palette internal design system sandbox.

## 1. Goal

Add a third page to the Palette dev sandbox — `Builder` — that lets the team drag UI components from a left palette onto a viewport canvas (Desktop or Phone frame), reposition them freely, click to select, edit a selected block's props in a right inspector, and persist work in `localStorage` between refreshes.

The Builder is a **visualization sandbox**: it produces no exported code and no saved documents. Its purpose is exploring layouts and combining components quickly to see how they look together.

## 2. Scope

### v1 in scope

- Three-pane layout under the existing site header: Palette (left), Canvas (center), Inspector (right).
- 13 draggable block types covering the palette's most-used primitives (Heading, Paragraph, Button, Input, Textarea, Select, Checkbox, Switch, Card, Alert, Badge, Avatar, Separator).
- Drag from Palette → drop on Canvas at cursor position to instantiate a node.
- Drag a placed node to reposition it.
- Click a placed node to select it; click empty canvas to deselect.
- Selected node renders a 2px lime selection ring; right inspector shows schema-driven editable controls (text, textarea, select, boolean) plus read-only x/y position display.
- Keyboard `Delete` / `Backspace` removes the selected node — except when focus is in an input/textarea/contenteditable.
- Top-of-canvas viewport toggle: Desktop (1280×800) and Phone (390×844). Both render distinct device chrome (browser bar / phone notch).
- Live inspector updates: every keystroke updates the node's props.
- `localStorage` persistence keyed `palette-builder-v1`.
- "Clear" button to wipe all nodes (with confirm).

### v1 explicitly out of scope

Resize handles · multi-select · undo/redo · snap-to-grid / smart guides · z-order controls · copy/paste/duplicate · right-click menus · multi-document workflows · JSX export · editable position fields · per-viewport node arrays · node grouping or nested frames.

## 3. File structure

```
dev/
├── App.tsx                           ← add 'builder' to Page union; conditional render
└── builder/
    ├── blocks.tsx          (exists)  ← BLOCKS schema + render fns + control defs
    ├── store.ts            (exists)  ← useBuilderStore + localStorage persist
    ├── Builder.tsx                   ← page entry: DndContext + 3-pane layout
    ├── Palette.tsx                   ← left pane: draggable block list
    ├── Canvas.tsx                    ← center pane: viewport toolbar + frame + droppable
    ├── DeviceFrame.tsx               ← desktop / phone chrome shells
    ├── PlacedNode.tsx                ← absolutely-positioned node + selection ring
    ├── Inspector.tsx                 ← right pane: schema-driven control panel
    └── ViewportToggle.tsx            ← Desktop / Phone pill switcher
```

`dev/builder/blocks.tsx` and `dev/builder/store.ts` already exist and remain unchanged for v1.

## 4. Layout

Under the existing 3.5rem site header, Builder fills `calc(100vh - 3.5rem)`:

| Pane      | Width    | Notes                                           |
|-----------|----------|-------------------------------------------------|
| Palette   | 240px    | left, scrollable, grouped block list            |
| Canvas    | flex-1   | scrollable, centers the device frame, has a top toolbar (viewport toggle + clear button) |
| Inspector | 300px    | right, scrollable, schema-driven controls       |

The existing site sidebar (used by Components / Foundations) is **not rendered** when `page === 'builder'`. Builder owns its own three-pane layout.

## 5. Data model

```ts
type CanvasNode = {
  id: string                // n_<base36 timestamp>_<base36 random>
  type: string              // key into BLOCKS
  x: number                 // px, canvas-content-relative
  y: number
  props: Record<string, unknown>
}

type Viewport = 'desktop' | 'phone'
```

**Z-order** = array order: new nodes append; later array index wins overlapping clicks. No reorder UI for v1.

**Persistence** writes `JSON.stringify({ nodes, viewport })` to `localStorage['palette-builder-v1']` on every `nodes` or `viewport` change. Loads on mount via lazy `useState` initializer. Storage failures (quota, private mode) are silently caught.

## 6. State ownership

`useBuilderStore()` (already exists in `store.ts`) owns `nodes`, `viewport`, `selectedId`, and exposes:

- `addNode(type, x, y)` — creates a new node from the type's defaults; selects it.
- `moveNode(id, dx, dy)` — applies a delta; clamps x/y to ≥ 0.
- `updateProp(id, key, value)` — patches `node.props[key]`.
- `removeNode(id)` — drops the node; clears `selectedId` if it matched.
- `clearAll()` — empties `nodes` and `selectedId`.
- `setViewport(v)` / `setSelectedId(id)`.

The hook is called once in `Builder.tsx`. Its values flow down via props (no React Context) — depth is one level, so prop drilling is acceptable.

## 7. Drag-drop architecture

Library: `@dnd-kit/core` + `@dnd-kit/utilities` (already installed).

`<DndContext>` wraps the entire 3-pane layout in `Builder.tsx`.

### Sensors

```ts
useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
```

The 4px activation distance is the click-vs-drag threshold. Movements under 4px fire native `onClick` (used for selection). Past 4px, the drag activates.

### Draggable IDs

| Source         | id                  | data                              |
|----------------|---------------------|-----------------------------------|
| Palette item   | `palette:<Type>`    | `{ kind: 'palette', type }`       |
| Placed node    | `<node.id>`         | `{ kind: 'placed' }`              |

### Single droppable

The canvas content area registers `useDroppable({ id: 'canvas' })` (this is the dnd-kit droppable identifier returned by `over.id`). The same element also carries the DOM attribute `id="builder-canvas-content"` so position math can look it up via `document.getElementById()`. Two different identifiers, two different purposes — both on the same element. Placed nodes are not droppables; moves are computed from `event.delta` directly.

### `onDragEnd` handler

```ts
function onDragEnd(event: DragEndEvent) {
  const { active, over, delta, activatorEvent } = event
  const data = active.data.current as { kind: 'palette' | 'placed'; type?: string }

  if (data.kind === 'palette' && over?.id === 'canvas') {
    const canvas = document.getElementById('builder-canvas-content')!
    const rect = canvas.getBoundingClientRect()
    const e = activatorEvent as PointerEvent
    const dropX = e.clientX + delta.x - rect.left
    const dropY = e.clientY + delta.y - rect.top
    addNode(data.type!, dropX, dropY)
    return
  }

  if (data.kind === 'placed') {
    moveNode(active.id as string, delta.x, delta.y)
  }
}
```

`getBoundingClientRect()` returns viewport-relative coordinates that already account for canvas scroll, so no manual scroll math is required. The element with id `builder-canvas-content` is the *interior* of the device frame, not the frame chrome.

### Drag preview

Use `<DragOverlay>` for **palette items only** — renders a translucent ghost of the block at the cursor (the palette label is small, but the actual block can be much larger). Placed-node moves use the default transform-on-source approach so the actual node visibly tracks the cursor.

### Drops outside canvas

If `over` is null or not `'canvas'`, the drag is a no-op. No "place into the void" semantics.

## 8. Selection, click-vs-drag, keyboard delete

### Click vs drag

The 4px PointerSensor threshold cleanly separates clicks from drags. Place `onClick={(e) => { e.stopPropagation(); setSelectedId(node.id) }}` directly on each `PlacedNode` wrapper. `stopPropagation` prevents the click from reaching the canvas-level deselect handler.

### Deselect

The canvas content area registers `onClick={() => setSelectedId(null)}`. Bubbling from a placed node is stopped, so canvas-only clicks deselect.

### Selection ring

Rendered as an absolutely-positioned overlay child *inside* the placed node's wrapper:

```tsx
<div className="relative">
  {render(node)}
  {selected && (
    <div className="pointer-events-none absolute -inset-1 rounded-md ring-2 ring-acid" />
  )}
</div>
```

`pointer-events-none` ensures the ring never intercepts clicks. `-inset-1` puts the 2px lime ring 4px outside the node, so the node's own bounding box doesn't change when selected.

### Keyboard delete

A single `window`-level `keydown` listener in `Builder.tsx`:

```ts
useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'Delete' && e.key !== 'Backspace') return
    if (!selectedId) return
    const t = e.target as HTMLElement
    if (t.matches('input, textarea, [contenteditable=true]')) return
    e.preventDefault()
    removeNode(selectedId)
  }
  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
}, [selectedId, removeNode])
```

The editable-element guard is load-bearing — without it, hitting Backspace while editing inspector text would delete the entire selected block.

## 9. Viewport frames

`DeviceFrame.tsx` exports one component:

```tsx
<DeviceFrame variant="desktop" | "phone">
  <div id="builder-canvas-content">…</div>
</DeviceFrame>
```

The element with id `builder-canvas-content` is the droppable. Both variants render this with the same id, so dnd-kit selectors are stable across switches.

### Desktop (1280 × 800)

- Outer: `rounded-lg`, hairline border, subtle shadow, ink-on-cream chrome.
- Top chrome bar (32px): three muted-fill traffic-light dots, then a small mono "address pill" reading `palette.studio/preview`. Decorative only — not interactive. Hairline rule below.
- Content area (1280 × 768): `bg-bg`, faint `.grid-paper` background at 30% opacity.

### Phone (390 × 844)

- Outer: `rounded-[44px]`, 6px ink border.
- Status bar (44px): a centered notch (a black pill, ~120×26, `rounded-full`, absolutely positioned at top center).
- Content area (390 × 800): same `bg-bg` + `.grid-paper`.

Both frames are centered in the canvas pane via flex; the canvas pane scrolls if the frame overflows.

### Toolbar (above the frame)

- `<ViewportToggle />`: a 2-button pill — Desktop / Phone, lime underline on the active option.
- "× Clear" ghost-variant button on the right; calls `clearAll()` after a confirm dialog.

## 10. Inspector

`Inspector.tsx` is schema-driven. Receives the selected node (or `null`) as a prop.

```tsx
<Inspector node={selectedNode} onChange={updateProp} onDelete={removeNode} />
```

### Layout

- Header: `tag` showing block group ("Form" / "Display" / "Content"), `font-display` heading with the block's `label`, and a ghost-variant `<Button size="icon">` with a TrashIcon that calls `onDelete(node.id)`.
- Body: vertical stack of `ControlField`s (one per `schema.controls` entry), gap-4.
- Footer: read-only "Position" block showing `x` / `y` in mono.

### Control → component mapping

| `Control.kind` | Renders                                            |
|----------------|----------------------------------------------------|
| `text`         | `<Input>`                                          |
| `textarea`     | `<Textarea rows={3}>`                              |
| `select`       | `<Select>` with one `<SelectItem>` per option      |
| `boolean`      | `<Switch>` next to a `<Label>`                     |

All imported from `'../../src'`. No circular import risk — `dev/` consumes the lib, never the reverse.

### Update mode

**Live**: every change calls `onChange(node.id, control.key, value)` immediately. The placed node re-renders on the next React tick.

### Empty state

When `node === null`, render a centered hint: small lime dot + "Select a block to edit its properties" in muted text. No hero treatment.

## 11. Performance: memoize PlacedNode

Live inspector updates cause one store mutation per keystroke, which would normally re-render every PlacedNode. Mitigation:

1. The store already does immutable updates: `setNodes(ns => ns.map(n => n.id === id ? { ...n, props: { ...n.props, [key]: value } } : n))`. Only the edited node gets a new reference.
2. Wrap `PlacedNode` in `React.memo`. Unchanged nodes short-circuit rendering because their `node` prop is referentially identical.
3. Wrap `onSelect` and any other callback props in `useCallback` in `Builder.tsx`, so their refs don't change on every render and break the memo.

Net result: per keystroke, exactly one `PlacedNode` re-renders regardless of total node count. Same applies during drag — only the moving node re-renders.

If profiling later shows lag on canvases over ~100 nodes (well above realistic v1 use), debounce `updateProp` by 50ms — a one-line change. Skip preemptively.

## 12. Edge cases

### Handled

- **Drop outside canvas** → no-op.
- **Negative x/y** → clamped to 0 in `addNode` / `moveNode`.
- **Refresh during drag** → drag dropped (browser default).
- **Page switch (Components ↔ Builder ↔ Foundations)** → state preserved in `localStorage`, restored on return.
- **Theme toggle while Builder is open** → tokens cascade, frames + nodes recolor.
- **`localStorage` corruption** → `loadState()` already try/catches and returns empty defaults.
- **Two perfectly-overlapping nodes** → top one (later index) wins clicks; user moves it to reach the underneath one.

### Default block sizes vs phone width

All 13 default block widths fit in 390px; widest is `Alert` at 380px. No tweaks needed for v1.

## 13. Trade-offs flagged

- **No React Context** — prop-drilled state, justified by 1-level depth.
- **Single droppable** (not per-node) — simpler `onDragEnd`, places the position computation in one place.
- **DragOverlay for palette items, transform for placed moves** — the dropped block is bigger than its palette label, so a real preview matters; for placed moves, the actual node tracking the cursor is the right cue.
- **Window-level Delete listener** — works wherever focus is, with an editable-element guard. Canvas-level would require focusing the canvas, which is friction.
- **Single canvas, no per-viewport node arrays** — switching Desktop/Phone changes the frame; nodes don't reflow. Simpler model and matches the "visualization sandbox" goal (the user picked "A — visualization" in brainstorming).

## 14. Implementation order

A sequence where each step is verifiable before the next:

1. Add `'builder'` to the `Page` union in `App.tsx`. Add a "Builder" `<PageNavLink>` to `SiteHeader`. Render a stub `<Builder />` placeholder when `page === 'builder'` (skipping the existing sidebar/main shell). **Verify**: clicking Builder shows the placeholder; the existing pages still work.
2. Build the three-pane shell in `Builder.tsx` (Palette / Canvas / Inspector) with placeholder content. Wire `useBuilderStore`. **Verify**: layout renders at the right widths; localStorage round-trips a hand-set `nodes` array.
3. Build `DeviceFrame.tsx` (desktop variant first). Render it inside Canvas with the `builder-canvas-content` interior div. **Verify**: it looks like a desktop browser frame at 1280×800.
4. Add `ViewportToggle` and the phone variant of `DeviceFrame`. **Verify**: toggling switches frames; the `builder-canvas-content` id remains stable.
5. Build `Palette.tsx` with grouped, draggable block items using `useDraggable`. Add a window-level `<DndContext>` with `PointerSensor` (distance: 4). Wire `onDragEnd` (palette branch only). **Verify**: dragging a Button from the palette and dropping on the canvas adds a node at the cursor; check coordinates by logging.
6. Build `PlacedNode.tsx` with absolute positioning using `node.x` / `node.y`. Render through `BLOCKS[node.type].render(node.props)`. Wrap in `React.memo`. **Verify**: dropped nodes appear at the right spots; selection ring renders for `selectedId`.
7. Wire click-to-select on placed nodes; canvas onClick → deselect. **Verify**: clicking a node selects it; clicking empty canvas deselects.
8. Make `PlacedNode` draggable (placed branch of `onDragEnd`). **Verify**: dragging a placed node moves it; clicks under 4px still select.
9. Build `Inspector.tsx` with empty state + control rendering for all 4 control kinds. **Verify**: editing each kind live-updates the placed node.
10. Add the keyboard `Delete` handler with the editable guard. **Verify**: Delete removes the selected block; typing Backspace in an inspector input doesn't delete it.
11. Add the "× Clear" toolbar button. **Verify**: it empties the canvas after confirm.
12. End-to-end smoke: drop several blocks, edit a few, refresh — state restored. Toggle theme — frames + nodes recolor. Switch viewports — frame changes, nodes stay put.

## 15. Acceptance

The spec is satisfied when, in the running dev server:

- Builder is reachable from the top nav.
- A user can drop, move, select, edit (live), and delete blocks.
- Viewport toggle works and the frames look distinct and on-brand.
- Refreshing the page restores the canvas.
- All 13 block types are drag-droppable.
- No console errors during normal use.
- TypeScript clean (`bun run typecheck`).
- Library build clean (`bun run build`).
