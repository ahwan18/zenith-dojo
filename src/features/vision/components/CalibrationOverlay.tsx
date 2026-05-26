import type { ReactElement } from "react";

import styles from "./CalibrationOverlay.module.css";

interface CalibrationOverlayProps {
  luxScore: number | null;
  isLuxOk: boolean;
  fps: number | null;
  visibleLandmarksCount: number;
  isPoseValid: boolean;
}

export function CalibrationOverlay({
  luxScore,
  isLuxOk,
  fps,
  visibleLandmarksCount,
  isPoseValid,
}: CalibrationOverlayProps): ReactElement {
  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <p className={styles.label}>Lighting (target ≥ 50)</p>
        <p className={[styles.value, isLuxOk ? styles.ok : styles.bad].join(" ")}>
          {luxScore ?? "—"}
        </p>
      </div>

      <div className={styles.row}>
        <p className={styles.label}>Pose visibility (target ≥ 20)</p>
        <p className={[styles.value, isPoseValid ? styles.ok : styles.bad].join(" ")}>
          {visibleLandmarksCount}
        </p>
      </div>

      <div className={styles.row}>
        <p className={styles.label}>Detection FPS</p>
        <p className={styles.value}>{fps ?? "—"}</p>
      </div>
    </div>
  );
}

