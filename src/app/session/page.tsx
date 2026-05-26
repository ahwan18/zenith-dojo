"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowBigUpDash, Award, BarChart3, Home, RotateCcw, Share2, Target, X } from "lucide-react";

import { useGameplayStore } from "@/features/gameplay";

import {
  accuracySegmentFill5,
  comboSegmentFill5,
  sessionDisplayRank,
  sessionRankDeltaLabel,
} from "./sessionSummaryUtils";
import sessionStyles from "./sessionPage.module.css";

function SegmentedBar5({ filled, variant }: { filled: number; variant: "cyan" | "gold" }) {
  const segClass = variant === "cyan" ? sessionStyles.segCyan : sessionStyles.segGold;
  return (
    <div className={sessionStyles.segBar} aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className={[sessionStyles.seg, i < filled ? segClass : ""].filter(Boolean).join(" ")} />
      ))}
    </div>
  );
}

export default function SessionPage() {
  const router = useRouter();
  const gamePhase = useGameplayStore((state) => state.gamePhase);
  const score = useGameplayStore((state) => state.currentScore);
  const hits = useGameplayStore((state) => state.hits);
  const misses = useGameplayStore((state) => state.misses);
  const bestStreak = useGameplayStore((state) => state.bestStreak);
  const resetSession = useGameplayStore((state) => state.resetSession);

  const totalTargets = hits + misses;
  const accuracy = useMemo(() => {
    if (totalTargets <= 0) return 0;
    return Math.round((hits / totalTargets) * 100);
  }, [hits, totalTargets]);

  const accSeg = useMemo(() => accuracySegmentFill5(accuracy), [accuracy]);
  const comboSeg = useMemo(() => comboSegmentFill5(bestStreak), [bestStreak]);
  const displayRank = useMemo(() => sessionDisplayRank(score, hits), [score, hits]);
  const rankDelta = useMemo(
    () => sessionRankDeltaLabel(accuracy, bestStreak),
    [accuracy, bestStreak]
  );

  const showSummary = gamePhase === "finished";

  useLayoutEffect(() => {
    router.replace("/play/results");
  }, [router]);

  const handlePlayAgain = () => {
    resetSession();
    router.push("/choose-mode");
  };

  const handleShare = async () => {
    const text = `Zenith Dojo — Final score ${String(score).padStart(7, "0")} · ${accuracy}% accuracy · ${hits}/${totalTargets} targets`;
    const url = typeof window !== "undefined" ? window.location.origin + "/session" : "";
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "Session complete", text, url });
        return;
      }
    } catch {
      /* user cancelled or share failed */
    }
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${text} ${url}`);
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <div className={sessionStyles.root}>
      <main className={sessionStyles.main}>
        {!showSummary ? (
          <div className={sessionStyles.emptyWrap}>
            <h1 className={sessionStyles.emptyTitle}>No session summary</h1>
            <p className={sessionStyles.emptyText}>
              Finish a combat run (time up or End Session) to see your results here.
            </p>
            <div className={sessionStyles.emptyActions}>
              <button type="button" className={sessionStyles.btnPrimary} onClick={() => router.push("/choose-mode")}>
                Choose mode
              </button>
              <button type="button" className={sessionStyles.btnGhost} onClick={() => router.push("/")}>
                Home
              </button>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}
          >
            <header className={sessionStyles.header}>
              <h1 className={sessionStyles.title}>Session complete</h1>
              <p className={sessionStyles.subtitle}>Training simulation concluded</p>
            </header>

            <div className={sessionStyles.dashboard}>
              <section className={sessionStyles.scoreCard} aria-labelledby="final-score-label">
                <div className={sessionStyles.scoreInner}>
                  <p id="final-score-label" className={sessionStyles.scoreLabel}>
                    Final score
                  </p>
                  <p className={sessionStyles.scoreValue}>{String(score).padStart(7, "0")}</p>
                </div>
              </section>

              <section className={sessionStyles.rankCard} aria-labelledby="rank-label">
                <div className={sessionStyles.rankInner}>
                  <div className={sessionStyles.medalWrap}>
                    <Award size={52} strokeWidth={1.75} aria-hidden />
                  </div>
                  <p id="rank-label" className={sessionStyles.rankNumber}>
                    #{displayRank}
                  </p>
                  <p className={sessionStyles.rankLabel}>Current rank</p>
                  <div className={sessionStyles.rankBadge}>
                    <span className={sessionStyles.rankBadgeIcon}>
                      <ArrowBigUpDash size={18} strokeWidth={2} aria-hidden />
                    </span>
                    {rankDelta}
                  </div>
                </div>
              </section>

              <section className={sessionStyles.breakdownCard} aria-label="Performance breakdown">
                <div className={sessionStyles.breakdownInner}>
                  <div className={sessionStyles.breakdownHead}>
                    <BarChart3 size={18} strokeWidth={2} aria-hidden />
                    Performance breakdown
                  </div>

                  <div className={sessionStyles.breakdownGrid}>
                    <div className={sessionStyles.statBlock}>
                      <p className={sessionStyles.statBlockLabel}>Accuracy</p>
                      <div className={sessionStyles.statRow}>
                        <p className={sessionStyles.statBig}>{accuracy}%</p>
                      </div>
                      <SegmentedBar5 filled={accSeg} variant="cyan" />
                    </div>

                    <div className={sessionStyles.statBlock}>
                      <p className={sessionStyles.statBlockLabel}>Max combo</p>
                      <div className={sessionStyles.statRow}>
                        <p className={sessionStyles.statBig}>{bestStreak}</p>
                        <p className={sessionStyles.statSuffix}>Hits</p>
                      </div>
                      <SegmentedBar5 filled={comboSeg} variant="gold" />
                    </div>

                    <div className={sessionStyles.nestedBox}>
                      <div className={sessionStyles.nestedHead}>
                        <Target size={15} strokeWidth={2} aria-hidden />
                        Targets hit
                      </div>
                      <p className={sessionStyles.nestedValue}>
                        {hits} / {totalTargets || 0}
                      </p>
                    </div>

                    <div className={[sessionStyles.nestedBox, sessionStyles.nestedBoxMiss].join(" ")}>
                      <div className={[sessionStyles.nestedHead, sessionStyles.nestedHeadMiss].join(" ")}>
                        <X size={12} strokeWidth={2.5} aria-hidden />
                        Missed
                      </div>
                      <p className={[sessionStyles.nestedValue, sessionStyles.nestedValueMiss].join(" ")}>
                        {String(misses).padStart(2, "0")}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className={sessionStyles.actions}>
              <button type="button" className={sessionStyles.btnPrimary} onClick={handlePlayAgain}>
                <RotateCcw size={18} strokeWidth={2} aria-hidden />
                Play again
              </button>
              <button type="button" className={sessionStyles.btnGhost} onClick={handleShare}>
                <Share2 size={18} strokeWidth={2} aria-hidden />
                Share results
              </button>
            </div>

            <button type="button" className={sessionStyles.mainMenu} onClick={() => router.push("/")}>
              <Home size={14} strokeWidth={2} aria-hidden />
              Main menu
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
