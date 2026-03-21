/**
 * scripts/seed-demo.ts
 *
 * Seeds one complete demo analysis for "AI scheduling apps for knowledge workers".
 *
 * Run with:
 *   npx ts-node scripts/seed-demo.ts
 *
 * Requires .env.local with:
 *   NEXT_PUBLIC_SUPABASE_URL=
 *   SUPABASE_SERVICE_ROLE_KEY=
 */

import * as dotenv from "dotenv";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

// Load env from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const CATEGORY = "AI scheduling apps for knowledge workers";
const SHARE_TOKEN = "ai-scheduling-demo-2026";

const HOME_PRODUCT_CONTEXT = `Product: Smart Scheduler
Smart Scheduler is an AI-first productivity tool that helps knowledge workers automatically plan, protect, and optimize their time. Unlike traditional calendar apps, it uses machine learning to understand work patterns, deadline urgency, and energy levels to proactively schedule deep work, meetings, and tasks. It integrates with Google Calendar, Outlook, Slack, Notion, Jira, and Linear. The pricing model is freemium ($0 free tier, $12/mo Pro, $20/mo Teams). Key differentiators: (1) Natural language task input that auto-schedules on your calendar, (2) "Focus Shield" that blocks distracting notifications during deep work, (3) AI meeting scheduler that finds optimal times based on all attendees' focus patterns, not just availability. Primary users: software engineers, product managers, and knowledge workers at companies of 10-500 people.`;

// ── Feature support data ─────────────────────────────────────────────────────
type SupportStatus = "full" | "partial" | "none";

const FEATURES = [
  "AI Auto-Scheduling",
  "Calendar Sync",
  "Focus Time Blocks",
  "Task Prioritization",
  "Mobile App",
  "Integrations",
  "Team Collaboration",
  "Daily Planning",
  "Time Tracking",
  "Analytics & Insights",
];

// ── Competitor definitions ───────────────────────────────────────────────────
interface CompetitorSeed {
  name: string;
  pricing: { model: string; starting_price_usd: number | null; has_free_tier: boolean };
  features: string[];
  ratings: { g2: number | null; capterra: number | null; overall: number };
  positioning: string;
  strengths: string[];
  weaknesses: string[];
  gaps: string[];
  // Legacy flat score columns (for backward compat with /api/research schema)
  market_presence: number;
  product_depth: number;
  ease_of_use: number;
  value_for_money: number;
  innovation: number;
  // Radar chart scores (CompetitorData schema used by frontend charts)
  scores: {
    ai_sophistication: number;
    pricing_value: number;
    mobile_ux: number;
    integrations: number;
    learning_curve: number;
  };
  featureSupport: Record<string, SupportStatus>;
}

