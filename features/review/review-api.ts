import axiosInstance from "@/lib/auth/axios-instance";
import type { ApiResponse, PaginatedResult } from "@/lib/types/api";

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  isApproved: boolean;
  productId: string;
  userId: string;
  product?: { id: string; name: string };
  user?: { id: string; firstName?: string; lastName?: string; phone?: string };
  createdAt: string;
}

export const reviewService = {
  async getReviews(page = 1, limit = 10) {
    const res = await axiosInstance.get<ApiResponse<PaginatedResult<Review>>>(
      `/reviews/admin/all?page=${page}&limit=${limit}`,
    );
    return res.data.data;
  },

  async approveReview(id: string) {
    const res = await axiosInstance.put<ApiResponse<Review>>(
      `/reviews/${id}/approve`,
      {},
    );
    return res.data.data;
  },

  async deleteReview(id: string) {
    await axiosInstance.delete(`/reviews/${id}`);
  },
};
