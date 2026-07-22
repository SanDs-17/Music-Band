"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, ArrowRight } from "lucide-react";
import { MarketplaceArtistCard } from "@/features/marketplace/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";

export interface FeaturedArtistCardProps {
  artist: MarketplaceArtistCard;
  className?: string;
}

export function FeaturedArtistCard({ artist, className }: FeaturedArtistCardProps) {
  const handleText = artist.username ? `@${artist.username}` : "Verified Performer";

  return (
    <div
      className={cn(
        "group rounded-2xl border border-border/80 bg-bg-card hover:bg-bg-elevated/20 transition-all duration-300 shadow-md hover:shadow-xl overflow-hidden flex flex-col justify-between text-text-primary",
        className,
      )}
    >
      <div className="p-5 space-y-4">
        {/* Header avatar & badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 rounded-xl bg-primary/10 border border-primary/30 overflow-hidden shrink-0">
              {artist.profile_image ? (
                <Image
                  src={artist.profile_image}
                  alt={artist.display_name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-black text-primary text-base">
                  {artist.display_name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                {artist.display_name}
              </h3>
              <p className="text-[11px] text-text-muted font-medium">{handleText}</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-[10px] uppercase font-bold shrink-0 border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
          >
            {artist.band_type}
          </Badge>
        </div>

        {/* Bio summary */}
        {artist.bio && (
          <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{artist.bio}</p>
        )}

        {/* Genres */}
        {artist.genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {artist.genres.slice(0, 3).map((g) => (
              <span
                key={g.id}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-bg-elevated text-text-muted border border-border/40"
              >
                {g.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer details & Action */}
      <div className="px-5 py-3.5 bg-bg-elevated/40 border-t border-border/40 flex items-center justify-between text-xs text-text-muted mt-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 font-bold text-text-primary">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{artist.rating.toFixed(1)}</span>
            <span className="text-[10px] font-normal text-text-muted">
              ({artist.total_reviews})
            </span>
          </div>

          {(artist.city || artist.state) && (
            <div className="flex items-center gap-1 text-[11px] text-text-muted truncate max-w-[120px]">
              <MapPin className="h-3 w-3 shrink-0 text-text-muted" />
              <span className="truncate">{artist.city || artist.state}</span>
            </div>
          )}
        </div>

        <Link
          href={`/artists/${artist.id}`}
          className="inline-flex items-center gap-1 text-xs font-extrabold text-primary hover:text-primary-hover group-hover:translate-x-0.5 transition-transform"
        >
          <span>View</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
