"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Camera, Sun, User } from "lucide-react";

import { useGameplayStore } from "@/features/gameplay/stores/gameplayStore";
import { useVisionSession } from "@/features/vision/hooks/useVisionSession";
import { CameraTargetOverlay } from "@/features/gameplay/components/CameraTargetOverlay/CameraTargetOverlay";

import styles from "./calibrate.module.css";

type Step = 1 | 2 | 3;

export default function CalibrationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isStable, setIsStable] = useState(false);
  const [stabilityTimer, setStabilityTimer] = useState(0);

  const { bodyMode, setGamePhase } = useGameplayStore();
  const { status, luxScore, visibleLandmarksCount, isPoseValid, videoRef } = useVisionSession();

  // Step 3: Stability logic - must be valid for 3 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentStep === 3 && isPoseValid) {
      timer = setInterval(() => {
        setStabilityTimer((prev) => prev + 100);
      }, 100);
    } else {
      setStabilityTimer(0);
    }
    return () => clearInterval(timer);
  }, [currentStep, isPoseValid]);

  useEffect(() => {
    if (stabilityTimer >= 3000) {
      setIsStable(true);
    }
  }, [stabilityTimer]);

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev === 1 ? 2 : 3));
    } else {
      // Finish calibration
      setGamePhase("loading");
      router.push("/play/loading");
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev === 3 ? 2 : 1));
    }
  };

  // Step 1: Device Check
  const renderStep1 = () => (
    <div className={styles.stepContent}>
      <div className={styles.iconCircle}>
        <Camera size={48} />
      </div>
      <h2>Camera Access</h2>
      <p>We need camera access to track your movements. Please ensure your camera is enabled.</p>

      <div className={styles.statusBox}>
        {status === "ready" ? (
          <div className={styles.statusReady}>
            <CheckCircle2 size={20} />
            <span>Camera & Vision Model Ready</span>
          </div>
        ) : status === "error" ? (
          <div className={styles.statusError}>
            <AlertCircle size={20} />
            <span>Camera Access Denied or Not Found</span>
          </div>
        ) : (
          <div className={styles.statusPending}>
            <span>Initializing Vision System...</span>
          </div>
        )}
      </div>

      <div className={styles.bodyModeConfirm}>
        <p>Selected Mode: <strong>{bodyMode === "full_body" ? "Full Body" : "Half Body"}</strong></p>
        <button onClick={() => router.push("/play/body")} className={styles.changeBtn}>Change Mode</button>
      </div>
    </div>
  );

  // Step 2: Lighting Check
  const renderStep2 = () => {
    let luxMessage = "Analyzing lighting...";
    let luxStatus = "pending";

    if (luxScore !== null) {
      if (luxScore < 80) {
        luxMessage = "Too Dark! Please turn on the lights or move to a brighter area.";
        luxStatus = "error";
      } else if (luxScore > 220) {
        luxMessage = "Too Bright! Avoid strong light sources behind you.";
        luxStatus = "error";
      } else {
        luxMessage = "Lighting is optimal for tracking.";
        luxStatus = "ready";
      }
    }

    return (
      <div className={styles.stepContent}>
        <div className={styles.iconCircle}>
          <Sun size={48} />
        </div>
        <h2>Lighting Check</h2>
        <p>Poor lighting can interfere with AI pose detection. Ensure your space is well-lit.</p>

        <div className={`${styles.statusBox} ${styles[luxStatus]}`}>
          {luxStatus === "ready" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{luxMessage}</span>
        </div>
      </div>
    );
  };

  // Step 3: Position Check
  const renderStep3 = () => {
    const requiredJoints = bodyMode === "full_body" ? 12 : 6;
    const progress = Math.min((stabilityTimer / 3000) * 100, 100);

    return (
      <div className={styles.stepContent}>
        <div className={styles.iconCircle}>
          <User size={48} />
        </div>
        <h2>Position Check</h2>
        <p>Step into the frame. Ensure your {bodyMode === "full_body" ? "entire body" : "upper body"} is clearly visible.</p>

        <div className={styles.jointStatus}>
          <div className={styles.jointCount}>
            <span>Joints Detected:</span>
            <span className={visibleLandmarksCount >= requiredJoints ? styles.ready : ""}>
              {visibleLandmarksCount} / {requiredJoints}
            </span>
          </div>

          {isPoseValid ? (
            <div className={styles.stabilityBarContainer}>
              <div className={styles.stabilityBar} style={{ width: `${progress}%` }} />
            </div>
          ) : (
            <div className={styles.statusError}>
              <AlertCircle size={20} />
              <span>Please adjust your position</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.root}>
      <CameraTargetOverlay
        status={status}
        videoRef={videoRef}
        poseFrame={null} // We don't need targets here
        activeTarget={null}
        variant="default"
        initializingLabel="Preparing Calibration..."
      />

      <div className={styles.uiLayer}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={styles.card}
          >
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            <div className={styles.nav}>
              <button onClick={prevStep} disabled={currentStep === 1} className={styles.backBtn}>
                Back
              </button>
              <button
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && status !== "ready") ||
                  (currentStep === 2 && (luxScore === null || luxScore < 80 || luxScore > 220)) ||
                  (currentStep === 3 && !isStable)
                }
                className={styles.nextBtn}
              >
                {currentStep === 3 ? "Start Game" : "Next Step"}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
