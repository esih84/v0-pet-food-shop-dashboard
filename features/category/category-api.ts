import axiosInstance from "@/lib/auth/axios-instance";
import type { Category } from "@/lib/types";
import type { ApiResponse } from "@/lib/types/api";

export type { Category };

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  imageUrl?: string;
  /** ترتیب نمایش (عدد کوچک‌تر = بالاتر) */
  order?: number;
  /** نمایش در بخش دسته‌بندی صفحه‌ی اصلی */
  isFeatured?: boolean;
  /** فایل تصویر — در صورت آپلود به‌جای imageUrl استفاده می‌شود (multipart) */
  image?: File;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {}

/** اگر فایلی وجود داشته باشد بدنه را به FormData (multipart) تبدیل می‌کند، وگرنه JSON می‌ماند. */
function buildCategoryBody(
  input: UpdateCategoryInput,
): FormData | UpdateCategoryInput {
  if (!(input.image instanceof File)) {
    const { image, ...rest } = input;
    return rest;
  }
  const fd = new FormData();
  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === "image") return;
    fd.append(key, String(value));
  });
  fd.append("image", input.image);
  return fd;
}

export const categoryService = {
  async getCategories() {
    const res = await axiosInstance.get<ApiResponse<Category[]>>("/categories");
    return res.data.data;
  },

  async createCategory(input: CreateCategoryInput) {
    const res = await axiosInstance.post<ApiResponse<Category>>(
      "/categories",
      buildCategoryBody(input),
    );
    return res.data.data;
  },

  async updateCategory(id: string, input: UpdateCategoryInput) {
    const res = await axiosInstance.put<ApiResponse<Category>>(
      `/categories/${id}`,
      buildCategoryBody(input),
    );
    return res.data.data;
  },

  async deleteCategory(id: string) {
    await axiosInstance.delete(`/categories/${id}`);
  },
};
