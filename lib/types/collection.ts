import type { Product } from "./product";

export type Collection = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;

  products?: Product[];

  createdAt: string;
  updatedAt: string;
};
