# Karmayogi Nexus

**From Learning to Demonstrated Competence.**

Independent SIH26101 demonstration for statistical capacity building. Not an official government service, endorsement, certification or partnership. Official SIH access returned 403; problem alignment uses the community archive provisionally.

## Current checkpoint

Source is published at https://github.com/hackerncet/hackerncet-karmayogi-nexus and the independent demonstration is live at https://karmayogi-nexus.onrender.com . Supabase project `ffmwbfqyafmnuclsyvry` is active in Mumbai, with three migrations applied, RLS on all 29 application tables, private Storage and pgvector. Hosted SQL authorization tests passed and Render environment settings are connected. Successful email/session/file workflows still require acceptance testing; Auth redirect URLs need dashboard configuration. Real AI remains unconfigured. The redesigned release passed GitHub CI (40 unit/UI/SQL + 26 browser tests). See docs/CLOUD_CHECKPOINT_2026-10-27.md.

- 40 local Vitest tests, including executed PostgreSQL RLS/RPC probes, pass at this checkpoint.
- 26 Playwright tests pass, including the complete demonstration journey, axe checks, dark/Hindi navigation, mobile reflow and access guards.
- Strict TypeScript, ESLint and production build pass.
- `npm audit` reported zero known vulnerabilities in the installed dependency graph. This is not a security certification.

The interface includes selectable competency charts, group filters, an evidence inspector, keyboard workspace search, perspective switching and course comparison. See [interface details](docs/INTERFACE_REDESIGN.md).

See [the evidence report](docs/TEST_REPORT.md), [known limitations](docs/KNOWN_LIMITATIONS.md), [requirements matrix](docs/REQUIREMENTS_MATRIX.md) and [continuation checkpoint](docs/CHECKPOINT.md). Reports distinguish local tests from live verification.

## Run locally

Node 22–24, npm. Exact dependencies and lockfile are committed.

```sh
npm ci
npm run dev
```

Open `http://localhost:3000` and select **Explore the live demo**. “Live demo” means the interactive application, not a live government integration. The demo works with no credentials. It stores synthetic actions in local browser storage, isolated from Supabase. Settings can reset it.

```sh
npm run check
npx playwright install --with-deps chromium
npm run test:e2e
```

If browser-download access is unavailable on Linux, `npm run test:browser:bundled` uses the pinned npm Chromium bundle. This is a test dependency, not production infrastructure.

## Architecture

Next.js App Router, React, strict TypeScript, Tailwind, shadcn-style primitives with Radix, React Hook Form/Zod, Recharts with accessible tables. Route handlers use caller-scoped Supabase SSR sessions. PostgreSQL RLS and constrained RPCs protect grades, roles, private documents and organizational boundaries. There is no service-role key in this application.

Scoring and statistical labs are deterministic. AI is optional for document-grounded draft generation and tutoring. Document extraction runs in a worker with memory/time limits and durable job records. This is not an OS sandbox or malware scanner.

## Database setup — select a dedicated project first

Do not apply migrations to an unrelated project. After the early Render preview, discover accessible Supabase projects and select a new/explicitly authorized target. Review and apply all three migrations in order. See [database schema](docs/DATABASE_SCHEMA.md) and [deployment](docs/DEPLOYMENT.md).

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Set `APP_ORIGIN` to the public app origin; on Render, the app can fall back to Render's `RENDER_EXTERNAL_URL`. Supabase Auth must have email confirmation enabled and the same site/callback/recovery URLs allowlisted. Government SSO is not configured. New accounts receive an isolated learner membership; organization reassignment and privileged-role provisioning require a trusted operator.

The demo fixture seed is application-only. Migrations seed reference competencies and scoring rules; they do not insert fabricated employees into a real organization.

## Render deployment

Deploy a **Node web service**, not a static site. Build: `npm ci --include=dev && npm run build`. Start: `npm start`. The start script binds `0.0.0.0` and Render’s `PORT`. Health: `/api/health`.

Repository: `hackerncet/hackerncet-karmayogi-nexus` (public, supplied by the user). Render: `1nc24cs150` / `My Workspace`, free Node service in Oregon. Supabase project `ffmwbfqyafmnuclsyvry` is connected in Mumbai. Auth URL configuration and successful account-flow acceptance remain pending. Never include keys in chat or commits.

## AI configuration

For a zero-cost OpenRouter setup, add the secret `OPENROUTER_API_KEY` in Render and set `LLM_BASE_URL=https://openrouter.ai/api/v1` and `LLM_MODEL=openrouter/free`. The free router selects an available free model that supports requested features such as JSON output; free usage has request limits and upstream availability can vary. `LLM_API_KEY` remains supported as a generic compatible-provider alias. Leave `EMBEDDING_MODEL` unset for lexical retrieval and avoid embedding charges. AI keys are server-side only; never use a `NEXT_PUBLIC_` name. Real generation stays unavailable until both a key and model are configured. Demonstration examples are explicitly prewritten.

## Source layout

`src/app`: routes and authenticated APIs. `src/components`: screens and design primitives. `src/lib`: scoring, fixtures, validation and SSR session helpers. `src/services`: AI, document, integration and snapshot adapters. `supabase/migrations`: schema/RLS/RPCs/storage/vector support. `tests`: domain, UI and real SQL tests. `e2e`: browser journeys. `docs`: decisions, evidence and release limits.
