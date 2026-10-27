export const supportedRoots = [
  "dashboard",
  "onboarding",
  "profile",
  "competencies",
  "diagnostic",
  "skill-gaps",
  "recommendations",
  "learning-paths",
  "course-catalog",
  "courses",
  "assessments",
  "practice-labs",
  "ai-tutor",
  "my-progress",
  "achievements",
  "settings",
  "trainer",
  "admin",
];
export function isWorkspacePath(path: string) {
  const parts = path.split("/").filter(Boolean);
  if (!supportedRoots.includes(parts[0])) return false;
  if (parts.length === 1) return true;
  if (parts[0] === "trainer")
    return (
      [
        "materials",
        "question-bank",
        "assessment-builder",
        "assessments",
        "analytics",
      ].includes(parts[1]) &&
      (parts.length === 2 || (parts[1] === "materials" && parts.length === 3))
    );
  if (parts[0] === "admin")
    return (
      parts.length === 2 &&
      [
        "workforce",
        "competency-framework",
        "learning-plans",
        "training-programmes",
        "analytics",
        "impact-simulator",
        "integrations",
        "users",
        "audit-logs",
      ].includes(parts[1])
    );
  return (
    parts.length === 2 &&
    ["courses", "assessments", "practice-labs"].includes(parts[0])
  );
}
