"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrent?: boolean;
}

interface BookingDashboardBreadcrumbProps {
  items: BreadcrumbItem[];
}

export function BookingDashboardBreadcrumb({ items }: BookingDashboardBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
      <Link
        href="/"
        className="flex items-center gap-1 text-text-secondary hover:text-white transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span>Home</span>
      </Link>
      {items.map((item) => (
        <span key={item.href} className="flex items-center gap-2">
          <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
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
