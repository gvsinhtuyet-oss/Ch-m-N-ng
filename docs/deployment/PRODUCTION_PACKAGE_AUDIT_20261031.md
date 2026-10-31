# Production packaging impact audit — 31 October 2026

This audits the packaging change in PR #73. It does not assert that Google AI Studio has successfully deployed the backend or accepted the application-file budget as its own publishing-size calculation.

## Measured local artifact

- Static website: 96,385,986 bytes.
- Runtime dependencies: 29,478,008 bytes.
- Application package before the small runtime-manifest file: 125,973,964 bytes.
- 766 static files matched path-for-path and SHA-256-for-SHA-256 against a fresh package of the current local dist. All public assets matched dist as well. The count is specific to that local build; CI repeats the invariant on the current branch build.
- All 12 local backend modules matched their source SHA-256. All 41 installed production package versions matched package-lock; no development-only packages were admitted.
- The package is generated separately. No source tree dependencies are pruned. The script never reads live content-data or .env. The container still uses the same Node 22 slim base, port and server entry point.

## Checks actually executed

1. Whole-tree static and backend identity comparison; installed runtime dependency version checks.
2. Copy package outside the checkout into a temporary directory to prevent missing packages from resolving against development dependencies in a parent directory.
3. Run the complete production HTTP integration scenario from that isolated directory: Admin login/bootstrap; teacher creation/login; denied teacher Admin access; GDĐP save/read/publish; class roster; learner registration, progress updates, no-op updates and restore; class report; teaching logs; teacher ownership isolation; failed storage writes; logout/login; guest and learner star save/read; guest feedback; private Admin review.
4. Load the actual packaged Gemini SDK in that isolated directory and execute request serialization/response parsing using a synthetic fetch implementation. No AI provider request or billing is involved.
5. Run 23 focused auth/storage, Google JWT verification, feedback, optional AI, deployment and runtime smoke tests. All passed. Two deeper audit tests and the nested isolated production HTTP scenario passed, with zero skipped tests.
6. Smoke-test byte-identical HTTP responses for home, map and audio; unauthorized AI 401 and cross-origin AI 403.

## Findings and limits

- An initial local audit found an older staging artifact containing old JavaScript chunks compared with the newer dist. Regenerating with the packaging script produced an exact match. CI now checks this whole-tree invariant on each fresh build.
- A test runner child initially inherited NODE_TEST_CONTEXT and skipped its nested scenario. The harness now removes that flag and asserts that exactly one HTTP scenario really ran, with no skip warning. The final results above come from the corrected harness.
- No production behavior defect was found in the tested packaging change. No image/audio compression, lesson deletion, API rewrite, credential reset or database change was made.
- Firestore and identity/model traffic in these integration tests are synthetic. They do not establish successful live Admin login, a real Google OAuth exchange, live Firestore persistence or a real AI answer.
- Cloud Run base-image layers and Google AI Studio internal wrapping are not included in the application-file measurement. The publisher's exact artifact has not been obtained. The last automatic publication attempt stopped at the platform's suspicious-request security check, before acceptance of the new package could be established. No workaround of that check is attempted.
- A successful backend publication and live verification remain required. The audit does not certify every full game play-through or real iOS browser behavior.
