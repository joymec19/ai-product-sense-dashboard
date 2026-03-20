// app/api/llm/route.ts
import { NextRequest, NextResponse } from "next/server";

const SARVAM_BASE_URL = "https://api.sarvam.ai";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const res = await fetch(`${SARVAM_BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-subscription-key": process.env.SARVAM_API_KEY!,
    },
    body: JSON.stringify({
      model: "sarvam-30b",
      messages,
      temperature: 0.2,
      max_tokens: 512,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: 500 });
  }

  const data = await res.json();

  // Response shape is OpenAI-like: choices[0].message.content
  const text = data.choices?.[0]?.message?.content ?? "";

  return NextResponse.json({ text, raw: data });
}
