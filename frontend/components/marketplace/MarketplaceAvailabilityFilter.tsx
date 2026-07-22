"use client";

import { cn } from "@/utils/cn";
import { useMarketplaceStore } from "@/features/marketplace/stores/useMarketplaceStore";

const AVAILABILITY_OPTIONS = [
  { label: "All", value: "all" as const },
  { label: "Available Today", value: "today" as const },
  { label: "Available Tomorrow", value: "tomorrow" as const },
  { label: "This Week", value: "this_week" as const },
  { label: "Custom Date", value: "custom" as const },
];

interface MarketplaceAvailabilityFilterProps {
  className?: string;
}

export function MarketplaceAvailabilityFilter({ className }: MarketplaceAvailabilityFilterProps) {
  const { availabilityFilter, selectedDate, setAvailabilityFilter, setSelectedDate } =
    useMarketplaceStore();

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2">
        {AVAILABILITY_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setAvailabilityFilter(option.value)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              availabilityFilter === option.value
                ? "border-primary bg-primary/15 text-primary"
                : "border-border/70 bg-bg-card text-text-muted hover:text-text-primary"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {availabilityFilter === "custom" && (
        <input
          type="date"
          value={selectedDate || ""}
          onChange={(e) => setSelectedDate(e.target.value || null)}
          className="h-9 rounded-xl border border-border/70 bg-bg-card px-3 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          aria-label="Select custom availability date"
        />
      )}
    </div>
  );
}
