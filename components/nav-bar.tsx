"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes } from "lucide-react";
import { clsx } from "clsx";
import { useProgressStore } from "@/store/progress-store";
import { getLevelInfo } from "@/lib/gamification";
import Image from "next/image";

const LINKS = [
  { href: "/learn", label: "Learn" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/playground", label: "Playground" },
  { href: "/challenges", label: "Challenges" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export function NavBar() {
  const pathname = usePathname();
  const xp = useProgressStore((s) => s.xp);
  
  // Use a default mock XP of 1240 if they have 0, for the landing page vibe, or dynamic XP
  const displayXp = xp > 0 ? xp : 1240;
  const level = getLevelInfo(displayXp);
  const isCanvasRoute = pathname?.startsWith("/playground") || pathname?.includes("/learn/");

  return (
    <header
      className={clsx(
        "sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md",
        isCanvasRoute && "px-4",
      )}
    >
      {/* Brand Logo */}
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-dim border border-accent/20 text-accent transition-all duration-300 group-hover:scale-105 group-hover:border-accent/40 group-hover:shadow-[0_0_15px_rgba(52,211,153,0.15)]">
            <Boxes size={22} strokeWidth={1.8} className="animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-accent leading-none">System Design</span>
            <span className="text-sm font-semibold tracking-tight text-foreground leading-tight">Playground</span>
          </div>
        </Link>

        {/* Center Links */}
        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "text-[13px] font-medium transition-colors duration-150 py-1.5 px-1 relative",
                pathname === link.href || pathname?.startsWith(link.href + "/")
                  ? "text-foreground font-semibold"
                  : "text-muted hover:text-foreground",
              )}
            >
              {link.label}
              {(pathname === link.href || pathname?.startsWith(link.href + "/")) && (
                <span className="absolute bottom-[-17px] left-0 right-0 h-[2px] bg-accent rounded-full" />
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Right Stats & Avatar */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3.5 rounded-xl border border-border bg-surface/50 px-3.5 py-1.5 text-[12px] mono text-muted shadow-sm select-none">
          <span className="font-semibold text-foreground">{displayXp.toLocaleString()} XP</span>
          <span className="h-3 w-[1px] bg-border" />
          <span className="text-accent font-semibold">Level {level.level}</span>
        </div>

        <Link href="/profile" className="relative h-9 w-9 overflow-hidden rounded-full border border-border bg-surface transition-all duration-150 hover:border-accent/50 hover:scale-105">
          <Image
            src="/avatar.png"
            alt="Profile Avatar"
            fill
            sizes="36px"
            className="object-cover"
            priority
          />
        </Link>
      </div>
    </header>
  );
}
