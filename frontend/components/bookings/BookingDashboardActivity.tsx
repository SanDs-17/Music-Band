"use client";

import { BookingDashboardPlaceholderCard } from "@/components/bookings/BookingDashboardPlaceholderCard";
import { Activity, CalendarCheck, Clock3, MessageSquare } from "lucide-react";

const activityItems = [
  {
    id: "1",
    title: "Client message received",
    detail: "Awaiting reply for confirmation details.",
    time: "10m ago",
    icon: MessageSquare,
  },
  {
    id: "2",
    title: "Booking confirmed",
    detail: "Performance slot confirmed for 18 July.",
    time: "1h ago",
    icon: CalendarCheck,
  },
  {
    id: "3",
    title: "Venue availability updated",
    detail: "New open dates added for August.",
    time: "3h ago",
    icon: Clock3,
  },
];

export function BookingDashboardActivity() {
  return (
    <BookingDashboardPlaceholderCard
      title="Recent Activity"
      description="Timeline of the latest bookings, client interactions, and updates."
      icon={Activity}
      actionLabel="See all"
    >
      <div className="space-y-3">
        {activityItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="rounded-2xl border border-border/70 bg-bg-elevated/60 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white text-sm">{item.title}</p>
                  <p className="text-xs text-text-secondary mt-1">{item.detail}</p>
                </div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-text-secondary">
                  {item.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </BookingDashboardPlaceholderCard>
  );
}
