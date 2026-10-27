# Deployment — Render replaces Vercel

> **Cloud update — 27 October 2026:** Source is now published at https://github.com/hackerncet/hackerncet-karmayogi-nexus and the independent demonstration is live at https://karmayogi-nexus.onrender.com . Render account `1nc24cs150`, workspace `My Workspace`, free Node service. Supabase tools list no projects and one organization (`1nc24cs150@ncetmail.com's Org`). Project creation awaits the organization choice required by the Supabase tool. No database or AI connection is claimed. See [current cloud checkpoint](CLOUD_CHECKPOINT_2026-10-27.md). Earlier repository/account blockers below are historical and superseded.

No remote repository, Render preview or production deployment exists at this checkpoint. No URLs are invented.

## Access blockers

GitHub login is `hackerncet`. Nine accessible repositories were inspected; none is relevant. The GitHub connector exposes file/tree/commit/branch operations but no repository creation. Do not reuse or overwrite an unrelated repository. Smallest action: create private `hackerncet/karmayogi-nexus` initialized with README and grant the connector access.

Render has three account connections: **Render**, **Primary**, **1nc24cs150**. Tool instructions require the intended account to be selected when multiple accounts can satisfy a write. No workspace was queried or switched without that choice. After account selection, list workspaces and confirm the intended workspace before service creation, following the [Render skill](skill://plugin_asdk_app_6a624c56bfe081918f7544f7d58f6faf/render-deploy/SKILL.md).

Supabase tools are present. The user requires the first deployment before cloud-database selection. Since preview publication is blocked, no project enumeration, project creation, cloud migration or unrelated-data operation has been attempted. Do not ask the user to reconnect Supabase unnecessarily.

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

Public **synthetic demo preview** may be deployed once repository/account access is resolved. A real workforce production rollout is blocked until known limitations, hosted tests, retention/privacy decisions, full live workflows and configured-AI validation are resolved. Do not label a demo URL as verified production completion.

No continuous extraction worker is deployed: owners explicitly process/retry durable jobs through the trainer UI. Large transcription/OCR or unrestricted code execution requires a separate approved adapter; none is silently provisioned.
