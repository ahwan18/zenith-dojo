/**
 * useMovementLogic Hook
 * 
 * Hook ini mendeteksi gesture dari pose user menggunakan heuristik geometris.
 * 
 * Fungsi:
 * - Mendeteksi gesture: punch (pukulan), squat (jongkok), horseStance (kuda-kuda)
 * - Menggunakan cooldown untuk mencegah spam deteksi gesture
 * - Menghitung confidence score untuk setiap gesture
 * - Menggunakan kecepatan pergerakan dan rasio geometri untuk deteksi
 * 
 * Digunakan di halaman /game untuk mengenali gerakan user dan memicu action game.
 */

"use client";

import { useMemo, useRef } from "react";
import type { PoseLandmarksFrame } from "@/features/vision";
import type { GestureEvent, GestureThresholds, GestureType } from "@/features/gameplay/types/gameplay.types";

/**
 * UseMovementLogicResult
 * 
 * Nilai yang dikembalikan oleh hook ini.
 */
interface UseMovementLogicResult {
  lastGesture: GestureEvent | null;  // Gesture terakhir yang terdeteksi
  detectGesture: (poseFrame: PoseLandmarksFrame | null) => GestureEvent | null;  // Fungsi untuk mendeteksi gesture
}

/**
 * DEFAULT_THRESHOLDS
 * 
 * Threshold default untuk deteksi gesture.
 * Dapat di-override dengan parameter thresholds.
 */
const DEFAULT_THRESHOLDS: GestureThresholds = {
  minCooldownMs: 300,      // Minimum waktu antar gesture (ms)
  minVisibility: 0.6,      // Minimum visibility landmark untuk dianggap valid
  punch: {
    minExtensionRatio: 0.55,  // Minimum rasio ekstensi lengan (0.55 = 55% dari panjang lengan)
    minWristSpeed: 0.0022,   // Minimum kecepatan pergelangan tangan (normalized per ms)
  },
  squat: {
    maxHipHeightRatio: 0.62,  // Maximum rasio tinggi pinggul untuk squat (0.62 = 62% dari tinggi frame)
  },
  horseStance: {
    minAnkleDistanceRatio: 0.28,  // Minimum rasio jarak antar mata kaki (0.28 = 28% dari lebar bahu)
    maxHipHeightRatio: 0.7,       // Maximum rasio tinggi pinggul (0.7 = 70% dari tinggi frame)
  },
};

/**
 * LandmarkIndex
 * 
 * Type untuk index landmark yang digunakan dalam deteksi gesture.
 * 
 * MediaPipe Pose landmark indices:
 * - 11, 12: Left/Right shoulder
 * - 13, 14: Left/Right elbow
 * - 15, 16: Left/Right wrist
 * - 23, 24: Left/Right hip
 * - 25, 26: Left/Right knee
 * - 27, 28: Left/Right ankle
 */
type LandmarkIndex =
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28;

/**
 * getLandmark
 * 
 * Mengambil landmark dari frame pose berdasarkan index.
 * 
 * @param frame - Frame pose dari MediaPipe
 * @param index - Index landmark yang ingin diambil
 * @returns Landmark atau undefined jika tidak ditemukan
 */
function getLandmark(frame: PoseLandmarksFrame, index: LandmarkIndex) {
  return frame.landmarks[index];
}

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
 * pickConfidence
 * 
 * Mengembalikan confidence score berdasarkan tipe gesture.
 * Confidence lebih rendah untuk gesture yang lebih sulit dideteksi.
 * 
 * @param type - Tipe gesture
 * @returns Confidence score (0-1)
 */
function pickConfidence(type: GestureType): number {
  if (type === "horseStance") return 0.65;  // Horse stance lebih sulit dideteksi
  if (type === "squat") return 0.7;         // squat cukup mudah
  return 0.75;                              // punch paling mudah dideteksi
}

/**
 * useMovementLogic
 * 
 * Hook untuk mendeteksi gesture dari pose user.
 * 
 * @param thresholds - Threshold untuk deteksi gesture (default: DEFAULT_THRESHOLDS)
 * @returns Object berisi lastGesture dan fungsi detectGesture
 */
