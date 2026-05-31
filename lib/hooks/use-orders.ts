'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Order } from '@/lib/data'
import axiosInstance from '@/lib/auth/axios-instance'

export interface UpdateOrderInput {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
}

// Fetch all orders
export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Order[]>('/api/orders')
      return data
    },
    staleTime: 2 * 60 * 1000,
  })
}

// Fetch single order
export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Order>(`/api/orders/${id}`)
      return data
    },
    staleTime: 2 * 60 * 1000,
  })
}

// Update order status
export function useUpdateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateOrderInput }) => {
      const response = await axiosInstance.put<Order>(
        `/api/orders/${id}`,
        data
      )
      return response.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] })
    },
  })
}
