import axiosInstance from "@/lib/auth/axios-instance";
import type { Collection } from "@/lib/types";
import type { ApiResponse } from "@/lib/types/api";

export interface CreateCollectionInput {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface UpdateCollectionInput extends Partial<CreateCollectionInput> {}

export const collectionService = {
  async getCollections() {
    const res = await axiosInstance.get<ApiResponse<Collection[]>>(
      "/collections",
    );
    return res.data.data;
  },

  async getCollection(id: string) {
    const res = await axiosInstance.get<ApiResponse<Collection>>(
      `/collections/${id}`,
    );
    return res.data.data;
  },

  async createCollection(input: CreateCollectionInput) {
    const res = await axiosInstance.post<ApiResponse<Collection>>(
      "/collections",
      input,
    );
    return res.data.data;
  },

  async updateCollection(id: string, data: UpdateCollectionInput) {
    const res = await axiosInstance.put<ApiResponse<Collection>>(
      `/collections/${id}`,
      data,
    );
    return res.data.data;
  },

  async deleteCollection(id: string) {
    await axiosInstance.delete(`/collections/${id}`);
  },
};
