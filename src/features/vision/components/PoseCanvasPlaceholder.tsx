import type { ReactElement } from "react";

import styles from "./PoseCanvasPlaceholder.module.css";

export function PoseCanvasPlaceholder(): ReactElement {
  return (
    <div className={styles.placeholder} aria-label="Pose canvas placeholder">
      <p className={styles.label}>Camera feed + pose overlay will render here.</p>
    </div>
  );
}

