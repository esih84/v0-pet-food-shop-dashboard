import axiosInstance from "@/lib/auth/axios-instance";
import type { ApiResponse, PaginatedResult } from "@/lib/types/api";

export type CouponType = "percentage" | "fixed" | "free_shipping";

/** دامنه‌ی اعمال کوپن (مستقل از CouponType). */
export type CouponScope = "cart" | "product" | "category";

/** ارجاع سبک محصول/دسته برای نمایش دامنه در جدول. */
interface CouponRef {
  id: string;
  name: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  type: CouponType;
  scope: CouponScope;
  value: number;
  maxDiscount?: number;
  minPurchase?: number;
  usageLimit?: number;
  perUserLimit: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  products?: CouponRef[];
  categories?: CouponRef[];
  /** دفعات استفاده (تاریخچه‌ی خرید) — از بک‌اند ضمیمه می‌شود */
  usedCount?: number;
  createdAt: string;
}

export interface CreateCouponInput {
  code: string;
  description?: string;
  type: CouponType;
  scope?: CouponScope;
  value: number;
  maxDiscount?: number;
  minPurchase?: number;
  usageLimit?: number;
  perUserLimit?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  productIds?: string[];
  categoryIds?: string[];
}

export type UpdateCouponInput = Partial<CreateCouponInput>;

/** یک ردیف تاریخچه‌ی استفاده از کوپن (خرید ثبت‌شده با کد تخفیف). */
export interface CouponUsage {
  id: string;
  couponId: string;
  coupon?: Coupon;
  userId: string;
  user?: {
    id: string;
    phone: string;
    firstName?: string;
    lastName?: string;
  };
  orderId?: string;
  discountApplied: number;
  usedAt: string;
}

export const couponService = {
  async getCoupons(page = 1, limit = 50) {
    const res = await axiosInstance.get<ApiResponse<PaginatedResult<Coupon>>>(
      `/coupons?page=${page}&limit=${limit}`,
    );
    return res.data.data;
  },

  async getCouponUsages(page = 1, limit = 50, couponId?: string) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (couponId) params.set("couponId", couponId);
    const res = await axiosInstance.get<
      ApiResponse<PaginatedResult<CouponUsage>>
    >(`/coupons/usages?${params.toString()}`);
    return res.data.data;
  },

  async createCoupon(input: CreateCouponInput) {
    const res = await axiosInstance.post<ApiResponse<Coupon>>(
      "/coupons",
      input,
    );
    return res.data.data;
  },

  async updateCoupon(id: string, input: UpdateCouponInput) {
    const res = await axiosInstance.put<ApiResponse<Coupon>>(
      `/coupons/${id}`,
      input,
    );
    return res.data.data;
  },

  async deleteCoupon(id: string) {
    await axiosInstance.delete(`/coupons/${id}`);
  },
};
