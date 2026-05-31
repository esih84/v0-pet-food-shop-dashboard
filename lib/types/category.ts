export type Category = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
  order: number;
  isActive: boolean;

  parentId?: string;
  parent?: Category | null;
  children?: Category[];

  createdAt: string;
  updatedAt: string;
};