const COMPETITORS: CompetitorSeed[] = [
  {
    name: "Reclaim.ai",
    pricing: { model: "freemium", starting_price_usd: 8, has_free_tier: true },
    features: ["AI Auto-Scheduling", "Calendar Sync", "Focus Time Blocks", "Task Prioritization", "Integrations", "Team Collaboration"],
    ratings: { g2: 4.8, capterra: 4.7, overall: 4.8 },
    positioning: "AI-powered time blocking and smart scheduling for teams",
    strengths: ["Best-in-class AI scheduling", "Strong Google Calendar integration", "Habits and recurring task support"],
    weaknesses: ["Limited mobile app experience", "No time tracking built-in", "Steep learning curve for new users"],
    gaps: ["Native mobile app is weak", "No AI meeting summarization", "Limited analytics"],
    market_presence: 7, product_depth: 8, ease_of_use: 7, value_for_money: 7, innovation: 9,
    scores: { ai_sophistication: 9, pricing_value: 7, mobile_ux: 6, integrations: 9, learning_curve: 7 },
    featureSupport: {
      "AI Auto-Scheduling": "full", "Calendar Sync": "full", "Focus Time Blocks": "full",
      "Task Prioritization": "full", "Mobile App": "partial", "Integrations": "full",
      "Team Collaboration": "full", "Daily Planning": "partial", "Time Tracking": "none",
      "Analytics & Insights": "partial",
    },
  },
  {
    name: "Motion",
    pricing: { model: "subscription", starting_price_usd: 19, has_free_tier: false },
    features: ["AI Auto-Scheduling", "Calendar Sync", "Task Prioritization", "Team Collaboration", "Daily Planning"],
    ratings: { g2: 4.3, capterra: 4.2, overall: 4.3 },
    positioning: "AI that automatically builds your schedule and manages your tasks",
    strengths: ["Powerful AI task scheduling", "All-in-one project + calendar tool", "Automatic deadline management"],
    weaknesses: ["Expensive ($19/mo)", "Overwhelming UI for new users", "Occasional over-scheduling"],
    gaps: ["No free tier", "Poor mobile UX", "Limited third-party integrations"],
    market_presence: 6, product_depth: 8, ease_of_use: 5, value_for_money: 5, innovation: 8,
    scores: { ai_sophistication: 8, pricing_value: 5, mobile_ux: 7, integrations: 7, learning_curve: 5 },
    featureSupport: {
      "AI Auto-Scheduling": "full", "Calendar Sync": "full", "Focus Time Blocks": "partial",
      "Task Prioritization": "full", "Mobile App": "partial", "Integrations": "partial",
      "Team Collaboration": "full", "Daily Planning": "full", "Time Tracking": "partial",
      "Analytics & Insights": "partial",
    },
  },
  {
    name: "Todoist",
    pricing: { model: "freemium", starting_price_usd: 4, has_free_tier: true },
    features: ["Task Prioritization", "Mobile App", "Integrations", "Team Collaboration", "Daily Planning"],
    ratings: { g2: 4.4, capterra: 4.6, overall: 4.5 },
    positioning: "The world's most popular task manager, simple and cross-platform",
    strengths: ["Excellent mobile apps", "Very affordable", "Massive integration ecosystem"],
    weaknesses: ["No AI scheduling", "No calendar blocking", "Basic focus time features"],
    gaps: ["No AI auto-scheduling", "No built-in calendar view", "No focus mode"],
    market_presence: 9, product_depth: 6, ease_of_use: 9, value_for_money: 9, innovation: 5,
    scores: { ai_sophistication: 5, pricing_value: 9, mobile_ux: 9, integrations: 8, learning_curve: 9 },
    featureSupport: {
      "AI Auto-Scheduling": "none", "Calendar Sync": "partial", "Focus Time Blocks": "none",
      "Task Prioritization": "full", "Mobile App": "full", "Integrations": "full",
      "Team Collaboration": "full", "Daily Planning": "full", "Time Tracking": "partial",
      "Analytics & Insights": "partial",
    },
  },
  {
    name: "Notion",
    pricing: { model: "freemium", starting_price_usd: 8, has_free_tier: true },
    features: ["Task Prioritization", "Mobile App", "Integrations", "Team Collaboration", "Analytics & Insights"],
    ratings: { g2: 4.7, capterra: 4.7, overall: 4.7 },
    positioning: "All-in-one workspace for notes, docs, and project management",
    strengths: ["Highly flexible and customizable", "Strong team collaboration", "Excellent documentation"],
    weaknesses: ["No AI scheduling", "No calendar time-blocking", "Can be slow to load"],
    gaps: ["No AI time management", "No focus mode", "Not a scheduling tool"],
    market_presence: 10, product_depth: 7, ease_of_use: 6, value_for_money: 7, innovation: 6,
    scores: { ai_sophistication: 6, pricing_value: 7, mobile_ux: 7, integrations: 8, learning_curve: 6 },
    featureSupport: {
      "AI Auto-Scheduling": "none", "Calendar Sync": "partial", "Focus Time Blocks": "none",
      "Task Prioritization": "full", "Mobile App": "full", "Integrations": "full",
      "Team Collaboration": "full", "Daily Planning": "partial", "Time Tracking": "partial",
      "Analytics & Insights": "partial",
    },
  },
  {
    name: "Morgen",
    pricing: { model: "freemium", starting_price_usd: 6, has_free_tier: true },
    features: ["Calendar Sync", "Focus Time Blocks", "Task Prioritization", "Mobile App", "Integrations", "Daily Planning"],
    ratings: { g2: 4.5, capterra: 4.4, overall: 4.5 },
    positioning: "Unified calendar that combines tasks and time-blocking in one place",
    strengths: ["Best unified calendar + task view", "Good mobile experience", "Affordable pricing"],
    weaknesses: ["Limited AI features", "Smaller integration library", "Less known brand"],
    gaps: ["No deep AI scheduling", "Limited team features", "No time tracking"],
    market_presence: 4, product_depth: 6, ease_of_use: 8, value_for_money: 8, innovation: 7,
    scores: { ai_sophistication: 7, pricing_value: 8, mobile_ux: 8, integrations: 7, learning_curve: 8 },
    featureSupport: {
      "AI Auto-Scheduling": "partial", "Calendar Sync": "full", "Focus Time Blocks": "full",
      "Task Prioritization": "full", "Mobile App": "full", "Integrations": "partial",
      "Team Collaboration": "partial", "Daily Planning": "full", "Time Tracking": "none",
      "Analytics & Insights": "none",
    },
  },
  {
    name: "Sunsama",
    pricing: { model: "subscription", starting_price_usd: 16, has_free_tier: false },
    features: ["Calendar Sync", "Focus Time Blocks", "Task Prioritization", "Mobile App", "Integrations", "Daily Planning", "Time Tracking"],
    ratings: { g2: 4.6, capterra: 4.5, overall: 4.6 },
    positioning: "Intentional daily planning for knowledge workers — async-first workflow",
    strengths: ["Best daily planning ritual UX", "Great integrations with Slack/Notion/Linear", "Time tracking built-in"],
    weaknesses: ["No free tier, $16/mo", "No AI auto-scheduling", "Not great for team coordination"],
    gaps: ["No AI scheduling engine", "Expensive for individuals", "Limited analytics"],
    market_presence: 5, product_depth: 7, ease_of_use: 7, value_for_money: 5, innovation: 6,
    scores: { ai_sophistication: 6, pricing_value: 5, mobile_ux: 7, integrations: 7, learning_curve: 8 },
    featureSupport: {
      "AI Auto-Scheduling": "none", "Calendar Sync": "full", "Focus Time Blocks": "full",
      "Task Prioritization": "full", "Mobile App": "full", "Integrations": "full",
      "Team Collaboration": "partial", "Daily Planning": "full", "Time Tracking": "full",
      "Analytics & Insights": "partial",
    },
  },
  {
    name: "Akiflow",
    pricing: { model: "subscription", starting_price_usd: 15, has_free_tier: false },
    features: ["Calendar Sync", "Focus Time Blocks", "Task Prioritization", "Mobile App", "Integrations", "Daily Planning", "Time Tracking"],
    ratings: { g2: 4.7, capterra: 4.6, overall: 4.7 },
    positioning: "Command bar productivity tool that centralizes tasks from all your apps",
    strengths: ["Powerful universal inbox for tasks", "Fast keyboard-driven UX", "Strong integrations"],
    weaknesses: ["No free tier", "No AI scheduling", "Steep learning curve"],
    gaps: ["No AI auto-scheduling", "Limited team features", "No focus time protection"],
    market_presence: 4, product_depth: 7, ease_of_use: 6, value_for_money: 6, innovation: 7,
    scores: { ai_sophistication: 7, pricing_value: 6, mobile_ux: 6, integrations: 8, learning_curve: 6 },
    featureSupport: {
      "AI Auto-Scheduling": "partial", "Calendar Sync": "full", "Focus Time Blocks": "full",
      "Task Prioritization": "full", "Mobile App": "full", "Integrations": "full",
      "Team Collaboration": "partial", "Daily Planning": "full", "Time Tracking": "full",
      "Analytics & Insights": "partial",
    },
  },
  {
    name: "Smart Scheduler",
    pricing: { model: "freemium", starting_price_usd: 12, has_free_tier: true },
    features: ["AI Auto-Scheduling", "Calendar Sync", "Focus Time Blocks", "Task Prioritization", "Mobile App", "Integrations", "Team Collaboration", "Daily Planning", "Time Tracking", "Analytics & Insights"],
    ratings: { g2: null, capterra: null, overall: 4.5 },
    positioning: "AI-first time intelligence platform that learns your work patterns to protect focus and optimize every hour",
    strengths: [
      "Natural language task input with AI auto-scheduling",
      "Focus Shield blocks distractions during deep work",
      "AI meeting scheduler respects focus patterns, not just availability",
      "Learns individual energy and productivity patterns",
    ],
    weaknesses: [
      "New entrant with limited brand awareness",
      "No enterprise SSO yet",
      "Analytics dashboard is in beta",
    ],
    gaps: [
      "Need to build trust with enterprise buyers",
      "Requires calendar permission which some users resist",
    ],
    market_presence: 3, product_depth: 8, ease_of_use: 8, value_for_money: 8, innovation: 9,
    scores: { ai_sophistication: 9, pricing_value: 8, mobile_ux: 8, integrations: 8, learning_curve: 8 },
    featureSupport: {
      "AI Auto-Scheduling": "full", "Calendar Sync": "full", "Focus Time Blocks": "full",
      "Task Prioritization": "full", "Mobile App": "full", "Integrations": "full",
      "Team Collaboration": "full", "Daily Planning": "full", "Time Tracking": "full",
      "Analytics & Insights": "full",
    },
  },
];

