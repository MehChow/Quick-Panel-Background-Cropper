# v1.3.2 Release Announcement Implementation Plan

**Goal:** Show a one-time v1.3.2 startup announcement for the snap strength slider and easier, more accurate snapping.

**Architecture:** Reuse the existing global release-announcement host and dialog. Change only the active reason-specific ID, localized descriptor content, bundled announcement image, and focused assertions; preserve all acknowledgement, calibration, and preference storage behavior.

**Tech Stack:** Expo 56, TypeScript, i18next, expo-image, Jest, React Native Testing Library.

## Global Constraints

- Keep the announcement concise and informational.
- Use a new reason-specific acknowledgement ID rather than the app version alone.
- Preserve unrelated MMKV data and the existing no-navigation acknowledgement behavior.
- Provide matching English and Traditional Chinese strings.
- Use `assets/announcement/9.webp` as compact descriptor media.
- Do not commit, push, or perform physical-device QA.

### Task 1: Activate v1.3.2 announcement content

**Files:**
- Modify: `src/features/quick-panel/store/storage.ts`
- Modify: `src/features/quick-panel/release/ReleaseAnnouncementContent.ts`
- Modify: `i18next/locales/en.ts`
- Modify: `i18next/locales/zh.ts`

- [x] Replace the active ID with `v1.3.2-snap-strength-announcement`.
- [x] Add concise v1.3.2 title, two-item body, acknowledgement label, and localized image accessibility text in both locales.
- [x] Point the descriptor media source to `assets/announcement/9.webp` and update all descriptor keys to `releaseAnnouncement.v1_3_2.*`.

### Task 2: Update focused automated coverage

**Files:**
- Modify: `__tests__/release-announcement.test.tsx`
- Modify: `__tests__/locales.test.ts`

- [x] Update title/body/action/media key assertions, active ID assertions, and asset filename assertion to v1.3.2.
- [x] Assert the complete English and Traditional Chinese v1.3.2 entries.

### Task 3: Verify the change

- [x] Run `npx jest __tests__/storage.test.ts __tests__/release-announcement.test.tsx __tests__/locales.test.ts --runInBand`.
- [x] Run `npm run lint`.
- [x] Run `npx tsc --noEmit`.
- [x] Run `git diff --check` and inspect the final diff for scope.
