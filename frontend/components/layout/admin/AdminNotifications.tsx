"use client";

import * as React from "react";
import { Bell, Info, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/utils/cn";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success";
  time: string;
  read: boolean;
}

const mockNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "New Artist Dispute",
    message: "Dispute opened for Booking #1085 by client.",
    type: "warning",
    time: "5 min ago",
    read: false,
  },
  {
    id: "2",
    title: "Payout Completed",
    message: "Escrow funds released to Performer Neon Waves.",
    type: "success",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "3",
    title: "Database Backup Success",
    message: "Daily postgres snapshot completed successfully.",
    type: "info",
    time: "5 hours ago",
    read: true,
  }
];

export function AdminNotifications() {
  const [open, setOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-secondary" />;
      default:
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="relative">
      {/* Bell Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full border border-border/80 text-text-secondary hover:text-white hover:border-primary/50 transition-colors focus:outline-none focus:ring-1 focus:ring-primary/45 cursor-pointer"
        type="button"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-bg-primary" />
        )}
      </button>

      {/* Notifications Drawer Dropdown */}
      {open && (
        <>
          {/* Backdrop for closing */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 rounded-md border border-border bg-bg-elevated text-text-primary shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100 p-1">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
              <span className="text-xs font-bold text-white">System Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] text-primary hover:underline font-semibold cursor-pointer"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto scrollbar-thin">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-xs text-text-muted">No notifications.</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "flex items-start gap-3 p-3 border-b border-border/30 hover:bg-bg-card/40 transition-colors relative",
                      !n.read && "bg-primary/5"
                    )}
                  >
                    <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{n.title}</p>
                      <p className="text-[11px] text-text-secondary mt-0.5 leading-normal">{n.message}</p>
                      <div className="flex items-center gap-1 text-[9px] text-text-muted mt-1.5 font-semibold">
                        <Clock className="h-3 w-3" />
                        <span>{n.time}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
