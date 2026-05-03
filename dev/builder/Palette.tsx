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
