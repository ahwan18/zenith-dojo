"use client";

import type { ReactElement } from "react";
import type { RefObject } from "react";
import { useEffect, useMemo, useRef } from "react";
import { useGameplayStore } from "@/features/gameplay/stores/gameplayStore";

import type { PoseLandmarksFrame } from "@/features/vision";

import styles from "./PoseCanvas.module.css";

interface PoseCanvasProps {
  videoRef: RefObject<HTMLVideoElement>;
  poseFrame: PoseLandmarksFrame | null;
  isCompact?: boolean;
  immersive?: boolean;
}

function drawPose(ctx: CanvasRenderingContext2D, poseFrame: PoseLandmarksFrame) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);

  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(123, 194, 156, 0.9)";
  ctx.fillStyle = "rgba(125, 199, 217, 0.9)";

  const landmarks = poseFrame.landmarks;
  const drawPoint = (index: number) => {
    const landmark = landmarks[index];
    if (!landmark) return;
    const x = landmark.x * width;
    const y = landmark.y * height;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  };

  const connect = (from: number, to: number) => {
    const start = landmarks[from];
    const end = landmarks[to];
    if (!start || !end) return;
    ctx.beginPath();
    ctx.moveTo(start.x * width, start.y * height);
    ctx.lineTo(end.x * width, end.y * height);
    ctx.stroke();
  };

  connect(11, 12);
  connect(11, 13);
  connect(13, 15);
  connect(12, 14);
  connect(14, 16);
  connect(23, 24);
  connect(11, 23);
  connect(12, 24);
  connect(23, 25);
  connect(25, 27);
  connect(24, 26);
  connect(26, 28);

  [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].forEach(drawPoint);
}

export function PoseCanvas({
  videoRef,
  poseFrame,
  isCompact = false,
  immersive = false,
}: PoseCanvasProps): ReactElement {
  const showSkeleton = useGameplayStore((state) => state.showSkeleton);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // We use a ref to track the current poseFrame without triggering re-renders.
  // This allows the render loop to pull the latest data.
  const latestPoseRef = useRef<PoseLandmarksFrame | null>(null);

  useEffect(() => {
    latestPoseRef.current = poseFrame;
  }, [poseFrame]);

  const containerClassName = useMemo(() => {
    return [styles.container, isCompact ? styles.compact : "", immersive ? styles.immersive : ""]
      .filter(Boolean)
      .join(" ");
  }, [immersive, isCompact]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width));
      canvas.height = Math.max(1, Math.floor(rect.height));
    };

    resize();
    const observer = new ResizeObserver(() => resize());
    observer.observe(container);

    return () => observer.disconnect();
  }, [videoRef]);

  useEffect(() => {
    let rafId: number;

    const renderLoop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const currentPose = latestPoseRef.current;

      if (!currentPose || !showSkeleton) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else {
        drawPose(ctx, currentPose);
      }

      rafId = requestAnimationFrame(renderLoop);
    };

    rafId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(rafId);
  }, [showSkeleton]);

  return (
    <div ref={containerRef} className={containerClassName}>
      <video ref={videoRef} className={styles.video} />
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
