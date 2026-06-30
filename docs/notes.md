# Notes

This file is a running project note log for implementation details that are easy to forget, regress, or repeat.

## What belongs here

- UI behaviors with non-obvious constraints
- Bug patterns and their root causes
- Fix patterns that should be reused
- Device-specific findings
- Testing notes that explain why coverage exists

## Entries

### 2026-06-30: Advanced calibration leave guard

#### Original concern

Users could leave advanced calibration through the shared top-left header back
button or Android hardware back after confirming the green outer rectangle,
losing their in-progress panel alignment work without warning.

#### What changed

- Advanced calibration now warns before leaving once the flow has moved past the
  outer step.
- The leave guard is local to advanced calibration and is based on phase, not a
  persisted dirty flag.
- The shared header back button now accepts an optional override handler so
  advanced calibration can intercept the top-left back press without changing
  other screens.
- Android hardware back uses the same leave request path as the header back.
- The footer `Back` button inside advanced calibration still moves between
  calibration phases and does not show the leave dialog.

#### Root cause worth remembering

- The screen already had a natural boundary for "work that can be lost":
  `confirmAdvancedOuterRect()` transitions the flow away from `outer` and
  initializes advanced panel draft work.
- The missing piece was not more persisted state. It was that shared route-leave
  paths were bypassing the advanced calibration flow state entirely.
- The durable fix was to treat `phase !== "outer"` as the leave-confirm signal
  and route both header back and hardware back through one local dialog handler.

#### Reuse guidance

- When a screen has a clear workflow phase boundary, prefer deriving unsaved
  work from that phase instead of adding another dirty flag.
- Keep destructive-leave guards local when only one flow needs them.
- If a future route needs the same pattern, share only the back-button override
  hook point, not the advanced calibration guard logic itself.

### 2026-06-25: First-time helper button attention cue

#### Original concern

Some users were missing the top-right helper button and not reading the
existing help sheets, especially on first use. The goal was to make the helper
entry point more noticeable without forcing modal onboarding on every screen.

#### What changed

- Added a first-time-only helper attention cue for header help buttons on:
  - select mode
  - default calibration
  - advanced calibration outer help
  - advanced calibration panel-alignment help
  - advanced calibration review help
- Seen state is persisted in MMKV under `quick-panel.seen-help`.
- Opening a help sheet marks that specific help context as seen immediately, so
  the animation stops and stays off on later visits.
- The shared helper button now subscribes reactively to MMKV changes instead of
  reading storage once during render.
- The pulse animation was tuned to a two-ring outward-only sequence with a
  short idle gap, instead of a breathing inward/outward loop.

#### Root cause worth remembering

- The first implementation wrote the MMKV seen flag correctly, but the helper
  button read that state through a plain function call.
- That meant storage changed, but the UI did not re-render right away, so the
  helper kept animating until some unrelated render happened.
- The durable fix was a reactive MMKV-backed hook in
  `src/features/quick-panel/store/storage.ts`, used by the shared
  `HeaderActionButton`.

#### Reuse guidance

- If a future UI element depends on MMKV-backed "seen" state, subscribe to the
  storage key reactively. Do not rely on one-off reads during render.
- Keep helper attention scoped per help context, not globally, so later unseen
  steps can still surface guidance.
- Keep reduced-motion fallback static even when the animated version changes.

### 2026-06-25: Android image picker after system changes

#### Original concern

Importing an image through `expo-image-picker` could fail on Android after the app returned from certain system-level changes. A reliable repro was switching the navigation bar style in device settings, then pressing "Choose from album" again in calibration or customize.

#### Root cause

- This was not specific to the navigation bar UI itself.
- The broader issue is Android activity recreation after a system configuration or window-state change.
- In that state, `expo-image-picker` can try to launch through an `ActivityResultLauncher` that is no longer registered.
- Expo SDK 56 documents the same family of Android `MainActivity` destruction behavior for ImagePicker and exposes `getPendingResultAsync()` as its recovery API.

#### App behavior we kept

- All image-library entry points now go through `src/features/quick-panel/shared/pick-image-from-library.ts`.
- When Android returns the unregistered launcher failure, the app shows a short restart message instead of surfacing an uncaught error.
- Picker failures now flow through translation keys instead of pre-translated strings so the dev language switcher updates the message live.

#### Practical guidance

- Describe this as an Android system-change or system-configuration issue, not a navigation-bar-only bug.
- Common triggers can include:
  - switching gesture navigation and button navigation
  - changing display or window mode on foldables
  - other system UI changes that cause the host activity to refresh
