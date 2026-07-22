"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { X, MapPin, ArrowRight, Loader2, Globe, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArtistRating } from "./ArtistRating";
import { ArtistBadge } from "./ArtistBadge";
import { ArtistAvailability } from "./ArtistAvailability";
import { ArtistVerificationBadge } from "./ArtistVerificationBadge";
import {
  useArtistPreview,
  useMarketplaceAvailability,
  useMarketplacePopularity,
  useProfileCompletion,
} from "@/features/marketplace/hooks/useMarketplace";
import { useMarketplaceStore } from "@/features/marketplace/stores/useMarketplaceStore";
import { MarketplaceSmartBadges } from "./MarketplaceSmartBadges";

export function ArtistQuickPreviewModal() {
  const { selectedArtistPreviewId, closePreviewModal } = useMarketplaceStore();
  const { preview, loading, error } = useArtistPreview(selectedArtistPreviewId);
  const { data: availabilityData } = useMarketplaceAvailability("artist", selectedArtistPreviewId);
  const { data: popularityData } = useMarketplacePopularity("artist", selectedArtistPreviewId);
  const { data: profileData } = useProfileCompletion("artist", selectedArtistPreviewId);

  if (!selectedArtistPreviewId) return null;

  const handleText = preview?.username ? `@${preview.username}` : "Verified Performer";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in-50">
      <div
        className="bg-bg-card border border-border/80 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden text-text-primary relative max-h-[90vh] flex flex-col animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closePreviewModal}
          className="absolute top-4 right-4 z-20 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-xs text-text-muted">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span>Fetching artist preview details...</span>
          </div>
        ) : error || !preview ? (
          <div className="py-16 p-6 text-center space-y-3">
            <p className="text-xs text-rose-400">{error || "Unable to preview artist profile."}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={closePreviewModal}
              className="text-xs font-bold"
            >
              Close Modal
            </Button>
          </div>
        ) : (
          <div className="overflow-y-auto">
            {/* Header Banner & Avatar */}
            <div className="h-36 w-full bg-bg-elevated/80 relative border-b border-border/40">
              {preview.cover_image ? (
                <div className="relative h-full w-full">
                  <Image
                    src={preview.cover_image}
                    alt={preview.display_name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-full w-full bg-linear-to-r from-primary/20 via-bg-card to-primary/30" />
              )}

              <div className="absolute -bottom-8 left-6">
                <div className="h-20 w-20 rounded-2xl bg-bg-card border-2 border-primary/50 shadow-xl overflow-hidden flex items-center justify-center font-black text-primary text-2xl">
                  {preview.profile_image ? (
                    <Image
                      src={preview.profile_image}
                      alt={preview.display_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    preview.display_name.slice(0, 2).toUpperCase()
                  )}
                </div>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 pt-10 space-y-6">
              {/* Header Titles */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-text-primary leading-tight">
                      {preview.display_name}
                    </h2>
                    <ArtistVerificationBadge status={preview.verification_status} />
                  </div>
                  <p className="text-xs text-text-muted font-medium">{handleText}</p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-text-muted uppercase font-bold block">
                    Starting Performance Rate
                  </span>
                  <span className="text-lg font-black text-text-primary">
                    ₹{preview.base_rate.toLocaleString()}{" "}
                    <span className="text-xs font-normal text-text-muted">/ event</span>
                  </span>
                </div>
              </div>

              {/* Sub-Badges Row */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <ArtistBadge bandType={preview.band_type} totalMembers={preview.total_members} />
                <ArtistRating
                  rating={preview.rating}
                  totalReviews={preview.total_reviews}
                  size="md"
                />
                {(preview.city || preview.state) && (
                  <div className="flex items-center gap-1 text-text-muted">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>{preview.city || preview.state}</span>
                  </div>
                )}
                <ArtistAvailability status={preview.availability_indicator} />
              </div>

              <MarketplaceSmartBadges
                availabilityInfo={availabilityData?.availability}
                popularityInfo={popularityData}
                profileCompletion={profileData}
              />

              {/* Bio */}
              {preview.bio && (
                <div className="space-y-1 bg-bg-elevated/30 p-3.5 rounded-2xl border border-border/40">
                  <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                    About Performer
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed">{preview.bio}</p>
                </div>
              )}

              {/* Genres & Languages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {preview.genres.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                      <Music className="h-3 w-3 text-primary" />
                      Music Genres
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {preview.genres.map((g) => (
                        <span
                          key={g.id}
                          className="px-2 py-0.5 rounded-md bg-bg-elevated text-text-muted border border-border/40 text-[10px]"
                        >
                          {g.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {preview.languages.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                      <Globe className="h-3 w-3 text-emerald-400" />
                      Performance Languages
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {preview.languages.map((l) => (
                        <span
                          key={l.id}
                          className="px-2 py-0.5 rounded-md bg-bg-elevated text-text-muted border border-border/40 text-[10px]"
                        >
                          {l.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Gallery Thumbnails */}
              {preview.gallery.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                    Media Gallery
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {preview.gallery.slice(0, 4).map((url, idx) => (
                      <div
                        key={idx}
                        className="relative h-16 rounded-xl bg-bg-elevated overflow-hidden border border-border/40"
                      >
                        <Image src={url} alt="Gallery" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/40">
                <Button
                  variant="outline"
                  onClick={closePreviewModal}
                  className="h-10 px-4 rounded-xl text-xs font-bold"
                >
                  Close
                </Button>

                <Button
                  asChild
                  onClick={closePreviewModal}
                  className="h-10 px-5 rounded-xl bg-primary hover:bg-primary-hover font-bold text-xs shadow-lg shadow-primary/25"
                >
                  <Link href={`/artists/${preview.id}`}>
                    Go to Full Profile
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
