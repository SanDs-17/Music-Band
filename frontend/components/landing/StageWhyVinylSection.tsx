"use client";

import * as React from "react";
import { Disc, Heart, Shield, Music } from "lucide-react";

const ARTIST_BADGES = [
  { id: "1", name: "Oliver Vee", role: "Jazz Vocalist", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
  { id: "2", name: "Jodi Soka", role: "Acoustic Solo", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
  { id: "3", name: "Jerry Hall", role: "Fusion Violinist", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" },
];

export function StageWhyVinylSection() {
  return (
    <section className="py-24 relative z-10 border-t border-zinc-800/80 bg-zinc-950/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column Text */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-widest border border-purple-500/20">
            <Disc className="h-4 w-4 text-lime-400 animate-spin-slow" />
            <span>Artist Empowerment</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight stage-font-heading text-white">
            Why?
          </h2>

          <p className="text-zinc-400 text-lg leading-relaxed">
            Stage is cutting-edge tech for the music industry — a totally new way to connect performers, event hosts, and fans. Musicians earn transparent rates for their gigs, and fans support their favorite acts directly.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-2xl glass-stage border border-purple-500/20">
              <Heart className="h-5 w-5 text-lime-400 mb-2" />
              <h4 className="font-extrabold text-white text-base">Direct Fan Rewards</h4>
              <p className="text-xs text-zinc-400 mt-1">Fans vote and unlock exclusive perks for supporting upcoming performers.</p>
            </div>

            <div className="p-4 rounded-2xl glass-stage border border-purple-500/20">
              <Shield className="h-5 w-5 text-purple-400 mb-2" />
              <h4 className="font-extrabold text-white text-base">Fair Gig Contracts</h4>
              <p className="text-xs text-zinc-400 mt-1">Clear contracts, cancellation protection, and automated escrow deposits.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Rotating Vinyl Record & Floating Circular Avatars */}
        <div className="lg:col-span-6 relative flex items-center justify-center min-h-[400px]">
          {/* Animated 3D Rotating Vinyl Disc */}
          <div className="w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-zinc-900 border-8 border-zinc-800 shadow-2xl relative flex items-center justify-center animate-spin-slow">
            {/* Grooves */}
            <div className="w-64 h-64 rounded-full border border-zinc-800 flex items-center justify-center">
              <div className="w-48 h-48 rounded-full border border-zinc-800 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-purple-600 to-lime-400 p-1 flex items-center justify-center shadow-lg">
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                    <Music className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Artist Avatar Badges around vinyl */}
          {ARTIST_BADGES.map((b, idx) => (
            <div
              key={b.id}
              className={`absolute glass-stage-elevated px-4 py-2 rounded-2xl border border-purple-500/40 shadow-xl flex items-center gap-3 animate-float-slow ${
                idx === 0
                  ? "top-4 left-4"
                  : idx === 1
                  ? "bottom-4 right-4"
                  : "top-1/2 -right-4"
              }`}
              style={{ animationDelay: `${idx * 1.5}s` }}
            >
              <img src={b.avatar} alt={b.name} className="w-10 h-10 rounded-full object-cover border border-lime-400" />
              <div>
                <span className="text-xs font-extrabold text-white block">{b.name}</span>
                <span className="text-[10px] text-zinc-400">{b.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
