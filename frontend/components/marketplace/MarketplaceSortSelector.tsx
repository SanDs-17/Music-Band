"use client";

import { ArrowUpDown } from "lucide-react";
import { cn } from "@/utils/cn";
import { useMarketplaceStore, type SortByOption } from "@/features/marketplace/stores/useMarketplaceStore";

const SORT_OPTIONS: Array<{ label: string; value: SortByOption; order: "asc" | "desc" }> = [
  { label: "Best Match", value: "best_match", order: "desc" },
  { label: "Highest Rated", value: "rating", order: "desc" },
  { label: "Most Popular", value: "popularity", order: "desc" },
  { label: "Most Booked", value: "booked", order: "desc" },
  { label: "Most Reviewed", value: "reviews", order: "desc" },
  { label: "Newest", value: "created_at", order: "desc" },
  { label: "Oldest", value: "created_at", order: "asc" },
  { label: "Price: Low to High", value: "price", order: "asc" },
  { label: "Price: High to Low", value: "price", order: "desc" },
  { label: "Availability", value: "availability", order: "desc" },
  { label: "Alphabetical", value: "name", order: "asc" },
];

interface MarketplaceSortSelectorProps {
  className?: string;
}

export function MarketplaceSortSelector({ className }: MarketplaceSortSelectorProps) {
  const { sortBy, sortOrder, setSortOption } = useMarketplaceStore();
  const currentKey = `${sortBy}_${sortOrder}`;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const option = SORT_OPTIONS.find((o) => `${o.value}_${o.order}` === e.target.value);
    if (option) {
      setSortOption(option.value, option.order);
    }
  };

  return (
    <div className={cn("relative flex items-center", className)}>
      <ArrowUpDown className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-text-muted" />
      <select
        value={currentKey}
        onChange={handleChange}
        className="h-9 cursor-pointer appearance-none rounded-xl border border-border/70 bg-bg-card pl-9 pr-4 text-xs font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
        aria-label="Sort results"
      >
        {SORT_OPTIONS.map((option) => (
          <option
            key={`${option.value}_${option.order}`}
            value={`${option.value}_${option.order}`}
            className="bg-bg-card text-text-primary"
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
