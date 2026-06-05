# Navigation, Help, And Two-Screenshot Custom Calibration Design

Author: Codex, GPT-5
Date: 2026-06-05
Status: Ready for planning

## Summary

The app's current default and custom calibration flows are functionally usable, but three friction points now block the next level of trust:

- successful calibration can leave repeated landing-screen entries in the native back stack
- the calibration help sheet still explains `Custom layout` as if it were `Default layout`
- custom layouts that extend beyond one screen height cannot be calibrated because the flow only accepts one screenshot

This design keeps the current product model intact while tightening the flow around those gaps:

- navigation returns to one real landing root instead of stacking repeated `/` screens
- the existing help-sheet format stays unchanged, but its copy and illustration become mode-specific
- `Custom layout` supports either one screenshot or a maximum of two screenshots aligned manually with a draggable overlap handle

## Needs

### 1. Navigation must stop stacking home screens

When users save calibration and continue working, backing out of later screens should return them to one landing screen, not a chain of duplicated landing screens before the phone launcher.

### 2. Help must explain the actual mode the user selected

The current help sheet structure is acceptable. The problem is content fidelity:

- `Default layout` needs one-box guidance
- `Custom layout` needs per-panel guidance
- the custom mode needs its own illustration, using `assets/calibrate_customized.jpg`

### 3. Custom calibration must support taller-than-screen layouts

Samsung can place the four supported export panels beyond one visible screen. The app needs a manual two-screenshot path for those cases without expanding scope into auto-stitching, CV, or 3+ screenshots.

## Context

### Current app behavior

- Landing opens calibration and customize routes from `src/features/quick-panel/home/LandingScreen.tsx`.
- Calibration completion currently returns to `/` from `src/features/quick-panel/calibration/hooks/useCalibrationScreen.ts`.
- The shared back control always uses stack back from `src/features/quick-panel/shared/BackButton.tsx`.
- Calibration help always renders one instruction string and one image through:
  - `src/features/quick-panel/calibration/CalibrationHelpSheet.tsx`
  - `src/features/quick-panel/calibration/CalibrationInstructionCard.tsx`
- Custom calibration currently assumes one imported screenshot and one coordinate space.

### Expo Router constraint

Expo Router SDK 56 exposes `dismissTo`, which dismisses back to a target route if present and otherwise replaces with that route. That matches the app's desired "return to the landing root" behavior better than `replace("/")` for a completed calibration flow.

## Product Goals

- Return users to a single landing root after successful calibration.
- Preserve the current calibration help-sheet visual format.
- Make help-sheet content reflect the selected mode.
- Let custom layout calibration operate on one screenshot or two manually aligned screenshots.
- Keep scope bounded to at most two screenshots and no auto-stitching.

## Scope

### In scope

- navigation-stack cleanup for landing, calibration, and customize flow entry/exit
- mode-specific help text for `Default layout` and `Custom layout`
- mode-specific help illustration selection
- manual two-screenshot custom calibration with overlap alignment
- saving custom panel rectangles in one merged coordinate space
- custom calibration flow support for either one screenshot or two screenshots

### Out of scope

- automatic screenshot alignment
- image-feature matching or CV-based stitching
- support for 3 or more screenshots
- changes to default-layout calibration geometry
- redesigning the help sheet layout
- persistent saved screenshot sources after calibration save

## User Experience

### Navigation behavior

1. Landing remains the root route.
2. Entering calibration or customize should not create avoidable duplicate root history.
3. Saving calibration should return to the existing landing route if it exists.
4. After calibration save, backing out of customize should go to one landing screen only.

### Help-sheet behavior

The help sheet keeps the existing shell:

- same bottom sheet
- same title block
- same instruction paragraph
- same illustration card

Only the content changes by mode.

#### Default layout help

- Instruction explains drawing one green box around the full customizable panel stack.
- Illustration remains the current default calibration example.

#### Custom layout help

- Instruction explains calibrating the supported panels one by one and marking hidden panels when needed.
- Illustration switches to `assets/calibrate_customized.jpg`.

### Custom layout screenshot flow

Custom layout should support two valid entry paths:

#### Path A: One screenshot

1. Import one fully expanded Quick Panel screenshot.
2. Continue directly into the current per-panel custom calibration flow.

#### Path B: Two screenshots

1. Import the top screenshot.
2. Import the bottom screenshot.
3. Align the bottom screenshot under the top screenshot with a draggable overlap handle.
4. Confirm the overlap.
5. Continue into the per-panel custom calibration flow using one merged coordinate space.

This keeps the current panel-by-panel flow intact and adds one bounded pre-step only when needed.

## Interaction Model For Two-Screenshot Alignment

### Input assumptions

- both screenshots come from the same phone
- same orientation
- same display scale and font scale
- same fully expanded Quick Panel state
- intentional overlap exists between the bottom of the first screenshot and the top of the second

### Validation rules

- both screenshots must be portrait images
- both screenshots must have the same width
- if the second screenshot is missing, custom mode stays in the one-screenshot path
- the user cannot continue from alignment until both screenshots are present

### Alignment UI

The first version should avoid true image stitching. Instead, it should use a composite calibration canvas:

