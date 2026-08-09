/**
 * Minimal DOCX (OOXML) builder — no extra npm deps.
 * Produces an editable Word document for tailored resumes.
 */
import type { MasterResume, TailoredResume } from "./types";

function xmlEsc(s: string): string {
  return (s || "")
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/"/g, "&" + "quot;");
}

function wPara(
  text: string,
  opts: {
    bold?: boolean;
    size?: number;
    center?: boolean;
    color?: string;
    spaceAfter?: number;
  } = {},
): string {
  const size = opts.size ?? 20;
  const after = opts.spaceAfter ?? 60;
  const align = opts.center ? `<w:jc w:val="center"/>` : "";
  const bold = opts.bold ? "<w:b/>" : "";
  const color = opts.color ? `<w:color w:val="${opts.color}"/>` : "";
  return `<w:p>
  <w:pPr>${align}<w:spacing w:after="${after}"/></w:pPr>
  <w:r>
    <w:rPr>${bold}<w:sz w:val="${size}"/><w:szCs w:val="${size}"/>${color}<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/></w:rPr>
    <w:t xml:space="preserve">${xmlEsc(text)}</w:t>
  </w:r>
</w:p>`;
}

function wHeading(text: string): string {
  return `<w:p>
  <w:pPr>
    <w:spacing w:before="160" w:after="40"/>
    <w:pBdr><w:bottom w:val="single" w:sz="12" w:space="4" w:color="0F766E"/></w:pBdr>
  </w:pPr>
  <w:r>
    <w:rPr><w:b/><w:sz w:val="18"/><w:color w:val="0F766E"/><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/></w:rPr>
    <w:t>${xmlEsc(text.toUpperCase())}</w:t>
  </w:r>
</w:p>`;
}

function wBullet(text: string): string {
  return `<w:p>
  <w:pPr>
    <w:spacing w:after="40"/>
    <w:ind w:left="360"/>
  </w:pPr>
  <w:r>
    <w:rPr><w:sz w:val="18"/><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/></w:rPr>
    <w:t xml:space="preserve">• ${xmlEsc(text)}</w:t>
  </w:r>
</w:p>`;
}

