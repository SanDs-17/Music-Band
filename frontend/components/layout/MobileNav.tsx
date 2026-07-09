"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import {
  LayoutDashboard,
  Calendar,
  User,
  Heart,
  Music as MusicIcon,
  IndianRupee,
  Building2,
  Users,
  Settings,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
  TrendingUp
} from "lucide-react";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: "client" | "artist" | "venue" | "admin";
}

export function MobileNav({ open, onOpenChange, role }: MobileNavProps) {
  const pathname = usePathname();

  const getMenuItems = () => {
    switch (role) {
      case "client":
        return [
          { name: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
          { name: "My Bookings", href: "/client/bookings", icon: Calendar },
          { name: "Favorites", href: "/client/favorites", icon: Heart },
          { name: "Settings", href: "/client/settings", icon: Settings },
        ];
      case "artist":
        return [
          { name: "Dashboard", href: "/artist/dashboard", icon: LayoutDashboard },
          { name: "Public Profile", href: "/artist/profile", icon: User },
          { name: "Incoming Gigs", href: "/artist/bookings", icon: MusicIcon },
          { name: "Earnings", href: "/artist/earnings", icon: IndianRupee },
          { name: "Reviews Feedback", href: "/artist/reviews", icon: MessageSquare },
        ];
      case "venue":
        return [
          { name: "Dashboard", href: "/venue/dashboard", icon: LayoutDashboard },
          { name: "My Venues", href: "/venue/venues", icon: Building2 },
          { name: "Venue Calendar", href: "/venue/bookings", icon: Calendar },
          { name: "Client Reviews", href: "/venue/reviews", icon: MessageSquare },
          { name: "Earnings", href: "/venue/earnings", icon: IndianRupee },
          { name: "Analytics", href: "/venue/analytics", icon: TrendingUp },
          { name: "Verification", href: "/venue/verification", icon: ShieldCheck },
        ];
      case "admin":
        return [
          { name: "Dashboard", href: "/admin/dashboard", icon: ShieldCheck },
          { name: "User Accounts", href: "/admin/users", icon: Users },
          { name: "All Bookings", href: "/admin/bookings", icon: Calendar },
          { name: "Payments / Escrow", href: "/admin/payments", icon: IndianRupee },
          { name: "Support Tickets", href: "/admin/support", icon: AlertCircle },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      {/* Drawer */}
      <div className="fixed bottom-0 left-0 top-0 z-50 w-72 bg-bg-card p-6 border-r border-border flex flex-col gap-4 animate-in slide-in-from-left duration-250">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" onClick={() => onOpenChange(false)}>
            <div className="p-1.5 bg-primary rounded-lg">
              <Music className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tighter text-white">
              Band<span className="text-primary">Connect</span>
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-text-secondary hover:text-white"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 space-y-1 mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group",
                  isActive
                    ? "bg-primary text-white font-semibold"
                    : "text-text-secondary hover:bg-bg-elevated hover:text-white"
                )}
                onClick={() => onOpenChange(false)}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
