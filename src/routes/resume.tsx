import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useScoutStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/resume")({
  component: ResumePage,
});

function ResumePage() {
  const resume = useScoutStore((s) => s.resume);
  const updateResume = useScoutStore((s) => s.updateResume);
  const setResume = useScoutStore((s) => s.setResume);

  return (
    <AppShell
      title="Master resume"
      subtitle="Source of truth for ATS tailoring. Job-specific PDFs reorder and emphasize — they never invent bullets."
      actions={
        <Button
          size="sm"
          onClick={() => toast.success("Saved in this browser")}
        >
          Save
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Contact line on every tailored PDF.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field
              label="Full name"
              value={resume.fullName}
              onChange={(v) => updateResume({ fullName: v })}
            />
            <Field
              label="Headline"
              value={resume.headline}
              onChange={(v) => updateResume({ headline: v })}
            />
            <Field
              label="Email"
              value={resume.email}
              onChange={(v) => updateResume({ email: v })}
            />
            <Field
              label="Phone"
              value={resume.phone}
              onChange={(v) => updateResume({ phone: v })}
            />
            <Field
              label="Location"
              value={resume.location}
              onChange={(v) => updateResume({ location: v })}
            />
            <Field
              label="Links (comma-separated)"
              value={resume.links.join(", ")}
              onChange={(v) =>
                updateResume({
                  links: v
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary & skills</CardTitle>
            <CardDescription>
              Summary is lightly rewritten per job; skills are reordered by keyword hit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="block text-xs font-medium text-muted">
              Summary
              <textarea
                value={resume.summary}
                onChange={(e) => updateResume({ summary: e.target.value })}
                rows={6}
                className="mt-1 w-full rounded-[var(--radius-md)] border border-border bg-surface-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </label>
            <label className="block text-xs font-medium text-muted">
              Skills (comma-separated)
              <textarea
                value={resume.skills.join(", ")}
                onChange={(e) =>
                  updateResume({
                    skills: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                rows={4}
                className="mt-1 w-full rounded-[var(--radius-md)] border border-border bg-surface-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </label>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Experience</CardTitle>
            <CardDescription>
              Bullets are scored against each job description and reordered for the PDF.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {resume.experience.map((exp, idx) => (
              <div
                key={exp.id}
                className="rounded-[var(--radius-lg)] border border-border p-4 space-y-3"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Title"
                    value={exp.title}
                    onChange={(v) => {
                      const experience = [...resume.experience];
                      experience[idx] = { ...exp, title: v };
                      setResume({ ...resume, experience });
                    }}
                  />
                  <Field
                    label="Company"
                    value={exp.company}
                    onChange={(v) => {
                      const experience = [...resume.experience];
                      experience[idx] = { ...exp, company: v };
                      setResume({ ...resume, experience });
                    }}
                  />
                  <Field
                    label="Location"
                    value={exp.location}
                    onChange={(v) => {
                      const experience = [...resume.experience];
                      experience[idx] = { ...exp, location: v };
                      setResume({ ...resume, experience });
                    }}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Field
                      label="Start"
                      value={exp.start}
                      onChange={(v) => {
                        const experience = [...resume.experience];
                        experience[idx] = { ...exp, start: v };
                        setResume({ ...resume, experience });
                      }}
                    />
                    <Field
                      label="End"
                      value={exp.end}
                      onChange={(v) => {
                        const experience = [...resume.experience];
                        experience[idx] = { ...exp, end: v };
                        setResume({ ...resume, experience });
                      }}
                    />
                  </div>
                </div>
                <label className="block text-xs font-medium text-muted">
                  Bullets (one per line)
                  <textarea
                    value={exp.bullets.join("\n")}
                    onChange={(e) => {
                      const experience = [...resume.experience];
                      experience[idx] = {
                        ...exp,
                        bullets: e.target.value
                          .split("\n")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      };
                      setResume({ ...resume, experience });
                    }}
                    rows={4}
                    className="mt-1 w-full rounded-[var(--radius-md)] border border-border bg-surface-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-xs font-medium text-muted">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}
