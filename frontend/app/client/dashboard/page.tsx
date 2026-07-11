"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import {
  CalendarRange,
  Heart,
  Music,
  Clock,
  TrendingUp,
  ArrowRight,
  User,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

/**
 * Client Overview Dashboard — the role's landing page after login.
 *
 * This is a real overview dashboard, not booking management.
 * Booking management lives at /client/bookings (sidebar: My Bookings).
 *
 * Navigation hierarchy:
 *   /client/dashboard  →  Client Overview (this page)
 *   /client/bookings   →  My Bookings / Booking Management
 *   /client/favorites  →  Favorites
 *   /client/settings   →  Profile Settings
 */
export default function ClientDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Welcome back{user?.name ? `, ${user.name}` : ""}!
          </h1>
          <p className="text-xs text-text-secondary">
            Your BandConnect client overview — discover artists, manage your
            event bookings, and track your requests.
          </p>
        </div>
        <Button
          size="sm"
          className="font-bold text-xs h-9 flex items-center gap-1.5 self-start sm:self-center"
          onClick={() => router.push("/client/bookings")}
        >
          <CalendarRange className="h-4 w-4" />
          <span>My Bookings</span>
        </Button>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Active Requests",
            value: "—",
            icon: Clock,
            color: "text-yellow-400",
          },
          {
            label: "Confirmed Events",
            value: "—",
            icon: CalendarRange,
            color: "text-green-400",
          },
          {
            label: "Favourited Artists",
            value: "—",
            icon: Heart,
            color: "text-pink-400",
          },
          {
            label: "Events Completed",
            value: "—",
            icon: TrendingUp,
            color: "text-primary",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="bg-bg-card/45 backdrop-blur-md border border-border/80 rounded-2xl shadow-xl"
            >
              <CardContent className="p-4 flex flex-col gap-2">
                <Icon className={`h-5 w-5 ${stat.color}`} />
                <p className="text-xl font-extrabold text-white">
                  {stat.value}
                </p>
                <p className="text-[11px] text-text-secondary font-medium">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-bg-card/45 backdrop-blur-md border border-border/80 rounded-2xl shadow-xl group hover:border-primary/50 transition-colors">
          <Link href="/client/bookings">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                <CalendarRange className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">My Bookings</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  View and manage your event requests
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-primary transition-colors shrink-0" />
            </CardContent>
          </Link>
        </Card>

        <Card className="bg-bg-card/45 backdrop-blur-md border border-border/80 rounded-2xl shadow-xl group hover:border-primary/50 transition-colors">
          <Link href="/artists">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-secondary/10 rounded-xl group-hover:bg-secondary/20 transition-colors">
                <Music className="h-6 w-6 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">Find Artists</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  Browse performers for your next event
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-secondary transition-colors shrink-0" />
            </CardContent>
          </Link>
        </Card>

        <Card className="bg-bg-card/45 backdrop-blur-md border border-border/80 rounded-2xl shadow-xl group hover:border-primary/50 transition-colors">
          <Link href="/client/favorites">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-pink-500/10 rounded-xl group-hover:bg-pink-500/20 transition-colors">
                <Heart className="h-6 w-6 text-pink-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">Favourites</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  Your saved artists and venues
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-pink-400 transition-colors shrink-0" />
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Account Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-bg-card/45 backdrop-blur-md border border-border/80 rounded-2xl shadow-xl">
          <CardHeader className="border-b border-border/40 pb-3">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-secondary">Name</span>
              <span className="text-white font-semibold">
                {user?.name || "—"}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-secondary">Email</span>
              <span className="text-white font-semibold">
                {user?.email || "—"}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-secondary">Account Type</span>
              <span className="text-white font-semibold capitalize">
                {user?.role || "Client"}
              </span>
            </div>
            <div className="pt-2">
              <Link href="/client/settings">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs w-full font-bold"
                >
                  Edit Profile Settings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-bg-card/45 backdrop-blur-md border border-border/80 rounded-2xl shadow-xl">
          <CardHeader className="border-b border-border/40 pb-3">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {[
              {
                step: "1",
                label: "Browse artists",
                href: "/artists",
                done: false,
              },
              {
                step: "2",
                label: "Create a booking request",
                href: "/client/bookings",
                done: false,
              },
              {
                step: "3",
                label: "Complete your profile",
                href: "/client/settings",
                done: false,
              },
            ].map((item) => (
              <Link
                key={item.step}
                href={item.href}
                className="flex items-center gap-3 text-sm hover:text-white transition-colors group"
              >
                <span className="h-6 w-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                  {item.step}
                </span>
                <span className="text-text-secondary group-hover:text-white transition-colors">
                  {item.label}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-text-muted ml-auto group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
