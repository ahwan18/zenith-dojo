/**
 * CombatArena Component
 * 
 * Komponen ini merender arena combat dengan target yang muncul secara dinamis.
 * 
 * Fungsi:
 * - Menampilkan target di posisi yang ditentukan oleh useTargetSpawner
 * - Menampilkan feedback visual saat target dihit atau terlewat
 * - Menggunakan animasi Framer Motion untuk smooth transitions
 * - Menampilkan hint jika sesi tidak berjalan
 * 
 * Digunakan di halaman /game sebagai area utama untuk menampilkan target combat.
 */

"use client";

import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import type { CombatTarget } from "@/features/gameplay/types/combat.types";

import styles from "./CombatArena.module.css";

/**
 * CombatArenaProps
 * 
 * Props yang diterima oleh komponen ini.
 */
interface CombatArenaProps {
  activeTarget: CombatTarget | null;  // Target yang sedang aktif
  isRunning: boolean;                 // Apakah sesi combat sedang berjalan
}

/**
 * ArenaFeedback
 * 
 * Tipe untuk feedback visual yang ditampilkan.
 */
type ArenaFeedback = "hit" | "miss" | null;

// Flag untuk menampilkan debug info (set ke true untuk debugging)
const SHOW_COMBAT_DEBUG = false;

/**
 * CombatArena
 * 
 * Komponen utama untuk merender arena combat.
 * 
 * @param props - Props untuk komponen
 * @returns Element React
 */
export function CombatArena({ activeTarget, isRunning }: CombatArenaProps): ReactElement {
  // State untuk feedback visual (hit/miss)
  const [feedback, setFeedback] = useState<ArenaFeedback>(null);

  /**
   * targetStyle
   * 
   * Menghitung style CSS untuk posisi target berdasarkan koordinat normalized.
   * Menggunakan transform translate(-50%, -50%) untuk center target pada posisinya.
   */
  const targetStyle = useMemo(() => {
    if (!activeTarget) return null;
    return {
      left: `${Math.round(activeTarget.position.x * 100)}%`,
      top: `${Math.round(activeTarget.position.y * 100)}%`,
      transform: "translate(-50%, -50%)",
    };
  }, [activeTarget]);

  /**
   * Effect: Update feedback saat target state berubah
   * 
   * Menampilkan feedback "hit" atau "miss" saat target state berubah.
   */
  useEffect(() => {
    if (!activeTarget) return;
    if (activeTarget.state === "hit") setFeedback("hit");
    if (activeTarget.state === "missed") setFeedback("miss");
  }, [activeTarget]);

  /**
   * Effect: Clear feedback setelah delay
   * 
   - Menghapus feedback setelah 380ms untuk animasi.
   */
  useEffect(() => {
    if (!feedback) return;
    const timeoutId = window.setTimeout(() => setFeedback(null), 380);
    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  return (
    <div className={styles.arena} aria-label="Combat arena">
      {/* Hint jika sesi tidak berjalan */}
      {!isRunning ? (
        <div className={styles.hint}>
          <p>Combat session is not running.</p>
        </div>
      ) : null}

      {/* Debug info (hanya jika SHOW_COMBAT_DEBUG = true) */}
      {SHOW_COMBAT_DEBUG ? (
        <div className={styles.debug}>
          running={String(isRunning)} · target={activeTarget?.id ?? "none"} · state=
          {activeTarget?.state ?? "none"}
        </div>
      ) : null}

      {/* Feedback visual (hit/miss) */}
      {feedback ? (
        <motion.div
          className={[
            styles.feedback,
            feedback === "hit" ? styles.feedbackHit : styles.feedbackMiss,
          ].join(" ")}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          {feedback === "hit" ? "Perfect!" : "Miss!"}
        </motion.div>
      ) : null}

      {/* Target aktif dengan animasi */}
      {activeTarget && activeTarget.state === "active" ? (
        <motion.div
          className={styles.target}
          style={targetStyle ?? undefined}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 250, damping: 16 }}
        >
          {/* Ring animasi di sekitar target */}
          <motion.div
            className={styles.targetRing}
            animate={{ scale: [1, 1.12, 1], opacity: [0.7, 0.35, 0.7] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          />
        </motion.div>
      ) : null}
    </div>
  );
}
