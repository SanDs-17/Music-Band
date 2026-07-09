"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Sun, Moon, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/store/ui-store";
import { useTheme } from "@/providers/theme-provider";
import { AdminBreadcrumb } from "@/components/layout/admin/AdminBreadcrumb";
import { AdminProfileMenu } from "@/components/layout/admin/AdminProfileMenu";
import { AdminNotifications } from "@/components/layout/admin/AdminNotifications";

export function AdminHeader() {
  const { toggleSidebar } = useUIStore();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-30 glass-panel h-16 flex items-center justify-between px-6">
      {/* Brand logo & Hamburger sidebar trigger */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-text-secondary hover:text-white"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Link href="/admin/dashboard" className="hidden sm:flex items-center gap-2">
          <span className="font-extrabold text-lg tracking-tighter text-text-primary">
            Band<span className="text-primary">Connect</span>
            <span className="ml-1 text-[10px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded-full font-bold">
              Admin
            </span>
          </span>
        </Link>
        <div className="hidden lg:block border-l border-border/60 pl-4">
          <AdminBreadcrumb />
        </div>
      </div>

      {/* Quick Admin Actions & Profile control items */}
      <div className="flex items-center gap-4">
        {/* Search placeholder */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
          <Input
            type="text"
            placeholder="Search system logs, users..."
            className="pl-8 h-8 text-xs bg-bg-card border-border/80 text-text-primary"
          />
        </div>

        {/* Theme Toggling */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-text-secondary hover:text-white"
          onClick={toggleTheme}
        >
          {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </Button>

        {/* Notifications Tray */}
        <AdminNotifications />

        {/* Profile Dropdown actions */}
        <AdminProfileMenu />
      </div>
    </header>
  );
}
