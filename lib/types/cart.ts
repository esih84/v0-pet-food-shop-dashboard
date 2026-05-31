import type { User } from "./user";
import type { ProductVariant } from "./product";

export type CartItem = {
  id: string;

  cartId: string;
  variantId: string;

  variant?: ProductVariant;

  quantity: number;
  addedAt: string;
};

export type Cart = {
  id: string;

  userId: string;
  user?: User;

  items: CartItem[];

  expiresAt?: string;

  createdAt: string;
  updatedAt: string;
};
