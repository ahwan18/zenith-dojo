import type { DirectorRequest, DirectorStreamEvent } from "./directorSchemas";
function missRate(req: DirectorRequest): number {
  const total = req.telemetry.hits + req.telemetry.misses;
  if (total === 0) return 0;
  return req.telemetry.misses / total;
}

/** Deterministic director when Gemini is unavailable (dev / missing API key). */
export function buildMockDirectorEvents(req: DirectorRequest): DirectorStreamEvent[] {
  const events: DirectorStreamEvent[] = [];
  const rate = missRate(req);
  const streak = req.telemetry.streak;

  if (req.trigger === "session_start") {
    events.push({
      type: "text",
      content:
        "Welcome, disciple. The dojo awakens with you. Read your objective and let your body answer before your mind hesitates.",
    });
    events.push({
      type: "call",
      name: "startChapter",
      args: {
        chapterId: "chapter_awakening",
        objectiveText: "Land 5 clean hits without missing a target.",
        durationMs: 90_000,
      },
    });
    events.push({
      type: "call",
      name: "setScene",
      args: { sceneId: "dojo_start" },
    });
    events.push({ type: "done" });
    return events;
  }

  if (rate >= 0.45 && req.telemetry.misses >= 2) {
    events.push({
      type: "text",
      content: "Your guard is loose. Slow the rhythm—extend fully, then strike.",
    });
    events.push({
      type: "call",
      name: "adjustDifficulty",
      args: { delta: -0.15 },
    });
    events.push({
      type: "call",
      name: "spawnTargetWave",
      args: { patternId: "recovery_flow", intensity: "low" },
    });
    events.push({
      type: "call",
      name: "setHudHint",
      args: { text: "Raise hands higher — align wrists with the target chip.", severity: "warning" },
    });
  } else if (streak >= 5) {
    events.push({
      type: "text",
      content: "Excellent flow. The arena shifts—prove you can keep the streak alive in harder light.",
    });
    events.push({
      type: "call",
      name: "setScene",
      args: { sceneId: "void_arena" },
    });
    events.push({
      type: "call",
      name: "spawnTargetWave",
      args: { patternId: "pressure_rush", intensity: "high" },
    });
    events.push({
      type: "call",
      name: "triggerCombo",
      args: { comboName: "Zenith Flare" },
    });
  } else if (streak >= 3) {
    events.push({
      type: "text",
      content: "Steady breath. Three hits in rhythm—do not rush the fourth.",
    });
    events.push({
      type: "call",
      name: "setHudHint",
      args: { text: "Horse stance charge doubles your next strike.", severity: "info" },
    });
  } else {
    events.push({
      type: "text",
      content: "Maintain center. I am watching your timing.",
    });
  }

  events.push({ type: "done" });
  return events;
}
