import type { User } from "./user";
import type { Product } from "./product";

export type Wishlist = {
  id: string;

  userId: string;
  user?: User;

  productId: string;
  product?: Product;

  addedAt: string;
};
