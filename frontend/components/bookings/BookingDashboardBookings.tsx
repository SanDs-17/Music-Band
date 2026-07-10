"use client";

import { BookingDashboardPlaceholderCard } from "@/components/bookings/BookingDashboardPlaceholderCard";
import { CalendarCheck, Users } from "lucide-react";

interface BookingRow {
  id: string;
  title: string;
  date: string;
  price: string;
  status: string;
}

const upcomingBookings: BookingRow[] = [
  {
    id: "1",
    title: "Summer Festival Performance",
    date: "21 Jul",
    price: "₹45,000",
    status: "Confirmed",
  },
  { id: "2", title: "Corporate Gala Evening", date: "26 Jul", price: "₹62,000", status: "Pending" },
  {
    id: "3",
    title: "Private Wedding Sangeet",
    date: "29 Jul",
    price: "₹98,000",
    status: "Confirmed",
  },
];

const recentBookings: BookingRow[] = [
  { id: "4", title: "City Arts Night", date: "12 Jul", price: "₹28,000", status: "Completed" },
  { id: "5", title: "Brand Launch Event", date: "08 Jul", price: "₹70,000", status: "Cancelled" },
  { id: "6", title: "Club Residency", date: "03 Jul", price: "₹52,000", status: "Completed" },
];

function BookingStatusTag({ status }: { status: string }) {
  const tone =
    status === "Confirmed"
      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
      : status === "Pending"
        ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
        : status === "Cancelled"
          ? "bg-rose-500/10 text-rose-300 border-rose-500/20"
          : "bg-slate-500/10 text-text-secondary border-border/60";

  return (
    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${tone}`}>
      {status}
    </span>
  );
}

export function BookingDashboardBookings() {
  return (
    <div className="space-y-4">
      <BookingDashboardPlaceholderCard
        title="Upcoming Bookings"
        description="At-a-glance look at the next confirmed and pending requests."
        icon={CalendarCheck}
        actionLabel="View all"
      >
        <div className="space-y-3">
          {upcomingBookings.map((booking) => (
            <div
              key={booking.id}
              className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-bg-elevated/60 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-white">{booking.title}</p>
                <p className="text-[11px] text-text-secondary mt-1">{booking.date}</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-black text-white">{booking.price}</span>
                <BookingStatusTag status={booking.status} />
              </div>
            </div>
          ))}
        </div>
      </BookingDashboardPlaceholderCard>

      <BookingDashboardPlaceholderCard
        title="Recent Bookings"
        description="Tracks your latest completed and cancelled booking records."
        icon={Users}
        actionLabel="Review history"
      >
        <div className="grid gap-3">
          {recentBookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-2xl border border-border/70 bg-bg-elevated/60 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-white">{booking.title}</p>
                  <p className="text-[11px] text-text-secondary mt-1">{booking.date}</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-black text-white">{booking.price}</span>
                  <BookingStatusTag status={booking.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </BookingDashboardPlaceholderCard>
    </div>
  );
}
