import type { Job } from "@/data/types";

/**
 * Boolean job search over title, company, location, skills, description.
 * Supports AND / OR / NOT / quotes / parentheses (simplified).
 */
export function matchesJobQuery(job: Job, rawQuery: string): boolean {
  const q = rawQuery.trim();
  if (!q) return true;
  const hay = [
    job.title,
    job.company,
    job.location,
    job.department ?? "",
    job.skills.join(" "),
    job.requirements.join(" "),
    job.description,
  ]
    .join(" \n ")
    .toLowerCase();

  // quoted phrases first
  let expr = q.toLowerCase();
  const phrases: string[] = [];
  expr = expr.replace(/"([^"]+)"/g, (_, p) => {
    phrases.push(p);
    return `__PH${phrases.length - 1}__`;
  });

  const has = (token: string) => {
    const m = token.match(/^__PH(\d+)__$/);
    if (m) return hay.includes(phrases[Number(m[1])]!);
    if (token.startsWith("-") || token === "not") return false;
    return hay.includes(token);
  };

  // split on OR
  const orGroups = expr.split(/\s+or\s+/i);
  return orGroups.some((group) => {
    const tokens = group.split(/\s+/).filter(Boolean);
    let expectNot = false;
    for (const t of tokens) {
      if (t === "and") continue;
      if (t === "not" || t === "-") {
        expectNot = true;
        continue;
      }
      let term = t;
      if (term.startsWith("-")) {
        expectNot = true;
        term = term.slice(1);
      }
      const hit = has(term);
      if (expectNot) {
        if (hit) return false;
        expectNot = false;
      } else if (!hit) {
        return false;
      }
    }
    return true;
  });
}
