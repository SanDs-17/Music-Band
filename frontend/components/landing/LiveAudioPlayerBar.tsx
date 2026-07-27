"use client";

import * as React from "react";
import Link from "next/link";
import { Play, Pause, Volume2, Music, X, CalendarCheck } from "lucide-react";
import toast from "react-hot-toast";

interface LiveAudioPlayerBarProps {
  currentTrack?: {
    title: string;
    artist: string;
  };
  onClose?: () => void;
}

export function LiveAudioPlayerBar({
  currentTrack = { title: "Neon Echoes Live Session", artist: "Electric Horizon" },
  onClose
}: LiveAudioPlayerBarProps) {
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [visible, setVisible] = React.useState(true);

  if (!visible) return null;

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    toast.success(isPlaying ? "Audio sample paused" : `Now playing: ${currentTrack.title}`, {
      style: { background: "#121020", color: "#C6FF3D", border: "1px solid rgba(198, 255, 61, 0.3)" },
    });
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-2xl z-50 glass-stage-elevated p-3 sm:px-5 rounded-2xl border border-lime-400/40 shadow-2xl flex items-center justify-between gap-4">
      {/* Track Info & Equalizer */}
      <div className="flex items-center gap-3 overflow-hidden">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-xl bg-lime-400 text-black flex items-center justify-center font-bold shrink-0 hover:scale-105 transition-transform"
        >
          {isPlaying ? <Pause className="h-5 w-5 fill-black" /> : <Play className="h-5 w-5 fill-black ml-0.5" />}
        </button>

        <div className="overflow-hidden">
          <span className="text-xs font-extrabold text-white truncate block">{currentTrack.title}</span>
          <span className="text-[10px] text-lime-400 font-mono block">{currentTrack.artist}</span>
        </div>

        {/* Animated Equalizer Bars */}
        {isPlaying && (
          <div className="hidden sm:flex items-end gap-1 h-6 px-2 shrink-0">
            <div className="equalizer-bar" />
            <div className="equalizer-bar" />
            <div className="equalizer-bar" />
            <div className="equalizer-bar" />
            <div className="equalizer-bar" />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/artists"
          className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold flex items-center gap-1.5 transition-colors"
        >
          <CalendarCheck className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Book Performer</span>
          <span className="sm:hidden">Book</span>
        </Link>
        <button
          onClick={() => {
            setVisible(false);
            if (onClose) onClose();
          }}
          className="p-2 text-zinc-400 hover:text-white rounded-lg transition-colors"
          title="Close player"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
