# Approved games release

User explicitly approved merging PR #15 into main and publishing the completed games.

- Enable the reviewed React games for grade 3 stations 3, 4 and 5 in normal Stage 2 navigation, without requiring stage2-engine=shared-v1.
- Preserve approved stations 1 and 2 as their existing default games. Station 2 React preview remains available.
- All shared framework, audio, versioned WebP art, station configuration and verification reports are included in PR #15. Other draft stations remain disabled.
- Existing CI command groups were run locally: TypeScript, server syntax, production/API packaging, student reconnect, authentication/storage, catalogs, teacher lessons, grade 1–5 content/media, narration, assistant, lesson plans and production build passed. Three tsx CLI invocations initially hit local IPC EPERM; the same tests passed with node --import tsx --test. The combined rerun including the 19 game tests passed 58/58.
- Browser normal-navigation integration uses the existing disposable QA student entry, with no stage2-engine or stage2-preview query flag. Trạm 3 opens SharedStage2 as expected. Previous station 3/5 gameplay and 72 responsive measurements are detailed in stations3-5-sync-review.md.
- Physical phones, speaker listening, real-student cloud synchronization and a confirmed deployment to the existing ai.studio production host have not been verified here. The tracked CI workflow verifies/builds but does not deploy to that host.
