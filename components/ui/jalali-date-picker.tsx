'use client'

import DatePicker, { DateObject } from 'react-multi-date-picker'
import persian from 'react-date-object/calendars/persian'
import persian_fa from 'react-date-object/locales/persian_fa'
import gregorian from 'react-date-object/calendars/gregorian'
import gregorian_en from 'react-date-object/locales/gregorian_en'
import { cn } from '@/lib/utils'

interface JalaliDatePickerProps {
  /** Gregorian value as YYYY-MM-DD (the same thing sent to the backend). */
  value?: string
  /** New Gregorian value (YYYY-MM-DD) or an empty string when cleared. */
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

const inputClass =
  'placeholder:text-muted-foreground border-input dark:bg-input/30 h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'

/**
 * Jalali (Persian) date picker. Shows the user a Persian date but outputs a Gregorian
 * value (YYYY-MM-DD) so the backend stores the Gregorian date unchanged.
 */
export function JalaliDatePicker({
  value,
  onChange,
  placeholder = 'انتخاب تاریخ',
  className,
  disabled,
}: JalaliDatePickerProps) {
  // Input Gregorian value → Jalali DateObject for display
  const displayValue = value
    ? new DateObject({
        date: value,
        format: 'YYYY-MM-DD',
        calendar: gregorian,
        locale: gregorian_en,
      }).convert(persian, persian_fa)
    : ''

  return (
    <DatePicker
      calendar={persian}
      locale={persian_fa}
      calendarPosition="bottom-right"
      format="YYYY/MM/DD"
      value={displayValue}
      disabled={disabled}
      onChange={(date) => {
        const d = date as DateObject | null
        if (!d) {
          onChange('')
          return
        }
        // Jalali DateObject → Gregorian YYYY-MM-DD (without timezone shift)
        const g = new DateObject(d).convert(gregorian, gregorian_en)
        onChange(g.format('YYYY-MM-DD'))
      }}
      inputClass={cn(inputClass, className)}
      placeholder={placeholder}
      containerClassName="w-full"
      editable={false}
    />
  )
}
