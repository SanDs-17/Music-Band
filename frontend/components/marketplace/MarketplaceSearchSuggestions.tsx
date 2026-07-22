"use client";

import React, { useEffect, useRef } from "react";
import { Search, MapPin, Music, Sparkles, Building2 } from "lucide-react";
import type { SearchSuggestion } from "@/features/marketplace/types";
import { cn } from "@/utils/cn";

interface MarketplaceSearchSuggestionsProps {
  suggestions: SearchSuggestion[];
  onSelect: (suggestion: SearchSuggestion) => void;
  visible: boolean;
  onClose: () => void;
  highlightedIndex: number;
  setHighlightedIndex: (index: number) => void;
}

export function MarketplaceSearchSuggestions({
  suggestions,
  onSelect,
  visible,
  onClose,
  highlightedIndex,
  setHighlightedIndex,
}: MarketplaceSearchSuggestionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (visible) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [visible, onClose]);

  if (!visible || suggestions.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "artist":
        return <Sparkles className="h-4 w-4 text-amber-500" />;
      case "venue":
        return <Building2 className="h-4 w-4 text-primary" />;
      case "genre":
        return <Music className="h-4 w-4 text-pink-500" />;
      case "city":
      case "state":
        return <MapPin className="h-4 w-4 text-emerald-500" />;
      default:
        return <Search className="h-4 w-4 text-text-muted" />;
    }
  };

  return (
    <div
      ref={containerRef}
      role="listbox"
      id="search-suggestions-dropdown"
      className="absolute top-full left-0 right-0 z-50 mt-1 bg-bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-150"
    >
      <div className="p-2 border-b border-border/40 bg-bg-elevated/40">
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-2">
          Suggestions
        </p>
      </div>
      <div className="max-h-[300px] overflow-y-auto p-1.5 space-y-0.5">
        {suggestions.map((item, idx) => {
          const isHighlighted = idx === highlightedIndex;
          return (
            <button
              key={`${item.type}-${item.value}-${idx}`}
              role="option"
              aria-selected={isHighlighted}
              onClick={() => onSelect(item)}
              onMouseEnter={() => setHighlightedIndex(idx)}
              className={cn(
                "w-full flex items-start gap-3.5 px-3 py-2.5 rounded-xl transition-all text-left",
                isHighlighted
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-bg-elevated/80 text-text-primary"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-lg shrink-0",
                isHighlighted ? "bg-primary/15" : "bg-bg-elevated"
              )}>
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold truncate">
                  {item.display}
                </p>
                {item.subtitle && (
                  <p className="text-[10px] sm:text-xs text-text-muted truncate mt-0.5">
                    {item.subtitle}
                  </p>
                )}
              </div>
              <span className="text-[10px] text-text-muted font-medium bg-bg-elevated/60 px-2 py-0.5 rounded-md self-center uppercase border border-border/40 tracking-wider">
                {item.type}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
