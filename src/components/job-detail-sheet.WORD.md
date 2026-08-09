# Download Word button

`src/lib/docx-resume.ts` is already on main.

Wire into `src/components/job-detail-sheet.tsx`:

1. Import:
```ts
import { buildResumeDocx, downloadDocx } from "@/lib/docx-resume";
```

2. Extend busy state: `"tailor" | "pdf" | "docx" | "packet"`

3. After `buildPdfBytes` / `runPdf`, add `buildDocxBytes` (same payload as PDF) and `runDocx` that calls `downloadDocx(...docx)`.

4. UI — next to Generate PDF:
```tsx
<Button className="sm:flex-1" variant="outline" disabled={busy !== null} onClick={() => void runDocx()}>
  {busy === "docx" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
  Download Word
</Button>
```

Full patched file and unified diff are in the Scout build artifacts if needed.
