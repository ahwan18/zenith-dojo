import { GoogleGenerativeAI } from "@google/generative-ai";
import { SenseiAnalyzeRequestSchema } from "@/features/sensei";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SENSEI_SYSTEM_PROMPT = `
You are the Zenith Sensei, an expert combat instructor.
Your goal is to analyze player movements based on pose landmarks and provide concise, actionable, and motivating feedback.
- Keep feedback extremely short (1-2 sentences).
- Focus on posture, balance, and extension.
- Use a supportive but firm tone.
- Do not explain that you are an AI.
`;

export async function POST(req: Request) {
  try {
    console.log("[Gemini Debug] Received analysis request");
    const data: unknown = await req.json();
    const parsed = SenseiAnalyzeRequestSchema.parse(data);

    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction: SENSEI_SYSTEM_PROMPT,
    });

    const prompt = `Analyze this player's current pose summary: ${JSON.stringify(parsed.landmarkSummary)}. Provide immediate feedback.`;
    console.log("[Gemini Debug] Sending prompt to Gemini 3.0 Flash...");

    const result = await model.generateContentStream(prompt);
    console.log("[Gemini Debug] Gemini connection successful, streaming response...");

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        } catch (err) {
          console.error("[Gemini Debug] Error during streaming:", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("[Gemini Debug] Gemini Analysis Error:", error);
    return new Response(JSON.stringify({ error: "Failed to analyze pose" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
