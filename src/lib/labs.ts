import { z } from "zod";
export const surveyRows = [
  { id: "H01", region: "North", age: 35, income: 24000, weight: 2 },
  { id: "H02", region: "South", age: 42, income: null, weight: 3 },
  { id: "H01", region: "North", age: 35, income: 24000, weight: 2 },
  { id: "H04", region: "north", age: 28, income: 30000, weight: 2 },
  { id: "H05", region: "East", age: 250, income: 9999999, weight: 1 },
  { id: "H06", region: "West", age: 31, income: 22000, weight: 2 },
];
export const labDefinitions = [
  {
    id: "quality",
    title: "The survey quality mission",
    competencyId: "quality",
    duration: "15 min",
    description:
      "Investigate six synthetic household records. Find five distinct data-quality issues before the survey goes to analysis.",
  },
  {
    id: "sampling",
    title: "Every household counts",
    competencyId: "sampling",
    duration: "12 min",
    description:
      "Calculate an inverse-probability weight and a weighted mean. Explore what weighting changes.",
  },
  {
    id: "interpretation",
    title: "Read the story behind the numbers",
    competencyId: "communication",
    duration: "10 min",
    description:
      "Separate percentage points from percent change and distinguish observed trends from causal claims.",
  },
  {
    id: "sql",
    title: "The safe SQL workbench",
    competencyId: "sql",
    duration: "10 min",
    description:
      "Query a fixed synthetic survey using a constrained, read-only grammar. No connection to application tables.",
  },
];
export const issueLabels = [
  "Missing income",
  "Duplicate identifier",
  "Inconsistent region case",
  "Implausible age",
  "Extreme income needing review",
  "Every weight is invalid",
  "All records must be deleted",
];
export function evaluateLab(
  id: string,
  input: unknown,
): { score: number; feedback: string; competencyId: string } {
  if (id === "quality") {
    const selected = z
      .array(z.number().int().min(0).max(6))
      .max(7)
      .parse(input);
    const unique = [...new Set(selected)];
    const right = unique.filter((i) => i < 5).length,
      wrong = unique.filter((i) => i >= 5).length;
    return {
      score: Math.max(0, ((right - wrong) / 5) * 100),
      feedback: `${right}/5 issues identified; ${wrong} unsupported flags. Missing income (H02), repeated H01, region case (H04), implausible age and extreme income (H05) need investigation. An outlier is a review flag, not proof of an error.`,
      competencyId: "quality",
    };
  }
  if (id === "sampling") {
    const s = z.object({ weight: z.number(), mean: z.number() }).parse(input);
    const score =
      (Math.abs(s.weight - 5) < 0.001 ? 50 : 0) +
      (Math.abs(s.mean - 26) < 0.01 ? 50 : 0);
    return {
      score,
      feedback:
        "For pi = 0.2, weight = 1 / 0.2 = 5. For values 10, 30 and weights 1, 4, weighted mean = (10 + 120) / 5 = 26.",
      competencyId: "sampling",
    };
  }
  if (id === "interpretation") {
    const answer = z.number().int().parse(input);
    return {
      score: answer === 1 ? 100 : 0,
      feedback:
        "A rate rising from 40% to 50% increased by 10 percentage points, or 25% relative to the baseline. This observation does not establish causation.",
      competencyId: "communication",
    };
  }
  if (id === "sql") {
    const query = z
      .string()
      .max(500)
      .parse(input)
      .trim()
      .replace(/;$/, "")
      .replace(/\s+/g, " ")
      .toLowerCase();
    if (query === "select count(*) from survey")
      return {
        score: 100,
        feedback: `COUNT(*) = ${surveyRows.length}. This fixed grammar reads the isolated synthetic fixture only.`,
        competencyId: "sql",
      };
    if (query === "select region, count(*) from survey group by region")
      return {
        score: 75,
        feedback:
          "North: 2; South: 1; north: 1; East: 1; West: 1. Case differences remain visible. Try SELECT COUNT(*) FROM survey for the mission objective.",
        competencyId: "sql",
      };
    return {
      score: 0,
      feedback:
        "Query rejected. Only SELECT COUNT(*) FROM survey and SELECT region, COUNT(*) FROM survey GROUP BY region are supported. No query is sent to a database.",
      competencyId: "sql",
    };
  }
  throw new Error("Unknown lab");
}
