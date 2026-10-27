import { describe, it, expect } from "vitest";
import {
  competencies,
  courses,
  initialDemo,
  diagnosticQuestions,
} from "../src/lib/fixtures";
import {
  scoreCompetencies,
  rankCourses,
  grade,
  simulate,
  publicQuestions,
  evidenceFromGrade,
} from "../src/lib/engine";
import { evaluateLab } from "../src/lib/labs";
const now = new Date("2026-10-02T09:00:00Z");
describe("competency evidence and recommendations", () => {
  it("keeps missing and training-only evidence unknown", () => {
    expect(
      scoreCompetencies(competencies, [], now).every(
        (s) => s.current === null && s.gap === null,
      ),
    ).toBe(true);
    const evidence = initialDemo().evidence.map((e) => ({
      ...e,
      kind: "training" as const,
    }));
    expect(
      scoreCompetencies(competencies, evidence, now)[0].current,
    ).toBeNull();
  });
  it("calculates exact documented gaps and priority components", () => {
    const s = scoreCompetencies(competencies, initialDemo().evidence, now)[0];
    expect(s.current).toBe(2);
    expect(s.gap).toBe(2);
    expect(s.priority).toBeCloseTo(
      0.4 * (2 / 5) + 0.25 * 1 + 0.2 * 0.7 + 0.15 * 0.5,
    );
  });
  it("bounds gaps at zero and rejects invalid input", () => {
    const ev = [{ ...initialDemo().evidence[0], level: 5 }];
    expect(scoreCompetencies(competencies, ev, now)[0].gap).toBe(0);
    expect(() =>
      scoreCompetencies(competencies, [{ ...ev[0], level: 6 }], now),
    ).toThrow();
    expect(() =>
      scoreCompetencies(competencies, [{ ...ev[0], confidence: -1 }], now),
    ).toThrow();
  });
  it("reduces confidence for conflicting evidence and ages old evidence", () => {
    const old = initialDemo().evidence[0];
    const conflict = [old, { ...old, id: "new", level: 5 }];
    expect(scoreCompetencies(competencies, conflict, now)[0].conflict).toBe(
      true,
    );
    expect(
      scoreCompetencies(competencies, conflict, now)[0].confidence,
    ).toBeLessThan(scoreCompetencies(competencies, [old], now)[0].confidence);
    expect(
      scoreCompetencies(competencies, [old], new Date("2027-10-02"))[0]
        .confidence,
    ).toBeLessThan(0.2);
  });
  it("does not use future or zero-confidence evidence", () => {
    expect(
      scoreCompetencies(
        competencies,
        [{ ...initialDemo().evidence[0], confidence: 0 }],
        now,
      )[0].current,
    ).toBeNull();
    expect(
      scoreCompetencies(
        competencies,
        [{ ...initialDemo().evidence[0], date: "2030-01-01T00:00:00.000Z" }],
        now,
      )[0].current,
    ).toBeNull();
  });
  it("ranks deterministically, blocks missing prerequisites and excludes duplicates/completions", () => {
    const scores = scoreCompetencies(competencies, initialDemo().evidence, now);
    const ranked = rankCourses([...courses, courses[0]], scores, [
      courses[2].id,
    ]);
    expect(ranked).toEqual(
      rankCourses([...courses, courses[0]], scores, [courses[2].id]),
    );
    expect(new Set(ranked.map((x) => x.course.id)).size).toBe(ranked.length);
    expect(ranked.some((x) => x.course.id === courses[2].id)).toBe(false);
    expect(
      ranked.find((x) => x.course.id === "demo-nssta-advanced")?.blocked.length,
    ).toBe(1);
    expect(rankCourses([], scores)).toEqual([]);
  });
});
describe("assessment and mission evaluation", () => {
  it("grades exact multi-answer sets and rejects invalid or unknown options", () => {
    const responses = Object.fromEntries(
      diagnosticQuestions.map((q) => [q.id, q.answer]),
    );
    expect(grade(diagnosticQuestions, responses).score).toBe(100);
    expect(grade(diagnosticQuestions, {}).score).toBe(0);
    expect(() => grade(diagnosticQuestions, { q1: [9] })).toThrow();
    expect(() => grade(diagnosticQuestions, { q1: [1, 1] })).toThrow();
    expect(() => grade(diagnosticQuestions, { bad: [1] })).toThrow();
    expect(grade([diagnosticQuestions[5]], { q6: [0] }).score).toBe(0);
  });
  it("redacts answers, explanations and source quotes from public questions", () => {
    const q = publicQuestions(diagnosticQuestions)[0];
    expect(q).not.toHaveProperty("answer");
    expect(q).not.toHaveProperty("explanation");
    expect(q).not.toHaveProperty("quote");
  });
  it("limits confidence for low assessment coverage", () => {
    const evidence = evidenceFromGrade(
      diagnosticQuestions,
      {},
      "diagnostic",
      now.toISOString(),
    );
    expect(evidence.every((e) => e.confidence < 0.5)).toBe(true);
    expect(evidence.every((e) => e.level === 0)).toBe(true);
  });
  it("evaluates independent sampling and data quality keys", () => {
    expect(evaluateLab("sampling", { weight: 5, mean: 26 }).score).toBe(100);
    expect(evaluateLab("quality", [0, 1, 2, 3, 4]).score).toBe(100);
    expect(evaluateLab("quality", [0, 1, 2, 3, 4, 5]).score).toBe(80);
    expect(evaluateLab("quality", [0, 0]).score).toBe(20);
    expect(evaluateLab("interpretation", 1).score).toBe(100);
  });
  it("accepts only an exact fixed SQL grammar", () => {
    expect(evaluateLab("sql", " SELECT COUNT(*) FROM survey; ").score).toBe(
      100,
    );
    for (const sql of [
      "SELECT * FROM profiles",
      "SELECT COUNT(*) FROM survey; DROP TABLE profiles",
      "SELECT pg_read_file('/etc/passwd')",
      "select count(*) from survey --comment",
    ])
      expect(evaluateLab("sql", sql).score).toBe(0);
  });
});
describe("transparent simulations", () => {
  const s = {
    population: 200,
    participation: 0.8,
    completion: 0.85,
    effectiveness: 0.5,
    hours: 10,
    baselineCoverage: 0.3,
  };
  it("uses documented math and ordered scenarios", () => {
    const result = simulate(s);
    expect(result.map((r) => r.name)).toEqual([
      "Conservative",
      "Baseline",
      "Best case",
    ]);
    expect(result[1].participants).toBe(160);
    expect(result[1].completers).toBe(136);
    expect(result[1].hours).toBe(1600);
    expect(result[1].coverage).toBeCloseTo((60 + 136 * 0.5 * 0.7) / 200);
    expect(result[2].coverage).toBeGreaterThan(result[1].coverage);
  });
  it("handles zero participation and bounds outcomes", () => {
    expect(simulate({ ...s, participation: 0 })[1].coverage).toBe(0.3);
    expect(simulate({ ...s, baselineCoverage: 1 })[2].coverage).toBe(1);
    expect(() => simulate({ ...s, population: -1 })).toThrow();
    expect(() => simulate({ ...s, effectiveness: 2 })).toThrow();
  });
});
