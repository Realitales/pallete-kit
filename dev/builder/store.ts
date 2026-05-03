import { useCallback, useEffect, useState } from 'react'
import { BLOCKS } from './blocks'

export type CanvasNode = {
  id: string
  type: string
  x: number
  y: number
  props: Record<string, unknown>
}

export type Viewport = 'desktop' | 'phone'

export const VIEWPORT_SIZES: Record<Viewport, { w: number; h: number }> = {
  desktop: { w: 1280, h: 800 },
  phone: { w: 390, h: 844 },
}

const STORAGE_KEY = 'palette-builder-v1'

type StoredState = {
  nodes: CanvasNode[]
  viewport: Viewport
}

function loadState(): StoredState {
  if (typeof localStorage === 'undefined') return { nodes: [], viewport: 'desktop' }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { nodes: [], viewport: 'desktop' }
    return JSON.parse(raw) as StoredState
  } catch {
    return { nodes: [], viewport: 'desktop' }
  }
}

export function useBuilderStore() {
  const [nodes, setNodes] = useState<CanvasNode[]>(() => loadState().nodes)
  const [viewport, setViewport] = useState<Viewport>(() => loadState().viewport)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Persist
  useEffect(() => {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, viewport }))
  }, [nodes, viewport])

  const addNode = useCallback((type: string, x: number, y: number) => {
    const schema = BLOCKS[type]
    if (!schema) return
    const id = `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
    setNodes((ns) => [
      ...ns,
      {
        id,
        type,
        x: Math.max(0, Math.round(x)),
        y: Math.max(0, Math.round(y)),
        props: { ...schema.defaultProps },
      },
    ])
    setSelectedId(id)
  }, [])

  const moveNode = useCallback((id: string, dx: number, dy: number) => {
    setNodes((ns) =>
      ns.map((n) =>
        n.id === id
          ? { ...n, x: Math.max(0, Math.round(n.x + dx)), y: Math.max(0, Math.round(n.y + dy)) }
          : n,
      ),
    )
  }, [])

  const updateProp = useCallback(
    (id: string, key: string, value: unknown) => {
      setNodes((ns) =>
        ns.map((n) =>
          n.id === id ? { ...n, props: { ...n.props, [key]: value } } : n,
        ),
      )
    },
    [],
  )

  const removeNode = useCallback((id: string) => {
    setNodes((ns) => ns.filter((n) => n.id !== id))
    setSelectedId((sel) => (sel === id ? null : sel))
  }, [])

  const clearAll = useCallback(() => {
    setNodes([])
    setSelectedId(null)
  }, [])

  return {
    nodes,
    viewport,
    selectedId,
    setViewport,
    setSelectedId,
    addNode,
    moveNode,
    updateProp,
    removeNode,
    clearAll,
  }
}
