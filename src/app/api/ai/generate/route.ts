import { NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt: string = body?.prompt || "";
    const maxLength: number = body?.maxLength || 200;
    const modelName: string = process.env.AI_MODEL || "gpt-4o-mini";
    const model = openai(modelName);
    if (!process.env.OPENAI_API_KEY) {
      const echo = String(prompt).slice(0, maxLength);
      return NextResponse.json({ success: true, text: echo, meta: { fallback: true, reason: "OPENAI_API_KEY missing" } });
    }
    const { text } = await generateText({ model, prompt });
    const trimmed = text?.slice(0, maxLength) || "";
    return NextResponse.json({ success: true, text: trimmed });
  } catch (error: any) {
    const message = typeof error?.message === "string" ? error.message : "AI error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
