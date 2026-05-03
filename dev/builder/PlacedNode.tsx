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
