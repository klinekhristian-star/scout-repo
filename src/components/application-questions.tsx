import { Copy, MessageSquare, Plus, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Job, Profile, ScreeningAnswer } from "@/data/types";
import {
  newScreeningId,
  suggestAnswer,
} from "@/lib/application-answers";

export function ApplicationQuestions({
  job,
  profile,
  initial,
  onChange,
}: {
  job: Job;
  profile: Profile;
  initial: ScreeningAnswer[];
  onChange: (rows: ScreeningAnswer[]) => void;
}) {
  const [screening, setScreening] = useState<ScreeningAnswer[]>(initial);
  const [newQuestion, setNewQuestion] = useState("");

  useEffect(() => {
    setScreening(initial);
    setNewQuestion("");
  }, [job.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const persist = (next: ScreeningAnswer[]) => {
    setScreening(next);
    onChange(next);
  };

  const addQuestion = () => {
    const q = newQuestion.trim();
    if (!q) {
      toast.error("Enter a question first");
      return;
    }
    persist([
      ...screening,
      { id: newScreeningId(), question: q, answer: "" },
    ]);
    setNewQuestion("");
  };

  const generateOne = (id: string) => {
    persist(
      screening.map((row) =>
        row.id === id
          ? {
              ...row,
              answer: suggestAnswer(row.question, job, profile),
              generatedAt: new Date().toISOString(),
            }
          : row,
      ),
    );
    toast.success("Suggested answer ready — edit before submitting");
  };

  const generateAll = () => {
    if (!screening.length) {
      toast.error("Add at least one question");
      return;
    }
    const anyEmpty = screening.some((r) => !r.answer.trim());
    const final = screening.map((row) => {
      if (anyEmpty && row.answer.trim()) return row;
      return {
        ...row,
        answer: suggestAnswer(row.question, job, profile),
        generatedAt: new Date().toISOString(),
      };
    });
    persist(final);
    toast.success("Answers drafted — review and edit");
  };

  return (
    <section className="rounded-[var(--radius-lg)] border border-border overflow-hidden">
      <div className="border-b border-border bg-surface px-4 py-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
          <MessageSquare className="h-3.5 w-3.5 text-primary" />
          Application questions
        </div>
        <p className="text-sm text-muted mt-1">
          Paste screening questions (e.g. "Why do you want to work here?")
          and generate suggested answers from this job + your background. Edit
          before you submit.
        </p>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <Textarea
            placeholder="e.g. Why do you want to work at this company?"
            rows={2}
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="text-sm flex-1"
          />
          <div className="flex sm:flex-col gap-2 shrink-0">
            <Button size="sm" variant="outline" onClick={addQuestion}>
              <Plus className="h-3.5 w-3.5" />
              Add question
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={!screening.length}
              onClick={generateAll}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Suggest all
            </Button>
          </div>
        </div>

        {screening.length === 0 && (
          <p className="text-xs text-muted">
            No questions yet. Common ones: why this company, why this role,
            greatest strength, leadership example, remote preference, salary
            expectations.
          </p>
        )}

        <div className="space-y-3">
          {screening.map((row, i) => (
            <div
              key={row.id}
              className="rounded-[var(--radius-md)] border border-border p-3 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <label className="block flex-1 text-xs font-medium text-muted">
                  Question {i + 1}
                  <Textarea
                    className="mt-1 text-sm font-normal text-fg"
                    rows={2}
                    value={row.question}
                    onChange={(e) =>
                      persist(
                        screening.map((r) =>
                          r.id === row.id
                            ? { ...r, question: e.target.value }
                            : r,
                        ),
                      )
                    }
                  />
                </label>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-danger h-8 w-8 p-0 shrink-0"
                  onClick={() =>
                    persist(screening.filter((r) => r.id !== row.id))
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted">
                  Suggested answer
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8"
                  onClick={() => generateOne(row.id)}
                >
                  <Sparkles className="h-3 w-3" />
                  {row.answer ? "Regenerate" : "Suggest answer"}
                </Button>
              </div>
              <Textarea
                rows={5}
                className="text-sm"
                placeholder="Click Suggest answer to draft from this job and your profile…"
                value={row.answer}
                onChange={(e) =>
                  persist(
                    screening.map((r) =>
                      r.id === row.id ? { ...r, answer: e.target.value } : r,
                    ),
                  )
                }
              />
              {row.answer ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(row.answer);
                      toast.success("Answer copied");
                    } catch {
                      toast.message("Clipboard blocked");
                    }
                  }}
                >
                  <Copy className="h-3 w-3" />
                  Copy answer
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
