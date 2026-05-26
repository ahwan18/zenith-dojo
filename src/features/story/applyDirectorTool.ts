import { useGameplayStore } from "@/features/gameplay/stores/gameplayStore";

import type {
  AdjustDifficultyArgsSchema,
  SetHudHintArgsSchema,
  SetSceneArgsSchema,
  SpawnTargetWaveArgsSchema,
  StartChapterArgsSchema,
  TriggerComboArgsSchema,
} from "./directorSchemas";
import { parseDirectorToolArgs, type DirectorToolName } from "./directorSchemas";
import { useStoryStore } from "./store";
import type { SceneId } from "./types";
import type { z } from "zod";

type SetSceneArgs = z.infer<typeof SetSceneArgsSchema>;
type StartChapterArgs = z.infer<typeof StartChapterArgsSchema>;
type SpawnTargetWaveArgs = z.infer<typeof SpawnTargetWaveArgsSchema>;
type AdjustDifficultyArgs = z.infer<typeof AdjustDifficultyArgsSchema>;
type TriggerComboArgs = z.infer<typeof TriggerComboArgsSchema>;
type SetHudHintArgs = z.infer<typeof SetHudHintArgsSchema>;

/** Apply a validated director tool call to story + gameplay stores (client-only). */
export function applyDirectorTool(name: DirectorToolName, rawArgs: Record<string, unknown>): boolean {
  const parsed = parseDirectorToolArgs(name, rawArgs);
  if (!parsed.ok) {
    console.warn("[Director] Rejected invalid tool payload:", name, rawArgs);
    return false;
  }

  const story = useStoryStore.getState();
  const gameplay = useGameplayStore.getState();

  switch (name) {
    case "setScene": {
      const args = parsed.data as SetSceneArgs;
      if (!story.autoSceneEnabled) return true;
      story.setScene(args.sceneId as SceneId);
      return true;
    }
    case "startChapter": {
      const args = parsed.data as StartChapterArgs;
      story.setChapter(args.chapterId, args.objectiveText, args.durationMs);
      return true;
    }
    case "spawnTargetWave": {
      const args = parsed.data as SpawnTargetWaveArgs;
      story.setTargetWave(args.patternId, args.intensity);
      return true;
    }
    case "adjustDifficulty": {
      const args = parsed.data as AdjustDifficultyArgs;
      const delta = Math.max(-1, Math.min(1, args.delta));
      story.adjustDifficulty(delta);
      if (delta > 0.08) gameplay.applyDifficultyDelta(1);
      else if (delta < -0.08) gameplay.applyDifficultyDelta(-1);
      return true;
    }
    case "triggerCombo": {
      const args = parsed.data as TriggerComboArgs;
      story.setActiveCombo(args.comboName);
      gameplay.setActiveCombo(args.comboName);
      return true;
    }
    case "setHudHint": {
      const args = parsed.data as SetHudHintArgs;
      story.setHudHint(args.text, args.severity);
      return true;
    }
    default:
      return false;
  }
}
