import { createGroq } from "@ai-sdk/groq";
import { generateText, generateObject } from "ai";
import { config } from "../config.js";
import type { ZodSchema } from "zod";

const groq = createGroq({
  apiKey: config.groqApiKey,
});

// Groq — Llama 3.3 70B Versatile (free, fast, capable)
const MODEL = "llama-3.3-70b-versatile";

function hasKey(): boolean {
  return !!(config.groqApiKey && config.groqApiKey.length > 10);
}

/** Check if the error is a quota/rate-limit error */
function isQuotaError(error: unknown): boolean {
  const msg = String(error);
  return msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota") || msg.includes("429") || msg.includes("rate_limit");
}

/** Generate free-form text from Groq (Llama 3.3 70B) */
export async function llmGenerateText(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  if (!hasKey()) {
    console.warn("[LLM] No Groq API key — returning simulated response");
    return `[SIMULATED] ${systemPrompt.slice(0, 80)}... | Input: ${userMessage.slice(0, 80)}`;
  }

  try {
    const { text } = await generateText({
      model: groq(MODEL),
      system: systemPrompt,
      prompt: userMessage,
    });
    return text;
  } catch (error) {
    if (isQuotaError(error)) {
      console.warn("[LLM] Groq rate limit — returning simulated response");
      return `[QUOTA_EXCEEDED] ${userMessage.slice(0, 100)}`;
    }
    throw error;
  }
}

/** Generate structured JSON from Groq (Llama 3.3 70B) using Zod schema */
export async function llmGenerateObject<T>(
  systemPrompt: string,
  userMessage: string,
  schema: ZodSchema<T>,
  schemaName: string
): Promise<T> {
  if (!hasKey()) {
    throw new Error(`GROQ_API_KEY not set — cannot generate structured object for "${schemaName}"`);
  }

  try {
    const { object } = await generateObject({
      model: groq(MODEL),
      system: systemPrompt,
      prompt: userMessage,
      schema,
      schemaName,
    });
    return object;
  } catch (error) {
    if (isQuotaError(error)) {
      console.warn(`[LLM] Groq rate limit for "${schemaName}" — throwing`);
    }
    throw error;
  }
}
