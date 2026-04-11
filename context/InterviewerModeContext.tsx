// context/InterviewerModeContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface InterviewerModeContextValue {
  interviewerMode: boolean;
  toggleInterviewerMode: () => void;
}

const InterviewerModeContext = createContext<InterviewerModeContextValue | null>(null);

export function InterviewerModeProvider({ children }: { children: React.ReactNode }) {
  const [interviewerMode, setInterviewerMode] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInterviewerMode(localStorage.getItem("interviewerMode") === "true");
  }, []);

  const toggleInterviewerMode = useCallback(() => {
    setInterviewerMode((prev) => {
      const next = !prev;
      localStorage.setItem("interviewerMode", String(next));
      return next;
    });
  }, []);

  return (
    <InterviewerModeContext.Provider value={{ interviewerMode, toggleInterviewerMode }}>
      {children}
    </InterviewerModeContext.Provider>
  );
}

export function useInterviewerMode(): InterviewerModeContextValue {
  const ctx = useContext(InterviewerModeContext);
  if (!ctx) throw new Error("useInterviewerMode must be used within InterviewerModeProvider");
  return ctx;
}
