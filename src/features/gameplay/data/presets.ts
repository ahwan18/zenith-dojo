import type { GameplayData, TargetSequenceEntry } from "../types/combat.types";

/**
 * Fallback Preset Library
 * Used when Gemini API is unavailable or times out.
 */

const COMMON_JOINTS_UPPER = ["LEFT_SHOULDER", "RIGHT_SHOULDER", "LEFT_ELBOW", "RIGHT_ELBOW", "LEFT_WRIST", "RIGHT_WRIST"];
const COMMON_JOINTS_LOWER = ["LEFT_HIP", "RIGHT_HIP", "LEFT_KNEE", "RIGHT_KNEE", "LEFT_ANKLE", "RIGHT_ANKLE"];

const createSequence = (count: number, mode: "full" | "half"): TargetSequenceEntry[] => {
  const seq: TargetSequenceEntry[] = [];
  for (let i = 0; i < count; i++) {
    seq.push({
      x_percent: 15 + Math.random() * 70,
      y_percent: 20 + Math.random() * 60,
      radius_percent: 5 + Math.random() * 5,
      duration_ms: 1200 + Math.random() * 800,
      delay_ms: 500 + Math.random() * 1000,
      valid_joints: mode === "full"
        ? [...COMMON_JOINTS_UPPER, ...COMMON_JOINTS_LOWER].sort(() => Math.random() - 0.5).slice(0, 3)
        : COMMON_JOINTS_UPPER.sort(() => Math.random() - 0.5).slice(0, 3),
    });
  }
  return seq;
};

export const FALLBACK_PRESETS: Record<string, GameplayData> = {
  "full_body_medium": {
    theme: "Celestial Void Dojo",
    storyNarrative: "You step through the shimmering threshold, your feet touching the cool, polished obsidian of a temple suspended amidst a swirling galactic nebula. Stardust drifts through the open arches, illuminating the silent arena where your spirit will be tested.",
    target_sequence: createSequence(20, "full"),
    expectedTotalScore: 2000,
  },
  "half_body_medium": {
    theme: "Celestial Void Dojo",
    storyNarrative: "In the neon silence of the cyber-dojo, precision is everything. Only the upper body can carve through the static of the Celestial Void.",
    target_sequence: createSequence(20, "half"),
    expectedTotalScore: 2000,
  },
};

export function getFallbackLevel(mode: "full_body" | "half_body", difficulty: string = "medium"): GameplayData {
  const key = `${mode}_${difficulty}`;
  return FALLBACK_PRESETS[key] || FALLBACK_PRESETS[mode === "full_body" ? "full_body_medium" : "half_body_medium"];
}