export function useMovementLogic(thresholds: GestureThresholds = DEFAULT_THRESHOLDS): UseMovementLogicResult {
  // Ref untuk menyimpan gesture terakhir dan frame terakhir
  const lastGestureRef = useRef<GestureEvent | null>(null);
  const lastFrameRef = useRef<PoseLandmarksFrame | null>(null);

  /**
   * detectGesture
   * 
   * Fungsi untuk mendeteksi gesture dari frame pose.
   * Menggunakan useMemo untuk mencegah re-creation function pada setiap render.
   */
  const detectGesture = useMemo(() => {
    return (poseFrame: PoseLandmarksFrame | null): GestureEvent | null => {
      // Return null jika tidak ada pose frame
      if (!poseFrame) return null;

      // Cooldown: cek apakah masih dalam cooldown setelah gesture terakhir
      const lastGesture = lastGestureRef.current;
      if (lastGesture && poseFrame.timestampMs - lastGesture.detectedAtMs < thresholds.minCooldownMs) {
        return null;
      }

      // Ambil semua landmark yang diperlukan
      const leftShoulder = getLandmark(poseFrame, 11);
      const rightShoulder = getLandmark(poseFrame, 12);
      const leftElbow = getLandmark(poseFrame, 13);
      const rightElbow = getLandmark(poseFrame, 14);
      const leftWrist = getLandmark(poseFrame, 15);
      const rightWrist = getLandmark(poseFrame, 16);
      const leftHip = getLandmark(poseFrame, 23);
      const rightHip = getLandmark(poseFrame, 24);
      const leftAnkle = getLandmark(poseFrame, 27);
      const rightAnkle = getLandmark(poseFrame, 28);

      // Return null jika ada landmark yang tidak terdeteksi
      if (
        !leftShoulder ||
        !rightShoulder ||
        !leftElbow ||
        !rightElbow ||
        !leftWrist ||
        !rightWrist ||
        !leftHip ||
        !rightHip ||
        !leftAnkle ||
        !rightAnkle
      ) {
        return null;
      }

      // Hitung lebar bahu sebagai referensi normalisasi
      const shouldersWidth = distance2d(leftShoulder, rightShoulder);
      if (shouldersWidth <= 0.0001) return null;

      // Hitung posisi tengah pinggul dan rasio jarak antar mata kaki
      const hipCenterY = (leftHip.y + rightHip.y) / 2;
      const ankleDistanceRatio = distance2d(leftAnkle, rightAnkle) / shouldersWidth;

      // Hitung rasio ekstensi lengan kiri (berapa banyak lengan terentang)
      const leftUpperArm = distance2d(leftShoulder, leftElbow);
      const leftForearm = distance2d(leftElbow, leftWrist);
      const leftReach = distance2d(leftShoulder, leftWrist);
      const leftExtensionRatio =
        leftUpperArm + leftForearm > 0 ? leftReach / (leftUpperArm + leftForearm) : 0;

      // Hitung rasio ekstensi lengan kanan
      const rightUpperArm = distance2d(rightShoulder, rightElbow);
      const rightForearm = distance2d(rightElbow, rightWrist);
      const rightReach = distance2d(rightShoulder, rightWrist);
      const rightExtensionRatio =
        rightUpperArm + rightForearm > 0 ? rightReach / (rightUpperArm + rightForearm) : 0;

      // Hitung kecepatan pergelangan tangan (untuk deteksi punch)
      const lastFrame = lastFrameRef.current;
      let wristSpeed = 0;
      if (lastFrame) {
        const dtMs = Math.max(1, poseFrame.timestampMs - lastFrame.timestampMs);
        const lastLeftWrist = lastFrame.landmarks[15];
        const lastRightWrist = lastFrame.landmarks[16];
        if (lastLeftWrist && lastRightWrist) {
          const leftSpeed = distance2d(leftWrist, lastLeftWrist) / dtMs;
          const rightSpeed = distance2d(rightWrist, lastRightWrist) / dtMs;
          wristSpeed = Math.max(leftSpeed, rightSpeed);
        }
      }

      // Simpan frame saat ini untuk perhitungan kecepatan di frame berikutnya
      lastFrameRef.current = poseFrame;

      /**
       * Deteksi Gesture
       * 
       * v1 gesture heuristics (tunable later)
       * Prioritas: punch → squat → horseStance
       */

      // Deteksi punch: kecepatan wrist tinggi DAN lengan terentang
      const isPunch =
        wristSpeed >= thresholds.punch.minWristSpeed &&
        Math.max(leftExtensionRatio, rightExtensionRatio) >= thresholds.punch.minExtensionRatio;

      if (isPunch) {
        const gesture: GestureEvent = {
          type: "punch",
          detectedAtMs: poseFrame.timestampMs,
          confidence: pickConfidence("punch"),
        };
        lastGestureRef.current = gesture;
        return gesture;
      }

      // Deteksi squat: pinggul rendah (hipCenterY tinggi dalam koordinat normalized)
      const isSquat = hipCenterY >= thresholds.squat.maxHipHeightRatio;
      if (isSquat) {
        const gesture: GestureEvent = {
          type: "squat",
          detectedAtMs: poseFrame.timestampMs,
          confidence: pickConfidence("squat"),
        };
        lastGestureRef.current = gesture;
        return gesture;
      }

      // Deteksi horse stance: kaki terbuka lebar DAN pinggul rendah
      const isHorseStance =
        ankleDistanceRatio >= thresholds.horseStance.minAnkleDistanceRatio &&
        hipCenterY >= thresholds.horseStance.maxHipHeightRatio;

      if (isHorseStance) {
        const gesture: GestureEvent = {
          type: "horseStance",
          detectedAtMs: poseFrame.timestampMs,
          confidence: pickConfidence("horseStance"),
        };
        lastGestureRef.current = gesture;
        return gesture;
      }

      // Tidak ada gesture terdeteksi
      return null;
    };
  }, [thresholds]);

  return { lastGesture: lastGestureRef.current, detectGesture };
}

