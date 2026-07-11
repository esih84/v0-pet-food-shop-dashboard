"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  smsService,
  type UpdateSmsTemplateInput,
  type CustomerFilter,
} from "./sms-api";
import { queryKeys } from "@/features/query-keys";

export function useCreateSmsTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: smsService.createTemplate,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.smsTemplates }),
  });
}

export function useUpdateSmsTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSmsTemplateInput }) =>
      smsService.updateTemplate(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.smsTemplates }),
  });
}

export function useDeleteSmsTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: smsService.deleteTemplate,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.smsTemplates }),
  });
}

export function useSendTestSms() {
  return useMutation({
    mutationFn: ({ templateId, phone }: { templateId: string; phone: string }) =>
      smsService.sendTest(templateId, phone),
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: smsService.createCampaign,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.smsCampaigns }),
  });
}

export function usePreviewCampaign() {
  return useMutation({
    mutationFn: (filters: CustomerFilter) => smsService.previewCampaign(filters),
  });
}

export function useSendCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => smsService.sendCampaign(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.smsCampaigns });
      qc.invalidateQueries({ queryKey: queryKeys.smsStats });
    },
  });
}
