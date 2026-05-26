import type { ReactElement } from "react";

import { Button } from "@/shared/components/Button/Button";

import styles from "./ErrorState.module.css";

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps): ReactElement {
  return (
    <div className={styles.container} role="alert" aria-live="polite">
      <p className={styles.title}>{title}</p>
      <p className={styles.message}>{message}</p>
      {onRetry ? (
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : null}
    </div>
  );
}

