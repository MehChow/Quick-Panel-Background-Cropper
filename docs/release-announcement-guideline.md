# Release Announcement Guideline

Use this guide when a future app update needs to explain important changes to users the first time they open the updated app.

## What this feature does

The app has a reusable startup announcement dialog. It uses the existing AniUI `AlertDialog` style from the calibration leave-confirmation panel:

- dark `slate` dialog surface;
- title and description in an alert-style modal;
- one primary acknowledgement action.

The dialog is mounted globally from `src/app/_layout.tsx`, so it is not tied to the landing screen or any individual route.

Acknowledgement is stored separately from calibration and preferences. Showing an announcement must never clear MMKV or modify calibration data.

## When to use it

Use a release announcement when an update has user-visible changes that need explanation, such as:

- a required one-time recalibration;
- a new workflow or export type;
- a changed setting or permission requirement;
- a migration with an important user action;
- a behavior change that could otherwise look like a regression.

Do not use it for every small bug fix or patch release. If the update requires data transformation or invalidation, implement that migration separately. The announcement only informs the user; its acknowledgement button should not perform unrelated navigation.

## Files involved

| Purpose | File |
| --- | --- |
| Persistent acknowledgement API | `src/features/quick-panel/store/storage.ts` |
| Active release descriptor | `src/features/quick-panel/release/ReleaseAnnouncementContent.ts` |
| Reusable dialog shell | `src/features/quick-panel/release/ReleaseAnnouncementDialog.tsx` |
| Startup host and navigation | `src/features/quick-panel/release/ReleaseAnnouncementHost.tsx` |
| Root startup mounting | `src/app/_layout.tsx` |
| English copy | `i18next/locales/en.ts` |
| Traditional Chinese copy | `i18next/locales/zh.ts` |
| Storage and behavior tests | `__tests__/storage.test.ts`, `__tests__/release-announcement.test.tsx` |

## Preparing a future announcement

Before editing code, prepare these decisions:

1. Define the audience: fresh installs, users updating from a specific release, or every user who has not seen this announcement.
2. Define the stable announcement ID. Use a descriptive ID such as `v4-permission-gate` or `v4-export-migration`, not `1.2.1` or the Android `versionCode`.
3. Decide the single acknowledgement CTA label.
4. Prepare English and Traditional Chinese copy before implementation.
5. Decide whether a real data migration is also required. Keep that logic in storage/domain code, not in the announcement component.

## Adding a new announcement

### 1. Change the active ID

In `src/features/quick-panel/store/storage.ts`, replace the active ID only when the new announcement should be shown:

```ts
export const activeReleaseAnnouncementId = "v4-permission-gate";
```

Do not delete the acknowledgement key. The new ID will naturally differ from the previous one, so existing users see the new announcement once. Fresh installs have no acknowledgement and also see it.

If a future announcement must be shown to the same users again for a materially different reason, use a new reason-specific ID rather than silently reusing an old ID.

### 2. Add localized copy

Add matching keys in both locale files:

```ts
releaseAnnouncement: {
  v4: {
    title: "...",
    body: "...",
    gotIt: "Got it",
  },
},
```

Keep the body concise. State what changed, who is affected, what the user needs to do, and what data remains preserved. Do not promise that data is preserved if a separate migration does not actually preserve it.

### 3. Update the descriptor

Update `src/features/quick-panel/release/ReleaseAnnouncementContent.ts` to point to the new ID and translation keys:

```ts
export const activeReleaseAnnouncement: ReleaseAnnouncementDescriptor = {
  id: activeReleaseAnnouncementId,
  actionKey: "releaseAnnouncement.v4.action",
  bodyKey: "releaseAnnouncement.v4.body",
  dismissKey: "releaseAnnouncement.v4.dismiss",
  titleKey: "releaseAnnouncement.v4.title",
};
```

The dialog component should normally not change. If a future release needs a different layout, create a separate dialog variant rather than adding release-specific conditionals to the shared shell.

### 4. Update the acknowledgement CTA

The standard behavior is to acknowledge and close the panel without navigation:

```ts
const acknowledge = () => {
  acknowledgeReleaseAnnouncement(activeReleaseAnnouncement.id);
  setIsOpen(false);
};
```

If a future release genuinely needs an action beyond dismissal, document that decision and add a dedicated handler. For a simple informational announcement, the current behavior acknowledges on the CTA or platform dismissal.

## Testing checklist

Update or add tests for all applicable cases:

- no acknowledgement shows the active announcement;
- the active ID is persisted after tapping the CTA;
- Android/platform dismissal persists the ID;
- an already acknowledged active ID does not show;
- announcement acknowledgement does not change calibration, language, help, or last-mode keys;
- changing the active ID makes the new announcement show once;
- both English and Traditional Chinese translation keys exist.

Run:

```bash
npx jest __tests__/storage.test.ts __tests__/release-announcement.test.tsx --runInBand
npm run lint
npx tsc --noEmit
```

For a release candidate, also test manually with a clean app data state and an upgraded installation:

1. Fresh install: announcement appears on first launch.
2. Tap `Got it`: announcement closes and does not reappear after restart.
3. Reinstall/update with no acknowledgement key: announcement appears.
4. Tap `Got it`: no navigation occurs.
5. Verify existing calibration/preferences remain unchanged unless a separate migration intentionally changes them.
6. Relaunch after acknowledgement: announcement does not reappear.

## Common mistakes

- Do not clear the complete MMKV store to make the dialog appear.
- Do not use the Expo semantic version or Android `versionCode` as the acknowledgement value; patch releases would replay the message.
- Do not mount the dialog only in `LandingScreen`; global startup behavior belongs in the root layout.
- Do not put release copy directly inside the dialog component.
- Do not add navigation to the standard acknowledgement CTA.
- Do not assume an announcement performs a calibration migration. Validate calibration compatibility independently.
- Do not remove old acknowledgement IDs from the storage format; changing the active ID is enough.

## v3 reference

The current announcement ID is `v1.1.0-release-announcement`. It uses concise bullet points, ends with a recalibration reminder, and has a single `Got it`/`知道了` acknowledgement CTA. Its acknowledgement is independent from `quick-panel.calibrations`.
