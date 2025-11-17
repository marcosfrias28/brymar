export type AISuggestionLanguage = "es" | "en";
export type AISuggestionSeverity = "info" | "warning" | "error";
export type AISuggestion = { text: string; severity?: AISuggestionSeverity; score?: number };
export type AIObjectSchema<T> = { parse: (input: unknown) => T };

export interface AISuggestionService {
  generateText(input: string, options?: { language?: AISuggestionLanguage; maxLength?: number }): Promise<string>;
  streamText(input: string, options?: { language?: AISuggestionLanguage }): AsyncIterable<string>;
  generateObject<T>(input: string, schema: AIObjectSchema<T>, options?: { language?: AISuggestionLanguage }): Promise<T>;
  analyzeImage(url: string, options?: { language?: AISuggestionLanguage }): Promise<{ quality: number; tags: string[]; coverRecommendation?: boolean }>;
}

class GeminiSuggestionService implements AISuggestionService {
  async generateText(input: string, options?: { language?: AISuggestionLanguage; maxLength?: number }): Promise<string> {
    const { generatePropertyTitle, generatePropertyDescription } = await import("@/lib/actions/ai-actions");
    const res = await generatePropertyDescription({ type: "generic", location: "", price: 0, surface: 0, characteristics: [input] }, { language: options?.language || "es", maxLength: options?.maxLength || 200 });
    return res.data || input;
  }
  async *streamText(input: string, options?: { language?: AISuggestionLanguage }): AsyncIterable<string> {
    const full = await this.generateText(input, { language: options?.language || "es", maxLength: 160 });
    const tokens = full.split(/\s+/);
    let buf = "";
    for (const t of tokens) {
      buf += (buf ? " " : "") + t;
      await new Promise((r) => setTimeout(r, 60));
      yield buf;
    }
  }
  async generateObject<T>(input: string, schema: AIObjectSchema<T>, _options?: { language?: AISuggestionLanguage }): Promise<T> {
    return schema.parse({ input }) as T;
  }
  async analyzeImage(_url: string, _options?: { language?: AISuggestionLanguage }): Promise<{ quality: number; tags: string[]; coverRecommendation?: boolean }> {
    return { quality: 0.7, tags: [], coverRecommendation: false };
  }
}

import { VercelAISuggestionService } from "./vercel-ai.service";
let currentService: AISuggestionService =
  typeof window !== "undefined" ? new VercelAISuggestionService() : new GeminiSuggestionService();

export function setAISuggestionService(service: AISuggestionService) {
  currentService = service;
}

export function getAISuggestionService(): AISuggestionService {
  return currentService;
}
