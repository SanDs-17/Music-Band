"use client";

/**
 * ProtectedRoute — client-side authentication and RBAC guard.
 *
 * Waits for AuthProvider to finish hydrating (isLoading=false) before making
 * any redirect decision. This prevents premature redirects during SSR
 * hydration when user/token state is not yet restored.
 *
 * Redirect logic:
 *   - !user → /login (unauthenticated)
 *   - user.role not in allowedRoles → / (authenticated but wrong role)
 *   - isLoading → shows spinner (hydrating)
 *
 * user.role is always a string after normaliseUserRole() runs in setAuth().
 * The canonical role values are: client | artist | venue_owner | admin
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";

type Role = "client" | "artist" | "venue_owner" | "admin";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (isLoading) return; // Wait for hydration to complete

    if (!user) {
      router.replace("/login");
      return;
    }

    if (allowedRoles && user.role && !allowedRoles.includes(user.role as Role)) {
      // Authenticated but wrong role for this section
      router.replace("/");
    }
  }, [user, isLoading, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-primary">
        <Spinner size="lg" />
      </div>
    );
  }

  // Still render null while redirect is in-flight
  if (!user) return null;
  if (allowedRoles && user.role && !allowedRoles.includes(user.role as Role)) {
    return null;
  }

  return <>{children}</>;
}
