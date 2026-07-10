"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, PieChart, TrendingUp } from "lucide-react";

interface BookingDashboardChartsProps {
  statusSummary: Array<{ label: string; count: number; tone: string }>;
  monthlySummary: Array<{ label: string; count: number }>;
  revenuePlaceholder: number;
}

export function BookingDashboardCharts({
  statusSummary,
  monthlySummary,
  revenuePlaceholder,
}: BookingDashboardChartsProps) {
  const maxCount = Math.max(...monthlySummary.map((item) => item.count), 1);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <Card className="bg-bg-card/45 backdrop-blur-md border border-border/80 shadow-xl">
        <CardHeader className="border-b border-border/60">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
            <PieChart className="h-4 w-4 text-primary" />
            Booking Status Chart
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {statusSummary.map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">{item.label}</span>
                <span className="font-semibold text-white">{item.count}</span>
              </div>
              <div className="h-2 rounded-full bg-bg-elevated/80 overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.tone.replace("text-", "bg-").split(" ")[0]}`}
                  style={{
                    width: `${Math.max(
                      (item.count /
                        Math.max(
                          statusSummary.reduce((sum, entry) => sum + entry.count, 1),
                          1,
                        )) *
                        100,
                      8,
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-bg-card/45 backdrop-blur-md border border-border/80 shadow-xl">
        <CardHeader className="border-b border-border/60">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
            <BarChart3 className="h-4 w-4 text-primary" />
            Monthly Booking Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-end gap-2 h-48">
            {monthlySummary.map((item) => (
              <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-xl bg-linear-to-t from-primary/70 to-primary/30 border border-primary/20"
                  style={{
                    height: `${(item.count / maxCount) * 100}%`,
                    minHeight: item.count > 0 ? "24px" : "8px",
                  }}
                />
                <span className="text-[11px] text-text-secondary">{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="xl:col-span-2 bg-bg-card/45 backdrop-blur-md border border-border/80 shadow-xl">
        <CardHeader className="border-b border-border/60">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
            <TrendingUp className="h-4 w-4 text-primary" />
            Revenue Placeholder
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="rounded-2xl border border-border/60 bg-bg-elevated/70 p-6 text-center">
            <p className="text-sm text-text-secondary">Projected completed booking value</p>
            <p className="mt-2 text-3xl font-black text-white">
              ₹{revenuePlaceholder.toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
