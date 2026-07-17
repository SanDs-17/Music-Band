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
  MessageSquare,
  TrendingUp,
  Tag,
  MapPin
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
          { name: "Home", href: "/client/dashboard", icon: LayoutDashboard },
          { name: "My Bookings", href: "/client/bookings", icon: Calendar },
          { name: "Favorites", href: "/client/favorites", icon: Heart },
          { name: "Profile Settings", href: "/client/settings", icon: Settings },
        ];
      case "artist":
        return [
          { name: "Home", href: "/artist/dashboard", icon: LayoutDashboard },
          { name: "Public Profile", href: "/artist/profile", icon: User },
          { name: "Incoming Gigs", href: "/artist/bookings", icon: Music },
          { name: "Earnings", href: "/artist/earnings", icon: IndianRupee },
          { name: "Reviews Feedback", href: "/artist/reviews", icon: MessageSquare },
        ];
      case "venue":
        return [
          { name: "Home", href: "/venue/dashboard", icon: LayoutDashboard },
          { name: "My Venue Profile", href: "/venue/profile", icon: Building2 },
          { name: "Booking Calendar", href: "/venue/calendar", icon: Calendar },
          { name: "Booking Requests", href: "/venue/bookings", icon: Music },
          { name: "Client Reviews", href: "/venue/reviews", icon: MessageSquare },
          { name: "Earnings", href: "/venue/earnings", icon: IndianRupee },
          { name: "Analytics", href: "/venue/analytics", icon: TrendingUp },
          { name: "Verification", href: "/venue/verification", icon: ShieldCheck },
        ];
      case "admin":
        return [
          { name: "Home", href: "/admin/dashboard", icon: ShieldCheck },
          { name: "Artist Verification", href: "/admin/artists", icon: Music },
          { name: "Venue Verification", href: "/admin/venues", icon: Building2 },
          { name: "User Accounts", href: "/admin/users", icon: Users },
          { name: "Categories", href: "/admin/categories", icon: Tag },
          { name: "Locations", href: "/admin/locations", icon: MapPin },
          { name: "System Settings", href: "/admin/settings", icon: Settings },
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
                    : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                    isActive ? "text-white" : "text-text-secondary group-hover:text-text-primary"
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
