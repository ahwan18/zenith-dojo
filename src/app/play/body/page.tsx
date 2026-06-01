"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, User, Scale } from "lucide-react";

import { APP_ROUTES } from "@/constants/appConstants";
import { useGameplayStore } from "@/features/gameplay/stores/gameplayStore";
import styles from "./body.module.css";

export default function BodyModePage() {
  const router = useRouter();
  const { setBodyMode, setGamePhase } = useGameplayStore();
  const [selectedMode, setSelectedMode] = useState<"full_body" | "half_body" | null>(null);

  const handleConfirm = async () => {
    if (!selectedMode) return;

    // 1. Set the mode in store
    setBodyMode(selectedMode);

    // 2. Trigger AI Pre-fetch immediately in background
    // We don't wait for this to finish before moving to calibration
    fetch("/api/generate-level", {
      method: "POST",
      body: JSON.stringify({
        mode: selectedMode,
        difficulty: "medium", // Default for now, can be synced with store
        theme: "Ancient Dojo",
      }),
    })
    .then(res => res.json())
    .then(data => {
      useGameplayStore.getState().setLevelData(data);
      console.log("[AI Pre-fetch] Level data received");
    })
    .catch(err => {
      console.error("[AI Pre-fetch] Failed, will use fallback during loading", err);
    });

    // 3. Move to calibration
    setGamePhase("calibrating");
    router.push(APP_ROUTES.playCalibrate);
  };

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>SELECT BODY MODE</h1>
          <p>Choose how you want to engage with the dojo</p>
        </div>

        <div className={styles.modeGrid}>
          <motion.div
            className={`${styles.modeCard} ${selectedMode === "full_body" ? styles.active : ""}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedMode("full_body")}
          >
            <div className={styles.iconWrap}>
              <User size={48} />
            </div>
            <div className={styles.textWrap}>
              <h3>Full Body</h3>
              <p>Stand up and move. Full range of motion for maximum intensity.</p>
            </div>
            {selectedMode === "full_body" && <div className={styles.check}><Check size={20} /></div>}
          </motion.div>

          <motion.div
            className={`${styles.modeCard} ${selectedMode === "half_body" ? styles.active : ""}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedMode("half_body")}
          >
            <div className={styles.iconWrap}>
              <Scale size={48} />
            </div>
            <div className={styles.textWrap}>
              <h3>Half Body</h3>
              <p>Siting or limited space. Focused on upper body and core movements.</p>
            </div>
            {selectedMode === "half_body" && <div className={styles.check}><Check size={20} /></div>}
          </motion.div>
        </div>

        <div className={styles.footer}>
          <button
            className={styles.confirmBtn}
            disabled={!selectedMode}
            onClick={handleConfirm}
          >
            CONTINUE TO CALIBRATION
          </button>
        </div>
      </div>
    </div>
  );
}
