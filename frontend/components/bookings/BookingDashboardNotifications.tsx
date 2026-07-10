"use client";

import { BookingDashboardPlaceholderCard } from "@/components/bookings/BookingDashboardPlaceholderCard";
import { Bell, CheckCircle2, ShieldAlert, Zap } from "lucide-react";

const notifications = [
  {
    id: "1",
    title: "New booking request",
    message: "Client request received for 15 July event.",
    type: "alert",
    timestamp: "2h ago",
  },
  {
    id: "2",
    title: "Payment pending",
    message: "Awaiting client confirmation for venue hold.",
    type: "info",
    timestamp: "5h ago",
  },
  {
    id: "3",
    title: "Profile verification",
    message: "Venue maintenance window scheduled for tomorrow.",
    type: "success",
    timestamp: "1d ago",
  },
];

const iconMap = {
  alert: ShieldAlert,
  info: Bell,
  success: CheckCircle2,
};

export function BookingDashboardNotifications() {
  return (
    <BookingDashboardPlaceholderCard
      title="Notifications"
      description="Recent alerts, reminders, and booking updates for your account."
      icon={Zap}
      actionLabel="View all"
    >
      <div className="space-y-3">
        {notifications.map((notif) => {
          const Icon = iconMap[notif.type as keyof typeof iconMap] || Bell;
          return (
            <div
              key={notif.id}
              className="rounded-2xl border border-border/70 bg-bg-elevated/60 p-4 transition-colors hover:border-primary/40"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-2xl bg-white/5 p-2 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{notif.title}</p>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-text-secondary">
                      {notif.timestamp}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-text-secondary leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </BookingDashboardPlaceholderCard>
  );
}
