import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Plus, RefreshCw, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AddJobLinkDialog } from "@/components/add-job-link-dialog";
import { AppShell, PageHeader } from "@/components/layout";
import { JobCard } from "@/components/job-card";
import { JobDetailSheet } from "@/components/job-detail-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Job } from "@/data/types";
import { matchesJobQuery } from "@/lib/boolean-search";
import { scoreJob } from "@/lib/matching";
import { useJobCatalog, useJobStore } from "@/lib/store";

export const Route = createFileRoute("/discover")({
  component: DiscoverPage,
});

function DiscoverPage() {
  const profile = useJobStore((s) => s.profile);
  const catalog = useJobCatalog();
  const syncing = useJobStore((s) => s.syncing);
  const lastSyncAt = useJobStore((s) => s.lastSyncAt);
  const boardStatuses = useJobStore((s) => s.boardStatuses);
  const syncBoards = useJobStore((s) => s.syncBoards);

  const [query, setQuery] = useState("");
  const [workMode, setWorkMode] = useState("all");
  const [seniority, setSeniority] = useState("all");
  const [source, setSource] = useState("all");
  const [sort, setSort] = useState<"match" | "newest" | "salary">("match");
  const [minMatch, setMinMatch] = useState("0");
  const [selected, setSelected] = useState<Job | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const sources = useMemo(() => {
    return Array.from(new Set(catalog.map((j) => j.source))).sort();
  }, [catalog]);

  const results = useMemo(() => {
    let list = catalog.filter((job) => {
      if (query.trim() && !matchesJobQuery(job, query)) return false;
      if (workMode !== "all" && job.workMode !== workMode) return false;
      if (seniority !== "all" && job.seniority !== seniority) return false;
      if (source !== "all" && job.source !== source) return false;
      if (scoreJob(job, profile).score < Number(minMatch)) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "match")
        return scoreJob(b, profile).score - scoreJob(a, profile).score;
      if (sort === "newest")
        return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
      return (b.salaryMax ?? b.salaryMin ?? 0) - (a.salaryMax ?? a.salaryMin ?? 0);
    });
    return list;
  }, [catalog, query, workMode, seniority, source, sort, minMatch, profile]);

  return (
    <AppShell>
      <PageHeader
        title="Discover"
        subtitle="Search live boards, company ATS listings, and roles you paste yourself. Boolean operators supported."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Add job link
            </Button>
            <Button
              size="sm"
              disabled={syncing}
              onClick={async () => {
                const r = await syncBoards({ query: query || undefined });
                if (r.errors.length)
                  toast.message(`Synced ${r.count} · ${r.errors.length} source issue(s)`);
                else toast.success(`Synced ${r.count} listings`);
              }}
            >
              {syncing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Sync
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search… e.g. "customer engagement" OR gtm NOT intern'
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters((v) => !v)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {showFilters && (
        <div className="mb-4 grid gap-3 sm:grid-cols-4 rounded-[var(--radius-lg)] border border-border bg-surface-card p-4">
          <label className="text-xs font-medium text-muted">
            Work mode
            <select
              className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-border px-2 text-sm"
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
            >
              <option value="all">All</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>
          </label>
          <label className="text-xs font-medium text-muted">
            Seniority
            <select
              className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-border px-2 text-sm"
              value={seniority}
              onChange={(e) => setSeniority(e.target.value)}
            >
              <option value="all">All</option>
              {["intern","junior","mid","senior","staff","lead","director"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-muted">
            Source
            <select
              className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-border px-2 text-sm"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              <option value="all">All</option>
              {sources.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-muted">
            Sort
            <select
              className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-border px-2 text-sm"
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
            >
              <option value="match">Match %</option>
              <option value="newest">Newest</option>
              <option value="salary">Salary</option>
            </select>
          </label>
          <label className="text-xs font-medium text-muted sm:col-span-2">
            Min match %
            <Input
              className="mt-1"
              type="number"
              min={0}
              max={100}
              value={minMatch}
              onChange={(e) => setMinMatch(e.target.value)}
            />
          </label>
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted">
        <span>
          {results.length} roles
          {lastSyncAt ? ` · last sync ${new Date(lastSyncAt).toLocaleString()}` : ""}
        </span>
        {boardStatuses.slice(0, 6).map((s) => (
          <span
            key={`${s.board}-${s.label}`}
            className={s.ok ? "text-success" : "text-danger"}
          >
            {s.label || s.board}:{s.count}
            {s.error ? "!" : ""}
          </span>
        ))}
      </div>

      <div className="grid gap-3">
        {results.map((job) => (
          <JobCard key={job.id} job={job} onOpen={setSelected} />
        ))}
        {results.length === 0 && (
          <div className="rounded-[var(--radius-lg)] border border-border p-10 text-center text-sm text-muted">
            No roles match. Sync boards, loosen filters, or add a job link with full description.
          </div>
        )}
      </div>

      <JobDetailSheet
        job={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
      />
      <AddJobLinkDialog open={addOpen} onOpenChange={setAddOpen} onCreated={(id) => {
        const job = useJobStore.getState().getJobById(id);
        if (job) setSelected(job);
      }} />
    </AppShell>
  );
}
