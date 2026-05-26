/**
 * Gameplay Store - Zustand Store
 *
 * File ini mengelola seluruh state global yang terkait dengan gameplay combat.
 * State ini mencakup konfigurasi game, status sesi, skor, HP, combo, difficulty, dan statistik.
 *
 * Menggunakan Zustand dengan persist middleware untuk menyimpan difficulty ke localStorage.
 */

import { create } from "zustand";
import type { StateCreator } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { BodyMode, GameMode, GamePhase, GameplayData, TrackingStatus } from "../types/combat.types";

// Type untuk delta difficulty yang diterima dari AI Sensei
type DifficultyDelta = -1 | 0 | 1;

/**
 * Interface GameplayStore
 *
 * Mendefinisikan seluruh state dan actions yang tersedia di gameplay store.
 */
interface GameplayStore {
  // Game Configuration
  gameMode: GameMode | null;
  bodyMode: BodyMode | null;
  timeDuration: number | null;
  gamePhase: GamePhase;
  levelData: GameplayData | null;

  // Gameplay State
  currentScore: number;
  playerHealth: number;
  activeCombo: string | null;
  difficulty: number;
  trackingStatus: TrackingStatus;
  lastPoseTimestamp: number | null;
  recoveryStartedAtMs: number | null;
  multiplier: number;
  isHorseStanceCharging: boolean;
  lastGesture: "punch" | "squat" | "horseStance" | null;
  startedAtMs: number | null;
  endsAtMs: number | null;
  timeLeftMs: number;
  hits: number;
  misses: number;
  currentStreak: number;
  bestStreak: number;
  showSkeleton: boolean;

  // Actions
  setGameMode: (mode: GameMode) => void;
  setBodyMode: (mode: BodyMode) => void;
  setTimeDuration: (duration: number | null) => void;
  setGamePhase: (phase: GamePhase) => void;
  setLevelData: (data: GameplayData | null) => void;
  updateTrackingStatus: (isPoseValid: boolean) => void;
  setActiveCombo: (comboName: string | null) => void;
  addScore: (delta: number) => void;
  applyDifficultyDelta: (delta: DifficultyDelta) => void;
  startCombatSession: (durationMs: number) => void;
  tickCombatSession: (deltaMs: number) => void;
  endCombatSession: () => void;
  registerHit: (hitType: "normal" | "fast") => void;
  registerMiss: () => void;
  registerPunch: () => void;
  registerSquatDodge: () => void;
  startHorseStanceCharge: () => void;
  stopHorseStanceCharge: () => void;
  resetSession: () => void;
  toggleSkeleton: () => void;
}

/**
 * Initial State
 *
 * Nilai awal untuk seluruh state gameplay store.
 */
const initialState = {
  gameMode: null,
  bodyMode: null,
  timeDuration: null,
  gamePhase: "idle" as GamePhase,
  levelData: null,
  currentScore: 0,
  playerHealth: 100,
  activeCombo: null,
  difficulty: 0,
  trackingStatus: "ok" as TrackingStatus,
  lastPoseTimestamp: null,
  recoveryStartedAtMs: null,
  multiplier: 1,
  isHorseStanceCharging: false,
  lastGesture: null,
  startedAtMs: null,
  endsAtMs: null,
  timeLeftMs: 0,
  hits: 0,
  misses: 0,
  currentStreak: 0,
  bestStreak: 0,
  showSkeleton: true,
} as const;

/**
 * Store Initializer
 *
 * Fungsi yang menginisialisasi store dengan initialState dan mendefinisikan semua actions.
 */
