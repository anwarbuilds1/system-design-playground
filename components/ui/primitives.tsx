import type { HTMLAttributes } from "react";
import { clsx } from "clsx";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("rounded-xl border border-border bg-surface/60 backdrop-blur-sm", className)}
      {...props}
    />
  );
}

export function Badge({
  className,
  tone = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: "default" | "accent" | "warning" | "danger" }) {
  const tones: Record<string, string> = {
    default: "bg-surface-2 text-muted border-border-strong",
    accent: "bg-accent/10 text-accent border-accent/30",
    warning: "bg-warning/10 text-warning border-warning/30",
    danger: "bg-danger/10 text-danger border-danger/30",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium mono uppercase tracking-wide",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

export function ProgressBar({ value, max = 100, className }: { value: number; max?: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={clsx("h-1.5 w-full rounded-full bg-surface-2 overflow-hidden", className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-accent-strong to-accent transition-all duration-700 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
