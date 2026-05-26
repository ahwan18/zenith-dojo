/**
 * CameraTargetOverlay Component
 * 
 * Komponen ini merender overlay kamera dengan target combat dan pose canvas.
 * 
 * Fungsi:
 * - Menampilkan feed kamera dengan pose skeleton (via PoseCanvas)
 * - Menampilkan target combat di atas feed kamera
 * - Mendukung dua variant: default (compact) dan AR (immersive)
 * - Menampilkan background dinamis berdasarkan scene dari story
 * - Menampilkan overlay loading saat vision model sedang diinisialisasi
 * - Menggunakan icon berbeda untuk setiap zona target (HEAD, HAND, FOOT, CHEST)
 * 
 * Digunakan di halaman /game sebagai layer visual utama untuk combat.
 */

"use client";

import type { ReactElement } from "react";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Circle, CircleDot, Footprints, Hand, User } from "lucide-react";

import { useStoryStore } from "@/features/story/store";
import { SCENE_REGISTRY } from "@/features/story/scenes";
import type { CombatTarget } from "@/features/gameplay/types/combat.types";
import type { PoseLandmarksFrame } from "@/features/vision";
import type { VisionStatus } from "@/features/vision/hooks/useVisionSession";
import { PoseCanvas } from "@/features/vision";
import { Spinner } from "@/shared/components/Spinner/Spinner";

import styles from "./CameraTargetOverlay.module.css";

/**
 * CameraTargetOverlayVariant
 * 
 * Tipe variant untuk overlay.
 * - default: Compact mode, cocok untuk calibration
 * - ar: Immersive AR mode, cocok untuk gameplay
 */
export type CameraTargetOverlayVariant = "default" | "ar";

/**
 * CameraTargetOverlayProps
 * 
 * Props yang diterima oleh komponen ini.
 */
interface CameraTargetOverlayProps {
  status: VisionStatus;                              // Status vision session
  videoRef: React.RefObject<HTMLVideoElement>;        // Ref ke elemen video
  poseFrame: PoseLandmarksFrame | null;               // Frame pose saat ini
  activeTarget: CombatTarget | null;                  // Target yang sedang aktif
  isCompact?: boolean;                                // Apakah mode compact (default: false)
  variant?: CameraTargetOverlayVariant;               // Variant overlay (default: "default")
  initializingLabel: string;                          // Label untuk spinner saat initializing
}

/**
 * zoneIconForLabel
 * 
 * Mengembalikan icon yang sesuai untuk label zona target.
 * 
 * @param label - Label zona target (HEAD, HAND, FOOT, CHEST)
 * @returns Element React icon
 */
function zoneIconForLabel(label: string): ReactElement {
  const u = label.toUpperCase();
  if (u.includes("HEAD")) return <CircleDot size={22} strokeWidth={2.2} aria-hidden />;
  if (u.includes("HAND")) return <Hand size={22} strokeWidth={2.2} aria-hidden />;
  if (u.includes("FOOT")) return <Footprints size={22} strokeWidth={2.2} aria-hidden />;
  if (u.includes("CHEST")) return <User size={22} strokeWidth={2.2} aria-hidden />;
  return <Circle size={22} strokeWidth={2.2} aria-hidden />;
}

/**
 * CameraTargetOverlay
 * 
 * Komponen utama untuk merender overlay kamera dengan target combat.
 * 
 * @param props - Props untuk komponen
 * @returns Element React
 */
export function CameraTargetOverlay({
  status,
  videoRef,
  poseFrame,
  activeTarget,
  isCompact = false,
  variant = "default",
  initializingLabel,
}: CameraTargetOverlayProps): ReactElement {
  // Ambil scene dari story store untuk background dinamis
  const { currentSceneId } = useStoryStore();
  const scene = SCENE_REGISTRY[currentSceneId];

  /**
   * targetStyle
   * 
   * Menghitung style CSS untuk posisi target.
   * X di-mirror karena PoseCanvas di-mirror via CSS.
   */
  const targetStyle = useMemo(() => {
    if (!activeTarget || activeTarget.state !== "active") return null;
    return {
      // PoseCanvas is mirrored via CSS, so we mirror target X for visual alignment.
      left: `${Math.round((1 - activeTarget.position.x) * 100)}%`,
      top: `${Math.round(activeTarget.position.y * 100)}%`,
      transform: "translate(-50%, -50%)",
    };
  }, [activeTarget]);

  // Tentukan apakah overlay loading harus ditampilkan
  const showOverlay = status === "idle" || status === "initializing";
  
  // Tentukan apakah variant AR
  const isAr = variant === "ar";

  // Build class name untuk stage
  const stageClass = [
    styles.stage,
    isCompact ? styles.compact : "",
    isAr ? styles.stageAr : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={stageClass}>
      {/* Background dinamis berdasarkan scene */}
      <div
        className={styles.dynamicBackground}
        style={{
          backgroundColor: scene.ambientColor,
          backgroundImage: scene.backgroundAsset
            ? `url(${scene.backgroundAsset}), ${scene.backgroundGradient}`
            : scene.backgroundGradient,
        }}
        aria-hidden
      />
      
      {/* PoseCanvas untuk menampilkan feed kamera dan skeleton */}
      <PoseCanvas
        videoRef={videoRef}
        poseFrame={status === "ready" ? poseFrame : null}
        isCompact={isAr ? false : isCompact}
        immersive={isAr}
      />

      {/* Vignette untuk mode AR */}
      {isAr ? <div className={styles.arVignette} aria-hidden /> : null}

      {/* Overlay loading saat vision model sedang diinisialisasi */}
      {showOverlay ? (
        <div
          className={isAr ? styles.overlayAr : styles.overlay}
          aria-busy={status === "initializing"}
          aria-live="polite"
        >
          {status === "initializing" ? (
            <Spinner label={initializingLabel} />
          ) : (
            <p className={isAr ? styles.idleMessageAr : styles.idleMessage}>Preparing camera and vision model…</p>
          )}
        </div>
      ) : null}

      {/* Target aktif */}
      {activeTarget && activeTarget.state === "active" ? (
        <motion.div
          className={isAr ? styles.targetAr : styles.target}
          style={targetStyle ?? undefined}
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          aria-label={`Strike zone ${activeTarget.label}`}
        >
          {isAr ? (
            <>
              {/* Mode AR: tampilkan label, icon, dan frame */}
              <div className={styles.arChip}>{activeTarget.label}</div>
              <div className={styles.arFrame}>
                <div className={styles.arIcon}>{zoneIconForLabel(activeTarget.label)}</div>
              </div>
              <motion.div
                className={styles.targetRingAr}
                animate={{ scale: [1, 1.08, 1], opacity: [0.85, 0.35, 0.85] }}
                transition={{ duration: 0.95, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden
              />
            </>
          ) : (
            <motion.div
              className={styles.targetRing}
              animate={{ scale: [1, 1.12, 1], opacity: [0.7, 0.35, 0.7] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden="true"
            />
          )}
        </motion.div>
      ) : !isAr ? (
        <div className={styles.hint}>Target spawns on camera feed</div>
      ) : null}
    </div>
  );
}
