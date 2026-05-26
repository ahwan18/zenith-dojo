"use client";

import type { ReactElement } from "react";
import type { RefObject } from "react";

import type { PoseLandmarksFrame } from "@/features/vision/types/vision.types";
import type { VisionStatus } from "@/features/vision/hooks/useVisionSession";

import { PoseCanvas } from "./PoseCanvas";
import { Spinner } from "@/shared/components/Spinner/Spinner";

import styles from "./VisionFeedPanel.module.css";

interface VisionFeedPanelProps {
  status: VisionStatus;
  videoRef: RefObject<HTMLVideoElement>;
  poseFrame: PoseLandmarksFrame | null;
  isCompact?: boolean;
  initializingLabel: string;
}

export function VisionFeedPanel({
  status,
  videoRef,
  poseFrame,
  isCompact = false,
  initializingLabel,
}: VisionFeedPanelProps): ReactElement | null {
  if (status === "error") {
    return null;
  }

  const showOverlay = status === "idle" || status === "initializing";

  return (
    <div className={styles.stage}>
      <PoseCanvas
        videoRef={videoRef}
        poseFrame={status === "ready" ? poseFrame : null}
        isCompact={isCompact}
      />
      {showOverlay ? (
        <div
          className={styles.overlay}
          aria-busy={status === "initializing"}
          aria-live="polite"
        >
          {status === "initializing" ? (
            <Spinner label={initializingLabel} />
          ) : (
            <p className={styles.idleMessage}>Preparing camera and vision model…</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
