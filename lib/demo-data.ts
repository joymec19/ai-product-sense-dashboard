// lib/demo-data.ts — static demo for /analysis/ai-scheduling-demo-2026/share
import type { CompetitorData, PRDDocument, SupportStatus } from "@/lib/types/dashboard";

export const DEMO_SHARE_TOKEN = "ai-scheduling-demo-2026";
export const DEMO_CATEGORY = "AI Scheduling Apps for Knowledge Workers";

export const DEMO_COMPETITORS: CompetitorData[] = [
  {
    name: "Reclaim.ai",
    pricing: { model: "freemium", starting_price_usd: 8, has_free_tier: true },
    ai_sophistication: 9, ux_score: 6, mobile_score: 6, integration_count: 9,
    scores: { market_presence: 8, product_depth: 9, ease_of_use: 7, value_for_money: 7, innovation: 8 },
    featureSupport: {
      "AI Auto-Scheduling": "full", "Calendar Sync": "full", "Focus Time Blocks": "full",
      "Task Prioritization": "full", "Mobile App": "partial", "Integrations": "full",
      "Team Collaboration": "full", "Daily Planning": "partial", "Time Tracking": "none",
      "Analytics & Insights": "partial",
    } as Record<string, SupportStatus>,
    strengths: ["Best-in-class AI scheduling", "Strong Google Calendar integration", "Habits and recurring task support"],
    weaknesses: ["Limited mobile app experience", "No time tracking built-in"],
  },
  {
    name: "Motion",
    pricing: { model: "subscription", starting_price_usd: 19, has_free_tier: false },
    ai_sophistication: 8, ux_score: 7, mobile_score: 7, integration_count: 7,
    scores: { market_presence: 7, product_depth: 8, ease_of_use: 5, value_for_money: 5, innovation: 7 },
    featureSupport: {
      "AI Auto-Scheduling": "full", "Calendar Sync": "full", "Focus Time Blocks": "partial",
      "Task Prioritization": "full", "Mobile App": "partial", "Integrations": "partial",
      "Team Collaboration": "full", "Daily Planning": "full", "Time Tracking": "partial",
      "Analytics & Insights": "partial",
    } as Record<string, SupportStatus>,
    strengths: ["Powerful AI task scheduling", "All-in-one project + calendar tool"],
    weaknesses: ["Expensive ($19/mo)", "No free tier"],
  },
  {
    name: "Todoist",
    pricing: { model: "freemium", starting_price_usd: 4, has_free_tier: true },
    ai_sophistication: 5, ux_score: 9, mobile_score: 9, integration_count: 8,
    scores: { market_presence: 9, product_depth: 6, ease_of_use: 9, value_for_money: 9, innovation: 5 },
    featureSupport: {
      "AI Auto-Scheduling": "none", "Calendar Sync": "partial", "Focus Time Blocks": "none",
      "Task Prioritization": "full", "Mobile App": "full", "Integrations": "full",
      "Team Collaboration": "full", "Daily Planning": "full", "Time Tracking": "partial",
      "Analytics & Insights": "partial",
    } as Record<string, SupportStatus>,
    strengths: ["Excellent mobile apps", "Very affordable"],
    weaknesses: ["No AI scheduling", "No calendar blocking"],
  },
  {
    name: "Notion",
    pricing: { model: "freemium", starting_price_usd: 8, has_free_tier: true },
    ai_sophistication: 6, ux_score: 7, mobile_score: 7, integration_count: 8,
    scores: { market_presence: 9, product_depth: 7, ease_of_use: 6, value_for_money: 7, innovation: 6 },
    featureSupport: {
      "AI Auto-Scheduling": "none", "Calendar Sync": "partial", "Focus Time Blocks": "none",
      "Task Prioritization": "full", "Mobile App": "full", "Integrations": "full",
      "Team Collaboration": "full", "Daily Planning": "partial", "Time Tracking": "partial",
      "Analytics & Insights": "partial",
    } as Record<string, SupportStatus>,
    strengths: ["Highly flexible and customizable", "Strong team collaboration"],
    weaknesses: ["No AI scheduling", "Not a scheduling tool"],
  },
  {
    name: "Morgen",
    pricing: { model: "freemium", starting_price_usd: 6, has_free_tier: true },
    ai_sophistication: 7, ux_score: 8, mobile_score: 8, integration_count: 7,
    scores: { market_presence: 5, product_depth: 7, ease_of_use: 8, value_for_money: 8, innovation: 7 },
    featureSupport: {
      "AI Auto-Scheduling": "partial", "Calendar Sync": "full", "Focus Time Blocks": "full",
      "Task Prioritization": "full", "Mobile App": "full", "Integrations": "partial",
      "Team Collaboration": "partial", "Daily Planning": "full", "Time Tracking": "none",
      "Analytics & Insights": "none",
    } as Record<string, SupportStatus>,
    strengths: ["Best unified calendar + task view", "Affordable pricing"],
    weaknesses: ["Limited AI features", "Smaller integration library"],
  },
  {
    name: "Sunsama",
    pricing: { model: "subscription", starting_price_usd: 16, has_free_tier: false },
    ai_sophistication: 6, ux_score: 7, mobile_score: 7, integration_count: 7,
    scores: { market_presence: 5, product_depth: 7, ease_of_use: 8, value_for_money: 5, innovation: 6 },
    featureSupport: {
      "AI Auto-Scheduling": "none", "Calendar Sync": "full", "Focus Time Blocks": "full",
      "Task Prioritization": "full", "Mobile App": "full", "Integrations": "full",
      "Team Collaboration": "partial", "Daily Planning": "full", "Time Tracking": "full",
      "Analytics & Insights": "partial",
    } as Record<string, SupportStatus>,
    strengths: ["Best daily planning ritual UX", "Time tracking built-in"],
    weaknesses: ["No free tier, $16/mo", "No AI auto-scheduling"],
  },
  {
    name: "Akiflow",
    pricing: { model: "subscription", starting_price_usd: 15, has_free_tier: false },
    ai_sophistication: 7, ux_score: 6, mobile_score: 6, integration_count: 8,
    scores: { market_presence: 5, product_depth: 7, ease_of_use: 6, value_for_money: 6, innovation: 7 },
    featureSupport: {
      "AI Auto-Scheduling": "partial", "Calendar Sync": "full", "Focus Time Blocks": "full",
      "Task Prioritization": "full", "Mobile App": "full", "Integrations": "full",
      "Team Collaboration": "partial", "Daily Planning": "full", "Time Tracking": "full",
      "Analytics & Insights": "partial",
    } as Record<string, SupportStatus>,
    strengths: ["Powerful universal inbox", "Fast keyboard-driven UX"],
    weaknesses: ["No free tier", "No AI scheduling"],
  },
  {
    name: "Smart Scheduler",
    pricing: { model: "freemium", starting_price_usd: 12, has_free_tier: true },
    ai_sophistication: 9, ux_score: 8, mobile_score: 8, integration_count: 8,
    scores: { market_presence: 3, product_depth: 9, ease_of_use: 8, value_for_money: 8, innovation: 9 },
    featureSupport: {
      "AI Auto-Scheduling": "full", "Calendar Sync": "full", "Focus Time Blocks": "full",
      "Task Prioritization": "full", "Mobile App": "full", "Integrations": "full",
      "Team Collaboration": "full", "Daily Planning": "full", "Time Tracking": "full",
      "Analytics & Insights": "full",
    } as Record<string, SupportStatus>,
    strengths: ["Natural language task input with AI auto-scheduling", "Focus Shield blocks distractions", "Free tier available"],
    weaknesses: ["New entrant with limited brand awareness", "No enterprise SSO yet"],
  },
];

