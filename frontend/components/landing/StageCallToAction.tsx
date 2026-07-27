"use client";

import * as React from "react";
import Link from "next/link";
import { Music, ArrowRight, Sparkles } from "lucide-react";

export function StageCallToAction() {
  return (
    <section className="py-20 relative z-10 border-t border-zinc-800/80 bg-black">
      <div className="max-w-5xl mx-auto px-6">
        <div className="rounded-3xl p-10 sm:p-14 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 border border-purple-400/40 shadow-2xl relative overflow-hidden text-center space-y-6 animate-pulse-glow">
          {/* Subtle background glow circle */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-lime-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/30 backdrop-blur-md text-lime-400 text-xs font-extrabold uppercase tracking-widest border border-lime-400/30 mx-auto">
            <Sparkles className="h-4 w-4 text-lime-400" />
            <span>Join BandConnect Stage</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight stage-font-heading">
            Are you an artist?
          </h2>

          <p className="text-lg text-purple-100 max-w-2xl mx-auto leading-relaxed">
            Join us and create your 3D performer profile. Publish your rates, manage booking availability, and receive escrow secured payouts.
          </p>

          <div className="pt-4 flex justify-center">
            <Link
              href="/register"
              className="px-8 py-4 rounded-xl bg-black hover:bg-zinc-900 text-lime-400 font-extrabold text-base flex items-center gap-2 shadow-xl border border-lime-400/40 hover:scale-105 transition-transform"
            >
              <span>Get on Stage</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
