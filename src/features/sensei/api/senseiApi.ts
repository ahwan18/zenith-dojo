import { SenseiAnalyzeResponseSchema } from "@/features/sensei/types/sensei.types";
import type { SenseiAnalyzeRequest, SenseiAnalyzeResponse } from "@/features/sensei/types/sensei.types";

async function readResponseText(response: Response): Promise<string> {
  if (!response.body) {
    return response.text();
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = "";

  // NOTE: We read the full stream in v1 scaffold. UI streaming will be added later.
  while (true) {
    const result = await reader.read();
    if (result.done) break;
    text += decoder.decode(result.value, { stream: true });
  }

  return text;
}

export async function analyzeSenseiFeedbackOnce(
  request: SenseiAnalyzeRequest
): Promise<SenseiAnalyzeResponse> {
  const response = await fetch("/api/sensei/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Sensei analyze request failed.");
  }

  const feedbackText = await readResponseText(response);
  return SenseiAnalyzeResponseSchema.parse({ feedbackText });
}