export const DEMO_ALL_FEATURES = [
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

export const DEMO_PRD: PRDDocument = {
  id: "demo-prd-001",
  analysis_id: "demo-analysis-001",
  version: 1,
  objective:
    "Build the most intelligent AI scheduling platform for knowledge workers — one that autonomously plans, protects, and optimises every hour so users can do their best work without calendar anxiety.",
  problem_statement:
    "Knowledge workers lose 2–3 hours daily to context switching, poorly timed meetings, and reactive task management. Existing tools either require manual time-blocking or have AI that doesn't understand individual work patterns. There is no tool that combines deep AI scheduling intelligence with frictionless UX and a compelling free tier.",
  solution_narrative:
    "Smart Scheduler uses ML models trained on individual work patterns to auto-schedule tasks, protect focus time, and find meeting slots that respect everyone's deep work windows — not just calendar gaps.",
  personas: [
    {
      name: "Alex Chen",
      role: "Senior Software Engineer",
      pain_points: ["Too many meetings breaking focus", "Manual time-blocking takes too long"],
      wtp: "$12/mo",
    },
    {
      name: "Priya Sharma",
      role: "Product Manager",
      pain_points: ["Constant context switching between tools", "No visibility into where time actually goes"],
      wtp: "$15/mo",
    },
  ],
  features: {
    p1: [
      {
        title: "AI Auto-Scheduler",
        description:
          "Automatically schedule tasks from any connected app onto the calendar based on deadlines, estimated duration, and the user's historical productivity patterns.",
        jtbd: "When I have a deadline, I want my tasks auto-scheduled so I don't have to manually find time slots.",
        ice: { impact: 9, confidence: 8, ease: 7 },
      },
      {
        title: "Focus Shield",
        description:
          "Silences notifications, blocks distracting apps/sites, and sets Slack/Teams status to DND during scheduled deep work blocks.",
        jtbd: "When I'm in a focus block, I want all distractions blocked automatically so I can reach flow state.",
        ice: { impact: 8, confidence: 9, ease: 8 },
      },
      {
        title: "AI Meeting Scheduler",
        description:
          "Suggest optimal meeting times by analysing all attendees' focus patterns, energy levels, and task load.",
        jtbd: "When scheduling a meeting, I want AI to find slots that don't disrupt anyone's deep work.",
        ice: { impact: 8, confidence: 7, ease: 6 },
      },
    ],
    p2: [
      {
        title: "Time Tracking & Reporting",
        description:
          "Automatic time tracking that records actual time spent on tasks vs planned time, with weekly productivity reports.",
        jtbd: "When a focus block ends, I want time automatically logged so I can review where my hours actually went.",
        ice: { impact: 7, confidence: 8, ease: 8 },
      },
      {
        title: "Team Calendar Intelligence",
        description:
          "Team-level view showing aggregate focus time health, meeting load, and scheduling conflicts across the team.",
        jtbd: "As a manager, I want to see my team's focus time health so I can reduce meeting overload.",
        ice: { impact: 7, confidence: 7, ease: 6 },
      },
    ],
    p3: [
      {
        title: "AI Energy Level Adaptation",
        description:
          "Learn individual chronotype and energy patterns over 2–4 weeks, then adapt scheduling to place high-cognitive work during peak energy hours.",
        jtbd: "Over time, I want the AI to learn my peak hours and schedule my hardest work then.",
        ice: { impact: 9, confidence: 5, ease: 4 },
      },
      {
        title: "Voice-First Mobile Experience",
        description:
          "Hands-free task input and schedule review via voice commands on iOS and Android, optimised for commuting.",
        jtbd: "While commuting, I want to add tasks and check my schedule by voice.",
        ice: { impact: 6, confidence: 6, ease: 5 },
      },
    ],
  },
  success_metrics: [
    { name: "Daily Active Users (DAU)", baseline: "0", target: "10,000 DAU within 6 months" },
    { name: "Free-to-Paid Conversion", baseline: "0%", target: "8% within 30 days of signup" },
    { name: "Focus Time Saved per User", baseline: "0 min/week", target: "90+ min/week vs baseline" },
  ],
  risks: [
    {
      description: "Calendar permission friction reduces activation rate",
      likelihood: 8,
      impact: 9,
      mitigation: "Show clear value demonstration before permission request; offer read-only mode first",
    },
    {
      description: "AI scheduling quality is poor in early weeks before personalisation kicks in",
      likelihood: 6,
      impact: 8,
      mitigation: "Set clear expectations in onboarding; provide manual override on every AI decision",
    },
    {
      description: "Competitor copies Focus Shield feature",
      likelihood: 5,
      impact: 5,
      mitigation: "File provisional patent; move fast on enterprise partnerships",
    },
  ],
  gtm: {
    positioning:
      "For knowledge workers drowning in meetings and reactive tasks, Smart Scheduler is the AI time intelligence platform that automatically plans and protects your best work hours.",
    channels: [
      { name: "Product Hunt", cac: "$0", signups: "2,000" },
      { name: "LinkedIn Ads", cac: "$18", signups: "1,500" },
      { name: "Integration Marketplaces", cac: "$5", signups: "1,000" },
    ],
    pricing: "Freemium: Free (1 calendar, 5 AI tasks/day), Pro $12/mo, Teams $20/user/mo",
    experiments: [
      {
        hypothesis: "Showing a 'focus time saved this week' stat on the home screen increases DAU",
        variant_a: "Home screen with focus time counter prominently displayed",
        success_criteria: "10% lift in DAU vs control over 14 days",
      },
    ],
  },
};
