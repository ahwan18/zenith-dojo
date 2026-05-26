import type { ReactElement } from "react";

import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  title: string;
  message: string;
}

export function EmptyState({ title, message }: EmptyStateProps): ReactElement {
  return (
    <div className={styles.container} role="note">
      <p className={styles.title}>{title}</p>
      <p className={styles.message}>{message}</p>
    </div>
  );
}

