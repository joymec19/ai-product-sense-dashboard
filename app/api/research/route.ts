import { NextRequest, NextResponse } from "next/server";
import { jsonrepair } from "jsonrepair";
import { CompetitorArraySchema, type Competitor } from "@/lib/schemas/competitor";

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

function getSupabase() {
  return createSupabaseServiceClient();
}

const SYSTEM_PROMPT = `You are a senior market research analyst.

CRITICAL INSTRUCTIONS:
- Your ENTIRE response must be a single valid JSON object.
- Start your response with { and end with }
- Do NOT use markdown code fences (\`\`\`json or \`\`\`).
- Do NOT include any text, explanation, or commentary before or after the JSON.

Return a JSON object with a single key "competitors" containing an array of exactly 5 objects. Each object must have exactly these fields:
{
  "name": string,
  "website": string or null,
  "founded": number (year) or null,
  "target_segment": string,
  "pricing": { "model": string, "starting_price_usd": number or null, "has_free_tier": boolean },
  "features": array of strings (top 8-12 key features),
  "ratings": { "g2": number or null, "capterra": number or null, "overall": number between 1 and 5 },
  "positioning": string,
  "strengths": array of strings,
  "weaknesses": array of strings,
  "gaps": array of strings,
  "scores": { "market_presence": number 1-10, "product_depth": number 1-10, "ease_of_use": number 1-10, "value_for_money": number 1-10, "innovation": number 1-10 },
  "ai_sophistication": number 1-10,
  "ux_score": number 1-10,
  "mobile_score": number 1-10,
  "integration_count": integer (estimated number of integrations),
  "review_summary": string (1-2 sentence summary of user sentiment),
  "moat_scores": { "switching_costs": number 1-10, "network_effects": number 1-10, "data_advantages": number 1-10, "brand": number 1-10 }
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

    // env.SARVAM_API_KEY is validated at startup via lib/env.ts

    // ── LLM fetch + parse + validate (all retried together) ──────
    const MAX_ATTEMPTS = 3;

    // Helpers shared across attempts
    const extractBraces = (s: string): string | null => {
      const first = s.indexOf("{");
      const last = s.lastIndexOf("}");
      return first !== -1 && last > first ? s.slice(first, last + 1) : null;
    };
    const stripFences = (s: string) =>
      s.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
    const isObjectArray = (v: unknown): v is object[] =>
      Array.isArray(v) && v.length > 0 && typeof v[0] === 'object' && v[0] !== null;

    function findObjectArray(value: unknown, depth = 0): object[] | null {
      if (depth > 3) return null;
      if (isObjectArray(value)) return value;
      if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
      const obj = value as Record<string, unknown>;
      for (const key of ['competitors', 'data', 'results', 'items', 'companies']) {
        if (isObjectArray(obj[key])) return obj[key] as object[];
      }
      let best: object[] | null = null;
      for (const v of Object.values(obj)) {
        const found = findObjectArray(v, depth + 1);
        if (found && (!best || found.length > best.length)) best = found;
      }
      return best;
    }

    let competitors: Competitor[] | null = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      // ── Fetch ────────────────────────────────────────────────────
      let llmResponse: Response;
      try {
        llmResponse = await fetch("https://api.sarvam.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-subscription-key": env.SARVAM_API_KEY,
          },
          body: JSON.stringify({
            model: "sarvam-m",
            temperature: 0.2,
            max_tokens: 2048,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              {
                role: "user",
                content: `Analyze the competitive landscape for this category: "${category_input.trim()}"`,
              },
            ],
          }),
        });
      } catch (networkErr) {
        console.error(`[LLM Network Error] attempt ${attempt}`, networkErr);
        if (attempt === MAX_ATTEMPTS) {
          return NextResponse.json(
            { error: "LLM network error. Please retry in a few seconds." },
            { status: 502 }
          );
        }
        await new Promise((r) => setTimeout(r, attempt * 1500));
        continue;
      }

      if (!llmResponse.ok) {
        const errorBody = await llmResponse.text();
        console.error(`[Sarvam HTTP Error] attempt ${attempt}`, llmResponse.status, errorBody);
        if (attempt < MAX_ATTEMPTS && (llmResponse.status === 429 || llmResponse.status >= 500)) {
          await new Promise((r) => setTimeout(r, attempt * 1500));
          continue;
        }
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
        console.error(`[Sarvam empty content] attempt ${attempt} finish_reason:`, finishReason);
        if (attempt < MAX_ATTEMPTS) {
          await new Promise((r) => setTimeout(r, attempt * 1500));
          continue;
        }
        return NextResponse.json(
          { error: finishReason === "length" ? "LLM ran out of tokens. Please try again." : "Empty response from LLM." },
          { status: 502 }
        );
      }

      // ── Parse ────────────────────────────────────────────────────
      let parsed: unknown;
      try {
        const noThink = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
        const jsonString =
          extractBraces(stripFences(noThink)) ??
          extractBraces(stripFences(rawContent)) ??
          rawContent;
        parsed = JSON.parse(jsonrepair(jsonString));
      } catch (e) {
        console.error(`[JSON Parse Error] attempt ${attempt}`, e);
        console.error("[Raw content (first 500)]", rawContent.slice(0, 500));
        if (attempt < MAX_ATTEMPTS) { await new Promise((r) => setTimeout(r, attempt * 1500)); continue; }
        return NextResponse.json({ error: "LLM returned malformed JSON." }, { status: 502 });
      }

      // ── Validate ─────────────────────────────────────────────────
      const rawCompetitors = findObjectArray(parsed);
      console.log(`[research] attempt ${attempt} — rawCompetitors length:`, Array.isArray(rawCompetitors) ? rawCompetitors.length : rawCompetitors);

      const validation = CompetitorArraySchema.safeParse(rawCompetitors);
      if (!validation.success) {
        console.error(`[Zod Validation Failed] attempt ${attempt}`, validation.error.flatten());
        if (attempt < MAX_ATTEMPTS) { await new Promise((r) => setTimeout(r, attempt * 1500)); continue; }
        return NextResponse.json(
          { error: "LLM response failed schema validation.", issues: validation.error.flatten() },
          { status: 422 }
        );
      }

      competitors = validation.data;
      break;
    }

    if (!competitors) {
      return NextResponse.json({ error: "LLM did not return valid competitors after retries." }, { status: 502 });
    }

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
        status: "complete",
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
          analysis_id: insertedAnalysis.id,
          name: c.name,
          pricing: c.pricing,
          features: c.features,
          ratings: c.ratings,
          positioning: c.positioning,
          strengths: c.strengths,
          weaknesses: c.weaknesses,
          gaps: c.gaps,
          // flattened scores fields
          market_presence: c.scores.market_presence,
          product_depth: c.scores.product_depth,
          ease_of_use: c.scores.ease_of_use,
          value_for_money: c.scores.value_for_money,
          innovation: c.scores.innovation,
          // new optional columns
          logo_url: c.logo_url ?? null,
          founded: c.founded ?? null,
          website: c.website ?? null,
          target_segment: c.target_segment ?? null,
          ai_sophistication: c.ai_sophistication ?? null,
          ux_score: c.ux_score ?? null,
          mobile_score: c.mobile_score ?? null,
          integration_count: c.integration_count ?? null,
          review_summary: c.review_summary ?? null,
          moat_scores: c.moat_scores ?? null,
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

    // 4. Create an analysis_sessions row so the new dashboard route
    //    (/analysis/[sessionId]/competitive) can resolve the session.
    //    The (dashboard) layout calls getSession() against analysis_sessions —
    //    without this row it returns null → notFound() → 404.
    const { data: insertedSession, error: sessionError } = await supabase
      .from("analysis_sessions")
      .insert({
        product_name: category_input.trim(),
        category: category_input.trim(),
        status: "complete",
        segment_tags: [],
        custom_competitors: [],
      })
      .select("id")
      .single();

    if (sessionError) {
      console.error("[Supabase Session Insert Error]", sessionError);
      // Non-blocking: fall back to legacy analysis_id navigation
    }

    return NextResponse.json(
      {
        analysis_id: insertedAnalysis.id,
        session_id: insertedSession?.id ?? null,
        category: category_input.trim(),
        competitors,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[Unhandled Error]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
