import { Link2, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { buildJob } from "@/lib/job-boards/normalize";
import { useJobStore } from "@/lib/store";

export function AddJobLinkDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreated?: (jobId: string) => void;
}) {
  const addManualJob = useJobStore((s) => s.addManualJob);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("Remote");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const submit = async () => {
    if (!title.trim() || !company.trim()) {
      toast.error("Title and company are required");
      return;
    }
    if (!description.trim()) {
      toast.error("Paste the full job description for better ATS tailoring");
      return;
    }
    setBusy(true);
    try {
      const job = buildJob({
        id: `manual-${Date.now().toString(36)}`,
        title: title.trim(),
        company: company.trim(),
        location: location.trim() || "Remote",
        description: description.trim(),
        url: url.trim() || "https://example.com",
        source: "Your link",
        postedAt: new Date().toISOString(),
      });
      const { job: saved, already } = addManualJob(job);
      toast.success(already ? "Already on your board" : "Job added");
      onCreated?.(saved.id);
      onOpenChange(false);
      setUrl("");
      setTitle("");
      setCompany("");
      setDescription("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-bg/50"
        aria-label="Close"
        onClick={() => onOpenChange(false)}
      />
      <Card className="relative z-10 w-full max-w-lg max-h-[90dvh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Add job link
          </CardTitle>
          <CardDescription>
            Paste a company or LinkedIn-style URL plus the full job description so
            Scout can score and tailor accurately.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="block text-xs font-medium text-muted">
            Listing URL
            <Input
              className="mt-1"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-medium text-muted">
              Title
              <Input className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label className="block text-xs font-medium text-muted">
              Company
              <Input className="mt-1" value={company} onChange={(e) => setCompany(e.target.value)} />
            </label>
          </div>
          <label className="block text-xs font-medium text-muted">
            Location
            <Input className="mt-1" value={location} onChange={(e) => setLocation(e.target.value)} />
          </label>
          <label className="block text-xs font-medium text-muted">
            Full job description
            <Textarea
              className="mt-1"
              rows={7}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste the complete posting text…"
            />
          </label>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => void submit()} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add to Scout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
