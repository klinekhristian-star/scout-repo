import { createFileRoute } from "@tanstack/react-router";
import { Download, RotateCcw, Save, Upload } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  buildScoutBackup,
  downloadBackup,
  downloadCsvExport,
  parseScoutBackup,
} from "@/lib/backup";
import { BOARD_LABELS, TOGGLE_BOARD_IDS } from "@/lib/job-boards/meta";
import { useJobCatalog, useJobStore } from "@/lib/store";
import { listResumeVariants } from "@/lib/tailor-resume";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const profile = useJobStore((s) => s.profile);
  const setProfile = useJobStore((s) => s.setProfile);
  const boardSettings = useJobStore((s) => s.boardSettings);
  const setBoardSettings = useJobStore((s) => s.setBoardSettings);
  const resetDemo = useJobStore((s) => s.resetDemo);
  const importBackup = useJobStore((s) => s.importBackup);
  const agents = useJobStore((s) => s.agents);
  const applications = useJobStore((s) => s.applications);
  const stories = useJobStore((s) => s.stories);
  const activity = useJobStore((s) => s.activity);
  const liveJobs = useJobStore((s) => s.liveJobs);
  const manualJobs = useJobStore((s) => s.manualJobs);
  const lastSyncAt = useJobStore((s) => s.lastSyncAt);
  const catalog = useJobCatalog();
  const fileRef = useRef<HTMLInputElement>(null);

  const doExport = () => {
    downloadBackup(
      buildScoutBackup({
        profile,
        boardSettings,
        agents,
        applications,
        stories,
        activity,
        liveJobs,
        manualJobs,
        lastSyncAt,
      }),
    );
    downloadCsvExport(applications, catalog);
    toast.success("Downloaded scout-backup JSON + pipeline CSV");
  };

  const onImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = parseScoutBackup(JSON.parse(text));
      importBackup(parsed);
      toast.success(
        `Restored backup from ${parsed.exportedAt.slice(0, 10)} · ${parsed.applications.length} apps · ${parsed.stories.length} stories`,
      );
    } catch (e) {
      console.error(e);
      toast.error(
        e instanceof Error ? e.message : "Could not read backup file",
      );
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Profile"
        subtitle="Drives match scores, agent filters, cover letters, and tailored PDFs."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={doExport}>
              <Download className="h-3.5 w-3.5" />
              Export backup
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5" />
              Import backup
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onImportFile(f);
                e.target.value = "";
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetDemo();
                toast.message("Demo data restored");
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset demo
            </Button>
            <Button
              size="sm"
              onClick={() => toast.success("Saved in this browser")}
            >
              <Save className="h-3.5 w-3.5" />
              Save
            </Button>
          </>
        }
      />

      <Card className="mb-4 border-primary/25">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Backup & restore</CardTitle>
          <CardDescription>
            Scout stores data in this browser. Export before clearing cookies or
            switching devices. JSON restores everything; CSV is for spreadsheets.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" onClick={doExport}>
            <Download className="h-3.5 w-3.5" />
            Download full backup
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" />
            Restore from JSON
          </Button>
          <p className="w-full text-xs text-muted mt-1">
            Includes: profile, boards, agents, applications, outreach, stories,
            activity, manual + live jobs.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Identity</CardTitle>
            <CardDescription>
              Khristian Kline · GTM / engagement executive defaults
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(
              [
                ["name", "Name"],
                ["email", "Email"],
                ["headline", "Headline"],
                ["location", "Location"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block text-xs font-medium text-muted">
                {label}
                <Input
                  className="mt-1"
                  value={profile[key]}
                  onChange={(e) => setProfile({ [key]: e.target.value })}
                />
              </label>
            ))}
            <label className="block text-xs font-medium text-muted">
              Resume summary
              <Textarea
                className="mt-1"
                rows={5}
                value={profile.resumeSummary}
                onChange={(e) => setProfile({ resumeSummary: e.target.value })}
              />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Targets & skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="block text-xs font-medium text-muted">
              Target titles (comma-separated)
              <Textarea
                className="mt-1"
                rows={3}
                value={profile.targetTitles.join(", ")}
                onChange={(e) =>
                  setProfile({
                    targetTitles: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </label>
            <label className="block text-xs font-medium text-muted">
              Skills (comma-separated)
              <Textarea
                className="mt-1"
                rows={4}
                value={profile.skills.join(", ")}
                onChange={(e) =>
                  setProfile({
                    skills: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </label>
            <label className="block text-xs font-medium text-muted">
              Preferred locations
              <Input
                className="mt-1"
                value={profile.preferredLocations.join(", ")}
                onChange={(e) =>
                  setProfile({
                    preferredLocations: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </label>
            <label className="block text-xs font-medium text-muted">
              Min salary
              <Input
                className="mt-1"
                type="number"
                value={profile.salaryMin}
                onChange={(e) =>
                  setProfile({ salaryMin: Number(e.target.value) || 0 })
                }
              />
            </label>
            <div className="flex flex-wrap gap-3 text-sm">
              {(
                [
                  ["openToRemote", "Remote"],
                  ["openToHybrid", "Hybrid"],
                  ["openToOnsite", "Onsite"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={profile[key]}
                    onChange={(e) => setProfile({ [key]: e.target.checked })}
                  />
                  {label}
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Job boards & ATS watchlist</CardTitle>
            <CardDescription>
              Public JSON/RSS sources + Greenhouse / Lever / Ashby / Workday
              company boards.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {TOGGLE_BOARD_IDS.map((id) => (
                <label
                  key={id}
                  className="inline-flex items-center gap-2 text-sm border border-border rounded-full px-3 py-1.5"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(
                      boardSettings[id as keyof typeof boardSettings],
                    )}
                    onChange={(e) =>
                      setBoardSettings({ [id]: e.target.checked } as never)
                    }
                  />
                  {BOARD_LABELS[id]}
                </label>
              ))}
              <label className="inline-flex items-center gap-2 text-sm border border-border rounded-full px-3 py-1.5">
                <input
                  type="checkbox"
                  checked={boardSettings.includeSeedJobs}
                  onChange={(e) =>
                    setBoardSettings({ includeSeedJobs: e.target.checked })
                  }
                />
                Seed demo roles
              </label>
              <label className="inline-flex items-center gap-2 text-sm border border-border rounded-full px-3 py-1.5">
                <input
                  type="checkbox"
                  checked={boardSettings.atsEnabled}
                  onChange={(e) =>
                    setBoardSettings({ atsEnabled: e.target.checked })
                  }
                />
                Company ATS
              </label>
            </div>
            <label className="block text-xs font-medium text-muted max-w-xl">
              Default search query
              <Input
                className="mt-1"
                value={boardSettings.defaultQuery}
                onChange={(e) =>
                  setBoardSettings({ defaultQuery: e.target.value })
                }
              />
            </label>
            <div className="text-sm text-muted">
              Resume variants for tailoring:{" "}
              {listResumeVariants()
                .map((v) => v.name)
                .join(" · ")}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
