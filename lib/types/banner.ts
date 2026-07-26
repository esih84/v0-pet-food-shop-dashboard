/**
 * Allowed banner positions — must stay in sync with the backend registry
 * (shop-backend/src/modules/banners/banner-position.ts).
 */
export const BANNER_POSITION_OPTIONS = [
  { value: "home_main", label: "اسلایدر اصلی صفحه‌ی خانه" },
  { value: "home_side_top", label: "بنر کناری خانه — ردیف بالا" },
  { value: "home_side_bottom", label: "بنر کناری خانه — ردیف پایین" },
  { value: "brands", label: "برندها — صفحه‌ی اصلی (۲ بنر کنار هم)" },
] as const;

export type BannerPosition = (typeof BANNER_POSITION_OPTIONS)[number]["value"];

export function bannerPositionLabel(position: string): string {
  return (
    BANNER_POSITION_OPTIONS.find((o) => o.value === position)?.label ?? position
  );
}

export type Banner = {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  link?: string;
  /** Button text on the banner; if empty, the button is not shown */
  buttonText?: string;
  // Kept as string so old data with removed positions is still displayable
  position: string;
  order: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
};
