import axiosInstance from "@/lib/auth/axios-instance";
import type { ApiResponse, PaginatedResult } from "@/lib/types/api";
import type { Customer } from "@/features/customer/customer-api";
import type { CustomerFilter } from "@/features/sms/sms-api";

export const SEGMENT_COLORS = [
  "primary",
  "blue",
  "green",
  "cyan",
  "amber",
  "red",
  "gray",
] as const;
export type SegmentColor = (typeof SEGMENT_COLORS)[number];

/** Key used in the counts map for customers who matched no segment rule. */
export const UNCLASSIFIED_KEY = "unclassified";

/**
 * A customer segment. Segments live in the database rather than in code, so labels, colours
 * and ordering all come from here — nothing about them is known at build time.
 *
 * A `null` bound means unbounded on that side, so a segment with every bound null is a
 * catch-all. `systemRole` marks a segment the engine assigns directly instead of by matching
 * rules; those cannot be deleted or re-keyed.
 */
export type RfmSegment = {
  id: string;
  key: string;
  label: string;
  description?: string | null;
  color: SegmentColor;
  priority: number;
  minR: number | null;
  maxR: number | null;
  minF: number | null;
  maxF: number | null;
  minM: number | null;
  maxM: number | null;
  minSpent: number | null;
  minOrders: number | null;
  maxDaysSincePurchase: number | null;
  isActive: boolean;
  systemRole?: "no_purchase" | null;
  createdAt: string;
  updatedAt: string;
};

export type RfmSegmentInput = Partial<
  Omit<RfmSegment, "id" | "systemRole" | "createdAt" | "updatedAt">
> & { key?: string; label?: string };

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

  async recomputeRfm() {
    const res = await axiosInstance.post<ApiResponse<{ updated: number }>>(
      "/crm/recompute-rfm",
    );
    return res.data.data;
  },

  // ---- Segment definitions ----
  // Every mutation recomputes on the server and reports how many customers moved, which is
  // the only visible confirmation that a rule change did anything.

  async getSegments() {
    const res =
      await axiosInstance.get<ApiResponse<RfmSegment[]>>("/crm/segments");
    return res.data.data;
  },

  async getSegmentCounts() {
    const res = await axiosInstance.get<ApiResponse<Record<string, number>>>(
      "/crm/segments/counts",
    );
    return res.data.data;
  },

  async createSegment(input: RfmSegmentInput) {
    const res = await axiosInstance.post<
      ApiResponse<{ segment: RfmSegment; updated: number }>
    >("/crm/segments", input);
    return res.data.data;
  },

  async updateSegment(id: string, input: RfmSegmentInput) {
    const res = await axiosInstance.put<
      ApiResponse<{ segment: RfmSegment; updated: number }>
    >(`/crm/segments/${id}`, input);
    return res.data.data;
  },

  async deleteSegment(id: string) {
    const res = await axiosInstance.delete<ApiResponse<{ updated: number }>>(
      `/crm/segments/${id}`,
    );
    return res.data.data;
  },

  async reorderSegments(ids: string[]) {
    const res = await axiosInstance.put<
      ApiResponse<{ segments: RfmSegment[]; updated: number }>
    >("/crm/segments/reorder", { ids });
    return res.data.data;
  },
};
