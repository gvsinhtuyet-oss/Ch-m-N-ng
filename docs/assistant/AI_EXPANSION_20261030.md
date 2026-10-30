# Teacher AI expansion — implementation and activation status

The existing local assistant remains available without a model call. Source-backed ethnicity facts now distinguish the Kinh majority from the 53 minority groups, without treating 2019 population percentages as current statistics.

`GET /api/education-assistant` reports availability. The UI exposes the separate **Mở rộng bằng AI** action only when the existing backend explicitly enables it. A teacher may submit an educational question or expand the last question. This is a model-knowledge response, not a live web search or a sourced quotation; the UI marks it as AI reference material requiring teacher review.

`POST /api/education-assistant` enforces same origin, a real teacher/admin session, bounded input and a per-instance 10-request/user/hour guard. No account/profile/student data is added to the prompt. Provider errors and credentials are never returned. This in-memory guard is not a shared citywide quota or a hard billing cap.

The implementation reuses the backend's `GEMINI_API_KEY` and optional `EDUCATION_ASSISTANT_MODEL` (default: the existing `gemini-2.5-flash-lite`). It is disabled by default. Only set `EDUCATION_ASSISTANT_AI_ENABLED=true` after verifying the project's quota/pricing and successfully publishing the backend; do not assume unlimited free inference. This change does not alter billing, keys, storage, accounts, or services.

## Still blocked

AI Studio previously rejected publication as suspicious while generating an API key. Do not bypass that control, extract/copy keys, switch services or retry through an alternate route. The user must resolve the platform's verification/support flow before publication can continue. Firestore quota exhaustion also blocks actual teacher session verification.

The model adapter and authorization/error/usage behavior have automated tests with an injected fake provider. No real model response, teacher session or live expansion has been certified. After publication: verify the GET capability, real teacher/admin access, student denial, error handling, a range of unfamiliar educational questions, no fabricated source attribution and the on-screen AI review label. Publish success alone is insufficient.
