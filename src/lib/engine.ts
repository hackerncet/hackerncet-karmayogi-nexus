import { z } from "zod";
import type { Competency, Course, Evidence, Question, Score } from "./types";
export const SCORING_VERSION = "nexus-weighted-evidence-v1";
export const weights = {
  gap: 0.4,
  importance: 0.25,
  department: 0.2,
  prerequisite: 0.15,
};
const unit = z.number().min(0).max(1);
const evidenceSchema = z.object({
  level: z.number().min(0).max(5),
  confidence: unit,
  date: z.iso.datetime(),
});
export function scoreCompetencies(
  competencies: Competency[],
  evidence: Evidence[],
  now = new Date(),
): Score[] {
  return competencies.map((competency) => {
    z.number().min(0).max(5).parse(competency.target);
    [
      competency.importance,
      competency.departmentPriority,
      competency.prerequisiteRelevance,
    ].forEach((x) => unit.parse(x));
    const matching = evidence.filter(
      (e) => e.competencyId === competency.id && e.kind !== "training",
    );
    matching.forEach((e) => evidenceSchema.parse(e));
    const usable = matching.filter(
      (e) => e.confidence > 0 && new Date(e.date) <= now,
    );
    const terms = usable.map((e) => ({
      e,
      w:
        e.confidence *
        Math.pow(
          0.5,
          Math.max(0, (now.getTime() - new Date(e.date).getTime()) / 86400000) /
            180,
        ),
    }));
    const total = terms.reduce((s, t) => s + t.w, 0);
    const current =
      total > 0
        ? Math.round(
            (terms.reduce((s, t) => s + t.e.level * t.w, 0) / total) * 100,
          ) / 100
        : null;
    const conflict =
      usable.length > 1 &&
      Math.max(...usable.map((e) => e.level)) -
        Math.min(...usable.map((e) => e.level)) >=
        2;
    const confidence =
      total > 0
        ? Math.min(0.95, total / Math.max(1, terms.length)) *
          (conflict ? 0.75 : 1)
        : 0;
    const gap =
      current === null ? null : Math.max(0, competency.target - current);
    const priority =
      gap === null
        ? null
        : (weights.gap * gap) / 5 +
          weights.importance * competency.importance +
          weights.department * competency.departmentPriority +
          weights.prerequisite * competency.prerequisiteRelevance;
    return {
      competency,
      current,
      confidence,
      gap,
      priority,
      evidence: matching,
      conflict,
      ruleVersion: SCORING_VERSION,
    };
  });
}
export function rankCourses(
  courses: Course[],
  scores: Score[],
  completed: string[] = [],
) {
  return [...new Map(courses.map((c) => [c.id, c])).values()]
    .filter((c) => !completed.includes(c.id))
    .map((course) => {
      const matched = scores.filter((s) =>
        course.competencyIds.includes(s.competency.id),
      );
      const blocked = course.prerequisites.filter(
        (p) =>
          (scores.find((s) => s.competency.id === p.id)?.current ?? -1) <
          p.level,
      );
      const priority =
        matched.reduce((s, c) => s + (c.priority ?? 0.2), 0) /
        Math.max(1, course.competencyIds.length);
      const levelFit =
        matched.reduce(
          (s, c) =>
            s +
            (c.current === null
              ? 0.5
              : 1 - Math.min(5, Math.abs(course.level - (c.current + 1))) / 5),
          0,
        ) / Math.max(1, matched.length);
      const rank =
        0.7 * priority +
        0.2 * levelFit +
        0.1 * (1 - Math.min(course.hours, 40) / 40) -
        (blocked.length ? 0.5 : 0);
      return {
        course,
        rank,
        blocked,
        reason: matched
          .map((s) =>
            s.current === null
              ? `${s.competency.name}: collect baseline evidence first`
              : `${s.competency.name}: demonstrated ${s.current}/5, role target ${s.competency.target}/5`,
          )
          .join("; "),
      };
    })
    .sort((a, b) => b.rank - a.rank || a.course.id.localeCompare(b.course.id));
}
export function grade(
  questions: Question[],
  responses: Record<string, number[]>,
) {
  const unexpected = Object.keys(responses).filter(
    (id) => !questions.some((q) => q.id === id),
  );
  if (unexpected.length) throw new Error("Unknown question identifier");
  const results = questions.map((q) => {
    const selected = responses[q.id] ?? [];
    if (
      new Set(selected).size !== selected.length ||
      selected.some(
        (x) => !Number.isInteger(x) || x < 0 || x >= q.options.length,
      )
    )
      throw new Error("Invalid answer option");
    const correct =
      [...selected].sort().join(",") === [...q.answer].sort().join(",");
    return {
      questionId: q.id,
      competencyId: q.competencyId,
      correct,
      explanation: q.explanation,
      answer: q.answer,
    };
  });
  return {
    score: results.length
      ? Math.round(
          (results.filter((r) => r.correct).length / results.length) * 100,
        )
      : 0,
    results,
  };
}
export const scenarioSchema = z.object({
  population: z.number().int().min(1).max(1000000),
  participation: unit,
  completion: unit,
  effectiveness: unit,
  hours: z.number().min(0).max(2000),
  baselineCoverage: unit,
});
export function simulate(input: z.infer<typeof scenarioSchema>) {
  const s = scenarioSchema.parse(input);
  return (
    [
      ["Conservative", 0.75],
      ["Baseline", 1],
      ["Best case", 1.2],
    ] as const
  ).map(([name, factor]) => {
    const participants = Math.round(s.population * s.participation);
    const completers = Math.round(participants * s.completion);
    const covered = Math.min(
      s.population,
      s.population * s.baselineCoverage +
        completers *
          Math.min(1, s.effectiveness * factor) *
          (1 - s.baselineCoverage),
    );
    return {
      name,
      participants,
      completers,
      hours: participants * s.hours,
      coverage: covered / s.population,
      remaining: Math.ceil(s.population - covered),
      assumption: Math.min(1, s.effectiveness * factor),
    };
  });
}
export function publicQuestions(questions: Question[]) {
  return questions.map(
    ({
      id,
      stem,
      options,
      competencyId,
      difficulty,
      type,
      source,
      version,
    }) => ({
      id,
      stem,
      options,
      competencyId,
      difficulty,
      type,
      source,
      version,
    }),
  );
}
export function evidenceFromGrade(
  questions: Question[],
  responses: Record<string, number[]>,
  kind: Evidence["kind"],
  date: string,
): Evidence[] {
  const result = grade(questions, responses);
  return [...new Set(questions.map((q) => q.competencyId))].map((id) => {
    const items = result.results.filter((r) => r.competencyId === id);
    return {
      id: crypto.randomUUID(),
      competencyId: id,
      level: (5 * items.filter((x) => x.correct).length) / items.length,
      confidence: Math.min(0.85, 0.3 + items.length * 0.08),
      kind,
      date,
      version: SCORING_VERSION,
      source: `${items.length} question(s), assessment version 1 — low coverage estimate`,
    };
  });
}
