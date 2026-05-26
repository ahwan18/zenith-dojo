import { z } from "zod";

import { SCENE_IDS } from "./types";

export const PlayerTelemetrySchema = z.object({
  hits: z.number().int().min(0),
  misses: z.number().int().min(0),
  streak: z.number().int().min(0),
  bestStreak: z.number().int().min(0),
  score: z.number().int().min(0),
  timeLeftMs: z.number().int().min(0),
  lastGesture: z.enum(["punch", "squat", "horseStance"]).nullable().optional(),
});

export const StoryStateSnapshotSchema = z.object({
  currentSceneId: z.enum(SCENE_IDS),
  currentChapterId: z.string().min(1),
  objective: z.string(),
  difficultyMultiplier: z.number().min(0.25).max(3),
  narrativeTail: z.string().max(2000).optional(),
});

export const DirectorRequestSchema = z.object({
  telemetry: PlayerTelemetrySchema,
  storyState: StoryStateSnapshotSchema,
  trigger: z.enum(["session_start", "interval", "performance_shift"]).default("interval"),
});

export type DirectorRequest = z.infer<typeof DirectorRequestSchema>;

export const SetSceneArgsSchema = z.object({
  sceneId: z.enum(SCENE_IDS),
});

export const StartChapterArgsSchema = z.object({
  chapterId: z.string().min(1),
  objectiveText: z.string().min(1).max(280),
  durationMs: z.number().int().positive().optional(),
});

export const SpawnTargetWaveArgsSchema = z.object({
  patternId: z.string().min(1),
  intensity: z.enum(["low", "medium", "high"]),
});

export const AdjustDifficultyArgsSchema = z.object({
  delta: z.number().min(-1).max(1),
});

export const TriggerComboArgsSchema = z.object({
  comboName: z.string().min(1).max(64),
});

export const SetHudHintArgsSchema = z.object({
  text: z.string().min(1).max(200),
  severity: z.enum(["info", "warning", "critical"]),
});

export const DirectorToolNameSchema = z.enum([
  "setScene",
  "startChapter",
  "spawnTargetWave",
  "adjustDifficulty",
  "triggerCombo",
  "setHudHint",
]);

export type DirectorToolName = z.infer<typeof DirectorToolNameSchema>;

export const DirectorStreamEventSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), content: z.string() }),
  z.object({
    type: z.literal("call"),
    name: DirectorToolNameSchema,
    args: z.record(z.unknown()),
  }),
  z.object({ type: z.literal("done") }),
  z.object({ type: z.literal("error"), message: z.string() }),
]);

export type DirectorStreamEvent = z.infer<typeof DirectorStreamEventSchema>;

export function parseDirectorToolArgs(
  name: DirectorToolName,
  args: Record<string, unknown>
): { ok: true; data: unknown } | { ok: false } {
  const schemas = {
    setScene: SetSceneArgsSchema,
    startChapter: StartChapterArgsSchema,
    spawnTargetWave: SpawnTargetWaveArgsSchema,
    adjustDifficulty: AdjustDifficultyArgsSchema,
    triggerCombo: TriggerComboArgsSchema,
    setHudHint: SetHudHintArgsSchema,
  } as const;

  const schema = schemas[name];
  const result = schema.safeParse(args);
  return result.success ? { ok: true, data: result.data } : { ok: false };
}
