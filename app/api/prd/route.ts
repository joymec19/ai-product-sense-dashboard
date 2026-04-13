import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generatePRD } from '@/lib/llm/prd';

const bodySchema = z.object({
  session_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'session_id (uuid) is required' }, { status: 400 });
  }

  const { session_id } = parsed.data;

  // ✅ Check the session — not research_reports
  const { data: session, error } = await supabase
    .from('analysis_sessions')
    .select('id, status, product_name, category, segment_tags, geography')
    .eq('id', session_id)
    .eq('user_id', user.id)   // RLS reinforced at query level too
    .single();

  if (error || !session) {
    return NextResponse.json({ error: 'Analysis session not found.' }, { status: 404 });
  }

  if (session.status === 'pending' || session.status === 'running') {
    return NextResponse.json(
      {
        error: 'Analysis is still running.',
        code: 'SESSION_NOT_READY',
        status: session.status,
      },
      { status: 202 } // 202 Accepted — tell the client to poll
    );
  }

  if (session.status === 'failed') {
    return NextResponse.json(
      { error: 'Analysis failed. Re-run competitive research before generating PRD.' },
      { status: 422 }
    );
  }

  // ✅ Pull whatever competitive data exists — don't block on research_reports
  const { data: competitors } = await supabase
    .from('competitors')
    .select('name, positioning, pricing, features, moat_type')
    .eq('session_id', session_id);

  // Generate PRD with session context + whatever competitors were found
  // (competitors may be empty on first run — that's fine, PRD still generates)
  const prdContent = await generatePRD({ session, competitors: competitors ?? [] });

  // Insert into prd_documents_v2 (new schema from M07)
  const { data: prd, error: insertError } = await supabase
    .from('prd_documents_v2')
    .insert({
      session_id,
      title: `PRD — ${session.product_name}`,
      status: 'draft',
    })
    .select('id')
    .single();

  if (insertError || !prd) {
    return NextResponse.json({ error: 'Failed to save PRD.' }, { status: 500 });
  }

  // Insert sections
  await supabase.from('prd_sections').insert(
    prdContent.sections.map((s, i) => ({
      prd_id: prd.id,
      section_type: s.type,
      sort_order: i,
      ai_content_md: s.content,
      content_md: s.content,
    }))
  );

  return NextResponse.json({ prd_id: prd.id }, { status: 201 });
}
