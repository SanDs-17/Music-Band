"use client";

import * as React from "react";
import "../styles/stage-3d.css";
import { Stage3DHero } from "@/components/landing/Stage3DHero";
import { StageLeaderboardWidget } from "@/components/landing/StageLeaderboardWidget";
import { StageHowItWorks3D } from "@/components/landing/StageHowItWorks3D";
import { StageWhyVinylSection } from "@/components/landing/StageWhyVinylSection";
import { StageCollectiblesGrid } from "@/components/landing/StageCollectiblesGrid";
import { StageAmbassadorTeam } from "@/components/landing/StageAmbassadorTeam";
import { StageCallToAction } from "@/components/landing/StageCallToAction";
import { LiveAudioPlayerBar } from "@/components/landing/LiveAudioPlayerBar";

export default function BandLandingPage() {
  const [activeTrack, setActiveTrack] = React.useState({
    title: "Neon Echoes Live Session",
    artist: "Electric Horizon",
  });

  const handlePlaySample = (trackName, artistName) => {
    setActiveTrack({ title: trackName, artist: artistName });
  };

  return (
    <div className="stage-body min-h-screen relative">
      {/* Hero 3D Section */}
      <Stage3DHero />

      {/* Leaderboard "What?" Section */}
      <StageLeaderboardWidget />

      {/* 3D How It Works Section */}
      <StageHowItWorks3D />

      {/* Why Section with Rotating 3D Vinyl */}
      <StageWhyVinylSection />

      {/* Digital Collectibles Grid */}
      <StageCollectiblesGrid onPlaySample={handlePlaySample} />

      {/* Ambassador Team Spotlight */}
      <StageAmbassadorTeam />

      {/* Call to Action Banner */}
      <StageCallToAction />

      {/* Floating Bottom Audio Player */}
      <LiveAudioPlayerBar currentTrack={activeTrack} />
    </div>
  );
}
