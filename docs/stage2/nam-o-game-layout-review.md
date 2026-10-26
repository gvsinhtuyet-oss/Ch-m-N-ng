# Nam Ô game layout revision

Scope: only g3-station-4 on the trial site/branch. Existing approved station 1/2 sources, original background files and shared audio/CSS are unchanged.

- Game now selects the previously prepared safe-v3 16:9 WebP artwork.
- Art uses one automatic background dimension, centered at top. Portrait sizing preserves the middle 50% of the source. No stretching.
- HUD uses full viewport shell, left question card and right collectibles/audio. Portrait HUD moves below the source banner, with the question panel below HUD.
- Victory text is carried by the source artwork; redundant praise overlay is visually hidden, retained for accessibility.
- Replay and continue actions occupy opposite lower edges, with safe-area bottom spacing.

Validation this revision:
- 19 shared-engine/config/audio unit tests passed.
- TypeScript check passed.
- Production build passed (existing CSS optimization and chunk-size warnings).
- Chromium browser: played all five Nam Ô questions correctly, including all three matching pairs and confirmation. Continue opens real Stage 3 in read-only preview.
- Question and victory layouts inspected/measured at 390x844, 375x667, 320x640, 1366x768. HUD and question text occupy separate areas; victory buttons stay inside viewport at opposite edges. Source banner remains visible.
- Not tested on physical phones; no new listening test on physical speakers; not all repository tests rerun. Wrong-answer/review/restart states covered by reducer tests, not replayed manually in this revision.
