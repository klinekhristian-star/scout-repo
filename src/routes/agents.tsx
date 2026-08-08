import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Pause, Play, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AgentFrequency, Seniority, WorkMode } from "@/data/types";
import { useJobStore } from "@/lib/store";

export const Route = createFileRoute("/agents")({
  component: AgentsPage,
});

function AgentsPage() {
  const agents = useJobStore((s) => s.agents);
  const addAgent = useJobStore((s) => s.addAgent);
  const updateAgent = useJobStore((s) => s.updateAgent);
  const deleteAgent = useJobStore((s) => s.deleteAgent);
  const runAgent = useJobStore((s) => s.runAgent);
  const runningAgentId = useJobStore((s) => s.runningAgentId);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");

  return (
    <AppShell>
      <PageHeader
        title="Search agents"
        subtitle="Automations that scan your catalog for matches, score them, and optionally auto-save to the pipeline."
        actions={
          <Button size="sm" onClick={() => setShowNew((v) => !v)}>
            <Plus className="h-3.5 w-3.5" />
            New agent
          </Button>
        }
      />

      {showNew && (
        <Card className="mb-4">
          <CardContent className="p-4 space-y-3">
            <Input placeholder="Agent name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Query keywords" value={query} onChange={(e) => setQuery(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  if (!name.trim() || !query.trim()) return;
                  addAgent({
                    name: name.trim(),
                    query: query.trim(),
                    locations: ["Remote"],
                    workModes: ["remote", "hybrid"] as WorkMode[],
                    seniorities: ["director", "lead", "senior"] as Seniority[],
                    skills: [],
                    sources: [],
                    frequency: "daily" as AgentFrequency,
                    enabled: true,
                    minMatchScore: 65,
                    autoSave: true,
                  });
                  toast.success("Agent created");
                  setName("");
                  setQuery("");
                  setShowNew(false);
                }}
              >
                Create
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {agents.map((a) => (
          <Card key={a.id}>
            <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{a.name}</h3>
                  <Badge variant={a.enabled ? "secondary" : "outline"}>
                    {a.enabled ? "On" : "Paused"}
                  </Badge>
                  <Badge variant="outline">{a.frequency}</Badge>
                  <Badge variant="outline">min {a.minMatchScore}%</Badge>
                </div>
                <p className="text-sm text-muted mt-1 truncate">{a.query}</p>
                <p className="text-xs text-muted mt-1">
                  Last run matches: {a.lastMatchCount} · lifetime {a.totalMatches}
                  {a.lastRunAt ? ` · ${new Date(a.lastRunAt).toLocaleString()}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={runningAgentId === a.id}
                  onClick={async () => {
                    const r = await runAgent(a.id);
                    toast.success(
                      `${r.newMatches} new · ${r.autoSaved} auto-saved`,
                    );
                  }}
                >
                  {runningAgentId === a.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  Run now
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => updateAgent(a.id, { enabled: !a.enabled })}
                >
                  {a.enabled ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  {a.enabled ? "Pause" : "Enable"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-danger"
                  onClick={() => {
                    deleteAgent(a.id);
                    toast.message("Agent deleted");
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
