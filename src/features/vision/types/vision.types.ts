export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface PoseLandmarksFrame {
  timestampMs: number;
  landmarks: PoseLandmark[];
}

