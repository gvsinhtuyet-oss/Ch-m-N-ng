# Nam Ô game layout revision

Scope: only g3-station-4 on the trial site/branch. Existing approved station 1/2 sources, original background files and shared audio/CSS are unchanged.

- Game now selects the previously prepared safe-v3 16:9 WebP artwork.
- Play art preserves the central safe region. Victory uses contain on desktop and full viewport width on portrait phones, showing the entire 16:9 source. No stretching.
- HUD uses full viewport shell, left question card and right collectibles/audio. Portrait HUD moves below the source banner, with the question panel below HUD.
- Victory source art carries its three title lines. The praise/achievement/reward block is visible again in the middle, per user feedback.
- Replay and continue actions occupy opposite lower edges, with safe-area bottom spacing.

Validation this revision:
- 19 shared-engine/config/audio unit tests passed.
- TypeScript check passed.
- Production build passed (existing CSS optimization and chunk-size warnings).
- Chromium browser: played all five Nam Ô questions correctly, including all three matching pairs and confirmation. Continue opens real Stage 3 in read-only preview.
- Question and victory layouts inspected/measured at 390x844, 375x667, 320x640, 1366x768. HUD and question text occupy separate areas; victory buttons stay inside viewport at opposite edges. Source banner remains visible.
- Not tested on physical phones; no new listening test on physical speakers; not all repository tests rerun. Wrong-answer/review/restart states covered by reducer tests, not replayed manually in this revision.

## Follow-up: restored message, full artwork, lighter transition

- Restored all three middle message lines that had been hidden in the previous revision.
- Preload and decode Nam Ô backgrounds on game mount, before the final answer; no added transition delay. Existing correct-answer feedback still lasts 1100ms.
- Nam Ô-only lightweight fireworks: 36 rather than 76 particles per burst, cap 240 rather than 850; resolution ratio 1 rather than up to 2; no per-particle shadow blur; time-based motion compensates for slower frames. Other stations keep the default rendering mode.
- Canvas now resizes when either width or height changes.
- Browser: played all five questions correctly on 390x844; victory message and button rectangles checked on 390x844,375x667,320x640,1366x768,844x390. No message/button clipping.
- No physical-device performance benchmark or guaranteed FPS claim. Network/CPU throttling and physical speaker output were not tested.
