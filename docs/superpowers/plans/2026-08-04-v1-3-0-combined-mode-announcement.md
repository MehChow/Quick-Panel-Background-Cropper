# v1.3.0 Combined Mode Announcement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a once-per-version startup announcement that introduces the Advanced Controls + Buttons target with its supplied example image.

**Architecture:** Keep the shared release-announcement dialog and host unchanged. Replace the active reason-specific acknowledgement ID, descriptor locale keys, and media source; the existing isolated MMKV acknowledgement flow will then show the new announcement once without touching calibration or navigation.

**Tech Stack:** Expo 56, React Native, expo-image, i18next, MMKV, Jest.

## Global Constraints

- Use the stable ID `v1.3.0-advanced-combined-mode-announcement`.
- Preserve the `quick-panel.acknowledged-release-announcement` key and all unrelated preferences and calibrations.
- The CTA remains informational: `Got it` / `知道了` acknowledges and closes only.
- Use `flow/advanced/combined/19.webp` with `contentFit="contain"` and localized accessibility text.
- Do not add dependencies, navigate, clear storage, commit, or push.

---

### Task 1: Prove the v1.3.0 announcement contract

**Files:**
- Modify: `__tests__/release-announcement.test.tsx:35-89`
- Modify: `__tests__/storage.test.ts:85-104`
- Modify: `__tests__/locales.test.ts:3-17`

**Consumes:** The existing global `ReleaseAnnouncementHost`, isolated acknowledgement storage API, and locale resource exports.

**Produces:** Regression coverage for the v1.3.0 translation keys, WebP accessibility label, one-time acknowledgement ID, and unchanged isolated storage behavior.

- [x] **Step 1: Write the failing dialog and storage expectations**

  In `__tests__/release-announcement.test.tsx`, replace each `v1_2_0` translation key and `v1.2.0-buttons-icon-color-announcement` expected value with:

  ```ts
  "releaseAnnouncement.v1_3_0.title"
  "releaseAnnouncement.v1_3_0.body"
  "releaseAnnouncement.v1_3_0.gotIt"
  "releaseAnnouncement.v1_3_0.mediaAccessibilityLabel"
  "v1.3.0-advanced-combined-mode-announcement"
  ```

  Make the same ID replacement in the acknowledgement assertion in
  `__tests__/storage.test.ts`.

- [x] **Step 2: Write the failing localized-copy expectation**

  In `__tests__/locales.test.ts`, replace the v1.2.0 locale-object assertion
  with independently specified v1.3.0 values:

  ```ts
  expect(enLocale.translation.releaseAnnouncement.v1_3_0).toEqual({
    title: "v1.3.0 Major Updates 🌟\n",
    body: "• New: Advanced Controls + Buttons lets one image flow continuously across both Quick Panel families.",
    gotIt: "Got it",
    mediaAccessibilityLabel: "Advanced Controls and Buttons using one continuous image",
  });
  expect(zhLocale.translation.releaseAnnouncement.v1_3_0).toEqual({
    title: "v1.3.0 主要更新內容 🌟\n",
    body: "• 新功能：進階「控制版面 + 按鈕」模式，讓同一張圖片無縫延伸到兩種 Quick Panel 版面。",
    gotIt: "知道了",
    mediaAccessibilityLabel: "進階控制版面與按鈕使用同一張連續圖片",
  });
  ```

- [x] **Step 3: Run the focused tests to verify the expected red state**

  Run:

  ```bash
  npx jest __tests__/storage.test.ts __tests__/release-announcement.test.tsx __tests__/locales.test.ts --runInBand
  ```

  Expected: the announcement and locale assertions fail because production
  code still exposes v1.2.0 keys and ID.

### Task 2: Activate the v1.3.0 descriptor and localized media

**Files:**
- Modify: `src/features/quick-panel/store/storage.ts:38-39`
- Modify: `src/features/quick-panel/release/ReleaseAnnouncementContent.ts:13-21`
- Modify: `i18next/locales/en.ts:13-21`
- Modify: `i18next/locales/zh.ts:12-20`
- Reuse: `flow/advanced/combined/19.webp`

**Consumes:** The test contract in Task 1 and the existing `ReleaseAnnouncementDescriptor` optional `mediaSource` and `mediaAccessibilityKey` fields.

**Produces:** An active v1.3.0 announcement descriptor that uses the provided combined-mode image and localized text.

- [x] **Step 1: Update the active acknowledgement ID**

  In `storage.ts`, set:

  ```ts
  export const activeReleaseAnnouncementId =
    "v1.3.0-advanced-combined-mode-announcement";
  ```

- [x] **Step 2: Point the descriptor at v1.3.0 copy and WebP media**

  In `ReleaseAnnouncementContent.ts`, use the v1.3.0 locale keys and the
  supplied image:

  ```ts
  actionKey: "releaseAnnouncement.v1_3_0.gotIt",
  bodyKey: "releaseAnnouncement.v1_3_0.body",
  mediaAccessibilityKey:
    "releaseAnnouncement.v1_3_0.mediaAccessibilityLabel",
  mediaSource: require("../../../../flow/advanced/combined/19.webp"),
  titleKey: "releaseAnnouncement.v1_3_0.title",
  ```

- [x] **Step 3: Add matching locale entries**

  Replace each locale file’s `releaseAnnouncement.v1_2_0` object with the
  matching `v1_3_0` object and exact strings specified in Task 1, so the
  descriptor’s keys resolve in both supported languages.

- [x] **Step 4: Run the focused tests to verify green**

  Run:

  ```bash
  npx jest __tests__/storage.test.ts __tests__/release-announcement.test.tsx __tests__/locales.test.ts --runInBand
  ```

  Expected: all focused suites pass; the new ID is persisted after explicit
  acknowledgement and platform dismissal, and the old v1.2.0 ID no longer
  suppresses the announcement.

### Task 3: Validate the release-announcement change

**Files:**
- Verify: `src/features/quick-panel/store/storage.ts`
- Verify: `src/features/quick-panel/release/ReleaseAnnouncementContent.ts`
- Verify: `i18next/locales/en.ts`
- Verify: `i18next/locales/zh.ts`
- Verify: `__tests__/storage.test.ts`
- Verify: `__tests__/release-announcement.test.tsx`
- Verify: `__tests__/locales.test.ts`

**Consumes:** The completed v1.3.0 announcement and tests from Tasks 1 and 2.

**Produces:** Fresh automated evidence that the targeted change is type-safe,
lint-clean, and free of whitespace errors.

- [x] **Step 1: Run static checks**

  Run:

  ```bash
  npm run lint
  npx tsc --noEmit
  git diff --check
  ```

  Expected: every command exits with code 0.

- [x] **Step 2: Inspect the final diff against the approved scope**

  Run:

  ```bash
  git diff -- src/features/quick-panel/store/storage.ts src/features/quick-panel/release/ReleaseAnnouncementContent.ts i18next/locales/en.ts i18next/locales/zh.ts __tests__/storage.test.ts __tests__/release-announcement.test.tsx __tests__/locales.test.ts
  ```

  Confirm the change only activates the new one-time announcement, uses the
  supplied WebP, updates English and Traditional Chinese copy, and leaves the
  shared dialog/host behavior untouched.
