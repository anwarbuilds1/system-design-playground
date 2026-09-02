import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getLesson } from "@/data/lessons";
import { LessonTabNav } from "@/components/lessons/LessonTabNav";

export default async function LessonLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);
  if (!lesson) notFound();

  return (
    <div className="flex flex-col" style={{ height: "calc(100dvh - 64px)" }}>
      {/* Sub-header */}
      <div className="shrink-0 border-b border-border/60 bg-surface/50 backdrop-blur-sm px-6 py-2.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href="/learn"
              className="flex shrink-0 items-center gap-1.5 text-[12px] text-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft size={13} />
              Back to Learn
            </Link>
            <span className="text-border-strong shrink-0">·</span>
            <div className="min-w-0">
              <span className="mono text-[10px] font-bold uppercase tracking-widest text-accent">
                Lesson {String(lesson.index).padStart(2, "0")}
              </span>
              <span className="ml-2 text-[13px] font-medium text-foreground truncate">{lesson.title}</span>
            </div>
          </div>
          <LessonTabNav lessonId={lessonId} />
        </div>
      </div>

      {/* Page content fills the remaining space */}
      <div className="flex flex-1 min-h-0 flex-col">
        {children}
      </div>
    </div>
  );
}
