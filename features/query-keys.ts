/**
 * کلیدهای متمرکز React Query برای کل داشبورد.
 * هر feature از این‌جا کلید می‌گیرد تا invalidate/کش یکدست بماند.
 */
export const queryKeys = {
  products: ["products"] as const,
  product: (id: string) => ["products", id] as const,

  banners: ["banners"] as const,
  banner: (id: string) => ["banners", id] as const,

  blogs: ["blogs"] as const,
  blog: (id: string) => ["blogs", id] as const,

  categories: ["categories"] as const,

  collections: ["collections"] as const,
  collection: (id: string) => ["collections", id] as const,

  reviews: ["reviews"] as const,

  coupons: ["coupons"] as const,

  customers: ["customers"] as const,

  orders: ["orders"] as const,
  order: (id: string) => ["orders", id] as const,

  currentAdmin: ["current-admin"] as const,

  smsTemplates: ["sms-templates"] as const,
  smsTemplate: (id: string) => ["sms-template", id] as const,
  smsStats: ["sms-stats"] as const,
} as const;

// نام‌های مستعار پرکاربرد
export const CURRENT_ADMIN_KEY = queryKeys.currentAdmin;
