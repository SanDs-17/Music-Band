"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/providers/theme-provider";
import { useDeveloperPreview } from "@/providers/developer-preview-provider";
import { getRoleDashboard } from "@/utils/role-routes";
import { BrandLogo } from "@/components/shared/BrandLogo";
import * as React from "react";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isPreviewMode, previewRole, isHydrated: previewHydrated, exitPreview } = useDeveloperPreview();
  const pathname = usePathname();

  // Component mount state to prevent Next.js hydration mismatches
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isPortalRoute =
    pathname.startsWith("/client") ||
    pathname.startsWith("/artist") ||
    pathname.startsWith("/venue") ||
    pathname.startsWith("/admin");

  const effectiveRole = isPreviewMode ? previewRole : user?.role;

  const handleExitPreview = () => {
    exitPreview();
    window.location.href = "/developer";
  };

  const renderNavButtons = () => {
    // During SSR or initial hydration on the client, render a stable matching space
    if (!mounted || authLoading || !previewHydrated) {
      return <div className="h-9 w-20" />;
    }

    if (isPreviewMode) {
      return (
        <Button
          size="sm"
          onClick={handleExitPreview}
          className="font-bold bg-amber-500 hover:bg-amber-600 text-black border-amber-600 h-9"
        >
          Exit Preview
        </Button>
      );
    }

    if (user && effectiveRole) {
      return (
        <div className="flex items-center gap-4">
          {!isPortalRoute && (
            <Link href={getRoleDashboard(effectiveRole)}>
              <Button variant="outline" size="sm" className="font-bold">
                Dashboard
              </Button>
            </Link>
          )}
          <Button size="sm" onClick={logout} className="font-bold">
            Log Out
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button variant="ghost" size="sm" className="font-semibold">
            Login
          </Button>
        </Link>
        <Link href="/register">
          <Button size="sm" className="font-bold">
            Get Started
          </Button>
        </Link>
      </div>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass-panel h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-text-secondary hover:text-text-primary"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <BrandLogo />
        {mounted && isPreviewMode && previewRole && (
          <div className="px-2.5 py-1 text-[9px] font-black tracking-wider uppercase bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-full select-none whitespace-nowrap">
            Preview &mdash; {previewRole === "venue_owner" ? "Venue Owner" : previewRole === "artist" ? "Artist / Band" : previewRole === "admin" ? "Admin" : "Client"}
          </div>
        )}

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/artists" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
            Find Artists
          </Link>
          <Link href="/venues" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
            Venues
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="text-text-secondary hover:text-text-primary"
          onClick={toggleTheme}
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {renderNavButtons()}
      </div>
    </header>
  );
}
