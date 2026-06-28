import axiosInstance from "@/lib/auth/axios-instance";
import type { Blog } from "@/lib/types";
import type { ApiResponse, PaginatedResult } from "@/lib/types/api";

export interface CreateBlogInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  isPublished?: boolean;
}

export interface UpdateBlogInput extends Partial<CreateBlogInput> {}

export const blogService = {
  async getBlogs() {
    const res = await axiosInstance.get<ApiResponse<PaginatedResult<Blog>>>(
      "/blogs",
    );
    return res.data.data.data;
  },

  async getBlog(id: string) {
    const res = await axiosInstance.get<ApiResponse<Blog>>(`/blogs/${id}`);
    return res.data.data;
  },

  async createBlog(input: CreateBlogInput) {
    const res = await axiosInstance.post<ApiResponse<Blog>>("/blogs", input);
    return res.data.data;
  },

  async updateBlog(id: string, data: UpdateBlogInput) {
    const res = await axiosInstance.put<ApiResponse<Blog>>(`/blogs/${id}`, data);
    return res.data.data;
  },

  async deleteBlog(id: string) {
    await axiosInstance.delete(`/blogs/${id}`);
  },
};
