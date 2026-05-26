"use client";

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// import { SenseiHud } from "@/features/sensei";
import { useVisionSession } from "@/features/vision";
import {
  CameraTargetOverlay,
  CombatSessionLayout,
  CombatSessionLeftHud,
  CombatSessionRightHud,
  CombatSessionTopBar,
  TrackingOverlay,
  useCombatSession,
  useGameplayStore,
  useMovementLogic,
  useTargetHitDetection,
  useTargetSpawner,
} from "@/features/gameplay";
import { SenseiStoryPanel } from "@/features/story/components/SenseiStoryPanel";
import { useDirectorLoop } from "@/features/story/hooks/useDirectorLoop";
import { useStoryStore } from "@/features/story/store";
import type { GestureEvent } from "@/features/gameplay";
import { ErrorState } from "@/shared/components/ErrorState/ErrorState";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { Spinner } from "@/shared/components/Spinner/Spinner";

import gameStyles from "./gamePage.module.css";

const CLASSIC_DURATION_MS = 90_000;
const TIME_ATTACK_DURATION_MS = 60_000;

function GamePageFallback() {
  return (
    <div className={gameStyles.fallbackRoot} role="status" aria-live="polite">
      <Spinner label="Loading combat…" />
    </div>
  );
}

function GamePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  const sessionDurationMs = useMemo(() => {
    return mode === "timeAttack" ? TIME_ATTACK_DURATION_MS : CLASSIC_DURATION_MS;
  }, [mode]);

  const { status, error, videoRef, poseFrame, fps, luxScore, isLuxOk, isPoseValid } = useVisionSession();
  const updateTrackingStatus = useGameplayStore((state) => state.updateTrackingStatus);
  const { detectGesture } = useMovementLogic();
  const registerPunch = useGameplayStore((state) => state.registerPunch);
  const registerSquatDodge = useGameplayStore((state) => state.registerSquatDodge);
  const startHorseStanceCharge = useGameplayStore((state) => state.startHorseStanceCharge);
  const stopHorseStanceCharge = useGameplayStore((state) => state.stopHorseStanceCharge);
  const registerHit = useGameplayStore((state) => state.registerHit);
  const registerMiss = useGameplayStore((state) => state.registerMiss);
  const endCombatSession = useGameplayStore((state) => state.endCombatSession);
  const resetSession = useGameplayStore((state) => state.resetSession);
  const resetStory = useStoryStore((state) => state.reset);

  const currentScore = useGameplayStore((state) => state.currentScore);
  const lastGesture = useGameplayStore((state) => state.lastGesture);
  const isHorseStanceCharging = useGameplayStore((state) => state.isHorseStanceCharging);
  const hits = useGameplayStore((state) => state.hits);
  const misses = useGameplayStore((state) => state.misses);
  const bestStreak = useGameplayStore((state) => state.bestStreak);
  const currentStreak = useGameplayStore((state) => state.currentStreak);

  const activeCombo = useGameplayStore((state) => state.activeCombo);
  const gamePhase = useGameplayStore((state) => state.gamePhase);

  /** Entering /game after a finished run (e.g. home → game) must clear `ended` so a new match can start. */
  useLayoutEffect(() => {
    if (useGameplayStore.getState().gamePhase === "finished") {
      resetSession();
      resetStory();
    }
  }, [resetSession, resetStory]);

  const [lastDetectedGesture, setLastDetectedGesture] = useState<GestureEvent | null>(null);
  const lastHorseStanceAtMsRef = useRef<number | null>(null);
  const lastCountedTargetIdRef = useRef<string | null>(null);
  /** One store update per detected gesture (pose frames re-fire the same gesture). */
  const lastProcessedGestureKeyRef = useRef<string | null>(null);

  const gestureEvent = useMemo(() => detectGesture(poseFrame), [detectGesture, poseFrame]);

  useEffect(() => {
    if (gamePhase === "playing") return;
    lastProcessedGestureKeyRef.current = null;
    lastCountedTargetIdRef.current = null;
    lastHorseStanceAtMsRef.current = null;
  }, [gamePhase]);

  const { timeLeftMs, timeLeftSeconds, isRunning } = useCombatSession(sessionDurationMs);

  useDirectorLoop({
    hits,
    misses,
    streak: currentStreak,
    bestStreak,
    score: currentScore,
    timeLeftMs,
    isRunning,
  });
  const { activeTarget, hitActiveTarget } = useTargetSpawner({
    isRunning,
    timeLeftMs,
    sessionDurationMs,
  });
  const { isHit: isTargetHit } = useTargetHitDetection(poseFrame, activeTarget);

  const hpPercent = useMemo(() => Math.max(0, 100 - misses * 8), [misses]);

  useEffect(() => {
    if (!gestureEvent) return;

    const gestureKey = `${gestureEvent.type}:${gestureEvent.detectedAtMs}`;
    if (lastProcessedGestureKeyRef.current === gestureKey) return;
    lastProcessedGestureKeyRef.current = gestureKey;

    setLastDetectedGesture(gestureEvent);

    if (gestureEvent.type === "punch") {
      registerPunch();
      if (isRunning && activeTarget && activeTarget.state === "active") {
        if (lastCountedTargetIdRef.current === activeTarget.id) return;
        const didHit = hitActiveTarget();
        if (didHit) {
          const now = Date.now();
          const targetDuration = activeTarget.expiresAtMs - activeTarget.spawnedAtMs;
          const timeElapsed = now - activeTarget.spawnedAtMs;
          const hitType = timeElapsed < targetDuration * 0.3 ? "fast" : "normal";

          registerHit(hitType);
          stopHorseStanceCharge();
          lastCountedTargetIdRef.current = activeTarget.id;
        }
      }
      return;
    }
    if (gestureEvent.type === "squat") {
      registerSquatDodge();
      return;
    }
    if (gestureEvent.type === "horseStance") {
      lastHorseStanceAtMsRef.current = gestureEvent.detectedAtMs;
      startHorseStanceCharge();
    }
  }, [
    activeTarget,
    gestureEvent,
    hitActiveTarget,
    isHorseStanceCharging,
    isRunning,
    registerHit,
    registerPunch,
    registerSquatDodge,
    startHorseStanceCharge,
    stopHorseStanceCharge,
  ]);

  useEffect(() => {
    if (!isRunning) return;
    if (!activeTarget || activeTarget.state !== "active") return;
    if (!poseFrame) return;
    if (!isTargetHit) return;
    if (lastCountedTargetIdRef.current === activeTarget.id) return;

    const didHit = hitActiveTarget();
    if (!didHit) return;

    const now = Date.now();
    const targetDuration = activeTarget.expiresAtMs - activeTarget.spawnedAtMs;
    const timeElapsed = now - activeTarget.spawnedAtMs;
    const hitType = timeElapsed < targetDuration * 0.3 ? "fast" : "normal";

    registerHit(hitType);
    stopHorseStanceCharge();
    lastCountedTargetIdRef.current = activeTarget.id;
  }, [
    activeTarget,
    hitActiveTarget,
    isRunning,
    isTargetHit,
    poseFrame,
    registerHit,
    stopHorseStanceCharge,
  ]);

  useEffect(() => {
    if (!isRunning) return;
    if (!activeTarget) return;
    if (activeTarget.state !== "missed") return;
    if (lastCountedTargetIdRef.current === activeTarget.id) return;

    registerMiss();
    lastCountedTargetIdRef.current = activeTarget.id;
  }, [activeTarget, isRunning, registerMiss]);

  useEffect(() => {
    if (!isHorseStanceCharging) return;

    const intervalId = window.setInterval(() => {
      const lastHorseStanceAtMs = lastHorseStanceAtMsRef.current;
      if (!lastHorseStanceAtMs) return;
      const nowMs = Date.now();
      if (nowMs - lastHorseStanceAtMs >= 900) {
        stopHorseStanceCharge();
      }
    }, 250);

    return () => window.clearInterval(intervalId);
  }, [isHorseStanceCharging, stopHorseStanceCharge]);

  useEffect(() => {
    updateTrackingStatus(isPoseValid);
  }, [isPoseValid, updateTrackingStatus]);

  useEffect(() => {
    if (gamePhase !== "finished") return;
    router.push("/play/results");
  }, [gamePhase, router]);

  const handleEndSession = () => {
    endCombatSession();
    router.push("/play/results");
  };

  const centerColumn = (
    <div className={gameStyles.cameraColumn}>
      {status === "error" ? (
        <div className={gameStyles.cameraError}>
          <ErrorState title="Vision session error" message={error ?? "Unknown error"} />
        </div>
      ) : (
        <>
          <CameraTargetOverlay
            status={status}
            videoRef={videoRef}
            poseFrame={poseFrame}
            activeTarget={activeTarget}
            variant="ar"
            initializingLabel="Initializing vision…"
          />
          {status === "ready" && !poseFrame ? (
            <div className={gameStyles.poseHint}>
              <EmptyState title="No pose yet" message="Step into frame to start gesture detection." />
            </div>
          ) : null}
        </>
      )}
      {process.env.NODE_ENV === "development" ? (
        <p className={gameStyles.devMeta} aria-hidden>
          FPS {fps ?? "—"} · Lux {luxScore ?? "—"}
          {!isLuxOk ? " (low light)" : ""} · Pose {isPoseValid ? "ok" : "weak"} · {lastGesture ?? "—"} · HS{" "}
          {isHorseStanceCharging ? "on" : "off"}
          {lastDetectedGesture
            ? ` · ${lastDetectedGesture.type} ${Math.round(lastDetectedGesture.confidence * 100)}%`
            : ""}
          · best {bestStreak}
        </p>
      ) : null}
    </div>
  );

  return (
    <>
      <CombatSessionLayout
        topBar={<CombatSessionTopBar />}
        leftHud={
          <CombatSessionLeftHud
            hpPercent={hpPercent}
            timeLeftSeconds={timeLeftSeconds}
            currentStreak={currentStreak}
            activeCombo={activeCombo}
          />
        }
        center={centerColumn}
        rightHud={
          <CombatSessionRightHud score={currentScore} misses={misses} hits={hits} currentStreak={currentStreak} />
        }
        senseiRail={null}
        onEndSession={handleEndSession}
      />
      <SenseiStoryPanel />
      <TrackingOverlay />
    </>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={<GamePageFallback />}>
      <GamePageContent />
    </Suspense>
  );
}
