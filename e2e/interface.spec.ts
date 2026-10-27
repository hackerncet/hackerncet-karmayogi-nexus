import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("homepage preview switches perspective and opens the chosen demonstration", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Trainer", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "From source to assessment." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Upload learning material/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Organization", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "See capacity. Plan action." }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Open organization demonstration" })
    .click();
  await expect(page).toHaveURL(/\/demo\/admin$/);
  await expect(page.getByRole("table")).toBeVisible();
});

test("competency explorer filters, inspects evidence and changes display", async ({
  page,
}) => {
  await page.goto("/demo/dashboard");
  await page
    .getByRole("combobox", { name: "Competency group" })
    .selectOption("Technical");
  await page
    .getByRole("button", { name: "Inspect Python", exact: true })
    .click();
  const inspector = page.getByRole("complementary", {
    name: "Selected competency details",
  });
  await expect(
    inspector.getByRole("heading", { name: "Python", exact: true }),
  ).toBeVisible();
  await expect(inspector.getByText(/supporting record/)).toBeVisible();
  await page.getByRole("button", { name: "Table", exact: true }).click();
  await expect(page.getByRole("table").getByRole("row")).toHaveCount(4);
  await expect(page.getByRole("table")).toContainText("Unknown");
  await expect(page.getByRole("table")).not.toContainText(
    "Sampling & estimation",
  );
  await page.getByRole("button", { name: "Chart", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Inspect Python", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("workspace command search is keyboard accessible and routes to the matching competency", async ({
  page,
}) => {
  await page.goto("/demo/dashboard");
  await page
    .getByRole("button", { name: "Search workspace", exact: true })
    .focus();
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Find your next step" });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("textbox", { name: "Search workspace content" }),
  ).toBeFocused();
  await dialog
    .getByRole("textbox", { name: "Search workspace content" })
    .fill("SQL & data handling");
  await dialog
    .getByRole("button", { name: /SQL & data handling Competency/ })
    .click();
  await expect(page).toHaveURL(/\/demo\/competencies#competency-sql$/);
  await expect(page.locator("#competency-sql")).toBeVisible();
  await page
    .getByRole("button", { name: "Search workspace", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Search workspace content" })
    .fill("no-matching-thing");
  await expect(
    page.getByText("No matches. Try a competency, course title or page name."),
  ).toBeVisible();
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(result.violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Search workspace", exact: true }),
  ).toBeFocused();
});

test("course discovery sorts, filters, compares and switches layout", async ({
  page,
}) => {
  await page.goto("/demo/course-catalog");
  await page
    .getByRole("combobox", { name: "Sort courses" })
    .selectOption("duration");
  const hours = await page
    .locator(".catalog-card .course-meta span:first-child")
    .allTextContents();
  const durations = hours.map((s) => Number(s.match(/\d+/)?.[0]));
  expect(durations).toEqual([...durations].sort((a, b) => a - b));
  await page.locator(".compare-toggle").nth(0).click();
  await page.locator(".compare-toggle").nth(1).click();
  await page.getByRole("button", { name: "Compare selected courses" }).click();
  const dialog = page.getByRole("dialog", {
    name: "Compare your training options",
  });
  await expect(dialog.getByRole("table").getByRole("row")).toHaveCount(3);
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "Clear selection" }).click();
  await expect(page.locator(".comparison-bar")).not.toBeVisible();
  await page.getByRole("button", { name: "List view" }).click();
  await expect(page.locator(".catalog-list-view")).toBeVisible();
  await page
    .getByRole("combobox", { name: "Course difficulty" })
    .selectOption("advanced");
  const levels = await page
    .locator(".catalog-card .course-meta span:last-child")
    .allTextContents();
  expect(levels.length).toBeGreaterThan(0);
  expect(levels.every((s) => Number(s.match(/\d+/)?.[0]) > 2)).toBe(true);
});

test("demo perspective switcher changes workspace without granting live privileges", async ({
  page,
}) => {
  await page.goto("/demo/dashboard");
  await page
    .getByRole("combobox", { name: "Demonstration perspective" })
    .selectOption("trainer");
  await expect(page).toHaveURL(/\/demo\/trainer$/);
  await expect(page.getByText("DEMO MODE", { exact: true })).toBeVisible();
  await page
    .getByRole("combobox", { name: "Demonstration perspective" })
    .selectOption("admin");
  await expect(page).toHaveURL(/\/demo\/admin$/);
  await expect(page.getByRole("table")).toBeVisible();
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login$/);
});

test("mobile navigation traps keyboard focus, dismisses with Escape and restores the trigger", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/demo/dashboard");
  const trigger = page.getByRole("button", { name: "Open navigation" });
  await trigger.click();
  await expect(
    page.getByRole("dialog", { name: "Workspace navigation" }),
  ).toBeVisible();
  await expect(page.locator(".sidebar .nav-link.active")).toBeFocused();
  await page.locator(".sidebar-bottom a").focus();
  await page.keyboard.press("Tab");
  await expect(page.locator(".sidebar > .brand")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(page.locator(".sidebar")).toHaveAttribute("inert", "");
});
