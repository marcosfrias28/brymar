import type { AISuggestionLanguage, AISuggestionService, AIObjectSchema } from "./ai-suggestions.service";

export class VercelAISuggestionService implements AISuggestionService {
  async generateText(input: string, options?: { language?: AISuggestionLanguage; maxLength?: number }): Promise<string> {
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input, maxLength: options?.maxLength || 200 }),
      });
      const data = await res.json();
      if (data?.success && typeof data?.text === "string") return data.text;
      return input;
    } catch {
      return input;
    }
  }
  async *streamText(input: string, options?: { language?: AISuggestionLanguage }): AsyncIterable<string> {
    const full = await this.generateText(input, { language: options?.language || "es", maxLength: 400 });
    const tokens = full.split(/\s+/);
    let buf = "";
    for (const t of tokens) {
      buf += (buf ? " " : "") + t;
      await new Promise((r) => setTimeout(r, 50));
      yield buf;
    }
  }
  async generateObject<T>(input: string, schema: AIObjectSchema<T>): Promise<T> {
    const text = await this.generateText(input, { maxLength: 500 });
    try {
      const json = JSON.parse(text);
      return schema.parse(json) as T;
    } catch {
      return schema.parse({ input }) as T;
    }
  }
  async analyzeImage(_url: string): Promise<{ quality: number; tags: string[]; coverRecommendation?: boolean }> {
    return { quality: 0.8, tags: [], coverRecommendation: false };
  }
}

