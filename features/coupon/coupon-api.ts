import axiosInstance from "@/lib/auth/axios-instance";
import type { ApiResponse, PaginatedResult } from "@/lib/types/api";

export type CouponType = "percentage" | "fixed";

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  type: CouponType;
  value: number;
  maxDiscount?: number;
  minPurchase?: number;
  usageLimit?: number;
  perUserLimit: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface CreateCouponInput {
  code: string;
  description?: string;
  type: CouponType;
  value: number;
  maxDiscount?: number;
  minPurchase?: number;
  usageLimit?: number;
  perUserLimit?: number;
  isActive?: boolean;
}

export const couponService = {
  async getCoupons(page = 1, limit = 50) {
    const res = await axiosInstance.get<ApiResponse<PaginatedResult<Coupon>>>(
      `/coupons?page=${page}&limit=${limit}`,
    );
    return res.data.data;
  },

  async createCoupon(input: CreateCouponInput) {
    const res = await axiosInstance.post<ApiResponse<Coupon>>(
      "/coupons",
      input,
    );
    return res.data.data;
  },

  async deleteCoupon(id: string) {
    await axiosInstance.delete(`/coupons/${id}`);
  },
};
