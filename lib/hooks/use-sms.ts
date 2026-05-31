'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '@/lib/auth/axios-instance'

export interface SMSTemplate {
  id: string
  name: string
  message: string
  category: 'order' | 'customer' | 'promotion' | 'reminder'
  active: boolean
  variables: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateSMSTemplateInput {
  name: string
  message: string
  category: 'order' | 'customer' | 'promotion' | 'reminder'
  active: boolean
}

export interface UpdateSMSTemplateInput extends Partial<CreateSMSTemplateInput> {}

export interface SMSStats {
  totalSent: number
  successRate: number
  creditsUsed: number
  categoryBreakdown: Record<string, number>
  topTemplates: Array<{ name: string; sent: number }>
}

// Fetch all SMS templates
export function useSMSTemplates() {
  return useQuery({
    queryKey: ['sms-templates'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<SMSTemplate[]>(
        '/api/sms/templates'
      )
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Fetch single SMS template
export function useSMSTemplate(id: string) {
  return useQuery({
    queryKey: ['sms-template', id],
    queryFn: async () => {
      const { data } = await axiosInstance.get<SMSTemplate>(
        `/api/sms/templates/${id}`
      )
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Create SMS template
export function useCreateSMSTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateSMSTemplateInput) => {
      const { data } = await axiosInstance.post<SMSTemplate>(
        '/api/sms/templates',
        input
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-templates'] })
    },
  })
}

// Update SMS template
export function useUpdateSMSTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSMSTemplateInput }) => {
      const response = await axiosInstance.put<SMSTemplate>(
        `/api/sms/templates/${id}`,
        data
      )
      return response.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sms-templates'] })
      queryClient.invalidateQueries({ queryKey: ['sms-template', variables.id] })
    },
  })
}

// Delete SMS template
export function useDeleteSMSTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/api/sms/templates/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-templates'] })
    },
  })
}

// Send test SMS
export function useSendTestSMS() {
  return useMutation({
    mutationFn: async ({
      templateId,
      phoneNumber,
    }: {
      templateId: string
      phoneNumber: string
    }) => {
      const { data } = await axiosInstance.post<{ message: string }>(
        '/api/sms/send-test',
        { templateId, phoneNumber }
      )
      return data
    },
  })
}

// Get SMS statistics
export function useSMSStats() {
  return useQuery({
    queryKey: ['sms-stats'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<SMSStats>('/api/sms/stats')
      return data
    },
    staleTime: 10 * 60 * 1000,
  })
}
