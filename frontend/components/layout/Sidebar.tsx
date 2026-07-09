"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  User,
  Heart,
  Music,
  IndianRupee,
  Building2,
  Users,
  Settings,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
  TrendingUp
} from "lucide-react";
import { cn } from "@/utils/cn";

interface SidebarProps {
  role: "client" | "artist" | "venue" | "admin";
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const getMenuItems = () => {
    switch (role) {
      case "client":
        return [
          { name: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
          { name: "My Bookings", href: "/client/bookings", icon: Calendar },
          { name: "Favorites", href: "/client/favorites", icon: Heart },
          { name: "Profile Settings", href: "/client/settings", icon: Settings },
        ];
      case "artist":
        return [
          { name: "Dashboard", href: "/artist/dashboard", icon: LayoutDashboard },
          { name: "Public Profile", href: "/artist/profile", icon: User },
          { name: "Incoming Gigs", href: "/artist/bookings", icon: Music },
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

  return (
    <aside className="fixed bottom-0 left-0 top-16 z-30 hidden w-64 border-r border-border bg-bg-card md:block">
      <div className="flex h-full flex-col gap-4 p-4">
        <div className="flex-1 space-y-1">
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
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                    isActive ? "text-white" : "text-text-secondary group-hover:text-white"
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
