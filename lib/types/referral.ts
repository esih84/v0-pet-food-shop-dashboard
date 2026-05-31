import type { User } from "./user";

export type ReferralStatus = "pending" | "completed";

export type Referral = {
  id: string;

  referrerId: string;
  referrer?: User;

  referredId?: string;
  referred?: User | null;

  code: string;
  status: ReferralStatus;

  referrerReward: number;
  referredReward: number;

  completedAt?: string;
  createdAt: string;
};
