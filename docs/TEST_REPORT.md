# Test execution report

> **Cloud update — 27 October 2026:** Source is published at https://github.com/hackerncet/hackerncet-karmayogi-nexus and the demo is live at https://karmayogi-nexus.onrender.com . Supabase project `ffmwbfqyafmnuclsyvry` is active in Mumbai. Three migrations applied; all 29 application tables have RLS; the private bucket and pgvector are configured. Hosted SQL authorization tests passed and Render has the project URL/publishable key. Successful browser sessions, confirmation/recovery emails and actual file transport remain unverified. Auth URL settings require dashboard configuration because the connector has no Auth configuration operation. Real AI remains unconfigured. See [current cloud checkpoint](CLOUD_CHECKPOINT_2026-10-27.md).

Checkpoint date: 27 October 2026. Environment: Linux container, Node 24.22.1, npm 11.9.0; application Next.js 16.4.3 / React 19.3.1 / TypeScript 6.0.3. Local, remote CI and scoped hosted tests are distinguished below.

| Check | Actual result | Limits |
|---|---|---|
| ESLint with zero warnings | Passed | Static rules, not complete correctness proof |
| Strict TypeScript | Passed | Runtime/external data still requires validation |
| Vitest | 40 passed, 4 files | Includes 13 SQL policy/RPC tests, domain/AI/document and UI tests |
| Production Next build | Passed | No cloud secrets/database used during build |
| Playwright | 20 passed | Local production server, pinned npm Chromium fallback |
| axe | No violations on 10 pages plus Hindi/dark state | Automated sample, not full WCAG conformance |
| Dependency audit | 0 known vulnerabilities | Advisory snapshot only |
| GitHub Actions | Recorded release passed 40 Vitest + 20 Playwright, lint, types and build | Release-specific CI URL in current checkpoint |
| Render deploy | Free Node demo live; Supabase environment deployment live | Completed workforce production not claimed |
| Supabase hosted integration | Three migrations, 29 RLS tables and rolled-back authorization/RPC/vector/Storage-metadata tests passed | Successful sessions, emails and actual object bytes pending |
| Real LLM/embedding calls | Not executed | Provider credentials/model not configured |

Unit/domain tests cover unknown/training-only/future/conflicting evidence, range validation, scoring weights, ranking determinism/prerequisites/duplicates, MCQ option validation and answer redaction, independent mission answer keys, constrained SQL probes, simulation formulas/bounds, source/schema/dedup validation, missing AI credentials, provider failure, malformed/MIME/size/empty documents, bounded extraction and source-location preservation.

The SQL harness executes the complete foundation and quota/history migrations plus the Storage policy portion of migration two. Auth and Storage metadata are emulated. In that local harness pgvector and actual Auth/Storage transport are not tested. The subsequent hosted SQL suite additionally passed pgvector and real Storage metadata-policy checks; actual Auth/Storage transport remains unverified. Tests verify RLS for all public tables, metadata escalation denial, cross-tenant access, protected keys, storage namespaces, approval gates, frozen publication, replay prevention, deadlines/limits, DB lab grading, small-cohort suppression and quota enforcement.

The browser journey completes diagnostics, gaps, recommendations, path joining, lesson completion, practical evidence, trainer review/approval/publication, learner quiz, progress comparison, workforce aggregates and impact simulation. Additional tests cover TXT upload, honest unavailable-AI response, chat clearing, resumable answers, search/filtering, dialogs, dark/Hindi UI, mobile reflow, route guards and 404s.

First runs found and fixed answer restoration, dialog remount and 404 issues. The Playwright CDN download was truncated in this environment; the pinned npm Chromium bundle provided a working browser. A serverless `--single-process` flag caused browser lifecycle failures and was removed. These initial failures are not reported as passing tests.

No load, multi-region, disaster-recovery, external SSO, live email, real workforce-data, government API or deployed performance testing has occurred. Local navigation observations are not Core Web Vitals or scalability evidence.

## Post-connection checks

`tests/sql/hosted-authorization.sql` passed on project `ffmwbfqyafmnuclsyvry`. All fixture changes were rolled back; follow-up counts showed zero users, organizations and evidence. Hosted security advisor had zero findings. Initial negative HTTP checks passed 8/9: the dashboard streamed a login redirect with HTTP 200. A request-proxy redirect and raw HTTP regression were added; initial failing evidence is preserved in `evidence/supabase-cloud-http-initial.json`. Revised code must pass CI/deployment and repeated smoke tests before reporting that issue resolved on the public URL.

Local repeated Next builds encountered an invalid persistent Turbopack cache. Moving the cache out of the project enabled a successful fresh build; this is an environment/build artifact issue, not evidence of successful cloud functionality.

The changed-source local regression completed successfully: production build passed after preserving the invalid cache, lint and strict types passed, all 40 Vitest tests passed, and all 20 Playwright tests passed in 58.2 seconds, including the new raw HTTP 307 assertions. Hosted successful session/email/file acceptance remains pending.

Updated runtime `5e1f2d05a815b58f32e20774745bddafee437a9d`: GitHub CI [40504357255](https://github.com/hackerncet/hackerncet-karmayogi-nexus/actions/runs/40504357255) succeeded, with log-confirmed 40 Vitest and 20 browser tests. Render deploy `dep-dbg9ivi9lscs7394jcb0` is live. All nine repeated configuration/negative HTTP probes passed; the initial streamed redirect issue is resolved on the deployed URL. Successful Auth sessions, mail and file transport remain pending.

The deployed-browser checks also passed: configuration status panel, enabled configured signup form, raw 307 guards for learner/trainer/admin, and the complete synthetic competency-to-impact journey. Two tests passed in 1.2 minutes (32.5s and 35.5s). No actual user signup/email was performed. The interception-certificate test caveat above applies.
