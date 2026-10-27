# Architecture

One Next.js Node web service on Render; Supabase provides Auth, PostgreSQL, private Storage and optional pgvector retrieval. GitHub stores source and CI. No Render database, Redis, Python service or Docker infrastructure is required.

Public server-rendered homepage → isolated `/demo/*` client workspace. Browser local storage contains only synthetic demonstration state. Demo handlers cannot mutate cloud records.

Authenticated routes → SSR `getUser()` verification → server-controlled membership lookup → role check → caller-scoped Supabase client → RLS. All client-owned profiles are descriptive, never authorization inputs. Multiple memberships fail closed until workspace selection is implemented.

Assessment publication freezes approved questions in private tables. Starting an attempt snapshots that version and returns an explicit public projection. Saving responses and grading happen through constrained, locking RPCs. Learners have no direct score/evidence write grant. Lab evaluation is independently implemented in TypeScript and SQL; neither executes learner SQL.

Trainer upload → byte/MIME checks → private storage → durable processing record → explicitly invoked bounded extraction worker → located chunks → optional embeddings → draft question generation → schema/excerpt validation → trainer review → publication. Jobs have status, retry cap, lock and heartbeat. A continuous background runner is not deployed; an authorized owner processes/retries from the UI. Embedding indexing is limited to 100 chunks per file for cost; lexical processing can handle more.

Tutor retrieval uses the caller’s RLS visibility over chunks. It never reads question/attempt answer keys. LLM calls have no tools and treat source text as untrusted data. Twenty requests per user/hour are enforced atomically in PostgreSQL. This reduces abuse; it does not prove immunity to prompt injection.

React screens use shared UI primitives. Trainer/admin screens load dynamically; charts include data tables. Server snapshot queries run concurrently. Further server-side pagination, framework editors, live course workflows and cohort assignment remain in the backlog.
