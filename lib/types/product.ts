import type { Category } from "./category";

export type DiscountType = "percentage" | "fixed";

export type Discount = {
  id: string;
  productId: string;
  type: DiscountType;
  value: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductAttribute = {
  id: string;
  productId: string;
  key: string;
  value: string;
};

export type ProductImage = {
  id: string;
  productId: string;
  variantId?: string;
  url: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  order: number;
  altText?: string;
  isPrimary: boolean;
};

export type ProductVariant = {
  id: string;
  productId: string;
  color?: string;
  size?: string;
  price: number;
  stock: number;
  sku: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  isActive: boolean;

  categoryId?: string;
  category?: Category | null;

  variants?: ProductVariant[];
  images?: ProductImage[];
  attributes?: ProductAttribute[];
  discounts?: Discount[];

  createdAt: string;
  updatedAt: string;
};
