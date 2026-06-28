import axiosInstance from "@/lib/auth/axios-instance";
import type { ApiResponse, PaginatedResult } from "@/lib/types/api";

export interface Customer {
  id: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export const customerService = {
  async getCustomers(page = 1, limit = 50) {
    const res = await axiosInstance.get<ApiResponse<PaginatedResult<Customer>>>(
      `/users?page=${page}&limit=${limit}`,
    );
    return res.data.data;
  },
};
