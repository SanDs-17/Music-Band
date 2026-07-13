"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { artistService } from "@/services/artistService";
import { Spinner } from "@/components/ui/spinner";

/**
 * Artist portal layout.
 * After authentication is confirmed, checks if an ArtistProfile exists for this user.
 * If no profile exists (new artist registered via /auth/register), redirects to
 * /artist/profile so the artist can complete their onboarding.
 * If the user is already on /artist/profile (setup flow), skip the check to avoid loops.
 */
function ArtistOnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    // Skip check if already on the profile setup page to avoid redirect loops
    if (pathname === "/artist/profile") {
      setChecking(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        await artistService.getProfile();
        // Profile exists — proceed normally
      } catch (err: unknown) {
        const apiErr = err as { response?: { status?: number } };
        if (apiErr?.response?.status === 404) {
          // No artist profile yet — redirect to setup
          if (!cancelled) {
            router.replace("/artist/profile");
            return;
          }
        }
        // For any other error (network, 500), allow through — dashboard handles gracefully
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <Spinner className="h-10 w-10 text-primary" />
        <p className="text-sm text-text-secondary animate-pulse">
          Loading artist portal...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

export default function ArtistRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["artist"]}>
      <DashboardLayout role="artist">
        <ArtistOnboardingGuard>{children}</ArtistOnboardingGuard>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
