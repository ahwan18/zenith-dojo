import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import { User } from "lucide-react";

import { APP_ROUTES, AUTHENTICATED_HOME_ROUTE } from "@/constants/appConstants";

import styles from "./ZenithShell.module.css";

interface ZenithShellProps {
  children: ReactNode;
}

export function ZenithShell({ children }: ZenithShellProps): ReactElement {
  return (
    <div className={styles.page}>
      <div className={styles.bgTexture} aria-hidden="true" />
      <header className={styles.header}>
        <Link href={AUTHENTICATED_HOME_ROUTE} className={styles.brandLink}>
          ZENITH DOJO
        </Link>
        <Link href={APP_ROUTES.profile} className={styles.profileLink} aria-label="Profile">
          <User size={18} strokeWidth={2} />
        </Link>
      </header>
      <div className={styles.shellBody}>{children}</div>
      <footer className={styles.footer}>
        <p className={styles.footerText}>© 2026 Zenith Dojo. All rights reserved.</p>
      </footer>
    </div>
  );
}
