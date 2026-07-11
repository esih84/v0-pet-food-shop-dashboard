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

  brands: ["brands"] as const,

  collections: ["collections"] as const,
  collection: (id: string) => ["collections", id] as const,

  reviews: ["reviews"] as const,

  coupons: ["coupons"] as const,
  couponUsages: ["coupon-usages"] as const,

  customers: ["customers"] as const,
  customer: (id: string) => ["customers", id] as const,

  pets: ["pets"] as const,

  orders: ["orders"] as const,
  order: (id: string) => ["orders", id] as const,
  userOrders: (userId: string) => ["orders", "user", userId] as const,

  currentAdmin: ["current-admin"] as const,

  smsTemplates: ["sms-templates"] as const,
  smsTemplate: (id: string) => ["sms-template", id] as const,
  smsStats: ["sms-stats"] as const,
  smsMessages: ["sms-messages"] as const,
  smsCampaigns: ["sms-campaigns"] as const,
  smsCampaign: (id: string) => ["sms-campaign", id] as const,

  crmCustomers: ["crm-customers"] as const,
  crmSegments: ["crm-segments"] as const,
} as const;

// نام‌های مستعار پرکاربرد
export const CURRENT_ADMIN_KEY = queryKeys.currentAdmin;
