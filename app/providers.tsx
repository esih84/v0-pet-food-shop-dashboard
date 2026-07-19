'use client'

import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query'
import { ReactNode, useState } from 'react'
import { AxiosError } from 'axios'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'

/** پیام خطای خوانا را از پاسخ بک‌اند/axios استخراج می‌کند. */
function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as
      | { message?: string | string[] }
      | undefined
    const message = data?.message
    if (Array.isArray(message)) return message.join('، ')
    if (typeof message === 'string') return message
    if (error.code === 'ERR_NETWORK')
      return 'ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کنید.'
    return error.message || 'خطای ناشناخته رخ داد.'
  }
  if (error instanceof Error) return error.message
  return 'خطای ناشناخته رخ داد.'
}

/** آیا این خطا باید نادیده گرفته شود؟ (401 توسط interceptor مدیریت می‌شود) */
function shouldSkip(error: unknown): boolean {
  return error instanceof AxiosError && error.response?.status === 401
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes
            retry: 1,
          },
        },
        // نمایش خودکار توست خطا برای هر درخواست ناموفق (خواندن و نوشتن)
        queryCache: new QueryCache({
          onError: (error) => {
            if (shouldSkip(error)) return
            toast.error(getErrorMessage(error))
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            if (shouldSkip(error)) return
            toast.error(getErrorMessage(error))
          },
        }),
      }),
  )

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster richColors position="top-center" dir="rtl" />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
