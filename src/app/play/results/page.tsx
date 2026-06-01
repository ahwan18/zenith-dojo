"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trophy, RotateCcw, Home, TrendingUp } from "lucide-react";

import { APP_ROUTES, AUTHENTICATED_HOME_ROUTE } from "@/constants/appConstants";
import { useGameplayStore } from "@/features/gameplay/stores/gameplayStore";
import { supabase } from "@/lib/supabase";
import styles from "./results.module.css";

export default function ResultsPage() {
  const router = useRouter();
  const {
    currentScore,
    hits,
    misses,
    bestStreak,
    multiplier,
    resetSession
  } = useGameplayStore();

  useEffect(() => {
    const saveScore = async () => {
      if (!supabase) return;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("game_sessions").insert({
            user_id: user.id,
            score: currentScore,
            hits,
            misses,
            best_streak: bestStreak,
            completed_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error("Error saving score to Supabase:", err);
      }
    };

    saveScore();
  }, [currentScore, hits, misses, bestStreak]);

  const getRank = (score: number) => {
    if (score >= 75000) return { name: "Master", color: "#fde047" };
    if (score >= 35000) return { name: "Diamond", color: "#60a5fa" };
    if (score >= 15000) return { name: "Gold", color: "#fbbf24" };
    if (score >= 5000) return { name: "Silver", color: "#cbd5e1" };
    return { name: "Bronze", color: "#cd7f32" };
  };

  const rank = getRank(currentScore);

  return (
    <div className={styles.root}>
      <div className={styles.backgroundEffects} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={styles.card}
      >
        <div className={styles.header}>
          <Trophy size={64} className={styles.trophyIcon} color={rank.color} />
          <h1 className={styles.title}>SESSION COMPLETE</h1>
          <div className={styles.rankBadge} style={{ color: rank.color }}>
            {rank.name}
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>FINAL SCORE</span>
            <span className={styles.statValue}>{currentScore.toLocaleString()}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>MAX COMBO</span>
            <span className={styles.statValue}>{bestStreak}x</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>HITS / MISSES</span>
            <span className={styles.statValue}>{hits} / {misses}</span>
          </div>
        </div>

        <div className={styles.footer}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={styles.secondaryBtn}
            onClick={() => router.push(AUTHENTICATED_HOME_ROUTE)}
          >
            <Home size={20} />
            MAIN MENU
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={styles.primaryBtn}
            onClick={() => {
              resetSession();
              router.push(APP_ROUTES.playBody);
            }}
          >
            <RotateCcw size={20} />
            PLAY AGAIN
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
