import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, generateObject } from "ai";
import { config } from "../config.js";
import type { ZodSchema } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: config.geminiApiKey,
});

// Gemini 2.0 Flash — fast, capable, generally available
const MODEL = "gemini-2.0-flash";

function hasKey(): boolean {
  return !!(config.geminiApiKey && config.geminiApiKey.length > 10);
}

/** Check if the error is a quota/rate-limit error (free tier exhausted) */
function isQuotaError(error: unknown): boolean {
  const msg = String(error);
  return msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota") || msg.includes("429");
}

/** Generate free-form text from Gemini */
export async function llmGenerateText(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  if (!hasKey()) {
    console.warn("[LLM] No Gemini API key — returning simulated response");
    return `[SIMULATED] ${systemPrompt.slice(0, 80)}... | Input: ${userMessage.slice(0, 80)}`;
  }

  try {
    const { text } = await generateText({
      model: google(MODEL),
      system: systemPrompt,
      prompt: userMessage,
    });
    return text;
  } catch (error) {
    if (isQuotaError(error)) {
      console.warn("[LLM] Gemini quota exhausted — returning simulated response");
      return `[QUOTA_EXCEEDED] ${userMessage.slice(0, 100)}`;
    }
    throw error;
  }
}

/** Generate structured JSON from Gemini using Zod schema */
export async function llmGenerateObject<T>(
  systemPrompt: string,
  userMessage: string,
  schema: ZodSchema<T>,
  schemaName: string
): Promise<T> {
  if (!hasKey()) {
    throw new Error(`GEMINI_API_KEY not set — cannot generate structured object for "${schemaName}"`);
  }

  try {
    const { object } = await generateObject({
      model: google(MODEL),
      system: systemPrompt,
      prompt: userMessage,
      schema,
      schemaName,
    });
    return object;
  } catch (error) {
    if (isQuotaError(error)) {
      console.warn(`[LLM] Gemini quota exhausted for "${schemaName}" — throwing`);
    }
    throw error;
  }
}