- If the restart message appears, the expected recovery is to close and reopen the app, then retry image selection.

### 2026-06-24: Whole-app responsive reset

#### Original concern

The Fold-specific wide-screen layout pass was too specific and created fragile screen behavior. The app needed to preserve the S25+ reference flow while still behaving well on common phones and Fold 7.

#### What changed

- Removed the app-wide `wide-screen-layout.ts` helper and its tests.
- Replaced numeric screen-level layout policy with Tailwind/Uniwind class constraints in `src/features/quick-panel/shared/QuickPanelScreenShell.tsx` and `src/features/quick-panel/shared/screen-layout.ts`.
- Kept the normal S25+ layout as the baseline: centered phone column, full-width bottom action bars, and the same vertical rhythm as the screenshots under `flow/`.
- Kept runtime measurement only where layout is geometry-dependent:
  - calibration screenshot canvases
  - customize preview fitting
  - export result grid/card fitting
  - landing example height calculation
- Renamed help-sheet sizing from a general layout helper to `src/features/quick-panel/shared/help-sheet-media-layout.ts`, because it only controls bottom-sheet height and example image sizes.
- Fixed select mode after the reset so the two modes remain a non-scrollable row on normal phones, matching the S25+ screenshot.

#### Responsive practice

- Default to phone-first layouts. The S25+ screenshots in `flow/` are the source of truth for normal phone UI.
- Use Tailwind/Uniwind classes for responsive structure, especially width caps and spacing. Prefer shared class constants like `phoneColumnClassName` over screen-specific JS breakpoint objects.
- Do not reintroduce a broad `isWideScreen` or Fold-specific layout helper. Fold/tablet support should usually mean a centered, stable phone-like column unless a screen has a proven need for a different layout.
- Keep JS dimension logic scoped to real measurement problems. If a component needs to fit an image, canvas, or export grid into available space, local measurement is acceptable. If it is only deciding screen structure, use class names.
- Keep bottom action areas outside the main content when the user flow depends on a stable footer. Calibration, select mode, customize with image, and result should not hide primary actions inside scroll content on normal phones.
- Do not add scroll views just to solve wide-screen responsiveness. Add scrolling only when small-device height needs it and make sure it does not change the normal S25+ layout.
- Preserve established screen-specific UX:
  - Select mode shows Default and Advanced in a row on normal phones.
  - Calibration canvases should maximize useful image area without changing footer controls.
  - Customize preview should size from the centered content column, not the whole window.
  - Result export previews should shrink from measured available space, not from device class.

#### Testing and verification

- Remove tests that assert implementation details of deleted responsive helpers.
- Keep focused regression tests for important layout contracts, such as select mode not rendering a `ScrollView`.
- Use `npm test -- --runInBand` and `npm run lint` after responsive refactors.
- Manual verification should include S25+ first, then smaller phones, then Fold 7/tablet widths.

### 2026-06-24: Advanced calibration help-sheet sizing and interaction

#### Original concern

The advanced calibration help sheets regressed during the Fold/wide-screen responsive work.

- The row and column help sheet initially opened too tall on a normal S25 device.
- The outer calibration help sheet then opened too short to show the full content.
- After that was adjusted, the outer calibration help sheet could no longer swipe to page 2 reliably.

#### Root cause

- Several help sheets were using a fixed snap height that was too aggressive for normal phones.
- The outer calibration help sheet was more fragile because it combined:
  - dynamic sheet sizing
  - a horizontally paged inner layout
  - tall image content
- That combination made height measurement and gesture handling unstable.

#### Final solution

- Shared help sheets now use content-fit bottom-sheet sizing with a capped max height from `src/features/quick-panel/shared/help-sheet-media-layout.ts`.
- The row and column help sheet stays vertically scrollable inside that capped sheet.
- The outer calibration help sheet no longer uses horizontal paging.
- Its two former pages are now stacked vertically inside one `BottomSheetScrollView` in `src/features/quick-panel/shared/CalibrationHelpSheet.tsx`.

#### Reuse guidance

- Prefer vertical scroll over nested horizontal paging when help content includes tall images.
- Use explicit image width caps and real aspect ratios to control sheet height.
- When a sheet behaves differently on Fold-style fullscreen and normal phones, fix sizing in shared media helpers first before tuning individual screens.

#### Related verification

- `__tests__/help-sheet-layout.test.ts`
- `__tests__/help-sheet-sizing.test.tsx`
