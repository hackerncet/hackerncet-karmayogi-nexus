# Current cloud checkpoint — 27 October 2026

## Selected resources

- Source: https://github.com/hackerncet/hackerncet-karmayogi-nexus (user-supplied public repository).
- Public synthetic demo: https://karmayogi-nexus.onrender.com/demo/dashboard . This is not a completed workforce production release.
- Render connection `1nc24cs150`, workspace `My Workspace` / `tea-d3rm5b9r0fns73dpfkfg`, free Node service `srv-dbg8i4vavr4c73dau0rg` in Oregon.
- Supabase organization `kkfzdupkhmutmukrrkmb` / `1nc24cs150@ncetmail.com's Org`, confirmed by the user. Dedicated project `karmayogi-nexus` / `ffmwbfqyafmnuclsyvry`, Mumbai `ap-south-1`, status `ACTIVE_HEALTHY`.

## Executed after organization confirmation

The project-creation call completed without requiring a nonzero-cost confirmation. The dedicated project's public schema was empty before migrations. All three version-controlled migrations applied successfully. The database has 29 application tables with RLS, eight reference competencies, scoring version `nexus-weighted-evidence-v1`, a private 10 MiB `learning-materials` bucket with MIME restrictions, and pgvector 0.8.2 / 1,536-dimensional retrieval.

The project URL and modern publishable key were obtained through the authenticated connector and merged into Render environment variables. No secret or service-role key is used. Render's resulting deployment `dep-dbg9cua9lscs739e3cn0` reached `live` on source commit `b59afcb27fa263fe79a80496d79b21fa436227ad`. Public `/api/health` returned HTTP 200 and `databaseConfigured=true`, `aiConfigured=false`. Configuration health is not successful user-session acceptance.

The rolled-back `tests/sql/hosted-authorization.sql` passed on actual hosted PostgreSQL. It exercised tenant/user isolation, metadata privilege denial, protected keys, owner and cross-owner Storage metadata policies, owner-scoped pgvector retrieval, trusted statistical lab grading, draft approval gate, publication snapshots, answer redaction, option validation, cross-user grading denial, replay prevention, persisted assessment evidence and AI request quotas. This tests database policies and RPCs, not email delivery or actual Storage file bytes. Fixtures were rolled back; a subsequent SQL query confirmed zero retained auth users, organizations and evidence.

Supabase security advisor returned zero findings. Performance advisor reported four overlapping permissive SELECT-policy warnings, 29 missing foreign-key index notices, a missing private-rate-log primary key and expected unused-index notices on the empty project. See SECURITY_AUDIT.md for remediation links and remaining limitations.

## Deployment verification and regression fix

The earlier release `22347c1785895426e00742e5d7439447f85d2431` passed GitHub CI: 40 unit/UI/SQL and 20 browser tests, lint, strict types and production build. CI: https://github.com/hackerncet/hackerncet-karmayogi-nexus/actions/runs/40496429184 . The complete synthetic journey also passed on the public URL. That browser used the environment's egress proxy and ignored its browser-specific interception certificate; independent curl HTTPS checks verified normally. This is not an external TLS assessment.

Initial post-database HTTP probes passed eight of nine checks. The private dashboard returned a streamed HTTP 200 containing a login redirect instead of an HTTP 307. No private record was returned. The proxy now redirects unauthenticated workspace requests before rendering and preserves refreshed cookies. A raw-HTTP regression assertion was added for learner, trainer and admin routes. The integration-status panel now checks deployment configuration instead of displaying a stale hardcoded database-pending label. Final release/deployment and repeated smoke evidence must be recorded after execution; do not relabel the initial failing probe as passed.

A local Next build first failed because its existing Turbopack cache was invalid. Preserving that cache outside the repository and rebuilding resolved the failure. Static types, lint and all 40 Vitest tests passed. The changed-source build, lint and strict types passed, and all 20 local browser tests passed in 58.2 seconds, including raw HTTP redirect checks. Remote CI/deployment must still be recorded for this revision.

## Required external step

Supabase tools have no Auth configuration operation. Site/callback/recovery URLs have not been inspected or changed. Open https://supabase.com/dashboard/project/ffmwbfqyafmnuclsyvry/auth/url-configuration and configure:

1. Site URL: `https://karmayogi-nexus.onrender.com`
2. Allowed callback: `https://karmayogi-nexus.onrender.com/auth/callback`
3. Allowed recovery callback: `https://karmayogi-nexus.onrender.com/auth/callback?next=/reset-password`

Keep email confirmation enabled (public Auth settings currently report email enabled, signup enabled, autoconfirm false). Verify successful registration, confirmation, sign-in/out, expiry, recovery and two-identity cross-tenant API behavior afterwards. Default hosted mail restrictions or an approved SMTP provider may need configuration. Do not request private keys in chat, disable verification to hide the blocker, or grant public administrative roles.

Real AI credentials/models, authorized iGOT APIs, verified NSSTA TPAC records and government SSO remain unavailable. Live role/cohort/framework administration, course/path writes, complete Hindi content, retention/erasure, unattended document processing and other limitations in KNOWN_LIMITATIONS.md still require work. The full definition of done is not satisfied.
