import type { Dispatch, SetStateAction } from "react";
import { Network, Plus, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  Job,
  OutreachChannel,
  OutreachEntry,
  OutreachStatus,
  Application,
} from "@/data/types";

const CHANNELS: OutreachChannel[] = [
  "linkedin", "email", "referral", "call", "event", "other",
];
const STATUSES: OutreachStatus[] = [
  "planned", "sent", "replied", "meeting", "closed",
];

type OutForm = {
  contactName: string;
  contactRole: string;
  channel: OutreachChannel;
  status: OutreachStatus;
  note: string;
  nextFollowUp: string;
};

type Props = {
  job: Job;
  app?: Application;
  referralPath: string;
  setReferralPath: (v: string) => void;
  outForm: OutForm;
  setOutForm: Dispatch<SetStateAction<OutForm>>;
  submitOutreach: () => void;
  ensureApplication: (jobId: string) => Application | undefined;
  updateApplication: (id: string, patch: Partial<Application>) => void;
  updateOutreach: (jobId: string, id: string, patch: Partial<OutreachEntry>) => void;
  removeOutreach: (jobId: string, id: string) => void;
};

export function JobOutreachSection({
  job,
  app,
  referralPath,
  setReferralPath,
  outForm,
  setOutForm,
  submitOutreach,
  ensureApplication,
  updateApplication,
  updateOutreach,
  removeOutreach,
}: Props) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-border overflow-hidden">
      <div className="border-b border-border bg-surface px-4 py-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
          <Network className="h-3.5 w-3.5 text-primary" />
          Outreach & network
        </div>
        <p className="text-sm text-muted mt-1">
          Who can open a door—and what you did about it.
        </p>
      </div>
      <div className="p-4 space-y-3">
        <label className="block text-xs font-medium text-muted">
          Referral path
          <Input
            className="mt-1"
            placeholder="e.g. Ex-ON24 AE → hiring manager intro"
            value={referralPath}
            onChange={(e) => {
              setReferralPath(e.target.value);
              const a = app ?? ensureApplication(job.id);
              if (a)
                updateApplication(a.id, {
                  referralPath: e.target.value,
                });
            }}
          />
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          <Input
            placeholder="Contact name"
            value={outForm.contactName}
            onChange={(e) =>
              setOutForm((f) => ({ ...f, contactName: e.target.value }))
            }
          />
          <Input
            placeholder="Role (optional)"
            value={outForm.contactRole}
            onChange={(e) =>
              setOutForm((f) => ({ ...f, contactRole: e.target.value }))
            }
          />
          <select
            className="h-10 rounded-[var(--radius-md)] border border-border px-2 text-sm"
            value={outForm.channel}
            onChange={(e) =>
              setOutForm((f) => ({
                ...f,
                channel: e.target.value as OutreachChannel,
              }))
            }
          >
            {CHANNELS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-[var(--radius-md)] border border-border px-2 text-sm"
            value={outForm.status}
            onChange={(e) =>
              setOutForm((f) => ({
                ...f,
                status: e.target.value as OutreachStatus,
              }))
            }
          >
            {STATUSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <Input
            type="date"
            className="sm:col-span-2"
            value={outForm.nextFollowUp}
            onChange={(e) =>
              setOutForm((f) => ({
                ...f,
                nextFollowUp: e.target.value,
              }))
            }
          />
          <Textarea
            className="sm:col-span-2"
            placeholder="Note"
            rows={2}
            value={outForm.note}
            onChange={(e) =>
              setOutForm((f) => ({ ...f, note: e.target.value }))
            }
          />
        </div>
        <Button size="sm" variant="outline" onClick={submitOutreach}>
          <Plus className="h-3.5 w-3.5" />
          Log outreach
        </Button>
        <div className="space-y-2">
          {(app?.outreach ?? []).map((o) => (
            <div
              key={o.id}
              className="rounded-[var(--radius-md)] border border-border p-3 text-sm space-y-1"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-medium">
                  <Users className="inline h-3.5 w-3.5 mr-1 text-muted" />
                  {o.contactName}
                  {o.contactRole ? (
                    <span className="text-muted font-normal">
                      {" "}
                      · {o.contactRole}
                    </span>
                  ) : null}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-danger h-8 w-8 p-0"
                  onClick={() => removeOutreach(job.id, o.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline">{o.channel}</Badge>
                <select
                  className="h-7 text-xs border border-border rounded px-1 bg-surface-card"
                  value={o.status}
                  onChange={(e) =>
                    updateOutreach(job.id, o.id, {
                      status: e.target.value as OutreachStatus,
                    })
                  }
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {o.nextFollowUp && (
                  <Badge variant="warning">
                    Follow-up {o.nextFollowUp.slice(0, 10)}
                  </Badge>
                )}
              </div>
              {o.note && (
                <p className="text-muted text-xs leading-relaxed">{o.note}</p>
              )}
            </div>
          ))}
          {(app?.outreach ?? []).length === 0 && (
            <p className="text-xs text-muted">
              No outreach yet. Log a contact or referral path above.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
