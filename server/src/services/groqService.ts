import { env } from "../config/env";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 60_000;

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(Object.assign(new Error("Groq request timed out"), { status: 504 })), ms)
    ),
  ]);

export async function generateWithGroq(
  prompt: string,
  systemInstruction: string
): Promise<string> {
  const apiKey = env("GROQ_API_KEY");
  if (!apiKey.startsWith("gsk_")) {
    throw Object.assign(
      new Error("Invalid GROQ_API_KEY. Get a free key at https://console.groq.com/keys"),
      { status: 403 }
    );
  }

  const model = env("GROQ_MODEL") || "llama-3.1-8b-instant";
  console.log(`🤖 Generating with Groq (${model})...`);

  const response = await withTimeout(
    fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt },
        ],
        max_tokens: 4096,
        temperature: 0.7,
      }),
    }),
    REQUEST_TIMEOUT_MS
  );

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw Object.assign(
      new Error(data.error?.message || `Groq API error (${response.status})`),
      { status: response.status }
    );
  }

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw Object.assign(new Error("Groq returned empty content"), { status: 502 });

  console.log(`✅ Generated ${text.length} chars with Groq`);
  return text;
}
