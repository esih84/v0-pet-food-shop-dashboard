import axiosInstance from "@/lib/auth/axios-instance";
import { Product } from "@/lib/types";
import { ApiResponse, PaginatedResult } from "@/lib/types/api";
import { CreateProductInput, UpdateProductInput } from "@/lib/types/product";

export const productsApi = {
  async getProducts() {
    const response =
      await axiosInstance.get<ApiResponse<PaginatedResult<Product>>>(
        "/products",
      );

    return response.data.data;
  },

  async getProduct(id: string) {
    const response = await axiosInstance.get<ApiResponse<Product>>(
      `/products/${id}`,
    );

    return response.data.data;
  },

  async createProduct(input: CreateProductInput) {
    const response = await axiosInstance.post<ApiResponse<Product>>(
      "/products",
      input,
    );

    return response.data.data;
  },

  async updateProduct(id: string, data: UpdateProductInput) {
    const response = await axiosInstance.put<ApiResponse<Product>>(
      `/products/${id}`,
      data,
    );

    return response.data.data;
  },

  async deleteProduct(id: string) {
    await axiosInstance.delete(`/products/${id}`);
  },
};
