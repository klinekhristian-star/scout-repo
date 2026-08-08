import type { MasterResume, TailoredResume } from "./types";

/**
 * Minimal PDF writer (Helvetica) — no extra deps.
 * Designed single-column resume layout for ATS-friendly parseability.
 */

type Cmd = string;

function esc(text: string) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7E]/g, (ch) => {
      return ch.normalize("NFKD").replace(/[^\x20-\x7E]/g, "");
    });
}

function wrap(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}

export function buildResumePdf(
  profile: Pick<
    MasterResume,
    "fullName" | "headline" | "email" | "phone" | "location" | "links"
  >,
  tailored: TailoredResume,
): Uint8Array {
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;
  const maxChars = 88;

  const cmds: Cmd[] = [];
  let y = pageHeight - margin;
  const pages: string[] = [];

  const ensure = (need: number) => {
    if (y - need < margin) {
      pages.push(cmds.join("\n"));
      cmds.length = 0;
      y = pageHeight - margin;
    }
  };

  const setFill = (r: number, g: number, b: number) => {
    cmds.push(`${r} ${g} ${b} rg`);
  };
  const setStroke = (r: number, g: number, b: number) => {
    cmds.push(`${r} ${g} ${b} RG`);
  };

  const textAt = (
    x: number,
    yy: number,
    size: number,
    text: string,
    font: "F1" | "F2" = "F1",
  ) => {
    cmds.push("BT");
    cmds.push(`/${font} ${size} Tf`);
    cmds.push(`${x.toFixed(2)} ${yy.toFixed(2)} Td`);
    cmds.push(`(${esc(text)}) Tj`);
    cmds.push("ET");
  };

  const rule = () => {
    ensure(14);
    y -= 6;
    setStroke(0.06, 0.46, 0.43);
    cmds.push("1.2 w");
    cmds.push(
      `${margin} ${y.toFixed(2)} m ${pageWidth - margin} ${y.toFixed(2)} l S`,
    );
    y -= 12;
  };

  const section = (title: string) => {
    ensure(28);
    y -= 4;
    setFill(0.05, 0.09, 0.16);
    textAt(margin, y, 11, title.toUpperCase(), "F2");
    y -= 6;
    rule();
  };

  const para = (text: string, size = 10, leading = 13) => {
    const lines = wrap(text, maxChars);
    for (const line of lines) {
      ensure(leading + 2);
      setFill(0.12, 0.14, 0.18);
      textAt(margin, y, size, line, "F1");
      y -= leading;
    }
  };

  const bullet = (text: string) => {
    const lines = wrap(text, maxChars - 4);
    lines.forEach((line, i) => {
      ensure(14);
      setFill(0.12, 0.14, 0.18);
      textAt(margin, y, 10, i === 0 ? `•  ${line}` : `    ${line}`, "F1");
      y -= 13;
    });
  };

  // Header band
  setFill(0.05, 0.09, 0.16);
  cmds.push(`${margin - 8} ${y - 52} ${contentWidth + 16} 64 re f`);
  setFill(1, 1, 1);
  textAt(margin, y - 8, 20, profile.fullName, "F2");
  textAt(margin, y - 26, 10, profile.headline, "F1");
  const contact = [
    profile.email,
    profile.phone,
    profile.location,
    ...profile.links.slice(0, 2),
  ]
    .filter(Boolean)
    .join("  ·  ");
  textAt(margin, y - 42, 8.5, contact, "F1");
  y -= 72;

  setFill(0.06, 0.46, 0.43);
  textAt(
    margin,
    y,
    9,
    `Tailored for ${tailored.targetRole} · ${tailored.targetCompany}  ·  ATS match ${tailored.matchScore}%`,
    "F2",
  );
  y -= 18;

  section("Professional Summary");
  para(tailored.summary, 10, 13);
  y -= 6;

  section("Skills");
  para(tailored.skills.join("  ·  "), 9.5, 12);
  y -= 6;

  section("Experience");
  for (const exp of tailored.experience) {
    ensure(48);
    setFill(0.05, 0.09, 0.16);
    textAt(margin, y, 11, exp.title, "F2");
    const right = `${exp.start} – ${exp.end}`;
    textAt(pageWidth - margin - right.length * 5.2, y, 9, right, "F1");
    y -= 14;
    setFill(0.06, 0.46, 0.43);
    textAt(margin, y, 9.5, `${exp.company}  ·  ${exp.location}`, "F1");
    y -= 14;
    for (const b of exp.bullets) bullet(b);
    y -= 8;
  }

  section("Education");
  for (const edu of tailored.education) {
    ensure(28);
    setFill(0.05, 0.09, 0.16);
    textAt(margin, y, 10.5, edu.school, "F2");
    y -= 13;
    setFill(0.12, 0.14, 0.18);
    textAt(margin, y, 9.5, `${edu.degree}  ·  ${edu.year}`, "F1");
    y -= 16;
  }

  if (tailored.matchedKeywords.length) {
    section("Keyword Alignment");
    para(
      `Emphasized: ${tailored.matchedKeywords.slice(0, 14).join(", ")}.`,
      9,
      12,
    );
  }

  pages.push(cmds.join("\n"));
  return encodePdf(pages, pageWidth, pageHeight);
}

function encodePdf(
  pageStreams: string[],
  pageWidth: number,
  pageHeight: number,
): Uint8Array {
  const parts: string[] = [];
  const offsets: number[] = [];
  let pos = 0;

  const write = (s: string) => {
    parts.push(s);
    pos += s.length;
  };

  write("%PDF-1.4\n");

  const obj = (n: number, body: string) => {
    offsets[n] = pos;
    write(`${n} 0 obj\n${body}\nendobj\n`);
  };

  const fontRegular = 3;
  const fontBold = 4;
  const firstContent = 5;
  const pageCount = pageStreams.length;
  const firstPage = firstContent + pageCount;
  const pagesObj = 2;
  const catalog = 1;

  obj(catalog, `<< /Type /Catalog /Pages ${pagesObj} 0 R >>`);

  const kids = pageStreams.map((_, i) => `${firstPage + i} 0 R`).join(" ");
  obj(
    pagesObj,
    `<< /Type /Pages /Kids [ ${kids} ] /Count ${pageCount} >>`,
  );

  obj(
    fontRegular,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  );
  obj(
    fontBold,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
  );

  pageStreams.forEach((stream, i) => {
    obj(
      firstContent + i,
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    );
  });

  pageStreams.forEach((_, i) => {
    obj(
      firstPage + i,
      `<< /Type /Page /Parent ${pagesObj} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${firstContent + i} 0 R /Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> >> >>`,
    );
  });

  const xrefPos = pos;
  const maxObj = firstPage + pageCount - 1;
  write(`xref\n0 ${maxObj + 1}\n`);
  write("0000000000 65535 f \n");
  for (let i = 1; i <= maxObj; i++) {
    write(`${String(offsets[i] ?? 0).padStart(10, "0")} 00000 n \n`);
  }
  write(
    `trailer\n<< /Size ${maxObj + 1} /Root ${catalog} 0 R >>\nstartxref\n${xrefPos}\n%%EOF`,
  );

  return new TextEncoder().encode(parts.join(""));
}

export function downloadPdf(bytes: Uint8Array, filename: string) {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const blob = new Blob([copy], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}
