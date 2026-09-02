"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function LessonTabNav({ lessonId }: { lessonId: string }) {
  const pathname = usePathname();
  const isLearn = !pathname.endsWith("/build");

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
      <TabLink href={`/learn/${lessonId}`} active={isLearn}>
        1. Learn
      </TabLink>
      <TabLink href={`/learn/${lessonId}/build`} active={!isLearn}>
        2. Build &amp; Simulate
      </TabLink>
    </div>
  );
}

function TabLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
        active ? "bg-accent/15 text-accent" : "text-muted hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}
