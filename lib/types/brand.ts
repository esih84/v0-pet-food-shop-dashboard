export type Brand = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
  order: number;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
};
