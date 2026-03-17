// app/api/generate-prd/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PRDSchema, type PRDDocument } from "@/lib/schemas/prd";
import type { Competitor } from "@/lib/schemas/competitor";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── OpenRouter / Nemotron config ──────────────────────────────────────────────
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const NEMOTRON_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

const SYSTEM_PROMPT = `You are a senior product manager and product strategist at a top-tier technology company.
Your task is to generate a comprehensive, investor-grade Product Requirements Document (PRD) in strict JSON.

You will receive:
1. A "home_product_context": a description of the product being built.
2. A "competitors" array: structured competitive research data.

Using this input, produce a PRD JSON object that conforms exactly to the provided JSON schema. Rules:
- "objective": One crisp north-star sentence for the product.
- "problem_statement": Clearly articulate the validated market pain, grounded in the competitive gaps provided.
- "solution_narrative": Describe the product solution, its differentiation, and why it wins against named competitors.
- "personas": 2–5 realistic user personas derived from the competitive context.
- "features.p1": Must-have launch features with full user stories and acceptance criteria. Minimum 3.
- "features.p2": Important post-launch or v1.1 features. Minimum 2.
- "features.p3": Nice-to-have / roadmap features. Minimum 2.
- "success_metrics": Quantified, measurable KPIs (e.g. "30% MoM DAU growth within 90 days").
- "risks": Realistic product, market, and technical risks with mitigations.
- "gtm": A concrete go-to-market plan with segment, positioning, channels, pricing, and phased launch.

Return ONLY the JSON object. No markdown, no commentary, no preamble.`;

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

    const userMessage = JSON.stringify({
      home_product_context: home_product_context.trim(),
      competitors,
    });

    // ── OpenRouter fetch (Nemotron 3 Super) ─────────────────────────────────
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000); // 55s — leave 5s buffer for DB write

    const llmResponse = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://localhost:3000",
        "X-Title": "PRD Generator",
      },
      body: JSON.stringify({
        model: NEMOTRON_MODEL,
        temperature: 0.3,
        max_tokens: 8192,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
      }),
    });

    clearTimeout(timeout);

    if (!llmResponse.ok) {
      const errorBody = await llmResponse.text();
      console.error("[OpenRouter Error]", llmResponse.status, errorBody);
      return NextResponse.json(
        { error: "LLM API call failed.", detail: errorBody },
        { status: 502 }
      );
    }

    const llmData = await llmResponse.json();
    const rawContent: string | undefined = llmData.choices?.[0]?.message?.content;

    if (!rawContent) {
      return NextResponse.json({ error: "Empty response from LLM." }, { status: 502 });
    }

    // ── Parse JSON ──────────────────────────────────────────────────────────
    let parsedPRD: unknown;
    try {
      parsedPRD = JSON.parse(rawContent);
    } catch {
      console.error("[PRD JSON Parse Error] Raw content:", rawContent.slice(0, 500));
      return NextResponse.json({ error: "LLM returned malformed JSON." }, { status: 502 });
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

    const prd: PRDDocument = validation.data;

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
