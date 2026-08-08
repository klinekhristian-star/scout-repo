import type { AtsTarget } from "@/data/types";

/** Curated public board tokens — no API keys required. */
export function defaultAtsTargets(): AtsTarget[] {
  return [
    { id: "gh-stripe", provider: "greenhouse", slug: "stripe", company: "Stripe", enabled: true },
    { id: "gh-cloudflare", provider: "greenhouse", slug: "cloudflare", company: "Cloudflare", enabled: true },
    { id: "gh-discord", provider: "greenhouse", slug: "discord", company: "Discord", enabled: false },
    { id: "lv-netflix", provider: "lever", slug: "netflix", company: "Netflix", enabled: false },
    { id: "lv-figma", provider: "lever", slug: "figma", company: "Figma", enabled: true },
    { id: "as-notion", provider: "ashby", slug: "notion", company: "Notion", enabled: true },
    { id: "as-linear", provider: "ashby", slug: "linear", company: "Linear", enabled: true },
    {
      id: "wd-nvidia",
      provider: "workday",
      slug: "nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite",
      company: "NVIDIA",
      enabled: false,
    },
  ];
}
