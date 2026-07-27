"use client";

import * as React from "react";
import { useAuthStore } from "@/store/auth-store";

interface PermissionContextType {
  permissions: string[];
  roles: string[];
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  isLoading: boolean;
}

const PermissionContext = React.createContext<PermissionContextType | null>(null);

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, user } = useAuthStore();
  const [permissions, setPermissions] = React.useState<string[]>([]);
  const [roles, setRoles] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!accessToken || !user) {
      setPermissions([]);
      setRoles([]);
      setIsLoading(false);
      return;
    }

    try {
      // Decode JWT access token claims client-side to read permissions payload list
      const base64Url = accessToken.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      
      const payload = JSON.parse(jsonPayload);
      setPermissions(payload.permissions || []);
      setRoles(user.roles?.map((r: any) => r.name) || [payload.role].filter(Boolean));
    } catch (error) {
      console.error("Failed to decode token permissions claim:", error);
      setPermissions([]);
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, user]);

  const hasPermission = React.useCallback(
    (permission: string) => {
      return permissions.includes(permission);
    },
    [permissions]
  );

  const hasRole = React.useCallback(
    (role: string) => {
      return roles.includes(role);
    },
    [roles]
  );

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        roles,
        hasPermission,
        hasRole,
        isLoading,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissionContext() {
  const context = React.useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissionContext must be used within a PermissionProvider");
  }
  return context;
}
