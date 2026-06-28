import axios from "axios";

/**
 * Auth Client — ورود ادمین با OTP موبایل (مطابق بک‌اند).
 * احراز هویت کوکی‌محور (httpOnly) است؛ بنابراین withCredentials روشن است
 * و توکنی در سمت کلاینت ذخیره نمی‌شود.
 */

const authAxios = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1",
  timeout: 30000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export interface AdminUser {
  id: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

export interface VerifyOtpResponse {
  user: AdminUser;
  isNewUser: boolean;
}

export const authClient = {
  /** ارسال کد یک‌بارمصرف به شماره‌ی موبایل */
  sendOtp: async (phone: string): Promise<void> => {
    await authAxios.post("/auth/send-otp", { phone });
  },

  /** تأیید کد و ست‌شدن کوکی‌های احراز هویت توسط بک‌اند */
  verifyOtp: async (phone: string, code: string): Promise<VerifyOtpResponse> => {
    const res = await authAxios.post("/auth/verify-otp", { phone, code });
    return res.data.data as VerifyOtpResponse;
  },

  /** تمدید کوکی‌ها با کوکی refresh */
  refresh: async (): Promise<void> => {
    await authAxios.post("/auth/refresh");
  },

  /** خروج و پاک‌کردن کوکی‌ها */
  logout: async (): Promise<void> => {
    try {
      await authAxios.post("/auth/logout");
    } catch {
      // خطای logout را نادیده می‌گیریم
    }
  },

  /** کاربر فعلی */
  me: async (): Promise<AdminUser> => {
    const res = await authAxios.get("/users/me");
    return res.data.data as AdminUser;
  },
};
