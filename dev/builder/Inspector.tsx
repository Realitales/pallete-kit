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
} from '@lib'
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
