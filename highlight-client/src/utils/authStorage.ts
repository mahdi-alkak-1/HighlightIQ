import { AuthResponse, AuthUser } from "@/types/auth";

const TOKEN_KEY = "highlightiq_token";
const USER_KEY = "highlightiq_user";

export const setAuthSession = (response: AuthResponse) => {
  localStorage.setItem(TOKEN_KEY, response.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(response.user));
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getAuthToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    return null;
  }
  if (isTokenExpired(token)) {
    clearAuthSession();
    return null;
  }
  return token;
};

export const getAuthUser = (): AuthUser | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return true;
  }
  const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  try {
    const decoded = JSON.parse(atob(payload)) as { exp?: number };
    if (!decoded.exp) {
      return true;
    }
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
};
