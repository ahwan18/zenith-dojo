"use client";

import { motion, AnimatePresence } from "framer-motion";

import { useStoryStore } from "../store";
import styles from "./SenseiStoryPanel.module.css";

export function SenseiStoryPanel() {
  const objective = useStoryStore((s) => s.objective);
  const narrativeLog = useStoryStore((s) => s.narrativeLog);
  const streamingNarrative = useStoryStore((s) => s.streamingNarrative);
  const isDirectorBusy = useStoryStore((s) => s.isDirectorBusy);
  const hudHint = useStoryStore((s) => s.hudHint);
  const activeComboName = useStoryStore((s) => s.activeComboName);

  const lastMessage = narrativeLog[narrativeLog.length - 1];
  const displayText = streamingNarrative || lastMessage?.text;

  return (
    <div className={styles.container} aria-label="Sensei story panel">
      <motion.div
        className={styles.objectiveBox}
        layout
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
      >
        <span className={styles.label}>Objective</span>
        <p className={styles.text}>{objective}</p>
        {activeComboName ? (
          <p className={styles.comboBadge}>Combo: {activeComboName}</p>
        ) : null}
      </motion.div>

      {hudHint ? (
        <motion.div
          className={[styles.hintBox, styles[`hint_${hudHint.severity}`]].join(" ")}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          role="status"
        >
          <span className={styles.hintLabel}>Sensei hint</span>
          <p className={styles.hintText}>{hudHint.text}</p>
        </motion.div>
      ) : null}

      <motion.div className={styles.narrativeArea} layout>
        <AnimatePresence mode="wait">
          {displayText ? (
            <motion.div
              key={streamingNarrative ? "stream" : String(lastMessage?.timestamp ?? "idle")}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              className={`${styles.message} ${lastMessage?.speaker === "System" && !streamingNarrative ? styles.system : styles.sensei}`}
            >
              <span className={styles.speaker}>
                {streamingNarrative ? "Sensei" : lastMessage?.speaker === "System" ? "System" : "Sensei"}
              </span>
              <p className={styles.content}>
                {displayText}
                {streamingNarrative && isDirectorBusy ? (
                  <span className={styles.cursor} aria-hidden>
                    ▌
                  </span>
                ) : null}
              </p>
            </motion.div>
          ) : (
            <motion.p
              key="placeholder"
              className={styles.placeholder}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {isDirectorBusy ? "The Sensei is observing your form…" : "Awaiting guidance…"}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
