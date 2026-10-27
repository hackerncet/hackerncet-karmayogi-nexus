# Database schema

Migrations were created with Supabase CLI 2.122.0. No cloud migration has been applied.

| Area | Tables | Access |
|---|---|---|
| Identity | organizations, departments, profiles, memberships | Personal profile only; memberships readable only by their user; memberships never client-writable |
| Framework | competency_frameworks, competencies, role_competency_requirements, score_calculation_versions | Authenticated reference reads; org membership for org frameworks |
| Evidence | competency_evidence | Owner reads; only constrained grading/lab RPCs write |
| Learning | courses, course_competencies, enrolments, training_programmes, learning_paths, learning_path_items | RLS protected; most live course/path mutations not implemented |
| Documents | learning_materials, document_chunks, document_processing_jobs | Trainer ownership; explicitly published learning text can be visible to org members |
| Questions | question_bank, question_versions | Owner trainers only; version history trigger |
| Assessment | assessments, assessment_attempts | Org catalogue/own attempts; RPC-only attempt writes |
| Practical | lab_submissions | Own records; server/SQL evaluation only |
| Assistance | chat_sessions, chat_messages | Own messages; chat_sessions reserved for multi-session expansion |
| Planning | workforce_scenarios | Authorized admin saves; own scenario reads |
| Operations | integration_configs, integration_sync_runs, audit_logs | Authorized platform admin org reads; no credentials stored here |
| Private | assessment_keys, attempt_keys, ai_request_log | Not exposed by Data API; no direct authenticated table grants |

All public application tables enable RLS. Explicit grants and policies are separate. Private security-definer functions check identity/role, use an empty search path and are not directly exposed through the API schema. Public wrappers are security invoker. The auth bootstrap and history triggers are non-RPC functions with revoked client execution.

Composite department/org foreign keys prevent mismatched memberships. UUIDs, competency keys, uniqueness and numeric range checks constrain stored records. User/date, org/competency and attempt indexes support principal queries. Vector search initially uses exact nearest-neighbor search; no HNSW benefit is claimed without corpus benchmarks.

Private bucket `learning-materials` permits at most 10 MiB and approved MIME types. Object namespaces begin with the authenticated owner UUID. Local storage-policy tests emulate Supabase’s storage metadata schema; they do not exercise the hosted Storage service.

Reference competency/rule inserts are idempotent. Synthetic officers/courses live in application fixtures, never mixed into real employee records. Retention automation, user erasure, framework lifecycle and all suggested optional tables are not complete.
