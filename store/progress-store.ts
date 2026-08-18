"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BADGES, getLevelInfo } from "@/lib/gamification";

interface LessonCompletion {
  lessonId: string;
  bestScore: number;
}
interface ChallengeCompletion {
  challengeId: string;
  bestScore: number;
}

interface ProgressState {
  xp: number;
  lessonCompletions: LessonCompletion[];
  challengeCompletions: ChallengeCompletion[];
  badges: string[];
  lastXpGain: number | null;

  addXp: (amount: number) => void;
  clearXpGainFlag: () => void;
  completeLesson: (lessonId: string, score: number, xpReward: number) => { xpAwarded: number; leveledUp: boolean };
  completeChallenge: (challengeId: string, score: number, xpReward: number) => { xpAwarded: number };
  awardBadge: (badgeId: string) => boolean;
  bestScore: () => number;
  reset: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      xp: 0,
      lessonCompletions: [],
      challengeCompletions: [],
      badges: [],
      lastXpGain: null,

      addXp: (amount) => set((s) => ({ xp: s.xp + amount, lastXpGain: amount })),
      clearXpGainFlag: () => set({ lastXpGain: null }),

      completeLesson: (lessonId, score, xpReward) => {
        const before = getLevelInfo(get().xp).level;
        const existing = get().lessonCompletions.find((l) => l.lessonId === lessonId);
        const xpAwarded = existing ? Math.round(xpReward * 0.25) : xpReward;
        set((s) => ({
          xp: s.xp + xpAwarded,
          lastXpGain: xpAwarded,
          lessonCompletions: existing
            ? s.lessonCompletions.map((l) =>
                l.lessonId === lessonId ? { ...l, bestScore: Math.max(l.bestScore, score) } : l,
              )
            : [...s.lessonCompletions, { lessonId, bestScore: score }],
        }));
        const after = getLevelInfo(get().xp).level;
        return { xpAwarded, leveledUp: after > before };
      },

      completeChallenge: (challengeId, score, xpReward) => {
        const existing = get().challengeCompletions.find((c) => c.challengeId === challengeId);
        const xpAwarded = existing ? Math.round(xpReward * 0.25) : xpReward;
        set((s) => ({
          xp: s.xp + xpAwarded,
          lastXpGain: xpAwarded,
          challengeCompletions: existing
            ? s.challengeCompletions.map((c) =>
                c.challengeId === challengeId ? { ...c, bestScore: Math.max(c.bestScore, score) } : c,
              )
            : [...s.challengeCompletions, { challengeId, bestScore: score }],
        }));
        return { xpAwarded };
      },

      awardBadge: (badgeId) => {
        if (get().badges.includes(badgeId)) return false;
        if (!BADGES.find((b) => b.id === badgeId)) return false;
        set((s) => ({ badges: [...s.badges, badgeId] }));
        return true;
      },

      bestScore: () => {
        const all = [...get().lessonCompletions.map((l) => l.bestScore), ...get().challengeCompletions.map((c) => c.bestScore)];
        return all.length ? Math.max(...all) : 0;
      },

      reset: () => set({ xp: 0, lessonCompletions: [], challengeCompletions: [], badges: [], lastXpGain: null }),
    }),
    { name: "sdp-progress" },
  ),
);
