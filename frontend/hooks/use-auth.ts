"use client";

import { useAuthContext } from "@/providers/auth-provider";
import { useAuthStore } from "@/store/auth-store";

export function useAuth() {
  const context = useAuthContext();
  const store = useAuthStore();

  return {
    user: store.user,
    accessToken: store.accessToken,
    isLoading: context.isLoading,
    logout: context.logout,
    setAuth: store.setAuth,
    clearAuth: store.clearAuth,
  };
}
