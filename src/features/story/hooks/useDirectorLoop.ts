"use client";

import { useEffect, useRef } from "react";

import { useGameplayStore } from "@/features/gameplay/stores/gameplayStore";

import { applyDirectorTool } from "../applyDirectorTool";
import { DirectorStreamEventSchema } from "../directorSchemas";
import { useStoryStore } from "../store";

const DIRECTOR_INTERVAL_MS = 5_000;
const MIN_CALL_GAP_MS = 4_500;

export interface DirectorTelemetry {
  hits: number;
  misses: number;
  streak: number;
  bestStreak: number;
  score: number;
  timeLeftMs: number;
  isRunning: boolean;
}

export function useDirectorLoop(telemetry: DirectorTelemetry) {
  const lastCallAtRef = useRef(0);
  const sessionStartedRef = useRef(false);
  const inFlightRef = useRef(false);
  const bufferRef = useRef("");

  const lastGesture = useGameplayStore((s) => s.lastGesture);

  useEffect(() => {
    if (!telemetry.isRunning) {
      sessionStartedRef.current = false;
      return;
    }

    const tick = async (trigger: "session_start" | "interval") => {
      if (inFlightRef.current) return;
      const now = Date.now();
      if (now - lastCallAtRef.current < MIN_CALL_GAP_MS) return;
      lastCallAtRef.current = now;
      inFlightRef.current = true;

      const story = useStoryStore.getState();
      story.setDirectorBusy(true);
      story.setStreamingNarrative("");

      try {
        const response = await fetch("/api/sensei/direct", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            trigger,
            telemetry: {
              hits: telemetry.hits,
              misses: telemetry.misses,
              streak: telemetry.streak,
              bestStreak: telemetry.bestStreak,
              score: telemetry.score,
              timeLeftMs: telemetry.timeLeftMs,
              lastGesture,
            },
            storyState: {
              currentSceneId: story.currentSceneId,
              currentChapterId: story.currentChapterId,
              objective: story.objective,
              difficultyMultiplier: story.difficultyMultiplier,
              narrativeTail: story.streamingNarrative || story.narrativeLog.at(-1)?.text,
            },
          }),
        });

        if (!response.ok) throw new Error(`Director HTTP ${response.status}`);

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        bufferRef.current = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          bufferRef.current += decoder.decode(value, { stream: true });
          const lines = bufferRef.current.split("\n");
          bufferRef.current = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;
            const raw: unknown = JSON.parse(line);
            const event = DirectorStreamEventSchema.safeParse(raw);
            if (!event.success) continue;

            const data = event.data;
            if (data.type === "text") {
              const current = useStoryStore.getState().streamingNarrative;
              useStoryStore.getState().setStreamingNarrative(current + data.content);
            } else if (data.type === "call") {
              applyDirectorTool(data.name, data.args);
            } else if (data.type === "error") {
              useStoryStore.getState().appendNarrative(data.message, "System");
            } else if (data.type === "done") {
              useStoryStore.getState().flushStreamingToLog();
            }
          }
        }

        useStoryStore.getState().flushStreamingToLog();
      } catch (err) {
        console.error("[Director Loop]", err);
        useStoryStore.getState().appendNarrative("The Sensei is silent… connection lost.", "System");
      } finally {
        inFlightRef.current = false;
        useStoryStore.getState().setDirectorBusy(false);
      }
    };

    if (!sessionStartedRef.current) {
      sessionStartedRef.current = true;
      void tick("session_start");
    }

    const intervalId = window.setInterval(() => {
      void tick("interval");
    }, DIRECTOR_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [
    telemetry.hits,
    telemetry.misses,
    telemetry.streak,
    telemetry.bestStreak,
    telemetry.score,
    telemetry.timeLeftMs,
    telemetry.isRunning,
    lastGesture,
  ]);
}
