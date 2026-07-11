"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrent?: boolean;
}

interface BookingDashboardBreadcrumbProps {
  items: BreadcrumbItem[];
}

/**
 * Portal breadcrumb — represents the role portal navigation hierarchy.
 *
 * This component does NOT include a public "Home" / "/" link because role portal
 * breadcrumbs represent the authenticated portal hierarchy, not the public site.
 *
 * Correct client booking breadcrumb: Dashboard > My Bookings
 *   items={[
 *     { label: "Dashboard", href: "/client/dashboard" },
 *     { label: "My Bookings", href: "/client/bookings", isCurrent: true },
 *   ]}
 *
 * The first non-current item is the portal root (role overview dashboard).
 * Navigation to the public marketplace must use an explicit marketplace link,
 * not an ambiguous "Home" breadcrumb that points to the public landing page.
 */
export function BookingDashboardBreadcrumb({ items }: BookingDashboardBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
      {items.map((item, index) => (
        <span key={item.href} className="flex items-center gap-2">
          {index > 0 && (
            <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
          )}
          {item.isCurrent ? (
            <span className="text-white">{item.label}</span>
          ) : (
            <Link href={item.href} className="hover:text-white transition-colors">
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
