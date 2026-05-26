export const SCENE_IDS = [
  "dojo_start",
  "mountain_peak",
  "forest_temple",
  "void_arena",
  "boss_chamber",
] as const;

export type SceneId = (typeof SCENE_IDS)[number];

export type WaveIntensity = "low" | "medium" | "high";

export type HudHintSeverity = "info" | "warning" | "critical";

export interface SceneConfig {
  id: SceneId;
  name: string;
  /** Optional image path; CSS gradient used when asset missing. */
  backgroundAsset?: string;
  backgroundGradient: string;
  ambientColor: string;
  musicTrack?: string;
  fxConfig: {
    intensity: WaveIntensity;
    particleType: "dust" | "cherry_blossom" | "energy_void" | "fire";
  };
}

export interface NarrativeEntry {
  timestamp: number;
  text: string;
  speaker: "Sensei" | "System";
}

export interface TargetWaveConfig {
  patternId: string;
  intensity: WaveIntensity;
}

export interface HudHintState {
  text: string;
  severity: HudHintSeverity;
}

export interface StoryState {
  currentChapterId: string;
  currentSceneId: SceneId;
  objective: string;
  chapterDurationMs: number | null;
  narrativeLog: NarrativeEntry[];
  streamingNarrative: string;
  isDirectorBusy: boolean;
  difficultyMultiplier: number;
  sessionScore: number;
  targetWave: TargetWaveConfig | null;
  hudHint: HudHintState | null;
  activeComboName: string | null;
  autoSceneEnabled: boolean;
}
