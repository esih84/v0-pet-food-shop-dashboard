import axiosInstance from "@/lib/auth/axios-instance";
import type { ApiResponse, PaginatedResult } from "@/lib/types/api";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface OrderItem {
  id: string;
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderUser {
  id: string;
  phone: string;
  firstName?: string;
  lastName?: string;
}

export interface ShippingAddress {
  firstName?: string;
  lastName?: string;
  petName?: string;
  city?: string;
  address?: string;
  plaque?: string;
  note?: string;
}

export type ShippingMethod = "tipax" | "post";

/** برچسب فارسی روش‌های ارسال (هم‌راستا با enum ShippingMethod بک‌اند). */
export const SHIPPING_METHOD_LABELS: Record<string, string> = {
  tipax: "تیپاکس (پس‌کرایه)",
  post: "پست (پس‌کرایه)",
};

export interface Order {
  id: string;
  orderNumber?: string | null;
  userId: string;
  user?: OrderUser;
  items: OrderItem[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  couponCode?: string;
  pointsRedeemed: number;
  status: OrderStatus;
  shippingAddress?: ShippingAddress;
  shippingMethod?: ShippingMethod;
  createdAt: string;
  updatedAt: string;
}

export const orderService = {
  async getOrders(page = 1, limit = 50) {
    const res = await axiosInstance.get<ApiResponse<PaginatedResult<Order>>>(
      `/orders/admin/all?page=${page}&limit=${limit}`,
    );
    return res.data.data;
  },

  async getOrder(id: string) {
    const res = await axiosInstance.get<ApiResponse<Order>>(
      `/orders/admin/${id}`,
    );
    return res.data.data;
  },

  async getUserOrders(userId: string, page = 1, limit = 50) {
    const res = await axiosInstance.get<ApiResponse<PaginatedResult<Order>>>(
      `/orders/admin/user/${userId}?page=${page}&limit=${limit}`,
    );
    return res.data.data;
  },

  async updateOrderStatus(id: string, status: OrderStatus) {
    const res = await axiosInstance.put<ApiResponse<Order>>(
      `/orders/${id}/status`,
      { status },
    );
    return res.data.data;
  },
};
