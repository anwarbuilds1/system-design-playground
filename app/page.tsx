import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  BookOpen,
  Cpu,
  Play,
  Zap,
  Compass,
  Sparkles,
} from "lucide-react";
import { HeroSection } from "@/components/landing/HeroSection";
import { Button } from "@/components/ui/button";

const LOOP = [
  {
    label: "Learn",
    detail: "A short, concrete explanation — no walls of text.",
    icon: BookOpen,
    color: "text-emerald-400",
    bgAccent: "bg-emerald-500/10 border-emerald-500/20",
    glow: "group-hover:shadow-[0_0_20px_rgba(52,211,153,0.15)] group-hover:border-emerald-400/40"
  },
  {
    label: "Build",
    detail: "Drag components onto a real canvas and connect them.",
    icon: Cpu,
    color: "text-sky-400",
    bgAccent: "bg-sky-500/10 border-sky-500/20",
    glow: "group-hover:shadow-[0_0_20px_rgba(56,189,248,0.15)] group-hover:border-sky-400/40"
  },
  {
    label: "Run",
    detail: "Simulate traffic against the architecture you built.",
    icon: Play,
    color: "text-blue-400",
    bgAccent: "bg-blue-500/10 border-blue-500/20",
    glow: "group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] group-hover:border-blue-400/40"
  },
  {
    label: "Break",
    detail: "Watch bottlenecks and single points of failure surface.",
    icon: Zap,
    color: "text-rose-400",
    bgAccent: "bg-rose-500/10 border-rose-500/20",
    glow: "group-hover:shadow-[0_0_20px_rgba(244,63,94,0.15)] group-hover:border-rose-400/40"
  },
  {
    label: "Understand",
    detail: "See exactly why, with a plain-language explanation.",
    icon: Compass,
    color: "text-purple-400",
    bgAccent: "bg-purple-500/10 border-purple-500/20",
    glow: "group-hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] group-hover:border-purple-400/40"
  },
  {
    label: "Improve",
    detail: "Fix it, run again, and watch your score climb.",
    icon: Sparkles,
    color: "text-amber-400",
    bgAccent: "bg-amber-500/10 border-amber-500/20",
    glow: "group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] group-hover:border-amber-400/40"
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Interactive Hero Visualizer */}
      <HeroSection />

      {/* The Core Loop Steps */}
      <section className="border-t border-border bg-surface/10 px-6 py-20 lg:py-28 relative">
        <div className="absolute top-0 left-1/3 w-[300px] h-[300px] bg-accent/3 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="mb-14 flex items-end justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent mono block">
                The Core Loop
              </span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Not a course. A feedback loop.
              </h2>
            </div>
            <div className="hidden items-center gap-2 border border-border bg-surface/50 rounded-xl px-4 py-2 text-xs mono text-muted sm:flex select-none">
              <TrendingUp size={14} className="text-accent" /> Iterative progress flow
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
            {LOOP.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.label}
                  className={`group relative flex flex-col justify-between rounded-2xl border border-border bg-surface/20 p-5.5 transition-all duration-300 hover:-translate-y-1 ${step.glow}`}
                >
                  {/* Subtle Background Inner Glow */}
                  <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 pointer-events-none bg-current ${step.color}`} />
                  
                  <div>
                    {/* Header: Number & Icon */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="mono text-xs font-bold text-muted-2">0{idx + 1}</span>
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center border transition-colors duration-300 ${step.bgAccent} ${step.color}`}>
                        <Icon size={14} strokeWidth={2.2} />
                      </div>
                    </div>

                    {/* Step Label */}
                    <h3 className="text-sm font-bold tracking-tight text-foreground mb-2 group-hover:text-accent transition-colors duration-200">
                      {step.label}
                    </h3>

                    {/* Step Detail */}
                    <p className="text-[12.5px] leading-relaxed text-muted font-medium">
                      {step.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* URL Shortener Challenge CTA */}
      <section className="px-6 pb-24 relative overflow-hidden">
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[250px] bg-emerald-500/3 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-surface/25 backdrop-blur-md px-8 py-16 text-center shadow-xl">
            {/* Tech grid inside CTA */}
            <div className="grid-fade absolute inset-0 opacity-20 pointer-events-none" />
            
            {/* Soft backdrop radial blobs */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
              {/* Badge */}
              <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[10px] font-bold text-accent tracking-wider uppercase select-none">
                🚀 Getting Started Lesson
              </span>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight max-w-2xl leading-snug">
                Build a URL shortener that survives{" "}
                <span className="bg-gradient-to-r from-rose-400 to-amber-500 bg-clip-text text-transparent filter drop-shadow-[0_2px_8px_rgba(244,63,94,0.3)]">
                  10,000 RPS.
                </span>
              </h2>

              {/* Description */}
              <p className="mt-4 max-w-lg text-[13.5px] sm:text-[14px] leading-relaxed text-muted font-medium">
                Six lessons, one deterministic simulation engine, zero AI guessing at your architecture&apos;s physics.
              </p>

              {/* Start Button */}
              <Link href="/learn/client-server-db" className="mt-8 group">
                <Button size="lg" className="font-bold tracking-tight hover:shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                  Start Lesson 1 
                  <ArrowRight size={14} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
