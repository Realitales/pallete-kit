import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'

export const FieldSet = React.forwardRef<
  HTMLFieldSetElement,
  React.FieldsetHTMLAttributes<HTMLFieldSetElement>
>(({ className, ...props }, ref) => (
  <fieldset
    ref={ref}
    data-slot="field-set"
    className={cn(
      'flex flex-col gap-6 has-[>[data-slot=checkbox-group]]:gap-3',
      className,
    )}
    {...props}
  />
))
FieldSet.displayName = 'FieldSet'

export const FieldLegend = React.forwardRef<
  HTMLLegendElement,
  React.HTMLAttributes<HTMLLegendElement> & { variant?: 'legend' | 'label' }
>(({ className, variant = 'legend', ...props }, ref) => (
  <legend
    ref={ref}
    data-slot="field-legend"
    data-variant={variant}
    className={cn(
      'mb-3 font-medium',
      variant === 'legend' && 'text-base',
      variant === 'label' && 'text-sm',
      className,
    )}
    {...props}
  />
))
FieldLegend.displayName = 'FieldLegend'

export const FieldGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="field-group"
    role="group"
    className={cn(
      'group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4',
      className,
    )}
    {...props}
  />
))
FieldGroup.displayName = 'FieldGroup'

const fieldVariants = cva('group/field flex w-full gap-2 data-[invalid=true]:text-destructive', {
  variants: {
    orientation: {
      vertical: 'flex-col [&>[data-slot=field-label]]:flex-none',
      horizontal:
        'flex-row items-center [&>[data-slot=field-label]]:flex-none [&>[data-slot=field-content]]:flex-1',
      responsive:
        'flex-col [&>[data-slot=field-label]]:flex-none @md/field-group:flex-row @md/field-group:items-center',
    },
  },
  defaultVariants: { orientation: 'vertical' },
})

export interface FieldProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof fieldVariants> {}

export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, orientation = 'vertical', ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  ),
)
Field.displayName = 'Field'

export const FieldContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="field-content"
    className={cn(
      'group/field-content flex flex-1 flex-col gap-1.5 leading-snug [&>[data-slot=field-label]]:flex-none',
      className,
    )}
    {...props}
  />
))
FieldContent.displayName = 'FieldContent'

export const FieldLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & { asChild?: boolean }
>(({ className, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : 'label'
  return (
    <Comp
      ref={ref}
      data-slot="field-label"
      className={cn(
        'group/field-label peer/field-label flex w-fit gap-2 leading-snug font-medium text-sm group-data-[disabled=true]/field:opacity-50',
        className,
      )}
      {...props}
    />
  )
})
FieldLabel.displayName = 'FieldLabel'

export const FieldTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="field-title"
    className={cn('flex w-fit items-center gap-2 text-sm leading-snug font-medium', className)}
    {...props}
  />
))
FieldTitle.displayName = 'FieldTitle'

export const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="field-description"
    className={cn(
      'text-muted-fg text-sm leading-normal font-normal group-has-[[data-orientation=horizontal]]/field:text-balance last:mt-0 [&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4',
      className,
    )}
    {...props}
  />
))
FieldDescription.displayName = 'FieldDescription'

export const FieldSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    data-slot="field-separator"
    data-content={!!children}
    className={cn(
      'relative -my-2 h-5 text-sm group-data-[orientation=horizontal]/field:hidden',
      className,
    )}
    {...props}
  >
    <div
      role="presentation"
      aria-hidden="true"
      className="absolute inset-0 flex items-center"
    >
      <div className="border-border w-full border-t" />
    </div>
    {children && (
      <span className="bg-bg text-muted-fg relative mx-auto block w-fit px-2">
        {children}
      </span>
    )}
  </div>
))
FieldSeparator.displayName = 'FieldSeparator'

export const FieldError = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & { errors?: Array<{ message?: string }> }
>(({ className, children, errors, ...props }, ref) => {
  const content = children ?? errors?.find((e) => e?.message)?.message
  if (!content) return null
  return (
    <p
      ref={ref}
      role="alert"
      data-slot="field-error"
      className={cn('text-destructive text-sm font-normal', className)}
      {...props}
    >
      {content}
    </p>
  )
})
FieldError.displayName = 'FieldError'

export { fieldVariants }
