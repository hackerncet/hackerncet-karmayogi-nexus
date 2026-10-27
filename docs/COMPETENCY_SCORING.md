# Competency scoring v1

Source of truth: `src/lib/engine.ts`; rule ID `nexus-weighted-evidence-v1`. Proposed rules, not validated government standards.

For eligible diagnostic/practice/post-assessment evidence, `weight = confidence × 0.5^(age_days / 180)`. Training-only, future-dated and zero-confidence records do not establish current proficiency. The weighted level is rounded to two decimals. No usable evidence means **unknown**, not zero.

Confidence is mean recency-adjusted evidence weight, capped at 0.95. Evidence levels differing by at least two points apply a 0.75 confidence multiplier. This is a transparent heuristic, not a calibrated statistical probability. Repeated practice is not an independent randomized evaluation.

`gap = max(0, target − current)`; unknown current → unknown gap.

`priority = 0.40 × gap/5 + 0.25 × role_importance + 0.20 × department_priority + 0.15 × prerequisite_relevance`.

Each context factor ranges 0–1; levels range 0–5. Configuration lives in the versioned source and reference database rule record. A live admin weight editor is not implemented. The current UI uses the demonstration survey-analyst reference framework; the custom live-framework table is not yet wired to targets.

Question evidence level = five times fraction correct for that competency. Confidence = `min(0.85, 0.30 + 0.08 × question_count)`. A one/two-question estimate has limited coverage. Labs use documented deterministic rules and confidence 0.6. These learning signals do not establish official mastery or certification.

History preserves source, timestamp, type and rule version. Before/after screens distinguish observed estimates from causal impact. Unit and SQL tests cover boundaries, missing/conflicting/future evidence and trusted grading.
