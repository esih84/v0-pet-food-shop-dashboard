import axiosInstance from "@/lib/auth/axios-instance";
import type { Product } from "@/lib/types";
import type { ApiResponse, PaginatedResult } from "@/lib/types/api";
import type {
  CreateProductInput,
  UpdateProductInput,
  DiscountType,
} from "@/lib/types/product";

export interface CreateDiscountInput {
  type: DiscountType;
  value: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export interface ImportProductsResult {
  total: number;
  created: number;
  skipped: number;
  errors: { row: number; reason: string }[];
}

/** فیلترهای سرورساید لیست محصولات پنل ادمین. */
export interface ProductAdminFilters {
  search?: string;
  categoryIds?: string[];
  brandIds?: string[];
  stockStatus?: "in_stock" | "out_of_stock" | "low_stock";
  hasDiscount?: boolean;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

/** ساخت query string از فیلترها (آرایه‌ها به‌صورت CSV؛ خالی‌ها حذف می‌شوند). */
function buildAdminQuery(
  page: number,
  limit: number,
  filters?: ProductAdminFilters,
): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (!filters) return params.toString();
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.categoryIds?.length)
    params.set("categoryIds", filters.categoryIds.join(","));
  if (filters.brandIds?.length)
    params.set("brandIds", filters.brandIds.join(","));
  if (filters.stockStatus) params.set("stockStatus", filters.stockStatus);
  if (filters.hasDiscount !== undefined)
    params.set("hasDiscount", String(filters.hasDiscount));
  if (filters.isActive !== undefined)
    params.set("isActive", String(filters.isActive));
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
  return params.toString();
}

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
    if (key === "attributes" || key === "categoryIds") {
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

  // لیست همه‌ی محصولات (شامل غیرفعال) برای پنل ادمین — با فیلتر سرورساید
  async getAdminProducts(
    page = 1,
    limit = 50,
    filters?: ProductAdminFilters,
  ) {
    const res = await axiosInstance.get<ApiResponse<PaginatedResult<Product>>>(
      `/products/admin/all?${buildAdminQuery(page, limit, filters)}`,
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

  // ورود گروهی محصولات از فایل اکسل
  async importProducts(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await axiosInstance.post<ApiResponse<ImportProductsResult>>(
      "/products/import",
      fd,
    );
    return res.data.data;
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

  // افزودن تخفیف به محصول
  async addProductDiscount(productId: string, input: CreateDiscountInput) {
    const res = await axiosInstance.post<ApiResponse<Product>>(
      `/products/${productId}/discounts`,
      input,
    );
    return res.data.data;
  },

  // حذف تخفیف محصول
  async removeProductDiscount(productId: string, discountId: string) {
    const res = await axiosInstance.delete<ApiResponse<Product>>(
      `/products/${productId}/discounts/${discountId}`,
    );
    return res.data.data;
  },
};
