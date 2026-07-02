import axiosInstance from "./axios-instance";

/**
 * Auth Client — ورود ادمین با OTP موبایل (مطابق بک‌اند).
 * احراز هویت کوکی‌محور (httpOnly) است؛ بنابراین withCredentials روشن است
 * و توکنی در سمت کلاینت ذخیره نمی‌شود.
 *
 * از همان axiosInstance مشترک استفاده می‌کنیم تا درخواست‌هایی مثل me()
 * روی خطای 401 به‌طور خودکار refresh شوند و ادمین بی‌دلیل بیرون نیفتد.
 */

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
    await axiosInstance.post("/auth/send-otp", { phone });
  },

  /** تأیید کد و ست‌شدن کوکی‌های احراز هویت توسط بک‌اند */
  verifyOtp: async (phone: string, code: string): Promise<VerifyOtpResponse> => {
    const res = await axiosInstance.post("/auth/verify-otp", { phone, code });
    return res.data.data as VerifyOtpResponse;
  },

  /** تمدید کوکی‌ها با کوکی refresh */
  refresh: async (): Promise<void> => {
    await axiosInstance.post("/auth/refresh");
  },

  /** خروج و پاک‌کردن کوکی‌ها */
  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch {
      // خطای logout را نادیده می‌گیریم
    }
  },

  /** کاربر فعلی */
  me: async (): Promise<AdminUser> => {
    const res = await axiosInstance.get("/users/me");
    return res.data.data as AdminUser;
  },
};
