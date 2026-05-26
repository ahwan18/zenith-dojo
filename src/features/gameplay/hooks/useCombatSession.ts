/**
 * useCombatSession Hook
 * 
 * Hook ini mengelola timer sesi combat.
 * 
 * Fungsi:
 * - Memulai sesi saat status idle
 * - Mengupdate timer setiap 250ms (TICK_MS)
 * - Otomatis mengakhiri sesi saat waktu habis
 * - Menghitung progress bar dan waktu tersisa dalam detik
 * 
 * Digunakan di halaman /game untuk menampilkan timer dan progress bar.
 */

"use client";

import { useEffect, useMemo } from "react";

import { useGameplayStore } from "@/features/gameplay/stores/gameplayStore";

/**
 * UseCombatSessionResult
 * 
 * Nilai yang dikembalikan oleh hook ini.
 */
interface UseCombatSessionResult {
  isRunning: boolean;      // Apakah sesi sedang berjalan
  timeLeftMs: number;       // Waktu tersisa dalam milidetik
  timeLeftSeconds: number;  // Waktu tersisa dalam detik (dibulatkan ke atas)
  progress: number;         // Progress sesi (0 = mulai, 1 = selesai)
}

// Durasi default sesi: 60 detik
const DEFAULT_SESSION_DURATION_MS = 60_000;

// Interval update timer: 250ms (4 update per detik)
const TICK_MS = 250;

/**
 * useCombatSession
 * 
 * Hook utama untuk mengelola timer sesi combat.
 * 
 * @param durationMs - Durasi sesi dalam milidetik (default: 60_000)
 * @returns Object berisi status timer dan progress
 */
export function useCombatSession(durationMs: number = DEFAULT_SESSION_DURATION_MS): UseCombatSessionResult {
  // Ambil state dan actions dari gameplay store
  const gamePhase = useGameplayStore((state) => state.gamePhase);
  const timeLeftMs = useGameplayStore((state) => state.timeLeftMs);
  const endsAtMs = useGameplayStore((state) => state.endsAtMs);
  const startCombatSession = useGameplayStore((state) => state.startCombatSession);
  const tickCombatSession = useGameplayStore((state) => state.tickCombatSession);
  const endCombatSession = useGameplayStore((state) => state.endCombatSession);

  /**
   * Effect 1: Auto-start session
   * 
   * Memulai sesi secara otomatis saat status masih "idle".
   * Ini memastikan sesi langsung dimulai saat user masuk ke halaman game.
   */
  useEffect(() => {
    if (gamePhase === "playing") return;
    if (gamePhase === "finished") return;
    if (gamePhase === "paused") return;
    startCombatSession(durationMs);
  }, [durationMs, gamePhase, startCombatSession]);

  /**
   * Effect 2: Timer tick
   * 
   * Mengupdate timer setiap TICK_MS (250ms) saat sesi sedang running.
   * Memanggil tickCombatSession() untuk mengurangi timeLeftMs.
   */
  useEffect(() => {
    if (gamePhase !== "playing") return;

    const intervalId = window.setInterval(() => {
      tickCombatSession(TICK_MS);
    }, TICK_MS);

    return () => window.clearInterval(intervalId);
  }, [gamePhase, tickCombatSession]);

  /**
   * Effect 3: Auto-end session
   * 
   - Mengakhiri sesi secara otomatis saat waktu habis (timeLeftMs <= 0).
   * Memanggil endCombatSession() untuk mengubah status menjadi "ended".
   */
  useEffect(() => {
    if (gamePhase !== "playing") return;
    if (!endsAtMs) return;
    if (timeLeftMs > 0) return;
    endCombatSession();
  }, [endCombatSession, endsAtMs, gamePhase, timeLeftMs]);

  /**
   * Hitung waktu tersisa dalam detik
   * 
   * Dibulatkan ke atas (ceil) agar timer tidak terlihat "stuck" di angka yang sama.
   * Contoh: 1500ms → 2 detik, 1001ms → 2 detik, 999ms → 1 detik
   */
  const timeLeftSeconds = useMemo(() => Math.max(0, Math.ceil(timeLeftMs / 1000)), [timeLeftMs]);

  /**
   * Hitung progress sesi
   * 
   * Progress dihitung sebagai: 1 - (timeLeftMs / durationMs)
   * - 0 = sesi baru mulai
   * - 1 = sesi selesai
   * 
   * Diclamp antara 0 dan 1 untuk mencegah nilai di luar range.
   */
  const progress = useMemo(() => {
    if (!endsAtMs) return 0;
    return Math.min(1, Math.max(0, 1 - timeLeftMs / durationMs));
  }, [durationMs, endsAtMs, timeLeftMs]);

  return {
    isRunning: gamePhase === "playing",
    timeLeftMs,
    timeLeftSeconds,
    progress,
  };
}
