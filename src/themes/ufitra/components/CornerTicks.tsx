import { cn } from '@lib/lib/cn'

interface CornerTicksProps {
  className?: string
  color?: string
  size?: number
  inset?: number
}

export function CornerTicks({
  className,
  color = 'currentColor',
  size = 12,
  inset = 12,
}: CornerTicksProps) {
  const style = { borderColor: color }
  const arm = `${size}px`

  return (
    <div className={cn('pointer-events-none absolute inset-0', className)}>
      {/* Top-left */}
      <span
        className="absolute border-t border-l"
        style={{ ...style, top: inset, left: inset, width: arm, height: arm }}
      />
      {/* Top-right */}
      <span
        className="absolute border-t border-r"
        style={{ ...style, top: inset, right: inset, width: arm, height: arm }}
      />
      {/* Bottom-left */}
      <span
        className="absolute border-b border-l"
        style={{ ...style, bottom: inset, left: inset, width: arm, height: arm }}
      />
      {/* Bottom-right */}
      <span
        className="absolute border-b border-r"
        style={{ ...style, bottom: inset, right: inset, width: arm, height: arm }}
      />
    </div>
  )
}