- top screenshot is fixed at merged Y = `0`
- bottom screenshot is rendered absolutely below it
- a draggable handle adjusts the bottom screenshot's Y origin
- the overlap band is whatever portion visually overlaps after the drag

The alignment interaction only changes vertical placement. No scaling, rotation, or horizontal dragging is allowed.

### Merged coordinate space

Once confirmed, the custom calibration session derives one merged geometry space:

- `mergedWidth = top.width`
- `bottomOffsetY = alignedBottomTop`
- `mergedHeight = max(top.height, bottomOffsetY + bottom.height)`

Every panel rectangle saved after that point uses merged coordinates. A panel box drawn over the lower screenshot stores:

- `savedX = localX`
- `savedY = bottomOffsetY + localY`

This keeps the rest of custom preset generation, preview, and export logic reading one consistent panel-rect system.

## State Model

### Navigation

The route stack should stop using calibration-save replacement as a pseudo-back action. Successful calibration should dismiss to the landing route instead.

### Help content

Help content should derive from `calibrationMode`, not from a single shared translation key or image constant.

### Custom calibration session

The current custom calibration state needs a small session model that stays runtime-only:

- selected source mode: one screenshot or two screenshots
- top screenshot
- optional bottom screenshot
- bottom screenshot Y offset inside the merged canvas
- merged canvas size

This session state should not be persisted as a saved calibration profile. Only final calibrated panel rectangles persist.

## Architecture

### 1. Navigation cleanup

Use Expo Router SDK 56 navigation methods as follows:

- route entry from landing should prefer `navigate(...)` over unconditional `push(...)`
- successful calibration completion should use `dismissTo("/")`

This is intentionally smaller than introducing custom history state.

### 2. Mode-specific help rendering

Introduce a small help-content mapping that returns:

- instruction key
- example label key if needed
- image asset source

for each calibration mode.

This keeps the current help sheet structure unchanged while avoiding duplicated presentation code.

### 3. Composite custom calibration canvas

Do not rasterize a stitched image file.

Instead, render a composite canvas in React Native:

- top image block
- bottom image block positioned by the current overlap offset
- overlay controls using merged coordinates

This avoids file I/O, keeps alignment reversible during the session, and stays within Expo-managed app constraints.

### 4. Reuse existing custom calibration steps after alignment

The per-panel calibration wizard should start only after:

- one screenshot is accepted, or
- the two-screenshot alignment is confirmed

After that point, the current custom panel step flow should remain conceptually the same, except its canvas reads from the merged screenshot session instead of a single image source.

## File Impact

### Likely files to modify

- `src/features/quick-panel/home/LandingScreen.tsx`
- `src/features/quick-panel/calibration/hooks/useCalibrationScreen.ts`
- `src/features/quick-panel/shared/BackButton.tsx` only if a targeted route-aware back fallback is still needed after the main fix
- `src/features/quick-panel/calibration/CalibrationHelpSheet.tsx`
- `src/features/quick-panel/calibration/CalibrationInstructionCard.tsx`
- `src/features/quick-panel/calibration/CalibrationScreen.tsx`
- `src/features/quick-panel/calibration/components/CustomCalibrationCanvas.tsx`
- `src/features/quick-panel/calibration/components/CustomCalibrationStepper.tsx`
- `src/features/quick-panel/calibration/hooks/useCustomCalibrationFlow.ts`
- `src/features/quick-panel/store/quick-panel-store.ts`
- `src/features/quick-panel/store/selectors.ts`
- `src/features/quick-panel/store/quick-panel-defaults.ts`
- `src/features/quick-panel/store/quick-panel-transitions.ts`
- `src/features/quick-panel/model/types.ts`
- `i18next/locales/en.ts`
- `i18next/locales/zh.ts`
- `README.md`
- `CALIBRATION_PLAN.md`

### Likely new files

- one small calibration-session model/helper under `src/features/quick-panel/calibration/`
- one overlap-alignment component for the two-screenshot pre-step
- optionally one small help-content helper if that keeps the help sheet under the repo's file-size target

## Error Handling

- reject a second screenshot if its width does not match the first screenshot
- reject non-portrait screenshots for the two-shot path
- block alignment continue until both screenshots are present
- block custom calibration save with the existing "at least one visible panel" rule
- keep one-screenshot custom mode available when the second screenshot is not needed

## Manual Validation

- Save calibration, then enter customize, then press back once and confirm only one landing screen remains.
- Open help in `Default layout` and confirm the copy and image still describe one-box calibration.
- Open help in `Custom layout` and confirm the copy and image describe per-panel calibration using `assets/calibrate_customized.jpg`.
- Calibrate a short custom layout with one screenshot and confirm the current flow still works.
- Calibrate a tall custom layout with two screenshots and confirm a panel box can be placed across both the upper and lower regions after overlap confirmation.
- Confirm saved custom panel rects still drive preview/export as before after calibration save.

## Open Decisions Resolved

- Use Expo Router stack dismissal rather than custom navigation state: yes.
- Keep the existing help-sheet format: yes.
- Use a separate custom help image: yes.
- Support a maximum of two screenshots: yes.
- Require manual overlap alignment with a draggable handle: yes.
- Exclude auto-stitching: yes.
