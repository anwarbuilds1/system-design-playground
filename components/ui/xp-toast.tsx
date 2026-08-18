"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

export function XpToast({ amount, onDone }: { amount: number; onDone: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = requestAnimationFrame(() => setVisible(true));
    const hide = setTimeout(() => setVisible(false), 2400);
    const remove = setTimeout(onDone, 2800);
    return () => {
      cancelAnimationFrame(show);
      clearTimeout(hide);
      clearTimeout(remove);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-accent/40 bg-surface px-4 py-3 shadow-[0_0_30px_rgba(52,211,153,0.15)] transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <Sparkles size={16} className="text-accent" />
      <span className="mono text-sm font-medium text-accent">+{amount} XP</span>
    </div>
  );
}
