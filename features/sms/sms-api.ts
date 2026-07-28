import axiosInstance from "@/lib/auth/axios-instance";
import type { ApiResponse, PaginatedResult } from "@/lib/types/api";
import { OrderStatus } from "../order/order-api";

export type SmsEvent = "purchase_paid" | "order_status" | "promotional";

/** Order/user field that can feed a Kavenegar Lookup token slot. */
export type TokenField =
  | "firstName"
  | "fullName"
  | "petName"
  | "orderNumber"
  | "amount"
  | "statusLabel";

export type TokenSlot = "token" | "token2" | "token3" | "token10" | "token20";

export type TokenMap = Partial<Record<TokenSlot, TokenField>>;

export interface SmsTemplate {
  id: string;
  name?: string | null;
  body?: string | null;
  event: SmsEvent;
  orderStatus?: OrderStatus | null;
  isActive: boolean;
  tokenMap?: TokenMap | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSmsTemplateInput {
  name?: string;
  body?: string;
  event: SmsEvent;
  orderStatus?: OrderStatus;
  isActive?: boolean;
  tokenMap?: TokenMap;
}

export type UpdateSmsTemplateInput = Partial<CreateSmsTemplateInput>;

export interface SmsStats {
  totalSent: number;
  totalFailed: number;
  total: number;
  successRate: number;
  typeBreakdown: Record<string, number>;
}

export interface SmsMessage {
  id: string;
  userId?: string;
  phone: string;
  body: string;
  type: "transactional" | "promotional" | "otp";
  status: "pending" | "sent" | "failed";
  error?: string;
  createdAt: string;
}

export interface CustomerFilter {
  segment?: string;
  minSpent?: number;
  maxSpent?: number;
  minOrders?: number;
  lastPurchaseWithinDays?: number;
  lastPurchaseOlderThanDays?: number;
  /** RFM quantile scores (1..5). Set min = max for an exact score. */
  minR?: number;
  maxR?: number;
  minF?: number;
  maxF?: number;
  minM?: number;
  maxM?: number;
  petType?: string;
  search?: string;
}

export interface SmsCampaign {
  id: string;
  name: string;
  body: string;
  filters?: CustomerFilter;
  status: "draft" | "sending" | "sent" | "failed";
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignInput {
  name: string;
  body: string;
  filters?: CustomerFilter;
}

export interface CampaignPreview {
  count: number;
  sample: { name: string; phone: string; pet?: string }[];
}

export const smsService = {
  // ---- Templates ----
  async getTemplates() {
    const res =
      await axiosInstance.get<ApiResponse<SmsTemplate[]>>("/sms/templates");
    return res.data.data;
  },

  async getTemplate(id: string) {
    const res = await axiosInstance.get<ApiResponse<SmsTemplate>>(
      `/sms/templates/${id}`,
    );
    return res.data.data;
  },

  async createTemplate(input: CreateSmsTemplateInput) {
    const res = await axiosInstance.post<ApiResponse<SmsTemplate>>(
      "/sms/templates",
      input,
    );
    return res.data.data;
  },

  async updateTemplate(id: string, payload: UpdateSmsTemplateInput) {
    const res = await axiosInstance.put<ApiResponse<SmsTemplate>>(
      `/sms/templates/${id}`,
      payload,
    );
    return res.data.data;
  },

  async deleteTemplate(id: string) {
    await axiosInstance.delete(`/sms/templates/${id}`);
  },

  async sendTest(templateId: string, phone: string) {
    const res = await axiosInstance.post<ApiResponse<SmsMessage>>(
      "/sms/send-test",
      { templateId, phone },
    );
    return res.data.data;
  },

  // ---- Stats/logs ----
  async getStats() {
    const res = await axiosInstance.get<ApiResponse<SmsStats>>("/sms/stats");
    return res.data.data;
  },

  async getMessages(page = 1, limit = 20) {
    const res = await axiosInstance.get<
      ApiResponse<PaginatedResult<SmsMessage>>
    >(`/sms/messages?page=${page}&limit=${limit}`);
    return res.data.data;
  },

  // ---- Campaigns ----
  async getCampaigns(page = 1, limit = 20) {
    const res = await axiosInstance.get<
      ApiResponse<PaginatedResult<SmsCampaign>>
    >(`/sms/campaigns?page=${page}&limit=${limit}`);
    return res.data.data;
  },

  async createCampaign(input: CreateCampaignInput) {
    const res = await axiosInstance.post<ApiResponse<SmsCampaign>>(
      "/sms/campaigns",
      input,
    );
    return res.data.data;
  },

  async previewCampaign(filters: CustomerFilter) {
    const res = await axiosInstance.post<ApiResponse<CampaignPreview>>(
      "/sms/campaigns/preview",
      { filters },
    );
    return res.data.data;
  },

  async sendCampaign(id: string) {
    const res = await axiosInstance.post<ApiResponse<SmsCampaign>>(
      `/sms/campaigns/${id}/send`,
    );
    return res.data.data;
  },
};
