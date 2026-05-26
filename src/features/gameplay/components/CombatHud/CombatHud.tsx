/**
 * CombatHud Component
 * 
 * Komponen ini merender HUD (Heads-Up Display) untuk sesi combat.
 * 
 * Fungsi:
 * - Menampilkan waktu tersisa dalam detik
 * - Menampilkan progress bar sesi
 * - Menampilkan skor saat ini
 * - Menampilkan jumlah hits dan misses
 * - Menampilkan streak terbaik dalam sesi
 * 
 * Digunakan di halaman /game untuk menampilkan statistik combat secara real-time.
 */

import type { ReactElement } from "react";

import styles from "./CombatHud.module.css";

/**
 * CombatHudProps
 * 
 * Props yang diterima oleh komponen ini.
 */
interface CombatHudProps {
  timeLeftSeconds: number;  // Waktu tersisa dalam detik
  progress: number;         // Progress sesi (0-1)
  score: number;            // Skor saat ini
  hits: number;             // Jumlah target berhasil dihit
  misses: number;           // Jumlah target terlewat
  bestStreak: number;       // Streak terbaik dalam sesi
}

/**
 * CombatHud
 * 
 * Komponen untuk merender HUD combat.
 * 
 * @param props - Props untuk komponen
 * @returns Element React
 */
export function CombatHud({
  timeLeftSeconds,
  progress,
  score,
  hits,
  misses,
  bestStreak,
}: CombatHudProps): ReactElement {
  // Konversi progress (0-1) ke persentase (0-100)
  const progressPercent = Math.round(progress * 100);

  return (
    <div className={styles.hud} aria-label="Combat HUD">
      {/* Waktu tersisa */}
      <div className={styles.row}>
        <p className={styles.label}>Time left</p>
        <p className={styles.value}>{timeLeftSeconds}s</p>
      </div>

      {/* Progress bar sesi */}
      <div className={styles.progressTrack} aria-label="Session progress">
        <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Skor */}
      <div className={styles.row}>
        <p className={styles.label}>Score</p>
        <p className={styles.value}>{score}</p>
      </div>

      {/* Hits dan misses */}
      <div className={styles.row}>
        <p className={styles.label}>Hits / Misses</p>
        <p className={styles.value}>
          {hits} / {misses}
        </p>
      </div>

      {/* Streak terbaik */}
      <div className={styles.row}>
        <p className={styles.label}>Best streak</p>
        <p className={styles.value}>{bestStreak}</p>
      </div>
    </div>
  );
}

