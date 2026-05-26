import { create } from "zustand";

import type { HudHintSeverity, SceneId, StoryState, TargetWaveConfig, WaveIntensity } from "./types";

interface StoryStore extends StoryState {
  setScene: (id: SceneId) => void;
  setChapter: (id: string, objective: string, durationMs?: number) => void;
  appendNarrative: (text: string, speaker?: "Sensei" | "System") => void;
  setStreamingNarrative: (text: string) => void;
  flushStreamingToLog: () => void;
  setDirectorBusy: (busy: boolean) => void;
  adjustDifficulty: (delta: number) => void;
  setTargetWave: (patternId: string, intensity: WaveIntensity) => void;
  setHudHint: (text: string, severity: HudHintSeverity) => void;
  clearHudHint: () => void;
  setActiveCombo: (comboName: string | null) => void;
  setAutoSceneEnabled: (enabled: boolean) => void;
  updateScore: (score: number) => void;
  reset: () => void;
}

const INITIAL_STATE: StoryState = {
  currentChapterId: "chapter_1",
  currentSceneId: "dojo_start",
  objective: "Prepare your stance and await the first strike.",
  chapterDurationMs: null,
  narrativeLog: [],
  streamingNarrative: "",
  isDirectorBusy: false,
  difficultyMultiplier: 1,
  sessionScore: 0,
  targetWave: null,
  hudHint: null,
  activeComboName: null,
  autoSceneEnabled: true,
};

export const useStoryStore = create<StoryStore>((set, get) => ({
  ...INITIAL_STATE,

  setScene: (id) => set({ currentSceneId: id }),

  setChapter: (id, objective, durationMs) =>
    set({
      currentChapterId: id,
      objective,
      chapterDurationMs: durationMs ?? null,
    }),

  appendNarrative: (text, speaker = "Sensei") => {
    const trimmed = text.trim();
    if (!trimmed) return;
    set((state) => ({
      narrativeLog: [
        ...state.narrativeLog,
        { timestamp: Date.now(), text: trimmed, speaker },
      ].slice(-50),
    }));
  },

  setStreamingNarrative: (text) => set({ streamingNarrative: text }),

  flushStreamingToLog: () => {
    const { streamingNarrative } = get();
    const trimmed = streamingNarrative.trim();
    if (!trimmed) {
      set({ streamingNarrative: "" });
      return;
    }
    get().appendNarrative(trimmed, "Sensei");
    set({ streamingNarrative: "" });
  },

  setDirectorBusy: (busy) => set({ isDirectorBusy: busy }),

  adjustDifficulty: (delta) =>
    set((state) => ({
      difficultyMultiplier: Math.max(0.5, Math.min(2, state.difficultyMultiplier + delta)),
    })),

  setTargetWave: (patternId, intensity) =>
    set({
      targetWave: { patternId, intensity } satisfies TargetWaveConfig,
    }),

  setHudHint: (text, severity) => set({ hudHint: { text, severity } }),

  clearHudHint: () => set({ hudHint: null }),

  setActiveCombo: (comboName) => set({ activeComboName: comboName }),

  setAutoSceneEnabled: (enabled) => set({ autoSceneEnabled: enabled }),

  updateScore: (score) => set({ sessionScore: score }),

  reset: () => set({ ...INITIAL_STATE }),
}));
