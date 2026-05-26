/**
 * useTargetSpawner Hook
 * 
 * Hook ini mengelola spawning target combat secara dinamis.
 * 
 * Fungsi:
 * - Menspawn target dengan posisi dan label random
 * - Menghitung lifetime dan spawn delay berdasarkan accuracy, difficulty, dan waktu sesi
 * - Mengimplementasikan "Sensei Pattern" untuk challenge player (target muncul di zona tertentu)
 * - Mendukung wave intensity dari story untuk scaling difficulty
 * - Otomatis menandai target sebagai missed jika tidak dihit dalam lifetime
 * 
 * Digunakan di halaman /game untuk menampilkan target yang harus dihit user.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { useGameplayStore } from "@/features/gameplay/stores/gameplayStore";
import { useStoryStore } from "@/features/story/store";
import type { WaveIntensity } from "@/features/story/types";

import type { CombatTarget } from "@/features/gameplay/types/combat.types";

/**
 * UseTargetSpawnerParams
 * 
 * Parameter input untuk hook ini.
 */
interface UseTargetSpawnerParams {
  isRunning: boolean;           // Apakah sesi sedang berjalan
  timeLeftMs: number;          // Waktu tersisa dalam sesi
  /** Session length used to ramp spawn speed / lifetime (classic 90s, time attack 60s). */
  sessionDurationMs?: number;  // Durasi sesi dalam milidetik (default: 90_000)
}

/**
 * UseTargetSpawnerResult
 * 
 * Nilai yang dikembalikan oleh hook ini.
 */
interface UseTargetSpawnerResult {
  activeTarget: CombatTarget | null;  // Target yang sedang aktif
  hitActiveTarget: () => boolean;      // Fungsi untuk menghit target aktif
}

// Lifetime target: 1200ms (1.2 detik) di awal sesi
const BASE_TARGET_LIFETIME_MS = 1200;

// Minimum lifetime target: 600ms (0.6 detik) di akhir sesi
const MIN_TARGET_LIFETIME_MS = 600;

// Spawn delay: 450ms di awal sesi
const BASE_SPAWN_DELAY_MS = 450;

// Minimum spawn delay: 200ms di akhir sesi
const MIN_SPAWN_DELAY_MS = 200;

/**
 * Label zona yang bisa muncul pada target
 * 
 * Ini menentukan bagian tubuh mana yang harus mengenai target.
 */
const TARGET_ZONE_LABELS = [
  "HEAD",
  "LEFT HAND",
  "RIGHT HAND",
  "LEFT FOOT",
  "RIGHT FOOT",
  "CHEST",
] as const;

/**
 * clamp01
 * 
 * Clamp nilai antara 0 dan 1.
 * 
 * @param value - Nilai yang ingin di-clamp
 * @returns Nilai yang sudah di-clamp
 */
function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * waveIntensityScales
 * 
 * Mengembalikan scaling factor untuk lifetime dan spawn delay berdasarkan wave intensity.
 * 
 * - low: target lebih lama, spawn lebih lambat (lebih mudah)
 * - high: target lebih pendek, spawn lebih cepat (lebih sulit)
 * - medium: normal
 * 
 * @param intensity - Intensity wave dari story
 * @returns Object berisi lifetime dan spawn delay scale
 */
function waveIntensityScales(intensity: WaveIntensity | undefined): {
  lifetime: number;
  spawnDelay: number;
} {
  switch (intensity) {
    case "low":
      return { lifetime: 1.2, spawnDelay: 1.25 };
    case "high":
      return { lifetime: 0.82, spawnDelay: 0.72 };
    case "medium":
    default:
      return { lifetime: 1, spawnDelay: 1 };
  }
}

/**
 * PATTERN_ZONE_MAP
 * 
 * Mapping pattern ID dari story ke zona target yang dipaksa.
 * Digunakan untuk "Sensei Pattern" challenge.
 */
const PATTERN_ZONE_MAP: Record<string, string> = {
  recovery_flow: "CHEST",      // Pattern recovery: target di dada
  pressure_rush: "HEAD",       // Pattern pressure: target di kepala
  flurry_hands: "LEFT HAND",   // Pattern flurry: target di tangan kiri
};

/**
 * createTarget
 * 
 * Membuat target baru dengan posisi random dan label tertentu.
 * 
 * @param nowMs - Timestamp saat ini
 * @param lifetimeMs - Durasi target sebelum expired
 * @param forcedLabel - Label zona yang dipaksa (optional, untuk pattern)
 * @returns Object CombatTarget baru
 */
