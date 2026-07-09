"use client";

import Link from "next/link";
import { Music, Menu, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/providers/theme-provider";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass-panel h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-text-secondary hover:text-white"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <Link href="/" className="flex items-center gap-2">
          <div className="p-1.5 bg-primary rounded-lg">
            <Music className="h-5 w-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tighter text-text-primary">
            Band<span className="text-primary">Connect</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/artists" className="text-sm font-medium text-text-secondary hover:text-white transition-colors">
            Find Artists
          </Link>
          <Link href="/venues" className="text-sm font-medium text-text-secondary hover:text-white transition-colors">
            Venues
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="text-text-secondary hover:text-white"
          onClick={toggleTheme}
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {user ? (
          <div className="flex items-center gap-4">
            <Link href={`/${user.role}/dashboard`}>
              <Button variant="outline" size="sm" className="font-bold">
                Dashboard
              </Button>
            </Link>
            <Button size="sm" onClick={logout} className="font-bold">
              Log Out
            </Button>
          </div>
        ) : (
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
        )}
      </div>
    </header>
  );
}
