"use client";

import * as React from "react";
import Link from "next/link";
import { artistService } from "@/services/artistService";
import { ArtistProfile } from "@/types/artist";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Sparkles } from "lucide-react";

export default function PublicArtistsListPage() {
  const [artists, setArtists] = React.useState<ArtistProfile[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filter states
  const [search, setSearch] = React.useState("");
  const [city, setCity] = React.useState("");
  const [bandType, setBandType] = React.useState("");

  const fetchArtists = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {};
      if (search) params.search = search;
      if (city) params.city = city;
      if (bandType) params.performer_type = bandType;

      const data = await artistService.getPublicArtists(params);
      setArtists(data.artists || []);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch performers. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  }, [search, city, bandType]);

  React.useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  return (
    <div className="relative min-h-screen pb-16 pt-24 px-6 max-w-7xl mx-auto">
      {/* Background overlay glow */}
      <div className="absolute inset-0 glow-overlay pointer-events-none" />

      {/* Header and intro */}
      <div className="relative z-10 text-center max-w-3xl mx-auto mb-12 space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-primary text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span>Browse Top Music Talent</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-text-primary font-heading">
          Meet Our Verified Live Bands
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          Find solo singers, instrumentalists, and multi-member rock bands in your region. Direct communication, fully vetted ratings, and secure transaction handshakes.
        </p>
      </div>

      {/* Filters Card */}
      <Card className="relative z-10 bg-bg-card/45 backdrop-blur-md border border-border/85 rounded-2xl p-5 mb-8 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Search band name, keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-bg-card border-border/80 h-10 text-xs text-text-primary"
            />
          </div>

          <div className="relative">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full h-10 rounded-lg border border-border/80 bg-bg-card text-text-primary text-xs px-3 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Cities</option>
              <option value="Chennai">Chennai</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Hyderabad">Hyderabad</option>
            </select>
          </div>

          <div className="relative">
            <select
              value={bandType}
              onChange={(e) => setBandType(e.target.value)}
              className="w-full h-10 rounded-lg border border-border/80 bg-bg-card text-text-primary text-xs px-3 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Band Sizes</option>
              <option value="Solo">Solo Musician</option>
              <option value="Duo">Duo / Duo Live</option>
              <option value="3-4 Members">3-4 Members Trio/Quartet</option>
              <option value="5+ Members">5+ Members Big Ensemble</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Performers grid */}
      <div className="relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
            <Spinner className="h-8 w-8 text-primary" />
            <p className="text-xs text-text-secondary animate-pulse font-medium">Syncing performance talent catalog...</p>
          </div>
        ) : error ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <ErrorState title="Failed to load performers" message={error} onRetry={fetchArtists} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {artists.map((artist) => {
              const coverImage = typeof artist.gallery?.[0] === "string"
                ? artist.gallery[0]
                : (artist.gallery?.[0] as any)?.url || "https://images.unsplash.com/photo-1501386761578-eac5c94b800a";
              return (
                <Link key={artist.id} href={`/artists/${artist.id}`}>
                  <Card className="bg-bg-card/45 backdrop-blur-md border border-border/70 overflow-hidden hover:border-primary/45 transition-all duration-300 group h-full flex flex-col">
                    <div className="relative h-48 w-full overflow-hidden">
                      <img
                        src={coverImage}
                        alt={artist.display_name || "Performer"}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent" />
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-primary hover:bg-primary text-white font-bold text-[9px] uppercase px-2 py-0.5">
                          {artist.band_type || "Performer"}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-base font-extrabold text-text-primary group-hover:text-primary transition-colors truncate">
                            {artist.display_name || artist.user?.name || "Anonymous Band"}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-amber-400 shrink-0 font-bold">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            <span>{artist.rating?.toFixed(1) || "5.0"}</span>
                          </div>
                        </div>

                        <p className="text-xs text-text-secondary flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">{artist.city || "Not specified"}, {artist.state || "India"}</span>
                        </p>

                        <p className="text-xs text-text-muted line-clamp-2 pt-1">
                          {artist.bio || "No summary biography registered for this live performer."}
                        </p>
                      </div>

                      <div className="border-t border-border/50 pt-4 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider block">Performance Rate</span>
                          <span className="text-sm font-black text-text-primary font-mono">
                            ₹{artist.base_rate?.toLocaleString()} <span className="text-[10px] font-normal text-text-secondary">/ hour</span>
                          </span>
                        </div>
                        
                        <Button size="sm" className="font-bold text-xs h-8 rounded-lg cursor-pointer">
                          View Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}

            {artists.length === 0 && (
              <div className="col-span-full py-16 text-center text-xs text-text-muted italic">
                No active, approved music performers matching filters were found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
