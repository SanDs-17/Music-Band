"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowRight, Eye, Sparkles } from "lucide-react";
import { MarketplaceArtistCard } from "@/features/marketplace/types";
import { ArtistBadge } from "./ArtistBadge";
import { ArtistRating } from "./ArtistRating";
import { ArtistAvailability } from "./ArtistAvailability";
import { ArtistVerificationBadge } from "./ArtistVerificationBadge";
import { MarketplaceSmartBadges } from "./MarketplaceSmartBadges";
import { Button } from "@/components/ui/button";
import { useMarketplaceStore } from "@/features/marketplace/stores/useMarketplaceStore";
import { cn } from "@/utils/cn";

export interface ArtistDiscoveryCardProps {
  artist: MarketplaceArtistCard;
  viewMode?: "grid" | "list";
  className?: string;
}

export function ArtistDiscoveryCard({
  artist,
  viewMode = "grid",
  className,
}: ArtistDiscoveryCardProps) {
  const { openPreviewModal } = useMarketplaceStore();
  const handleText = artist.username ? `@${artist.username}` : "Verified Performer";

  if (viewMode === "list") {
    return (
      <div
        className={cn(
          "group rounded-2xl border border-border/80 bg-bg-card hover:bg-bg-elevated/20 transition-all duration-300 shadow-md hover:shadow-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 text-text-primary",
          className,
        )}
      >
        <div className="flex items-start gap-4 flex-1">
          {/* Avatar / Profile image */}
          <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-primary/10 border border-primary/30 overflow-hidden shrink-0 shadow-md">
            {artist.profile_image ? (
              <Image
                src={artist.profile_image}
                alt={artist.display_name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-black text-primary text-xl">
                {artist.display_name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-extrabold text-base sm:text-lg text-text-primary group-hover:text-primary transition-colors">
                {artist.display_name}
              </h3>
              <span className="text-xs text-text-muted font-medium">{handleText}</span>
              <ArtistVerificationBadge status={artist.verification_status} />
              {artist.is_featured && (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  <Sparkles className="h-3 w-3" /> Featured
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
              <ArtistBadge bandType={artist.band_type} totalMembers={artist.total_members} />
              <ArtistRating rating={artist.rating} totalReviews={artist.total_reviews} />
              {(artist.city || artist.state) && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{artist.city || artist.state}</span>
                </div>
              )}
              <ArtistAvailability status={artist.availability_status} />
            </div>

            <MarketplaceSmartBadges
              searchScore={artist.search_score}
              availabilityInfo={artist.availability_info}
              popularityInfo={artist.popularity_info}
              profileCompletion={artist.profile_completion_info}
              smartBadges={artist.smart_badges}
            />

            {artist.bio && (
              <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                {artist.bio}
              </p>
            )}

            {/* Genres */}
            {artist.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {artist.genres.slice(0, 4).map((g) => (
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
        </div>

        {/* Pricing & Actions */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-border/40">
          <div className="text-left md:text-right">
            <span className="text-xs text-text-muted font-medium block">Base Starting Rate</span>
            <span className="text-base sm:text-lg font-black text-text-primary">
              ₹{artist.base_rate.toLocaleString()}{" "}
              <span className="text-[10px] font-normal text-text-muted">/ gig</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openPreviewModal(artist.id)}
              className="h-9 px-3 rounded-xl border-border/80 text-xs font-bold shrink-0"
              title="Quick Preview"
            >
              <Eye className="h-3.5 w-3.5 mr-1" />
              Preview
            </Button>

            <Button
              asChild
              size="sm"
              className="h-9 px-4 rounded-xl bg-primary hover:bg-primary-hover font-bold text-xs shrink-0 shadow-md shadow-primary/20"
            >
              <Link href={`/artists/${artist.id}`}>
                View Profile
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Default Grid View Layout
  return (
    <div
      className={cn(
        "group rounded-2xl border border-border/80 bg-bg-card hover:bg-bg-elevated/20 transition-all duration-300 shadow-md hover:shadow-xl overflow-hidden flex flex-col justify-between text-text-primary",
        className,
      )}
    >
      <div>
        {/* Cover or Header Image Area */}
        <div className="h-28 w-full bg-bg-elevated/60 relative overflow-hidden border-b border-border/40">
          {artist.cover_image ? (
            <div className="relative h-full w-full">
              <Image
                src={artist.cover_image}
                alt={artist.display_name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          ) : (
            <div className="h-full w-full bg-linear-to-r from-primary/10 via-bg-elevated to-primary/20" />
          )}

          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            {artist.is_featured && (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-400 bg-bg-card/90 backdrop-blur-md border border-amber-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                <Sparkles className="h-3 w-3" /> Featured
              </span>
            )}
            <ArtistBadge bandType={artist.band_type} totalMembers={artist.total_members} />
          </div>

          <div className="absolute -bottom-6 left-5">
            <div className="relative h-14 w-14 rounded-2xl bg-bg-card border-2 border-primary/40 shadow-lg overflow-hidden">
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
          </div>
        </div>

        <div className="p-5 pt-8 space-y-3">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-extrabold text-base text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                {artist.display_name}
              </h3>
              <ArtistVerificationBadge status={artist.verification_status} />
            </div>
            <p className="text-[11px] text-text-muted font-medium">{handleText}</p>
          </div>

          <div className="flex items-center justify-between text-xs text-text-muted pt-0.5">
            <ArtistRating rating={artist.rating} totalReviews={artist.total_reviews} />
            {(artist.city || artist.state) && (
              <div className="flex items-center gap-1 text-[11px] text-text-muted truncate max-w-[130px]">
                <MapPin className="h-3 w-3 shrink-0 text-primary" />
                <span className="truncate">{artist.city || artist.state}</span>
              </div>
            )}
          </div>

          <MarketplaceSmartBadges
            searchScore={artist.search_score}
            availabilityInfo={artist.availability_info}
            popularityInfo={artist.popularity_info}
            profileCompletion={artist.profile_completion_info}
            smartBadges={artist.smart_badges}
          />

          {artist.bio && (
            <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{artist.bio}</p>
          )}

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
      </div>

      {/* Card Footer Actions */}
      <div className="px-5 py-3.5 bg-bg-elevated/40 border-t border-border/40 flex items-center justify-between gap-2 text-xs mt-auto">
        <div>
          <span className="text-[10px] text-text-muted block">Starting Rate</span>
          <span className="font-extrabold text-sm text-text-primary">
            ₹{artist.base_rate.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => openPreviewModal(artist.id)}
            className="h-8 px-2.5 rounded-lg border-border/80 text-[11px] font-bold"
            title="Quick Preview"
          >
            <Eye className="h-3 w-3" />
          </Button>

          <Button
            asChild
            size="sm"
            className="h-8 px-3 rounded-lg bg-primary hover:bg-primary-hover font-bold text-[11px]"
          >
            <Link href={`/artists/${artist.id}`}>
              View Profile
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
