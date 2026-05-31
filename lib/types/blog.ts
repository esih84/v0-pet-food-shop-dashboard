import type { User } from "./user";

export type Blog = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;

  authorId?: string;
  author?: User;

  featuredImage?: string;
  publishedAt?: string;
  isPublished: boolean;

  createdAt: string;
  updatedAt: string;
};
