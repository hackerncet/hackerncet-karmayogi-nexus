# Requirements traceability matrix

Established before implementation; updated against executed evidence. **Tested means local scope only, not hosted completion.**

S1: https://sih2026.vuce.in/ps/SIH26101 — unofficial community archive, read 27 October 2026. Official https://sih.gov.in/ returned HTTP 403. Alignment is provisional. S2: user execution brief, with Render explicitly replacing Vercel.

| ID | Source | Interpretation / planned feature and workflow | Implementation files | Database tables | Test cases / evidence | Status | Limitations |
|---|---|---|---|---|---|---|---|
| R01 | S1,S2 | /diagnostic; /assessments/[id] | `src/lib/engine.ts`; `src/components/assessment-screen.tsx`; `src/app/api/assessments/route.ts` | competency_evidence; assessment_attempts | tests/engine.test.ts; tests/rls.test.ts; e2e/journey.spec.ts | Tested | Deterministic demo and SQL grading tested; real AI competency inference and hosted acceptance unavailable. |
| R02 | S1,S2 | /skill-gaps | `src/lib/engine.ts`; `src/components/competency-screens.tsx` | competency_evidence; role_competency_requirements; score_calculation_versions | tests/engine.test.ts; e2e/journey.spec.ts | Tested | Reference survey-analyst targets; live custom framework editor/target binding pending. |
| R03 | S1,S2 | /recommendations; /learning-paths | `src/lib/engine.ts`; `src/components/learning-screens.tsx` | courses; learning_paths; enrolments | tests/engine.test.ts; e2e/journey.spec.ts | Tested | Demo enrolment/completion/path works. Live path mutations and career-goal ranking incomplete. |
| R04 | S1,S2 | /course-catalog; /admin/integrations | `src/services/integrations.ts`; `src/components/learning-screens.tsx` | integration_configs; integration_sync_runs | tests/ai-documents.test.ts | Blocked | Demo adapter tested. No authorized API contract/credentials or live sync. |
| R05 | S1,S2 | /admin/training-programmes | `src/lib/fixtures.ts`; `src/components/admin-screens.tsx` | training_programmes | e2e/journey.spec.ts | Tested | Dedicated synthetic catalogue; verified programme import/TPAC evidence not available. |
| R06 | S1,S2 | /trainer/materials; /trainer/question-bank; /trainer/assessment-builder | `src/services/documents.ts`; `src/services/ai.ts`; `src/services/isolated-document.ts`; `src/app/api/questions/route.ts`; `src/components/trainer-screens.tsx` | learning_materials; document_chunks; document_processing_jobs; question_bank; question_versions | tests/ai-documents.test.ts; tests/rls.test.ts; e2e/journey.spec.ts | Tested | Demo uses prewritten examples. Real configured AI workflow and hosted storage not verified; video needs transcript. |
| R07 | S1,S2 | /assessments/[id] | `src/app/api/assessments/route.ts`; `supabase/migrations/20261027102447_nexus_foundation.sql` | assessments; assessment_attempts; private.assessment_keys; private.attempt_keys | tests/rls.test.ts; e2e/journey.spec.ts | Tested | Server grading/deadlines/limits tested locally. Full adaptive selection and delayed-feedback policy UI absent. |
| R08 | S1,S2 | /ai-tutor | `src/services/ai.ts`; `src/app/api/tutor/route.ts`; `src/components/tutor-screen.tsx` | document_chunks; chat_messages; private.ai_request_log | tests/ai-documents.test.ts; e2e/journey.spec.ts | Implemented | Prewritten demo tested; real provider and hosted tenant retrieval not verified. Multi-chat history prompting incomplete. |
| R09 | S1,S2 | /dashboard; /my-progress; /competencies | `src/components/overview.tsx`; `src/components/competency-screens.tsx` | competency_evidence; lab_submissions | tests/engine.test.ts; e2e/journey.spec.ts | Tested | Unofficial JSON progress export and evidence timeline; no official certificate. |
| R10 | S1,S2 | /admin/analytics; /admin/impact-simulator | `src/components/admin-screens.tsx`; `src/lib/engine.ts` | workforce_scenarios; competency_evidence; memberships | tests/engine.test.ts; tests/rls.test.ts; e2e/journey.spec.ts | Tested | Synthetic workforce demo and formula simulation tested; no hosted admin dataset or forecast validation. |
| R11 | S1,S2 | /login; /signup; protected routes | `src/lib/supabase/server.ts`; `src/app/api/auth/route.ts`; `src/proxy.ts`; `supabase/migrations/20261027102447_nexus_foundation.sql`; `supabase/migrations/20261027102656_nexus_private_storage_and_vectors.sql` | profiles; memberships; storage.objects; all public RLS tables | tests/rls.test.ts; e2e/journey.spec.ts | Tested | Local RLS/guards verified. Hosted Auth/Storage/recovery/expiry tests blocked by cloud checkpoint; live role provisioning UI absent. |
| R12 | S1,S2 | /; /api/health | `next.config.ts`; `.github/workflows/ci.yml`; `docs/DEPLOYMENT.md` | integration_configs | e2e/journey.spec.ts | Tested | Source and Render demo deployed; remote CI passed 40 unit/UI/SQL + 20 browser tests. Hosted Supabase/production remain pending organization selection and further acceptance. |
| R13 | S1,S2 | All major demonstrated routes | `src/components/preferences.tsx`; `src/components/ui/primitives.tsx`; `src/app/globals.css` | profiles | tests/ui.test.tsx; e2e/journey.spec.ts | Tested | 10 page axe scans plus dark/Hindi state; 320/640px checks. Full translation, screen-reader and real zoom audits incomplete. |
| R14 | S1,S2 | /practice-labs/[id]; /my-progress | `src/lib/labs.ts`; `src/components/lab-screens.tsx`; `src/app/api/labs/route.ts` | lab_submissions; competency_evidence | tests/engine.test.ts; tests/rls.test.ts; e2e/journey.spec.ts | Tested | Four deterministic synthetic missions; no unrestricted SQL/code execution. Hosted evidence workflow not verified. |
| R15 | S1 | Government SSO | `docs/DEPLOYMENT.md` | memberships | No authorized IdP test possible | Blocked | Government identity provider, configuration and approvals absent. |

## Innovation features

Competency-to-impact lifecycle, evidence passport, statistical missions and transparent workforce scenarios: tested in the local demonstration. Exclusivity/causality is not asserted.

## External integration distinction

iGOT authorized API, verified NSSTA/TPAC import, real AI, government SSO, hosted Supabase and Render production: blocked or unverified. They are never merged into the verified-live category.

## Not fully implemented required extensions

Full framework configuration, all listed competencies, adaptive assessment, full multilingual content, cohort/role administration, live course/path mutations and unattended document processing remain partial or not implemented. See KNOWN_LIMITATIONS.md.
