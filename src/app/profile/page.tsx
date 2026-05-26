"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, Trophy, History, User, ChevronLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

import styles from "./profile.module.css";

interface SessionHistory {
  id: string;
  date: string;
  score: number;
  accuracy: number;
  rank: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<SessionHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        if (!supabase) {
          router.push("/auth");
          return;
        }
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (!user) {
          router.push("/auth");
          return;
        }
        setUser(user);

        // Mock data for session history until DB is ready
        setHistory([
          { id: '1', date: '2026-05-17', score: 1250, accuracy: 88, rank: 'Silver' },
          { id: '2', date: '2026-05-16', score: 980, accuracy: 72, rank: 'Bronze' },
          { id: '3', date: '2026-05-15', score: 1500, accuracy: 92, rank: 'Gold' },
        ]);
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (loading) return <div className={styles.loading}>Loading profile...</div>;

  return (
    <div className={styles.root}>
      <div className={styles.nav}>
        <button onClick={() => router.push("/")} className={styles.backBtn}>
          <ChevronLeft size={20} />
          Back to Menu
        </button>
      </div>

      <motion.div
        className={styles.profileCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.userHeader}>
          <div className={styles.avatar}>
            <User size={48} />
          </div>
          <div className={styles.userInfo}>
            <h2>{user?.email || "Warrior"}</h2>
            <span className={styles.rankBadge}>Diamond Rank</span>
          </div>
          <button onClick={handleSignOut} className={styles.signOutBtn} title="Sign Out">
            <LogOut size={20} />
          </button>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <Trophy size={24} className={styles.statIcon} />
            <span className={styles.statValue}>2,450</span>
            <span className={styles.statLabel}>Best Score</span>
          </div>
          <div className={styles.statItem}>
            <History size={24} className={styles.statIcon} />
            <span className={styles.statValue}>12</span>
            <span className={styles.statLabel}>Sessions</span>
          </div>
        </div>

        <div className={styles.historySection}>
          <h3>Recent Sessions</h3>
          <div className={styles.historyList}>
            {history.map((session) => (
              <div key={session.id} className={styles.historyRow}>
                <span className={styles.date}>{session.date}</span>
                <span className={styles.score}>{session.score} pts</span>
                <span className={styles.acc}>{session.accuracy}% acc</span>
                <span className={styles.rank}>{session.rank}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
