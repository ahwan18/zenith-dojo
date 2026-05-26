"use client";

import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronRight, ListOrdered, Timer } from "lucide-react";

import { ZenithShell } from "@/shared/components/ZenithShell/ZenithShell";
import { useGameplayStore } from "@/features/gameplay";

import styles from "./ChooseModePage.module.css";

type ModeAccent = "gold" | "purple";

interface ModeCardProps {
  accent: ModeAccent;
  modeLabel: string;
  title: string;
  descriptionLines: string[];
  icon: ReactElement;
  watermark: ReactElement;
  onSelect: () => void;
}

function ModeCard({
  accent,
  modeLabel,
  title,
  descriptionLines,
  icon,
  watermark,
  onSelect,
}: ModeCardProps): ReactElement {
  const isGold = accent === "gold";

  const cardClass = [styles.modeCard, isGold ? styles.modeCardGold : styles.modeCardPurple].join(" ");

  const badgeClass = [styles.iconBadge, isGold ? styles.iconBadgeGold : styles.iconBadgePurple].join(" ");

  const labelClass = [styles.modeLabel, isGold ? styles.modeLabelGold : styles.modeLabelPurple].join(" ");

  const fillClass = isGold ? styles.trackFillGold : styles.trackFillPurple;

  const chevronClass = [styles.chevron, isGold ? styles.chevronGold : styles.chevronPurple].join(" ");

  return (
    <button type="button" onClick={onSelect} className={cardClass}>
      <div className={styles.watermark} aria-hidden="true">
        {watermark}
      </div>
      <div className={styles.body}>
        <div className={badgeClass}>{icon}</div>
        <p className={labelClass}>{modeLabel}</p>
        <h2 className={styles.modeTitle}>{title}</h2>
        <div className={styles.modeCopy}>
          {descriptionLines.map((line) => (
            <p key={line} className={styles.modeDescLine}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <div className={styles.footerRow}>
        <div className={styles.track} aria-hidden="true">
          <div className={fillClass} />
        </div>
        <ChevronRight className={chevronClass} size={16} strokeWidth={2} aria-hidden="true" />
      </div>
    </button>
  );
}

export function ChooseModePage(): ReactElement {
  const router = useRouter();
  const setGameMode = useGameplayStore((state) => state.setGameMode);
  const setTimeDuration = useGameplayStore((state) => state.setTimeDuration);
  const setGamePhase = useGameplayStore((state) => state.setGamePhase);

  return (
    <ZenithShell>
      <main className={styles.main}>
        <header className={styles.hero}>
          <h1 className={styles.title}>Choose your challenge</h1>
          <p className={styles.subtitle}>
            Select a simulation mode to begin your ascent. Every strike counts toward your global standing.
          </p>
        </header>

        <div className={styles.grid}>
          <ModeCard
            accent="gold"
            modeLabel="Mode 1"
            title="Classic Arena"
            descriptionLines={[
              "Basis HP dari target yang memiliki waktu tertentu atau bisa jadi bom.",
              "Uji ketahanan dan ketepatan Anda.",
            ]}
            icon={<ListOrdered size={24} strokeWidth={2} />}
            watermark={<ListOrdered size={120} strokeWidth={1} />}
            onSelect={() => {
              setGameMode("story");
              setTimeDuration(90_000);
              setGamePhase("mode_select");
              router.push("/play/body");
            }}
          />
          <ModeCard
            accent="purple"
            modeLabel="Mode 2"
            title="Time Attack"
            descriptionLines={[
              "Dapatkan target sebanyak mungkin dalam waktu terbatas hanya 60 detik.",
              "Cepat dan mematikan!",
            ]}
            icon={<Timer size={26} strokeWidth={2} />}
            watermark={<Timer size={130} strokeWidth={1} />}
            onSelect={() => {
              setGameMode("time_target");
              setTimeDuration(60_000);
              setGamePhase("mode_select");
              router.push("/play/body");
            }}
          />
          <ModeCard
            accent="gold"
            modeLabel="Mode 3"
            title="Practice Dojo"
            descriptionLines={[
              "Target dan sesi tidak memiliki batas waktu. Berlatihlah sepuasnya hingga Anda menekan 'End Session'.",
            ]}
            icon={<BookOpen size={28} strokeWidth={2} />}
            watermark={<BookOpen size={110} strokeWidth={1} />}
            onSelect={() => {
              setGameMode("practice");
              setTimeDuration(null);
              setGamePhase("mode_select");
              router.push("/play/body");
            }}
          />
        </div>
      </main>
    </ZenithShell>
  );
}
