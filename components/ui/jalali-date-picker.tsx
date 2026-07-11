'use client'

import DatePicker, { DateObject } from 'react-multi-date-picker'
import persian from 'react-date-object/calendars/persian'
import persian_fa from 'react-date-object/locales/persian_fa'
import gregorian from 'react-date-object/calendars/gregorian'
import gregorian_en from 'react-date-object/locales/gregorian_en'
import { cn } from '@/lib/utils'

interface JalaliDatePickerProps {
  /** مقدار میلادی به‌صورت YYYY-MM-DD (همان چیزی که به بک‌اند می‌رود). */
  value?: string
  /** مقدار میلادی جدید (YYYY-MM-DD) یا رشته‌ی خالی هنگام پاک‌کردن. */
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

const inputClass =
  'placeholder:text-muted-foreground border-input dark:bg-input/30 h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'

/**
 * انتخابگر تاریخ شمسی (جلالی). به کاربر تاریخ فارسی نشان می‌دهد ولی مقدار میلادی
 * (YYYY-MM-DD) به بیرون می‌دهد تا بک‌اند بدون تغییر همان تاریخ میلادی را ذخیره کند.
 */
export function JalaliDatePicker({
  value,
  onChange,
  placeholder = 'انتخاب تاریخ',
  className,
  disabled,
}: JalaliDatePickerProps) {
  // مقدار میلادی ورودی → DateObject شمسی برای نمایش
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
        // DateObject شمسی → میلادی YYYY-MM-DD (بدون شیفت تایم‌زون)
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
