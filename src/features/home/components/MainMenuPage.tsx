"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BarChart3, BookOpen, ChevronRight, PersonStanding, Settings } from "lucide-react";

import { APP_ROUTES } from "@/constants/appConstants";
import { ZenithShell } from "@/shared/components/ZenithShell/ZenithShell";

import styles from "./MainMenuPage.module.css";

interface SecondaryActionCardProps {
  href: string;
  title: string;
  description: string;
  icon: ReactElement;
}

function SecondaryActionCard({ href, title, description, icon }: SecondaryActionCardProps): ReactElement {
  return (
    <Link href={href} className={styles.secondaryLink}>
      <div className={styles.iconBox} aria-hidden="true">
        {icon}
      </div>
      <div className={styles.secondaryBody}>
        <h3 className={styles.secondaryTitle}>{title}</h3>
        <p className={styles.secondaryDesc}>{description}</p>
      </div>
      <ChevronRight className={styles.chevron} size={20} strokeWidth={2} aria-hidden="true" />
    </Link>
  );
}

export function MainMenuPage(): ReactElement {
  const reduceMotion = useReducedMotion();

  return (
    <ZenithShell>
      <main className={styles.main}>
        <div className={styles.heroTitleBlock}>
          <h1 className={styles.mainMenuTitle}>MAIN MENU</h1>
          <div className={styles.divider} role="presentation" />
        </div>

        <div className={styles.grid}>
          <motion.div
            className={styles.startColumn}
            initial={false}
            whileHover={reduceMotion ? undefined : { scale: 1.015 }}
            whileTap={reduceMotion ? undefined : { scale: 0.99 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          >
            <Link href={APP_ROUTES.chooseMode} className={styles.startLink}>
              <div className={styles.fighterWrap}>
                <PersonStanding size={88} strokeWidth={1.5} aria-hidden="true" />
              </div>
              <h2 className={styles.startHeading}>
                Start
                <br />
                game
              </h2>
              <p className={styles.startTagline}>
                Enter the arena, prove your
                <br />
                might.
              </p>
            </Link>
          </motion.div>

          <div className={styles.linksColumn}>
            <SecondaryActionCard
              href={APP_ROUTES.leaderboard}
              title="Leaderboard"
              description="Check rankings & rivals"
              icon={<BarChart3 size={28} strokeWidth={2} />}
            />
            <SecondaryActionCard
              href={APP_ROUTES.settings}
              title="Settings"
              description="Customize your experience"
              icon={<Settings size={28} strokeWidth={2} />}
            />
            <SecondaryActionCard
              href={APP_ROUTES.playCalibrate}
              title="Tutorial"
              description="Learn the ropes & master moves"
              icon={<BookOpen size={28} strokeWidth={2} />}
            />
          </div>
        </div>
      </main>
    </ZenithShell>
  );
}
