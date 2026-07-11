import axiosInstance from "@/lib/auth/axios-instance";
import type { Banner } from "@/lib/types";
import type { ApiResponse, PaginatedResult } from "@/lib/types/api";

export interface CreateBannerInput {
  title: string;
  description?: string;
  imageUrl?: string;
  mobileImageUrl?: string;
  link?: string;
  position?: string;
  order?: number;
  isActive?: boolean;
  startDate?: Date | string;
  endDate?: Date | string;
  /** فایل تصویر دسکتاپ — در صورت آپلود، به‌جای imageUrl استفاده می‌شود */
  image?: File;
  /** فایل تصویر موبایل */
  mobileImage?: File;
}

export interface UpdateBannerInput extends Partial<CreateBannerInput> {}

/** اگر فایلی وجود داشته باشد بدنه را به FormData (multipart) تبدیل می‌کند، وگرنه JSON می‌ماند. */
function buildBannerBody(input: UpdateBannerInput): FormData | UpdateBannerInput {
  const hasFile = input.image instanceof File || input.mobileImage instanceof File;
  if (!hasFile) {
    const { image, mobileImage, ...rest } = input;
    return rest;
  }
  const fd = new FormData();
  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === "image" || key === "mobileImage") return;
    fd.append(key, value instanceof Date ? value.toISOString() : String(value));
  });
  if (input.image instanceof File) fd.append("image", input.image);
  if (input.mobileImage instanceof File) fd.append("mobileImage", input.mobileImage);
  return fd;
}

export const bannerService = {
  async getBanners() {
    const { data } = await axiosInstance.get<ApiResponse<Banner[]>>("/banners");
    return data.data;
  },

  // پنل ادمین — همه‌ی بنرها (شامل غیرفعال) با صفحه‌بندی
  async getAdminBanners(page = 1, limit = 10) {
    const { data } = await axiosInstance.get<
      ApiResponse<PaginatedResult<Banner>>
    >(`/banners/admin/all?page=${page}&limit=${limit}`);
    return data.data;
  },

  async getBanner(id: string) {
    const { data } = await axiosInstance.get<ApiResponse<Banner>>(
      `/banners/${id}`,
    );
    return data.data;
  },

  async createBanner(input: CreateBannerInput) {
    const { data } = await axiosInstance.post<ApiResponse<Banner>>(
      "/banners",
      buildBannerBody(input),
    );
    return data.data;
  },

  async updateBanner(id: string, payload: UpdateBannerInput) {
    const { data } = await axiosInstance.put<ApiResponse<Banner>>(
      `/banners/${id}`,
      buildBannerBody(payload),
    );
    return data.data;
  },

  async deleteBanner(id: string) {
    await axiosInstance.delete(`/banners/${id}`);
  },
};
