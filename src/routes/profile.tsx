import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BOARD_LABELS, TOGGLE_BOARD_IDS } from "@/lib/job-boards/meta";
import { useJobStore } from "@/lib/store";
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

  return (
    <AppShell>
      <PageHeader
        title="Profile"
        subtitle="Drives match scores, agent filters, cover letters, and tailored PDFs."
        actions={
          <>
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
            <Button size="sm" onClick={() => toast.success("Saved in this browser")}>
              <Save className="h-3.5 w-3.5" />
              Save
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Identity</CardTitle>
            <CardDescription>Khristian Kline · GTM / engagement executive defaults</CardDescription>
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
                    targetTitles: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
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
                    skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
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
                    preferredLocations: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
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
                onChange={(e) => setProfile({ salaryMin: Number(e.target.value) || 0 })}
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
              Public JSON/RSS sources + Greenhouse / Lever / Ashby / Workday company boards.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {TOGGLE_BOARD_IDS.map((id) => (
                <label key={id} className="inline-flex items-center gap-2 text-sm border border-border rounded-full px-3 py-1.5">
                  <input
                    type="checkbox"
                    checked={Boolean(boardSettings[id as keyof typeof boardSettings])}
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
            <label className="block text-xs font-medium text-muted">
              Default search query
              <Input
                className="mt-1"
                value={boardSettings.defaultQuery}
                onChange={(e) => setBoardSettings({ defaultQuery: e.target.value })}
              />
            </label>
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                ATS targets
              </div>
              {boardSettings.atsTargets.map((t, idx) => (
                <div
                  key={t.id}
                  className="grid gap-2 sm:grid-cols-[auto_1fr_1fr_1fr] items-center border border-border rounded-[var(--radius-md)] p-2"
                >
                  <input
                    type="checkbox"
                    checked={t.enabled}
                    onChange={(e) => {
                      const atsTargets = boardSettings.atsTargets.map((x, i) =>
                        i === idx ? { ...x, enabled: e.target.checked } : x,
                      );
                      setBoardSettings({ atsTargets });
                    }}
                  />
                  <span className="text-sm font-medium">{t.company}</span>
                  <span className="text-xs text-muted">{t.provider}</span>
                  <span className="text-xs font-mono truncate">{t.slug}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Resume library</CardTitle>
            <CardDescription>
              Used by Suggest tailored resume / Generate PDF on job detail.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {listResumeVariants().map((v) => (
              <div key={v.id} className="border border-border rounded-[var(--radius-md)] p-3">
                <div className="font-semibold text-sm">{v.name}</div>
                <p className="text-xs text-muted mt-1">{v.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
