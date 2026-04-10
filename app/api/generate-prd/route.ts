// app/api/generate-prd/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';
import { jsonrepair } from "jsonrepair";
import { PRDSchema, type PRDContent } from "@/lib/schemas/prd";
import type { Competitor } from "@/lib/schemas/competitor";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

function getSupabase() {
  return createSupabaseServiceClient();
}

// ── Sarvam config ─────────────────────────────────────────────────────────────
const SARVAM_API_URL = "https://api.sarvam.ai/v1/chat/completions";
const SARVAM_MODEL = "sarvam-m";

const SYSTEM_PROMPT = `You are a senior product manager and product strategist at a top-tier technology company.
Your task is to generate a comprehensive, investor-grade Product Requirements Document (PRD).

You will receive:
1. A "home_product_context": a description of the product being built.
2. A "competitors" array: structured competitive research data.

CRITICAL INSTRUCTIONS:
- Your ENTIRE response must be a single valid JSON object.
- Start your response with { and end with }
- Do NOT use markdown code fences (\`\`\`json or \`\`\`).
- Do NOT include any text, explanation, or commentary before or after the JSON.

Produce a JSON object with EXACTLY these keys and shapes:

- "objective": string — one crisp north-star sentence.
- "problem_statement": string — validated market pain grounded in competitive gaps.
- "solution_narrative": string — differentiation and why it wins against named competitors.
- "personas": array of 2–5 objects, each with:
    "name": string, "role": string, "pain_points": string[], "goals": string[],
    "tech_savviness": one of "low" | "medium" | "high"
- "features": object with keys "p1", "p2", "p3":
    - "p1" and "p2": arrays of objects (p1 min 3 items, p2 min 2 items), each with:
        "id": string (e.g. "p1-1"), "title": string, "description": string,
        "user_story": string, "acceptance_criteria": string[]
    - "p3": array of objects (min 2 items), each with:
        "id": string (e.g. "p3-1"), "title": string, "description": string
- "success_metrics": array of min 3 objects, each with:
    "metric": string, "target": string, "measurement_method": string, "timeframe": string
- "risks": array of min 3 objects, each with:
    "risk": string,
    "likelihood": one of "low" | "medium" | "high",
    "impact": one of "low" | "medium" | "high",
    "mitigation": string
- "gtm": object with:
    "target_segment": string, "positioning_statement": string, "channels": string[],
    "pricing_strategy": string,
    "launch_phases": array of objects, each with:
        "phase": integer (1, 2, 3...), "name": string, "duration": string, "goals": string[]`;

// ── Request body type ─────────────────────────────────────────────────────────
interface GeneratePRDRequestBody {
  analysis_id: string;
  competitors: Competitor[];
  home_product_context: string;
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body: GeneratePRDRequestBody = await req.json();
    const { analysis_id, competitors, home_product_context } = body;

    // ── Input validation ────────────────────────────────────────────────────
    if (!analysis_id || typeof analysis_id !== "string") {
      return NextResponse.json({ error: "analysis_id is required." }, { status: 400 });
    }
    if (!Array.isArray(competitors) || competitors.length < 1) {
      return NextResponse.json({ error: "competitors must be a non-empty array." }, { status: 400 });
    }
    if (!home_product_context || typeof home_product_context !== "string" || home_product_context.trim().length < 10) {
      return NextResponse.json({ error: "home_product_context is required (min 10 chars)." }, { status: 400 });
    }

    // ── Verify analysis_id exists ───────────────────────────────────────────
    const supabase = getSupabase();
    const { data: analysisRow, error: analysisLookupErr } = await supabase
      .from("analyses")
      .select("id")
      .eq("id", analysis_id)
      .single();

    if (analysisLookupErr || !analysisRow) {
      console.error("[generate-prd] analysis_id not found:", analysis_id, analysisLookupErr?.message);
      return NextResponse.json({ error: "analysis_id not found." }, { status: 404 });
    }

    const userMessage = JSON.stringify({
      home_product_context: home_product_context.trim(),
      competitors,
    });

