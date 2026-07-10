"use client";

import { BookingDashboardPlaceholderCard } from "@/components/bookings/BookingDashboardPlaceholderCard";
import { CalendarDays } from "lucide-react";

const calendarDates = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function BookingDashboardCalendar() {
  return (
    <BookingDashboardPlaceholderCard
      title="Booking Calendar"
      description="High-level schedule overview with expected event dates and availability slots."
      icon={CalendarDays}
      actionLabel="View calendar"
    >
      <div className="grid grid-cols-7 gap-2 text-[10px] font-semibold uppercase text-text-secondary mb-4">
        {calendarDates.map((day) => (
          <div key={day} className="text-center">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 text-[11px]">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className={`h-14 rounded-2xl border border-border/70 bg-bg-elevated/60 ${
              index === 2 ? "bg-primary/10 border-primary/30" : ""
            }`}
          >
            <div className="flex h-full flex-col justify-between p-2 text-[11px] text-text-secondary">
              <span className="font-semibold text-white">{index + 8}</span>
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] text-text-secondary">
                {index === 2 ? "Booked" : "Open"}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-3 text-xs text-text-secondary">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span>Confirmed booking</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span>Available date</span>
        </div>
      </div>
    </BookingDashboardPlaceholderCard>
  );
}
