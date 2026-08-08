import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { AtsTarget, Job, JobBoardId } from "@/data/types";
import { buildJob, stripHtml } from "@/lib/job-boards/normalize";

const InputSchema = z.object({
  boards: z.array(z.string()),
  query: z.string().default(""),
  location: z.string().default(""),
  limit: z.number().default(40),
  adzunaAppId: z.string().optional().default(""),
  adzunaAppKey: z.string().optional().default(""),
  adzunaCountry: z.string().optional().default("us"),
  atsEnabled: z.boolean().optional().default(false),
  atsTargets: z
    .array(
      z.object({
        id: z.string(),
        provider: z.enum(["greenhouse", "lever", "ashby", "workday"]),
        slug: z.string(),
        company: z.string(),
        enabled: z.boolean(),
      }),
    )
    .optional()
    .default([]),
  atsLimit: z.number().optional().default(16),
});

type BoardResult = {
  board: JobBoardId;
  jobs: Job[];
  error?: string;
  fetchedAt: string;
  label?: string;
};

type AtsResult = {
  provider: string;
  company: string;
  jobs: Job[];
  error?: string;
};

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json, text/plain, */*",
      "User-Agent": "ScoutJobOS/1.0",
      ...(init?.headers || {}),
    },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchRemotive(query: string, limit: number): Promise<Job[]> {
  const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query || "marketing")}&limit=${limit}`;
  const data = (await fetchJson(url)) as {
    jobs?: Array<Record<string, unknown>>;
  };
  return (data.jobs || []).slice(0, limit).map((j, i) =>
    buildJob({
      id: `remotive-${j.id ?? i}`,
      title: String(j.title || ""),
      company: String(j.company_name || ""),
      location: String(j.candidate_required_location || "Remote"),
      description: String(j.description || ""),
      url: String(j.url || j.job_url || "https://remotive.com"),
      source: "Remotive",
      postedAt: j.publication_date
        ? String(j.publication_date)
        : new Date().toISOString(),
      salaryMin: undefined,
      companyLogo: j.company_logo_url ? String(j.company_logo_url) : undefined,
    }),
  );
}

async function fetchArbeitnow(query: string, limit: number): Promise<Job[]> {
  const url = `https://www.arbeitnow.com/api/job-board-api?search=${encodeURIComponent(query || "")}`;
  const data = (await fetchJson(url)) as {
    data?: Array<Record<string, unknown>>;
  };
  return (data.data || []).slice(0, limit).map((j, i) =>
    buildJob({
      id: `arbeitnow-${String(j.slug || j.url || i)}`,
      title: String(j.title || ""),
      company: String(j.company_name || ""),
      location: String(j.location || "Remote"),
      description: String(j.description || ""),
      url: String(j.url || "https://www.arbeitnow.com"),
      source: "Arbeitnow",
      postedAt: j.created_at
        ? new Date(Number(j.created_at) * 1000).toISOString()
        : new Date().toISOString(),
    }),
  );
}

async function fetchRemoteOK(query: string, limit: number): Promise<Job[]> {
  const data = (await fetchJson("https://remoteok.com/api")) as Array<
    Record<string, unknown>
  >;
  const q = query.toLowerCase();
  const rows = (data || [])
    .filter((j) => j && j.id && j.position)
    .filter((j) => {
      if (!q) return true;
      const hay = `${j.position} ${j.company} ${(j.tags || [])}`.toLowerCase();
      return q.split(/\s+/).some((t) => hay.includes(t));
    })
    .slice(0, limit);
  return rows.map((j) =>
    buildJob({
      id: `remoteok-${j.id}`,
      title: String(j.position || ""),
      company: String(j.company || ""),
      location: String(j.location || "Remote"),
      description: String(j.description || ""),
      url: String(j.url || j.apply_url || "https://remoteok.com"),
      source: "RemoteOK",
      postedAt: j.date ? String(j.date) : new Date().toISOString(),
      companyLogo: j.company_logo ? String(j.company_logo) : undefined,
    }),
  );
}

async function fetchJobicy(query: string, limit: number): Promise<Job[]> {
  const url = `https://jobicy.com/api/v2/remote-jobs?count=${limit}&tag=${encodeURIComponent(query.split(/\s+/)[0] || "marketing")}`;
  const data = (await fetchJson(url)) as {
    jobs?: Array<Record<string, unknown>>;
  };
  return (data.jobs || []).slice(0, limit).map((j, i) =>
    buildJob({
      id: `jobicy-${j.id ?? i}`,
      title: String(j.jobTitle || ""),
      company: String(j.companyName || ""),
      location: String(j.jobGeo || "Remote"),
      description: String(j.jobDescription || ""),
      url: String(j.url || "https://jobicy.com"),
      source: "Jobicy",
      postedAt: j.pubDate ? String(j.pubDate) : new Date().toISOString(),
    }),
  );
}

async function fetchHimalayas(query: string, limit: number): Promise<Job[]> {
  const url = `https://himalayas.app/jobs/api?limit=${limit}`;
  const data = (await fetchJson(url)) as {
    jobs?: Array<Record<string, unknown>>;
  };
  const q = query.toLowerCase();
  return (data.jobs || [])
    .filter((j) => {
      if (!q) return true;
      const hay = `${j.title} ${j.companyName}`.toLowerCase();
      return q.split(/\s+/).some((t) => hay.includes(t));
    })
    .slice(0, limit)
    .map((j, i) =>
      buildJob({
        id: `himalayas-${j.guid || j.id || i}`,
        title: String(j.title || ""),
        company: String(j.companyName || ""),
        location: "Remote",
        description: String(j.description || j.excerpt || ""),
        url: String(j.applicationLink || j.guid || "https://himalayas.app"),
        source: "Himalayas",
        postedAt: j.pubDate ? String(j.pubDate) : new Date().toISOString(),
      }),
    );
}

async function fetchTheMuse(query: string, limit: number): Promise<Job[]> {
  const url = `https://www.themuse.com/api/public/jobs?page=0&descending=true&api_key=`;
  // public without key still returns some pages historically; soft-fail
  try {
    const data = (await fetchJson(
      `https://www.themuse.com/api/public/jobs?page=1&category=Marketing&level=Senior%20Level`,
    )) as { results?: Array<Record<string, unknown>> };
    const q = query.toLowerCase();
    return (data.results || [])
      .filter((j) => {
        const hay = `${j.name} ${JSON.stringify(j.company)}`.toLowerCase();
        return !q || q.split(/\s+/).some((t) => hay.includes(t));
      })
      .slice(0, limit)
      .map((j, i) => {
        const company = (j.company as { name?: string } | undefined)?.name || "";
        const locs = (j.locations as Array<{ name?: string }>) || [];
        return buildJob({
          id: `themuse-${j.id ?? i}`,
          title: String(j.name || ""),
          company,
          location: locs[0]?.name || "Remote",
          description: stripHtml(String(j.contents || "")),
          url: String(j.refs ? (j.refs as { landing_page?: string }).landing_page : "https://www.themuse.com"),
          source: "The Muse",
          postedAt: j.publication_date
            ? String(j.publication_date)
            : new Date().toISOString(),
        });
      });
  } catch {
    return [];
  }
}

async function fetchWWR(limit: number): Promise<Job[]> {
  // Official RSS
  const res = await fetch("https://weworkremotely.com/categories/remote-marketing-and-customer-support-jobs.rss", {
    headers: { "User-Agent": "ScoutJobOS/1.0" },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, limit);
  return items.map((m, i) => {
    const block = m[1] || "";
    const title = (block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
      block.match(/<title>(.*?)<\/title>/))?.[1] || "Role";
    const link = (block.match(/<link>(.*?)<\/link>/) || [])[1] || "https://weworkremotely.com";
    const desc = (block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) ||
      block.match(/<description>([\s\S]*?)<\/description>/))?.[1] || "";
    const company = title.includes(":") ? title.split(":")[0]!.trim() : "Company";
    const role = title.includes(":") ? title.split(":").slice(1).join(":").trim() : title;
    return buildJob({
      id: `wwr-${i}-${link.slice(-24)}`,
      title: role,
      company,
      location: "Remote",
      description: stripHtml(desc),
      url: link,
      source: "We Work Remotely",
    });
  });
}

async function fetchAdzuna(
  query: string,
  country: string,
  appId: string,
  appKey: string,
  limit: number,
): Promise<Job[]> {
  if (!appId || !appKey) throw new Error("Adzuna app id/key required");
  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${encodeURIComponent(appId)}&app_key=${encodeURIComponent(appKey)}&results_per_page=${limit}&what=${encodeURIComponent(query)}`;
  const data = (await fetchJson(url)) as {
    results?: Array<Record<string, unknown>>;
  };
  return (data.results || []).map((j, i) =>
    buildJob({
      id: `adzuna-${j.id ?? i}`,
      title: String(j.title || ""),
      company: String((j.company as { display_name?: string })?.display_name || ""),
      location: String((j.location as { display_name?: string })?.display_name || ""),
      description: String(j.description || ""),
      url: String(j.redirect_url || "https://www.adzuna.com"),
      source: "Adzuna",
      salaryMin: typeof j.salary_min === "number" ? j.salary_min : undefined,
      salaryMax: typeof j.salary_max === "number" ? j.salary_max : undefined,
      postedAt: j.created ? String(j.created) : new Date().toISOString(),
    }),
  );
}

async function fetchGreenhouse(slug: string, company: string, limit: number) {
  const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(slug)}/jobs?content=true`;
  const data = (await fetchJson(url)) as { jobs?: Array<Record<string, unknown>> };
  return (data.jobs || []).slice(0, limit).map((j) =>
    buildJob({
      id: `gh-${slug}-${j.id}`,
      title: String(j.title || ""),
      company,
      location:
        (j.location as { name?: string } | undefined)?.name ||
        "See listing",
      description: stripHtml(String(j.content || "")),
      url:
        String(j.absolute_url || "") ||
        `https://boards.greenhouse.io/${slug}/jobs/${j.id}`,
      source: `Greenhouse · ${company}`,
      postedAt: j.updated_at ? String(j.updated_at) : new Date().toISOString(),
      department: Array.isArray(j.departments)
        ? String((j.departments as Array<{ name?: string }>)[0]?.name || "")
        : undefined,
    }),
  );
}

async function fetchLever(slug: string, company: string, limit: number) {
  const url = `https://api.lever.co/v0/postings/${encodeURIComponent(slug)}?mode=json`;
  const data = (await fetchJson(url)) as Array<Record<string, unknown>>;
  return (data || []).slice(0, limit).map((j) => {
    const cats = (j.categories as Record<string, string>) || {};
    return buildJob({
      id: `lever-${slug}-${j.id}`,
      title: String(j.text || ""),
      company,
      location: cats.location || "See listing",
      description: stripHtml(
        String(
          (j.descriptionPlain as string) ||
            (j.description as string) ||
            "",
        ),
      ),
      url: String(j.hostedUrl || j.applyUrl || `https://jobs.lever.co/${slug}`),
      source: `Lever · ${company}`,
      postedAt: j.createdAt
        ? new Date(Number(j.createdAt)).toISOString()
        : new Date().toISOString(),
      department: cats.department,
    });
  });
}

async function fetchAshby(slug: string, company: string, limit: number) {
  const url = `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(slug)}`;
  const data = (await fetchJson(url)) as {
    jobs?: Array<Record<string, unknown>>;
  };
  return (data.jobs || []).slice(0, limit).map((j, i) =>
    buildJob({
      id: `ashby-${slug}-${j.id || i}`,
      title: String(j.title || ""),
      company,
      location: String(j.location || "See listing"),
      description: stripHtml(String(j.descriptionPlain || j.descriptionHtml || "")),
      url: String(j.jobUrl || `https://jobs.ashbyhq.com/${slug}`),
      source: `Ashby · ${company}`,
      postedAt: j.publishedAt ? String(j.publishedAt) : new Date().toISOString(),
      department: j.department ? String(j.department) : undefined,
    }),
  );
}

async function fetchWorkday(slug: string, company: string, limit: number) {
  // slug: host/path e.g. nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite
  const cleaned = slug.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const [host, ...rest] = cleaned.split("/");
  const site = rest.join("/") || "careers";
  const url = `https://${host}/wday/cxs/${host.split(".")[0]}/${site}/jobs`;
  // Workday CXS typically wants POST; try common pattern
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "ScoutJobOS/1.0",
    },
    body: JSON.stringify({ appliedFacets: {}, limit, offset: 0, searchText: "" }),
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as {
    jobPostings?: Array<Record<string, unknown>>;
  };
  return (data.jobPostings || []).slice(0, limit).map((j, i) =>
    buildJob({
      id: `wd-${company}-${i}-${String(j.bulletFields || j.title).slice(0, 20)}`,
      title: String(j.title || ""),
      company,
      location: String(j.locationsText || "See listing"),
      description: String(j.bulletFields || ""),
      url: j.externalPath
        ? `https://${host}${j.externalPath}`
        : `https://${cleaned}`,
      source: `Workday · ${company}`,
    }),
  );
}

async function runBoard(
  board: string,
  input: z.infer<typeof InputSchema>,
): Promise<BoardResult> {
  const fetchedAt = new Date().toISOString();
  const limit = input.limit;
  try {
    let jobs: Job[] = [];
    switch (board) {
      case "remotive":
        jobs = await fetchRemotive(input.query, limit);
        break;
      case "arbeitnow":
        jobs = await fetchArbeitnow(input.query, limit);
        break;
      case "remoteok":
        jobs = await fetchRemoteOK(input.query, limit);
        break;
      case "jobicy":
        jobs = await fetchJobicy(input.query, limit);
        break;
      case "himalayas":
        jobs = await fetchHimalayas(input.query, limit);
        break;
      case "themuse":
        jobs = await fetchTheMuse(input.query, limit);
        break;
      case "weworkremotely":
        jobs = await fetchWWR(limit);
        break;
      case "adzuna":
        jobs = await fetchAdzuna(
          input.query,
          input.adzunaCountry || "us",
          input.adzunaAppId || "",
          input.adzunaAppKey || "",
          limit,
        );
        break;
      default:
        throw new Error(`Unknown board ${board}`);
    }
    return { board: board as JobBoardId, jobs, fetchedAt, label: board };
  } catch (e) {
    return {
      board: board as JobBoardId,
      jobs: [],
      fetchedAt,
      label: board,
      error: e instanceof Error ? e.message : "fetch failed",
    };
  }
}

async function runAts(target: AtsTarget, limit: number): Promise<AtsResult> {
  try {
    let jobs: Job[] = [];
    if (target.provider === "greenhouse") {
      jobs = await fetchGreenhouse(target.slug, target.company, limit);
    } else if (target.provider === "lever") {
      jobs = await fetchLever(target.slug, target.company, limit);
    } else if (target.provider === "ashby") {
      jobs = await fetchAshby(target.slug, target.company, limit);
    } else if (target.provider === "workday") {
      jobs = await fetchWorkday(target.slug, target.company, limit);
    }
    return { provider: target.provider, company: target.company, jobs };
  } catch (e) {
    return {
      provider: target.provider,
      company: target.company,
      jobs: [],
      error: e instanceof Error ? e.message : "ATS fetch failed",
    };
  }
}

export const syncJobBoards = createServerFn({ method: "POST" })
  .inputValidator(InputSchema)
  .handler(async ({ data }) => {
    const fetchedAt = new Date().toISOString();
    const boardResults = await Promise.all(
      data.boards.map((b) => runBoard(b, data)),
    );

    const atsResults: AtsResult[] = [];
    const atsStatuses: BoardResult[] = [];
    if (data.atsEnabled) {
      const targets = data.atsTargets.filter((t) => t.enabled && t.slug);
      const settled = await Promise.all(
        targets.map((t) => runAts(t, data.atsLimit || 16)),
      );
      for (const r of settled) {
        atsResults.push(r);
        atsStatuses.push({
          board: "ats",
          jobs: r.jobs,
          fetchedAt,
          label: `${r.provider} · ${r.company}`,
          error: r.error,
        });
      }
    }

    const results = [...boardResults, ...atsStatuses];
    const map = new Map<string, Job>();
    for (const r of results) {
      for (const j of r.jobs) {
        if (!map.has(j.id)) map.set(j.id, j);
      }
    }

    return {
      jobs: Array.from(map.values()),
      results,
      atsResults,
      fetchedAt,
    };
  });
