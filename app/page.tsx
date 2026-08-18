import Link from "next/link";
import { ArrowRight, Blocks, PlayCircle, TrendingUp, ChevronRight } from "lucide-react";
import { HeroPreview } from "@/components/landing/HeroPreview";
import { Button } from "@/components/ui/button";

const LOOP = [
  { label: "Learn", detail: "A short, concrete explanation — no walls of text." },
  { label: "Build", detail: "Drag components onto a real canvas and connect them." },
  { label: "Run", detail: "Simulate traffic against the architecture you built." },
  { label: "Break", detail: "Watch bottlenecks and single points of failure surface." },
  { label: "Understand", detail: "See exactly why, with a plain-language explanation." },
  { label: "Improve", detail: "Fix it, run again, and watch your score climb." },
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="relative overflow-hidden">
        <div className="grid-fade absolute inset-0 h-[520px]" />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 pb-16 pt-20 text-center sm:pt-28">
          <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[12px] text-muted mono">
            <Blocks size={12} className="text-accent" /> deterministic simulation, not a diagramming tool
          </span>
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
            Learn System Design <br className="hidden sm:block" /> by Building It.
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
            Build architectures, run simulations, discover bottlenecks, and understand the trade-offs behind
            real-world systems.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/learn">
              <Button size="lg">
                Start Learning <ArrowRight size={15} />
              </Button>
            </Link>
            <Link href="/playground">
              <Button variant="secondary" size="lg">
                <PlayCircle size={15} /> Open Playground
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative mx-auto max-w-4xl px-6 pb-24">
          <HeroPreview />
        </div>
      </section>

      <section className="border-t border-border bg-surface/20 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-accent mono">The core loop</div>
              <h2 className="mt-1.5 text-2xl font-semibold text-foreground">Not a course. A feedback loop.</h2>
            </div>
            <TrendingUp size={20} className="hidden text-muted-2 sm:block" />
          </div>
          <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface/40 sm:flex-row sm:divide-x sm:divide-y-0">
            {LOOP.map((step, idx) => (
              <div key={step.label} className="group relative flex-1 p-5">
                <div className="mb-2 flex items-center gap-2">
                  <span className="mono text-[11px] text-muted-2">0{idx + 1}</span>
                  <span className="text-[13.5px] font-medium text-foreground">{step.label}</span>
                </div>
                <p className="text-[12.5px] leading-relaxed text-muted">{step.detail}</p>
                {idx < LOOP.length - 1 && (
                  <ChevronRight
                    size={14}
                    className="absolute right-[-9px] top-1/2 hidden -translate-y-1/2 text-border-strong sm:block"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center rounded-2xl border border-border bg-gradient-to-b from-surface to-surface/40 px-8 py-14 text-center">
          <h2 className="text-2xl font-semibold text-foreground">Build a URL shortener that survives 10,000 RPS.</h2>
          <p className="mt-3 max-w-lg text-[14px] text-muted">
            Six lessons, one deterministic simulation engine, zero AI guessing at your architecture&apos;s physics.
          </p>
          <Link href="/learn/client-server-db" className="mt-7">
            <Button size="lg">
              Start Lesson 1 <ArrowRight size={15} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
