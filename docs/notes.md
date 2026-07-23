# Notes

This file is a running project note log for implementation details that are easy to forget, regress, or repeat.

## What belongs here

- UI behaviors with non-obvious constraints
- Bug patterns and their root causes
- Fix patterns that should be reused
- Device-specific findings
- Testing notes that explain why coverage exists

## Entries

### 2026-07-22: Buttons Customize preview and aligned PNG export

This entry supersedes the older identifier sizing/classification details below.
The durable rule is that preview and export use the same source-coordinate
composition. They differ only in the scale and origin used to project that
composition onto the preview stage or a 1024x1024 PNG.

#### Shared coordinate contract

- Calibration produces every Button rectangle in screenshot/source
  coordinates. `createButtonsPreset` also calculates one shared
  `referenceCellSize` from the smaller calibrated grid-cell dimension.
- Customize keeps one image transform in the same coordinate system:
  `{ x, y, scale }`. Pan and pinch update that transform; they do not create
  separate per-panel crops.
- Preview and export receive the same panel rectangles, image transform, Button
  image opacity, identifier visibility/intensity, and normalized horizontal or
  vertical identifier positions.
- Do not introduce a second export-only crop, transform, or identifier sizing
  model. Spatial alignment depends on projecting the same source values.

#### Image handling in Customize preview

- The normalized original image remains the export source and supplies the
  logical image width and height.
- For responsiveness, images with a long edge above 1080 may get a temporary
  PNG preview proxy. Only its URI changes: the proxy is still rendered with the
  original image's logical dimensions, so switching between proxy and original
  does not change placement geometry.
- The preview frame is the union of visible panels. Its measured width produces
  `layoutScale = renderedPreviewWidth / sourcePreviewWidth`.
- Each `PanelSlice` is placed at its scaled source rectangle and clips its own
  contents. Every slice renders the same full image; it is aligned locally with:

  ```text
  translateX = (transform.x - panel.rect.x) * layoutScale
  translateY = (transform.y - panel.rect.y) * layoutScale
  imageScale = transform.scale * layoutScale
  ```

- Because each slice subtracts its own panel origin, adjacent Buttons reveal
  matching parts of one continuous image rather than unrelated crops.
- Button image intensity is applied to the image layer. Identifier visibility
  and intensity are applied independently above it. The white preview frame is
  decorative and is never exported.
- The preview stage currently has its own `0.9` display opacity. This affects
  on-screen appearance, not geometry or exported PNG alpha.

#### Identifier handling in Customize preview

- Identifier type comes from exact grid spans:
  - `1xN`, `N > 1`: icon and text, vertically centered; Horizontal applies.
  - `Nx1`, `N > 1`: icon only, horizontally centered; Vertical applies.
  - `1x1`: centered icon only; position controls are ignored.
  - Any other `NxM`: icon top-left and text bottom-right; position controls are
    ignored.
- Identifier sizes are derived from the shared cell reference, never from the
  full panel short side. Preview passes
  `referenceCellSize * layoutScale`, which keeps `1x4`, `3x1`, `3x3`, and other
  shapes at the same apparent size.
- Current cell-relative proportions are: glyph `0.34`, text `0.18`, gap `0.08`,
  normal/corner inset `0.14`, and circle diameter `1.75 * glyph size`.
- Corner labels add another `0.04` cell on the bottom and right. Their maximum
  width reserves that extra inset, preventing the text or shadow from being
  clipped while leaving the approved icon position unchanged.
- Horizontal icon-and-label groups are measured before their normalized slider
  position is converted into a safe absolute offset. Vertical movement uses
  the full circle diameter when calculating safe travel.

#### Converting the composition to aligned PNGs

- Good Lock expects one 1024x1024 PNG per Button. A non-square panel is first
  represented by a centered square whose side is
  `max(panel.width, panel.height)`. The square may include source-image area
  outside the visible Button; Good Lock performs the final panel-shaped clip.
- `ExportSurface` renders from the normalized original image, not the preview
  proxy. With `squareScale = renderSide / square.width`, it projects the same
  image transform as follows:

  ```text
  left = (transform.x - square.x) * squareScale
  top = (transform.y - square.y) * squareScale
  width = image.width * transform.scale * squareScale
  height = image.height * transform.scale * squareScale
  ```

