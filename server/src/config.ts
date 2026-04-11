import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  // Try server/.env first (from server/src/config.ts → server/.env)
  const candidates = [
    resolve(__dirname, "../.env"),     // server/.env (from src/config.ts → ../)
    resolve(__dirname, "../../.env"),   // HackX/.env (fallback)
  ];

  for (const envPath of candidates) {
    try {
      const content = readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
      break; // Found and loaded an .env
    } catch {
      // Try next candidate
    }
  }
}

loadEnv();

export const config = {
  // Server
  port: parseInt(process.env.PORT || "3001", 10),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

  // Mode
  simulationMode: process.env.SIMULATION_MODE === "true",

  // LLM
  geminiApiKey: process.env.GEMINI_API_KEY || "",

  // Enrichment & Signals
  apolloApiKey: process.env.APOLLO_API_KEY || "",
  tavilyApiKey: process.env.TAVILY_API_KEY || "",

  // Outreach
  resendApiKey: process.env.RESEND_API_KEY || "",
  heyreachApiKey: process.env.HEYREACH_API_KEY || "",
  aisensyApiKey: process.env.AISENSY_API_KEY || "",
} as const;
