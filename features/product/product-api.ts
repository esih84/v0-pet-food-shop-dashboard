import axiosInstance from "@/lib/auth/axios-instance";
import type { Product } from "@/lib/types";
import type { ApiResponse, PaginatedResult } from "@/lib/types/api";
import type {
  CreateProductInput,
  UpdateProductInput,
} from "@/lib/types/product";

/**
 * اگر تصویری ضمیمه شده باشد بدنه را به FormData (multipart) تبدیل می‌کند تا
 * همراه تصاویر ارسال شود؛ در این حالت آرایه‌ها (attributes) به‌صورت JSON رشته‌ای
 * فرستاده می‌شوند (مطابق انتظار بک‌اند). در غیر این صورت JSON خام می‌ماند.
 */
function buildProductBody(
  input: UpdateProductInput,
): FormData | UpdateProductInput {
  const hasFiles = !!input.images && input.images.length > 0;
  if (!hasFiles) {
    const { images, ...rest } = input;
    return rest;
  }
  const fd = new FormData();
  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === "images") return;
    if (key === "attributes") {
      fd.append(key, JSON.stringify(value));
    } else {
      fd.append(key, String(value));
    }
  });
  input.images!.forEach((file) => fd.append("images", file));
  return fd;
}

export const productService = {
  async getProducts(page = 1, limit = 50) {
    const res = await axiosInstance.get<ApiResponse<PaginatedResult<Product>>>(
      `/products?page=${page}&limit=${limit}`,
    );
    return res.data.data;
  },

  // لیست همه‌ی محصولات (شامل غیرفعال) برای پنل ادمین
  async getAdminProducts(page = 1, limit = 50) {
    const res = await axiosInstance.get<ApiResponse<PaginatedResult<Product>>>(
      `/products/admin/all?page=${page}&limit=${limit}`,
    );
    return res.data.data;
  },

  async getProduct(id: string) {
    const res = await axiosInstance.get<ApiResponse<Product>>(
      `/products/${id}`,
    );
    return res.data.data;
  },

  // دریافت یک محصول برای پنل ادمین (شامل غیرفعال) — برای فرم ویرایش
  async getAdminProduct(id: string) {
    const res = await axiosInstance.get<ApiResponse<Product>>(
      `/products/admin/${id}`,
    );
    return res.data.data;
  },

  async createProduct(input: CreateProductInput) {
    const res = await axiosInstance.post<ApiResponse<Product>>(
      "/products",
      buildProductBody(input),
    );
    return res.data.data;
  },

  async updateProduct(id: string, data: UpdateProductInput) {
    const res = await axiosInstance.put<ApiResponse<Product>>(
      `/products/${id}`,
      buildProductBody(data),
    );
    return res.data.data;
  },

  async deleteProduct(id: string) {
    await axiosInstance.delete(`/products/${id}`);
  },

  // حذف یک تصویر محصول
  async deleteProductImage(productId: string, imageId: string) {
    const res = await axiosInstance.delete<ApiResponse<Product>>(
      `/products/${productId}/images/${imageId}`,
    );
    return res.data.data;
  },

  // تغییر ترتیب تصاویر محصول (اولین تصویر، تصویر اصلی)
  async reorderProductImages(productId: string, imageIds: string[]) {
    const res = await axiosInstance.patch<ApiResponse<Product>>(
      `/products/${productId}/images/reorder`,
      { imageIds },
    );
    return res.data.data;
  },
};
