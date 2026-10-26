# Grade 3 stations 3 and 5 — synchronized trial layout

Trial branch only. PR #15 stays draft and unmerged. Approved stations 1 and 2 remain unchanged.

Both games reuse safe-layout.css, the existing renderer/audio, missed-question review, lightweight fireworks, background preloading/decoding and real Stage 3 callbacks. GameConfig.layout opts in to safe-v1; station 4 keeps identical CSS behavior after the class/file rename. No duplicate HTML games.

Content, answer order, hints and collectible configuration for stations 3, 4 and 5 were compared with commit 2349817 and are unchanged.

Four new 1600x900 WebP backgrounds: community-play/victory-safe-v1 and basket-play/victory-safe-v1, quality 88. Originals retained. Image edit tool was used; prompt set is in stations3-5-image-prompts.json. Sign lettering is in the central half of the source; the challenge names are prominent. Victory chests contain five themed rewards, no labels on objects.

Verified this revision:

- 19/19 shared engine, configuration, content and audio unit tests passed.
- TypeScript check and Vite/PWA production build passed. Existing CSS optimization and large-chunk warnings remain.
- Chromium browser: wrong on all five questions for each station, review all five, correct all five including matching; five unique rewards and visible three-line middle congratulations.
- Replay tested for both stations; sound toggle off/on tested for both; continue opens real station-specific Stage 3 in read-only preview for both.
- 72 layout measurements across 390x844, 375x667, 320x640 and 1366x768: prompts/messages inside viewport, HUD clear of text, image elements loaded, end buttons inside viewport. Includes five question states, review, victory, replay/introduction and station 4 introduction regression.
- Visual inspection of source artwork confirms Vietnamese wording and five rewards. Backgrounds stay proportional; portrait victory shows the full source image.

Not verified: physical iOS/Android devices, audible output on physical speakers, real student synchronization (previews intentionally do not save results), throttled-network/CPU performance benchmarks, every repository test. Background preloading and lighter particles reduce work but no physical-device FPS guarantee is made.

Direct trial routes: /?stage2-preview=g3-station-3 and /?stage2-preview=g3-station-5.
