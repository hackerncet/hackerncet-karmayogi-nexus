# Exact continuation checkpoint

Local root: `karmayogi-nexus`. Git has `main` and `feature/competency-to-impact`; a requirements-first commit records the matrix. Source and reports are committed locally before packaging. No remote is configured. The source archive excludes node_modules, build output, browser screenshots and secrets; it includes the local Git history bundle.

## Already done — do not restart

Research, requirements matrix, original UI/design primitives, functional synthetic lifecycle, deterministic domain services, three Supabase CLI-created migrations, authenticated API source, bounded document workers, CI definition, local tests and reports. The browser suite passed all 20 tests; Vitest passed 40. Initial UI/test failures were fixed and rerun. Do not replace the working project with a new scaffold.

## First unblock

The user must provide a new private GitHub repository URL (prefer `hackerncet/karmayogi-nexus`, initialized with README and connector access) and choose one Render connection: `Render`, `Primary`, `1nc24cs150`. The connector cannot create the repository. The Render tools explicitly require selection where multiple accounts could satisfy a write. Do not guess, overwrite unrelated repositories or choose a paid plan silently.

Once the URL is supplied, inspect its content/default branch, push through authenticated GitHub operations or a supported Git transport, preserve history, then identify the chosen Render workspace. Read current Render deployment lifecycle and plan references before creation. Use one Node web service, build `npm ci --include=dev && npm run build`, start `npm start`. Monitor the specific deployment and verify public HTTP routes.

## Supabase checkpoint comes after preview

Tools exist; do not tell the user to connect a missing MCP without checking. Only after preview readiness, list authorized projects. Select an explicitly appropriate empty project or ask if ambiguous. Inspect tables, apply reviewed migrations, run advisors and actual hosted RLS/Auth/Storage tests. Configure Render env through authenticated tools; never request secret keys pasted in chat. The app uses only the publishable key and session-scoped clients.

## Further implementation

Use `KNOWN_LIMITATIONS.md` as the honest backlog. In particular, static reference frameworks and demo courses must not be treated as real custom departmental data. Provider credentials and approved APIs are absent. Final reports must keep local demonstration, authored backend, live verification and external access separate.
