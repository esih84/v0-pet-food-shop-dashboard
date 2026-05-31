export type Role = "USER" | "ADMIN" | string;

export type User = {
  id: string;
  phone: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string; // Format: "YYYY-MM-DD"
  role: Role;
  isActive: boolean;
  referralCode?: string;
  referredBy?: string;
  createdAt: string;
  updatedAt: string;
};
