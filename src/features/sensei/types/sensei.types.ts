import { z } from "zod";

const LandmarkSummarySchema = z.object({
  timestampMs: z.number().int().nonnegative(),
  landmarks: z.array(z.unknown()),
});

export const SenseiAnalyzeRequestSchema = z.object({
  landmarkSummary: LandmarkSummarySchema,
});

export type SenseiAnalyzeRequest = z.infer<typeof SenseiAnalyzeRequestSchema>;

export const SenseiAnalyzeResponseSchema = z.object({
  feedbackText: z.string(),
});

export type SenseiAnalyzeResponse = z.infer<typeof SenseiAnalyzeResponseSchema>;

