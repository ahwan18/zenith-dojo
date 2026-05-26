"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, User } from "lucide-react";
import { useGameplayStore } from "@/features/gameplay/stores/gameplayStore";
import styles from "./TrackingOverlay.module.css";

export function TrackingOverlay() {
  const trackingStatus = useGameplayStore((state) => state.trackingStatus);
  const bodyMode = useGameplayStore((state) => state.bodyMode);

  if (trackingStatus === "ok") return null;

  return (
    <div className={styles.root}>
      <AnimatePresence>
        {trackingStatus === "soft_pause" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.softPauseOverlay}
          />
        )}

        {trackingStatus === "hard_pause" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.hardPauseOverlay}
          >
            <div className={styles.content}>
              <div className={styles.iconWrap}>
                <AlertTriangle size={48} className={styles.icon} />
              </div>
              <h2 className={styles.title}>Tracking Lost</h2>
              <p className={styles.message}>
                {bodyMode === "full_body"
                  ? "Please step back so your entire body is visible in the camera."
                  : "Please adjust your position so your upper body is clearly visible."}
              </p>
              <div className={styles.hint}>
                <User size={20} />
                <span>Stay still once you are in position</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
