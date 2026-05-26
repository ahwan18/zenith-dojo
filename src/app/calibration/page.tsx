"use client";

import { useLayoutEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ZenithShell } from "@/shared/components/ZenithShell/ZenithShell";
import { ActionRow } from "@/shared/components/ActionRow/ActionRow";
import { Button } from "@/shared/components/Button/Button";
import { Card } from "@/shared/components/Card/Card";
import { CalibrationOverlay, useVisionSession, VisionFeedPanel } from "@/features/vision";
import { ErrorState } from "@/shared/components/ErrorState/ErrorState";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";

import calibrationStyles from "./calibrationPage.module.css";

export default function CalibrationPage() {
  const router = useRouter();
  const { status, error, videoRef, poseFrame, fps, luxScore, isLuxOk, visibleLandmarksCount, isPoseValid } =
    useVisionSession();

  useLayoutEffect(() => {
    router.replace("/play/calibrate");
  }, [router]);

  return (
    <ZenithShell>
      <main className={calibrationStyles.main}>
        <div className={calibrationStyles.grid}>
          <Card title="Calibration" subtitle="Camera + pose overlay">
            {status === "error" ? (
              <ErrorState title="Vision session error" message={error ?? "Unknown error"} />
            ) : null}

            <VisionFeedPanel
              status={status}
              videoRef={videoRef}
              poseFrame={poseFrame}
              initializingLabel="Initializing MediaPipe…"
            />

            {status === "ready" && !poseFrame ? (
              <EmptyState
                title="No pose detected yet"
                message="Step into frame and ensure enough lighting for detection."
              />
            ) : null}

            <ActionRow>
              <Button asChild variant="secondary">
                <Link href="/choose-mode">Back</Link>
              </Button>
              <Button asChild variant="primary">
                <Link href="/game">Continue to Combat</Link>
              </Button>
            </ActionRow>
          </Card>

          <Card title="Lighting Check" subtitle="Lux score and pose quality">
            {status === "ready" ? (
              <CalibrationOverlay
                luxScore={luxScore}
                isLuxOk={isLuxOk}
                fps={fps}
                visibleLandmarksCount={visibleLandmarksCount}
                isPoseValid={isPoseValid}
              />
            ) : (
              <p>Lux score validation appears once the camera is ready.</p>
            )}
          </Card>
        </div>
      </main>
    </ZenithShell>
  );
}
