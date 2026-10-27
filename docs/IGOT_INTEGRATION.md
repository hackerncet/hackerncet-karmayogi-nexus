# iGOT adapter

`IGOTProvider` defines catalogue search/detail, enrolment, completion, synchronization and health. `DemoIGOTProvider` returns synthetic deterministic records; fake IDs never masquerade as real course IDs. Sync requires an idempotency key and performs no external write.

`AuthorizedIGOTProvider` deliberately fails closed. There is no approved API specification, authorization scheme, course feed or credential. No guessed endpoints, protected scraping or automatic enrolment are implemented. The retry helper is bounded; authorized provider-specific timeout, idempotency and sync behavior must be implemented against the approved contract.

The public website is context, not API documentation. Integration tables and status views provide a foundation; no live sync run is claimed. Real integration remains blocked by external access.
