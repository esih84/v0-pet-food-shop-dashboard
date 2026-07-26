import type { Category } from "./category";
import type { Brand } from "./brand";

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
  id?: string;
  productId?: string;
  key: string;
  value: string;
};

export type ProductImage = {
  id: string;
  productId: string;
  url: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  order: number;
  altText?: string;
  isPrimary: boolean;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  stock: number;
  sku?: string;
  isActive: boolean;
  /** Manual display order (larger number = higher) */
  displayOrder?: number;

  categoryId?: string;
  category?: Category | null;
  /** Product categories (multi-valued) */
  categories?: Category[];

  brandId?: string;
  brand?: Brand | null;

  images?: ProductImage[];
  attributes?: ProductAttribute[];
  discounts?: Discount[];

  createdAt: string;
  updatedAt: string;
};

export interface CreateProductInput {
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  stock: number;
  sku?: string;
  categoryId?: string;
  /** Product categories (multi-valued) */
  categoryIds?: string[];
  brandId?: string;
  isActive?: boolean;
  /** Manual display order (larger number = higher) */
  displayOrder?: number;
  attributes?: ProductAttribute[];
  /** Product images — uploaded on create/edit (the first image is the primary one) */
  images?: File[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}