- `getButtonExportBounds` maps the visible panel rectangle into its centered
  export square. The identifier is constrained to those visible bounds, not to
  the full 1024x1024 file.
- Export identifier metrics use
  `referenceCellSize * squareScale`. Raw identifier pixels therefore differ
  between a `1x4`, `3x1`, and `3x3` PNG, which is intentional: Good Lock scales
  those square files by different amounts. After application, the identifiers
  return to the same cell-relative size seen in Customize and in default Quick
  Panel Buttons.
- The off-screen surface uses `1024 / PixelRatio.get()` layout points and
  `react-native-view-shot` captures it at exactly 1024x1024 pixels. All sizing
  stays proportional, so device density cancels instead of changing the final
  apparent identifier size.
- Exports mount and capture one panel at a time in `goodLockOrder`. Capture
  waits for the original image to load. A visible horizontal identifier also
  waits for its measured width and committed position; readiness tokens prevent
  callbacks from an older panel/run from capturing the wrong surface.
- Captures are PNG, copied to the cache with stable filenames, then saved to the
  media-library album. A failed run cleans only files created by that run.

#### Alignment guardrails

- Keep source image dimensions and `{ x, y, scale }` authoritative for both
  preview and export.
- Keep identifier metrics cell-relative; never size them from the whole panel
  or add fixed point caps for export.
- Keep non-square identifier bounds inside the visible centered-square
  sub-rectangle.
- Preserve horizontal measurement readiness when changing label layout or
  localization behavior.
- Regression coverage must include mixed `1xN`, `Nx1`, `1x1`, and corner
  panels, more than one `PixelRatio`, preview/export opacity, and sequential
  capture readiness.

### 2026-07-20: Customize pinch continuity

- Pinch-start flash came from stale pan start state and competing simultaneous
  pan/pinch transform writes. Pinch now captures transform and focal point when
  activated, owns updates while active, and pan uses incremental deltas.
- Android `ACTION_POINTER_UP` keeps RNGH pinch active, changes focal point to
  remaining finger, then emits one trailing update. `onTouchesUp` now freezes
  transform at two-to-one transition and ignores that invalid update.
- One-finger pan resumes from frozen transform. Returning second finger rebases
  existing pinch recognizer to current transform, focal point, and gesture
  scale before accepting more zoom updates.
- Clamp, export geometry, persisted transform behavior, and stored app data
  remain unchanged.
- Regression coverage reproduces Android event order, pointer-lift stability,
  pan continuation, and second-finger return. Full verification passed: 41
  Jest suites, 144 tests, ESLint, TypeScript, and `git diff --check`.

### 2026-07-17: Buttons-only performance baseline

Target fixture: `SM-S9360`, One UI 8.5 (`ro.build.version.oneui=80500`),
QuickStar 10.0.04.26, local `apk` release variant, 1920x1080 approximately
3.58 MB PNG, six mixed Buttons, and a 4x5 grid. The device is connected and
app data was not cleared, but the exact baseline was not run: `npm run
build-apk` stopped before Gradle because the four Android upload-key values are
not configured, the `.apk` application id is not installed, and the fixture
image is not present in the workspace. Dev-client or production measurements
were not substituted.

| sample | janky/deadline rate | p95 frame time | slow UI frames | slow bitmap uploads | duration | peak PSS | graphics memory | swap | visible result | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| calibration move | unavailable: signed APK not built | unavailable: signed APK not built | unavailable: signed APK not built | unavailable: signed APK not built | unavailable: fixture not run | unavailable: fixture not run | unavailable: fixture not run | unavailable: fixture not run | not run | Upload-key configuration is required before the clean baseline. |
| calibration resize | unavailable: signed APK not built | unavailable: signed APK not built | unavailable: signed APK not built | unavailable: signed APK not built | unavailable: fixture not run | unavailable: fixture not run | unavailable: fixture not run | unavailable: fixture not run | not run | Upload-key configuration is required before the clean baseline. |
| Customize pan | unavailable: signed APK not built | unavailable: signed APK not built | unavailable: signed APK not built | unavailable: signed APK not built | unavailable: fixture not run | unavailable: fixture not run | unavailable: fixture not run | unavailable: fixture not run | not run | Upload-key configuration is required before the clean baseline. |
| Customize pinch | unavailable: signed APK not built | unavailable: signed APK not built | unavailable: signed APK not built | unavailable: signed APK not built | unavailable: fixture not run | unavailable: fixture not run | unavailable: fixture not run | unavailable: fixture not run | not run | Upload-key configuration is required before the clean baseline. |
| export | unavailable: signed APK not built | unavailable: signed APK not built | unavailable: signed APK not built | unavailable: signed APK not built | unavailable: three runs not captured | unavailable: three runs not captured | unavailable: three runs not captured | unavailable: three runs not captured | not run | Spinner/pulse, output fidelity, and Good Lock application still require device QA. |

