import { GoogleGenerativeAI, type Tool } from "@google/generative-ai";
import { z } from "zod";

import {
  DirectorRequestSchema,
  DirectorStreamEventSchema,
  type DirectorRequest,
  type DirectorStreamEvent,
} from "@/features/story/directorSchemas";
import { buildMockDirectorEvents } from "@/features/story/directorMock";

export const runtime = "nodejs";

const DIRECTOR_SYSTEM_PROMPT = `
You are the Zen Director — Dojo Sensei and Game Director for Zenith combat training.
Respond with short atmospheric narrative (1-3 sentences) and use tools to change scene, objectives, difficulty, waves, combos, and HUD hints.

Rules:
- On session_start: call startChapter and setScene (dojo_start).
- If miss rate is high: ease difficulty (negative adjustDifficulty delta), spawnTargetWave low intensity, setHudHint warning.
- If streak is high: escalate scene (void_arena or boss_chamber), spawnTargetWave high, optionally triggerCombo.
- Always explain changes in narrative text when using tools.
- difficulty delta must be between -1 and 1.
`;

const GEMINI_TOOLS = [
  {
    functionDeclarations: [
      {
        name: "setScene",
        description: "Change the game background environment.",
        parameters: {
          type: "object",
          properties: {
            sceneId: {
              type: "string",
              enum: ["dojo_start", "mountain_peak", "forest_temple", "void_arena", "boss_chamber"],
            },
          },
          required: ["sceneId"],
        },
      },
      {
        name: "startChapter",
        description: "Set the current chapter objective.",
        parameters: {
          type: "object",
          properties: {
            chapterId: { type: "string" },
            objectiveText: { type: "string" },
            durationMs: { type: "number" },
          },
          required: ["chapterId", "objectiveText"],
        },
      },
      {
        name: "spawnTargetWave",
        description: "Adjust target spawn pattern intensity.",
        parameters: {
          type: "object",
          properties: {
            patternId: { type: "string" },
            intensity: { type: "string", enum: ["low", "medium", "high"] },
          },
          required: ["patternId", "intensity"],
        },
      },
      {
        name: "adjustDifficulty",
        description: "Shift difficulty multiplier.",
        parameters: {
          type: "object",
          properties: {
            delta: { type: "number" },
          },
          required: ["delta"],
        },
      },
      {
        name: "triggerCombo",
        description: "Activate a named combo bonus.",
        parameters: {
          type: "object",
          properties: {
            comboName: { type: "string" },
          },
          required: ["comboName"],
        },
      },
      {
        name: "setHudHint",
        description: "Show a contextual HUD hint.",
        parameters: {
          type: "object",
          properties: {
            text: { type: "string" },
            severity: { type: "string", enum: ["info", "warning", "critical"] },
          },
          required: ["text", "severity"],
        },
      },
    ],
  },
];

function encodeNdjson(event: DirectorStreamEvent): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(event)}\n`);
}

function mockStream(req: DirectorRequest): ReadableStream<Uint8Array> {
  const events = buildMockDirectorEvents(req);
  return new ReadableStream({
    start(controller) {
      for (const event of events) {
        controller.enqueue(encodeNdjson(event));
      }
      controller.close();
    },
  });
}

function buildPrompt(req: DirectorRequest): string {
  const t = req.telemetry;
  const s = req.storyState;
  const total = t.hits + t.misses;
  const missRate = total > 0 ? Math.round((t.misses / total) * 100) : 0;

  return `
Trigger: ${req.trigger}
Telemetry: hits=${t.hits} misses=${t.misses} missRate=${missRate}% streak=${t.streak} bestStreak=${t.bestStreak} score=${t.score} timeLeftMs=${t.timeLeftMs} lastGesture=${t.lastGesture ?? "none"}
Story: scene=${s.currentSceneId} chapter=${s.currentChapterId} objective="${s.objective}" difficultyMultiplier=${s.difficultyMultiplier}
`.trim();
}

async function geminiStream(req: DirectorRequest): Promise<ReadableStream<Uint8Array>> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    systemInstruction: DIRECTOR_SYSTEM_PROMPT,
    tools: GEMINI_TOOLS as unknown as Tool[],
  });

  const result = await model.generateContentStream(buildPrompt(req));

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(encodeNdjson({ type: "text", content: text }));
          }

          const response = chunk.candidates?.[0]?.content?.parts;
          if (response) {
            for (const part of response) {
              if ("functionCall" in part && part.functionCall) {
                const call = part.functionCall;
                const name = call.name;
                const parsedName = z
                  .enum([
                    "setScene",
                    "startChapter",
                    "spawnTargetWave",
                    "adjustDifficulty",
                    "triggerCombo",
                    "setHudHint",
                  ])
                  .safeParse(name);
                if (parsedName.success) {
                  controller.enqueue(
                    encodeNdjson({
                      type: "call",
                      name: parsedName.data,
                      args: (call.args ?? {}) as Record<string, unknown>,
                    })
                  );
                }
              }
            }
          }
        }
        controller.enqueue(encodeNdjson({ type: "done" }));
      } catch (err) {
        console.error("[Director] Gemini stream error:", err);
        controller.enqueue(
          encodeNdjson({ type: "error", message: "Director stream interrupted." })
        );
      } finally {
        controller.close();
      }
    },
  });
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const parsed = DirectorRequestSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid director request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const useMock = !process.env.GEMINI_API_KEY || process.env.SENSEI_DIRECTOR_MOCK === "1";
    const stream = useMock ? mockStream(parsed.data) : await geminiStream(parsed.data);

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[Director API Error]:", error);
    const fallback = buildMockDirectorEvents({
      telemetry: { hits: 0, misses: 0, streak: 0, bestStreak: 0, score: 0, timeLeftMs: 0 },
      storyState: {
        currentSceneId: "dojo_start",
        currentChapterId: "chapter_1",
        objective: "Train.",
        difficultyMultiplier: 1,
      },
      trigger: "session_start",
    });
    const stream = new ReadableStream({
      start(controller) {
        for (const event of fallback) {
          const validated = DirectorStreamEventSchema.safeParse(event);
          if (validated.success) controller.enqueue(encodeNdjson(validated.data));
        }
        controller.close();
      },
    });
    return new Response(stream, {
      status: 200,
      headers: { "Content-Type": "application/x-ndjson; charset=utf-8" },
    });
  }
}
