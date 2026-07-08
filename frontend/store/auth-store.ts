import { create } from "zustand";
import { User } from "@/types/auth";
import { setCookie, removeCookie } from "@/utils/storage";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  setAuth: (user, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token);
      setCookie("access_token", token);
    }
    set({ user, accessToken: token });
  },
  clearAuth: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      removeCookie("access_token");
    }
    set({ user: null, accessToken: null });
  },
}));

