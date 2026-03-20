import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { CompetitorArraySchema, type Competitor } from "@/lib/schemas/competitor";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const SYSTEM_PROMPT = `You are a senior market research analyst.

CRITICAL INSTRUCTIONS:
- Your ENTIRE response must be a single valid JSON object.
- Start your response with { and end with }
- Do NOT use markdown code fences (\`\`\`json or \`\`\`).
- Do NOT include any text, explanation, or commentary before or after the JSON.

Return a JSON object with a single key "competitors" containing an array of 6 to 10 objects. Each object must have exactly these fields:
{
  "name": string,
  "pricing": { "model": string, "starting_price_usd": number or null, "has_free_tier": boolean },
  "features": array of strings,
  "ratings": { "g2": number or null, "capterra": number or null, "overall": number between 1 and 5 },
  "positioning": string,
  "strengths": array of strings,
  "weaknesses": array of strings,
  "gaps": array of strings,
  "scores": { "market_presence": number 1-10, "product_depth": number 1-10, "ease_of_use": number 1-10, "value_for_money": number 1-10, "innovation": number 1-10 }
}`;

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

    // ── LLM fetch call ──────────────────────────────────────────
    let llmResponse: Response;
    try {
      llmResponse = await fetch("https://api.sarvam.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": process.env.SARVAM_API_KEY!,
        },
        body: JSON.stringify({
          model: "sarvam-30b",
          temperature: 0.2,
          max_tokens: 4096,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `Analyze the competitive landscape for this category: "${category_input.trim()}"`,
            },
          ],
        }),
      });
    } catch (error) {
      console.error("[LLM Network Error]", error);
      return NextResponse.json(
        { error: "LLM network error. Please retry in a few seconds." },
        { status: 502 },
      );
    }

    if (!llmResponse.ok) {
      const errorBody = await llmResponse.text();
      console.error("[Sarvam Error]", llmResponse.status, errorBody);
      return NextResponse.json(
        { error: "LLM API call failed.", detail: errorBody },
        { status: 502 }
      );
    }

    const llmData = await llmResponse.json();
    const rawContent = llmData.choices?.[0]?.message?.content;
    console.log("[Sarvam raw content]", typeof rawContent, rawContent?.slice(0, 200));

    if (!rawContent) {
      console.error("[Sarvam empty response] llmData:", JSON.stringify(llmData).slice(0, 500));
      return NextResponse.json({ error: "Empty response from LLM." }, { status: 502 });
    }

    // ── Parse & validate ──────────────────────────────────────────
    let parsed: unknown;
    try {
      const text = rawContent.trim();
      // Strip markdown code fences (handles ```json\n...\n``` patterns)
      const stripped = text.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
      // Extract outermost JSON object
      const firstBrace = stripped.indexOf("{");
      const lastBrace = stripped.lastIndexOf("}");
      const jsonString =
        firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace
          ? stripped.slice(firstBrace, lastBrace + 1)
          : stripped;

      parsed = JSON.parse(jsonString);
    } catch (e) {
      console.error("[LLM JSON Parse Error]", e);
      console.error("[Raw content (first 1000 chars)]", rawContent.slice(0, 1000));
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
        category_input: category_input.trim(),
        home_product_context: home_product_context ?? null,
        market_scope: market_scope ?? null,
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: insertedCompetitors, error: competitorsError } = await supabase
      .from("competitors")
      .insert(
        competitors.map((c) => ({
          analysis_id: insertedAnalysis.id, // or whatever FK column you use
          name: c.name,
          pricing: c.pricing,           // jsonb column
          features: c.features,         // jsonb or text[] column
          ratings: c.ratings,           // jsonb column
          positioning: c.positioning,
          strengths: c.strengths,       // jsonb column
          weaknesses: c.weaknesses,     // jsonb column
          gaps: c.gaps,                 // jsonb column
          // flattened scores fields — no `scores` key
          market_presence: c.scores.market_presence,
          product_depth: c.scores.product_depth,
          ease_of_use: c.scores.ease_of_use,
          value_for_money: c.scores.value_for_money,
          innovation: c.scores.innovation,
        }))
      );

    if (competitorsError) {
      console.error("[Supabase Competitors Insert Error]", competitorsError);
      return NextResponse.json(
        { error: "Failed to persist competitors." },
        { status: 500 }
      );
    }

    // 3. Insert into research_reports (needed for PRD generation FK)
    const { error: reportError } = await supabase
      .from("research_reports")
      .insert({
        category: category_input.trim(),
        competitors: competitors,
      });

    if (reportError) {
      console.error("[Supabase Research Report Insert Error]", reportError);
      // Non-blocking: the analysis still works, PRD generation just won't find the report
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
