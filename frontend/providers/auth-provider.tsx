"use client";

import * as React from "react";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/services/api";

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, clearAuth, setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const checkSession = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      if (token) {
        try {
          const response = await api.get("/auth/me");
          const { success, data: userData } = response.data;
          if (success && userData) {
            setAuth(userData, token);
          } else {
            clearAuth();
          }
        } catch (error) {
          clearAuth();
        }
      } else {
        clearAuth();
      }
      setIsLoading(false);
    };
    checkSession();
  }, [setAuth, clearAuth]);

  const logout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be within AuthProvider");
  return context;
}
