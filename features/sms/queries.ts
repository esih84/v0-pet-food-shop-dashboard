"use client";

import { useQuery } from "@tanstack/react-query";
import { smsService } from "./sms-api";
import { queryKeys } from "@/features/query-keys";

export function useSMSTemplates() {
  return useQuery({
    queryKey: queryKeys.smsTemplates,
    queryFn: smsService.getTemplates,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSMSTemplate(id: string) {
  return useQuery({
    queryKey: queryKeys.smsTemplate(id),
    queryFn: () => smsService.getTemplate(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSMSStats() {
  return useQuery({
    queryKey: queryKeys.smsStats,
    queryFn: smsService.getStats,
    staleTime: 10 * 60 * 1000,
  });
}
