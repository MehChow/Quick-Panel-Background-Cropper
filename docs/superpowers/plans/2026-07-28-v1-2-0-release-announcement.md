# v1.2.0 Release Announcement Implementation Plan

> **Execution:** Implement inline in this session. Do not use subagents, commit,
> push, or perform device QA.

**Goal:** Add the one-time v1.2.0 release announcement with the supplied animated
icon-color-picker GIF.

**Architecture:** Keep the global announcement host and acknowledgement storage.
Update the active release descriptor and localized content, and extend the
shared dialog descriptor with optional media rendered through `expo-image`
between the body and footer.

**Tech Stack:** Expo 56, React Native, expo-image, i18next, Jest, React Native
Testing Library.

## Global Constraints

- Preserve all calibration and unrelated preference storage.
- Keep the CTA informational with no navigation.
- Use `assets/announcement/icon-color-picker.gif` as the dialog media.
- Keep the full GIF visible with `contentFit="contain"`.
- Keep production component files below 150 lines.
- Do not use `useMemo`, `useCallback`, `React.memo`, or `any`.
- Leave device QA to the user.

---

### Task 1: v1.2.0 announcement content and media

**Files:**

- Modify: `__tests__/release-announcement.test.tsx`
- Modify: `__tests__/locales.test.ts`
- Modify: `__tests__/storage.test.ts`
- Modify: `src/features/quick-panel/store/storage.ts`
- Modify: `src/features/quick-panel/release/ReleaseAnnouncementContent.ts`
- Modify: `src/features/quick-panel/release/ReleaseAnnouncementDialog.tsx`
- Modify: `i18next/locales/en.ts`
- Modify: `i18next/locales/zh.ts`
- Modify: `docs/release-announcement-guideline.md`

**Interfaces:**

- `ReleaseAnnouncementDescriptor.mediaSource?: ImageSource`
- `ReleaseAnnouncementDescriptor.mediaAccessibilityKey?: string`
- `activeReleaseAnnouncementId` becomes
  `"v1.2.0-buttons-icon-color-announcement"`

- [x] **Step 1: Write failing behavior tests**

Update the announcement tests to expect the v1.2.0 translation keys, new active
ID, and an image with accessibility label
`releaseAnnouncement.v1_2_0.mediaAccessibilityLabel`. Update locale tests to
expect the two approved English items and equivalent Traditional Chinese copy.

- [x] **Step 2: Verify the tests fail for the missing release**

Run:

```bash
npx jest __tests__/storage.test.ts __tests__/locales.test.ts __tests__/release-announcement.test.tsx --runInBand
```

Expected: fail because the current descriptor, ID, copy, and dialog still target
v1.1.0 and do not render media.

- [x] **Step 3: Add the minimal v1.2.0 implementation**

Change the active ID, add `v1_2_0` locale entries, point the descriptor to those
keys, attach the statically required GIF, and render optional descriptor media
with `expo-image` after `AlertDialogHeader` and before `AlertDialogFooter`.

- [x] **Step 4: Verify focused behavior**

Run:

```bash
npx jest __tests__/storage.test.ts __tests__/locales.test.ts __tests__/release-announcement.test.tsx --runInBand
```

Expected: all focused suites pass.

- [x] **Step 5: Update durable announcement guidance**

Document the optional descriptor media fields and update the current-reference
section to v1.2.0 without changing historical release records.

- [x] **Step 6: Run final verification**

Run:

```bash
npm run lint
npx tsc --noEmit
git diff --check
```

Expected: all commands exit successfully.
