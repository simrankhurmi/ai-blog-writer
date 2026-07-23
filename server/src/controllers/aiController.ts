import { Request, Response } from "express";
import { generateWithAi, getAiConfigError, handleAiError } from "../services/aiService";

const toneInstructions: Record<string, string> = {
  professional: "Use a professional, authoritative tone suitable for business readers.",
  casual: "Use a friendly, conversational tone that feels approachable and engaging.",
  technical: "Use a technical tone with precise terminology and practical examples.",
  storytelling: "Use a narrative, storytelling style with vivid examples and a clear arc.",
};

const lengthInstructions: Record<string, string> = {
  short: "Write approximately 400-600 words.",
  medium: "Write approximately 800-1200 words.",
  long: "Write approximately 1500-2000 words.",
};

const buildSystemPrompt = (toneGuide: string, lengthGuide: string) =>
  `You are an expert blog writer. Write high-quality blog posts in Markdown format.
Use this structure:
- Start with an engaging introduction (no H1 — the title is separate)
- Use ## for main sections and ### for subsections
- Include bullet lists and numbered lists where helpful
- End with a thoughtful conclusion
- Do NOT wrap the output in code fences
${toneGuide}
${lengthGuide}`;

export const generateBlogContent = async (req: Request, res: Response) => {
  const configError = getAiConfigError();
  if (configError) {
    res.status(503).json({ message: configError });
    return;
  }

  try {
    const { title, tone = "professional", length = "medium", prompt } = req.body;

    if (!title?.trim()) {
      res.status(400).json({ message: "Blog title is required." });
      return;
    }

    const toneGuide = toneInstructions[tone] || toneInstructions.professional;
    const lengthGuide = lengthInstructions[length] || lengthInstructions.medium;
    const userPrompt = prompt?.trim() ? `Additional instructions: ${prompt.trim()}` : "";

    const { content, provider } = await generateWithAi(
      `Write a blog post titled "${title.trim()}". ${userPrompt}`.trim(),
      buildSystemPrompt(toneGuide, lengthGuide)
    );

    res.json({ content, provider });
  } catch (error) {
    handleAiError(error, res);
  }
};

export const improveBlogContent = async (req: Request, res: Response) => {
  const configError = getAiConfigError();
  if (configError) {
    res.status(503).json({ message: configError });
    return;
  }

  try {
    const { content, instruction } = req.body;

    if (!content?.trim()) {
      res.status(400).json({ message: "Content is required." });
      return;
    }

    const systemInstruction = `You are an expert editor. Improve the given Markdown blog content.
Keep the same structure and meaning but enhance clarity, flow, and engagement.
Return ONLY the improved Markdown — no code fences, no explanations.`;

    const prompt = instruction?.trim()
      ? `Improve this blog post. Focus on: ${instruction.trim()}\n\n${content}`
      : `Improve this blog post for clarity, engagement, and readability:\n\n${content}`;

    const result = await generateWithAi(prompt, systemInstruction);
    res.json({ content: result.content, provider: result.provider });
  } catch (error) {
    handleAiError(error, res);
  }
};
