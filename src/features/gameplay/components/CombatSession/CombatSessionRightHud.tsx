/**
 * CombatSessionRightHud Component
 * 
 * Komponen HUD kanan untuk sesi combat.
 * 
 * Fungsi:
 * - Menampilkan skor dengan format 5 digit (00000)
 * - Menampilkan jumlah target yang terlewat
 * - Menampilkan akurasi dalam persentase
 * - Menampilkan visualisasi streak dengan dots (9 dots)
 * 
 * Digunakan di CombatSessionLayout sebagai HUD kanan.
 */

"use client";

import type { ReactElement } from "react";
import { useMemo } from "react";

import styles from "./combatSessionLayout.module.css";

/**
 * CombatSessionRightHudProps
 * 
 * Props yang diterima oleh komponen ini.
 */
interface CombatSessionRightHudProps {
  score: number;           // Skor saat ini
  misses: number;         // Jumlah target terlewat
  hits: number;           // Jumlah target berhasil dihit
  currentStreak: number;  // Streak saat ini
}

/**
 * CombatSessionRightHud
 * 
 * Komponen HUD kanan untuk menampilkan skor dan statistik.
 * 
 * @param props - Props untuk komponen
 * @returns Element React
 */
export function CombatSessionRightHud({
  score,
  misses,
  hits,
  currentStreak,
}: CombatSessionRightHudProps): ReactElement {
  // Format skor menjadi 5 digit dengan leading zeros (00000)
  const scoreDisplay = String(score).padStart(5, "0");
  
  // Hitung total hits + misses
  const total = hits + misses;
  
  // Hitung akurasi dalam persentase (default 100% jika belum ada hit/miss)
  const accuracyPct = total === 0 ? 100 : Math.round((hits / total) * 100);

  // Array 9 dots untuk visualisasi streak
  const dots = useMemo(() => Array.from({ length: 9 }, (_, i) => i), []);
  
  // Hitung berapa dots yang harus dinyalakan (max 9)
  const litDots = Math.min(9, currentStreak);

  return (
    <aside className={styles.asideRight} aria-label="Score and accuracy">
      {/* Score Cluster */}
      <div className={styles.scoreCluster}>
        <p className={styles.scoreLabel}>Score</p>
        <div className={styles.scoreCard}>
          <p className={styles.scoreValue}>{scoreDisplay}</p>
        </div>
      </div>

      {/* Stats Card */}
      <div className={styles.statsCard}>
        {/* Missed Count */}
        <div className={styles.statRow}>
          <p className={styles.statLabel}>Missed</p>
          <p className={styles.statMiss}>{misses}</p>
        </div>
        
        {/* Accuracy Percentage */}
        <div className={styles.statRow}>
          <p className={styles.statLabel}>Accuracy</p>
          <p className={styles.statAccuracy}>{accuracyPct}%</p>
        </div>
        
        {/* Streak Dots */}
        <div className={styles.dots} aria-hidden>
          {dots.map((i) => (
            <span key={i} className={i < litDots ? styles.dotOn : styles.dotOff} />
          ))}
        </div>
      </div>
    </aside>
  );
}
