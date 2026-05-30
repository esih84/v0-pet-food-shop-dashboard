import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface SMSTemplate {
  id: string
  name: string
  title: string
  content: string
  variables: string[]
  category: 'order' | 'customer' | 'promotion' | 'reminder'
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateSMSTemplateInput {
  name: string
  title: string
  content: string
  category: 'order' | 'customer' | 'promotion' | 'reminder'
}

export interface UpdateSMSTemplateInput {
  name?: string
  title?: string
  content?: string
  category?: 'order' | 'customer' | 'promotion' | 'reminder'
  active?: boolean
}

// Fetch all SMS templates
export function useSMSTemplates() {
  return useQuery({
    queryKey: ['sms-templates'],
    queryFn: async () => {
      const response = await fetch('/api/sms/templates')
      if (!response.ok) throw new Error('Failed to fetch SMS templates')
      return response.json() as Promise<SMSTemplate[]>
    },
  })
}

// Fetch single SMS template
export function useSMSTemplate(id: string) {
  return useQuery({
    queryKey: ['sms-template', id],
    queryFn: async () => {
      const response = await fetch(`/api/sms/templates/${id}`)
      if (!response.ok) throw new Error('Failed to fetch SMS template')
      return response.json() as Promise<SMSTemplate>
    },
    enabled: !!id,
  })
}

// Create SMS template
export function useCreateSMSTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateSMSTemplateInput) => {
      const response = await fetch('/api/sms/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to create SMS template')
      return response.json() as Promise<SMSTemplate>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-templates'] })
    },
  })
}

// Update SMS template
export function useUpdateSMSTemplate(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateSMSTemplateInput) => {
      const response = await fetch(`/api/sms/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update SMS template')
      return response.json() as Promise<SMSTemplate>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-templates'] })
      queryClient.invalidateQueries({ queryKey: ['sms-template', id] })
    },
  })
}

// Delete SMS template
export function useDeleteSMSTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/sms/templates/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete SMS template')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-templates'] })
    },
  })
}

// Send test SMS
export function useSendTestSMS() {
  return useMutation({
    mutationFn: async (payload: { templateId: string; phoneNumber: string; variables?: Record<string, string> }) => {
      const response = await fetch('/api/sms/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('Failed to send test SMS')
      return response.json()
    },
  })
}

// Get SMS statistics
export function useSMSStats() {
  return useQuery({
    queryKey: ['sms-stats'],
    queryFn: async () => {
      const response = await fetch('/api/sms/stats')
      if (!response.ok) throw new Error('Failed to fetch SMS stats')
      return response.json()
    },
  })
}
