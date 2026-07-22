"use client";

import * as React from "react";
import { Search, MapPin, SlidersHorizontal, RotateCcw, X, History, Sparkles, Building, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryBrief, LocationGroup, SearchSuggestion } from "@/features/marketplace/types";
import { useMarketplaceStore } from "@/features/marketplace/stores/useMarketplaceStore";
import { useSearchSuggestions } from "@/features/marketplace/hooks/useMarketplace";
import { MarketplaceSearchSuggestions } from "./MarketplaceSearchSuggestions";
import { MarketplaceSearchSkeleton } from "./MarketplaceSearchSkeleton";
import { MarketplaceRecentSearches } from "./MarketplaceRecentSearches";
import { MarketplacePopularSearches } from "./MarketplacePopularSearches";
import { cn } from "@/utils/cn";

export interface MarketplaceSearchBarProps {
  categories?: CategoryBrief[];
  locations?: LocationGroup | null;
  onSearch?: () => void;
  className?: string;
}

export function MarketplaceSearchBar({
  categories = [],
  locations,
  onSearch,
  className
}: MarketplaceSearchBarProps) {
  const {
    searchQuery,
    selectedCategory,
    selectedLocation,
    recentLocations,
    setSearchQuery,
    setSelectedCategory,
    setSelectedLocation,
    resetFilters,
    addRecentSearch
  } = useMarketplaceStore();

  const [locationMenuOpen, setLocationMenuOpen] = React.useState(false);
  const [locationSearch, setLocationSearch] = React.useState("");
  const locationMenuRef = React.useRef<HTMLDivElement>(null);

  // Suggestions states
  const [suggestionsOpen, setSuggestionsOpen] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  const { suggestions, loading: suggestionsLoading } = useSearchSuggestions(searchQuery);

  // Close dropdowns on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (locationMenuRef.current && !locationMenuRef.current.contains(event.target as Node)) {
        setLocationMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSuggestionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const popularCities = locations?.popular_cities || ["Mumbai", "Delhi NCR", "Bengaluru", "Chennai", "Hyderabad", "Kolkata", "Pune", "Goa"];
  const states = locations?.states || [];
  const unionTerritories = locations?.union_territories || [];

  const filterText = locationSearch.trim().toLowerCase();

  const filteredPopular = popularCities.filter((c) => c.toLowerCase().includes(filterText));
  const filteredStates = states.filter((s) => s.toLowerCase().includes(filterText));
  const filteredUTs = unionTerritories.filter((u) => u.toLowerCase().includes(filterText));

  const handleSelectLocation = (loc: string) => {
    setSelectedLocation(loc);
    setLocationMenuOpen(false);
    setLocationSearch("");
    onSearch?.();
  };

  const handleClearLocation = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLocation("");
  };

  const triggerSearch = () => {
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery.trim());
    }
    setSuggestionsOpen(false);
    onSearch?.();
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.value);
    addRecentSearch(suggestion.value);
    setSuggestionsOpen(false);
    if (suggestion.type === "genre") {
      // Auto-set the category/genre filters as appropriate
      const cat = categories.find((c) => c.name.toLowerCase() === suggestion.value.toLowerCase());
      if (cat) {
        setSelectedCategory(cat.slug || "");
      }
    } else if (suggestion.type === "city" || suggestion.type === "state") {
      setSelectedLocation(suggestion.value);
    }
    setTimeout(() => {
      onSearch?.();
    }, 50);
  };

  const handleRecentOrPopularSelect = (query: string) => {
    setSearchQuery(query);
    addRecentSearch(query);
    setSuggestionsOpen(false);
    setTimeout(() => {
      onSearch?.();
    }, 50);
  };

  // Keyboard navigation for suggestions list
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestionsOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setSuggestionsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[highlightedIndex]);
        } else {
          triggerSearch();
        }
        break;
      case "Escape":
        e.preventDefault();
        setSuggestionsOpen(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  return (
    <div className={cn("w-full max-w-5xl mx-auto space-y-3", className)}>
      <div className="bg-bg-card/90 backdrop-blur-xl border border-border/80 rounded-2xl p-2.5 sm:p-3.5 shadow-2xl flex flex-col md:flex-row items-stretch gap-2.5">
        {/* Keyword Input Wrapper */}
        <div ref={searchContainerRef} className="flex-1 relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-text-muted shrink-0 pointer-events-none" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSuggestionsOpen(true);
              setHighlightedIndex(-1);
            }}
            onFocus={() => {
              setSuggestionsOpen(true);
              setHighlightedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search artists, bands, genres, or venue spaces..."
            className="pl-10 pr-10 text-xs sm:text-sm bg-bg-elevated/40 border-border/60 focus:bg-bg-elevated text-text-primary rounded-xl h-11 w-full"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSuggestionsOpen(true);
                setHighlightedIndex(-1);
              }}
              className="absolute right-3 text-text-muted hover:text-text-primary p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Autocomplete suggestions dropdown */}
          {suggestionsOpen && (
            <div className="absolute top-13 left-0 right-0 z-50 bg-bg-card border border-border/90 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95">
              {searchQuery.trim().length >= 2 ? (
                suggestionsLoading ? (
                  <MarketplaceSearchSkeleton />
                ) : (
                  <MarketplaceSearchSuggestions
                    suggestions={suggestions}
                    onSelect={handleSuggestionSelect}
                    visible={suggestionsOpen}
                    onClose={() => setSuggestionsOpen(false)}
                    highlightedIndex={highlightedIndex}
                    setHighlightedIndex={setHighlightedIndex}
                  />
                )
              ) : (
                <div className="p-3 space-y-3.5 max-h-[350px] overflow-y-auto">
                  <MarketplaceRecentSearches onSelect={handleRecentOrPopularSelect} />
                  <MarketplacePopularSearches onSelect={handleRecentOrPopularSelect} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="w-full md:w-52 relative flex items-center">
          <SlidersHorizontal className="absolute left-3.5 h-4 w-4 text-text-muted shrink-0 pointer-events-none" />
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              onSearch?.();
            }}
            className="w-full pl-10 pr-4 h-11 text-xs sm:text-sm bg-bg-elevated/40 border border-border/60 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer"
          >
            <option value="" className="bg-bg-card text-text-primary">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug || cat.name.toLowerCase()} className="bg-bg-card text-text-primary">
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Location Selector Dropdown */}
        <div className="w-full md:w-64 relative" ref={locationMenuRef}>
          <div
            onClick={() => setLocationMenuOpen((prev) => !prev)}
            className="w-full pl-10 pr-9 h-11 text-xs sm:text-sm bg-bg-elevated/40 border border-border/60 rounded-xl text-text-primary flex items-center justify-between cursor-pointer select-none relative hover:border-border transition-colors"
          >
            <MapPin className="absolute left-3.5 h-4 w-4 text-primary shrink-0" />
            <span className={cn("truncate font-medium", !selectedLocation && "text-text-muted")}>
              {selectedLocation || "Select Location (India)"}
            </span>
            {selectedLocation ? (
              <button
                type="button"
                onClick={handleClearLocation}
                className="absolute right-3 text-text-muted hover:text-text-primary p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <span className="absolute right-3.5 text-text-muted text-[10px]">▼</span>
            )}
          </div>

          {/* Location Interactive Menu */}
          {locationMenuOpen && (
            <div className="absolute top-13 left-0 right-0 z-50 bg-bg-card border border-border/90 rounded-2xl shadow-2xl p-3 space-y-3 max-h-96 overflow-y-auto text-xs text-text-primary animate-in fade-in-50 zoom-in-95">
              {/* Searchable input inside dropdown */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-muted" />
                <Input
                  type="text"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  placeholder="Filter city or state..."
                  className="pl-9 h-8 text-xs bg-bg-elevated/60 border-border/60"
                  autoFocus
                />
              </div>

              {/* Recent Searches */}
              {!filterText && recentLocations.length > 0 && (
                <div className="space-y-1.5 border-b border-border/40 pb-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    <History className="h-3 w-3 text-primary" />
                    <span>Recent Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentLocations.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => handleSelectLocation(loc)}
                        className="px-2.5 py-1 rounded-lg bg-bg-elevated hover:bg-primary/20 text-text-primary hover:text-primary transition-colors text-[11px] font-medium border border-border/40"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Cities */}
              {filteredPopular.length > 0 && (
                <div className="space-y-1.5 border-b border-border/40 pb-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    <span>Popular Cities</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {filteredPopular.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => handleSelectLocation(city)}
                        className={cn(
                          "text-left px-2.5 py-1.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-[11px]",
                          selectedLocation === city && "bg-primary/15 text-primary font-bold"
                        )}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* States (28) */}
              {filteredStates.length > 0 && (
                <div className="space-y-1.5 border-b border-border/40 pb-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    <Building className="h-3 w-3 text-emerald-400" />
                    <span>States of India ({filteredStates.length})</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {filteredStates.map((state) => (
                      <button
                        key={state}
                        type="button"
                        onClick={() => handleSelectLocation(state)}
                        className={cn(
                          "text-left px-2.5 py-1.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-[11px]",
                          selectedLocation === state && "bg-primary/15 text-primary font-bold"
                        )}
                      >
                        {state}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Union Territories (8) */}
              {filteredUTs.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    <Map className="h-3 w-3 text-blue-400" />
                    <span>Union Territories ({filteredUTs.length})</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {filteredUTs.map((ut) => (
                      <button
                        key={ut}
                        type="button"
                        onClick={() => handleSelectLocation(ut)}
                        className={cn(
                          "text-left px-2.5 py-1.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-[11px]",
                          selectedLocation === ut && "bg-primary/15 text-primary font-bold"
                        )}
                      >
                        {ut}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={triggerSearch}
            className="h-11 px-6 rounded-xl font-bold bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/25 text-xs sm:text-sm shrink-0"
          >
            Search Marketplace
          </Button>

          {(searchQuery || selectedCategory || selectedLocation) && (
            <Button
              type="button"
              variant="outline"
              onClick={resetFilters}
              className="h-11 px-3 rounded-xl border-border/80 text-text-muted hover:text-text-primary text-xs shrink-0"
              title="Reset Filters"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
