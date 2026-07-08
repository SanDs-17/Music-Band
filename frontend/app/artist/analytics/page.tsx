"use client";

import * as React from "react";
import { useArtistAnalytics } from "@/hooks/use-artist-analytics";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { 
  TrendingUp, 
  BarChart3, 
  Eye, 
  Target, 
  MapPin, 
  Music, 
  Clock, 
  RefreshCw,
  Award,
  Users
} from "lucide-react";

export default function ArtistAnalyticsPage() {
  const { data, loading, error, refetch } = useArtistAnalytics();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner className="h-10 w-10 text-primary" />
        <p className="text-sm text-text-secondary animate-pulse">
          Compiling business analytics and trends...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[65vh] p-4">
        <ErrorState 
          title="Analytics Compilation Failure"
          message={error || "An unexpected error occurred while compiling your performance analytics."} 
          onRetry={refetch}
        />
      </div>
    );
  }

  // Calculate maximum event and city values to calibrate progress bars
  const maxEventVal = Math.max(...data.popular_event_types.map(e => e.value), 1);
  const maxCityVal = Math.max(...data.top_cities.map(c => c.value), 1);
  const maxPeakCount = Math.max(...data.peak_booking_times.map(t => t.count), 1);

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Business Insights & Analytics
          </h1>
          <p className="text-xs text-text-secondary">
            Deep dive overview of your booking conversion metrics, slot peaks, and ratings growth patterns.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refetch}
          className="flex items-center gap-1.5 self-start sm:self-center text-xs h-9"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reload Insights</span>
        </Button>
      </div>

      {/* Analytics Cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Booking Growth */}
        <Card className="bg-bg-card/45 backdrop-blur-md border border-border/80 p-5 rounded-2xl shadow-xl flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Booking Growth</span>
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-black text-white block">
              +{data.booking_growth}%
            </span>
            <span className="text-[10px] text-emerald-400 block">Growth vs last calendar month</span>
          </div>
        </Card>

        {/* Revenue Growth */}
        <Card className="bg-bg-card/45 backdrop-blur-md border border-border/80 p-5 rounded-2xl shadow-xl flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Revenue Growth</span>
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-black text-white block">
              +{data.revenue_growth}%
            </span>
            <span className="text-[10px] text-emerald-400 block">Surcharge gains active</span>
          </div>
        </Card>

        {/* Conversion Rate */}
        <Card className="bg-bg-card/45 backdrop-blur-md border border-border/80 p-5 rounded-2xl shadow-xl flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Booking Conversion</span>
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-black text-white block">
              {data.booking_conversion}%
            </span>
            <span className="text-[10px] text-text-muted block">Bookings / Profile views ratio</span>
          </div>
        </Card>

        {/* Profile Views */}
        <Card className="bg-bg-card/45 backdrop-blur-md border border-border/80 p-5 rounded-2xl shadow-xl flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Profile Views</span>
            <Eye className="h-5 w-5 text-blue-400" />
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-black text-white block">
              {data.profile_views}
            </span>
            <span className="text-[10px] text-text-muted block">Total unique listings hits</span>
          </div>
        </Card>
      </div>

      {/* Grid workspace: Events and Cities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Popular event types */}
        <Card className="bg-bg-card/45 backdrop-blur-md border border-border/80 p-5 rounded-2xl shadow-xl">
          <CardHeader className="p-0 pb-4 border-b border-border/40 mb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Music className="h-4.5 w-4.5 text-primary" />
              Popular Event Types
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            {data.popular_event_types.map(item => {
              const percent = (item.value / maxEventVal) * 100;
              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white">{item.name}</span>
                    <span className="text-text-secondary">{item.value} gigs</span>
                  </div>
                  <div className="h-2 rounded-full bg-border/40 overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-1000" 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Top Cities */}
        <Card className="bg-bg-card/45 backdrop-blur-md border border-border/80 p-5 rounded-2xl shadow-xl">
          <CardHeader className="p-0 pb-4 border-b border-border/40 mb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <MapPin className="h-4.5 w-4.5 text-primary" />
              Top Booking Cities
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            {data.top_cities.map(item => {
              const percent = (item.value / maxCityVal) * 100;
              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white">{item.name}</span>
                    <span className="text-text-secondary">{item.value} gigs</span>
                  </div>
                  <div className="h-2 rounded-full bg-border/40 overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-1000" 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

      </div>

      {/* Grid: Peak booking times & Rating trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Peak booking times */}
        <Card className="bg-bg-card/45 backdrop-blur-md border border-border/80 p-5 rounded-2xl shadow-xl">
          <CardHeader className="p-0 pb-4 border-b border-border/40 mb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-primary" />
              Peak Booking Times
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            {data.peak_booking_times.map(t => {
              const percent = (t.count / maxPeakCount) * 100;
              return (
                <div key={t.time_slot} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white">{t.time_slot}</span>
                    <span className="text-text-secondary">{t.count} gigs</span>
                  </div>
                  <div className="h-2 rounded-full bg-border/40 overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-1000" 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Rating trends */}
        <Card className="bg-bg-card/45 backdrop-blur-md border border-border/80 p-5 rounded-2xl shadow-xl">
          <CardHeader className="p-0 pb-4 border-b border-border/40 mb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Award className="h-4.5 w-4.5 text-primary" />
              Average Rating Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-4 flex flex-col justify-between h-48">
            <div className="flex-1 w-full flex items-end justify-between px-2 gap-2 relative">
              {data.rating_trends.map((pt, i) => {
                // rating is out of 5
                const percent = (pt.rating / 5) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative">
                    <span className="opacity-0 group-hover:opacity-100 absolute -top-5 text-[8px] bg-bg-elevated border border-border px-1 py-0.5 rounded text-white font-black z-20 transition-opacity">
                      {pt.rating.toFixed(1)} ★
                    </span>
                    <div 
                      style={{ height: `${percent}%` }}
                      className="w-full bg-gradient-to-t from-primary/30 to-primary rounded-t-md transition-all duration-1000"
                    />
                    <span className="text-[8px] font-bold text-text-muted mt-2 block uppercase">{pt.date.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Client Demographics placeholder */}
        <Card className="bg-bg-card/45 backdrop-blur-md border border-border/80 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <CardHeader className="p-0 pb-4 border-b border-border/40">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-primary" />
              Client Demographics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-4 flex flex-col items-center justify-center text-center flex-1 space-y-2">
            <Users className="h-10 w-10 text-text-muted animate-pulse" />
            <h4 className="text-xs font-bold text-white">Target segment analytics</h4>
            <p className="text-[10px] text-text-secondary leading-relaxed max-w-[200px]">
              Demographics segmentation tracking will be enabled once your profile crosses 50 verified event bookings.
            </p>
          </CardContent>
        </Card>

      </div>

    </div>
  );
}
