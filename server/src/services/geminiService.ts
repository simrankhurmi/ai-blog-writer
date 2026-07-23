import { GoogleGenerativeAI } from "@google/generative-ai";

const REQUEST_TIMEOUT_MS = 60_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface GeminiError extends Error {
  status?: number;
}

export const validateGeminiApiKey = (key?: string): string | null => {
  if (!key?.trim()) return "GEMINI_API_KEY is missing";
  if (!key.startsWith("AIza")) {
    return "GEMINI_API_KEY must start with AIzaSy... from https://aistudio.google.com/apikey";
  }
  return null;
};

const getErrorStatus = (error: unknown): number | undefined => {
  const err = error as GeminiError;
  if (typeof err.status === "number") return err.status;
  const match = String(err.message ?? error).match(/\[(\d{3})\s[^\]]*\]/);
  return match ? parseInt(match[1], 10) : undefined;
};

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(Object.assign(new Error("Gemini timed out"), { status: 504 })),
        ms
      )
    ),
  ]);

export async function generateWithGemini(
  prompt: string,
  systemInstruction: string
): Promise<string> {
  const keyError = validateGeminiApiKey(process.env.GEMINI_API_KEY);
  if (keyError) throw Object.assign(new Error(keyError), { status: 403 });

  const modelName = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash-lite";
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  console.log(`🤖 Generating with Gemini (${modelName})...`);

  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction,
    generationConfig: { maxOutputTokens: 4096, temperature: 0.7 },
  });

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await withTimeout(model.generateContent(prompt), REQUEST_TIMEOUT_MS);
      const text = result.response.text()?.trim();
      if (text) {
        console.log(`✅ Generated ${text.length} chars with Gemini`);
        return text;
      }
      throw Object.assign(new Error("Empty AI response"), { status: 502 });
    } catch (error) {
      const status = getErrorStatus(error);
      if (status === 429 && attempt === 0) {
        console.warn("⏳ Gemini rate limited — retry in 15s...");
        await sleep(15_000);
        continue;
      }
      throw error;
    }
  }

  throw Object.assign(new Error("Gemini rate limit — wait 60s or use Groq"), { status: 429 });
}

export function handleGeminiError(error: unknown, res: import("express").Response) {
  if (res.headersSent) return;
  const err = error as GeminiError;
  const status = getErrorStatus(error) ?? 500;
  res.status(status).json({ message: err.message || "Gemini failed" });
}
