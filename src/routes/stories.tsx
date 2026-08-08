import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Copy, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { storyPlainText } from "@/lib/interview-kit";
import { useJobStore } from "@/lib/store";

export const Route = createFileRoute("/stories")({
  component: StoriesPage,
});

const emptyForm = {
  title: "",
  situation: "",
  task: "",
  action: "",
  result: "",
  tags: "",
  brands: "",
  metrics: "",
};

function StoriesPage() {
  const stories = useJobStore((s) => s.stories);
  const addStory = useJobStore((s) => s.addStory);
  const updateStory = useJobStore((s) => s.updateStory);
  const deleteStory = useJobStore((s) => s.deleteStory);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = stories.filter((s) => {
    if (!filter.trim()) return true;
    const q = filter.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.tags.some((t) => t.toLowerCase().includes(q)) ||
      (s.brands ?? []).some((b) => b.toLowerCase().includes(q))
    );
  });

  const submit = () => {
    if (!form.title.trim() || !form.situation.trim() || !form.result.trim()) {
      toast.error("Title, situation, and result are required");
      return;
    }
    const payload = {
      title: form.title.trim(),
      situation: form.situation.trim(),
      task: form.task.trim(),
      action: form.action.trim(),
      result: form.result.trim(),
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      brands: form.brands
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      metrics: form.metrics.trim() || undefined,
    };
    if (editingId) {
      updateStory(editingId, payload);
      toast.success("Story updated");
      setEditingId(null);
    } else {
      addStory(payload);
      toast.success("Story added to bank");
    }
    setForm(emptyForm);
  };

  return (
    <AppShell>
      <PageHeader
        title="Story bank"
        subtitle="STAR stories for interviews — Scout maps the best ones onto each job’s interview kit."
      />

      <div className="mb-4">
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by tag, brand, or title…"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base inline-flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              {editingId ? "Edit story" : "Add STAR story"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
            <Textarea
              placeholder="Situation"
              rows={2}
              value={form.situation}
              onChange={(e) =>
                setForm((f) => ({ ...f, situation: e.target.value }))
              }
            />
            <Textarea
              placeholder="Task"
              rows={2}
              value={form.task}
              onChange={(e) => setForm((f) => ({ ...f, task: e.target.value }))}
            />
            <Textarea
              placeholder="Action"
              rows={3}
              value={form.action}
              onChange={(e) =>
                setForm((f) => ({ ...f, action: e.target.value }))
              }
            />
            <Textarea
              placeholder="Result"
              rows={2}
              value={form.result}
              onChange={(e) =>
                setForm((f) => ({ ...f, result: e.target.value }))
              }
            />
            <Input
              placeholder="Tags (comma-separated)"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            />
            <Input
              placeholder="Brands (comma-separated)"
              value={form.brands}
              onChange={(e) =>
                setForm((f) => ({ ...f, brands: e.target.value }))
              }
            />
            <Input
              placeholder="Metrics (optional)"
              value={form.metrics}
              onChange={(e) =>
                setForm((f) => ({ ...f, metrics: e.target.value }))
              }
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={submit}>
                {editingId ? "Save changes" : "Add to bank"}
              </Button>
              {editingId && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <p className="text-sm text-muted">
            {filtered.length} stor{filtered.length === 1 ? "y" : "ies"}
          </p>
          {filtered.map((s) => (
            <Card key={s.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-display font-semibold leading-snug min-w-0">
                    {s.title}
                  </h3>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(storyPlainText(s));
                          toast.success("Copied STAR text");
                        } catch {
                          toast.message("Clipboard blocked");
                        }
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(s.id);
                        setForm({
                          title: s.title,
                          situation: s.situation,
                          task: s.task,
                          action: s.action,
                          result: s.result,
                          tags: s.tags.join(", "),
                          brands: (s.brands ?? []).join(", "),
                          metrics: s.metrics ?? "",
                        });
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-danger"
                      onClick={() => {
                        deleteStory(s.id);
                        toast.message("Story removed");
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted leading-relaxed">
                  <span className="font-medium text-fg">R — </span>
                  {s.result}
                </p>
                {s.metrics && (
                  <p className="text-xs text-primary font-medium">{s.metrics}</p>
                )}
                <div className="flex flex-wrap gap-1">
                  {s.tags.map((t) => (
                    <Badge key={t} variant="secondary">
                      {t}
                    </Badge>
                  ))}
                  {(s.brands ?? []).map((b) => (
                    <Badge key={b} variant="outline">
                      {b}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="rounded-[var(--radius-lg)] border border-border p-8 text-center text-sm text-muted">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No stories match. Add one or clear the filter.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
