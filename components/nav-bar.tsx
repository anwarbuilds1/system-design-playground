"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes } from "lucide-react";
import { clsx } from "clsx";
import { useProgressStore } from "@/store/progress-store";
import { getLevelInfo } from "@/lib/gamification";

const LINKS = [
  { href: "/learn", label: "Learn" },
  { href: "/playground", label: "Playground" },
  { href: "/challenges", label: "Challenges" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/profile", label: "Profile" },
];

export function NavBar() {
  const pathname = usePathname();
  const xp = useProgressStore((s) => s.xp);
  const level = getLevelInfo(xp);
  const isCanvasRoute = pathname?.startsWith("/playground") || pathname?.includes("/learn/");

  return (
    <header
      className={clsx(
        "sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/80 px-5 backdrop-blur-md",
        isCanvasRoute && "px-4",
      )}
    >
      <div className="flex items-center gap-7">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/15 text-accent">
            <Boxes size={14} strokeWidth={2.2} />
          </div>
          <span className="text-[13.5px] font-medium tracking-tight text-foreground">System Design Playground</span>
        </Link>
        <nav className="hidden items-center gap-5 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "text-[13px] transition-colors",
                pathname === link.href || pathname?.startsWith(link.href + "/")
                  ? "text-foreground"
                  : "text-muted hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <Link
        href="/profile"
        className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12px] mono text-muted hover:border-border-strong"
      >
        <span className="text-accent">Lv.{level.level}</span>
        <span className="hidden sm:inline">{xp.toLocaleString()} XP</span>
      </Link>
    </header>
  );
}
