"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 transition-colors">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-zinc-100 transition-colors dark:bg-zinc-900" />

      {/* Dark/Light mode toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed right-4 top-4 z-50 rounded-full bg-zinc-200 p-2.5 text-zinc-600 transition-colors hover:bg-zinc-300 hover:text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      {/* Main content */}
      <div className="w-full max-w-2xl space-y-8 text-center">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 transition-colors dark:text-white">
            AI Product Sense
          </h1>
          <p className="text-zinc-500 transition-colors dark:text-zinc-400">
            Competitive analysis and PRD generation, powered by AI
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe your product category (e.g. AI scheduling apps for knowledge workers)"
            className="w-full rounded-xl border border-zinc-300 bg-white px-5 py-4 text-base text-zinc-900 placeholder-zinc-500 outline-none ring-indigo-500 transition-all focus:border-indigo-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500"
          />

          <button className="w-full rounded-xl bg-indigo-500 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-100 dark:focus:ring-offset-zinc-900">
            Analyze
          </button>
        </div>
      </div>
    </div>
  );
}
