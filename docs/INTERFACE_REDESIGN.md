# Interface redesign — 27 October 2026

The earlier interface relied on passive summary cards, small text and a static illustrative landing preview. This revision changes the interaction model as well as the presentation.

## Implemented

- Navy workspace navigation, clearer typography, restrained borders and consistent interactive states across learner, trainer and organization routes.
- Public preview switches between learner, trainer and organization perspectives. Values come from deterministic synthetic fixtures and links open the corresponding isolated demonstration.
- Selectable competency bars show current level and role target. Group filters, chart/table views and an evidence inspector expose confidence, supporting sources and next actions.
- Dashboard metrics link to the relevant workflows. The lifecycle navigation and recent evidence trail derive their state from actual workspace records.
- Global search opens by button or Ctrl/Cmd+K. Search covers permitted pages, competencies and synthetic courses; matching competency links scroll to its passport card. No protected question keys or other users' records enter this index.
- Demo perspective switching changes only the isolated demonstration route. Live roles and server/database authorization are unchanged.
- Course difficulty filtering, duration/difficulty sorting, grid/list presentation and comparison of two or three catalogue options. Comparison and enrolment remain explicitly synthetic.
- Mobile navigation supports Escape, initial focus, focus containment and focus return; closed mobile navigation is inert. Search focuses its input and returns focus when dismissed.

## Verification scope

Strict types, lint and production build executed. Forty unit/UI/SQL tests passed. Initial expanded browser regression passed 24/25 checks and found dashboard overflow at 320px; the narrow header layout was corrected. Final browser, accessibility and deployed evidence are recorded below when executed. No database schema or scoring rules were changed in this UI revision.

The underlying external-access limitations remain: full Auth email/session acceptance, real AI configuration, authorized government integration and full Hindi content are separate unfinished work. Visual redesign does not change those statuses or establish complete WCAG conformance.

## Final local result

A fresh production build, ESLint and strict TypeScript passed. All 40 Vitest tests and all 26 Playwright tests passed; the final browser suite completed in 32.1 seconds with zero failures or skips. This includes six new interaction/navigation checks, ten page-level axe scans, dark/Hindi accessibility, command-dialog accessibility, keyboard focus, 320/640px reflow and the full original competency-to-impact journey. An intermediate run used a build compiled before the mobile dialog-role change; the fresh final build verifies the actual source. Desktop homepage, dashboard and mobile screenshots were visually reviewed. See `evidence/interface-local-results.json`.

## Verified cloud release

Runtime commit `d50cd5f1378a944899859a03443f47233beb934b` deployed live on Render as `dep-dbgcesijnfac739vh55g`. GitHub CI [40534394203](https://github.com/hackerncet/hackerncet-karmayogi-nexus/actions/runs/40534394203) passed all checks; actual logs confirm 40 unit/UI/SQL tests and 26 browser tests (30.1s). The local production browser suite passed in 32.1s. Public deployed interaction checks are recorded separately after execution.

All six deployed interaction tests passed against https://karmayogi-nexus.onrender.com : public perspective preview, competency filtering/inspection/table display, keyboard command search and passport navigation, course filtering/sorting/comparison/layout, isolated demo perspective routing with live admin denial, and mobile focus/Escape/return behavior. The suite completed in 1.4 minutes; actual results are in `evidence/interface-cloud-results.json`. Browser transport used the environment proxy and ignored its interception certificate; curl HTTPS checks verified normally. No successful account/email/file or real AI acceptance is implied.
