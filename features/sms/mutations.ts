"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { smsService, type UpdateSMSTemplateInput } from "./sms-api";
import { queryKeys } from "@/features/query-keys";

export function useCreateSMSTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: smsService.createTemplate,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.smsTemplates }),
  });
}

export function useUpdateSMSTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSMSTemplateInput }) =>
      smsService.updateTemplate(id, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.smsTemplates });
      qc.invalidateQueries({ queryKey: queryKeys.smsTemplate(variables.id) });
    },
  });
}

export function useDeleteSMSTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: smsService.deleteTemplate,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.smsTemplates }),
  });
}

export function useSendTestSMS() {
  return useMutation({
    mutationFn: ({
      templateId,
      phoneNumber,
    }: {
      templateId: string;
      phoneNumber: string;
    }) => smsService.sendTest(templateId, phoneNumber),
  });
}
