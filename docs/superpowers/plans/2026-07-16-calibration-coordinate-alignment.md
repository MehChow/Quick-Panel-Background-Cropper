# Calibration Coordinate Alignment Implementation Plan

> **Execution constraint:** Implement this plan inline, task by task. Do not use
> sub-agents, create commits, stage files, or push branches.

**Goal:** Make the green outer calibration rectangle select the same screenshot
pixels in Default, Advanced Controls, and Advanced Buttons across the outer
step, area preview, editable canvas, and export geometry.

**Architecture:** Separate measured coordinate/clipping surfaces from decorative
borders. Screenshot pixels and coordinate overlays share one borderless surface;
white, dark, and emerald frames become absolute, non-interactive overlays.
Replace the migration-based calibration store with one clean, unversioned
payload so layouts saved with the old distorted surface are not reused.

**Tech stack:** Expo 56, React Native 0.85, TypeScript 6, expo-image, Zustand,
react-native-mmkv, Jest, and React Native Testing Library.

**Design reference:**
docs/superpowers/specs/2026-07-16-calibration-coordinate-alignment-design.md

## Scope and invariants

- Fix the shared outer canvas once so all three calibration modes inherit the
  correction.
- Fix the Advanced read-only area preview independently because it repeats the
  same bordered clipping pattern.
- Do not add border offsets, alternate x/y scales, density compensation, or
  preset corrections.
- Do not change PanelRect, gesture conversion, panel constraint, animation,
  haptic, export, or image-fitting behavior.
- Preserve the existing frame appearance, rounded corners, shadow, and
  pointer behavior.
- Preserve language, seen-help state, last exported mode, and last exported
  Advanced target.
- Read and write only the new `quick-panel.calibrations` key. Leave old
  calibration keys untouched on disk, but never read them as active data.
- Do not add an app version, schema version, geometry version, or migration
  path to the new calibration payload.
- Add no dependencies.

---

## Task 1: Make the shared outer calibration surface borderless

**Files**

- Create:
  src/features/quick-panel/calibration/shared/CalibrationImageSurface.tsx
- Create:
  src/features/quick-panel/calibration/shared/CalibrationImportCard.tsx
- Create:
  __tests__/calibration-image-surface.test.tsx
- Modify:
  src/features/quick-panel/calibration/shared/CalibrationCanvas.tsx

### Step 1: Add a failing surface contract test

Create __tests__/calibration-image-surface.test.tsx. Mock expo-image as a plain
React Native View so its resolved styles can be inspected. Render
CalibrationImageSurface with:

- canvasWidth: 360
- canvasHeight: 780
- scale: 1 / 3
- screenshot: file URI, width 1080, height 2340
- renderOverlay: a Jest function returning a View

Assert all of the following:

1. The shadow wrapper has exactly width 360 and height 780.
2. The coordinate surface has exactly width 360 and height 780.
3. The coordinate surface has no borderWidth in its flattened style.
4. The image fills the coordinate surface with width and height of 100%.
5. renderOverlay is called with 1 / 3 and its returned node is inside the same
   coordinate surface as the image.
6. The outer and inner frame nodes are absolute overlays and both use
   pointerEvents="none".
7. Only frame nodes carry border widths.

Give stable test IDs to the wrapper, coordinate surface, image, outer frame, and
inner frame so the test does not depend on the native tree shape.

Run:

    npm test -- --runInBand __tests__/calibration-image-surface.test.tsx

Expected: FAIL because CalibrationImageSurface does not exist.

### Step 2: Implement the isolated image surface

Create CalibrationImageSurface.tsx with a typed props interface:

    interface CalibrationImageSurfaceProps {
      canvasHeight: number;
      canvasWidth: number;
      renderOverlay: (scale: number) => ReactNode;
      scale: number;
      screenshot: PickedImage;
    }

Use this layer order:

1. Outer self-centered shadow wrapper. It owns the calculated dimensions,
   elevation, and shadow only. It must not use overflow-hidden or borderWidth.
2. Absolute inset-0 coordinate surface. It owns bg-black,
   overflow-hidden, and rounded-[28px], but no border.
3. expo-image with contentFit="fill" and 100% width/height.
4. renderOverlay(scale).
5. Absolute white frame overlay with pointerEvents="none".
6. Absolute dark inner frame overlay with pointerEvents="none".

Keep both frame overlays after the screenshot and selection overlay so their
appearance remains visible without changing layout. The white frame keeps the
existing rgba color and 1.5 width; the inner frame keeps the existing dark rgba
color and 1 width.

The coordinate surface and shadow wrapper must receive identical calculated
dimensions. Do not subtract frame widths and do not alter scale.

