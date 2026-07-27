"use client";

import * as React from "react";
import Link from "next/link";
import { Star, Play, Music, Sparkles, Volume2 } from "lucide-react";
import toast from "react-hot-toast";

interface CollectibleCard {
  id: string;
  name: string;
  genre: string;
  rate: string;
  rating: number;
  image: string;
  trackName: string;
}

const CARDS: CollectibleCard[] = [
  {
    id: "1",
    name: "One Ideal",
    genre: "Rock / Metal",
    rate: "₹15,000 / hr",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    trackName: "Neon Echoes Live",
  },
  {
    id: "2",
    name: "Oliver Vee",
    genre: "Jazz Trio",
    rate: "₹22,000 / hr",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80",
    trackName: "Midnight Smooth Session",
  },
  {
    id: "3",
    name: "Jodi Soka",
    genre: "Acoustic Solo",
    rate: "₹8,500 / hr",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
    trackName: "Sunset Acoustic Melodies",
  },
  {
    id: "4",
    name: "Jerry Hall",
    genre: "DJ & Violin",
    rate: "₹18,000 / hr",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
    trackName: "Cyber Violin Beats",
  },
  {
    id: "5",
    name: "Gaza Band",
    genre: "Indie Fusion",
    rate: "₹30,000 / hr",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
    trackName: "High Altitude Anthem",
  },
];

interface StageCollectiblesGridProps {
  onPlaySample?: (trackName: string, artistName: string) => void;
}

export function StageCollectiblesGrid({ onPlaySample }: StageCollectiblesGridProps) {
  const handlePlaySample = (card: CollectibleCard) => {
    if (onPlaySample) {
      onPlaySample(card.trackName, card.name);
    } else {
      toast.success(`Playing sample track: ${card.trackName}`, {
        icon: "🎵",
        style: { background: "#121020", color: "#C6FF3D", border: "1px solid rgba(198, 255, 61, 0.3)" },
      });
    }
  };

  return (
    <section className="py-24 relative z-10 border-t border-zinc-800/80 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-widest border border-purple-500/20">
            <Sparkles className="h-4 w-4 text-lime-400" />
            <span>Digital Cards Showcase</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight stage-font-heading text-white">
            Your own unique digital collectible.
          </h2>

          <p className="text-zinc-400 text-base">
            Packed with exclusive artist perks, live schedule access, direct booking guarantees, and verified reviews.
          </p>
        </div>

        {/* 5 Card Hologram Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {CARDS.map((card) => (
            <div
              key={card.id}
              className="glass-stage rounded-3xl p-4 border border-purple-500/30 hover:border-lime-400 transition-all duration-300 tilt-card group relative flex flex-col justify-between"
            >
              <div className="relative h-60 rounded-2xl overflow-hidden mb-4 bg-zinc-900 border border-zinc-800">
                <img
                  src={card.image}
                  alt={card.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Rating Badge */}
                <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 bg-black/80 backdrop-blur-md border border-lime-400/40 text-lime-400 text-[11px] font-extrabold rounded-full flex items-center gap-1">
                  <Star className="h-3 w-3 fill-lime-400" />
                  <span>{card.rating}</span>
                </div>

                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <span className="text-[10px] font-extrabold text-lime-400 uppercase tracking-wider block">
                    {card.genre}
                  </span>
                  <h4 className="text-base font-extrabold text-white stage-font-heading leading-tight">
                    {card.name}
                  </h4>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Rate</span>
                  <span className="font-extrabold text-lime-400">{card.rate}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handlePlaySample(card)}
                    className="py-2 px-2 rounded-xl bg-purple-900/40 hover:bg-purple-600 text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors border border-purple-500/30"
                  >
                    <Volume2 className="h-3.5 w-3.5 text-lime-400" />
                    <span>Sample</span>
                  </button>
                  <Link
                    href="/artists"
                    className="py-2 px-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-black text-xs font-extrabold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Play className="h-3.5 w-3.5 fill-black" />
                    <span>Book</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
