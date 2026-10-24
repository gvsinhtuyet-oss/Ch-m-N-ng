> Historical checkpoint: follow-up findings and release gates are in [REAL_PHOTO_REVIEW_2026-10-25.md](REAL_PHOTO_REVIEW_2026-10-25.md).

# Real photograph review — 24 October 2026

Status: **INCOMPLETE — do not merge or deploy to production yet.**

## Implemented

38 publisher photographs downloaded, decoded, visually inspected, resized and stored as local WebP files. Source URLs, authors, publisher copyright status, dimensions and output SHA-256 digests are retained in `content-review/real-photos-2026-10-24.json`. No open licence is asserted for publisher-owned images. Existing publisher watermarks remain intact.

6 covers and 32 exploration-point primary images changed across 8 stations:

- Grade 3: Nam Ô fish sauce; basket-boat making.
- Grade 4: Mỹ Sơn / Cham Sculpture Museum; Phước Kiều bronze casting.
- Grade 5: Kỳ Anh / Mother Nhu; Mã Châu silk; Marble Mountains; Ngọc Linh ginseng.

All exploration points of the four requested priority groups now have local photographs. Compound steps include additional views: bamboo preparation / rim work / waterproofing, melting / pouring / polishing bronze, cocoons / silk reeling, weaving / coloured thread, memorial / monument. Mother Nhu is represented by the Mother of Thanh Khê Warriors monument and her memorial, not Mother Thứ. These are present-day monument/heritage photographs, not claimed to be wartime photographs.

The basket-boat series depicts the Trà Bồng craft in Quảng Ngãi as requested, illustrating shared craft stages; it is not evidence of a Sơn Trà workshop. The 2012 silk article also includes demonstration and product-display scenes; only its explicitly identified workshop views represent the Mã Châu workshop.

Student source-credit text is removed from the exploration image panels. Management and teacher views can still retrieve publisher information. No teaching text, question, answer, narration/audio implementation, or game is changed.

Saved built-in photographs upgrade in memory without overwriting teacher-supplied external/custom images or changing questions. No database migrations.

## Verification actually completed

- TypeScript: PASS (`npm run lint`).
- Production build: PASS (`npm run build`), with existing CSS/chunk-size warnings.
- All 38 WebP files fully decoded with Pillow; digests, dimensions and file signatures checked.
- Local covers and point-image files exist across all 25 stations.
- New media integrity / mappings / saved-content compatibility tests: 4/4 PASS.
- Narration playback / cancellation / voice-selection tests: 6/6 PASS.
- Selected combined content/media/narration suite: 40/45 PASS. Five failing tests also fail on the untouched `facf2f8` baseline; the baseline selected suite had 35/41 passing. Several older assertions still require schematic-only assets or old narration. This is not a green repository test suite.
- Visually inspected contact sheets of the imported original photographs. This is asset inspection, not responsive application verification.

## Outstanding release gates

- Open each changed station and every point in the actual application on desktop landscape and mobile portrait. Not completed: the connected browser cannot reach the container's running local server. Downloading a local headless Chromium also failed, so no browser test pass is claimed.
- Confirm layout, image visibility/subject framing, point selection, question answers and audible sound end-to-end.
- Resolve/reconcile the repository's failing content/narration/production test checks without silently changing the lesson text.
- Complete all remaining schematic/illustrated slots. The 25-station path audit identifies **25 SVG or remote-image point slots** still requiring review; existing raster teaching illustrations in grade 1 also require a separate content review. A local existing file is not proof it is a real photograph or educationally correct.
- Inspect existing raster photographs at every point, including the rescue-system image at Mỹ Khê. No claim that all 25 stations are now photographically correct.
- Verify the two remaining remote Suối Tiên URLs or replace them with locally stored verified originals.
- Only after these gates pass: merge to main, deploy, and verify the live deployment. None of these release actions has been performed.

See `content-review/real-photo-audit-2026-10-24.json` for the per-station audit and unresolved point paths.
