'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Blog } from '@/lib/data'
import axiosInstance from '@/lib/auth/axios-instance'

export interface CreateBlogInput {
  title: string
  excerpt: string
  content: string
  author: string
  tags: string[]
  status: 'published' | 'draft'
}

export interface UpdateBlogInput extends Partial<CreateBlogInput> {}

// Fetch all blogs
export function useBlogs() {
  return useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Blog[]>('/api/blogs')
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Fetch single blog
export function useBlog(id: string) {
  return useQuery({
    queryKey: ['blog', id],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Blog>(`/api/blogs/${id}`)
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Create blog
export function useCreateBlog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateBlogInput) => {
      const { data } = await axiosInstance.post<Blog>('/api/blogs', input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
    },
  })
}

// Update blog
export function useUpdateBlog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBlogInput }) => {
      const response = await axiosInstance.put<Blog>(
        `/api/blogs/${id}`,
        data
      )
      return response.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
      queryClient.invalidateQueries({ queryKey: ['blog', variables.id] })
    },
  })
}

// Delete blog
export function useDeleteBlog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/api/blogs/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
    },
  })
}
