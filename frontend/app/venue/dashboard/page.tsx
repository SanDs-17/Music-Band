"use client";

import * as React from "react";
import { useVenueDashboard } from "@/hooks/use-venue-dashboard";
import { StatsCards } from "@/components/venue/dashboard/StatsCards";
import { QuickActionsWidget } from "@/components/venue/dashboard/QuickActionsWidget";
import { RevenueChartWidget } from "@/components/venue/dashboard/RevenueChartWidget";
import { CalendarWidget } from "@/components/venue/dashboard/CalendarWidget";
import { RecentActivityWidget } from "@/components/venue/dashboard/RecentActivityWidget";
import { NotificationsWidget } from "@/components/venue/dashboard/NotificationsWidget";
import { PerformanceWidget } from "@/components/venue/dashboard/PerformanceWidget";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { RefreshCw, CircleDot } from "lucide-react";

export default function VenueDashboardPage() {
  const { data, loading, error, refetch } = useVenueDashboard();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner className="h-10 w-10 text-primary" />
        <p className="text-sm text-text-secondary animate-pulse">
          Loading venue operator metrics dashboard...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[65vh] p-4">
        <ErrorState 
          title="Dashboard Load Failure"
          message={error || "An unexpected error occurred while compiling your venue statistics."} 
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Venue Control Console
          </h1>
          <p className="text-xs text-text-secondary">
            Realtime overview of your booking stats, calendars, pricing configurations, and occupancy reports.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refetch}
          className="flex items-center gap-1.5 self-start sm:self-center text-xs h-9"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reload Console</span>
        </Button>
      </div>

      {/* 9 Stats Metrics Cards */}
      <StatsCards stats={data} />

      {/* Grid Layout: Revenue Chart + Profile Completion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChartWidget data={data.revenue_chart} />
        </div>
        <div>
          {/* Custom SVG Profile Completion Card */}
          <div className="bg-bg-card/45 backdrop-blur-md border border-border/80 p-5 rounded-2xl shadow-xl flex flex-col justify-between h-full min-h-[300px]">
            <div className="space-y-2">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                Profile Onboarding Status
              </span>
              <h3 className="text-lg font-extrabold text-text-primary">
                Complete your listings to start booking!
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Add detailed description, landmark addresses, capacity configurations, and documents to get verified.
              </p>
            </div>

            <div className="py-4 flex items-center justify-center relative">
              <svg className="w-28 h-28 transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="45"
                  className="stroke-border/40"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="45"
                  className="stroke-primary transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 45}
                  strokeDashoffset={2 * Math.PI * 45 * (1 - data.profile_completion / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-xl font-extrabold text-text-primary">
                {data.profile_completion}%
              </span>
            </div>

            <div className="text-xs text-text-muted flex items-center gap-1.5 justify-center">
              <CircleDot className="h-3.5 w-3.5 text-primary" />
              <span>Higher score = better rank in search lists.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <QuickActionsWidget />

      {/* Grid Layout: Calendar Widget + Performance Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalendarWidget overview={data.calendar_overview} />
        <PerformanceWidget performance={data.performance} />
      </div>

      {/* Grid Layout: Recent Activity + Notifications Alert log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivityWidget activity={data.recent_activity} />
        <NotificationsWidget notifications={data.notifications} />
      </div>
    </div>
  );
}
