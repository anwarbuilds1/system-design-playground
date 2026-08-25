"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import { Button } from "@/components/ui/button";
import { HeroPreview } from "./HeroPreview";

// Brand Logo SVGs
const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" className="h-4.5 fill-current opacity-40 hover:opacity-100 text-muted transition-all duration-300">
    <path d="M12.24 10.285V13.4h6.887c-.275 1.56-1.802 4.585-6.887 4.585-4.39 0-7.97-3.615-7.97-8.07s3.58-8.07 7.97-8.07c2.5 0 4.175 1.045 5.13 1.955l2.455-2.36C18.23 2.3 15.53 1 12.24 1 6.04 1 1 6.04 1 12.24s5.04 11.24 11.24 11.24c5.84 0 11.24-4.13 11.24-11.24 0-.765-.08-1.35-.18-1.955H12.24z"/>
  </svg>
);

const MicrosoftLogo = () => (
  <svg viewBox="0 0 23 23" className="h-3.5 fill-current opacity-40 hover:opacity-100 text-muted transition-all duration-300">
    <path d="M0 0h11v11H0zM12 0h11v11H12zM0 12h11v11H0zM12 12h11v11H12z" />
  </svg>
);

const AmazonLogo = () => (
  <svg viewBox="0 0 24 24" className="h-4.5 fill-current opacity-40 hover:opacity-100 text-muted transition-all duration-300">
    <path d="M15.93 17.1c-1.37.95-3.08 1.48-4.93 1.48-3.7 0-6.72-2.12-6.72-5.74 0-4.08 3.25-6.07 7.64-6.07 1.3 0 2.5.18 3.48.5v-.57c0-1.87-1.12-2.92-3.15-2.92-1.68 0-3.32.55-4.48 1.25L6.46 3.1c1.55-.9 3.75-1.3 5.92-1.3 4.8 0 7.8 2.45 7.8 7.37v6.62c0 1.25.48 1.83.95 2.37l-2.45 1.58c-.53-.7-1-1.3-1.15-2.07l-.6.43zm-4.32-.4c1.84 0 3.28-.7 4.12-1.7V12.1c-.8-.32-1.83-.45-2.82-.45-2.58 0-4.08.97-4.08 3.1 0 1.32.95 1.95 2.78 1.95zm11.37 2.05c-3.16 2.35-7.72 3.55-11.75 3.55-5.9 0-11.02-2.48-13.88-6.17l1.7-1.28c2.43 3.28 6.9 5.38 12.18 5.38 3.56 0 7.67-1.02 10.45-2.92l1.3 1.44zm.6-1.93l-1.08-1.5c.2-.24.47-.6.47-.94 0-.44-.33-.67-.78-.67-.17 0-.3.04-.44.1l-.85 1.77L21.32 16c-.05-.08-.13-.23-.13-.37 0-.2.13-.35.34-.35.08 0 .17.02.24.06l1.24-2.5a2 2 0 0 0-1.67-.93c-.93 0-1.65.6-1.86 1.36l-.88 1.8c-.14.28-.3.45-.58.45-.16 0-.25-.05-.36-.12l-1.07-1.5 1.86-3.8c.2-.42.6-.74 1.1-.74.67 0 1.13.56 1.13 1.14 0 .2-.06.37-.15.54l-1.38 2.82h.04c.73 0 1.36-.45 1.63-1.08l1.3-2.65c.1-.23.16-.48.16-.72 0-.82-.64-1.46-1.46-1.46a1.5 1.5 0 0 0-1.34.84l-2 4.1c-.13.25-.33.45-.63.45a.5.5 0 0 1-.36-.15l-1.12-1.56 2.1-4.3c.25-.5.73-.86 1.3-.86a1.5 1.5 0 0 1 1.47 1.5c0 .24-.05.47-.15.68l-2.07 4.22h.03c.8 0 1.48-.5 1.76-1.2l2.03-4.14c.1-.22.16-.45.16-.67 0-.9-.72-1.62-1.62-1.62a1.6 1.6 0 0 0-1.48.98L19.2 16.5c-.1.2-.26.36-.5.36a.4.4 0 0 1-.34-.17L17.2 15l2.43-5c.24-.5.7-.84 1.25-.84.8 0 1.42.62 1.42 1.42 0 .2-.04.4-.13.57l-2.4 4.96h.04c.83 0 1.55-.5 1.83-1.26l2.3-4.73c.1-.22.15-.45.15-.67 0-.96-.78-1.74-1.74-1.74a1.73 1.73 0 0 0-1.58 1.05l-2.73 5.6a.65.65 0 0 1-.58.37c-.24 0-.44-.12-.55-.3l-1.14-1.6L19 7.42a1.6 1.6 0 0 1 1.43-1c.96 0 1.74.78 1.74 1.74 0 .23-.05.45-.14.65l-2.7 5.56" />
  </svg>
);

const NetflixLogo = () => (
  <svg viewBox="0 0 24 24" className="h-4.5 fill-current opacity-40 hover:opacity-100 text-muted transition-all duration-300">
    <path d="M5.5 2c-.3 0-.5.2-.5.5v19c0 .3.2.5.5.5h3c.2 0 .4-.1.5-.3l6-15.4v15.2c0 .3.2.5.5.5h3c.3 0 .5-.2.5-.5v-19c0-.3-.2-.5-.5-.5h-3c-.2 0-.4.1-.5.3l-6 15.4v-15.2c0-.3-.2-.5-.5-.5h-3z" />
  </svg>
);

