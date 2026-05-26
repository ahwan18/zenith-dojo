/**
 * CombatSessionLayout Component
 * 
 * Komponen layout untuk sesi combat.
 * 
 * Fungsi:
 * - Menyusun layout sesi combat dengan top bar, left HUD, center area, right HUD, dan sensei rail
 * - Menyediakan tombol "End Session" untuk mengakhiri sesi
 * - Menggunakan CSS Grid/Flexbox untuk layout responsif
 * 
 * Digunakan di halaman /game sebagai wrapper utama untuk UI combat.
 */

"use client";

import type { ReactElement, ReactNode } from "react";

import styles from "./combatSessionLayout.module.css";

/**
 * CombatSessionLayoutProps
 * 
 * Props yang diterima oleh komponen ini.
 */
interface CombatSessionLayoutProps {
  topBar: ReactNode;           // Komponen top bar (navigation)
  leftHud: ReactNode;          // Komponen HUD kiri (HP, timer, streak)
  center: ReactNode;           // Komponen center (arena combat)
  rightHud: ReactNode;         // Komponen HUD kanan (score, accuracy)
  senseiRail: ReactNode;       // Komponen sensei rail (AI feedback)
  onEndSession: () => void;    // Callback saat tombol End Session diklik
}

/**
 * CombatSessionLayout
 * 
 * Komponen layout utama untuk sesi combat.
 * 
 * @param props - Props untuk komponen
 * @returns Element React
 */
export function CombatSessionLayout({
  topBar,
  leftHud,
  center,
  rightHud,
  senseiRail,
  onEndSession,
}: CombatSessionLayoutProps): ReactElement {
  return (
    <div className={styles.root}>
      {/* Top bar navigation */}
      {topBar}
      
      {/* Body layout dengan left HUD, center, dan right HUD */}
      <div className={styles.body}>
        {leftHud}
        <div className={styles.center}>
          <div className={styles.centerInner}>
            {/* Area center untuk arena combat */}
            {center}
            
            {/* Tombol End Session */}
            <div className={styles.endSessionWrap}>
              <button type="button" className={styles.endSessionButton} onClick={onEndSession}>
                End Session
              </button>
            </div>
          </div>
          
          {/* Bottom rail untuk sensei feedback */}
          <div className={styles.bottomRail}>{senseiRail}</div>
        </div>
        {rightHud}
      </div>
    </div>
  );
}
