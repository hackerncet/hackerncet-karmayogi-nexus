# Accessibility audit

Target: WCAG 2.2 AA. No full conformance assertion.

Executed Playwright axe scans on homepage, learner overview, passport, diagnostic entry, recommendations, survey-quality lab, trainer question bank, administrator analytics, simulator and login. Additional scan after switching to Hindi navigation and dark theme. The final 20-test browser suite reported no violations in those checks.

Keyboard verification exercises Enter to open a dialog, initial focus, Escape dismissal and focus return. It also exercises the mobile navigation entry. Exact chart values appear in a table. Inputs have visible labels; status feedback uses live regions; important unknown/confidence/provenance information is text rather than color alone.

Viewport tests at 320px and 640px check page-level overflow on homepage, overview, passport and simulator. The 640px case approximates available CSS width at 200% zoom on a 1280px display; it is not a real browser-zoom or assistive-magnifier certification. Desktop and 390px screenshots were inspected internally.

Known gaps: dedicated screen-reader sessions with NVDA/JAWS/VoiceOver have not been performed; full bilingual content and formal assessment translation need expert validation; mobile drawer focus containment needs deeper assistive-technology testing; all dynamic form error permutations and every admin subpage have not been exhaustively audited. Light/dark token contrast passed the tested automated states; no universal manual contrast certification is claimed.

## Interactive interface revision

The revised 26-test browser suite and GitHub CI passed the existing ten page axe scans and dark/Hindi scan, plus a new command-dialog axe scan. New keyboard tests verify input autofocus, Escape dismissal/focus return, mobile-navigation focus containment and inert closed navigation. The initial 320px header overflow was corrected and final reflow checks passed. These scoped results do not establish complete WCAG conformance.
