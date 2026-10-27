# Security audit — local engineering review

This is an application review, not a penetration-test certification or government compliance assessment. No hosted system has been assessed.

## Verified locally

- Thirteen PostgreSQL-compatible tests execute RLS and constrained RPCs using PGlite, with actual authenticated/anonymous roles and an emulated Supabase auth/storage metadata schema.
- Cross-user and cross-tenant reads denied; learner score writes and membership escalation denied; user metadata cannot grant roles.
- Private question/attempt tables are inaccessible to learners; start responses omit answers/explanations/quotes. Publication and attempts freeze approved versions.
- Server/SQL grading locks attempts, rejects invalid/foreign/repeated submissions, enforces deadlines and attempt limits and records evidence only through trusted logic.
- Private storage namespace policies deny a learner upload and trainer writes to another owner’s path. Real bucket/signature behavior remains untested.
- SQL lab accepts fixed read-only fixture grammar only. Injection probes never reach application SQL.
- Same-origin HTTP guards reject a hostile origin. Input/body/file/response sizes, MIME checks, exact document signatures, bounded archive expansion and isolated parsing reduce risk.
- React renders uploaded content as text; no untrusted HTML/Markdown execution or `dangerouslySetInnerHTML` path is used. AI has no tools; retrieval respects RLS and never reads assessment keys.
- Atomic per-user AI quota, bounded tokens/timeouts and sanitized error logs are implemented. No model/provider key has been configured or committed.
- Dependency audit reported 0 known vulnerabilities. All installed versions are exact and lockfile-controlled.

## Findings addressed during review

| Issue | Resolution | Evidence |
|---|---|---|
| Published assessment could depend on later draft edits | Freeze approved payload/version at publication, then snapshot attempt | SQL version-isolation test |
| Direct client grading could fabricate evidence | Revoke direct writes; constrained SQL grading and lab rules | RLS write-denial / lab tests |
| Unbounded request decoding or office expansion | Bounded stream reads, declared/actual expansion caps and worker limits | Type/MIME/malformed/worker tests; body implementation review |
| Unknown pages streamed a success status | Proxy rejects invalid route paths with actual 404 | HTTP browser suite |
| UI remount lost the review dialog after approval | Stable editor identity | Full approval/publish browser journey |

## Remaining release risks

- **High operational release blocker:** no hosted Auth/RLS/Storage/session/cross-tenant verification has occurred. Do not ingest real workforce data yet.
- **High integration release blocker:** real government SSO/API authorization, provider privacy approval and hosted AI behavior are absent.
- **Medium:** worker memory limits cover V8 heaps, not all native allocations; this is not an OS sandbox or malware scanner. Scanned files/transcription are unavailable. Add production parser hardening and file scanning before broader untrusted-file exposure.
- **Medium:** full membership-administration workflow, account erasure, retention enforcement and auditable privileged role provisioning are not implemented in the UI. Initial trusted operator setup is required.
- **Medium:** CSP currently permits inline scripts/styles required by this initial Next.js setup. A nonce-based policy and focused XSS review remain future hardening.
- **Medium:** dependency audit is an advisory check, not exhaustive supply-chain analysis. GitHub actions are pinned to commit SHAs resolved from official release tags; remote CI has not executed. Audit provider calls before production release.
- **Medium:** login abuse/credential recovery protections rely partly on Supabase configuration and require hosted verification. No production rate-limit/load proof is claimed.

No critical/high application vulnerability was observed in the exercised local flows. That statement does not clear the operational/integration release blockers above or establish absolute security.
