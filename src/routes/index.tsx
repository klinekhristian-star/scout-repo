import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Bot,
  Briefcase,
  Network,
  Play,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/layout";
import { JobCard } from "@/components/job-card";
import { JobDetailSheet } from "@/components/job-detail-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Job } from "@/data/types";
import { scoreJob } from "@/lib/matching";
import { useJobCatalog, useJobStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

function DashboardPage() {
  const profile = useJobStore((s) => s.profile);
  const catalog = useJobCatalog();
  const applications = useJobStore((s) => s.applications);
  const agents = useJobStore((s) => s.agents);
  const stories = useJobStore((s) => s.stories);
  const activity = useJobStore((s) => s.activity);
  const runAllAgents = useJobStore((s) => s.runAllAgents);
  const syncBoards = useJobStore((s) => s.syncBoards);
  const [selected, setSelected] = useState<Job | null>(null);
  const [running, setRunning] = useState(false);

  const topMatches = useMemo(() => {
    return [...catalog]
      .map((j) => ({ job: j, score: scoreJob(j, profile).score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [catalog, profile]);

  const stageCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const a of applications) c[a.stage] = (c[a.stage] ?? 0) + 1;
    return c;
  }, [applications]);

  const outreachCount = useMemo(
    () =>
      applications.reduce((n, a) => n + (a.outreach?.length ?? 0), 0),
    [applications],
  );

  const followUpsDue = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    let n = 0;
    for (const a of applications) {
      for (const o of a.outreach ?? []) {
        if (o.nextFollowUp && o.nextFollowUp.slice(0, 10) <= today && o.status !== "closed")
          n++;
      }
    }
    return n;
  }, [applications]);

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${profile.name.split(" ")[0]}. Match scoring, network outreach, interview stories, and application packets.`}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={running}
              onClick={async () => {
                setRunning(true);
                try {
                  const r = await syncBoards();
                  toast.message(`Synced ${r.count} listings`);
                } finally {
                  setRunning(false);
                }
              }}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${running ? "animate-spin" : ""}`} />
              Sync boards
            </Button>
            <Button
              size="sm"
              disabled={running}
              onClick={async () => {
                setRunning(true);
                try {
                  const r = await runAllAgents();
                  toast.success(
                    `Ran ${r.agents} agents · ${r.newMatches} new matches`,
                  );
                } finally {
                  setRunning(false);
                }
              }}
            >
              <Play className="h-3.5 w-3.5" />
              Run all agents
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6">
        {[
          ["Catalog", catalog.length, "roles"],
          ["Pipeline", applications.length, "apps"],
          ["Outreach", outreachCount, "logs"],
          ["Follow-ups", followUpsDue, "due"],
          ["Stories", stories.length, "STAR"],
          ["Top match", topMatches[0]?.score ?? 0, "%"],
        ].map(([label, value, unit]) => (
          <Card key={label as string}>
            <CardContent className="p-4">
              <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
              <div className="mt-1 font-display text-2xl font-semibold tabular-nums">
                {value}
                <span className="text-sm font-normal text-muted ml-1">{unit}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] min-w-0">
        <div className="space-y-3 min-w-0">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <h2 className="font-semibold inline-flex items-center gap-1.5 min-w-0">
              <Sparkles className="h-4 w-4 shrink-0 text-primary" />
              Top matches
            </h2>
            <Button variant="ghost" size="sm" asChild className="shrink-0">
              <Link to="/discover">
                Discover <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          {topMatches.map(({ job }) => (
            <JobCard key={job.id} job={job} onOpen={setSelected} />
          ))}
        </div>

        <div className="space-y-4 min-w-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base inline-flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" /> Pipeline snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1.5">
              {["saved", "applied", "phone", "interview", "offer", "rejected"].map(
                (s) => (
                  <Badge key={s} variant="outline">
                    {s}: {stageCounts[s] ?? 0}
                  </Badge>
                ),
              )}
              <Button variant="ghost" size="sm" className="mt-2" asChild>
                <Link to="/pipeline">Open pipeline</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base inline-flex items-center gap-1.5">
                <Network className="h-4 w-4" /> Network
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted space-y-2">
              <p>
                <span className="font-semibold text-fg tabular-nums">
                  {outreachCount}
                </span>{" "}
                outreach logs ·{" "}
                <span className="font-semibold text-fg tabular-nums">
                  {followUpsDue}
                </span>{" "}
                follow-ups due
              </p>
              <p className="text-xs leading-relaxed">
                Open any job → Outreach & network. Log contacts, referrals, and
                next steps per role.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base inline-flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" /> Story bank
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted">
                {stories.length} STAR stories ready for interview kits.
              </p>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/stories">Manage stories</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base inline-flex items-center gap-1.5">
                <Bot className="h-4 w-4" /> Agents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {agents.slice(0, 4).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between text-sm border border-border rounded-[var(--radius-md)] px-3 py-2"
                >
                  <span className="font-medium truncate pr-2">{a.name}</span>
                  <Badge variant={a.enabled ? "secondary" : "outline"}>
                    {a.lastMatchCount} last
                  </Badge>
                </div>
              ))}
              <Button variant="ghost" size="sm" asChild>
                <Link to="/agents">Manage agents</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-56 overflow-y-auto">
              {activity.slice(0, 12).map((e) => (
                <div key={e.id} className="text-sm">
                  <div className="font-medium">{e.title}</div>
                  {e.detail && (
                    <div className="text-xs text-muted">{e.detail}</div>
                  )}
                </div>
              ))}
              {activity.length === 0 && (
                <p className="text-sm text-muted">
                  Run agents or sync boards to see activity.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <JobDetailSheet
        job={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
      />
    </AppShell>
  );
}
