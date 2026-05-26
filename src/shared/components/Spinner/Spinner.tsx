import type { ReactElement } from "react";

import styles from "./Spinner.module.css";

interface SpinnerProps {
  label?: string;
}

export function Spinner({ label = "Loading…" }: SpinnerProps): ReactElement {
  return (
    <div className={styles.spinnerRow} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