Implementation status: calibration gestures now keep their draft rectangle on
the UI thread and commit once; Customize uses an owned 1080-long-edge preview
proxy with transform-only panel rendering; export mounts and captures one
Good Lock-order surface at a time. Automated verification passes with 40 Jest
suites and 138 tests, ESLint, TypeScript, `git diff --check`, and an Android
production bundle export to a temporary directory. Performance, output-
fidelity, update/persistence, and Good Lock acceptance gates remain unclaimed
until the signed fixture can be built and measured.

### 2026-07-17: Compact Button Customize adjustment tabs

- Replaced the stacked Button Customize sliders with four direct adjustment
  tabs and one active slider so the live preview remains visible while tuning.
- Image is the default tab. Hiding identifiers from Identifier, Horiz., or
  Vert. immediately returns to Image while preserving all adjustment values.
- Orientation tabs remain conditional on the active Buttons preset.
- Values, defaults, preview/export behavior, and persistence remain unchanged.
- Additional arbitrary tuning: None.
- Android dev build, install, launch, and JS bundle loading succeeded on
  `SM-S9360` running One UI 8.5. The user confirmed the compact UI, live
  behavior, export result, and applied Good Lock output; QuickStar version was
  not recorded.

### 2026-07-17: Buttons identifier position controls

- Horizontal and vertical long Buttons use independent, screen-local position
  sliders. Both start at 50 and reset whenever Customize is entered.
- Preview and export share normalized position intent, then constrain movement
  from their own rendered bounds, safe insets, and content sizes.
- Horizontal icon-and-label groups move together after their localized content
  width is measured. Vertical icons move independently while staying centered
  on the horizontal axis.
- Equal-span Buttons such as `1x1` and `2x2` keep their previous identifier
  placement and ignore both position values.
- Export capture waits for every image and for the final committed placement of
  each visible horizontal identifier that requires measurement.
- Additional arbitrary tuning: None.
- Device QA was not run in this session because ADB reported no connected
  device. Earlier visual evidence identified `SM-S9360`; its One UI and
  QuickStar versions were not recorded.

### 2026-07-17: Buttons-only identifier overlays

- Button identifiers are available only in Advanced Buttons-only previews and
  exports. Default and Advanced Controls rendering remain unchanged.
- Grid spans determine identifier shape: `1x1` is centered icon-only, vertical
  spans are top-centered icon-only, and every other shape is a left-centered
  icon plus the localized label.
- Identifier visibility and intensity are screen-local Customize choices. Each
  visit starts enabled at 70%; turning visibility off preserves the slider value
  until the screen is left. Button image intensity remains separate at 78%.
- Icon and text stay fixed white (`#FFFFFF`) with one shared opacity and a subtle
  dark shadow. No capsule, scrim, or backing is added.
- Preview and export share classification and proportions but use separate
  absolute size clamps. Exports calculate placement from the visible Button
  sub-rectangle inside the centered square crop.
- Custom labels require one of four persisted icon choices: Star, Zap, Home, or
  App Window. Built-in icons remain derived from the stable catalog mapping.
- Arbitrary built-in icon mappings: None. The approved semantically matched map
  was implemented unchanged.

### 2026-07-16: Calibration crop coordinate alignment

#### Root cause

- Shared calibration canvas measured screenshot width and height before applying
  a layout border to same container.
- Screenshot rendered inside border, but green selection overlay still used
  outer dimensions and scale.
- Saved rectangle became slightly compressed toward top-left. Small
  Buttons-only selections magnified visible gap and overlap.
- Advanced area preview repeated same bug with its bordered clipping view.
- Later editable canvas and exports received already-wrong `outerRect`; they
  exposed upstream error rather than creating separate offset.

#### Fix

- Screenshot and green overlay now share one exact-size, borderless coordinate
  surface in `CalibrationImageSurface`.
