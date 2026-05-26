import type { ReactElement } from "react";
import Link from "next/link";
import { Home, Medal, Settings, Timer } from "lucide-react";

import styles from "./Navigation.module.css";

type NavigationItem = "home" | "sessions" | "ranking" | "settings";

interface NavigationProps {
  activeItem: NavigationItem;
}

export function Navigation({ activeItem }: NavigationProps): ReactElement {
  return (
    <div className={styles.container}>
      <div className={styles.brand}>
        <h1 className={styles.brandTitle}>Zenith</h1>
        <p className={styles.brandSubtitle}>Vision-based combat scaffold</p>
      </div>

      <div className={styles.list}>
        <Link
          href="/"
          className={[styles.item, activeItem === "home" ? styles.active : ""]
            .filter(Boolean)
            .join(" ")}
        >
          <span className={styles.label}>
            <Home size={18} />
            Home
          </span>
          <span className={styles.pill}>v1</span>
        </Link>

        <Link
          href="/calibration"
          className={[styles.item, activeItem === "sessions" ? styles.active : ""]
            .filter(Boolean)
            .join(" ")}
        >
          <span className={styles.label}>
            <Timer size={18} />
            Sessions
          </span>
          <span className={styles.pill}>Soon</span>
        </Link>

        <Link
          href="/session"
          className={[styles.item, activeItem === "ranking" ? styles.active : ""]
            .filter(Boolean)
            .join(" ")}
        >
          <span className={styles.label}>
            <Medal size={18} />
            Ranking
          </span>
          <span className={styles.pill}>Mock</span>
        </Link>

        <Link
          href="/"
          className={[styles.item, activeItem === "settings" ? styles.active : ""]
            .filter(Boolean)
            .join(" ")}
        >
          <span className={styles.label}>
            <Settings size={18} />
            Settings
          </span>
          <span className={styles.pill}>Later</span>
        </Link>
      </div>
    </div>
  );
}

