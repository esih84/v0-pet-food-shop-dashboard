import axios from "axios";

/**
 * Auth Client - Handle authentication API calls
 * Separate from main axios instance to avoid circular dependency during token refresh
 */

const authAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export const authClient = {
  /**
   * Login - Get access and refresh tokens
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await authAxios.post<LoginResponse>("/api/auth/login", {
      email,
      password,
    });
    return response.data;
  },

  /**
   * Refresh Token - Get new access token using refresh token
   */
  refreshToken: async (refreshToken: string): Promise<RefreshResponse> => {
    const response = await authAxios.post<RefreshResponse>(
      "/api/auth/refresh",
      {
        refreshToken,
      }
    );
    return response.data;
  },

  /**
   * Logout - Clear tokens on backend (optional)
   */
  logout: async (): Promise<void> => {
    try {
      await authAxios.post("/api/auth/logout");
    } catch (error) {
      // Ignore logout errors - just clear local tokens
      console.error("[v0] Logout error:", error);
    }
  },
};