// ── PRD document ─────────────────────────────────────────────────────────────
const DEMO_PRD = {
  objective: "Build the most intelligent AI scheduling platform for knowledge workers — one that autonomously plans, protects, and optimises every hour so users can do their best work without calendar anxiety.",
  problem_statement: "Knowledge workers lose 2–3 hours daily to context switching, poorly timed meetings, and reactive task management. Existing tools either require manual time-blocking (Sunsama, Akiflow) or have AI that doesn't understand individual work patterns (Reclaim.ai, Motion). There is no tool that combines deep AI scheduling intelligence with frictionless UX and a compelling free tier.",
  solution_narrative: "Smart Scheduler uses ML models trained on individual work patterns to auto-schedule tasks, protect focus time, and find meeting slots that respect everyone's deep work windows — not just calendar gaps. Unlike Reclaim.ai (weak mobile, no tracking) or Motion (expensive, no free tier), Smart Scheduler ships with a polished mobile app, built-in time tracking, and a $0 free tier. The AI 'Focus Shield' is a unique differentiator that actively blocks distractions — no competitor offers this.",
  personas: [
    {
      name: "Alex Chen",
      role: "Senior Software Engineer",
      goals: ["Ship features without constant interruptions", "Protect deep work time", "Stay on top of Jira/Linear tickets"],
      pain_points: ["Too many meetings breaking focus", "Manual time-blocking takes too long", "Forgetting to log time"],
      tech_savviness: "high" as const,
    },
    {
      name: "Priya Sharma",
      role: "Product Manager",
      goals: ["Balance strategic thinking with team coordination", "Never miss deadlines", "Have a clear daily plan by 9am"],
      pain_points: ["Constant context switching between tools", "Meetings scheduled during best thinking time", "No visibility into where time actually goes"],
      tech_savviness: "high" as const,
    },
    {
      name: "Jordan Kim",
      role: "Freelance Designer",
      goals: ["Maximize billable hours", "Separate client work from personal projects", "Track time accurately for invoicing"],
      pain_points: ["Hard to say no to meeting requests", "Loses track of time on projects", "No affordable tool that does scheduling + tracking"],
      tech_savviness: "medium" as const,
    },
  ],
  features: {
    p1: [
      {
        id: "p1-1",
        title: "AI Auto-Scheduler",
        description: "Automatically schedule tasks from any connected app (Jira, Linear, Notion, Todoist) onto the calendar based on deadlines, estimated duration, and the user's historical productivity patterns.",
        user_story: "As a knowledge worker, I want my AI to schedule my tasks automatically so that I can focus on doing the work, not planning when to do it.",
        acceptance_criteria: [
          "Tasks from connected apps appear in Smart Scheduler inbox within 60 seconds",
          "AI schedules tasks in available slots respecting user-defined focus hours",
          "User can override or reschedule any AI-placed event with one drag",
          "Scheduling respects deadline urgency and task dependencies",
        ],
      },
      {
        id: "p1-2",
        title: "Focus Shield",
        description: "A proactive focus protection system that silences notifications, blocks distracting apps/sites, and sets Slack/Teams status to DND during scheduled deep work blocks.",
        user_story: "As a developer, I want my focus time to be actively protected so that I can enter flow state without managing notification settings manually.",
        acceptance_criteria: [
          "Focus Shield activates automatically at the start of a scheduled focus block",
          "Integrates with Slack, Microsoft Teams, and macOS/iOS Focus modes",
          "User can pause Focus Shield with a single click",
          "Emergency contacts can still reach the user via allowlist",
        ],
      },
      {
        id: "p1-3",
        title: "AI Meeting Scheduler",
        description: "Suggest optimal meeting times by analysing all attendees' focus patterns, energy levels, and task load — not just calendar availability.",
        user_story: "As a PM, I want to schedule team meetings at times that don't disrupt anyone's deep work so that we collaborate efficiently without killing productivity.",
        acceptance_criteria: [
          "Attendee focus pattern analysis runs before suggesting slots",
          "Suggests top 3 meeting times ranked by productivity impact score",
          "Sends calendar invite with Smart Scheduler link for attendees to confirm",
          "Meeting scheduler respects user-defined 'no meeting' hours",
        ],
      },
      {
        id: "p1-4",
        title: "Natural Language Task Input",
        description: "Users can add tasks using conversational language (e.g., 'Draft Q3 roadmap, 2 hours, due Friday') and the AI parses, estimates, and schedules them automatically.",
        user_story: "As a busy professional, I want to add tasks using natural language so that task capture takes under 10 seconds.",
        acceptance_criteria: [
          "NLP parser handles duration, deadline, and priority from plain text",
          "Tasks are scheduled on calendar within 5 seconds of submission",
          "Ambiguous inputs prompt a single clarifying question",
          "Works via mobile app, web, browser extension, and Slack bot",
        ],
      },
    ],
    p2: [
      {
        id: "p2-1",
        title: "Time Tracking & Reporting",
        description: "Automatic time tracking that records actual time spent on tasks vs planned time, with weekly reports showing productivity trends and time distribution across projects.",
        user_story: "As a freelancer, I want automatic time tracking so that I can invoice clients accurately without manually starting and stopping timers.",
        acceptance_criteria: [
          "Time tracking starts automatically when a focus block begins",
          "Weekly report shows planned vs actual time per project",
          "CSV/PDF export for invoicing and reporting",
          "Integrates with Harvest, Toggl, and FreshBooks",
        ],
      },
      {
        id: "p2-2",
        title: "Team Calendar Intelligence",
        description: "Team-level view showing aggregate focus time health, meeting load, and scheduling conflicts across the team to help managers optimise team productivity.",
        user_story: "As an engineering manager, I want a bird's-eye view of my team's focus time so that I can reduce meeting load and protect makers' schedules.",
        acceptance_criteria: [
          "Team dashboard shows focus time percentage per team member",
          "Flags team members with >40% meeting load as at-risk",
          "Manager can suggest focus blocks for team members",
          "Respects individual privacy — only aggregate patterns visible to manager",
        ],
      },
    ],
    p3: [
      {
        id: "p3-1",
        title: "AI Energy Level Adaptation",
        description: "Learn individual chronotype and energy patterns over 2–4 weeks, then adapt scheduling to place high-cognitive work during peak energy hours.",
      },
      {
        id: "p3-2",
        title: "Voice-First Mobile Experience",
        description: "Hands-free task input and schedule review via voice commands on iOS and Android, optimised for commuting and walking.",
      },
      {
        id: "p3-3",
        title: "Productivity Score & Coaching",
        description: "Weekly AI-generated productivity insights and personalised recommendations for improving focus habits and schedule health.",
      },
    ],
  },
  success_metrics: [
    {
      metric: "Daily Active Users (DAU)",
      target: "10,000 DAU within 6 months of launch",
      measurement_method: "Supabase analytics + Mixpanel event tracking",
      timeframe: "6 months post-launch",
    },
    {
      metric: "Free-to-Paid Conversion Rate",
      target: "8% of free tier users convert to Pro within 30 days",
      measurement_method: "Stripe webhook events correlated with signup date",
      timeframe: "30-day cohort analysis, reviewed monthly",
    },
    {
      metric: "Focus Time Saved per User",
      target: "Average user protects 90+ minutes of focus time per week vs baseline",
      measurement_method: "In-app time tracking data, pre/post onboarding survey",
      timeframe: "30 days post-activation",
    },
    {
      metric: "Net Promoter Score (NPS)",
      target: "NPS > 50 among active Pro users",
      measurement_method: "In-app NPS survey triggered at 30-day mark",
      timeframe: "Measured monthly",
    },
  ],
  risks: [
    {
      risk: "Calendar permission friction reduces activation rate",
      likelihood: "high" as const,
      impact: "high" as const,
      mitigation: "Show clear value demonstration before permission request; offer read-only mode first; provide privacy FAQ on permission screen",
    },
    {
      risk: "AI scheduling quality is poor in early weeks before personalisation kicks in",
      likelihood: "medium" as const,
      impact: "high" as const,
      mitigation: "Set clear expectations in onboarding ('gets smarter after 2 weeks'); provide manual override on every AI decision; collect explicit feedback on schedule quality",
    },
    {
      risk: "Reclaim.ai or Motion copies Focus Shield feature",
      likelihood: "medium" as const,
      impact: "medium" as const,
      mitigation: "File provisional patent; move fast on enterprise partnerships; build network effects via team features that are hard to replicate",
    },
    {
      risk: "Integration partner API changes break key workflows",
      likelihood: "low" as const,
      impact: "high" as const,
      mitigation: "Monitor API changelogs; maintain 2-version backward compatibility; automated integration health checks every 15 minutes",
    },
  ],
  gtm: {
    target_segment: "Knowledge workers (software engineers, PMs, designers) at tech-forward SMBs (10–500 employees) in the US and UK, who currently use Todoist, Notion, or Reclaim.ai",
    positioning_statement: "For knowledge workers drowning in meetings and reactive tasks, Smart Scheduler is the AI time intelligence platform that automatically plans and protects your best work hours — unlike Reclaim.ai which requires manual setup, or Motion which costs $19/mo with no free tier.",
    channels: ["Product Hunt launch", "LinkedIn thought leadership (PM + engineering communities)", "HN Show HN post", "Integration marketplace listings (Notion, Slack, Linear)", "Referral programme ($15 credit per successful invite)"],
    pricing_strategy: "Freemium: Free (1 calendar, 5 AI tasks/day), Pro $12/mo (unlimited AI scheduling + Focus Shield + time tracking), Teams $20/user/mo (team dashboard + manager controls + priority support). Annual billing at 20% discount.",
    launch_phases: [
      {
        phase: 1,
        name: "Closed Beta",
        duration: "6 weeks",
        goals: ["Onboard 200 beta users from waitlist", "Validate AI scheduling quality with real calendars", "Achieve 70% weekly retention among beta cohort"],
      },
      {
        phase: 2,
        name: "Public Launch",
        duration: "4 weeks",
        goals: ["Product Hunt #1 of the day", "5,000 free tier signups", "500 Pro conversions", "Press coverage in The Verge, TechCrunch, Hacker News"],
      },
      {
        phase: 3,
        name: "Growth & Partnerships",
        duration: "Ongoing from month 3",
        goals: ["10,000 DAU", "Integration partnerships with Notion, Linear, Jira", "Enterprise pilot with 5 companies (50+ seats)", "Launch Teams tier"],
      },
    ],
  },
};

