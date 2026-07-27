"use client";

import { useAuthStore } from "@/store/auth-store";

export function useAuth() {
  const store = useAuthStore();

  const logout = () => {
    store.clearAuth();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  return {
    user: store.user,
    accessToken: store.accessToken,
    isLoading: false,
    logout,
    setAuth: store.setAuth,
    clearAuth: store.clearAuth,
  };
}
