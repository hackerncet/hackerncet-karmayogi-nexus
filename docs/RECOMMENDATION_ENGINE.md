# Recommendation engine

`rankCourses` deduplicates by immutable catalogue ID and removes already-completed records when asked. It computes a mean competency priority, learner-level fit and a duration preference; unmet prerequisites receive a penalty and block joining in the demonstration UI.

`rank = .70 × mean_priority + .20 × level_fit + .10 × (1 − min(hours,40)/40) − .50 if prerequisites are unmet`.

Unknown competence uses a low candidate-retrieval priority and an explanation requesting baseline evidence. It is not labeled a proven gap. Explanations enumerate demonstrated and target levels rather than inventing a reason with an LLM. Stable ID tie-breaking makes results deterministic.

The catalogue shows both synthetic iGOT courses and synthetic NSSTA programmes, provenance, level, hours, prerequisites, delivery, eligibility and provider links. No external enrolments are submitted. The demo can join/leave courses, complete a local lesson and build a path; completions do not award proficiency.

Live course ingestion, real enrolment/completion synchronization, career-goal ranking, actual competency configuration and semantic course retrieval remain pending. pgvector currently supports document retrieval only. An authorized iGOT API contract is required before implementing real endpoints.
