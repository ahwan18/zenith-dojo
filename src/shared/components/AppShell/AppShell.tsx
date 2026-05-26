import type { ReactElement, ReactNode } from "react";

import styles from "./AppShell.module.css";

interface AppShellProps {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
}

export function AppShell({ left, center, right }: AppShellProps): ReactElement {
  return (
    <div className={styles.shell}>
      <nav className={styles.panel} aria-label="Primary">
        {left}
      </nav>
      <main className={styles.panel}>{center}</main>
      <aside className={[styles.panel, styles.rightPanel].filter(Boolean).join(" ")}>
        {right}
      </aside>
    </div>
  );
}

