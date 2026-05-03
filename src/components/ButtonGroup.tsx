import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'

const buttonGroupVariants = cva(
  'inline-flex items-stretch [&>*]:rounded-none [&>*:first-child]:rounded-l-md [&>*:last-child]:rounded-r-md [&>*:not(:first-child)]:-ml-px focus-within:relative',
  {
    variants: {
      orientation: {
        horizontal: 'flex-row',
        vertical:
          'flex-col [&>*:first-child]:rounded-t-md [&>*:first-child]:rounded-bl-none [&>*:last-child]:rounded-b-md [&>*:last-child]:rounded-tr-none [&>*:not(:first-child)]:ml-0 [&>*:not(:first-child)]:-mt-px',
      },
    },
    defaultVariants: { orientation: 'horizontal' },
  },
)

export interface ButtonGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof buttonGroupVariants> {}

export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation, ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      data-slot="button-group"
      data-orientation={orientation ?? 'horizontal'}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  ),
)
ButtonGroup.displayName = 'ButtonGroup'

export const ButtonGroupSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    data-slot="button-group-separator"
    className={cn('bg-border self-stretch w-px', className)}
    {...props}
  />
))
ButtonGroupSeparator.displayName = 'ButtonGroupSeparator'

export { buttonGroupVariants }
