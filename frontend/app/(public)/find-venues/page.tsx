"use client";

import * as React from "react";
import { MarketplaceHero } from "@/components/marketplace/MarketplaceHero";
import { VenueFilterSidebar } from "@/components/marketplace/VenueFilterSidebar";
import { VenueSortDropdown } from "@/components/marketplace/VenueSortDropdown";
import { MarketplaceAvailabilityFilter } from "@/components/marketplace/MarketplaceAvailabilityFilter";
import { VenueDiscoveryGrid } from "@/components/marketplace/VenueDiscoveryGrid";
import { VenueDiscoveryList } from "@/components/marketplace/VenueDiscoveryList";
import { VenueFeaturedCarousel } from "@/components/marketplace/VenueFeaturedCarousel";
import { VenueQuickPreviewModal } from "@/components/marketplace/VenueQuickPreviewModal";
import { MarketplacePagination } from "@/components/marketplace/MarketplacePagination";
import { MarketplaceLoading } from "@/components/marketplace/MarketplaceLoading";
import { MarketplaceError } from "@/components/marketplace/MarketplaceError";
import { MarketplaceActiveFilters } from "@/components/marketplace/MarketplaceActiveFilters";
import { MarketplaceSearchSummary } from "@/components/marketplace/MarketplaceSearchSummary";
import { MarketplaceFilterChips } from "@/components/marketplace/MarketplaceFilterChips";
import { MarketplaceNoResults } from "@/components/marketplace/MarketplaceNoResults";
import {
  useMarketplaceVenues,
  useMarketplaceCategories,
  useMarketplaceLocations,
  useURLSync
} from "@/features/marketplace/hooks/useMarketplace";
import { useMarketplaceStore } from "@/features/marketplace/stores/useMarketplaceStore";

function FindVenuesContent() {
  // Sync store filters to and from URL
  useURLSync("venue");

  const store = useMarketplaceStore();

  const searchQuery = store.searchQuery;
  const selectedCategory = store.selectedCategory;
  const selectedLocation = store.selectedLocation;
  const sortBy = store.sortBy;
  const sortOrder = store.sortOrder;
  const page = store.page;
  const setPage = store.setPage;
  const resetFilters = store.resetFilters;

  // Additional Filter Facets
  const venueTypeFilter = store.venueTypeFilter;
  const venueCityFilter = store.venueCityFilter;
  const venueStateFilter = store.venueStateFilter;
  const minCapacityFilter = store.minCapacityFilter;
  const venueVerifiedOnlyFilter = store.venueVerifiedOnlyFilter;
  const venueFeaturedOnlyFilter = store.venueFeaturedOnlyFilter;
  const venueViewMode = store.venueViewMode;
  const availabilityFilter = store.availabilityFilter;
  const selectedDate = store.selectedDate;

  const { categories } = useMarketplaceCategories();
  const { locations } = useMarketplaceLocations();

  const { data, loading, error, refetch } = useMarketplaceVenues({
    query: searchQuery,
    category: selectedCategory || venueTypeFilter,
    location: selectedLocation || venueCityFilter || venueStateFilter,
    venue_type: venueTypeFilter,
    city: venueCityFilter,
    state: venueStateFilter,
    min_capacity: minCapacityFilter || undefined,
    verified_only: venueVerifiedOnlyFilter,
    featured_only: venueFeaturedOnlyFilter,
    page,
    limit: 12,
    sort_by: sortBy,
    sort_order: sortOrder,
    availability_filter: availabilityFilter,
    event_date: selectedDate || undefined,
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen text-text-primary">
      {/* Hero Banner */}
      <MarketplaceHero
        title="Find & Reserve Premier Event Spaces & Venues"
        subtitle="Explore verified halls, resorts, open-air lawns, and concert venues across India for your next live event."
        categories={categories}
        locations={locations}
        onSearch={refetch}
      />

      {/* Quick filter chips & active filters list */}
      <div className="space-y-4 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <MarketplaceFilterChips pageType="venue" />
        </div>
        <MarketplaceActiveFilters pageType="venue" />
      </div>

      {/* Featured Spaces Carousel */}
      <VenueFeaturedCarousel />

      {/* Main Grid: Sidebar + Listings Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filter Sidebar Column */}
        <aside className="lg:col-span-1">
          <VenueFilterSidebar />
        </aside>

        {/* Listings Feed Column */}
        <main className="lg:col-span-3 space-y-6">
          <div className="bg-bg-card border border-border/80 rounded-2xl p-4 flex flex-col gap-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-text-primary tracking-tight">
                  Venue Discovery Feed
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Browse or search verified event spaces
                </p>
              </div>
              <VenueSortDropdown />
            </div>

            <MarketplaceAvailabilityFilter />

            {data && (
              <MarketplaceSearchSummary total={data.pagination.total} entityType="venues" />
            )}
          </div>

          {loading ? (
            <MarketplaceLoading message="Loading venue discovery feed..." count={6} />
          ) : error ? (
            <MarketplaceError error={error} onRetry={refetch} />
          ) : !data || data.items.length === 0 ? (
            <MarketplaceNoResults onReset={resetFilters} />
          ) : (
            <div className="space-y-8">
              {venueViewMode === "list" ? (
                <VenueDiscoveryList venues={data.items} />
              ) : (
                <VenueDiscoveryGrid venues={data.items} />
              )}

              <MarketplacePagination
                page={data.pagination.page}
                pages={data.pagination.pages}
                total={data.pagination.total}
                onPageChange={setPage}
              />
            </div>
          )}
        </main>
      </div>

      {/* Venue Quick Inspection Modal */}
      <VenueQuickPreviewModal />
    </div>
  );
}

export default function FindVenuesPage() {
  return (
    <React.Suspense fallback={<MarketplaceLoading message="Loading venues discovery..." count={6} />}>
      <FindVenuesContent />
    </React.Suspense>
  );
}
