import * as React from 'react'
import { Loader2Icon } from 'lucide-react'
import { cn } from '../lib/cn'

export const Spinner = React.forwardRef<
  SVGSVGElement,
  Omit<React.ComponentPropsWithoutRef<'svg'>, 'children'>
>(({ className, ...props }, ref) => (
  <Loader2Icon
    ref={ref}
    role="status"
    aria-label="Loading"
    data-slot="spinner"
    className={cn('size-4 animate-spin', className)}
    {...props}
  />
))
Spinner.displayName = 'Spinner'
