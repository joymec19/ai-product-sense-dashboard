import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { CompetitorArraySchema, type Competitor } from "@/lib/schemas/competitor";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const SYSTEM_PROMPT = `You are a senior market research analyst. When given a product category, return ONLY a valid JSON object with a single key "competitors" containing an array of 6 to 10 competitor objects. Each object must strictly follow this structure:
{
  "name": string,
  "pricing": {
    "model": string,
    "starting_price_usd": number | null,
    "has_free_tier": boolean
  },
  "features": string[],
  "ratings": {
    "g2": number | null,
    "capterra": number | null,
    "overall": number
  },
  "positioning": string,
  "strengths": string[],
  "weaknesses": string[],
  "gaps": string[],
  "scores": {
    "market_presence": number,
    "product_depth": number,
    "ease_of_use": number,
    "value_for_money": number,
    "innovation": number
  }
}
Return ONLY the JSON. No markdown, no explanation, no commentary.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category_input, market_scope, home_product_context } = body as {
      category_input: string;
      market_scope?: string;
      home_product_context?: string;
    };

    if (!category_input || typeof category_input !== "string" || category_input.trim().length < 2) {
      return NextResponse.json(
        { error: "Invalid category_input: must be a non-empty string." },
        { status: 400 }
      );
    }

    // Build user prompt with optional context
    let userPrompt = `Analyze the competitive landscape for this category: "${category_input.trim()}"`;
    if (market_scope) {
      userPrompt += `\nMarket scope: ${market_scope}`;
    }
    if (home_product_context) {
      userPrompt += `\nAdditional product context:\n${home_product_context}`;
    }

    // ── LLM fetch call ──────────────────────────────────────────
    const llmResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!llmResponse.ok) {
      const errorBody = await llmResponse.text();
      console.error("[LLM Error]", llmResponse.status, errorBody);
      return NextResponse.json(
        { error: "LLM API call failed.", detail: errorBody },
        { status: 502 }
      );
    }

    const llmData = await llmResponse.json();
    const rawContent = llmData.choices?.[0]?.message?.content;

    if (!rawContent) {
      return NextResponse.json({ error: "Empty response from LLM." }, { status: 502 });
    }

    // ── Parse & validate ──────────────────────────────────────────
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      return NextResponse.json({ error: "LLM returned malformed JSON." }, { status: 502 });
    }

    const validation = CompetitorArraySchema.safeParse(
      (parsed as { competitors?: unknown }).competitors
    );

    if (!validation.success) {
      console.error("[Zod Validation Failed]", validation.error.flatten());
      return NextResponse.json(
        { error: "LLM response failed schema validation.", issues: validation.error.flatten() },
        { status: 422 }
      );
    }

    const competitors: Competitor[] = validation.data;

    // ── Persist to Supabase ───────────────────────────
    const supabase = getSupabase();

    // 1. Insert into analyses table
    const { data: insertedAnalysis, error: analysisError } = await supabase
      .from("analyses")
      .insert({
        category: category_input.trim(),
        market_scope: market_scope || null,
        home_product_context: home_product_context || null,
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (analysisError) {
      console.error("[Supabase Analysis Insert Error]", analysisError);
      return NextResponse.json(
        { error: "Failed to persist analysis.", detail: analysisError.message },
        { status: 500 }
      );
    }

    // 2. Insert competitors linked by analysis_id
    const competitorRows = competitors.map((c) => ({
      analysis_id: insertedAnalysis.id,
      name: c.name,
      pricing: c.pricing,
      features: c.features,
      ratings: c.ratings,
      positioning: c.positioning,
      strengths: c.strengths,
      weaknesses: c.weaknesses,
      gaps: c.gaps,
      scores: c.scores,
    }));

    const { error: competitorsError } = await supabase
      .from("competitors")
      .insert(competitorRows);

    if (competitorsError) {
      console.error("[Supabase Competitors Insert Error]", competitorsError);
      return NextResponse.json(
        { error: "Failed to persist competitors.", detail: competitorsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { analysis_id: insertedAnalysis.id, category: category_input.trim(), competitors },
      { status: 200 }
    );
  } catch (err) {
    console.error("[Unhandled Error]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
