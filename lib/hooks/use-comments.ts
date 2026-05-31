'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Comment } from '@/lib/data'

export interface UpdateCommentInput {
  status?: 'pending' | 'approved' | 'rejected'
}

// Fetch all comments
export function useComments() {
  return useQuery({
    queryKey: ['comments'],
    queryFn: async () => {
      const response = await fetch('/api/comments')
      if (!response.ok) throw new Error('Failed to fetch comments')
      return response.json() as Promise<Comment[]>
    },
  })
}

// Fetch single comment
export function useComment(id: string) {
  return useQuery({
    queryKey: ['comment', id],
    queryFn: async () => {
      const response = await fetch(`/api/comments/${id}`)
      if (!response.ok) throw new Error('Failed to fetch comment')
      return response.json() as Promise<Comment>
    },
  })
}

// Update comment status
export function useUpdateComment(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateCommentInput) => {
      const response = await fetch(`/api/comments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update comment')
      return response.json() as Promise<Comment>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      queryClient.invalidateQueries({ queryKey: ['comment', id] })
    },
  })
}

// Delete comment
export function useDeleteComment(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/comments/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete comment')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
    },
  })
}
