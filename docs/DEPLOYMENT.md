# Deployment — Render replaces Vercel

> **Cloud update — 27 October 2026:** Source is published at https://github.com/hackerncet/hackerncet-karmayogi-nexus and the demo is live at https://karmayogi-nexus.onrender.com . Supabase project `ffmwbfqyafmnuclsyvry` is active in Mumbai. Three migrations applied; all 29 application tables have RLS; the private bucket and pgvector are configured. Hosted SQL authorization tests passed and Render has the project URL/publishable key. Successful browser sessions, confirmation/recovery emails and actual file transport remain unverified. Auth URL settings require dashboard configuration because the connector has no Auth configuration operation. Real AI remains unconfigured. See [current cloud checkpoint](CLOUD_CHECKPOINT_2026-10-27.md).

## Selected resources

Repository: `hackerncet/hackerncet-karmayogi-nexus`; Render connection `1nc24cs150`, workspace `tea-d3rm5b9r0fns73dpfkfg`, service `srv-dbg8i4vavr4c73dau0rg`; Supabase organization `kkfzdupkhmutmukrrkmb`, project `ffmwbfqyafmnuclsyvry`, Mumbai `ap-south-1`. The user explicitly selected and confirmed these resources. No unrelated resources were changed.

## First preview

1. Inspect the created repository, push the verified source non-destructively and preserve any existing README history.
2. Use one Node web service via Render’s direct-creation capability. No Render Postgres is needed.
3. Build `npm ci --include=dev && npm run build`; start `npm start`; branch `main`; bind platform `PORT`; health `/api/health`.
4. Use the current supported free preview plan if available; verify current plan docs/schema first. No paid resource has been authorized or created here. Select the confirmed workspace and appropriate region; Singapore is a proposed region for Indian users, not an already selected resource.
5. Initially omit Supabase/AI credentials. `/demo/dashboard` must work, protected routes must lead to the unconfigured-auth page, and integrations must remain labeled unavailable/demo.
6. Set exact `APP_ORIGIN` to the issued Render URL. Monitor the specific deploy to a terminal live state. Check logs and actual HTTP routes; a service-creation response alone is not success.

## Supabase checkpoint

After preview verification, list projects/organizations through the connected tools. If selection is ambiguous, obtain the intended target. Inspect existing tables before schema changes. Prefer a dedicated empty project. Apply the reviewed migrations only within that authorized scope; run advisors and the hosted authorization/storage probes afterwards.

Get the project URL and publishable key through authenticated tools, configure them as Render environment variables, and configure Auth site/redirect URLs. No service/secret key is needed for the application. Keep email confirmation enabled. Never paste private keys into chat.

Validate signup, email confirmation, login/logout, recovery, expiration, memberships, profile persistence, live lab RPCs, real Storage and assessment review/grading with separate authorized test identities. Test cross-tenant denial over the actual API. The local auth-schema simulation is not hosted-auth verification.

## Release gate

Public **synthetic demo preview** is deployed. A real workforce production rollout is blocked until known limitations, hosted tests, retention/privacy decisions, full live workflows and configured-AI validation are resolved. Do not label a demo URL as verified production completion.

No continuous extraction worker is deployed: owners explicitly process/retry durable jobs through the trainer UI. Large transcription/OCR or unrestricted code execution requires a separate approved adapter; none is silently provisioned.

## Required Auth dashboard configuration

The connected Supabase tools expose project/schema/key operations but no Auth URL configuration controls. Open https://supabase.com/dashboard/project/ffmwbfqyafmnuclsyvry/auth/url-configuration . Set Site URL to `https://karmayogi-nexus.onrender.com`. Allow the exact redirect `https://karmayogi-nexus.onrender.com/auth/callback` and recovery redirect `https://karmayogi-nexus.onrender.com/auth/callback?next=/reset-password`. Keep email confirmation enabled. These settings have not been inspected or changed through the connector. Then verify registration, confirmation, login/logout, expiry and recovery with authorized test identities. Default hosted email delivery may require project-team addresses or an approved SMTP configuration; no email delivery is claimed. See [current Supabase redirect documentation](https://supabase.com/docs/guides/auth/redirect-urls).

Reproduce negative HTTP checks with `NEXUS_CLOUD_CONFIG=/secure/path/public-config.json NEXUS_ORIGIN=https://karmayogi-nexus.onrender.com python scripts/cloud-smoke.py`; the config contains only `url` and a publishable `key`. The script never creates accounts or sends email. Run `tests/sql/hosted-authorization.sql` through the trusted SQL connection: it rolls back synthetic fixtures and tests hosted policies/RPCs.
