

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Calendar,
  IndianRupee,
  Terminal,
  ChevronDown,
  ChevronRight,
  UserCheck,
  Briefcase,
  AlertTriangle,
  History,
  Activity,
  Cpu,
  FileText
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useUIStore } from "@/store/ui-store";

interface SubMenuItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface MenuItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  submenu?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  {
    name: "Users Management",
    icon: Users,
    submenu: [
      { name: "All Accounts", href: "/admin/users", icon: Users },
      { name: "Artist Profiles", href: "/admin/users/artists", icon: UserCheck },
      { name: "Client Details", href: "/admin/users/clients", icon: UserCheck }
    ]
  },
  {
    name: "Bookings",
    icon: Calendar,
    submenu: [
      { name: "Active Gigs", href: "/admin/bookings", icon: Briefcase },
      { name: "Disputes / Escrow", href: "/admin/bookings/disputes", icon: AlertTriangle },
      { name: "Completed Gigs", href: "/admin/bookings/history", icon: History }
    ]
  },
  {
    name: "Financials",
    icon: IndianRupee,
    submenu: [
      { name: "Escrow Ledger", href: "/admin/financials/ledger", icon: IndianRupee },
      { name: "Commissions Fee", href: "/admin/financials/commissions", icon: IndianRupee },
      { name: "Artist Payouts", href: "/admin/financials/payouts", icon: IndianRupee }
    ]
  },
  {
    name: "System Monitoring",
    icon: Terminal,
    submenu: [
      { name: "Service Health", href: "/admin/system/health", icon: Activity },
      { name: "Task Queues", href: "/admin/system/tasks", icon: Cpu },
      { name: "Server Logs", href: "/admin/system/logs", icon: FileText }
    ]
  }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({
    "Users Management": true, // Default open for demonstration
  });

  const toggleSubmenu = (name: string) => {
    setExpandedItems((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar navigation body */}
      <aside
        className={cn(
          "fixed bottom-0 top-16 z-40 flex w-64 flex-col border-r border-border bg-bg-card transition-all duration-300 md:left-0",
          sidebarOpen ? "left-0" : "-left-64"
        )}
      >
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 scrollbar-thin">
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const hasSubmenu = !!item.submenu;
              const isExpanded = expandedItems[item.name];

              return (
                <div key={item.name} className="space-y-1">
                  {hasSubmenu ? (
                    <button
                      onClick={() => toggleSubmenu(item.name)}
                      type="button"
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-text-secondary hover:bg-bg-elevated hover:text-white transition-all group text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-text-secondary group-hover:text-white transition-transform group-hover:scale-110" />
                        <span>{item.name}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-text-muted" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-text-muted" />
                      )}
                    </button>
                  ) : (
                    <Link
                      href={item.href || "#"}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all group",
                        pathname === item.href
                          ? "bg-primary text-white"
                          : "text-text-secondary hover:bg-bg-elevated hover:text-white"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  )}

                  {/* Render nested submenus */}
                  {hasSubmenu && isExpanded && (
                    <div className="pl-6 space-y-1 border-l border-border/40 ml-5 animate-in slide-in-from-top-1 duration-100">
                      {item.submenu?.map((sub) => {
                        const SubIcon = sub.icon || ChevronRight;
                        const isSubActive = pathname === sub.href;

                        return (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            onClick={() => setSidebarOpen(false)}
                            className={cn(
                              "flex items-center gap-3 rounded-md px-3 py-2 text-xs font-semibold transition-all group",
                              isSubActive
                                ? "text-primary bg-primary/5"
                                : "text-text-secondary hover:text-white hover:bg-bg-elevated/40"
                            )}
                          >
                            <SubIcon className={cn("h-3.5 w-3.5", isSubActive ? "text-primary" : "text-text-muted group-hover:text-white")} />
                            <span>{sub.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
