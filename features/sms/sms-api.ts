import axiosInstance from "@/lib/auth/axios-instance";
import type { ApiResponse, PaginatedResult } from "@/lib/types/api";

export type SmsEvent = "purchase_paid" | "order_status" | "promotional";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface SmsTemplate {
  id: string;
  name: string;
  body: string;
  event: SmsEvent;
  orderStatus?: OrderStatus | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSmsTemplateInput {
  name: string;
  body: string;
  event: SmsEvent;
  orderStatus?: OrderStatus;
  isActive?: boolean;
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
  // ---- قالب‌ها ----
  async getTemplates() {
    const res = await axiosInstance.get<ApiResponse<SmsTemplate[]>>(
      "/sms/templates",
    );
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

  // ---- آمار/لاگ ----
  async getStats() {
    const res = await axiosInstance.get<ApiResponse<SmsStats>>("/sms/stats");
    return res.data.data;
  },

  async getMessages(page = 1, limit = 20) {
    const res = await axiosInstance.get<ApiResponse<PaginatedResult<SmsMessage>>>(
      `/sms/messages?page=${page}&limit=${limit}`,
    );
    return res.data.data;
  },

  // ---- کمپین‌ها ----
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
