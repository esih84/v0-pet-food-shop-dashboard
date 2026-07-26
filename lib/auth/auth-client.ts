import axiosInstance from "./axios-instance";

/**
 * Auth Client — admin login via mobile OTP (matching the backend).
 * Authentication is cookie-based (httpOnly), so withCredentials is enabled
 * and no token is stored on the client.
 *
 * We use the same shared axiosInstance so that requests like me()
 * are refreshed automatically on a 401 error and the admin is not logged out for no reason.
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
  /** Send a one-time code to the mobile number */
  sendOtp: async (phone: string): Promise<void> => {
    await axiosInstance.post("/auth/send-otp", { phone });
  },

  /** Verify the code; the backend sets the authentication cookies */
  verifyOtp: async (phone: string, code: string): Promise<VerifyOtpResponse> => {
    const res = await axiosInstance.post("/auth/verify-otp", { phone, code });
    return res.data.data as VerifyOtpResponse;
  },

  /** Renew the cookies using the refresh cookie */
  refresh: async (): Promise<void> => {
    await axiosInstance.post("/auth/refresh");
  },

  /** Log out and clear the cookies */
  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch {
      // We ignore logout errors
    }
  },

  /** Current user */
  me: async (): Promise<AdminUser> => {
    const res = await axiosInstance.get("/users/me");
    return res.data.data as AdminUser;
  },
};
