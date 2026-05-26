/**
 * CombatSessionTopBar Component
 * 
 * Komponen top bar untuk sesi combat.
 * 
 * Fungsi:
 * - Menampilkan brand "ZENITH"
 * - Menyediakan tombol back ke mode select
 * - Menyediakan tombol pause (disabled, coming soon)
 * - Menyediakan tombol ke session summary
 * 
 * Digunakan di CombatSessionLayout sebagai header navigation.
 */

"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { ArrowLeft, Pause, User } from "lucide-react";

import styles from "./combatSessionLayout.module.css";

/**
 * CombatSessionTopBar
 * 
 * Komponen top bar untuk navigasi sesi combat.
 * 
 * @returns Element React
 */
export function CombatSessionTopBar(): ReactElement {
  return (
    <header className={styles.topBar}>
      {/* Left side: back button dan brand */}
      <div className={styles.topLeft}>
        <Link href="/choose-mode" className={styles.backButton} aria-label="Back to mode select">
          <ArrowLeft size={22} strokeWidth={2} aria-hidden />
        </Link>
        <p className={styles.brand}>ZENITH</p>
      </div>
      
      {/* Right side: pause button dan session summary */}
      <div className={styles.topRight}>
        <button type="button" className={styles.iconButton} disabled aria-label="Pause (coming soon)">
          <Pause size={20} strokeWidth={2} aria-hidden />
        </button>
        <Link href="/session" className={styles.iconButton} aria-label="Session summary">
          <User size={20} strokeWidth={2} aria-hidden />
        </Link>
      </div>
    </header>
  );
}
