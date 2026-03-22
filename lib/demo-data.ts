// lib/demo-data.ts — static demo for /analysis/ai-scheduling-demo-2026/share
import type { CompetitorData, SupportStatus } from "@/lib/types/dashboard";
import type { PRDDocument } from "@/lib/schemas/prd";

export const DEMO_SHARE_TOKEN = "ai-scheduling-demo-2026";
export const DEMO_CATEGORY = "AI Scheduling Apps for Knowledge Workers";

export const DEMO_COMPETITORS: CompetitorData[] = [
  {
    name: "Reclaim.ai",
    pricing: { model: "freemium", starting_price_usd: 8, has_free_tier: true },
    scores: { ai_sophistication: 9, pricing_value: 7, mobile_ux: 6, integrations: 9, learning_curve: 7 },
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
    scores: { ai_sophistication: 8, pricing_value: 5, mobile_ux: 7, integrations: 7, learning_curve: 5 },
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
    scores: { ai_sophistication: 5, pricing_value: 9, mobile_ux: 9, integrations: 8, learning_curve: 9 },
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
    scores: { ai_sophistication: 6, pricing_value: 7, mobile_ux: 7, integrations: 8, learning_curve: 6 },
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
    scores: { ai_sophistication: 7, pricing_value: 8, mobile_ux: 8, integrations: 7, learning_curve: 8 },
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
    scores: { ai_sophistication: 6, pricing_value: 5, mobile_ux: 7, integrations: 7, learning_curve: 8 },
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
    scores: { ai_sophistication: 7, pricing_value: 6, mobile_ux: 6, integrations: 8, learning_curve: 6 },
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
    scores: { ai_sophistication: 9, pricing_value: 8, mobile_ux: 8, integrations: 8, learning_curve: 8 },
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
  objective:
    "Build the most intelligent AI scheduling platform for knowledge workers — one that autonomously plans, protects, and optimises every hour so users can do their best work without calendar anxiety.",
  problem_statement:
    "Knowledge workers lose 2–3 hours daily to context switching, poorly timed meetings, and reactive task management. Existing tools either require manual time-blocking (Sunsama, Akiflow) or have AI that doesn't understand individual work patterns (Reclaim.ai, Motion). There is no tool that combines deep AI scheduling intelligence with frictionless UX and a compelling free tier.",
  solution_narrative:
    "Smart Scheduler uses ML models trained on individual work patterns to auto-schedule tasks, protect focus time, and find meeting slots that respect everyone's deep work windows — not just calendar gaps. Unlike Reclaim.ai (weak mobile, no tracking) or Motion (expensive, no free tier), Smart Scheduler ships with a polished mobile app, built-in time tracking, and a $0 free tier.",
  personas: [
    {
      name: "Alex Chen",
      role: "Senior Software Engineer",
      goals: ["Ship features without constant interruptions", "Protect deep work time"],
      pain_points: ["Too many meetings breaking focus", "Manual time-blocking takes too long"],
      tech_savviness: "high",
    },
    {
      name: "Priya Sharma",
      role: "Product Manager",
      goals: ["Balance strategic thinking with team coordination", "Never miss deadlines"],
      pain_points: ["Constant context switching between tools", "No visibility into where time actually goes"],
      tech_savviness: "high",
    },
  ],
  features: {
    p1: [
      {
        id: "p1-1",
        title: "AI Auto-Scheduler",
        description:
          "Automatically schedule tasks from any connected app (Jira, Linear, Notion, Todoist) onto the calendar based on deadlines, estimated duration, and the user's historical productivity patterns.",
        user_story:
          "As a knowledge worker, I want my AI to schedule my tasks automatically so that I can focus on doing the work, not planning when to do it.",
        acceptance_criteria: [
          "Tasks from connected apps appear in Smart Scheduler inbox within 60 seconds",
          "AI schedules tasks in available slots respecting user-defined focus hours",
          "User can override or reschedule any AI-placed event with one drag",
        ],
      },
      {
        id: "p1-2",
        title: "Focus Shield",
        description:
          "A proactive focus protection system that silences notifications, blocks distracting apps/sites, and sets Slack/Teams status to DND during scheduled deep work blocks.",
        user_story:
          "As a developer, I want my focus time to be actively protected so that I can enter flow state without managing notification settings manually.",
        acceptance_criteria: [
          "Focus Shield activates automatically at the start of a scheduled focus block",
          "Integrates with Slack, Microsoft Teams, and macOS/iOS Focus modes",
          "User can pause Focus Shield with a single click",
        ],
      },
      {
        id: "p1-3",
        title: "AI Meeting Scheduler",
        description:
          "Suggest optimal meeting times by analysing all attendees' focus patterns, energy levels, and task load — not just calendar availability.",
        user_story:
          "As a PM, I want to schedule team meetings at times that don't disrupt anyone's deep work so that we collaborate efficiently without killing productivity.",
        acceptance_criteria: [
          "Attendee focus pattern analysis runs before suggesting slots",
          "Suggests top 3 meeting times ranked by productivity impact score",
          "Meeting scheduler respects user-defined 'no meeting' hours",
        ],
      },
    ],
    p2: [
      {
        id: "p2-1",
        title: "Time Tracking & Reporting",
        description:
          "Automatic time tracking that records actual time spent on tasks vs planned time, with weekly reports showing productivity trends.",
        user_story:
          "As a freelancer, I want automatic time tracking so that I can invoice clients accurately without manually starting and stopping timers.",
        acceptance_criteria: [
          "Time tracking starts automatically when a focus block begins",
          "Weekly report shows planned vs actual time per project",
          "CSV/PDF export for invoicing and reporting",
        ],
      },
      {
        id: "p2-2",
        title: "Team Calendar Intelligence",
        description:
          "Team-level view showing aggregate focus time health, meeting load, and scheduling conflicts across the team.",
        user_story:
          "As an engineering manager, I want a bird's-eye view of my team's focus time so that I can reduce meeting load and protect makers' schedules.",
        acceptance_criteria: [
          "Team dashboard shows focus time percentage per team member",
          "Flags team members with >40% meeting load as at-risk",
          "Respects individual privacy — only aggregate patterns visible to manager",
        ],
      },
    ],
    p3: [
      {
        id: "p3-1",
        title: "AI Energy Level Adaptation",
        description:
          "Learn individual chronotype and energy patterns over 2–4 weeks, then adapt scheduling to place high-cognitive work during peak energy hours.",
      },
      {
        id: "p3-2",
        title: "Voice-First Mobile Experience",
        description:
          "Hands-free task input and schedule review via voice commands on iOS and Android, optimised for commuting and walking.",
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
  ],
  risks: [
    {
      risk: "Calendar permission friction reduces activation rate",
      likelihood: "high",
      impact: "high",
      mitigation: "Show clear value demonstration before permission request; offer read-only mode first",
    },
    {
      risk: "AI scheduling quality is poor in early weeks before personalisation kicks in",
      likelihood: "medium",
      impact: "high",
      mitigation: "Set clear expectations in onboarding; provide manual override on every AI decision",
    },
    {
      risk: "Reclaim.ai or Motion copies Focus Shield feature",
      likelihood: "medium",
      impact: "medium",
      mitigation: "File provisional patent; move fast on enterprise partnerships",
    },
  ],
  gtm: {
    target_segment:
      "Knowledge workers (software engineers, PMs, designers) at tech-forward SMBs (10–500 employees) in the US and UK",
    positioning_statement:
      "For knowledge workers drowning in meetings and reactive tasks, Smart Scheduler is the AI time intelligence platform that automatically plans and protects your best work hours.",
    channels: [
      "Product Hunt launch",
      "LinkedIn thought leadership",
      "HN Show HN post",
      "Integration marketplace listings",
      "Referral programme",
    ],
    pricing_strategy:
      "Freemium: Free (1 calendar, 5 AI tasks/day), Pro $12/mo (unlimited AI + Focus Shield + time tracking), Teams $20/user/mo",
    launch_phases: [
      {
        phase: 1,
        name: "Closed Beta",
        duration: "6 weeks",
        goals: ["Onboard 200 beta users from waitlist", "Validate AI scheduling quality", "Achieve 70% weekly retention"],
      },
      {
        phase: 2,
        name: "Public Launch",
        duration: "4 weeks",
        goals: ["Product Hunt #1 of the day", "5,000 free tier signups", "500 Pro conversions"],
      },
      {
        phase: 3,
        name: "Growth & Partnerships",
        duration: "Ongoing from month 3",
        goals: ["10,000 DAU", "Integration partnerships with Notion, Linear, Jira", "Launch Teams tier"],
      },
    ],
  },
};
