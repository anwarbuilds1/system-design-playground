"use client";

import { AlertCircle } from "lucide-react";
import type { ValidationResult } from "@/lib/simulation/validators";

export function ValidationErrors({ validation }: { validation: ValidationResult }) {
  if (validation.issues.length === 0) return null;
  return (
    <div className="animate-fade-up rounded-xl border border-warning/30 bg-warning/5 p-4">
      <div className="mb-2 flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-wide text-warning">
        <AlertCircle size={13} />
        {validation.valid ? "Warnings" : "Fix these before running the simulation"}
      </div>
      <ul className="space-y-1">
        {validation.issues.map((issue, idx) => (
          <li key={idx} className="text-[13px] text-foreground/85">
            {issue.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
