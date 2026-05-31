export type BannerPosition = string; // e.g., "home" | "category" | etc.

export type Banner = {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  link?: string;
  position: BannerPosition;
  order: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
};
