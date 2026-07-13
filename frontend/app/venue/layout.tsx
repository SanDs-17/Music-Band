"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { venueService } from "@/services/venueService";
import { Spinner } from "@/components/ui/spinner";

/**
 * Venue portal layout.
 * After authentication is confirmed, checks if a Venue record exists for this owner.
 * If no venue exists (new owner registered via /auth/register), redirects to
 * /venue/profile so the owner can complete venue setup.
 * If the user is already on /venue/profile (setup flow), skip the check to avoid loops.
 */
function VenueOnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    // Skip check if already on the venue profile/setup page to avoid redirect loops
    if (pathname === "/venue/profile") {
      setChecking(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        await venueService.getProfile();
        // Venue exists — proceed normally
      } catch (err: unknown) {
        const apiErr = err as { response?: { status?: number } };
        if (apiErr?.response?.status === 404) {
          // No venue record yet — redirect to venue setup
          if (!cancelled) {
            router.replace("/venue/profile");
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
          Loading venue portal...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

export default function VenueRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["venue_owner"]}>
      <DashboardLayout role="venue">
        <VenueOnboardingGuard>{children}</VenueOnboardingGuard>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
