# AI and intelligent assessment

No live model has been configured or called. `CompatibleLLM` is an adapter for an approved HTTPS OpenAI-compatible chat/embedding endpoint. `LLM_MODEL`, endpoint and credentials are server-only. The request uses JSON mode, bounded completion tokens, 25-second timeout, no redirects and a response-size limit. The selected provider must support these fields; reasoning-only models and arbitrary vendors are not automatically compatible.

Zod validates objective question shape, option uniqueness, answer indexes, type/difficulty/competency, count and explanations. Exact source ID/excerpt checks reject citation mismatches. Repeated stems and ambiguous all/none patterns are rejected. These checks cannot establish semantic correctness, detect every ambiguous question or prove that an excerpt supports an answer. Expert trainer review is mandatory.

Formats: single-answer, multiple-answer, true/false and scenario objective questions. A short quiz is a set of those objective questions. Generated questions remain drafts. Trainer UI supports preview, edit stem/explanation/answers, delete, approval, publication and JSON export. Database versions preserve edits. Full history browsing, per-question regeneration and psychometric item statistics are not complete.

Publication and attempts retain immutable private question snapshots. Correct answers and explanations are omitted from learner start responses and returned only after trusted submission. Attempt locking prevents duplicate grading; deadlines and limits are enforced in SQL. The live UI does not yet display a timed countdown or expose all assessment policy controls.

The tutor retrieves authorized document chunks, validates returned citation IDs, persists messages and permits clear-chat. It never queries protected answer tables. Lexical retrieval is bounded to the first 100 authorized chunks; optional semantic retrieval uses pgvector. Multi-chat switching, personalized competency context and full prior-conversation prompting are not implemented.

Prompt injection is handled by separation of trusted instructions and untrusted passages, no tool execution, scoped retrieval and output validation. No absolute prevention claim. Plain-text rendering avoids unsafe HTML. Do not send confidential workforce/respondent records to unapproved AI providers.

Demo generation loads three prewritten examples from the built-in source only. Arbitrary demo uploads explicitly refuse real generation. Demo tutor responses are labeled prewritten. They do not count as configured-AI acceptance evidence.

Document extraction supports TXT, Markdown, PDF text/pages, DOCX text (no page mapping) and PPTX slides. Private uploaded MP4 requires a separately supplied transcript. Scanned PDF OCR, transcription and malware scanning are not configured. Office archives have declared and actual expansion limits. Parsing uses a 20-second/128 MiB old-generation worker with an empty environment; native allocations and OS-level isolation require further validation.

Current provider reference consulted: https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create . JSON mode is followed by application validation; no model-specific structured-output guarantee is claimed.
