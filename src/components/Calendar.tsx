import * as React from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { DayPicker, getDefaultClassNames } from 'react-day-picker'
import { cn } from '../lib/cn'
import { buttonVariants } from './Button'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  ...props
}: CalendarProps) {
  const defaults = getDefaultClassNames()
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      data-slot="calendar"
      className={cn('group/calendar p-3', className)}
      classNames={{
        ...defaults,
        root: cn(defaults.root, 'w-fit'),
        months: cn(defaults.months, 'flex flex-col sm:flex-row gap-4 relative'),
        month: cn(defaults.month, 'flex flex-col w-full gap-4'),
        nav: cn(
          defaults.nav,
          'flex items-center justify-between absolute inset-x-0 top-0 px-1',
        ),
        button_previous: cn(
          buttonVariants({ variant: 'ghost' }),
          'size-7 p-0 select-none aria-disabled:opacity-50',
        ),
        button_next: cn(
          buttonVariants({ variant: 'ghost' }),
          'size-7 p-0 select-none aria-disabled:opacity-50',
        ),
        month_caption: cn(
          defaults.month_caption,
          'flex items-center justify-center h-7 w-full px-7 text-sm font-medium',
        ),
        caption_label: cn(defaults.caption_label, 'select-none font-medium'),
        weekdays: cn(defaults.weekdays, 'flex'),
        weekday: cn(
          defaults.weekday,
          'text-muted-fg rounded-md flex-1 font-normal text-[0.8rem] select-none',
        ),
        week: cn(defaults.week, 'flex w-full mt-2'),
        day: cn(
          defaults.day,
          'relative w-full h-9 p-0 text-center [&:has([aria-selected])]:bg-accent [&:has([aria-selected])]:rounded-md',
        ),
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'size-9 p-0 font-normal aria-selected:opacity-100',
        ),
        range_start: cn(defaults.range_start, 'rounded-l-md bg-accent'),
        range_middle: cn(defaults.range_middle, 'rounded-none'),
        range_end: cn(defaults.range_end, 'rounded-r-md bg-accent'),
        selected: cn(
          defaults.selected,
          'bg-primary text-primary-fg hover:bg-primary hover:text-primary-fg focus:bg-primary focus:text-primary-fg rounded-md',
        ),
        today: cn(defaults.today, 'bg-accent text-accent-fg rounded-md'),
        outside: cn(
          defaults.outside,
          'text-muted-fg aria-selected:text-muted-fg',
        ),
        disabled: cn(defaults.disabled, 'text-muted-fg opacity-50'),
        hidden: cn(defaults.hidden, 'invisible'),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: c, ...rest }) => {
          const Icon =
            orientation === 'left' ? ChevronLeftIcon : ChevronRightIcon
          return <Icon className={cn('size-4', c)} {...rest} />
        },
      }}
      {...props}
    />
  )
}
