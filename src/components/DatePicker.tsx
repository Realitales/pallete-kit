import * as React from 'react'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '../lib/cn'
import { Button } from './Button'
import { Calendar } from './Calendar'
import { Popover, PopoverContent, PopoverTrigger } from './Popover'

export interface DatePickerProps {
  value?: Date
  defaultValue?: Date
  onValueChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  formatStr?: string
}

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value: controlledValue,
      defaultValue,
      onValueChange,
      placeholder = 'Pick a date',
      disabled,
      className,
      formatStr = 'PPP',
    },
    ref,
  ) => {
    const [internal, setInternal] = React.useState<Date | undefined>(defaultValue)
    const value = controlledValue ?? internal

    const setValue = (next: Date | undefined) => {
      if (controlledValue === undefined) setInternal(next)
      onValueChange?.(next)
    }

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            data-slot="date-picker-trigger"
            disabled={disabled}
            className={cn(
              'w-[240px] justify-start text-left font-normal',
              !value && 'text-muted-fg',
              className,
            )}
          >
            <CalendarIcon className="mr-2 size-4" />
            {value ? format(value, formatStr) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={value} onSelect={setValue} />
        </PopoverContent>
      </Popover>
    )
  },
)
DatePicker.displayName = 'DatePicker'
