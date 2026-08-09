import { FileDown, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Job, Profile, TailoredResumeSnapshot } from "@/data/types";
import type { ResumeVariantId } from "@/data/resume-library";
import { exportTailoredDocx, exportTailoredPdf } from "@/lib/resume-export";
import { tailorResumeForJob } from "@/lib/tailor-resume";

type Props = {
  job: Job;
  profile: Profile;
  variantId: ResumeVariantId;
  tailored: TailoredResumeSnapshot | null;
  setTailored: (r: TailoredResumeSnapshot) => void;
  persistTailor: (r: TailoredResumeSnapshot) => void;
  disabled?: boolean;
};

export function TailoredExportButtons({
  job,
  profile,
  variantId,
  tailored,
  setTailored,
  persistTailor,
  disabled,
}: Props) {
  const [busy, setBusy] = useState<"pdf" | "docx" | null>(null);

  const ensure = () => {
    const result = tailored ?? tailorResumeForJob(job, profile, variantId);
    setTailored(result);
    if (!tailored) persistTailor(result);
    return result;
  };

  const runPdf = async () => {
    setBusy("pdf");
    try {
      exportTailoredPdf(profile, job, ensure());
      toast.success("Designed PDF downloaded");
    } catch (e) {
      console.error(e);
      toast.error("PDF generation failed");
    } finally {
      setBusy(null);
    }
  };

  const runDocx = async () => {
    setBusy("docx");
    try {
      exportTailoredDocx(profile, job, ensure());
      toast.success(
        "Word document downloaded — edit formatting, then export PDF to apply",
      );
    } catch (e) {
      console.error(e);
      toast.error("Word generation failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          className="sm:flex-1"
          variant="outline"
          disabled={disabled || busy !== null}
          onClick={() => void runPdf()}
        >
          {busy === "pdf" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4" />
          )}
          Generate PDF
        </Button>
        <Button
          className="sm:flex-1"
          variant="outline"
          disabled={disabled || busy !== null}
          onClick={() => void runDocx()}
        >
          {busy === "docx" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          Download Word
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Word is editable (formatting, spacing, wording). Export to PDF from Word
        when you apply.
      </p>
    </div>
  );
}
