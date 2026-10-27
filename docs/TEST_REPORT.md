# Test execution report

> **Cloud update — 27 October 2026:** Source is now published at https://github.com/hackerncet/hackerncet-karmayogi-nexus and the independent demonstration is live at https://karmayogi-nexus.onrender.com . Render account `1nc24cs150`, workspace `My Workspace`, free Node service. Supabase tools list no projects and one organization (`1nc24cs150@ncetmail.com's Org`). Project creation awaits the organization choice required by the Supabase tool. No database or AI connection is claimed. See [current cloud checkpoint](CLOUD_CHECKPOINT_2026-10-27.md). Earlier repository/account blockers below are historical and superseded.

Checkpoint date: 27 October 2026. Environment: Linux container, Node 24.22.1, npm 11.9.0; application Next.js 16.4.3 / React 19.3.1 / TypeScript 6.0.3. Local tests only.

| Check | Actual result | Limits |
|---|---|---|
| ESLint with zero warnings | Passed | Static rules, not complete correctness proof |
| Strict TypeScript | Passed | Runtime/external data still requires validation |
| Vitest | 40 passed, 4 files | Includes 13 SQL policy/RPC tests, domain/AI/document and UI tests |
| Production Next build | Passed | No cloud secrets/database used during build |
| Playwright | 20 passed | Local production server, pinned npm Chromium fallback |
| axe | No violations on 10 pages plus Hindi/dark state | Automated sample, not full WCAG conformance |
| Dependency audit | 0 known vulnerabilities | Advisory snapshot only |
| GitHub Actions | Workflow authored, not run remotely | Remote repository absent |
| Render deploy | Not executed | Repository and account selection blocked |
| Supabase hosted integration | Not executed | User-mandated post-preview checkpoint not reached |
| Real LLM/embedding calls | Not executed | Provider credentials/model not configured |

Unit/domain tests cover unknown/training-only/future/conflicting evidence, range validation, scoring weights, ranking determinism/prerequisites/duplicates, MCQ option validation and answer redaction, independent mission answer keys, constrained SQL probes, simulation formulas/bounds, source/schema/dedup validation, missing AI credentials, provider failure, malformed/MIME/size/empty documents, bounded extraction and source-location preservation.

The SQL harness executes the complete foundation and quota/history migrations plus the Storage policy portion of migration two. Auth and Storage metadata are emulated. pgvector extension/search and actual Supabase Auth/Storage transport are **not tested**. Tests verify RLS for all public tables, metadata escalation denial, cross-tenant access, protected keys, storage namespaces, approval gates, frozen publication, replay prevention, deadlines/limits, DB lab grading, small-cohort suppression and quota enforcement.

The browser journey completes diagnostics, gaps, recommendations, path joining, lesson completion, practical evidence, trainer review/approval/publication, learner quiz, progress comparison, workforce aggregates and impact simulation. Additional tests cover TXT upload, honest unavailable-AI response, chat clearing, resumable answers, search/filtering, dialogs, dark/Hindi UI, mobile reflow, route guards and 404s.

First runs found and fixed answer restoration, dialog remount and 404 issues. The Playwright CDN download was truncated in this environment; the pinned npm Chromium bundle provided a working browser. A serverless `--single-process` flag caused browser lifecycle failures and was removed. These initial failures are not reported as passing tests.

No load, multi-region, disaster-recovery, external SSO, live email, real workforce-data, government API or deployed performance testing has occurred. Local navigation observations are not Core Web Vitals or scalability evidence.