function crc32(data: Uint8Array): number {
  let c = ~0;
  for (let i = 0; i < data.length; i++) {
    c ^= data[i]!;
    for (let k = 0; k < 8; k++) {
      c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
  }
  return ~c >>> 0;
}

function u16(n: number): Uint8Array {
  const b = new Uint8Array(2);
  b[0] = n & 0xff;
  b[1] = (n >>> 8) & 0xff;
  return b;
}

function u32(n: number): Uint8Array {
  const b = new Uint8Array(4);
  b[0] = n & 0xff;
  b[1] = (n >>> 8) & 0xff;
  b[2] = (n >>> 16) & 0xff;
  b[3] = (n >>> 24) & 0xff;
  return b;
}

function concat(parts: Uint8Array[]): Uint8Array {
  const len = parts.reduce((a, p) => a + p.length, 0);
  const out = new Uint8Array(len);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

function zipStore(files: Array<{ name: string; data: Uint8Array }>): Uint8Array {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;
  for (const file of files) {
    const nameBytes = new TextEncoder().encode(file.name);
    const crc = crc32(file.data);
    const size = file.data.length;
    const localHeader = concat([
      u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(size), u32(size), u16(nameBytes.length), u16(0), nameBytes,
    ]);
    localParts.push(localHeader, file.data);
    const central = concat([
      u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(size), u32(size), u16(nameBytes.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), nameBytes,
    ]);
    centralParts.push(central);
    offset += localHeader.length + size;
  }
  const centralDir = concat(centralParts);
  const end = concat([u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(centralDir.length), u32(offset), u16(0)]);
  return concat([...localParts, centralDir, end]);
}

function buildDocumentXml(
  profile: Pick<MasterResume, "fullName" | "headline" | "email" | "phone" | "location" | "links">,
  tailored: TailoredResume,
): string {
  const body: string[] = [];
  body.push(wPara(profile.fullName, { bold: true, size: 32, center: true, spaceAfter: 40 }));
  body.push(wPara(profile.headline || tailored.targetRole, { center: true, size: 20, color: "0F766E", spaceAfter: 40 }));
  const contact = [profile.location, profile.email, profile.phone, ...(profile.links || [])].filter(Boolean).join("  ·  ");
  if (contact) body.push(wPara(contact, { center: true, size: 16, color: "4B5563", spaceAfter: 120 }));
  body.push(wHeading("Positioning"));
  body.push(wPara(tailored.summary, { size: 18, spaceAfter: 100 }));
  if (tailored.skills?.length) {
    body.push(wHeading("Expertise"));
    body.push(wPara(tailored.skills.join(" · "), { size: 18, spaceAfter: 100 }));
  }
  if (tailored.experience?.length) {
    body.push(wHeading("Selected outcomes & experience"));
    for (const exp of tailored.experience) {
      body.push(wPara([exp.company, exp.title].filter(Boolean).join(" — "), { bold: true, size: 19, spaceAfter: 20 }));
      const dates = [exp.start, exp.end].filter(Boolean).join(" – ");
      if (dates || exp.location) body.push(wPara([dates, exp.location].filter(Boolean).join(" · "), { size: 16, color: "6B7280", spaceAfter: 40 }));
      for (const b of exp.bullets || []) body.push(wBullet(b));
    }
  }
  if (tailored.education?.length) {
    body.push(wHeading("Education"));
    for (const ed of tailored.education) body.push(wPara([ed.school, ed.degree, ed.year].filter(Boolean).join(" · "), { size: 18, spaceAfter: 60 }));
  }
  // Review-only notes — delete this section before exporting to PDF / submitting
  const reviewBits: string[] = [];
  if (tailored.targetRole || tailored.targetCompany) {
    reviewBits.push(
      `Written for: ${[tailored.targetRole, tailored.targetCompany].filter(Boolean).join(" · ")}`,
    );
  }
  if (tailored.matchedKeywords?.length) {
    reviewBits.push(
      `Keywords emphasized: ${tailored.matchedKeywords.join(" · ")}`,
    );
  }
  if (tailored.missingKeywords?.length) {
    reviewBits.push(
      `Optional gaps to consider (only if true): ${tailored.missingKeywords.slice(0, 6).join(", ")}`,
    );
  }
  reviewBits.push(
    `ATS alignment (internal): ${tailored.matchScore}% — edit formatting, delete this section, then Save as PDF to apply.`,
  );
  body.push(wHeading("Review notes — delete before submitting"));
  for (const line of reviewBits) {
    body.push(wPara(line, { size: 14, color: "9CA3AF", spaceAfter: 40 }));
  }
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${body.join("\n")}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;

const RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;

const DOC_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;

function coreXml(name: string, title: string): string {
  const now = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:dcterms="http://purl.org/dc/terms/"
  xmlns:dcmitype="http://purl.org/dc/dcmitype/"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${xmlEsc(title)}</dc:title>
  <dc:creator>${xmlEsc(name)}</dc:creator>
  <cp:lastModifiedBy>${xmlEsc(name)}</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>
</cp:coreProperties>`;
}

const APP_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
  xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Scout Resume</Application>
</Properties>`;

export function buildResumeDocx(
  profile: Pick<MasterResume, "fullName" | "headline" | "email" | "phone" | "location" | "links">,
  tailored: TailoredResume,
): Uint8Array {
  const enc = new TextEncoder();
  const documentXml = buildDocumentXml(profile, tailored);
  const title = `${profile.fullName} — ${tailored.targetRole || profile.headline}`;
  return zipStore([
    { name: "[Content_Types].xml", data: enc.encode(CONTENT_TYPES) },
    { name: "_rels/.rels", data: enc.encode(RELS) },
    { name: "word/document.xml", data: enc.encode(documentXml) },
    { name: "word/_rels/document.xml.rels", data: enc.encode(DOC_RELS) },
    { name: "docProps/core.xml", data: enc.encode(coreXml(profile.fullName, title)) },
    { name: "docProps/app.xml", data: enc.encode(APP_XML) },
  ]);
}

export function downloadDocx(bytes: Uint8Array, filename: string) {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const blob = new Blob([copy], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".docx") ? filename : `${filename}.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
