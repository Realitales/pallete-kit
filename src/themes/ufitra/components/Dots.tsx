import { cn } from '@lib/lib/cn'

interface DotsProps {
  className?: string
  color?: string
  opacity?: number
  size?: number
  gap?: number
}

export function Dots({
  className,
  color = 'currentColor',
  opacity = 0.14,
  size = 1,
  gap = 3,
}: DotsProps) {
  return (
    <div
      className={cn('pointer-events-none absolute inset-0', className)}
      style={{
        backgroundImage: `radial-gradient(${color} ${size}px, transparent ${size}px)`,
        backgroundSize: `${gap}px ${gap}px`,
        opacity,
        mixBlendMode: 'overlay',
      }}
    />
  )
}
