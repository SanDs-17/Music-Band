"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Play, Star, Music2, Flame, ShieldCheck } from "lucide-react";

export function Stage3DHero() {
  return (
    <section className="relative min-h-[90vh] pt-28 pb-20 overflow-hidden flex items-center justify-center">
      {/* Dynamic 3D Track Pattern Background */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <svg className="w-full h-full" viewBox="0 0 1440 900" fill="none">
          <path
            d="M-100 450 C 300 200, 600 700, 1000 300 C 1200 100, 1500 500, 1600 400"
            stroke="url(#purple-gradient-line)"
            strokeWidth="12"
            strokeLinecap="round"
            className="animate-pulse"
          />
          <path
            d="M-50 550 C 350 300, 650 800, 1050 400 C 1250 200, 1550 600, 1650 500"
            stroke="url(#lime-gradient-line)"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.6"
          />
          <defs>
            <linearGradient id="purple-gradient-line" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="50%" stopColor="#9333EA" />
              <stop offset="100%" stopColor="#C6FF3D" />
            </linearGradient>
            <linearGradient id="lime-gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C6FF3D" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Radial ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Bold Headline & Call to Action */}
        <div className="lg:col-span-7 space-y-8 text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-stage border border-purple-500/30 text-lime-400 text-xs font-bold uppercase tracking-widest shadow-lg">
            <Sparkles className="h-4 w-4 text-lime-400 animate-spin-slow" />
            <span>Next-Gen Music & Band Ecosystem</span>
          </div>

          <h1 className="text-5xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight stage-font-heading leading-[1.05] text-white">
            The next music stars will be born on{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-purple-300 to-lime-300">
              Stage.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl leading-relaxed">
            An unprecedented opportunity for the next generation of musical talent. Connect direct bookings, real-time fan voting, escrow payouts, and live gig management in one 3D ecosystem.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/artists"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-extrabold text-base flex items-center gap-3 shadow-xl shadow-purple-600/30 hover:scale-105 transition-all duration-300"
            >
              <span>Explore Performers</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/register"
              className="px-8 py-4 rounded-xl glass-stage hover:bg-white/10 text-white font-bold text-base flex items-center gap-2 border border-zinc-700 hover:border-lime-400/50 transition-all duration-300"
            >
              <Music2 className="h-5 w-5 text-lime-400" />
              <span>Join as Artist</span>
            </Link>
          </div>

          {/* Social Proof Pills */}
          <div className="pt-6 flex items-center gap-8 border-t border-zinc-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-white">Escrow Secured</div>
                <div className="text-xs text-zinc-500">100% Host Protection</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-lime-500/10 text-lime-400 border border-lime-500/20">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-white">10,000+ Gigs</div>
                <div className="text-xs text-zinc-500">Live Across Asia</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Animated Card Stack */}
        <div className="lg:col-span-5 relative perspective-3d flex items-center justify-center">
          {/* Main Floating 3D Card 1 */}
          <div className="w-full max-w-sm glass-stage p-5 rounded-3xl tilt-card border border-purple-500/30 shadow-2xl relative z-20 animate-float-slow">
            <div className="relative h-64 rounded-2xl overflow-hidden mb-4 bg-zinc-900 border border-zinc-800">
              <img
                src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80"
                alt="Featured Band"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute top-3 right-3 px-3 py-1 bg-lime-400 text-black font-extrabold text-xs rounded-full shadow-md flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-black" />
                <span>4.9 / 5.0</span>
              </div>
              <div className="absolute top-3 left-3 px-3 py-1 bg-purple-600/90 text-white font-extrabold text-xs rounded-full backdrop-blur-md">
                #1 Live Rock
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-xl font-extrabold text-white stage-font-heading">Electric Horizon</h3>
                <p className="text-xs text-zinc-300">Alternative Rock & High-Energy Covers</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-xs text-zinc-400">Hourly Rate</div>
                <div className="text-lg font-extrabold text-lime-400">₹15,000 / hr</div>
              </div>
              <Link
                href="/artists"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Play className="h-3.5 w-3.5 fill-white" />
                <span>Book Band</span>
              </Link>
            </div>
          </div>

          {/* Background Offset 3D Card 2 */}
          <div className="w-full max-w-sm glass-stage p-4 rounded-3xl tilt-card-purple border border-purple-400/20 absolute -top-8 -right-6 z-10 opacity-70 animate-float-reverse hidden sm:block">
            <div className="h-48 rounded-2xl overflow-hidden bg-zinc-900">
              <img
                src="https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80"
                alt="Jazz Band"
                className="w-full h-full object-cover opacity-75"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