- White/dark screenshot frames moved to absolute, non-interactive overlays.
  Shadow wrapper keeps existing rounded appearance without changing geometry.
- Advanced eye preview now clips through borderless
  `CalibrationAreaPreviewCard`; emerald frame is absolute and non-interactive.
- No border compensation, alternate axis scale, preset adjustment, or export
  geometry change added.

#### Storage reset

- Removed legacy, v2, and v3 calibration migration/fallback paths.
- Current calibration data uses stable unversioned
  `quick-panel.calibrations` key.
- Old calibration keys are ignored, forcing one accurate recalibration.
- Language, seen-help state, last exported mode, and last Advanced target remain
  separate and preserved.

#### Verification

- Added exact-size surface and small-crop preview regression tests.
- Full result: 28 Jest suites, 64 tests, ESLint, TypeScript, and
  `git diff --check` passed.
- Device retest confirmed visible green selection now matches later crop.

### 2026-07-16: Controls preview and Button image intensity

- One UI 8.5 device measurements show Controls retain about 50% of source
  image contrast, while Button PNG alpha is applied linearly.
- Controls therefore preview at 50% image opacity without a black overlay, but
  still export at full opacity so One UI applies its treatment only once.
- The local Button image intensity slider continues to affect both Button
  preview and Button exports, with the existing 78% default unchanged.

### 2026-07-08: Advanced calibration single-axis snap dots

#### Original concern

Advanced calibration grid preview became misleading when one axis was `1`.

- `4 x 1` grid showed no useful horizontal separation hint for side-by-side panels.
- `1 x 4` grid had same problem in opposite direction.
- Problem affected both Advanced Controls and Advanced Buttons because both use same grid overlay.

#### Root cause

- Grid overlay rendered only dot intersections.
- When `rows === 1`, all dots collapsed into single horizontal band.
- When `columns === 1`, all dots collapsed into single vertical band.
- Snap math itself still worked. Only preview language failed.

#### Final solution

- Keep real grid values unchanged. `1` stays `1`.
- Change shared point generator in `src/features/quick-panel/calibration/advanced/advanced-grid.ts`.
- For `4 x 1`, render internal column dots on vertical separators, centered on outer rect mid-height.
- For `1 x 4`, render internal row dots on horizontal separators, centered on outer rect mid-width.
- For `1 x 1`, render no dots.
- For grids where both axes are greater than `1`, keep full intersection-dot overlay.

#### Reuse guidance

- Do not fake single-axis grids by forcing minimum `2` rows or columns in state.
- If preview cue weak but snap behavior correct, fix overlay first before changing calibration model.
- Shared advanced grid helpers are right hook point when Controls-only and Buttons-only show same preview bug.

#### Related verification

- `npm run lint -- src/features/quick-panel/calibration/advanced/advanced-grid.ts`

### 2026-07-08: v3 Advanced Buttons-only flow

#### What shipped

- Advanced mode now supports a separate Buttons-only branch in addition to the
  existing Controls flow.
- The Select Mode screen remembers the last successful export choice for both:
  - main mode (`Default` or `Advanced`)
  - advanced target (`Controls only` or `Buttons only`)
- The restore behavior is intentionally split across both visible steps:
  - step 1 preselects the last mode
  - step 2 preselects the last advanced target
  - the UI does not auto-skip directly into the target step
- Buttons label selection uses a toggle list with a compact selected-chip
  summary instead of reorder controls.
- The Customize screen exposes a local Button panel opacity slider that affects
  both live preview and exported Button PNGs. It is not persisted and resets on
  a fresh screen visit.
- The export result card shows `GeneratedExport.label` directly, so dynamic
  Button exports display their real label text instead of raw translation keys
  like `panels.button-1`.

#### Root causes worth remembering

- The old v2 last-used behavior only persisted `lastExportedMode`. After v3
  split Advanced into Controls and Buttons, the branch choice disappeared
  because there was no companion persisted field for the advanced target.
- Result-screen translation for Buttons failed because those exports have
  dynamic ids (`button-1`, `button-2`, ...), but the success card tried to
  translate them through static keys under `panels.*`.
- The visible center block regression came from a segmented Button-only image
  renderer that intentionally left the center empty. The durable fix was to go
  back to full-fill rendering and control perceived intensity with opacity
  instead of cutout geometry.
