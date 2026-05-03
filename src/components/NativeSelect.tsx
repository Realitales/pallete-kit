import * as React from 'react'
import { cn } from '../lib/cn'

export type NativeSelectProps = React.SelectHTMLAttributes<HTMLSelectElement>

export const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      data-slot="native-select"
      className={cn(
        'border-input bg-bg flex h-9 w-full min-w-0 rounded-md border px-3 text-sm shadow-sm transition-[color,box-shadow] outline-none',
        'focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-2',
        'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
)
NativeSelect.displayName = 'NativeSelect'
