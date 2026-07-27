"use client";

import * as React from "react";
import { Award, Users, CheckCircle2 } from "lucide-react";

const AMBASSADORS = [
  { id: "1", name: "Jerry Hall", role: "Rock Violinist", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80", tag: "STAGE PRO" },
  { id: "2", name: "Gaza", role: "Lead Vocalist", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80", tag: "HEADLINER" },
  { id: "3", name: "Tolai", role: "Electronic Producer", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80", tag: "AMBASSADOR" },
];

export function StageAmbassadorTeam() {
  return (
    <section className="py-24 relative z-10 border-t border-zinc-800/80 bg-zinc-950/70">
      <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-widest border border-purple-500/20">
            <Award className="h-4 w-4 text-lime-400" />
            <span>Headliner Spotlight</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight stage-font-heading text-white">
            The creation of our <span className="text-purple-400">ambassador team</span> has begun.
          </h2>

          <p className="text-zinc-400 text-base">
            Guiding the next era of live event entertainment with industry experts, legendary band leaders, and top venue partners.
          </p>
        </div>

        {/* Ambassador Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {AMBASSADORS.map((item) => (
            <div
              key={item.id}
              className="glass-stage p-6 rounded-3xl border border-purple-500/20 hover:border-lime-400/50 transition-all flex flex-col items-center text-center tilt-card group"
            >
              <div className="relative w-32 h-32 mb-4 rounded-full p-1 bg-gradient-to-tr from-purple-600 via-purple-500 to-lime-400 group-hover:scale-105 transition-transform">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-full border-2 border-black"
                />
                <div className="absolute -bottom-1 -right-1 bg-lime-400 text-black p-1 rounded-full border-2 border-black">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>

              <span className="px-3 py-0.5 rounded-full bg-purple-900/60 text-lime-400 text-[10px] font-extrabold tracking-wider border border-purple-500/30 mb-2">
                {item.tag}
              </span>

              <h4 className="text-xl font-extrabold text-white stage-font-heading">{item.name}</h4>
              <p className="text-xs text-zinc-400 mt-1">{item.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
