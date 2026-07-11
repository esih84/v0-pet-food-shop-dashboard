import axiosInstance from "@/lib/auth/axios-instance";
import type { ApiResponse, PaginatedResult } from "@/lib/types/api";
import type { Customer } from "@/features/customer/customer-api";
import type { CustomerFilter } from "@/features/sms/sms-api";

/** برچسب فارسی سگمنت‌ها. */
export const SEGMENT_LABELS: Record<string, string> = {
  champion: "قهرمان (VIP)",
  loyal: "وفادار",
  active: "فعال",
  new: "تازه‌وارد",
  at_risk: "در معرض ریزش",
  lost: "از دست‌رفته",
  prospect: "بدون خرید",
};

export const SEGMENT_ORDER = [
  "champion",
  "loyal",
  "active",
  "new",
  "at_risk",
  "lost",
  "prospect",
] as const;

export const crmService = {
  async getCustomers(filter: CustomerFilter & { page?: number; limit?: number }) {
    const params = new URLSearchParams();
    Object.entries(filter).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
    });
    const res = await axiosInstance.get<ApiResponse<PaginatedResult<Customer>>>(
      `/crm/customers?${params.toString()}`,
    );
    return res.data.data;
  },

  async getSegments() {
    const res = await axiosInstance.get<ApiResponse<Record<string, number>>>(
      "/crm/segments",
    );
    return res.data.data;
  },

  async recomputeRfm() {
    const res = await axiosInstance.post<ApiResponse<{ updated: number }>>(
      "/crm/recompute-rfm",
    );
    return res.data.data;
  },
};
