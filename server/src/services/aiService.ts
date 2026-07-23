import { env } from "../config/env";
import { generateWithGemini } from "./geminiService";
import { generateWithGroq } from "./groqService";

export type AiProvider = "auto" | "gemini" | "groq";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let lastRequestAt = 0;
const MIN_GAP_MS = 10_000;

const waitCooldown = async () => {
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < MIN_GAP_MS) await sleep(MIN_GAP_MS - elapsed);
  lastRequestAt = Date.now();
};

export const isValidGeminiKey = (key?: string) => {
  const k = key ?? env("GEMINI_API_KEY");
  return k.startsWith("AIza") && k.length > 20;
};

export const isValidGroqKey = (key?: string) => {
  const k = key ?? env("GROQ_API_KEY");
  return k.startsWith("gsk_") && k.length > 20;
};

export const getActiveProvider = (): AiProvider | null => {
  const pref = (env("AI_PROVIDER") || "auto").toLowerCase() as AiProvider;
  const groqKey = env("GROQ_API_KEY");
  const geminiKey = env("GEMINI_API_KEY");

  if (pref === "groq" && isValidGroqKey(groqKey)) return "groq";
  if (pref === "gemini" && isValidGeminiKey(geminiKey)) return "gemini";

  if (pref === "auto") {
    if (isValidGroqKey(groqKey)) return "groq";
    if (isValidGeminiKey(geminiKey)) return "gemini";
  }

  return null;
};

export const getAiConfigError = (): string | null => {
  if (getActiveProvider()) return null;
  return (
    "No AI provider configured. Add GROQ_API_KEY=gsk_... to server/.env " +
    "(https://console.groq.com/keys) then restart the server (Ctrl+C, npm run dev)."
  );
};

const getErrorStatus = (error: unknown): number | undefined => {
  const err = error as { status?: number; message?: string };
  if (typeof err.status === "number") return err.status;
  const match = String(err.message ?? error).match(/\[(\d{3})\s[^\]]*\]/);
  return match ? parseInt(match[1], 10) : undefined;
};

export async function generateWithAi(
  prompt: string,
  systemInstruction: string
): Promise<{ content: string; provider: string }> {
  const configError = getAiConfigError();
  if (configError) throw Object.assign(new Error(configError), { status: 503 });

  await waitCooldown();

  const provider = getActiveProvider()!;
  const pref = (env("AI_PROVIDER") || "auto").toLowerCase();

  if (provider === "groq" || pref === "groq") {
    try {
      const content = await generateWithGroq(prompt, systemInstruction);
      return { content, provider: "groq" };
    } catch (groqErr) {
      if (isValidGeminiKey() && pref === "auto") {
        const content = await generateWithGemini(prompt, systemInstruction);
        return { content, provider: "gemini" };
      }
      throw groqErr;
    }
  }

  try {
    const content = await generateWithGemini(prompt, systemInstruction);
    return { content, provider: "gemini" };
  } catch (geminiErr) {
    if (getErrorStatus(geminiErr) === 429 && isValidGroqKey()) {
      const content = await generateWithGroq(prompt, systemInstruction);
      return { content, provider: "groq" };
    }
    throw geminiErr;
  }
}

export function handleAiError(error: unknown, res: import("express").Response) {
  if (res.headersSent) return;
  const err = error as { status?: number; message?: string };
  res.status(err.status ?? 500).json({ message: err.message ?? "AI generation failed" });
}
