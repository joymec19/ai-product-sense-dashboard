// app/api/analysis/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing analysis id." }, { status: 400 });
  }

  const supabase = getSupabase();

  // Parallel fetch all related data for this analysis
  const [analysisRes, competitorsRes, prdRes, marketRes] = await Promise.all([
    supabase
      .from("analyses")
      .select("*")
      .eq("id", id)
      .single(),

    supabase
      .from("competitors")
      .select("*")
      .eq("analysis_id", id),

    supabase
      .from("prd_documents")
      .select("*")
      .eq("analysis_id", id)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase
      .from("market_data")
      .select("*")
      .eq("analysis_id", id)
      .maybeSingle(),
  ]);

  if (analysisRes.error || !analysisRes.data) {
    console.error("[analysis/[id]] analysis not found:", id, analysisRes.error?.message);
    return NextResponse.json({ error: "Analysis not found." }, { status: 404 });
  }

  if (competitorsRes.error) {
    console.error("[analysis/[id]] competitors fetch error:", competitorsRes.error.message);
  }

  if (prdRes.error) {
    console.error("[analysis/[id]] prd fetch error:", prdRes.error.message);
  }

  // market_data table may not exist yet — treat as non-fatal
  if (marketRes.error && marketRes.error.code !== "42P01") {
    console.error("[analysis/[id]] market_data fetch error:", marketRes.error.message);
  }

  return NextResponse.json({
    analysis: analysisRes.data,
    competitors: competitorsRes.data ?? [],
    prd: prdRes.data ?? null,
    market_data: marketRes.error ? null : (marketRes.data ?? null),
  });
}
