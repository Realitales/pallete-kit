import { useCallback, useEffect, useState } from 'react'
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

  const onSelect = useCallback(
    (id: string) => store.setSelectedId(id),
    [store.setSelectedId],
  )
  const onCanvasClick = useCallback(
    () => store.setSelectedId(null),
    [store.setSelectedId],
  )
  const onPropChange = useCallback(
    (id: string, key: string, value: unknown) => store.updateProp(id, key, value),
    [store.updateProp],
  )
  const onDelete = useCallback(
    (id: string) => store.removeNode(id),
    [store.removeNode],
  )
  const onClear = useCallback(() => store.clearAll(), [store.clearAll])

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

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as
      | { kind: 'palette'; type: string }
      | { kind: 'placed' }
      | undefined
    if (data?.kind === 'palette') setActiveDragType(data.type)
  }

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
    if (data.kind === 'placed') {
      store.moveNode(active.id as string, delta.x, delta.y)
    }
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
        <Canvas
          viewport={store.viewport}
          onViewportChange={store.setViewport}
          nodes={store.nodes}
          selectedId={store.selectedId}
          onSelect={onSelect}
          onCanvasClick={onCanvasClick}
          onClear={onClear}
        />
        <Inspector node={selectedNode} onChange={onPropChange} onDelete={onDelete} />
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
