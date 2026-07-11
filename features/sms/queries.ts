"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { smsService } from "./sms-api";
import { queryKeys } from "@/features/query-keys";

export function useSmsTemplates() {
  return useQuery({
    queryKey: queryKeys.smsTemplates,
    queryFn: smsService.getTemplates,
    staleTime: 60 * 1000,
  });
}

export function useSmsTemplate(id: string) {
  return useQuery({
    queryKey: queryKeys.smsTemplate(id),
    queryFn: () => smsService.getTemplate(id),
    enabled: !!id,
  });
}

export function useSmsStats() {
  return useQuery({
    queryKey: queryKeys.smsStats,
    queryFn: smsService.getStats,
    staleTime: 60 * 1000,
  });
}

export function useSmsMessages(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...queryKeys.smsMessages, page, limit],
    queryFn: () => smsService.getMessages(page, limit),
    placeholderData: keepPreviousData,
  });
}

export function useSmsCampaigns(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...queryKeys.smsCampaigns, page, limit],
    queryFn: () => smsService.getCampaigns(page, limit),
    placeholderData: keepPreviousData,
  });
}
