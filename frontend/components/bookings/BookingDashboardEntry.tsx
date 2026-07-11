"use client";

import { BookingDashboardActivity } from "@/components/bookings/BookingDashboardActivity";
import { BookingDashboardBookings } from "@/components/bookings/BookingDashboardBookings";
import { BookingDashboardBreadcrumb } from "@/components/bookings/BookingDashboardBreadcrumb";
import { BookingDashboardCalendar } from "@/components/bookings/BookingDashboardCalendar";
import { BookingDashboardCards } from "@/components/bookings/BookingDashboardCards";
import { BookingDashboardNotifications } from "@/components/bookings/BookingDashboardNotifications";
import { BookingDashboardQuickActions } from "@/components/bookings/BookingDashboardQuickActions";
import { Button } from "@/components/ui/button";
import { CalendarRange, LayoutDashboard, Sparkles } from "lucide-react";
import Link from "next/link";

const roleDetails = {
  client: {
    title: "Client Booking Dashboard",
    description:
      "Manage your event requests, budget proposals, and upcoming reservations from one place.",
    breadcrumbLabel: "Client Dashboard",
    actionLink: "/client/bookings",
    actionLabel: "View bookings",
  },
  artist: {
    title: "Artist Booking Dashboard",
    description:
      "Track incoming requests, confirmed performances, and booking availability in a single flow.",
    breadcrumbLabel: "Artist Dashboard",
    actionLink: "/artist/bookings",
    actionLabel: "Open booking inbox",
  },
  venue: {
    title: "Venue Booking Dashboard",
    description:
      "Review venue reservation requests, calendar availability, and event readiness from your dashboard.",
    breadcrumbLabel: "Venue Dashboard",
    actionLink: "/venue/bookings",
    actionLabel: "Open venue bookings",
  },
  admin: {
    title: "Admin Booking Dashboard",
    description:
      "Monitor platform bookings, review booking health, and track overall marketplace activity.",
    breadcrumbLabel: "Admin Dashboard",
    actionLink: "/admin/bookings",
    actionLabel: "Review booking queue",
  },
} as const;

type BookingRole = keyof typeof roleDetails;

export function BookingDashboardEntry({ role }: { role: BookingRole }) {
  const details = roleDetails[role];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <BookingDashboardBreadcrumb
          items={[
            { label: "Dashboard", href: `/${role === "venue" ? "venue" : role}/dashboard` },
            { label: "Bookings", href: details.actionLink, isCurrent: true },
          ]}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-bg-elevated/80 px-3 py-1 text-xs uppercase tracking-[0.25em] text-text-secondary">
              <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
              Booking Dashboard
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <CalendarRange className="h-7 w-7 text-primary" />
                {details.title}
              </h1>
              <p className="max-w-2xl text-sm text-text-secondary">{details.description}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Button size="sm" variant="secondary" className="text-xs h-9" asChild>
              <Link href={details.actionLink}>{details.actionLabel}</Link>
            </Button>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-bg-card/80 px-3 py-2 text-[11px] text-text-secondary">
              <Sparkles className="h-4 w-4 text-primary" />
              UI-only booking dashboard layout
            </div>
          </div>
        </div>
      </div>

      <BookingDashboardCards
        pendingBookings={8}
        confirmedBookings={12}
        completedBookings={14}
        cancelledBookings={2}
      />

      <BookingDashboardQuickActions />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <BookingDashboardCalendar />
        </div>
        <div className="space-y-6">
          <BookingDashboardNotifications />
          <BookingDashboardActivity />
        </div>
      </div>

      <BookingDashboardBookings />
    </div>
  );
}
