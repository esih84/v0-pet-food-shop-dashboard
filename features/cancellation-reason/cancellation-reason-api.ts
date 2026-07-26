import axiosInstance from "@/lib/auth/axios-instance";
import type { ApiResponse, PaginatedResult } from "@/lib/types/api";

export interface CancellationReason {
  id: string;
  label: string;
  slug?: string;
  isActive: boolean;
  isSystem: boolean;
  order: number;
  createdAt: string;
}

export interface CreateCancellationReasonInput {
  label: string;
  isActive?: boolean;
  order?: number;
}

export type UpdateCancellationReasonInput =
  Partial<CreateCancellationReasonInput>;

/** One row of the cancellation-reason distribution. */
export interface ReasonStatItem {
  id: string;
  label: string;
  count: number;
  percentage: number;
}

export interface ReasonStats {
  total: number;
  unknownCount: number;
  unknownPercentage: number;
  items: ReasonStatItem[];
}

export interface ReasonStatsRange {
  /** Gregorian "YYYY-MM-DD" (from the Jalali picker). */
  from?: string;
  to?: string;
}

export const cancellationReasonService = {
  async getReasons(page = 1, limit = 50) {
    const res = await axiosInstance.get<
      ApiResponse<PaginatedResult<CancellationReason>>
    >(`/cancellation-reasons?page=${page}&limit=${limit}`);
    return res.data.data;
  },

  async getActiveReasons() {
    const res = await axiosInstance.get<ApiResponse<CancellationReason[]>>(
      "/cancellation-reasons/active",
    );
    return res.data.data;
  },

  async getStats(range: ReasonStatsRange) {
    const params = new URLSearchParams();
    Object.entries(range).forEach(([k, v]) => {
      if (v) params.set(k, String(v));
    });
    const qs = params.toString();
    const res = await axiosInstance.get<ApiResponse<ReasonStats>>(
      `/cancellation-reasons/stats${qs ? `?${qs}` : ""}`,
    );
    return res.data.data;
  },

  async createReason(input: CreateCancellationReasonInput) {
    const res = await axiosInstance.post<ApiResponse<CancellationReason>>(
      "/cancellation-reasons",
      input,
    );
    return res.data.data;
  },

  async updateReason(id: string, input: UpdateCancellationReasonInput) {
    const res = await axiosInstance.put<ApiResponse<CancellationReason>>(
      `/cancellation-reasons/${id}`,
      input,
    );
    return res.data.data;
  },

  async deleteReason(id: string) {
    await axiosInstance.delete(`/cancellation-reasons/${id}`);
  },
};
