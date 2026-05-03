import * as React from 'react'
import { cn } from '../lib/cn'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        'border-input bg-bg flex field-sizing-content min-h-16 w-full rounded-md border px-3 py-2 text-base shadow-sm transition-[color,box-shadow] outline-none',
        'placeholder:text-muted-fg',
        'focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-2',
        'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'md:text-sm',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'
