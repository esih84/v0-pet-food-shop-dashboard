import axiosInstance from "@/lib/auth/axios-instance";
import type { Brand } from "@/lib/types";
import type { ApiResponse } from "@/lib/types/api";

export type { Brand };

export interface CreateBrandInput {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  /** فایل تصویر — در صورت آپلود به‌جای imageUrl استفاده می‌شود (multipart) */
  image?: File;
}

export interface UpdateBrandInput extends Partial<CreateBrandInput> {}

/** اگر فایلی وجود داشته باشد بدنه را به FormData (multipart) تبدیل می‌کند، وگرنه JSON می‌ماند. */
function buildBrandBody(input: UpdateBrandInput): FormData | UpdateBrandInput {
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

export const brandService = {
  async getBrands() {
    const res = await axiosInstance.get<ApiResponse<Brand[]>>("/brands");
    return res.data.data;
  },

  async createBrand(input: CreateBrandInput) {
    const res = await axiosInstance.post<ApiResponse<Brand>>(
      "/brands",
      buildBrandBody(input),
    );
    return res.data.data;
  },

  async updateBrand(id: string, input: UpdateBrandInput) {
    const res = await axiosInstance.put<ApiResponse<Brand>>(
      `/brands/${id}`,
      buildBrandBody(input),
    );
    return res.data.data;
  },

  async deleteBrand(id: string) {
    await axiosInstance.delete(`/brands/${id}`);
  },
};
