# Performance and reliability

Acceptance budgets for future deployed validation: initial page p75 LCP ≤2.5s, INP ≤200ms and CLS ≤0.1 on a representative mobile/network profile; core non-AI API p95 ≤1s with an explicitly documented test population; database queries paginated/bounded; AI timeout 25s; extraction worker timeout 20s; upload 10 MiB; actual Office expansion 40 MiB; worker old-generation heap 128 MiB.

These are targets, not measured production claims. Local homepage navigation observed about 264ms total duration and 124ms DOMContentLoaded in one unthrottled container/browser run. This is not a field Core Web Vitals sample. Script transfer-size values were unavailable/zero in that instrumentation and must not be reported as zero bundle size.

Next production build succeeds. Trainer/admin screens load dynamically, independent snapshot reads run concurrently, and principal evidence/membership/attempt indexes are present. Vector retrieval starts with exact nearest-neighbor search, avoiding an unsubstantiated HNSW benefit on a tiny corpus.

Document job locks, retry cap (3), statuses, heartbeat and idempotent completed checks permit explicit retry. No continuously running processor, cron recovery, distributed load test or availability SLO is claimed. Some snapshot lists use fixed 100/500 bounds rather than complete server-side pagination; this must be extended before a large workforce rollout.
