# Reusable Release Announcement Dialog Implementation Plan

> Final product adjustment: the v1.1.0 announcement uses concise bullet points, a recalibration reminder, and one `Got it`/`知道了` acknowledgement CTA. It does not navigate to recalibration.

> **For agentic workers:** This plan is intended for inline execution in the current workspace. Do not commit or push changes.

**Goal:** Add a reusable, version-keyed startup announcement dialog that appears once for each configured app release, explains the v3 changes, and directs users to recalibrate without clearing unrelated local data.

**Architecture:** Store only the latest acknowledged announcement ID in its own MMKV key. A small host component mounted from the Expo Router root layout reads the active announcement and renders the existing AniUI `AlertDialog` pattern used by `AdvancedCalibrationLeaveDialog`. The announcement content remains localized and release-specific, while the dialog shell, acknowledgement behavior, and navigation are reusable for future releases.

**Tech Stack:** Expo 56, Expo Router, React Native `Modal` through the existing AniUI `AlertDialog`, MMKV storage, React i18next, Jest, and React Native Testing Library.

## Global Constraints

- Preserve all existing calibration and preference keys; the announcement must never clear or rewrite calibration data.
- Use an explicit stable announcement ID such as `v1.1.0-release-announcement`, not the Android `versionCode`, so patch releases do not replay the same message.
- Show the announcement after fresh install and after updating from a version that has not acknowledged the active ID.
- Mark the active announcement acknowledged when the user chooses either action, including Android back/outside dismissal.
- Keep the existing v2-to-v3 calibration invalidation behavior unchanged; the announcement explains that requirement but does not implement the migration itself.
- Follow the existing TypeScript, i18n, Uniwind, file-size, and no-`useMemo`/`useCallback`/`React.memo` rules.
- Do not add a dependency or commit/push changes.

---

### Task 1: Add release-announcement persistence primitives

**Files:**
- Modify: `src/features/quick-panel/store/storage.ts`
- Test: `__tests__/storage.test.ts`

**Interfaces:**
- Produce `activeReleaseAnnouncementId` as an exported constant with value `"v1.1.0-release-announcement"`.
- Produce `loadAcknowledgedReleaseAnnouncement(): string | null`.
- Produce `acknowledgeReleaseAnnouncement(id: string): void`.

- [ ] **Step 1: Add failing storage tests**

Add tests that overwrite the mocked MMKV key and verify:

```ts
expect(loadAcknowledgedReleaseAnnouncement()).toBeNull();

acknowledgeReleaseAnnouncement("v1.1.0-release-announcement");

expect(loadAcknowledgedReleaseAnnouncement()).toBe("v1.1.0-release-announcement");
```

Also verify that an acknowledged announcement is independent of `quick-panel.calibrations`, `quick-panel.seen-help`, and `quick-panel.last-exported-mode`.

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
npx jest __tests__/storage.test.ts --runInBand
```

Expected: FAIL because the new storage functions do not exist.

- [ ] **Step 3: Implement the minimal storage API**

Add a dedicated key such as `quick-panel.acknowledged-release-announcement`. Read the raw string without interpreting it as an app version. Writing an ID should only set that key:

```ts
export const activeReleaseAnnouncementId = "v3-recalibration";

export function loadAcknowledgedReleaseAnnouncement(): string | null {
  return storage.getString(releaseAnnouncementKey) ?? null;
}

export function acknowledgeReleaseAnnouncement(id: string) {
  storage.set(releaseAnnouncementKey, id);
}
```

- [ ] **Step 4: Run the focused test and verify it passes**

Run:

```bash
npx jest __tests__/storage.test.ts --runInBand
```

Expected: PASS, including all existing storage tests.

### Task 2: Add reusable localized announcement content

**Files:**
- Create: `src/features/quick-panel/release/ReleaseAnnouncementContent.ts`
- Modify: `i18next/locales/en.ts`
- Modify: `i18next/locales/zh.ts`

**Interfaces:**
- Produce a typed release announcement descriptor containing the stable ID and translation-key names for title, body, secondary action, and primary action.
- Keep content selection separate from the dialog so a future release can add another descriptor without changing dialog layout code.

- [ ] **Step 1: Add localized v3 copy**

Add an English and Traditional Chinese namespace with concise copy covering:

- v3 adds Advanced Buttons-only export.
- Existing Default and Advanced Controls workflows remain available.
- v2 users must recalibrate once because the calibration accuracy/coordinate model changed.
- Other app preferences remain preserved.

Use action labels equivalent to `Later` and `Recalibrate`.

- [ ] **Step 2: Define the descriptor**

Create a small descriptor such as:

```ts
export interface ReleaseAnnouncementDescriptor {
  id: string;
  titleKey: string;
  bodyKey: string;
  dismissKey: string;
  actionKey: string;
}

