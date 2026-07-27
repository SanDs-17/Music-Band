"use client";

import * as React from "react";
import { Sparkles, Layers, ShieldCheck, Zap } from "lucide-react";

export function StageHowItWorks3D() {
  const steps = [
    {
      num: "1",
      title: "Create 3D Profile & Reels",
      desc: "Artists upload video reels, audio snippets, set hourly performance rates, and configure equipment availability.",
      icon: <Layers className="h-6 w-6 text-lime-400" />,
    },
    {
      num: "2",
      title: "Direct Client Bookings",
      desc: "Clients browse live bands, run pre-flight availability checks against calendars, and send booking requests.",
      icon: <Zap className="h-6 w-6 text-purple-400" />,
    },
    {
      num: "3",
      title: "Escrow Secured Payouts",
      desc: "Funds are held in escrow until the gig concludes. The artist receives payout minus a 10% platform commission.",
      icon: <ShieldCheck className="h-6 w-6 text-lime-400" />,
    },
  ];

  return (
    <section className="py-24 relative z-10 border-t border-zinc-800/80 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-widest border border-purple-500/20">
            <Sparkles className="h-4 w-4 text-lime-400" />
            <span>Simple 3-Step Process</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight stage-font-heading text-white">
            How?
          </h2>

          <p className="text-zinc-400 text-base">
            From discovering musical talent to instant escrow payouts, managing live music gigs has never been smoother.
          </p>
        </div>

        {/* 3D Capsule Grid (Exact layout from reference photo) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div
              key={step.num}
              className="glass-stage p-8 rounded-3xl border border-purple-500/20 hover:border-lime-400/50 transition-all duration-300 relative group tilt-card"
            >
              {/* Giant 3D Pill/Capsule Graphic background element */}
              <div className="absolute top-4 right-4 text-7xl font-black text-purple-900/20 group-hover:text-purple-500/30 transition-colors stage-font-heading select-none pointer-events-none">
                0{step.num}
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-900/30 border border-purple-500/30 w-fit mb-6">
                {step.icon}
              </div>

              <h3 className="text-2xl font-extrabold text-white mb-3 stage-font-heading">
                <span className="text-lime-400 mr-2">{step.num}.</span>
                {step.title}
              </h3>

              <p className="text-zinc-400 text-sm leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
