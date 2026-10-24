# Real-media follow-up review — 2026-10-25

This review supersedes the outstanding media and test gates in the 2026-10-24 report. Release status is recorded separately; a source commit alone is not proof of production deployment.

## Scope and provenance

- Audited 25 stations and all 121 exploration points, including existing grade 2 photos.
- Replaced 68 primary point-image references and 11 covers across 19 stations relative to main `facf2f8`.
- Added 57 optimized local WebP assets: 56 real photographs and one official 2025 administrative map. Reused reviewed repository photographs for other suitable points.
- All 121 primary exploration images now use local WebP files. Grade 1's 20 points use real photographs; no primary exploration slot uses AI imagery, remote URLs or schematic SVGs.
- Preserved lesson facts, questions, game behavior and audio implementation. Updated only source/image-reference wording and exact-match migration metadata where needed.
- Added small galleries for compound topics so one process image is not presented as every process. Images use contain sizing; student-facing source panels are removed. Sources, authors, permission notes, dimensions and SHA-256 remain in the two manifests in `content-review/`.
- Kỳ Anh entrance/tunnel/Thạch Tân and Mẹ Nhu memorial/statue are separately identified. No Mẹ Thứ substitution.
- Thúng chai photographs come from the requested Báo Văn Hóa article and are mapped by its process captions. Mã Châu and Phước Kiều photos are likewise mapped to the depicted process.
- Suối Tiên replacements come from the Vietnam National Authority of Tourism. Excluded misleading theme-park images and inaccessible old URLs.

## Validation

- TypeScript and production build pass. Existing CSS/chunk-size build warnings remain.
- Full repository test suite: 158/158 pass. Reconciled stale diagram-only and narration fixture expectations; fixed Docker runtime packaging of `gddp-curriculum-links.mjs`.
- All 57 new WebP assets fully decoded and checked against manifest signatures, dimensions and SHA-256. All 25 station cover/point paths exist.
- GitHub-hosted Chromium runs the actual StationView/AppProvider components in an isolated test learner, without changing real student progress.
- Desktop 1366×768 and mobile portrait 390×844: 25 stations, 121 points each, 242 point/viewport checks. Covers return HTTP 200, primary and gallery images decode without fallback, contain sizing, correct/wrong question feedback, and Web Audio oscillator activity are checked. Audio activity is programmatic verification; it is not a human listening test.
- Initial responsive run passed assertions but screenshot review found content clipped inside the mobile exploration container. Added zero-minimum grid tracks and a nested-content clipping assertion; a fresh run is required for that correction.
- QA screenshots and JSON results are retained as GitHub Actions artifacts. Main merge and live publishing remain gated on the final responsive run and visual review.
