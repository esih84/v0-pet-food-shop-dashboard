'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Comment } from '@/lib/data'
import axiosInstance from '@/lib/auth/axios-instance'

export interface UpdateCommentInput {
  status: 'pending' | 'approved' | 'rejected'
}

// Fetch all comments
export function useComments() {
  return useQuery({
    queryKey: ['comments'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Comment[]>('/api/comments')
      return data
    },
    staleTime: 2 * 60 * 1000,
  })
}

// Fetch single comment
export function useComment(id: string) {
  return useQuery({
    queryKey: ['comment', id],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Comment>(`/api/comments/${id}`)
      return data
    },
    staleTime: 2 * 60 * 1000,
  })
}

// Update comment status
export function useUpdateComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCommentInput }) => {
      const response = await axiosInstance.put<Comment>(
        `/api/comments/${id}`,
        data
      )
      return response.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      queryClient.invalidateQueries({ queryKey: ['comment', variables.id] })
    },
  })
}
