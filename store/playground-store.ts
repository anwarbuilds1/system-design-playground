"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Architecture } from "@/types/architecture";

export interface SavedArchitecture {
  id: string;
  name: string;
  architecture: Architecture;
  createdAt: number;
}

interface PlaygroundState {
  saved: SavedArchitecture[];
  save: (name: string, architecture: Architecture) => void;
  remove: (id: string) => void;
}

/**
 * Clean repository-style abstraction over persistence. Backed by localStorage
 * for the MVP; swapping this for a Postgres-backed API route later only
 * requires changing this file.
 */
export const usePlaygroundStore = create<PlaygroundState>()(
  persist(
    (set) => ({
      saved: [],
      save: (name, architecture) =>
        set((s) => ({
          saved: [
            { id: `arch-${Date.now()}`, name, architecture, createdAt: Date.now() },
            ...s.saved.filter((a) => a.name !== name),
          ].slice(0, 20),
        })),
      remove: (id) => set((s) => ({ saved: s.saved.filter((a) => a.id !== id) })),
    }),
    { name: "sdp-playground" },
  ),
);