### Step 3: Extract the import card without changing behavior

Move ImportScreenshotCard, ExamplePanelImage, exampleImageAspectRatio, and their
UI-only imports from CalibrationCanvas.tsx into CalibrationImportCard.tsx.
Export CalibrationImportCard and preserve:

- the same translations
- tutorial images
- conditional import button
- contentFit values
- classes and responsive widths

This keeps every touched component file below the project guideline of 150
lines and separates the empty state from coordinate rendering.

### Step 4: Wire CalibrationCanvas to the new components

In CalibrationCanvas.tsx:

- Keep viewport measurement and the existing max-width/max-height scale
  calculation unchanged.
- Replace the bordered screenshot View with CalibrationImageSurface.
- Replace the local empty-state helper with CalibrationImportCard.
- Remove frame styles and imports that moved to the extracted files.
- Preserve the controls block and its spacing.

The resulting rendering branch should pass canvasHeight, canvasWidth,
renderOverlay, scale, and screenshot directly to CalibrationImageSurface.

### Step 5: Verify the focused behavior

Run:

    npm test -- --runInBand __tests__/calibration-image-surface.test.tsx
    npm test -- --runInBand \
      __tests__/calibration-screen-empty-state.test.tsx \
      __tests__/advanced-calibration-screen-empty-state.test.tsx
    npx eslint \
      src/features/quick-panel/calibration/shared/CalibrationCanvas.tsx \
      src/features/quick-panel/calibration/shared/CalibrationImageSurface.tsx \
      src/features/quick-panel/calibration/shared/CalibrationImportCard.tsx \
      __tests__/calibration-image-surface.test.tsx
    wc -l \
      src/features/quick-panel/calibration/shared/CalibrationCanvas.tsx \
      src/features/quick-panel/calibration/shared/CalibrationImageSurface.tsx \
      src/features/quick-panel/calibration/shared/CalibrationImportCard.tsx

Expected:

- All focused tests pass.
- ESLint passes.
- Each touched component file is below 150 lines.
- No layout border remains on the measured coordinate surface.

---

## Task 2: Make the Advanced area preview clip borderless

**Files**

- Create:
  src/features/quick-panel/calibration/advanced/components/CalibrationAreaPreviewCard.tsx
- Create:
  __tests__/calibration-area-preview-card.test.tsx
- Modify:
  src/features/quick-panel/calibration/advanced/components/CalibrationAreaPreviewOverlay.tsx
- Verify:
  src/features/quick-panel/calibration/advanced/calibration-area-geometry.ts

### Step 1: Add a failing preview-card geometry test

Create __tests__/calibration-area-preview-card.test.tsx. Mock expo-image as a
React Native View. Render the card with:

    screenshot = {
      uri: 'file:///quick-panel.png',
      width: 1080,
      height: 2340,
    }

    crop = {
      x: 40,
      y: 300,
      width: 1000,
      height: 220,
      radius: 0,
    }

    previewSize = {
      width: 280,
      height: 61.6,
      scale: 0.28,
    }

Assert:

- Wrapper width is 280 and height is 61.6.
- Borderless clipping surface width is 280 and height is 61.6.
- Clipping surface has overflow hidden and no borderWidth.
- Image width is 302.4 and height is 655.2.
- Image left is -11.2 and top is -84.
- Emerald frame is absolute inset-0, has the existing border width/color, and
  uses pointerEvents="none".

Use toBeCloseTo for calculated floating-point values.

Run:

    npm test -- --runInBand __tests__/calibration-area-preview-card.test.tsx

Expected: FAIL because CalibrationAreaPreviewCard does not exist.

### Step 2: Implement the preview card

Create CalibrationAreaPreviewCard.tsx with:

    interface CalibrationAreaPreviewCardProps {
      cardRef: RefObject<View | null>;
      crop: PanelRect;
      previewSize: CalibrationAreaLayout;
      screenshot: PickedImage;
    }

Use four layers:

1. Ref-bearing wrapper at exactly previewSize.width and previewSize.height.
2. Absolute borderless rounded clipping surface with bg-black and
   overflow-hidden.
3. Translated/scaled expo-image inside the clipping surface.
4. Absolute emerald border overlay with pointerEvents="none".

Keep the current image geometry exactly:

    height = screenshot.height * previewSize.scale
    width = screenshot.width * previewSize.scale
    left = -crop.x * previewSize.scale
    top = -crop.y * previewSize.scale

The ref remains on the exact-size wrapper because the existing animation origin
measurement must not change.

### Step 3: Replace only the card body in the overlay

In CalibrationAreaPreviewOverlay.tsx:

