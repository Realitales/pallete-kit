import { XIcon } from 'lucide-react'
import type { CanvasNode, Viewport } from './store'
import { Button } from '../../src'
import { DeviceFrame } from './DeviceFrame'
import { PlacedNode } from './PlacedNode'
import { ViewportToggle } from './ViewportToggle'

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
  return (
    <div className="relative flex flex-1 flex-col items-center overflow-auto bg-muted/30">
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
    </div>
  )
}
