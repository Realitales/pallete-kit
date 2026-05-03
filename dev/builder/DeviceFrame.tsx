import { useDroppable } from '@dnd-kit/core'
import type { Viewport } from './store'

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
        <CanvasInterior width={1280} height={768}>{children}</CanvasInterior>
      </div>
    )
  }
  return (
    <div
      className="relative overflow-hidden border-[6px] border-fg bg-card"
      style={{ borderRadius: 44, width: 390, height: 844 }}
    >
      <PhoneNotch />
      <CanvasInterior width={390} height={800}>{children}</CanvasInterior>
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
