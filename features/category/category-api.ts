import axiosInstance from "@/lib/auth/axios-instance";
import type { Category } from "@/lib/types";
import type { ApiResponse } from "@/lib/types/api";

export type { Category };

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
}

export const categoryService = {
  async getCategories() {
    const res = await axiosInstance.get<ApiResponse<Category[]>>("/categories");
    return res.data.data;
  },

  async createCategory(input: CreateCategoryInput) {
    const res = await axiosInstance.post<ApiResponse<Category>>(
      "/categories",
      input,
    );
    return res.data.data;
  },

  async deleteCategory(id: string) {
    await axiosInstance.delete(`/categories/${id}`);
  },
};
