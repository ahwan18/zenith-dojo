export type GestureType = "punch" | "squat" | "horseStance";

export interface GestureEvent {
  type: GestureType;
  detectedAtMs: number;
  confidence: number;
}

export interface GestureThresholds {
  minCooldownMs: number;
  minVisibility: number;
  punch: {
    minExtensionRatio: number;
    minWristSpeed: number;
  };
  squat: {
    maxHipHeightRatio: number;
  };
  horseStance: {
    minAnkleDistanceRatio: number;
    maxHipHeightRatio: number;
  };
}