function createTarget(nowMs: number, lifetimeMs: number, forcedLabel?: string): CombatTarget {
  // Posisi random dalam area safe (10%-90% horizontal, 12%-88% vertical)
  const x = 0.1 + Math.random() * 0.8;
  const y = 0.12 + Math.random() * 0.76;
  
  // Label random jika tidak dipaksa
  const labelIndex = Math.floor(Math.random() * TARGET_ZONE_LABELS.length);
  const label = forcedLabel ?? (TARGET_ZONE_LABELS[labelIndex] ?? "HEAD");
  
  return {
    id: `target_${nowMs}_${Math.round(Math.random() * 1_000_000)}`,
    spawnedAtMs: nowMs,
    expiresAtMs: nowMs + lifetimeMs,
    state: "active",
    label,
    position: { x, y },
  };
}

/**
 * useTargetSpawner
 * 
 * Hook utama untuk mengelola spawning target combat.
 * 
 * @param params - Parameter untuk spawner
 * @returns Object berisi activeTarget dan fungsi hitActiveTarget
 */
export function useTargetSpawner({
  isRunning,
  timeLeftMs,
  sessionDurationMs = 90_000,
}: UseTargetSpawnerParams): UseTargetSpawnerResult {
  // Ambil state dari gameplay store
  const hits = useGameplayStore((state) => state.hits);
  const misses = useGameplayStore((state) => state.misses);
  const difficulty = useGameplayStore((state) => state.difficulty);
  
  // State lokal untuk target aktif
  const [activeTarget, setActiveTarget] = useState<CombatTarget | null>(null);
  
  // Ref untuk timeout dan nilai yang sering diakses
  const missTimeoutRef = useRef<number | null>(null);
  const spawnTimeoutRef = useRef<number | null>(null);
  const timeLeftMsRef = useRef<number>(timeLeftMs);
  const sessionDurationRef = useRef<number>(sessionDurationMs);
  const hitsRef = useRef(hits);
  const missesRef = useRef(misses);
  const difficultyRef = useRef(difficulty);
  
  // Ambil state dari story store untuk wave scaling
  const targetWave = useStoryStore((s) => s.targetWave);
  const storyDifficulty = useStoryStore((s) => s.difficultyMultiplier);
  const waveRef = useRef(targetWave);
  const storyDifficultyRef = useRef(storyDifficulty);
  
  // Ref untuk pattern logic
  const currentPatternLabel = useRef<string | null>(null);
  const patternCount = useRef(0);

  /**
   * Effect: Update story refs saat wave berubah
   * 
   - Mengupdate ref untuk wave dan story difficulty
   * - Jika wave memiliki patternId, set pattern label dan count
   */
  useEffect(() => {
    waveRef.current = targetWave;
    storyDifficultyRef.current = storyDifficulty;
    if (targetWave?.patternId && PATTERN_ZONE_MAP[targetWave.patternId]) {
      currentPatternLabel.current = PATTERN_ZONE_MAP[targetWave.patternId];
      patternCount.current = 4;
    }
  }, [storyDifficulty, targetWave]);

  /**
   * Effect: Update timeLeftMs ref
   */
  useEffect(() => {
    timeLeftMsRef.current = timeLeftMs;
  }, [timeLeftMs]);

  /**
   * Effect: Update sessionDuration ref
   */
  useEffect(() => {
    sessionDurationRef.current = Math.max(1, sessionDurationMs);
  }, [sessionDurationMs]);

  /**
   * Effect: Update gameplay stats refs
   */
  useEffect(() => {
    hitsRef.current = hits;
    missesRef.current = misses;
    difficultyRef.current = difficulty;
  }, [difficulty, hits, misses]);

  /**
   * computeTargetLifetimeMs
   * 
   * Menghitung lifetime target berdasarkan:
   * - Waktu sesi (semakin lama sesi, lifetime semakin pendek)
   * - Accuracy player (semakin akurat, lifetime semakin pendek)
   * - Difficulty (semakin sulit, lifetime semakin pendek)
   * - Wave intensity (dari story)
   * - Story difficulty multiplier
   * 
   * @returns Lifetime target dalam milidetik
   */
  const computeTargetLifetimeMs = () => {
    const duration = sessionDurationRef.current;
    const timeNormalized = clamp01(1 - timeLeftMsRef.current / duration);

    // AI Dynamic Adjustment: Scale based on player accuracy
    const h = hitsRef.current;
    const m = missesRef.current;
    const d = difficultyRef.current;
    const accuracy = h === 0 && m === 0 ? 1 : h / (h + m);
    const accuracyScale = 1 + (accuracy - 0.5) * 0.4; // 0.3x to 1.3x scale
    const diffScale = 1 - (d * 0.05); // each diff point removes 5% lifetime

    const waveScale = waveIntensityScales(waveRef.current?.intensity);
    const storyScale = storyDifficultyRef.current;
    const baseScaled = BASE_TARGET_LIFETIME_MS - timeNormalized * (BASE_TARGET_LIFETIME_MS - MIN_TARGET_LIFETIME_MS);
    return Math.round(baseScaled * accuracyScale * diffScale * waveScale.lifetime * storyScale);
  };

  /**
   * computeSpawnDelayMs
   * 
   * Menghitung spawn delay berdasarkan:
   * - Waktu sesi (semakin lama sesi, spawn semakin cepat)
   * - Accuracy player (semakin akurat, spawn semakin cepat)
   * - Difficulty (semakin sulit, spawn semakin cepat)
   * - Wave intensity (dari story)
   * - Story difficulty multiplier
   * 
   * @returns Spawn delay dalam milidetik
   */
  const computeSpawnDelayMs = () => {
    const duration = sessionDurationRef.current;
    const timeNormalized = clamp01(1 - timeLeftMsRef.current / duration);

    // AI Dynamic Adjustment: Scale based on accuracy
    const h = hitsRef.current;
    const m = missesRef.current;
    const d = difficultyRef.current;
    const accuracy = h === 0 && m === 0 ? 1 : h / (h + m);
    const accuracyScale = 1 - (accuracy - 0.5) * 0.3; // higher accuracy = lower delay
    const diffScale = 1 - (d * 0.05);

    const waveScale = waveIntensityScales(waveRef.current?.intensity);
    const storyScale = 2 - storyDifficultyRef.current;
    const baseScaled = BASE_SPAWN_DELAY_MS - timeNormalized * (BASE_SPAWN_DELAY_MS - MIN_SPAWN_DELAY_MS);
    return Math.round(baseScaled * accuracyScale * diffScale * waveScale.spawnDelay * storyScale);
  };

  /**
   * Effect: Main spawner logic
   * 
   * Mengelola spawning target secara otomatis:
   * - Clear timers jika tidak running atau ada target aktif
   * - Schedule spawn target setelah delay
   * - Set timeout untuk auto-miss jika target tidak dihit
   * - Implement pattern logic untuk challenge player
   */
  useEffect(() => {
    const clearTimers = () => {
      if (missTimeoutRef.current !== null) {
        window.clearTimeout(missTimeoutRef.current);
        missTimeoutRef.current = null;
      }
      if (spawnTimeoutRef.current !== null) {
        window.clearTimeout(spawnTimeoutRef.current);
        spawnTimeoutRef.current = null;
      }
    };

    if (!isRunning) {
      clearTimers();
      setActiveTarget(null);
      return () => clearTimers();
    }

    if (activeTarget) return () => clearTimers();

    const scheduleSpawnOnce = () => {
      if (spawnTimeoutRef.current !== null) return;

      const spawnDelayMs = computeSpawnDelayMs();
      spawnTimeoutRef.current = window.setTimeout(() => {
        spawnTimeoutRef.current = null;

        const nowMs = Date.now();
        const targetLifetimeMs = computeTargetLifetimeMs();

        // AI "Sensei Pattern" Logic
        // Every 5 targets, shift to a specific zone for 3 targets to challenge the player
        if (patternCount.current === 0) {
          const zones = ["LEFT HAND", "RIGHT HAND", "LEFT FOOT", "RIGHT FOOT"];
          currentPatternLabel.current = zones[Math.floor(Math.random() * zones.length)];
          patternCount.current = 3;
        } else if (patternCount.current > 0) {
          patternCount.current--;
        } else {
          currentPatternLabel.current = null;
          // Wait a few cycles before next pattern
          patternCount.current = -2;
        }
        if (patternCount.current < 0) patternCount.current++;

        const forcedLabel = currentPatternLabel.current ?? undefined;
        const target = createTarget(nowMs, targetLifetimeMs, forcedLabel);
        setActiveTarget(target);

        // Set timeout untuk auto-miss jika target tidak dihit
        missTimeoutRef.current = window.setTimeout(() => {
          setActiveTarget((current) => {
            if (!current || current.id !== target.id) return current;
            return { ...current, state: "missed" };
          });
        }, targetLifetimeMs);
      }, spawnDelayMs);
    };

    scheduleSpawnOnce();
    return () => clearTimers();
  }, [activeTarget, isRunning]);

  /**
   * hitActiveTarget
   * 
   - Fungsi untuk menghit target aktif.
   * - Clear miss timeout
   * - Set target state menjadi "hit"
   * 
   * @returns true jika berhasil hit, false jika tidak ada target aktif atau sudah hit/missed
   */
  const hitActiveTarget = () => {
    if (!activeTarget || activeTarget.state !== "active") return false;

    if (missTimeoutRef.current !== null) {
      window.clearTimeout(missTimeoutRef.current);
      missTimeoutRef.current = null;
    }

    setActiveTarget((current) => {
      if (!current || current.id !== activeTarget.id) return current;
      return { ...current, state: "hit" };
    });
    return true;
  };

  /**
   * Effect: Clear target after hit/miss animation
   * 
   * Menghapus target setelah 220ms setelah hit/miss untuk animasi.
   */
  useEffect(() => {
    if (!activeTarget) return;
    if (activeTarget.state === "active") return;

    const timeoutId = window.setTimeout(() => {
      setActiveTarget(null);
    }, 220);

    return () => window.clearTimeout(timeoutId);
  }, [activeTarget]);

  return { activeTarget, hitActiveTarget };
}
