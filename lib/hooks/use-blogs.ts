'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Blog } from '@/lib/data'

export interface CreateBlogInput {
  title: string
  excerpt: string
  content: string
  author: string
  status: 'draft' | 'published'
  tags: string[]
}

export interface UpdateBlogInput extends Partial<CreateBlogInput> {}

// Fetch all blogs
export function useBlogs() {
  return useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      const response = await fetch('/api/blogs')
      if (!response.ok) throw new Error('Failed to fetch blogs')
      return response.json() as Promise<Blog[]>
    },
  })
}

// Fetch single blog
export function useBlog(id: string) {
  return useQuery({
    queryKey: ['blog', id],
    queryFn: async () => {
      const response = await fetch(`/api/blogs/${id}`)
      if (!response.ok) throw new Error('Failed to fetch blog')
      return response.json() as Promise<Blog>
    },
  })
}

// Create blog
export function useCreateBlog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateBlogInput) => {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to create blog')
      return response.json() as Promise<Blog>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
    },
  })
}

// Update blog
export function useUpdateBlog(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateBlogInput) => {
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update blog')
      return response.json() as Promise<Blog>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
      queryClient.invalidateQueries({ queryKey: ['blog', id] })
    },
  })
}

// Delete blog
export function useDeleteBlog(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete blog')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
    },
  })
}
