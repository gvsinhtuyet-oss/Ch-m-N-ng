# CHẠM ĐÀ NẴNG — Multi-school rollout (work in progress)

This branch is **not production ready**. Do not merge/deploy before completing the checklist.

## Infrastructure
- Dedicated Supabase project: `bcurvufmddsfzdnqponl` (Singapore).
- Tables: schools, teacher_profiles, classrooms, students, student_progress.
- RLS enabled. Teachers can read only their own classes and associated student/progress records.
- The new client `src/services/MultiSchoolService.ts` is **opt-in** and not wired into the current landing screen.
- No service-role secret should ever be committed or exposed to the browser.

## Configuration (when approved for test deployment)
Set `VITE_CHAM_SUPABASE_URL` and `VITE_CHAM_SUPABASE_PUBLISHABLE_KEY` on the *test* deployment. These are public client values, not service-role keys. Do not point SkillUp-Kid at this project.

## Blocking tasks before inviting real students
1. Complete teacher registration/login, email verification and safe session handling; prevent duplicate teacher profiles and unauthorized roles.
2. Build class creation and classroom-code enrollment through a server-side or carefully scoped RPC flow. **Never allow an anonymous user to enumerate students or submit progress for another student.**
3. Implement student credentials/opaque per-student tokens, recovery and rate limits. A classroom join code alone must not authorize reading/editing every pupil's records.
4. Wire existing station progress to new persistence with retries, idempotency and explicit sync status. Preserve offline progress and test conflicts.
5. Add teacher-only per-class dashboard and Excel export. All counts must reflect real records, never demo data.
6. Verify admin authorization separately from teacher permissions.
7. Add minimal data retention, parental/school consent workflow, export/deletion, backups and monitoring of quotas.
8. Run automated build/typecheck, RLS adversarial tests (two teachers, two classes), student isolation tests, browser E2E, offline/reconnect and load tests before production.
9. Confirm AI Studio deployment's backend capabilities and production domain/CORS behavior before rollout.

**Existing production remains unchanged** until all checks pass.
