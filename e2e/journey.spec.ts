import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync, writeFileSync } from "node:fs";
test("visual review captures and local performance observations", async ({
  page,
}) => {
  mkdirSync("artifacts", { recursive: true });
  await page.goto("/");
  await page.screenshot({ path: "artifacts/homepage.png", fullPage: true });
  const perf = await page.evaluate(() => ({
    navigation: performance
      .getEntriesByType("navigation")
      .map((x) => x.toJSON()),
    resources: performance
      .getEntriesByType("resource")
      .filter((x) => x.name.endsWith(".js"))
      .map((x) => x.toJSON()),
  }));
  writeFileSync(
    "artifacts/local-performance.json",
    JSON.stringify(perf, null, 2),
  );
  await page.goto("/demo/dashboard");
  await page.screenshot({ path: "artifacts/dashboard.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "artifacts/mobile.png", fullPage: true });
});
test("dark theme and Hindi navigation remain accessible", async ({ page }) => {
  await page.goto("/demo/dashboard");
  await page.getByRole("button", { name: "Use dark theme" }).click();
  await page
    .getByRole("combobox", { name: "Interface language" })
    .selectOption("hi");
  await expect(
    page.getByRole("heading", { name: "अवलोकन", exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/Navigation translated/)).toBeVisible();
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});
test("complete competency-to-impact demonstration", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /From learning to/ }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Explore the live demo" }).click();
  await expect(
    page.getByRole("heading", { name: "Overview", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Take your diagnostic" }).click();
  await page.getByRole("button", { name: "Begin assessment" }).click();
  const answers = [1, 2, 2, 0, 1];
  for (let i = 0; i < 5; i++)
    await page
      .locator("fieldset")
      .nth(i)
      .getByRole("radio")
      .nth(answers[i])
      .check();
  await page.locator("fieldset").nth(5).getByRole("checkbox").nth(0).check();
  await page.locator("fieldset").nth(5).getByRole("checkbox").nth(2).check();
  await page.getByRole("button", { name: "Submit for evaluation" }).click();
  await expect(page.getByText("100%", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "View updated evidence" }).click();
  await expect(
    page.getByRole("heading", { name: "Competency passport", exact: true }),
  ).toBeVisible();
  await page.goto("/demo/skill-gaps");
  await expect(page.getByRole("table")).toContainText("Awaiting evidence");
  await page.goto("/demo/recommendations");
  await expect(
    page.getByText("NSSTA demo", { exact: true }).first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Join demo path" }).first().click();
  await page.goto("/demo/learning-paths");
  await page
    .getByRole("link", { name: "Continue", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Mark demo lesson complete" }).click();
  await expect(
    page.getByRole("button", { name: "Lesson completed", exact: true }),
  ).toBeDisabled();
  await page.goto("/demo/practice-labs/quality");
  for (let i = 0; i < 5; i++) await page.getByRole("checkbox").nth(i).check();
  await page.getByRole("button", { name: "Evaluate mission" }).click();
  await expect(page.getByText("Score: 100%")).toBeVisible();
  await page.goto("/demo/trainer/question-bank");
  await page
    .getByRole("button", { name: "Load 3 prewritten examples" })
    .click();
  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: "Edit & review" }).nth(i).click();
    await page
      .getByRole("button", { name: "Approve reviewed question" })
      .click();
    await page.getByRole("button", { name: "Close dialog" }).click();
  }
  await page.goto("/demo/trainer/assessment-builder");
  await page
    .getByRole("button", { name: "Publish reviewed assessment" })
    .click();
  await page.goto("/demo/assessments/published");
  await page.getByRole("button", { name: "Begin assessment" }).click();
  for (let i = 0; i < 3; i++)
    await page
      .locator("fieldset")
      .nth(i)
      .getByRole("radio")
      .nth([1, 2, 2][i])
      .check();
  await page.getByRole("button", { name: "Submit for evaluation" }).click();
  await expect(page.getByText("100%", { exact: true })).toBeVisible();
  await page.goto("/demo/my-progress");
  await expect(page.getByText("Before and after, with context")).toBeVisible();
  await page.goto("/demo/admin");
  await expect(page.getByRole("table")).toBeVisible();
  await page.goto("/demo/admin/impact-simulator");
  await expect(
    page.getByText("Baseline scenario", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("53.8%", { exact: true })).toBeVisible();
  await page.goto("/demo/admin/integrations");
  await expect(page.getByText("DEMO ADAPTER", { exact: true })).toBeVisible();
});
test("demo answers persist across reload and SQL rejects application tables", async ({
  page,
}) => {
  await page.goto("/demo/diagnostic");
  await page.getByRole("button", { name: "Begin assessment" }).click();
  await page.locator("fieldset").first().getByRole("radio").nth(1).check();
  await page.reload();
  await page.getByRole("button", { name: "Begin assessment" }).click();
  await expect(
    page.locator("fieldset").first().getByRole("radio").nth(1),
  ).toBeChecked();
  await page.goto("/demo/practice-labs/sql");
  await page
    .getByRole("textbox")
    .fill("SELECT * FROM profiles; DROP TABLE profiles;");
  await page.getByRole("button", { name: "Evaluate mission" }).click();
  await expect(page.getByText("Score: 0%")).toBeVisible();
  await expect(page.getByText(/Query rejected/)).toBeVisible();
});
test("trainer upload, honest AI fallback and conversation clear", async ({
  page,
}) => {
  await page.goto("/demo/trainer/materials");
  await page.getByLabel("TXT or Markdown").setInputFiles({
    name: "my-notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Statistics starts with reliable evidence."),
  });
  await page.getByRole("button", { name: "Upload material" }).click();
  await expect(
    page.getByRole("heading", { name: "my-notes.txt" }),
  ).toBeVisible();
  await page.goto("/demo/trainer/question-bank");
  await page
    .getByLabel("Learning material")
    .selectOption({ label: "my-notes.txt" });
  await page
    .getByRole("button", { name: "Load 3 prewritten examples" })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "requires an AI provider",
  );
  await page.goto("/demo/ai-tutor");
  await page
    .getByRole("button", { name: "What is a weighted estimate?" })
    .click();
  await expect(
    page.getByText(/prewritten example, not AI generation/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear chat", exact: true }).click();
  await page
    .getByRole("button", { name: "Clear conversation", exact: true })
    .click();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(
    page.getByRole("heading", { name: "Start with a question." }),
  ).toBeVisible();
});
test("protected routes require sign-in and mutations reject cross-origin requests", async ({
  page,
  request,
}) => {
  for (const p of ["/dashboard", "/trainer/materials", "/admin/users"]) {
    await page.goto(p);
    await expect(page).toHaveURL(/\/login$/);
  }
  const attack = await request.post("/api/labs", {
    headers: {
      origin: "https://attacker.example",
      "content-type": "application/json",
    },
    data: { id: "sampling", input: { weight: 5, mean: 26 }, score: 100 },
  });
  expect(attack.status()).toBe(403);
  expect(await attack.text()).not.toContain("stack");
  const unauthenticated = await request.post("/api/labs", {
    headers: {
      origin: "http://localhost:3000",
      "content-type": "application/json",
    },
    data: { id: "sampling", input: { weight: 5, mean: 26 } },
  });
  expect(unauthenticated.status()).toBe(503);
});
test("catalogue search, pagination and provider filtering are functional", async ({
  page,
}) => {
  await page.goto("/demo/course-catalog");
  await page
    .getByRole("combobox", { name: "Course provider" })
    .selectOption("NSSTA demo");
  await expect(page.getByText("3 results")).toBeVisible();
  await page.getByRole("textbox", { name: "Search courses" }).fill("sampling");
  await expect(
    page.getByRole("heading", {
      name: "Survey sampling & weighted estimation",
    }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Search courses" })
    .fill("no-such-course");
  await expect(
    page.getByRole("heading", { name: "No courses found" }),
  ).toBeVisible();
});
test("keyboard dialog focus and mobile navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/demo/settings");
  await page.getByRole("button", { name: "Reset demo data" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Reset demonstration", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Reset demo data" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("link", { name: "Mission labs", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Mission labs", exact: true }),
  ).toBeVisible();
});
for (const path of [
  "/",
  "/demo/dashboard",
  "/demo/competencies",
  "/demo/diagnostic",
  "/demo/recommendations",
  "/demo/practice-labs/quality",
  "/demo/trainer/question-bank",
  "/demo/admin",
  "/demo/admin/impact-simulator",
  "/login",
])
  test(`axe WCAG 2.2 AA: ${path}`, async ({ page }) => {
    await page.goto(path);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  });
test("mobile and 200% equivalent viewport reflow without page overflow", async ({
  page,
}) => {
  for (const width of [320, 640]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/",
      "/demo/dashboard",
      "/demo/competencies",
      "/demo/admin/impact-simulator",
    ]) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      );
      expect(overflow, `${path} at ${width}px`).toBe(false);
    }
  }
});
test("all declared primary routes resolve and unknown routes return 404", async ({
  request,
}) => {
  for (const path of [
    "/features",
    "/how-it-works",
    "/accessibility",
    "/privacy",
    "/signup",
    "/demo/profile",
    "/demo/onboarding",
    "/demo/learning-paths",
    "/demo/assessments",
    "/demo/achievements",
    "/demo/trainer/analytics",
    "/demo/admin/workforce",
    "/demo/admin/competency-framework",
    "/demo/admin/learning-plans",
    "/demo/admin/training-programmes",
    "/demo/admin/users",
    "/demo/admin/audit-logs",
  ])
    expect((await request.get(path)).status(), path).toBe(200);
  expect((await request.get("/missing-path")).status()).toBe(404);
  expect((await request.get("/demo/missing-path")).status()).toBe(404);
});
