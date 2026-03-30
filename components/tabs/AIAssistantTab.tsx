// components/tabs/AIAssistantTab.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useAnalysis } from "@/lib/context/AnalysisContext";
import { useAnalysisData } from "@/hooks/useAnalysis";
import { Send, Settings } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const QUICK_ACTIONS = [
  "Weakest competitor?",
  "Biggest market gap?",
  "Devil's advocate",
  "Reframe for enterprise",
  "Interview prep",
];

export default function AIAssistantTab() {
  const { analysisId, competitors: ctxCompetitors } = useAnalysis();
  const { competitors: hookCompetitors, prd, loading } = useAnalysisData(analysisId);
  // Prefer hook competitors (service-role fetch); fall back to context while loading
  const competitors = hookCompetitors.length ? hookCompetitors : ctxCompetitors;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "AI Assistant ready — connect your OpenAI key to enable live responses. For now, try the quick actions above for demo insights.",
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getDemoResponse = (prompt: string): string => {
    const lower = prompt.toLowerCase();

    if (lower.includes("weakest")) {
      if (!competitors.length) return "No competitor data loaded yet.";
      const weakest = [...competitors].sort((a, b) => {
        const scoreA = a.ratings?.overall ?? a.scores?.market_presence ?? 0;
        const scoreB = b.ratings?.overall ?? b.scores?.market_presence ?? 0;
        return scoreA - scoreB;
      })[0];
      return `Based on overall ratings, **${weakest.name}** appears to be the weakest competitor${
        weakest.weaknesses?.length
          ? `, with key weaknesses including: ${weakest.weaknesses.slice(0, 2).join(", ")}.`
          : "."
      }`;
    }

    if (lower.includes("gap") || lower.includes("market gap")) {
      if (prd?.problem_statement) {
        return `Key market gap from your PRD: "${prd.problem_statement}"`;
      }
      const gap = competitors[0]?.gaps?.[0];
      return gap
        ? `The biggest market gap identified: "${gap}"`
        : "Run competitive analysis first to identify market gaps.";
    }

    if (lower.includes("devil") || lower.includes("advocate")) {
      return "Devil's advocate: Your biggest risk is timing. The market may not be ready for AI-native PM tooling, and incumbent tools like Notion and Linear are rapidly adding AI features. You could be building a feature, not a product.";
    }

    if (lower.includes("enterprise")) {
      const positioning = prd?.gtm?.positioning_statement;
      if (positioning) {
        return `Enterprise reframe — your PRD positioning: "${positioning}"\n\nFor enterprise buyers, lead with compliance, security, and ROI. Emphasise 'AI governance' and 'audit trails' over speed.`;
      }
      return "For enterprise reframing: Lead with compliance, security, and ROI. Enterprise buyers need 'AI governance' and 'audit trails', not 'speed'. Position as 'AI-assisted product governance platform' rather than an AI PM tool.";
    }

    if (lower.includes("interview")) {
      const objective = prd?.objective;
      return objective
        ? `Interview prep — your product objective: "${objective}"\n\nBe ready to answer: 'How is this different from just asking ChatGPT?' Your answer: structured workflows, domain-specific training, competitive intelligence, and shareable artifacts for product teams.`
        : "Interview prep: Be ready to answer — 'How is this different from just asking ChatGPT?' Your answer: structured workflows, domain-specific training data, integrated competitive intelligence, and shareable artifacts built for product teams.";
    }

    return "I can help analyze your competitive landscape, identify market gaps, and sharpen your positioning. Try one of the quick actions above or ask a specific question.";
  };

  const handleSend = (text?: string) => {
    const query = (text ?? input).trim();
    if (!query) return;

    const userMsg: Message = { role: "user", text: query };
    const assistantMsg: Message = { role: "assistant", text: getDemoResponse(query) };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
  };

  // Show skeleton only on initial load when no competitors from context either
  if (loading && !competitors.length) {
    return (
      <div className="flex flex-col h-full p-4 space-y-3">
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-7 w-24 bg-zinc-800 rounded-full animate-pulse" />
          ))}
        </div>
        <div className="flex-1 space-y-4 py-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
              <div className="h-12 w-2/3 bg-zinc-800 rounded-2xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Quick action pills */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2 border-b border-zinc-800">
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action}
              onClick={() => handleSend(action)}
              className="rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-indigo-500/50 text-zinc-300 hover:text-zinc-100 text-xs px-3 py-1.5 transition-all"
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-zinc-800 text-zinc-200 rounded-bl-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* API key notice */}
      <div className="flex-shrink-0 mx-4 mb-2 rounded-lg bg-zinc-800/40 border border-zinc-700 px-3 py-2 flex items-center justify-between">
        <span className="text-xs text-zinc-500">
          AI Assistant ready — connect your OpenAI key to enable live responses
        </span>
        <button className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
          <Settings className="h-3 w-3" />
          Configure
        </button>
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 p-4 border-t border-zinc-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your competitive landscape…"
            className="flex-1 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm px-4 py-3 outline-none focus:ring-1 focus:ring-indigo-500 placeholder-zinc-600"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex-shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-4 py-3 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