    // ── Sarvam fetch ─────────────────────────────────────────────────────────
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000); // 55s — leave 5s buffer for DB write

    let llmResponse: Response;
    try {
      llmResponse = await fetch(SARVAM_API_URL, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": env.SARVAM_API_KEY,
        },
        body: JSON.stringify({
          model: SARVAM_MODEL,
          temperature: 0.2,
          max_tokens: 7500,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMessage },
          ],
        }),
      });
    } catch (fetchErr) {
      clearTimeout(timeout);
      console.error("[generate-prd LLM network error]", fetchErr);
      return NextResponse.json({ error: "LLM network error. Please retry." }, { status: 502 });
    }

    clearTimeout(timeout);

    if (!llmResponse.ok) {
      const errorBody = await llmResponse.text();
      console.error("[Sarvam Error]", llmResponse.status, errorBody);
      return NextResponse.json(
        { error: "LLM API call failed.", detail: errorBody },
        { status: 502 }
      );
    }

    const llmData = await llmResponse.json();
    const choice = llmData.choices?.[0];
    const rawContent: string | undefined = choice?.message?.content;

    if (!rawContent) {
      const finishReason = choice?.finish_reason;
      console.error("[Sarvam empty content] finish_reason:", finishReason, "Full:", JSON.stringify(llmData).slice(0, 500));
      const error = finishReason === "length"
        ? "LLM ran out of tokens before producing output. Please try again."
        : "Empty response from LLM.";
      return NextResponse.json({ error }, { status: 502 });
    }

    // ── Parse JSON ──────────────────────────────────────────────────────────
    let parsedPRD: unknown;
    try {
      const text = rawContent.trim();
      // Strip <think>...</think> reasoning blocks
      const noThink = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
      // Strip markdown code fences if present
      const stripped = noThink.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
      // Extract outermost JSON object
      const firstBrace = stripped.indexOf("{");
      const lastBrace = stripped.lastIndexOf("}");
      const jsonString =
        firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace
          ? stripped.slice(firstBrace, lastBrace + 1)
          : stripped;
      console.log("[PRD parse] after strip (first 300):", stripped.slice(0, 300));
      console.log("[PRD parse] jsonString (first 300):", jsonString.slice(0, 300));
      parsedPRD = JSON.parse(jsonrepair(jsonString));
    } catch (e) {
      console.error("[PRD JSON Parse Error]", String(e));
      console.error("[PRD raw content]:", rawContent.slice(0, 2000));
      return NextResponse.json({ error: "LLM returned malformed JSON.", raw: rawContent.slice(0, 500) }, { status: 502 });
    }

    // ── Zod validation ──────────────────────────────────────────────────────
    const validation = PRDSchema.safeParse(parsedPRD);
    if (!validation.success) {
      console.error("[PRD Zod Validation Failed]", validation.error.flatten());
      return NextResponse.json(
        {
          error: "LLM response failed PRD schema validation.",
          issues: validation.error.flatten(),
        },
        { status: 422 }
      );
    }

    const prd: PRDContent = validation.data;

    // ── Persist to Supabase ─────────────────────────────────────────────────
    const { data: insertedPRD, error: dbError } = await supabase
      .from("prd_documents")
      .insert({
        analysis_id,
        objective: prd.objective,
        problem_statement: prd.problem_statement,
        solution_narrative: prd.solution_narrative,
        personas: prd.personas,
        features: prd.features,
        success_metrics: prd.success_metrics,
        risks: prd.risks,
        gtm: prd.gtm,
        version: 1,
        updated_at: new Date().toISOString(),
      })
      .select("id, version")
      .single();

    if (dbError) {
      console.error("[Supabase Insert Error]", dbError);
      return NextResponse.json(
        { error: "Failed to persist PRD.", detail: dbError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        prd_id: insertedPRD.id,
        analysis_id,
        version: insertedPRD.version,
        prd,
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      console.error("[Timeout] LLM call timed out after 55s");
      return NextResponse.json({ error: "PRD generation timed out. Please try again." }, { status: 504 });
    }
    console.error("[Unhandled Error]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
