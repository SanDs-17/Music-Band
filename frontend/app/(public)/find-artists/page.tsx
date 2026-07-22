"use client";

import * as React from "react";
import { MarketplaceHero } from "@/components/marketplace/MarketplaceHero";
import { ArtistFeaturedCarousel } from "@/components/marketplace/ArtistFeaturedCarousel";
import { ArtistFilterSidebar } from "@/components/marketplace/ArtistFilterSidebar";
import { ArtistSortDropdown } from "@/components/marketplace/ArtistSortDropdown";
import { MarketplaceAvailabilityFilter } from "@/components/marketplace/MarketplaceAvailabilityFilter";
import { ArtistDiscoveryGrid } from "@/components/marketplace/ArtistDiscoveryGrid";
import { ArtistDiscoveryList } from "@/components/marketplace/ArtistDiscoveryList";
import { ArtistQuickPreviewModal } from "@/components/marketplace/ArtistQuickPreviewModal";
import { MarketplacePagination } from "@/components/marketplace/MarketplacePagination";
import { MarketplaceLoading } from "@/components/marketplace/MarketplaceLoading";
import { MarketplaceError } from "@/components/marketplace/MarketplaceError";
import { MarketplaceActiveFilters } from "@/components/marketplace/MarketplaceActiveFilters";
import { MarketplaceSearchSummary } from "@/components/marketplace/MarketplaceSearchSummary";
import { MarketplaceFilterChips } from "@/components/marketplace/MarketplaceFilterChips";
import { MarketplaceNoResults } from "@/components/marketplace/MarketplaceNoResults";
import {
  useMarketplaceArtists,
  useMarketplaceCategories,
  useMarketplaceLocations,
  useFeaturedArtists,
  useArtistFilterOptions,
  useURLSync
} from "@/features/marketplace/hooks/useMarketplace";
import { useMarketplaceStore } from "@/features/marketplace/stores/useMarketplaceStore";

function FindArtistsContent() {
  // Sync store filters to and from URL
  useURLSync("artist");

  const {
    searchQuery,
    selectedCategory,
    selectedLocation,
    artistGenreFilter,
    minRatingFilter,
    verifiedOnlyFilter,
    featuredOnlyFilter,
    sortBy,
    sortOrder,
    page,
    viewMode,
    availabilityFilter,
    selectedDate,
    setPage,
    resetFilters
  } = useMarketplaceStore();

  const { categories } = useMarketplaceCategories();
  const { locations } = useMarketplaceLocations();
  const { artists: featuredArtists } = useFeaturedArtists();
  const { options: filterOptions } = useArtistFilterOptions();

  // Combine search bar inputs with sidebar filters
  const activeCategory = selectedCategory || artistGenreFilter;
  const activeLocation = selectedLocation;

  const { data, loading, error, refetch } = useMarketplaceArtists({
    query: searchQuery,
    category: activeCategory,
    location: activeLocation,
    min_rating: minRatingFilter || undefined,
    verified_only: verifiedOnlyFilter,
    featured_only: featuredOnlyFilter,
    page,
    limit: 12,
    sort_by: sortBy,
    sort_order: sortOrder,
    availability_filter: availabilityFilter,
    event_date: selectedDate || undefined,
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen text-text-primary">
      {/* Hero Header Banner */}
      <MarketplaceHero
        title="Find & Hire Professional Music Bands & Solo Performers"
        subtitle="Explore top-rated live bands and solo artists across India. Filter by genre, rating, location, and member type to find the sound for your event."
        categories={categories}
        locations={locations}
        onSearch={refetch}
      />

      {/* Quick filter chips & active filters list */}
      <div className="space-y-4 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <MarketplaceFilterChips pageType="artist" />
        </div>
        <MarketplaceActiveFilters pageType="artist" />
      </div>

      {/* Spotlight Featured Artists Carousel */}
      {featuredArtists.length > 0 && (
        <ArtistFeaturedCarousel artists={featuredArtists} />
      )}

      {/* Main Content Layout with Filter Sidebar */}
      <div className="flex flex-col lg:flex-row gap-8 items-start pt-2">
        {/* Filter Sidebar */}
        <ArtistFilterSidebar options={filterOptions} />

        {/* Discovery Feed Column */}
        <div className="flex-1 w-full space-y-6">
          {/* Controls Bar: Results Count + Sort & View Mode Dropdown */}
          <div className="bg-bg-card border border-border/80 rounded-2xl p-4 flex flex-col gap-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-text-primary tracking-tight">
                  Live Artist Discovery Feed
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Browse or search verified performers
                </p>
              </div>

              <ArtistSortDropdown />
            </div>

            <MarketplaceAvailabilityFilter />

            {data && (
              <MarketplaceSearchSummary total={data.pagination.total} entityType="artists" />
            )}
          </div>

          {/* Discovery Grid or List */}
          {loading ? (
            <MarketplaceLoading message="Loading artist discovery profiles..." count={6} />
          ) : error ? (
            <MarketplaceError error={error} onRetry={refetch} />
          ) : !data || data.items.length === 0 ? (
            <MarketplaceNoResults onReset={resetFilters} />
          ) : (
            <div className="space-y-8">
              {viewMode === "grid" ? (
                <ArtistDiscoveryGrid artists={data.items} />
              ) : (
                <ArtistDiscoveryList artists={data.items} />
              )}

              <MarketplacePagination
                page={data.pagination.page}
                pages={data.pagination.pages}
                total={data.pagination.total}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* Quick Inspection Modal */}
      <ArtistQuickPreviewModal />
    </div>
  );
}

export default function FindArtistsPage() {
  return (
    <React.Suspense fallback={<MarketplaceLoading message="Loading performers discovery..." count={6} />}>
      <FindArtistsContent />
    </React.Suspense>
  );
}
