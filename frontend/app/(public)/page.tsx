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

export default function PublicLandingPage() {
  const [activeTrack, setActiveTrack] = React.useState({
    title: "Neon Echoes Live Session",
    artist: "Electric Horizon",
  });

  const handlePlaySample = (trackName: string, artistName: string) => {
    setActiveTrack({ title: trackName, artist: artistName });
  };

  return (
    <div className="stage-body min-h-screen relative">
      <Stage3DHero />
      <StageLeaderboardWidget />
      <StageHowItWorks3D />
      <StageWhyVinylSection />
      <StageCollectiblesGrid onPlaySample={handlePlaySample} />
      <StageAmbassadorTeam />
      <StageCallToAction />
      <LiveAudioPlayerBar currentTrack={activeTrack} />
    </div>
  );
}
