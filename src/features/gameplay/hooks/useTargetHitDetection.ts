/**
 * useTargetHitDetection Hook
 * 
 * Hook ini mendeteksi apakah target combat terkena hit oleh pose user.
 * 
 * Fungsi:
 * - Mengecek apakah salah satu landmark (tangan/kaki) berada dalam radius target
 * - Hanya mendeteksi hit jika target sedang aktif
 * - Menggunakan visibility threshold untuk memastikan landmark terdeteksi dengan baik
 * 
 * Digunakan di halaman /game untuk menentukan apakah user berhasil menghit target.
 */

"use client";

import { useMemo } from "react";

import type { CombatTarget } from "@/features/gameplay/types/combat.types";
import type { PoseLandmarksFrame } from "@/features/vision";

/**
 * TargetHitResult
 * 
 * Hasil deteksi hit target.
 */
interface TargetHitResult {
  isHit: boolean;              // Apakah target terkena hit
  hitLandmarkIndex: number | null;  // Index landmark yang mengenai target (15/16 = tangan, 27/28 = kaki)
}

// Radius default target dalam koordinat normalized (0-1)
const DEFAULT_TARGET_RADIUS_NORM = 0.06;

// Minimum visibility landmark untuk dianggap valid (0.6 = 60%)
const MIN_VISIBILITY = 0.6;

/**
 * Index landmark yang digunakan untuk deteksi hit
 * 
 * MediaPipe Pose landmark indices:
 * - 15, 16: Left/Right wrist (tangan)
 * - 27, 28: Left/Right ankle (kaki)
 */
const HIT_LANDMARK_INDICES = [
  15, 16, // wrists (hands)
  27, 28, // ankles (feet)
] as const;

/**
 * distance2d
 * 
 * Menghitung jarak Euclidean antara dua titik 2D.
 * 
 * @param a - Titik pertama {x, y}
 * @param b - Titik kedua {x, y}
 * @returns Jarak antara dua titik
 */
function distance2d(a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * useTargetHitDetection
 * 
 * Hook untuk mendeteksi apakah target terkena hit oleh pose user.
 * 
 * @param poseFrame - Frame pose saat ini dari MediaPipe
 * @param activeTarget - Target yang sedang aktif
 * @param targetRadiusNorm - Radius target dalam koordinat normalized (default: 0.06)
 * @returns Object berisi status hit dan index landmark yang mengenai
 */
export function useTargetHitDetection(
  poseFrame: PoseLandmarksFrame | null,
  activeTarget: CombatTarget | null,
  targetRadiusNorm: number = DEFAULT_TARGET_RADIUS_NORM
): TargetHitResult {
  return useMemo(() => {
    // Return false jika tidak ada pose frame atau target
    if (!poseFrame) return { isHit: false, hitLandmarkIndex: null };
    if (!activeTarget) return { isHit: false, hitLandmarkIndex: null };
    
    // Hanya deteksi hit jika target masih aktif (bukan missed/hit)
    if (activeTarget.state !== "active") return { isHit: false, hitLandmarkIndex: null };

    const targetPos = activeTarget.position;

    // Cek setiap landmark yang bisa mengenai target
    for (const index of HIT_LANDMARK_INDICES) {
      const landmark = poseFrame.landmarks[index];
      if (!landmark) continue;
      
      // Skip jika landmark visibility terlalu rendah
      const visibility = landmark.visibility ?? 0;
      if (visibility < MIN_VISIBILITY) continue;

      // Hitung jarak antara landmark dan posisi target
      const d = distance2d({ x: landmark.x, y: landmark.y }, targetPos);
      
      // Jika jarak <= radius, target terkena hit
      if (d <= targetRadiusNorm) {
        return { isHit: true, hitLandmarkIndex: index };
      }
    }

    // Tidak ada landmark yang mengenai target
    return { isHit: false, hitLandmarkIndex: null };
  }, [activeTarget, poseFrame, targetRadiusNorm]);
}

