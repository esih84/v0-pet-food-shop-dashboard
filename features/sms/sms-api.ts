import axiosInstance from "@/lib/auth/axios-instance";

export interface SMSTemplate {
  id: string;
  name: string;
  message: string;
  category: "order" | "customer" | "promotion" | "reminder";
  active: boolean;
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSMSTemplateInput {
  name: string;
  message: string;
  category: "order" | "customer" | "promotion" | "reminder";
  active: boolean;
}

export interface UpdateSMSTemplateInput extends Partial<CreateSMSTemplateInput> {}

export interface SMSStats {
  totalSent: number;
  successRate: number;
  creditsUsed: number;
  categoryBreakdown: Record<string, number>;
  topTemplates: Array<{ name: string; sent: number }>;
}

export const smsService = {
  async getTemplates() {
    const { data } = await axiosInstance.get<SMSTemplate[]>(
      "/sms/templates",
    );
    return data;
  },

  async getTemplate(id: string) {
    const { data } = await axiosInstance.get<SMSTemplate>(
      `/sms/templates/${id}`,
    );
    return data;
  },

  async createTemplate(input: CreateSMSTemplateInput) {
    const { data } = await axiosInstance.post<SMSTemplate>(
      "/sms/templates",
      input,
    );
    return data;
  },

  async updateTemplate(id: string, payload: UpdateSMSTemplateInput) {
    const { data } = await axiosInstance.put<SMSTemplate>(
      `/sms/templates/${id}`,
      payload,
    );
    return data;
  },

  async deleteTemplate(id: string) {
    await axiosInstance.delete(`/sms/templates/${id}`);
  },

  async sendTest(templateId: string, phoneNumber: string) {
    const { data } = await axiosInstance.post<{ message: string }>(
      "/sms/send-test",
      { templateId, phoneNumber },
    );
    return data;
  },

  async getStats() {
    const { data } = await axiosInstance.get<SMSStats>("/sms/stats");
    return data;
  },
};
