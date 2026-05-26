"use client";

import type { RefObject } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PoseLandmarksFrame, PoseLandmark } from "@/features/vision";
import type { PoseLandmarker } from "@mediapipe/tasks-vision";

export type VisionStatus = "idle" | "initializing" | "ready" | "error";

interface UseVisionSessionResult {
  status: VisionStatus;
  error: string | null;
  videoRef: RefObject<HTMLVideoElement>;
  poseFrame: PoseLandmarksFrame | null;
  fps: number | null;
  luxScore: number | null;
  isLuxOk: boolean;
  visibleLandmarksCount: number;
  isPoseValid: boolean;
}

const MIN_LUX_SCORE = 50;
const MIN_VISIBLE_LANDMARKS = 20;
const MIN_VISIBILITY = 0.6;

function computeLuxScore(imageData: ImageData): number {
  const data = imageData.data;
  let total = 0;
  const pixelCount = imageData.width * imageData.height;

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index] ?? 0;
    const green = data[index + 1] ?? 0;
    const blue = data[index + 2] ?? 0;
    const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    total += luminance;
  }

  const average = total / pixelCount;
  // Map 0-255 -> 0-100 (heuristic score, not physical lux).
  return Math.round((average / 255) * 100);
}

function countVisibleLandmarks(landmarks: PoseLandmark[]): number {
  return landmarks.reduce((count, landmark) => {
    const visibility = landmark.visibility ?? 0;
    return visibility > MIN_VISIBILITY ? count + 1 : count;
  }, 0);
}

export function useVisionSession(): UseVisionSessionResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const [status, setStatus] = useState<VisionStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [poseFrame, setPoseFrame] = useState<PoseLandmarksFrame | null>(null);
  const [fps, setFps] = useState<number | null>(null);
  const [luxScore, setLuxScore] = useState<number | null>(null);

  const frameCounterRef = useRef<{ lastSecondMs: number; framesInSecond: number }>({
    lastSecondMs: 0,
    framesInSecond: 0,
  });

  const luxCounterRef = useRef<{ lastSampleMs: number; canvas: HTMLCanvasElement | null }>({
    lastSampleMs: 0,
    canvas: null,
  });

  const visibleLandmarksCount = useMemo(() => {
    if (!poseFrame) return 0;
    return countVisibleLandmarks(poseFrame.landmarks);
  }, [poseFrame]);

  const isPoseValid = poseFrame ? visibleLandmarksCount >= MIN_VISIBLE_LANDMARKS : false;
  const isLuxOk = (luxScore ?? 0) >= MIN_LUX_SCORE;

  useEffect(() => {
    let isCancelled = false;

    const cleanup = async () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }

      const video = videoRef.current;
      if (video) {
        video.srcObject = null;
      }
    };

    const start = async () => {
      setStatus("initializing");
      setError(null);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });

        if (isCancelled) return;
        mediaStreamRef.current = stream;

        const video = videoRef.current;
        if (!video) {
          throw new Error("Video element is not available.");
        }

        video.srcObject = stream;
        video.playsInline = true;
        video.muted = true;
        await video.play();

        const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");

        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        );

        if (isCancelled) return;

        landmarkerRef.current = await PoseLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
        });

        if (isCancelled) return;
        setStatus("ready");

        const loop = (nowMs: number) => {
          const landmarker = landmarkerRef.current;
          const videoEl = videoRef.current;

          if (!landmarker || !videoEl) {
            rafIdRef.current = requestAnimationFrame(loop);
            return;
          }

        if (videoEl.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          try {
            const results = landmarker.detectForVideo(videoEl, nowMs);
            const firstPose = results.landmarks?.[0] ?? null;

            if (firstPose && firstPose.length > 0) {
              const landmarks: PoseLandmark[] = firstPose.map((landmark: PoseLandmark) => ({
                x: landmark.x,
                y: landmark.y,
                z: landmark.z,
                visibility: landmark.visibility,
              }));

                setPoseFrame({
                  timestampMs: Math.floor(nowMs),
                  landmarks,
                });
              } else {
                setPoseFrame(null);
              }
            } catch (detectError) {
              setError(detectError instanceof Error ? detectError.message : "Pose detection failed.");
              setStatus("error");
            }

            const counter = frameCounterRef.current;
            if (counter.lastSecondMs === 0) {
              counter.lastSecondMs = nowMs;
              counter.framesInSecond = 0;
            }
            counter.framesInSecond += 1;
            if (nowMs - counter.lastSecondMs >= 1000) {
              setFps(counter.framesInSecond);
              counter.lastSecondMs = nowMs;
              counter.framesInSecond = 0;
            }

            const luxCounter = luxCounterRef.current;
            if (nowMs - luxCounter.lastSampleMs >= 600) {
              if (!luxCounter.canvas) {
                luxCounter.canvas = document.createElement("canvas");
              }
              const canvas = luxCounter.canvas;
              const ctx = canvas.getContext("2d", { willReadFrequently: true });
              if (ctx && videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
                const sampleWidth = 48;
                const sampleHeight = 27;
                canvas.width = sampleWidth;
                canvas.height = sampleHeight;
                ctx.drawImage(videoEl, 0, 0, sampleWidth, sampleHeight);
                const data = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
                setLuxScore(computeLuxScore(data));
              }
              luxCounter.lastSampleMs = nowMs;
            }
          }

          rafIdRef.current = requestAnimationFrame(loop);
        };

        rafIdRef.current = requestAnimationFrame(loop);
      } catch (startError) {
        if (isCancelled) return;
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }
        const videoOnError = videoRef.current;
        if (videoOnError) {
          videoOnError.srcObject = null;
        }
        setError(startError instanceof Error ? startError.message : "Vision session failed.");
        setStatus("error");
      }
    };

    void start();

    return () => {
      isCancelled = true;
      void cleanup();
    };
  }, []);

  return {
    status,
    error,
    videoRef,
    poseFrame,
    fps,
    luxScore,
    isLuxOk,
    visibleLandmarksCount,
    isPoseValid,
  };
}