const storeInitializer: StateCreator<GameplayStore> = (set) => ({
  ...initialState,

  // --- Configuration Actions ---
  setGameMode: (mode) => set({ gameMode: mode }),
  setBodyMode: (mode) => set({ bodyMode: mode }),
  setTimeDuration: (duration) => set({ timeDuration: duration }),
  setGamePhase: (phase) => set({ gamePhase: phase }),
  setLevelData: (data: GameplayData | null) => set({ levelData: data }),
  updateTrackingStatus: (isPoseValid) =>
    set((state) => {
      const now = Date.now();

      if (isPoseValid) {
        const lastPoseTimestamp = now;

        if (state.trackingStatus === "soft_pause") {
          return { trackingStatus: "ok", lastPoseTimestamp, recoveryStartedAtMs: null };
        }

        if (state.trackingStatus === "hard_pause") {
          const recoveryStartedAtMs = state.recoveryStartedAtMs ?? now;
          if (now - recoveryStartedAtMs >= 1000) {
            return { trackingStatus: "ok", lastPoseTimestamp, recoveryStartedAtMs: null };
          }
          return { lastPoseTimestamp, recoveryStartedAtMs };
        }

        return { lastPoseTimestamp, recoveryStartedAtMs: null };
      } else {
        if (state.trackingStatus === "hard_pause") return state;

        const lastPoseTimestamp = state.lastPoseTimestamp;
        if (!lastPoseTimestamp) return state;

        const diff = now - lastPoseTimestamp;
        let nextStatus: TrackingStatus = state.trackingStatus;

        if (diff > 3000) {
          nextStatus = "hard_pause";
        } else if (diff > 1000) {
          nextStatus = "soft_pause";
        }

        return { trackingStatus: nextStatus, recoveryStartedAtMs: null };
      }
    }),

  // --- Gameplay Actions ---
  setActiveCombo: (comboName) => set({ activeCombo: comboName }),
  addScore: (delta) => set((state) => ({ currentScore: Math.max(0, state.currentScore + delta) })),
  applyDifficultyDelta: (delta) =>
    set((state) => ({ difficulty: Math.max(-5, Math.min(5, state.difficulty + delta)) })),

  startCombatSession: (durationMs) => {
    const nowMs = Date.now();
    set({
      gamePhase: "playing",
      startedAtMs: nowMs,
      endsAtMs: nowMs + durationMs,
      timeLeftMs: durationMs,
      hits: 0,
      misses: 0,
      currentStreak: 0,
      bestStreak: 0,
      currentScore: 0,
      isHorseStanceCharging: false,
      lastGesture: null,
    });
  },

  tickCombatSession: (deltaMs: number) =>
    set((state) => {
      if (state.gamePhase !== "playing") return state;

      let speed = 1;
      if (state.trackingStatus === "soft_pause") speed = 0.5;
      if (state.trackingStatus === "hard_pause") speed = 0;

      const nextTimeLeft = Math.max(0, state.timeLeftMs - (deltaMs * speed));
      return { timeLeftMs: nextTimeLeft };
    }),

  endCombatSession: () =>
    set((state) => {
      if (state.gamePhase !== "playing") return state;
      return { gamePhase: "finished", timeLeftMs: 0 };
    }),

  registerHit: (hitType: "normal" | "fast") =>
    set((state) => {
      const nextStreak = state.currentStreak + 1;

      // Multiplier logic: 3x -> 2x, 5x -> 3x, 10x -> 4x
      let nextMultiplier = 1;
      if (nextStreak >= 10) nextMultiplier = 4;
      else if (nextStreak >= 5) nextMultiplier = 3;
      else if (nextStreak >= 3) nextMultiplier = 2;

      const basePoints = hitType === "fast" ? 150 : 100;
      const finalPoints = basePoints * nextMultiplier;

      return {
        currentScore: state.currentScore + finalPoints,
        hits: state.hits + 1,
        currentStreak: nextStreak,
        bestStreak: Math.max(state.bestStreak, nextStreak),
        multiplier: nextMultiplier,
      };
    }),

  registerMiss: () =>
    set((state) => ({
      misses: state.misses + 1,
      currentStreak: 0,
      multiplier: 1,
    })),

  registerPunch: () =>
    set((state) => (state.lastGesture === "punch" ? state : { lastGesture: "punch" })),

  registerSquatDodge: () =>
    set((state) => (state.lastGesture === "squat" ? state : { lastGesture: "squat" })),

  startHorseStanceCharge: () =>
    set((state) =>
      state.isHorseStanceCharging && state.lastGesture === "horseStance"
        ? state
        : { isHorseStanceCharging: true, lastGesture: "horseStance" }
    ),

  stopHorseStanceCharge: () =>
    set((state) => (state.isHorseStanceCharging ? { isHorseStanceCharging: false } : state)),

  resetSession: () => set({ ...initialState }),

  toggleSkeleton: () => set((state) => ({ showSkeleton: !state.showSkeleton })),
});

/**
 * Export: useGameplayStore
 *
 * Hook yang digunakan untuk mengakses gameplay store di komponen.
 */
export const useGameplayStore = create<GameplayStore>()(
  persist(storeInitializer, {
    name: "zenith_gameplay_store",
    storage: createJSONStorage(() => {
      if (typeof window === "undefined") {
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }
      return window.localStorage;
    }),
    partialize: (state) => ({ difficulty: state.difficulty }),
  })
);
