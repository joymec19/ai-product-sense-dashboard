"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const QUESTIONS = [
  { id: "q1", label: "What problem does your product solve?", type: "textarea" as const },
  { id: "q2", label: "Who is your primary user persona?", type: "input" as const },
  { id: "q3", label: "What are your top 3 differentiating features?", type: "textarea" as const },
  { id: "q4", label: "What is your pricing model?", type: "input" as const },
  { id: "q5", label: "Which competitors concern you most?", type: "textarea" as const },
];

interface QuestionnaireModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (context: string) => void;
}

export default function QuestionnaireModal({
  open,
  onOpenChange,
  onSubmit,
}: QuestionnaireModalProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({
    q1: "",
    q2: "",
    q3: "",
    q4: "",
    q5: "",
  });

  const handleSubmit = () => {
    const context = QUESTIONS.map(
      (q) => `${q.label}\n${answers[q.id] || "Not provided"}`
    ).join("\n\n");
    onSubmit(context);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tell us about your product</DialogTitle>
          <DialogDescription>
            Answer these questions to help us understand your product context for a
            better competitive analysis.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-2">
          {QUESTIONS.map((q, i) => (
            <div key={q.id} className="space-y-2">
              <Label htmlFor={q.id}>
                Q{i + 1}: {q.label}
              </Label>
              {q.type === "textarea" ? (
                <Textarea
                  id={q.id}
                  value={answers[q.id]}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                  rows={3}
                  placeholder="Your answer..."
                />
              ) : (
                <Input
                  id={q.id}
                  value={answers[q.id]}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                  placeholder="Your answer..."
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
