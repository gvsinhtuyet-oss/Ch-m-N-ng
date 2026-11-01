# Chatbox handoff — 2026-11-01

## User goal
Complete "Trợ lý Khám phá" in CHẠM ĐÀ NẴNG. Vietnamese user wants direct implementation, verification and publication, with compact attractive UI, useful teacher/student follow-ups and optional cost-controlled teacher AI. Continue autonomously within authorized scope. Never describe proposed features as implemented.

## Verified source and deployment baseline
- Repository: gvsinhtuyet-oss/Ch-m-N-ng
- main at handoff read: f2ef7ea0978e345f4f87b38536d5e0a8e2f2ca54
- main tree: 38d0cf30f13681922e8e197afa5c3b5770093685
- Production frontend: https://chamdanang-gddp.pages.dev
- Cloudflare production branch: deploy/cloudflare-preserve-api-20261028
- Production release via PR #82, head 4735aa6679425b791587a23f08cc629e0f4fa16d
- Production tree matched main; deployed version 31dbccf5, script /assets/index-BiRS7JD7.js.
- main only deploys a preview. To release future frontend fixes, validate main then sync main to the existing production branch. Preserve API proxy, identity and database.
- functions/api/[[path]].js forwards /api/* to https://chamdanang-gddp.ai.studio. Updating Cloudflare frontend does not update that backend.

## Already implemented, do not rebuild blindly
- Teacher lesson/title/grade/topic lookup and direct learning resource links.
- Learning task routing: knowledge, compare, create questions, activities, rewrite and practice.
- Direct coral false-premise correction; age-adjusted explanations.
- 51 topic learning profiles; 52 assessment items across 13 topic pairs.
- Practice recall/example/application, sources, teacher copy with sources, measurement panel.
- Compact UI, round bubble/star SVG icon, outside pointer dismiss and draft preservation.
- Current launcher is hidden while chat is open. Persistent open/close launcher and automatic context follow-up chips are NOT completed.

## Fresh checks this handoff
Ran the existing learning and teacher lookup suites locally on 2026-11-01:
node --experimental-loader /workspace/scratch/b52368c8c3ad/resolve-learning-ts.mjs --test assistant-learning-upgrade-test.ts teacher-assistant-search-test.ts
Result: 21 passed, 0 failed. This is not a new full build or live UI verification.
Earlier full CI passed for the baseline. Run appropriate current CI/build after any source changes.

## AI backend status: blocked, NOT enabled
- Live /api/education-assistant returned JSON {"error":"Not found"}.
- AI Studio app: https://aistudio.google.com/apps/71b45c71-26f3-4479-9372-306c6b35245a
- Existing published backend last showed Oct 27, 2026.
- Pulled main into AI Studio; GitHub UI confirmed in sync Nov 1.
- Republish failed: RpcError: Precondition check failed. No proven root cause. Do not infer billing or payment will solve it.
- Preview showed missing src/features/teacher/TeacherDashboard.tsx, despite file present on main. Sync history listed several teacher files as deleted; investigate incremental sync/recovery, not deletion from GitHub.
- Reloaded editor; code loading remained unfinished at last check.
- No billing enabled, no new key created or revealed. Never request keys in chat.

## Existing AI implementation vs proposals
- education-assistant.mjs: teacher-only; disabled unless EDUCATION_ASSISTANT_AI_ENABLED === 'true' and GEMINI_API_KEY exists.
- Default model: gemini-2.5-flash-lite.
- Existing limiter: in-memory 10/user/hour.
- Durable 5/teacher/day, shared system cap, explicit teacher AI opt-in and reviewed answer cache are proposals; NOT implemented.
- Some current client fallback automatically calls AI when available and retrieval fails. If implementing opt-in, inspect and remove that automatic path appropriately.
- Free quota observed in the project's private AI Studio dashboard: 2.5 Flash Lite 10 RPM / 250K TPM / 20 RPD; some newer Flash Lite rows 15 RPM / 250K TPM / 500 RPD. Verify actual supported model IDs/current quota before changing configuration. Shared project quota is not per-teacher entitlement or guaranteed availability.
- Antigravity 100 RPD in the user's screenshot is not the education chatbot model quota.
- Gemini Pro subscription and API billing are separate. Credits eligibility was not established. Do not activate billing/payment/credits as a guessed fix.
- Gemini API terms restrict under-18-directed/likely accessed API clients. Verify the provider terms for this primary-school app before activating; teacher role alone must not be assumed sufficient.

## Next work, prioritized
1. Read current branches/files and repository guidance; preserve unrelated work.
2. Finish launcher behavior: visible, consistent open/close affordance without covering panel or lesson content on mobile; retain outside dismiss, Escape and drafts.
3. Add up to three context-aware follow-up actions for student/teacher; use known topic/lesson, handle unknown subjects and reset correctly.
4. Verify actual lesson/resource opening and classroom scenarios, including direct coral correction and teacher 3 questions / 5-minute activity.
5. Resolve AI Studio sync/preview and publish blocker using supported UI/documented platform behavior; no security bypass or guessed payment fixes.
6. Prepare durable daily/global quota only after inspecting storage/auth architecture. Activate AI only once usage conditions and controls are established and actual endpoint is verified.
7. Run appropriate tests/build; publish through the correct frontend branch and separately verify backend; report implemented/tested/live status individually.

## Recovery and testing cautions
- Local checkout was partial: do not infer missing GitHub files from local absence.
- scripts/recover-aistudio-source.mjs restores only allowlisted absent files from an immutable manifest commit with SHA-256 checks, never overwrites existing files.
- scripts/aistudio-source-manifest.json currently pins dc13b1ffe0234368b2bf4b0fa7250e81aa1c188e.
- If modifying allowlisted source: first commit source, then update manifest to that immutable commit with hashes of only changed paths; retain unchanged canonical hashes. Do not recompute all hashes from possibly stale partial local files.
- Local loader/scratch paths may not exist on another account. Use repository dependencies and npm test:assistant / npm run lint / npm run build in a complete checkout or CI.
- No actual classroom outcome study exists yet. Do not claim measured gains in understanding or teacher time savings.

## User-facing status
The existing knowledge-based chatbot is usable. New core suites passed. This handoff adds no chatbot feature and does not resolve AI publishing. Finish and verify remaining work rather than reporting full completion.