export const activeReleaseAnnouncement: ReleaseAnnouncementDescriptor = {
  id: activeReleaseAnnouncementId,
  titleKey: "releaseAnnouncement.v3.title",
  bodyKey: "releaseAnnouncement.v3.body",
  dismissKey: "releaseAnnouncement.v3.dismiss",
  actionKey: "releaseAnnouncement.v3.recalibrate",
};
```

Use the existing translation function with these keys; do not put user-facing copy in the component.

- [ ] **Step 3: Run type and locale checks**

Run:

```bash
npx tsc --noEmit
```

Expected: PASS.

### Task 3: Build the reusable AlertDialog host

**Files:**
- Create: `src/features/quick-panel/release/ReleaseAnnouncementDialog.tsx`
- Create: `src/features/quick-panel/release/ReleaseAnnouncementHost.tsx`
- Test: `__tests__/release-announcement.test.tsx`

**Interfaces:**
- `ReleaseAnnouncementDialog` accepts `open`, `descriptor`, `onDismiss`, and `onRecalibrate`.
- `ReleaseAnnouncementHost` owns persisted acknowledgement and router navigation.

- [ ] **Step 1: Add failing component tests**

Cover these behaviors:

1. An unacknowledged active ID renders the dialog title/body and both actions.
2. Pressing the dismiss action acknowledges the ID and closes the dialog.
3. Pressing the recalibration action acknowledges the ID, closes the dialog, and navigates to `/select-mode`.
4. An already acknowledged active ID renders no dialog.
5. Dismissing through `onOpenChange(false)` also acknowledges the ID.

Mock `expo-router` only at the host boundary and use the existing MMKV test mock. Do not test the AniUI internals again; the existing `AlertDialog` implementation is the style reference.

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
npx jest __tests__/release-announcement.test.tsx --runInBand
```

Expected: FAIL because the host and dialog do not exist.

- [ ] **Step 3: Implement the dialog using the quit-confirmation style**

Follow `src/features/quick-panel/calibration/advanced/components/AdvancedCalibrationLeaveDialog.tsx` exactly for the visual shell:

```tsx
<AlertDialog open={open} onOpenChange={onDismiss}>
  <AlertDialogContent className="border border-slate-700 bg-slate-950">
    <AlertDialogHeader>
      <AlertDialogTitle>{t(descriptor.titleKey)}</AlertDialogTitle>
      <AlertDialogDescription>{t(descriptor.bodyKey)}</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel onPress={onDismiss} className="border-0">
        {t(descriptor.dismissKey)}
      </AlertDialogCancel>
      <AlertDialogAction onPress={onRecalibrate}>
        {t(descriptor.actionKey)}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

The host should use the active descriptor, compare its ID with `loadAcknowledgedReleaseAnnouncement()`, and acknowledge before invoking either dismissal or navigation. `onRecalibrate` should call `router.replace("/select-mode")` after acknowledgement so the user begins from the normal mode-selection flow.

- [ ] **Step 4: Run the focused test and verify it passes**

Run:

```bash
npx jest __tests__/release-announcement.test.tsx --runInBand
```

Expected: PASS.

### Task 4: Mount the host at app startup

**Files:**
- Modify: `src/app/_layout.tsx`

**Interfaces:**
- Consume `ReleaseAnnouncementHost` from Task 3.
- Keep the announcement inside the existing root providers and outside the route `Stack`.

- [ ] **Step 1: Mount the host after the stack**

Render the host beside the existing development language switcher:

```tsx
<Stack ... />
<ReleaseAnnouncementHost />
{__DEV__ ? <FloatingLanguageSwitchButton /> : null}
```

This ensures it covers the initial landing route and still works if startup navigation changes later. Do not put the dialog in `LandingScreen`; that would couple a global release message to one route.

- [ ] **Step 2: Verify startup and navigation behavior**

Run:

```bash
npx tsc --noEmit
npm run lint
npx jest __tests__/release-announcement.test.tsx __tests__/storage.test.ts --runInBand
```

Expected: all commands pass. Manually verify that fresh storage shows the dialog on launch, `Later` leaves the user on the current screen, and `Recalibrate` opens mode selection.

### Task 5: Document the reusable release policy and complete verification

**Files:**
- Modify: `docs/v3_changelog.md`
- Modify: `docs/notes.md`

- [ ] **Step 1: Document the behavior**

Add the startup announcement to the v3 update/persistence section:

- It appears once for a fresh install or update when the active announcement ID has not been acknowledged.
- It is stored separately from calibration and preferences.
- It does not itself reset storage.
- Future releases add a new stable announcement ID and new localized copy.

- [ ] **Step 2: Run the full verification set**

Run:

```bash
npm test -- --runInBand
npm run lint
npx tsc --noEmit
git diff --check
```

Expected: all applicable checks pass with no new failures. If an unrelated pre-existing test fails, record its exact name and leave the feature tests passing.

- [ ] **Step 3: Review the final diff**

Confirm that the diff contains only the release-announcement storage, localized content, dialog/host, tests, and documentation. Do not commit or push; provide the brief commit message requested by the repository instructions as handoff text only.

Suggested commit message: `Add reusable release announcement dialog`
