import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET() {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
    });

    const result = await model.generateContent("Describe me in exactly 5 short words.");
    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({
      status: "success",
      message: text.trim()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Gemini Ping Error]:", error);
    return new Response(JSON.stringify({
      status: "error",
      message: "Connection failed"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
