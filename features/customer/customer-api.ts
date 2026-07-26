import axiosInstance from "@/lib/auth/axios-instance";
import type { ApiResponse, PaginatedResult } from "@/lib/types/api";

export interface Customer {
  id: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  birthDate?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;

  // RFM fields (come from /crm/customers)
  lastPurchaseAt?: string | null;
  firstPurchaseAt?: string | null;
  totalSpent?: number;
  orderCount?: number;
  lastOrderAmount?: number | null;
  rfmSegment?: string | null;
  /** RFM quantile scores (1..5); null until the batch recomputation has scored the customer. */
  rfmR?: number | null;
  rfmF?: number | null;
  rfmM?: number | null;
  smsOptOut?: boolean;
}

export const customerService = {
  async getCustomers(page = 1, limit = 50) {
    const res = await axiosInstance.get<ApiResponse<PaginatedResult<Customer>>>(
      `/users?page=${page}&limit=${limit}`,
    );
    return res.data.data;
  },

  async getCustomer(id: string) {
    const res = await axiosInstance.get<ApiResponse<Customer>>(`/users/${id}`);
    return res.data.data;
  },
};
