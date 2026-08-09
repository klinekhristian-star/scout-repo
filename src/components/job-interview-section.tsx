import { Copy, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Job, Story } from "@/data/types";
import { storyPlainText } from "@/lib/interview-kit";

type Kit = {
  mappedStories: Array<{ storyId: string; title: string; why: string; score: number }>;
  likelyQuestions: string[];
  talkingPoints: string[];
  questionsToAsk: string[];
  openers: string[];
};

type Props = {
  job: Job;
  kit: Kit;
  stories: Story[];
};

export function JobInterviewSection({ job, kit, stories }: Props) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-border overflow-hidden">
      <div className="border-b border-border bg-surface px-4 py-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
          <MessageSquare className="h-3.5 w-3.5 text-primary" />
          Interview kit
        </div>
        <p className="text-sm text-muted mt-1">
          Likely questions, mapped stories from your bank, talking points.
        </p>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <h4 className="text-xs font-semibold uppercase text-muted mb-2">
            Lead with these stories
          </h4>
          <div className="space-y-2">
            {kit.mappedStories.map((m) => {
              const full = stories.find((s) => s.id === m.storyId);
              return (
                <div
                  key={m.storyId}
                  className="rounded-[var(--radius-md)] border border-border p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium">{m.title}</span>
                    <Badge variant="secondary">fit {m.score}</Badge>
                  </div>
                  <p className="text-xs text-muted mt-0.5">{m.why}</p>
                  {full && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-1 h-8 px-2"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(storyPlainText(full));
                          toast.success("STAR copied");
                        } catch {
                          toast.message("Clipboard blocked");
                        }
                      }}
                    >
                      <Copy className="h-3 w-3" />
                      Copy STAR
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase text-muted mb-2">
            Likely questions
          </h4>
          <ul className="space-y-1.5 text-sm list-disc pl-4 text-muted">
            {kit.likelyQuestions.map((q) => (
              <li key={q} className="leading-relaxed">
                <span className="text-fg">{q}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase text-muted mb-2">
            Talking points
          </h4>
          <ul className="space-y-1.5 text-sm list-disc pl-4">
            {kit.talkingPoints.map((t) => (
              <li key={t} className="leading-relaxed text-muted">
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase text-muted mb-2">
            Questions to ask them
          </h4>
          <ul className="space-y-1.5 text-sm list-disc pl-4 text-muted">
            {kit.questionsToAsk.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            const text = [
              `Interview kit — ${job.title} @ ${job.company}`,
              "",
              "OPENERS",
              ...kit.openers,
              "",
              "STORIES",
              ...kit.mappedStories.map((m) => `• ${m.title} (${m.why})`),
              "",
              "QUESTIONS THEY MAY ASK",
              ...kit.likelyQuestions.map((q, i) => `${i + 1}. ${q}`),
              "",
              "TALKING POINTS",
              ...kit.talkingPoints.map((t) => `• ${t}`),
              "",
              "QUESTIONS TO ASK",
              ...kit.questionsToAsk.map((q) => `• ${q}`),
            ].join("\n");
            try {
              await navigator.clipboard.writeText(text);
              toast.success("Interview kit copied");
            } catch {
              toast.message("Kit ready — copy manually if clipboard is blocked");
            }
          }}
        >
          <Copy className="h-3.5 w-3.5" />
          Copy full kit
        </Button>
      </div>
    </section>
  );
}
