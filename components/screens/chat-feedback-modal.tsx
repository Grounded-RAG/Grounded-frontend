"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FeedbackReason, FeedbackSubmission } from "@/lib/types";
import { cn } from "@/lib/utils";

const REASONS: { id: FeedbackReason; label: string }[] = [
  { id: "FAILS_TO_ANSWER", label: "Does not answer the question" },
  { id: "HALLUCINATION", label: "Unsupported claim" },
  { id: "IRRELEVANT_INFORMATION", label: "Irrelevant information" },
  { id: "WRONG_CITATIONS", label: "Wrong citations" },
  { id: "PROSE_ERRORS", label: "Writing issue" },
  { id: "OTHER", label: "Other" },
];

export function ChatFeedbackModal({
  rating,
  onClose,
  onSubmit,
}: {
  rating: "positive" | "negative";
  onClose: () => void;
  onSubmit: (feedback: FeedbackSubmission) => Promise<void>;
}) {
  const [selectedReasons, setSelectedReasons] = useState<Set<FeedbackReason>>(new Set());
  const [freeformText, setFreeformText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      await onSubmit({
        rating,
        reasons: Array.from(selectedReasons),
        freeform_text: freeformText.trim() || null,
      });
      setSubmitted(true);
      window.setTimeout(onClose, 900);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 backdrop-blur-sm" onClick={onClose}>
      <div className="glass w-full max-w-lg overflow-hidden rounded-[2rem] border border-border/30 bg-background/90 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border/15 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Rate this answer</p>
            <p className="text-xs text-muted-foreground">Your feedback is attached to this specific run.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {submitted ? (
          <div className="grid place-items-center px-6 py-10 text-sm font-medium text-emerald-600">Feedback saved.</div>
        ) : (
          <div className="space-y-5 px-5 py-5">
            <textarea
              className="min-h-24 w-full resize-none rounded-2xl border border-border/25 bg-foreground/[0.02] px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-foreground/20"
              placeholder="What should be improved?"
              value={freeformText}
              onChange={(event) => setFreeformText(event.target.value)}
            />

            <div className="grid grid-cols-2 gap-2">
              {REASONS.map((reason) => {
                const selected = selectedReasons.has(reason.id);
                return (
                  <button
                    key={reason.id}
                    type="button"
                    onClick={() => {
                      setSelectedReasons((current) => {
                        const next = new Set(current);
                        if (next.has(reason.id)) next.delete(reason.id);
                        else next.add(reason.id);
                        return next;
                      });
                    }}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-left text-xs font-medium transition-colors",
                      selected
                        ? "border-foreground/25 bg-foreground/10 text-foreground"
                        : "border-border/20 bg-foreground/[0.02] text-muted-foreground hover:bg-foreground/[0.05]",
                    )}
                  >
                    {reason.label}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 border-t border-border/15 pt-4">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
