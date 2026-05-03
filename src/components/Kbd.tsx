import * as React from 'react'
import { cn } from '../lib/cn'

export const Kbd = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <kbd
      ref={ref}
      data-slot="kbd"
      className={cn(
        'bg-muted text-muted-fg pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm px-1 font-sans text-xs font-medium select-none [&_svg:not([class*=size-])]:size-3 [[data-slot=tooltip-content]_&]:bg-bg/20 [[data-slot=tooltip-content]_&]:text-bg dark:[[data-slot=tooltip-content]_&]:bg-bg/10',
        className,
      )}
      {...props}
    />
  ),
)
Kbd.displayName = 'Kbd'

export const KbdGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="kbd-group"
    className={cn('inline-flex items-center gap-1', className)}
    {...props}
  />
))
KbdGroup.displayName = 'KbdGroup'
