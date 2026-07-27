"use client";

import * as React from "react";
import { Flame, Trophy, ThumbsUp, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";

interface LeaderboardItem {
  id: string;
  name: string;
  rank: number;
  total: number;
  votes: number;
  avatar: string;
}

const INITIAL_CONTESTANTS: LeaderboardItem[] = [
  { id: "1", name: "Grace", rank: 1, total: 21, votes: 9, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
  { id: "2", name: "Gus", rank: 2, total: 21, votes: 7, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
  { id: "3", name: "Anjelo", rank: 3, total: 21, votes: 7, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" },
  { id: "4", name: "Ankle", rank: 4, total: 21, votes: 6, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" },
  { id: "5", name: "Anman", rank: 5, total: 21, votes: 5, avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80" },
];

export function StageLeaderboardWidget() {
  const [contestants, setContestants] = React.useState<LeaderboardItem[]>(INITIAL_CONTESTANTS);

  const handleVote = (id: string, name: string) => {
    setContestants((prev) =>
      prev.map((c) => (c.id === id ? { ...c, votes: c.votes + 1 } : c))
    );
    toast.success(`Vote cast for ${name}! 🎉`, {
      style: { background: "#121020", color: "#C6FF3D", border: "1px solid rgba(198, 255, 61, 0.3)" },
    });
  };

  return (
    <section className="py-24 relative z-10 border-t border-zinc-800/80 bg-zinc-950/60">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Explanation Column */}
        <div className="lg:col-span-5 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-widest border border-purple-500/20">
            <Trophy className="h-4 w-4 text-lime-400" />
            <span>Fan Ranking Engine</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight stage-font-heading text-white">
            What?
          </h2>

          <p className="text-zinc-400 leading-relaxed text-base">
            Stage is a new artist-first ecosystem. Launching in Q3 2026, it combines live event bookings with fan-powered competitions, real-time performer rank scoreboards, and direct gig rewards.
          </p>

          <div className="p-4 rounded-2xl glass-stage border border-purple-500/20 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-lime-400/10 text-lime-400 border border-lime-400/20 shrink-0">
              <Flame className="h-6 w-6" />
            </div>
            <p className="text-xs text-zinc-300 leading-normal">
              Artists keep <span className="text-lime-400 font-extrabold">90% of all gig revenue</span> + earn bonus platform points from fan voting.
            </p>
          </div>
        </div>

        {/* Right Live Leaderboard Card Widget (Exact styling from reference photo) */}
        <div className="lg:col-span-7">
          <div className="glass-stage p-6 sm:p-8 rounded-3xl border border-purple-500/30 shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-lime-400 animate-ping" />
                <h3 className="text-lg font-extrabold text-white stage-font-heading">Live Performer Scoreboard</h3>
              </div>
              <span className="text-xs text-zinc-500 font-mono">Q3 Season 1</span>
            </div>

            {/* Contestant Rows */}
            <div className="space-y-3">
              {contestants.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-purple-500/50 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-10 h-10 rounded-full object-cover border border-purple-500/40"
                    />
                    <div>
                      <span className="font-extrabold text-white text-base block">{item.name}</span>
                      <span className="text-xs text-zinc-500 font-mono">
                        Rank {item.rank} / {item.total}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded-xl bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-1">
                      <ChevronUp className="h-3.5 w-3.5 text-lime-400" />
                      <span>+{item.votes}</span>
                    </div>
                    <button
                      onClick={() => handleVote(item.id, item.name)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-lime-400 hover:text-black text-zinc-300 transition-colors"
                      title="Vote for performer"
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
