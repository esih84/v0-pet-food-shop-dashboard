'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Order } from '@/lib/data'

export interface UpdateOrderInput {
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
}

// Fetch all orders
export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await fetch('/api/orders')
      if (!response.ok) throw new Error('Failed to fetch orders')
      return response.json() as Promise<Order[]>
    },
  })
}

// Fetch single order
export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${id}`)
      if (!response.ok) throw new Error('Failed to fetch order')
      return response.json() as Promise<Order>
    },
  })
}

// Update order status
export function useUpdateOrder(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateOrderInput) => {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update order')
      return response.json() as Promise<Order>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', id] })
    },
  })
}

// Delete order
export function useDeleteOrder(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete order')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
