import type { SceneConfig, SceneId } from "./types";

export const SCENE_REGISTRY: Record<SceneId, SceneConfig> = {
  dojo_start: {
    id: "dojo_start",
    name: "The Awakening",
    backgroundAsset: "/assets/scenes/awakening.webp",
    backgroundGradient:
      "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(59, 130, 246, 0.2) 0%, transparent 55%), linear-gradient(180deg, #1e1b4b 0%, #0f172a 50%, #020617 100%)",
    ambientColor: "#1e1b4b",
    fxConfig: { intensity: "low", particleType: "dust" },
  },
  mountain_peak: {
    id: "mountain_peak",
    name: "Celestial Peak",
    backgroundAsset: "/assets/scenes/mountain.webp",
    backgroundGradient:
      "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(210, 188, 251, 0.12) 0%, transparent 50%), linear-gradient(180deg, #1c2430 0%, #131313 100%)",
    ambientColor: "#1c2430",
    fxConfig: { intensity: "medium", particleType: "cherry_blossom" },
  },
  forest_temple: {
    id: "forest_temple",
    name: "Forgotten Forest Temple",
    backgroundAsset: "/assets/scenes/forest.webp",
    backgroundGradient:
      "radial-gradient(ellipse 60% 45% at 40% 80%, rgba(76, 175, 80, 0.12) 0%, transparent 55%), linear-gradient(180deg, #0f1a12 0%, #131313 100%)",
    ambientColor: "#0f1a12",
    fxConfig: { intensity: "medium", particleType: "cherry_blossom" },
  },
  void_arena: {
    id: "void_arena",
    name: "The Mirror Trial",
    backgroundAsset: "/assets/scenes/mirror.webp",
    backgroundGradient:
      "radial-gradient(ellipse 90% 70% at 50% 50%, rgba(168, 85, 247, 0.25) 0%, transparent 60%), linear-gradient(180deg, #2e1065 0%, #020617 100%)",
    ambientColor: "#2e1065",
    fxConfig: { intensity: "high", particleType: "energy_void" },
  },
  boss_chamber: {
    id: "boss_chamber",
    name: "Celestial Ascension",
    backgroundAsset: "/assets/scenes/ascension.webp",
    backgroundGradient:
      "radial-gradient(ellipse 75% 55% at 50% 30%, rgba(253, 224, 71, 0.3) 0%, transparent 55%), linear-gradient(180deg, #451a03 0%, #020617 100%)",
    ambientColor: "#451a03",
    fxConfig: { intensity: "high", particleType: "fire" },
  },
};
