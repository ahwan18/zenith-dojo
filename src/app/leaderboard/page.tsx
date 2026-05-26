"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trophy, Crown, TrendingUp } from "lucide-react";

import styles from "./leaderboard.module.css";

interface Entry {
  rank: number;
  name: string;
  score: number;
  date: string;
}

const MOCK_DATA: Entry[] = [
  { rank: 1, name: "DragonSlayer99", score: 15400, date: "2026-05-10" },
  { rank: 2, name: "ZenMaster_Kento", score: 14200, date: "2026-05-12" },
  { rank: 3, name: "Sora_Strike", score: 13100, date: "2026-05-15" },
  { rank: 4, name: "Yuki_Flow", score: 12800, date: "2026-05-14" },
  { rank: 5, name: "Maki_Punch", score: 11000, date: "2026-05-11" },
  { rank: 6, name: "Hiro_Wind", score: 10500, date: "2026-05-09" },
  { rank: 7, name: "Kaito_Slam", score: 9800, date: "2026-05-08" },
  { rank: 8, name: "Saki_Sash", score: 9200, date: "2026-05-07" },
  { rank: 9, name: "Riku_Kick", score: 8900, date: "2026-05-06" },
  { rank: 10, name: "Ami_Dodge", score: 8500, date: "2026-05-05" },
];

export default function LeaderboardPage() {
  const router = useRouter();

  return (
    <div className={styles.root}>
      <div className={styles.nav}>
        <button onClick={() => router.push("/")} className={styles.backBtn}>
          ← Back to Home
        </button>
      </div>

      <motion.div
        className={styles.container}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.header}>
          <Trophy size={48} className={styles.trophyIcon} />
          <h1>HALL OF FAME</h1>
          <p>The elite warriors of MotionQuest</p>
        </div>

        <div className={styles.topThree}>
          {MOCK_DATA.slice(0, 3).map((user, i) => (
            <div key={user.name} className={styles.podiumItem}>
              <div className={styles.rankCircle}>
                <span className={styles.rankNumber}>{i + 1}</span>
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user.name}</span>
                <span className={styles.userScore}>{user.score} pts</span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Warrior</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_DATA.slice(3).map((user) => (
                <tr key={user.name}>
                  <td>{user.rank}</td>
                  <td>{user.name}</td>
                  <td className={styles.scoreCell}>{user.score}</td>
                  <td>{user.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
