/**
 * CombatSessionLeftHud Component
 * 
 * Komponen HUD kiri untuk sesi combat.
 * 
 * Fungsi:
 * - Menampilkan HP (Health Points) dengan bar dan ticks
 * - Menampilkan waktu tersisa dalam format MM:SS
 * - Menampilkan streak saat ini dengan progress bar
 * - Menampilkan label combo jika ada combo aktif
 * 
 * Digunakan di CombatSessionLayout sebagai HUD kiri.
 */

"use client";

import type { ReactElement } from "react";
import { useMemo } from "react";

import styles from "./combatSessionLayout.module.css";

/**
 * CombatSessionLeftHudProps
 * 
 * Props yang diterima oleh komponen ini.
 */
interface CombatSessionLeftHudProps {
  hpPercent: number;           // Persentase HP (0-100)
  timeLeftSeconds: number;      // Waktu tersisa dalam detik
  currentStreak: number;        // Streak saat ini
  activeCombo: string | null;   // Label combo aktif (jika ada)
}

/**
 * formatTime
 * 
 * Memformat total detik menjadi format MM:SS.
 * 
 * @param totalSeconds - Total detik
 * @returns String format waktu MM:SS
 */
function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

/**
 * CombatSessionLeftHud
 * 
 * Komponen HUD kiri untuk menampilkan HP, timer, dan streak.
 * 
 * @param props - Props untuk komponen
 * @returns Element React
 */
export function CombatSessionLeftHud({
  hpPercent,
  timeLeftSeconds,
  currentStreak,
  activeCombo,
}: CombatSessionLeftHudProps): ReactElement {
  // Clamp HP antara 0 dan 100
  const clampedHp = Math.min(100, Math.max(0, hpPercent));
  
  // Array ticks untuk HP (8 ticks)
  const ticks = useMemo(() => [0, 1, 2, 3, 4, 5, 6, 7], []);
  
  // Hitung berapa ticks yang harus di-fill berdasarkan HP
  const filledTickCount = Math.round((clampedHp / 100) * ticks.length);

  // Label streak: gunakan active combo jika ada, atau hit streak jika >= 2
  const streakLabel = activeCombo ?? (currentStreak >= 2 ? `${currentStreak} HIT STREAK` : "STREAK");
  
  // Persentase fill untuk streak bar (max 12 hits = 100%)
  const streakFillPct = Math.min(100, (currentStreak / 12) * 100);

  return (
    <aside className={styles.asideLeft} aria-label="Combat status">
      {/* HP Block */}
      <div className={styles.hpBlock}>
        <div className={styles.hpHeader}>
          <h2 className={styles.hpTitle}>HP</h2>
          <p className={styles.hpPercent}>{Math.round(clampedHp)}%</p>
        </div>
        
        {/* HP Bar */}
        <div className={styles.hpTrack} aria-hidden>
          <div
            className={styles.hpFill}
            style={{ transform: `scaleX(${clampedHp / 100})` }}
          />
        </div>
        
        {/* HP Ticks */}
        <div className={styles.hpTicks} aria-hidden>
          {ticks.map((i) => (
            <span key={i} className={i < filledTickCount ? styles.hpTickOn : styles.hpTickOff} />
          ))}
        </div>
      </div>

      {/* Timer Row */}
      <div className={styles.timerRow}>
        <p className={styles.timerLabel}>Time Remaining</p>
        <p className={styles.timerValue}>{formatTime(timeLeftSeconds)}</p>
      </div>

      {/* Streak Block */}
      <div className={styles.streakBlock}>
        <p className={styles.streakLabel}>{streakLabel}</p>
        <div className={styles.streakRow}>
          <p className={styles.streakValue}>{currentStreak}</p>
          <p className={styles.streakCombo}>COMBO</p>
        </div>
        
        {/* Streak Progress Bar */}
        <div className={styles.streakTrack} aria-hidden>
          <div className={styles.streakFill} style={{ width: `${streakFillPct}%` }} />
        </div>
      </div>
    </aside>
  );
}
