"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { APP_ROUTES } from "@/constants/appConstants";
import { useGameplayStore } from "@/features/gameplay/stores/gameplayStore";
import { getFallbackLevel } from "@/features/gameplay/data/presets";
import styles from "./loading.module.css";

export default function LoadingPage() {
  const router = useRouter();
  const { levelData, setLevelData, bodyMode } = useGameplayStore();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Initializing neural link...");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Progressive Loading Logic
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    const statusTimer = setInterval(() => {
      const messages = [
        "Fetching story data from AI Sensei...",
        "Calculating target sequences...",
        "Synchronizing biomechanics...",
        "Preparing dojo environment...",
        "Finalizing neural connection...",
      ];
      setStatus(messages[Math.floor(Math.random() * messages.length)]);
    }, 2000);

    // Ensure we have level data (AI or Fallback)
    if (!levelData) {
      console.log("[Loading] Level data missing, applying fallback...");
      const fallback = getFallbackLevel(bodyMode || "full_body");
      setLevelData(fallback);
    }

    return () => {
      clearInterval(timer);
      clearInterval(statusTimer);
    };
  }, [levelData, bodyMode, setLevelData]);

  useEffect(() => {
    if (progress === 100 && levelData) {
      setIsReady(true);
    }
  }, [progress, levelData]);

  const handleStart = () => {
    router.push(APP_ROUTES.game);
  };

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <motion.div
          className={styles.logoWrap}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <h1 className={styles.title}>MOTIONQUEST</h1>
        </motion.div>

        <div className={styles.storyBox}>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.narrative}
          >
            {levelData?.storyNarrative || "The dojo awaits your presence. Prepare for the trial."}
          </motion.p>
        </div>

        <div className={styles.progressContainer}>
          <div className={styles.progressBar} style={{ width: `${progress}%` }} />
          <span className={styles.percentage}>{progress}%</span>
        </div>

        <p className={styles.status}>{status}</p>

        <AnimatePresence>
          {isReady && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.startBtn}
              onClick={handleStart}
            >
              START JOURNEY
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
