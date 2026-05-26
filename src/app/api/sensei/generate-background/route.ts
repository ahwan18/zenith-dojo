import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET() {
  return new Response(JSON.stringify({
    status: "online",
    message: "Gemini Background Generator is ready! Use POST to generate backgrounds.",
    model: "gemini-3.1-flash-image-preview"
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, userContext } = body;

    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-image-preview",
    });

    // Since this is an "image preview" model, we ask it to generate a detailed
    // visual description or a direct image generation request if supported.
    const fullPrompt = `Generate a high-quality, cinematic background for a combat dojo.
    Theme: ${prompt}
    User Context: ${JSON.stringify(userContext)}
    The output should be a detailed visual description that can be used for image generation.`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({
      status: "success",
      description: text.trim()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Background Gen Error]:", error);
    return new Response(JSON.stringify({
      status: "error",
      message: "Failed to generate background description"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
