"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";

import { ZenithShell } from "@/shared/components/ZenithShell/ZenithShell";
import { useGameplayStore } from "@/features/gameplay";

import styles from "./settings.module.css";

export default function SettingsPage() {
  const router = useRouter();
  const showSkeleton = useGameplayStore((state) => state.showSkeleton);
  const toggleSkeleton = useGameplayStore((state) => state.toggleSkeleton);

  return (
    <ZenithShell>
      <main className={styles.main}>
        <button type="button" onClick={() => router.push("/menu")} className={styles.backBtn}>
          <ChevronLeft size={18} strokeWidth={2} aria-hidden="true" />
          Back to Menu
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={styles.card}
        >
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.subtitle}>Tune the training simulation to your preference.</p>

          <div className={styles.settingRow}>
            <div>
              <p className={styles.settingLabel}>Skeleton overlay</p>
              <p className={styles.settingHint}>Show or hide the pose skeleton on the camera feed.</p>
            </div>
            <button type="button" onClick={toggleSkeleton} className={styles.toggleBtn}>
              {showSkeleton ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
              {showSkeleton ? "Hide" : "Show"}
            </button>
          </div>
        </motion.div>
      </main>
    </ZenithShell>
  );
}

