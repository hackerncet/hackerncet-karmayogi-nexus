# Karmayogi Nexus

**From Learning to Demonstrated Competence.**

Independent SIH26101 demonstration for statistical capacity building. Not an official government service, endorsement, certification or partnership. Official SIH access returned 403; problem alignment uses the community archive provisionally.

## Current checkpoint

Source is published at https://github.com/hackerncet/hackerncet-karmayogi-nexus and the independent demonstration is live at https://karmayogi-nexus.onrender.com . Supabase project `ffmwbfqyafmnuclsyvry` is active in Mumbai, with three migrations applied, RLS on all 29 application tables, private Storage and pgvector. Hosted SQL authorization tests passed and Render environment settings are connected. Successful email/session/file workflows still require acceptance testing; Auth redirect URLs need dashboard configuration. Real AI remains unconfigured. The deployed release passed GitHub CI (40 unit/UI/SQL + 20 browser tests). See docs/CLOUD_CHECKPOINT_2026-10-27.md.

- 40 local Vitest tests, including executed PostgreSQL RLS/RPC probes, pass at this checkpoint.
- 20 Playwright tests pass, including the complete demonstration journey, axe checks, dark/Hindi navigation, mobile reflow and access guards.
- Strict TypeScript, ESLint and production build pass.
- `npm audit` reported zero known vulnerabilities in the installed dependency graph. This is not a security certification.

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

Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and the exact `APP_ORIGIN`. Supabase Auth must have email confirmation enabled and correct site/callback/recovery URLs. Government SSO is not configured. New accounts receive an isolated learner membership; organization reassignment and privileged-role provisioning require a trusted operator.

The demo fixture seed is application-only. Migrations seed reference competencies and scoring rules; they do not insert fabricated employees into a real organization.

## Render deployment

Deploy a **Node web service**, not a static site. Build: `npm ci --include=dev && npm run build`. Start: `npm start`. The start script binds `0.0.0.0` and Render’s `PORT`. Health: `/api/health`.

Repository: `hackerncet/hackerncet-karmayogi-nexus` (public, supplied by the user). Render: `1nc24cs150` / `My Workspace`, free Node service in Oregon. Supabase project `ffmwbfqyafmnuclsyvry` is connected in Mumbai. Auth URL configuration and successful account-flow acceptance remain pending. Never include keys in chat or commits.

## AI configuration

Use server-side `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL`; optional `EMBEDDING_MODEL` must support 1,536-dimensional embeddings. The compatible endpoint must support JSON chat completions and `max_completion_tokens`. Real generation returns unavailable when credentials are missing. Demonstration examples are explicitly prewritten.

## Source layout

`src/app`: routes and authenticated APIs. `src/components`: screens and design primitives. `src/lib`: scoring, fixtures, validation and SSR session helpers. `src/services`: AI, document, integration and snapshot adapters. `supabase/migrations`: schema/RLS/RPCs/storage/vector support. `tests`: domain, UI and real SQL tests. `e2e`: browser journeys. `docs`: decisions, evidence and release limits.