// ── Main seed function ───────────────────────────────────────────────────────
async function seed() {
  console.log("🌱 Starting demo seed...\n");

  // 0. Check if demo already exists
  const { data: existing } = await supabase
    .from("analyses")
    .select("id")
    .eq("share_token", SHARE_TOKEN)
    .maybeSingle();

  if (existing) {
    console.log(`✅ Demo already exists (share_token: ${SHARE_TOKEN}). Skipping.\n   To re-seed, delete the existing row first.`);
    process.exit(0);
  }

  // 1. Insert analysis
  console.log("1/4  Inserting analysis...");
  const { data: analysis, error: analysisError } = await supabase
    .from("analyses")
    .insert({
      category: CATEGORY,
      category_input: CATEGORY,
      home_product_context: HOME_PRODUCT_CONTEXT,
      market_scope: null,
      share_token: SHARE_TOKEN,
    })
    .select("id")
    .single();

  if (analysisError || !analysis) {
    console.error("❌ Failed to insert analysis:", analysisError?.message);
    process.exit(1);
  }
  console.log(`   analysis.id = ${analysis.id}`);

  // 2. Insert competitors
  console.log("2/4  Inserting competitors...");
  const competitorRows = COMPETITORS.map((c) => ({
    analysis_id: analysis.id,
    name: c.name,
    pricing: c.pricing,
    features: c.features,
    ratings: c.ratings,
    positioning: c.positioning,
    strengths: c.strengths,
    weaknesses: c.weaknesses,
    gaps: c.gaps,
    // Legacy flat score columns
    market_presence: c.market_presence,
    product_depth: c.product_depth,
    ease_of_use: c.ease_of_use,
    value_for_money: c.value_for_money,
    innovation: c.innovation,
    // Radar scores JSONB (used by frontend charts)
    scores: c.scores,
    // Feature support JSONB (used by FeatureMatrix + CompetitorCard)
    featureSupport: c.featureSupport,
  }));

  const { error: competitorsError } = await supabase
    .from("competitors")
    .insert(competitorRows);

  if (competitorsError) {
    console.error("❌ Failed to insert competitors:", competitorsError?.message);
    process.exit(1);
  }
  console.log(`   Inserted ${competitorRows.length} competitors`);

  // 3. Insert research_reports (required for share page PRD lookup)
  console.log("3/4  Inserting research_reports...");
  const { data: report, error: reportError } = await supabase
    .from("research_reports")
    .insert({
      category: CATEGORY,
      competitors: COMPETITORS.map((c) => ({
        name: c.name,
        pricing: c.pricing,
        features: c.features,
        ratings: c.ratings,
        positioning: c.positioning,
        strengths: c.strengths,
        weaknesses: c.weaknesses,
        gaps: c.gaps,
        scores: {
          market_presence: c.market_presence,
          product_depth: c.product_depth,
          ease_of_use: c.ease_of_use,
          value_for_money: c.value_for_money,
          innovation: c.innovation,
        },
      })),
    })
    .select("id")
    .single();

  if (reportError || !report) {
    console.error("❌ Failed to insert research_reports:", reportError?.message);
    process.exit(1);
  }
  console.log(`   research_reports.id = ${report.id}`);

  // 4. Insert PRD document
  // NOTE: The share page queries prd_documents with analysis_id = research_reports.id
  // (see app/analysis/[id]/share/page.tsx). So we use report.id here.
  console.log("4/4  Inserting prd_documents...");
  const { error: prdError } = await supabase
    .from("prd_documents")
    .insert({
      analysis_id: report.id,
      ...DEMO_PRD,
      version: 1,
      updated_at: new Date().toISOString(),
    });

  if (prdError) {
    console.error("❌ Failed to insert prd_documents:", prdError?.message);
    process.exit(1);
  }
  console.log("   PRD document inserted");

  console.log(`
✅ Demo seed complete!

   Share URL:  /analysis/${SHARE_TOKEN}/share
   Analysis:   /analysis/${analysis.id}
   Share token: ${SHARE_TOKEN}
`);
}

seed().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
