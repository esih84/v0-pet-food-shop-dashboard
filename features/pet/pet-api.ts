import axiosInstance from "@/lib/auth/axios-instance";
import type { ApiResponse, PaginatedResult } from "@/lib/types/api";

export type PetType = "dog" | "cat" | "bird" | "other";

export interface PetOwner {
  id: string;
  phone: string;
  firstName?: string;
  lastName?: string;
}

export interface Pet {
  id: string;
  name: string;
  type?: PetType;
  breed?: string;
  birthDate?: string;
  userId: string;
  user?: PetOwner;
  createdAt: string;
}

export const petService = {
  async getPets(page = 1, limit = 50) {
    const res = await axiosInstance.get<ApiResponse<PaginatedResult<Pet>>>(
      `/pets/admin/all?page=${page}&limit=${limit}`,
    );
    return res.data.data;
  },
};
