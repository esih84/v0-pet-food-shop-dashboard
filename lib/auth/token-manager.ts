/**
 * Token Manager - Handle localStorage token operations
 * Manages accessToken and refreshToken storage
 */

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const tokenManager = {
  // Get tokens
  getAccessToken: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  // Set tokens
  setAccessToken: (token: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  setRefreshToken: (token: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  // Store both tokens
  setTokens: (accessToken: string, refreshToken: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  // Clear tokens
  clearTokens: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  // Check if token exists
  hasAccessToken: () => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  hasRefreshToken: () => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem(REFRESH_TOKEN_KEY);
  },
};