- Remove its direct expo-image import.
- Import CalibrationAreaPreviewCard.
- Replace the bordered View and nested Image with the extracted card.
- Keep Modal, backdrop dismissal, accessibility, reduced-motion behavior,
  opacity, transform, origin, and ref flow unchanged.

Do not modify fitCalibrationArea or clampCalibrationAreaRect. Their current
math is valid once the border no longer consumes the clipping box.

### Step 4: Run preview and geometry tests

Run:

    npm test -- --runInBand \
      __tests__/calibration-area-preview-card.test.tsx \
      __tests__/calibration-area-preview.test.tsx \
      __tests__/calibration-area-geometry.test.ts
    npx eslint \
      src/features/quick-panel/calibration/advanced/components/CalibrationAreaPreviewCard.tsx \
      src/features/quick-panel/calibration/advanced/components/CalibrationAreaPreviewOverlay.tsx \
      __tests__/calibration-area-preview-card.test.tsx

Expected:

- The new geometry test passes.
- Existing open/dismiss behavior passes unchanged.
- Existing wide, tall, clamped, and invalid crop geometry tests pass.

---

## Task 3: Replace calibration migration with a clean current store

**Files**

- Modify:
  src/features/quick-panel/store/storage.ts
- Modify:
  src/features/quick-panel/store/quick-panel-store.ts
- Modify:
  __tests__/storage.test.ts
- Modify:
  __tests__/calibration-screen-empty-state.test.tsx
- Modify:
  __tests__/advanced-calibration-screen-empty-state.test.tsx
- Verify:
  src/features/quick-panel/store/quick-panel-defaults.ts

### Step 1: Replace migration tests with the fresh-store contract

Refactor __tests__/storage.test.ts around public behavior.

Add a test that seeds all three old calibration formats:

- quick-panel.is-calibrated and quick-panel.calibration-rect
- quick-panel.calibrations-v2
- quick-panel.calibrations-v3 containing Default, Advanced Controls, and
  Advanced Buttons values

Also seed:

- quick-panel.last-exported-mode = advanced
- quick-panel.last-exported-advanced-target = buttons
- quick-panel.seen-help with at least one true entry

After importing storage.ts, assert:

    loadCalibrations() === {
      default: null,
      advancedControls: null,
      advancedButtons: null,
    }

Then assert the unrelated public loaders still return the seeded mode, target,
and seen-help value.

Add a round-trip test that passes a fully typed current payload to
saveCalibrations, checks it is written only to `quick-panel.calibrations`,
resets modules, and asserts loadCalibrations returns the same value. Assert the
serialized payload has no `version`, `schemaVersion`, or
`geometryVersion` property.

Add an invalid-current-payload test:

- valid Default may be preserved if its rect is valid
- invalid Advanced Controls resolves to null
- empty/invalid Advanced Buttons resolves to null
- malformed JSON returns the all-null current shape

Remove tests for the legacy loadCalibration/saveCalibration API and v2-to-v3
migration because those APIs and migrations will no longer be active.

Run:

    npm test -- --runInBand __tests__/storage.test.ts

Expected: FAIL because storage still reads legacy/v2/v3 data and writes a
versioned key.

### Step 2: Implement the clean unversioned calibration store

In storage.ts:

- Add `calibrationsKey = "quick-panel.calibrations"`.
- Remove the `version` property from SavedCalibrations.
- Make loadCalibrations parse only the unversioned key.
- If parsing fails, return the explicit all-null current shape.
- Make saveCalibrations write only the unversioned key.
- Replace parseCalibrationsV3 with parseCalibrations and validate the three
  current calibration fields without checking a version discriminator.
- Remove SavedCalibrationsV2, parseCalibrationsV2, SavedCalibration,
  loadCalibration, saveCalibration, parseRect, and the active legacy/v2/v3 key
  constants.
- Keep parseRectValue and the existing nested calibration validators.

Do not call storage.remove for old keys. Ignoring them makes the behavior
deterministic while avoiding destructive storage writes and preserving rollback
compatibility.

### Step 3: Update all calibration persistence writes

In quick-panel-store.ts:

- Remove saveCalibration from the storage import.
- Remove the legacy saveCalibration call in acceptCalibration.
- Remove `version: 3` from the Default, Advanced Controls, and Advanced
  Buttons saveCalibrations payloads.

Do not change transition results or in-memory state shapes.

Update the two screen-empty-state storage mocks by removing saveCalibration if
it is no longer imported anywhere in their module graphs. Keep all other mock
exports unchanged.

### Step 4: Verify initialization and absence of active old paths

