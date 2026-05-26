import type { ReactElement, ReactNode } from "react";

import styles from "./ActionRow.module.css";

interface ActionRowProps {
  children: ReactNode;
}

export function ActionRow({ children }: ActionRowProps): ReactElement {
  return <div className={styles.row}>{children}</div>;
}

