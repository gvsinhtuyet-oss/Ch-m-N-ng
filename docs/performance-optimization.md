# Lighter startup and lesson media

- Feature screens use React lazy imports. Teacher, Admin, station and assistant code loads when rendered.
- PWA installation precaches the HTML/CSS/icon shell and only the initial scripts referenced by HTML, rather than every lesson image and JavaScript chunk.
- Same-origin scripts cache on demand (80 entries, 30 days); same-origin images use stale-while-revalidate (180 entries, 30 days, quota cleanup). API requests are excluded.
- Existing lesson photos remain available at their original URLs. Cards and point thumbnails use generated 480px WebP variants; enlarged lesson views use originals. Missing LearningImage thumbnails retry the original image.
- The introduction video loads only after pressing “Xem video giới thiệu”. VR dialogs already mount their iframe only when opened.
- Background music does not preload before playback. Normal click-to-unlock music and narration behavior remain intact.
- Mobile devices and reduced-motion settings disable decorative pulses and expensive lesson backdrop blur.
- Previously unseen screens/media require a connection. This change does not turn the existing simulated “demo offline” button into a complete offline downloader.

## Build measurements

Before: 336 precache entries, 25,896.91 KiB (about 26.5 MB).
After: 20 precache entries, 1,301.03 KiB (about 1.33 MB, about 95% less). Initial scripts are included so the shell can reopen offline after installation.
These are generated build/precache sizes, not real-device timing measurements.

55 thumbnail source mappings: originals 9,715,648 bytes; thumbnails 1,526,366 bytes (about 84% smaller). Assets are downloaded on demand, not all at startup.

## Verification

- `npm run lint`: pass; removed a stale call to undeclared `setTilesLoaded` in the geographic map selector.
- `npm run build`: pass.
- `node --test performance-build-test.mjs`: shell-only precache, runtime route matching/API exclusion, thumbnail existence/sizes and emitted feature chunks.
- `node --import tsx --test stage-access-test.ts`: pass (3 tests).
- `grade1-content-test.ts`: 7 pass, 1 pre-existing mismatch: the media fixture expects 6 items while the current data supplies 8. The identical failure was reproduced from the unchanged baseline commit. This optimization does not edit curriculum data or that test.

Regenerate thumbnails after changing bundled lesson media:
`node --import tsx scripts/generate-learning-thumbnails.ts`
