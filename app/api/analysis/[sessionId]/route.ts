// app/api/analysis/[sessionId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

function getSupabase() {
  return createSupabaseServiceClient();
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  if (!sessionId) {
    return NextResponse.json({ error: "Missing analysis id." }, { status: 400 });
  }

  const supabase = getSupabase();

  // Parallel fetch all related data for this analysis
  const [analysisRes, competitorsRes, prdRes, marketRes] = await Promise.all([
    supabase
      .from("analyses")
      .select("*")
      .eq("id", sessionId)
      .single(),

    supabase
      .from("competitors")
      .select("*")
      .eq("analysis_id", sessionId),

    supabase
      .from("prd_documents")
      .select("*")
      .eq("analysis_id", sessionId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase
      .from("market_data")
      .select("*")
      .eq("analysis_id", sessionId)
      .maybeSingle(),
  ]);

  if (analysisRes.error || !analysisRes.data) {
    console.error("[analysis/[sessionId]] analysis not found:", sessionId, analysisRes.error?.message);
    return NextResponse.json({ error: "Analysis not found." }, { status: 404 });
  }

  if (competitorsRes.error) {
    console.error("[analysis/[sessionId]] competitors fetch error:", competitorsRes.error.message);
  }

  if (prdRes.error) {
    console.error("[analysis/[sessionId]] prd fetch error:", prdRes.error.message);
  }

  // market_data table may not exist yet — treat as non-fatal
  if (marketRes.error && marketRes.error.code !== "42P01") {
    console.error("[analysis/[sessionId]] market_data fetch error:", marketRes.error.message);
  }

  return NextResponse.json({
    analysis: analysisRes.data,
    competitors: competitorsRes.data ?? [],
    prd: prdRes.data ?? null,
    market_data: marketRes.error ? null : (marketRes.data ?? null),
  });
}