Run:

    npm test -- --runInBand \
      __tests__/storage.test.ts \
      __tests__/quick-panel-transitions.test.ts \
      __tests__/calibration-screen-empty-state.test.tsx \
      __tests__/advanced-calibration-screen-empty-state.test.tsx
    rg -n \
      "saveCalibration|loadCalibration|calibrations-v2|calibrations-v3|version:" \
      src __tests__
    npx eslint \
      src/features/quick-panel/store/storage.ts \
      src/features/quick-panel/store/quick-panel-store.ts \
      __tests__/storage.test.ts

Expected:

- Focused tests pass.
- The search returns no active source or test references to the removed storage
  APIs, versioned calibration keys, or versioned calibration payloads.
- quick-panel-defaults initializes all three calibration branches to null when
  only old keys exist.
- Mode, Advanced target, and seen-help state remain intact.

---

## Task 4: Regression verification and device acceptance

**Files**

- Verify all changed files from Tasks 1-3.
- Do not modify unrelated source files to satisfy existing unrelated warnings.

### Step 1: Run the complete automated suite

Run in this order:

    npm test -- --runInBand
    npm run lint
    npx tsc --noEmit
    git diff --check

All four commands must exit successfully. If a command fails:

1. Record the exact failing suite/file.
2. Determine whether the failure is caused by this change.
3. Fix only change-related failures.
4. Re-run the focused failure, then the complete command.

### Step 2: Inspect the final source diff

Run:

    git diff -- \
      src/features/quick-panel/calibration/shared \
      src/features/quick-panel/calibration/advanced/components \
      src/features/quick-panel/store \
      __tests__ \
      docs/superpowers
    git status --short

Confirm:

- No coordinate surface has a layout border.
- Frame overlays are absolute and non-interactive.
- No scale or PanelRect compensation was added.
- Existing animation, haptic, and accessibility code is unchanged.
- Storage reads and writes only the unversioned current calibration payload.
- Old calibration keys are ignored, not deleted.
- No unrelated user changes are included.

### Step 3: Perform text-guided device QA

Use one imported 1080 x 2340 Quick Panel screenshot for every branch. Do not use
a browser demo.

**Default**

1. Select a Controls-sized outer rectangle with all four edges aligned to panel
   boundaries.
2. Continue to customization.
3. Confirm the derived panel preview does not gain top/left gaps or
   right/bottom overlap.
4. Export one control and inspect its edge alignment.

**Advanced Controls**

1. Select the same Controls-sized outer rectangle.
2. Open the eye preview before continuing.
3. Confirm preview edges match the green rectangle.
4. Continue to the editable canvas.
5. Confirm the screenshot crop and outer boundary match the original
   selection.
6. Adjust one panel and export it.

**Advanced Buttons**

1. Select the small Wi-Fi/Bluetooth region from the reported reproduction.
2. Open the eye preview and confirm all four edges.
3. Continue to the editable canvas.
4. Confirm the crop has no enlarged top/left gap and no right/bottom intrusion.
5. Export both button images and inspect their boundaries.

**Fresh storage behavior**

1. Launch once with only legacy/versioned calibration data present.
2. Confirm Default, Advanced Controls, and Advanced Buttons each require a new
   calibration.
3. Confirm the last exported main mode and Advanced target are still
   preselected.
4. Confirm previously seen help remains seen.
5. Save new calibrations, relaunch, and confirm the current unversioned payload
   restores.

Acceptance tolerance: stage-to-stage edges may differ by at most one physical
pixel from raster rounding. The mismatch must not grow as the selected region
gets smaller.

### Step 4: Prepare the handoff

Report:

- the two corrected border-participation sites
- the clean calibration-store reset behavior
- focused and full verification command results
- manual QA branches completed or still pending
- any remaining risk

Do not commit, stage, or push. Suggested commit message after implementation:

    fix: align calibration crops with visible selection

## Completion checklist

- [ ] Shared outer screenshot and overlay occupy the same borderless surface.
- [ ] Default, Advanced Controls, and Advanced Buttons inherit the fix.
- [ ] Area preview clips at the full calculated size.
- [ ] Decorative frames do not affect layout or gestures.
- [ ] Editable canvas receives accurate newly saved outerRect data.
- [ ] Legacy and versioned calibrations are not loaded.
- [ ] The unversioned current calibration payload round-trips.
- [ ] Non-calibration preferences survive the storage replacement.
- [ ] Focused tests pass.
- [ ] Full Jest, ESLint, TypeScript, and diff checks pass.
- [ ] Small Buttons-only crop passes device QA.
- [ ] Controls crop passes device QA.
- [ ] No commits, staging, pushes, dependencies, or unrelated edits.
