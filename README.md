# Scout

Job application tracker with **ATS resume tailoring** and **designed PDF export**.

## Flow

1. Keep a **master resume** (profile, summary, skills, experience).
2. Save jobs with the full **job description**.
3. On job detail → **Tailored resume**:
   - Run ATS tailor (keyword match, reorder bullets/skills, rewrite summary framing)
   - **Generate PDF** → downloads a designed, ATS-parseable PDF for that company

## Stack

- TanStack Start + React 19 + Tailwind v4
- Zustand (local persistence in the browser)
- Client-side PDF writer (no third-party PDF service)

## Develop

```bash
npm install
npm run dev   # 0.0.0.0:8080
```

## Deploy

Built for Vercel (`nitro` preset on production build):

```bash
npm run build
```

Import this GitHub repo in [Vercel](https://vercel.com/new) and deploy. No env vars required for the demo (data is browser-local).
