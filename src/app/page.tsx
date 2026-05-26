"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Play, Trophy, User, LayoutGrid } from "lucide-react";

import styles from "./page.module.css";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className={styles.root}>
      <div className={styles.bgVideoContainer}>
        {/* Background video or high-res loop would go here */}
        <div className={styles.overlay} />
        <div className={styles.gradient} />
      </div>

      <nav className={styles.nav}>
        <div className={styles.logo}>
          <span className={styles.logoText}>Zenith Dojo</span>
        </div>
        <div className={styles.navLinks}>
          <button onClick={() => router.push("/leaderboard")} className={styles.linkBtn}>Leaderboard</button>
          <button onClick={() => router.push("/auth")} className={styles.authBtn}>Sign In</button>
        </div>
      </nav>

      <main className={styles.hero}>
        <motion.div
          className={styles.content}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className={styles.title}>
            MASTER YOUR <br />
            <span className={styles.highlight}>MOTION</span>
          </h1>
          <p className={styles.subtitle}>
            A cinematic fusion of AI-driven storytelling and real-time body tracking.
            Step into the dojo and transform your movement into power.
          </p>

          <div className={styles.ctaGroup}>
            <motion.button
              className={styles.mainCta}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/auth")}
            >
              <Play fill="currentColor" size={20} />
              START YOUR JOURNEY
            </motion.button>

            <motion.button
              className={styles.secondaryCta}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/auth")}
            >
              Try as Guest
            </motion.button>
          </div>
        </motion.div>
      </main>

      <section className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.iconWrap}><LayoutGrid size={32} /></div>
          <h3>AI-Driven Story</h3>
          <p>Every session is a new tale. Your movements shape the narrative in real-time.</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.iconWrap}><Trophy size={32} /></div>
          <h3>Global Ranks</h3>
          <p>Compete with warriors worldwide. Climb from Bronze to Master rank.</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.iconWrap}><User size={32} /></div>
          <h3>Precision Tracking</h3>
          <p>Military-grade pose detection. No sensors, just your camera and your will.</p>
        </div>
      </section>
    </div>
  );
}
