"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { BrandLogo } from "@/components/shared/BrandLogo";
import {
  Home,
  Calendar,
  User,
  Heart,
  Music as MusicIcon,
  IndianRupee,
  Building2,
  Users,
  Settings,
  ShieldCheck,
  MessageSquare,
  Tag,
  Inbox,
  BarChart2,
} from "lucide-react";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: "client" | "artist" | "venue" | "admin";
}

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isGroup?: boolean;
}

export function MobileNav({ open, onOpenChange, role }: MobileNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams?.get("tab");

  const [isBookingsExpanded, setIsBookingsExpanded] = React.useState(false);

  const isBookingsActive =
    pathname === "/artist/bookings" ||
    pathname === "/artist/bookings/history" ||
    pathname === "/artist/bookings/calendar" ||
    pathname === "/artist/calendar" ||
    pathname.startsWith("/artist/bookings/");

  React.useEffect(() => {
    if (isBookingsActive) {
      setIsBookingsExpanded(true);
    }
  }, [pathname, isBookingsActive]);

  const getMenuItems = (): MenuItem[] => {
    switch (role) {
      case "client":
        return [
          { name: "Home",       href: "/client/dashboard",  icon: Home },
          { name: "Profile",    href: "/client/profile",    icon: User },
          { name: "Bookings",   href: "/client/bookings",   icon: Calendar },
          { name: "Favorites",  href: "/client/favorites",  icon: Heart },
          { name: "Payments",   href: "/client/payments",   icon: IndianRupee },
          { name: "Settings",   href: "/client/settings",   icon: Settings },
        ];

      case "artist":
        return [
          { name: "Home",       href: "/artist/dashboard",  icon: Home },
          { name: "Profile",    href: "/artist/profile",    icon: User },
          { name: "Bookings",   href: "/artist/bookings",   icon: Calendar, isGroup: true },
          { name: "Pricing",    href: "/artist/profile?tab=pricing", icon: Tag },
          { name: "Reviews",    href: "/artist/reviews",    icon: MessageSquare },
          { name: "Inbox",      href: "/artist/inbox",      icon: Inbox },
          { name: "Payments",   href: "/artist/earnings",   icon: IndianRupee },
          { name: "Settings",   href: "/artist/settings",   icon: Settings },
        ];

      case "venue":
        return [
          { name: "Home",       href: "/venue/dashboard",   icon: Home },
          { name: "Profile",    href: "/venue/profile",     icon: Building2 },
          { name: "Bookings",   href: "/venue/bookings",    icon: Calendar },
          { name: "Payments",   href: "/venue/earnings",    icon: IndianRupee },
          { name: "Reviews",    href: "/venue/reviews",     icon: MessageSquare },
          { name: "Settings",   href: "/venue/settings",    icon: Settings },
        ];

      case "admin":
        return [
          { name: "Home",       href: "/admin/dashboard",   icon: ShieldCheck },
          { name: "Users",      href: "/admin/users",       icon: Users },
          { name: "Artists",    href: "/admin/artists",     icon: MusicIcon },
          { name: "Venues",     href: "/admin/venues",      icon: Building2 },
          { name: "Bookings",   href: "/admin/bookings",    icon: Calendar },
          { name: "Payments",   href: "/admin/payments",    icon: IndianRupee },
          { name: "Reports",    href: "/admin/reports",     icon: BarChart2 },
          { name: "Settings",   href: "/admin/settings",    icon: Settings },
        ];

      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const bookingsChildren = [
    { name: "Booking Requests", href: "/artist/bookings" },
    { name: "Booking History", href: "/artist/bookings/history" },
    { name: "Calendar", href: "/artist/calendar" },
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      {/* Drawer */}
      <div className="fixed bottom-0 left-0 top-0 z-50 w-72 bg-bg-card p-6 border-r border-border flex flex-col gap-4 animate-in slide-in-from-left duration-250">
        <div className="flex items-center justify-between">
          <BrandLogo onClick={() => onOpenChange(false)} iconSize="sm" textSize="lg" />
          <Button
            variant="ghost"
            size="icon"
            className="text-text-secondary hover:text-text-primary"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 space-y-1 mt-6 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;

            if (item.isGroup && role === "artist") {
              return (
                <div key={item.name} className="space-y-1">
                  <button
                    onClick={() => setIsBookingsExpanded(!isBookingsExpanded)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all group cursor-pointer",
                      isBookingsActive
                        ? "bg-primary text-white font-semibold"
                        : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                          isBookingsActive ? "text-white" : "text-text-secondary group-hover:text-text-primary"
                        )}
                      />
                      <span>{item.name}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-200",
                        isBookingsExpanded ? "rotate-180" : "",
                        isBookingsActive ? "text-white" : "text-text-secondary group-hover:text-text-primary"
                      )}
                    />
                  </button>

                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-in-out pl-9 space-y-1",
                      isBookingsExpanded ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"
                    )}
                  >
                    {bookingsChildren.map((child) => {
                      const isChildActive =
                        child.name === "Booking Requests"
                          ? pathname === "/artist/bookings" && (tab === "inbox" || !tab)
                          : child.name === "Booking History"
                          ? pathname === "/artist/bookings/history" || (pathname === "/artist/bookings" && tab === "history")
                          : child.name === "Calendar"
                          ? pathname === "/artist/calendar" || pathname === "/artist/bookings/calendar" || (pathname === "/artist/bookings" && tab === "calendar")
                          : pathname === child.href;

                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          onClick={() => onOpenChange(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all group/child",
                            isChildActive
                              ? "text-primary font-semibold"
                              : "text-text-secondary hover:text-text-primary"
                          )}
                        >
                          <span className="transition-transform group-hover/child:translate-x-1">{child.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }

            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
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