- The Button selection UX problem was not a data problem. The screen already
  knew which labels were selected; the issue was that selected state lived in a
  separate list below the main results, forcing users to scroll to confirm it.

#### Reuse guidance

- If Advanced gains more export branches later, extend the same last-export
  persistence pattern instead of inventing screen-local restore logic.
- For dynamic panel ids, do not reconstruct result labels from translation keys
  unless the ids are guaranteed to map to static locale entries. Prefer the
  display label already captured in the preset/export pipeline.
- Keep Button opacity as a screen-level control unless there is a proven need
  for persistence. The local-state version is enough for v3 and keeps storage
  schema simpler.
- If the user wants selection state to feel obvious, put that state directly on
  the main interactive rows first. Separate "selected items" sections are easy
  to implement but usually worse to scan.
### 2026-07-09: Crashlytics beta observability and Android build variants

#### Original concern

The app needed minimal crash visibility for APK smoke testing and Google Play
open beta without turning daily local development into a Firebase setup
problem. The APK build uses a different package suffix than the beta build, so
Firebase package matching had to stay aligned with the active Android variant.

#### What changed

- Added React Native Firebase Crashlytics with a small wrapper in
  `src/lib/crashlytics.ts`.
- Crash logging is limited to high-value failure points:
  - image picking
  - image normalization
  - export failure
  - per-panel export capture failure
  - Good Lock unavailable / Samsung Store open failure
- Added `firebase.json` to keep Crashlytics debug collection off and disable JS
  exception-handler chaining.
- Added privacy-policy disclosure in `docs/index.html` for Firebase
  Crashlytics.
- Android build variants now select Firebase config by `APP_VARIANT`:
  - `apk` -> `google-services/google-services-apk.json`
  - `beta` -> `google-services/google-services-open.json`
  - `dev` -> no Firebase plugin wiring and no `googleServicesFile`
- Renamed the Play AAB build path from `build-closed` to `build-beta`.
- `build-beta` now runs Android prebuild before bundling so variant-specific
  native config is applied consistently.

#### Root cause worth remembering

- The important constraint is not "one google-services file per repo". It is
  "the runtime Android package name must match a Firebase Android app present
  in the selected Google Services config."
- The dev build has a `.dev` package suffix, so wiring Firebase there without a
  matching Firebase app would create avoidable native setup failures.
- The durable fix was to keep Firebase native config variant-aware in
  `app.config.ts` instead of hardcoding one `googleServicesFile` in `app.json`.

#### Reuse guidance

- Keep Crashlytics context conservative. Do not send image contents, image
  filenames, local file paths, or other user-selected media metadata in custom
  keys or logs.
- If a future Android variant changes `applicationId` or adds a suffix, decide
  its Firebase wiring at the same time.
- For variant-specific native config in this repo, prefer `APP_VARIANT` in
  `app.config.ts` plus wrapper scripts, not manual file swapping before builds.
- If the Play release path changes again, keep the public script name aligned
  with the actual distribution stage (`beta`, `production`, etc.) so the docs
  and workflow stay obvious.
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

### 2026-07-20: Toggleable Customize source-image context

- Customize can reveal the transformed source image around panel shapes; only
  the outside area is dimmed, while panel opacity and overlays keep their
  previous behavior.
- The eye preference defaults on and persists under
  `quick-panel.show-source-image-context`; it never changes transform or export
  data.
- A localized header helper explains QuickStar's square-crop movement limit.
- The preview always reserves the placement-frame geometry. The eye control now
  sits beside `Select another image` in the fixed footer and changes only layer
  visibility, so the stage and image nodes never resize, unmount, or flash.
- One inset amber outline shows the complete preview movement boundary; it is
  preview-only and remains mounted with zero opacity in the clean state.
- Panel borders render as absolute overlays instead of participating in the
  image clipping surface, so eye toggles preserve the exact image position.
- The helper explains the preview-only amber movement boundary in its own
  localized paragraph.

### Reusable release announcement

- `docs/release-announcement-guideline.md` is the source of truth for future startup announcements.
- Use a stable reason-based ID such as `v1.1.0-release-announcement`; do not use the Expo version or Android version code.
- Store acknowledgement separately from calibration and preserve all unrelated MMKV keys.
- Keep the shared dialog styled like `AdvancedCalibrationLeaveDialog`; change only localized content and the active descriptor for future releases. The standard CTA only acknowledges and closes the panel.