const SpotifyLogo = () => (
  <svg viewBox="0 0 24 24" className="h-4.5 fill-current opacity-40 hover:opacity-100 text-muted transition-all duration-300">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.438-5.305-1.764-8.788-.97-.336.077-.67-.135-.747-.47-.077-.337.136-.67.472-.748 3.812-.87 7.075-.495 9.71 1.12.294.18.388.563.21.857zm1.225-2.72c-.226.367-.707.487-1.074.26-2.69-1.654-6.79-2.133-9.97-1.167-.413.125-.845-.107-.97-.52-.125-.413.107-.847.52-.973 3.633-1.102 8.147-.565 11.233 1.332.368.227.487.707.26 1.073zm.107-2.836C14.494 8.78 8.75 8.59 5.4 9.61c-.53.16-1.09-.14-1.25-.67-.16-.53.14-1.09.67-1.25 3.85-1.17 10.18-.95 14.18 1.43.48.28.64.9.36 1.38-.28.48-.9.64-1.38.36z" />
  </svg>
);

export function HeroSection() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isPeak, setIsPeak] = useState(false);
  const [latency, setLatency] = useState(82);
  const [rps, setRps] = useState(4.2);
  const [availability, setAvailability] = useState(99.21);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Synchronized stats calculations
  useEffect(() => {
    if (!isPlaying) {
      const timer = setTimeout(() => {
        setLatency(0);
        setRps(0);
        setAvailability(100.0);
      }, 0);
      return () => clearTimeout(timer);
    }

    const interval = setInterval(() => {
      const baseLatency = isPeak ? 134 : 82;
      const baseRps = isPeak ? 8.7 : 4.2;
      const baseAvail = isPeak ? 98.85 : 99.21;

      setLatency(Math.max(1, Math.round(baseLatency + (Math.random() * 6 - 3))));
      setRps(parseFloat((baseRps + (Math.random() * 0.4 - 0.2)).toFixed(1)));
      setAvailability(parseFloat(Math.min(100, Math.max(90, baseAvail + (Math.random() * 0.08 - 0.04))).toFixed(2)));
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, isPeak]);

  return (
    <section className="relative overflow-hidden py-12 lg:py-24 border-b border-border">
      {/* Background Gradients */}
      <div className="grid-fade absolute inset-0 h-[720px] pointer-events-none opacity-80" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-6 flex flex-col items-start text-left z-10">
            {/* Interactive Badge */}
            <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-[11px] font-semibold text-accent tracking-wider uppercase select-none">
              <Sparkles size={11} className="animate-spin-slow" /> Interactive. Practical. Fun.
            </span>

            {/* Hero Heading */}
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-[46px] md:text-[52px] leading-[1.08] lg:max-w-lg">
              Learn System Design <br />
              <span className="bg-gradient-to-r from-accent via-emerald-400 to-teal-400 bg-clip-text text-transparent filter drop-shadow-[0_4px_12px_rgba(52,211,153,0.15)] relative">
                by Building It.
              </span>
            </h1>

            {/* Subheading Description */}
            <p className="mt-6 text-sm sm:text-base leading-relaxed text-muted max-w-xl font-medium">
              Build architectures, run simulations, discover bottlenecks, and understand the trade-offs behind
              real-world systems using our interactive physics-based builder.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/learn" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto font-bold tracking-tight hover:shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                  Start Learning <ArrowRight size={14} strokeWidth={2.5} />
                </Button>
              </Link>
              <Link href="/playground" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto font-bold tracking-tight">
                  <PlayCircle size={14} /> Open Playground
                </Button>
              </Link>
            </div>

            {/* Trusted By Brand Row */}
            <div className="mt-12 lg:mt-16 w-full">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-2 block mb-4.5">
                Trusted by developers at
              </span>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                <GoogleLogo />
                <AmazonLogo />
                <MicrosoftLogo />
                <NetflixLogo />
                <SpotifyLogo />
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Diagram */}
          <div className="lg:col-span-6 flex justify-center w-full z-10">
            <HeroPreview
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              isPeak={isPeak}
              setIsPeak={setIsPeak}
              hoveredNode={hoveredNode}
              setHoveredNode={setHoveredNode}
            />
          </div>

        </div>

        {/* Bottom Full-width Stats Panel */}
        <div className="mt-16 lg:mt-24 border border-border bg-surface/30 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
            {[
              {
                label: "Latency",
                value: isPlaying ? `${latency}ms` : "0ms",
                sub: isPeak ? "Active load queuing delay" : "99th percentile response time",
                color: isPeak ? "text-rose-400" : "text-accent"
              },
              {
                label: "RPS",
                value: isPlaying ? `${rps}k` : "0",
                sub: isPeak ? "System scaling maximum" : "Requests per second",
                color: "text-accent"
              },
              {
                label: "Availability",
                value: `${availability}%`,
                sub: isPeak && availability < 99 ? "Load-shedding active" : "Expected system SLA uptime",
                color: isPeak && availability < 99 ? "text-amber-400" : "text-accent"
              },
              {
                label: "Architecture Score",
                value: isPlaying ? "92 / 100" : "--",
                sub: "Design layout efficiency rating",
                color: "text-accent"
              }
            ].map((stat, idx) => (
              <div key={idx} className="p-6 flex flex-col justify-between hover:bg-surface-2/10 transition-colors duration-150">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-2 mono">{stat.label}</span>
                <div className={clsx("text-2xl sm:text-3xl font-extrabold mono mt-1.5 tracking-tight", stat.color)}>{stat.value}</div>
                <div className="text-[11px] text-muted mt-2 leading-relaxed">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
