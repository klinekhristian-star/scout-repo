/**
 * Heuristic: keep jobs that look US-based (or unrestricted US remote).
 * Drops explicit non-US countries/regions.
 */

const NON_US =
  /\b(united kingdom|uk\b|england|scotland|wales|ireland|eu\b|europe|emea|apac|asia|india|canada|ontario|toronto|vancouver|mexico|germany|france|spain|italy|netherlands|amsterdam|berlin|paris|london|sydney|australia|new zealand|singapore|japan|china|brazil|latam|latin america|africa|nigeria|kenya|philippines|poland|sweden|norway|denmark|finland|switzerland|austria|belgium|portugal|greece|israel|uae|dubai|saudi)\b/i;

const US_HINT =
  /\b(united states|u\.s\.a\.?|usa\b|u\.s\b|\bus only\b|\bremote[-\s]?us\b|\bus remote\b|\banywhere in the us\b|\bnationwide\b)\b/i;

const US_STATES =
  /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC|Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming|District of Columbia)\b/;

const US_CITIES =
  /\b(New York|Los Angeles|Chicago|Houston|Phoenix|Philadelphia|San Antonio|San Diego|Dallas|San Jose|Austin|Jacksonville|Fort Worth|Columbus|Charlotte|San Francisco|Indianapolis|Seattle|Denver|Boston|Nashville|Detroit|Portland|Las Vegas|Memphis|Louisville|Baltimore|Milwaukee|Albuquerque|Tucson|Fresno|Sacramento|Mesa|Kansas City|Atlanta|Miami|Oakland|Minneapolis|Tampa|New Orleans|Cleveland|Honolulu|Charleston|Raleigh|Richmond|Orlando)\b/i;

export function isUsJobLocation(location: string, extraText = ""): boolean {
  const blob = `${location || ""} ${extraText || ""}`.trim();
  if (!blob) return true;

  const lower = blob.toLowerCase();

  if (NON_US.test(blob) && !US_HINT.test(blob) && !US_STATES.test(blob)) {
    return false;
  }

  if (US_HINT.test(blob) || US_STATES.test(blob) || US_CITIES.test(blob)) {
    return true;
  }

  if (
    /\b(remote|work from home|wfh|hybrid|anywhere)\b/i.test(lower) &&
    !NON_US.test(blob)
  ) {
    return true;
  }

  if (/,\s*[A-Z]{2}\b/.test(blob) && US_STATES.test(blob)) return true;

  if (/\b(remote|hybrid|anywhere)\b/i.test(lower)) return true;
  return false;
}

export function filterUsJobs<
  T extends { location: string; description?: string },
>(jobs: T[]): T[] {
  return jobs.filter((j) => isUsJobLocation(j.location, j.description ?? ""));
}
