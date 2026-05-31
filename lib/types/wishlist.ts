import type { User } from "./user";
import type { Product, ProductVariant } from "./product";

export type Wishlist = {
  id: string;

  userId: string;
  user?: User;

  productId: string;
  product?: Product;

  variantId?: string;
  variant?: ProductVariant | null;

  addedAt: string;
};
