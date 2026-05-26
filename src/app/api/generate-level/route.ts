import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getFallbackLevel } from "@/features/gameplay/data/presets";
import type { GameplayData } from "@/features/gameplay/types/combat.types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const LEVEL_GEN_PROMPT = `
You are the Zenith Game Director. Generate a cinematic combat level.
The output MUST be a strict JSON object.

Context:
- Body Mode: {{bodyMode}} (full_body or half_body)
- Difficulty: {{difficulty}} (easy, medium, hard)
- Theme: {{theme}}

Required JSON Schema:
{
  "theme": "Name of the theme",
  "storyNarrative": "1-3 sentences of atmospheric storytelling",
  "target_sequence": [
    {
      "x_percent": number (5 to 95),
      "y_percent": number (5 to 95),
      "radius_percent": number (3 to 15),
      "duration_ms": number (600 to 5000),
      "delay_ms": number (200 to 3000),
      "valid_joints": string[] (subset of MediaPipe pose landmarks)
    }
  ],
  "expectedTotalScore": number
}

Constraint for valid_joints:
- For half_body: ONLY use upper body joints (shoulders, elbows, wrists).
- For full_body: Use any joint.
- Sequence length: {{count}} targets.
`;

function sanitizeGameplayData(data: any, mode: string): GameplayData {
  const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));

  return {
    ...data,
    target_sequence: data.target_sequence.map((t: any) => ({
      ...t,
      x_percent: clamp(t.x_percent, 5, 95),
      y_percent: clamp(t.y_percent, 5, 95),
      radius_percent: clamp(t.radius_percent, 3, 15),
      duration_ms: clamp(t.duration_ms, 600, 5000),
      delay_ms: clamp(t.delay_ms, 200, 3000),
      valid_joints: mode === 'half_body'
        ? t.valid_joints.filter((j: string) => !["LEFT_HIP", "RIGHT_HIP", "LEFT_KNEE", "RIGHT_KNEE", "LEFT_ANKLE", "RIGHT_ANKLE"].includes(j))
        : t.valid_joints,
    })),
  };
}

export async function POST(req: Request) {
  try {
    const { mode, difficulty, theme } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const count = difficulty === "easy" ? 15 : difficulty === "hard" ? 30 : 20;
    const prompt = LEVEL_GEN_PROMPT
      .replace("{{bodyMode}}", mode)
      .replace("{{difficulty}}", difficulty)
      .replace("{{theme}}", theme || "random cinematic dojo")
      .replace("{{count}}", count.toString());

    const result = await model.generateContent(prompt);
    const raw = JSON.parse(result.response.text());
    const sanitized = sanitizeGameplayData(raw, mode);

    return NextResponse.json(sanitized);
  } catch (error) {
    console.error("[GenerateLevel API Error]:", error);
    const { mode } = await req.json().catch(() => ({ mode: "full_body" }));
    return NextResponse.json(getFallbackLevel(mode as any), { status: 500 });
  }
}
