# Custom Two-Screenshot Alignment Reliability And Header Trim Design

Author: Codex, GPT-5
Date: 2026-06-06
Status: Ready for planning

## Summary

The current two-screenshot `Custom layout` flow is close to usable, but two issues still block real phone validation:

- the overlap handle does not reliably keep an upward drag after release
- the second screenshot still includes the phone header, so the merged calibration canvas shows duplicate time, signal, and battery chrome

This design keeps the existing bounded two-screenshot model and narrows the next implementation to two focused fixes only:

- replace the current overlap seam interaction with a stable, larger, gesture-driven drag surface
- trim the repeated top band from the second screenshot before the merged custom calibration canvas is confirmed

The design intentionally does not reopen navigation, help-sheet, auto-stitching, multi-shot support, or panel-rect normalization.

## Needs

### 1. Upward overlap must actually persist

The user must be able to drag the lower screenshot upward so it overlaps the upper screenshot and keep that position after release.

### 2. The drag control must be easier to use

The current small orange seam is easy to lose against colorful screenshots and provides too little touch area for a critical gesture.

### 3. The merged canvas must not duplicate the phone header

The second screenshot currently repeats the phone's top chrome. The merged custom calibration canvas should behave like one long screenshot instead of showing two headers.

### 4. Scope must stay bounded

This fix remains within the already approved custom-layout boundaries:

- maximum two screenshots
- manual vertical alignment only
- no CV, feature matching, auto-stitching, or 3+ screenshot support

## Context

### Current implementation behavior

- The custom two-shot path enters the overlap step from `src/features/quick-panel/calibration/CalibrationScreen.tsx`.
- The overlap interaction lives in `src/features/quick-panel/calibration/components/CustomCalibrationOverlapAligner.tsx`.
- The current aligner uses `PanResponder` and a small orange pill.
- The aligner recomputes its canvas height from the current overlap offset while the user drags.
- The runtime custom session stores `bottomOffsetY`, but it does not store any top trim for the second screenshot.
- The merged custom calibration canvas in `src/features/quick-panel/calibration/components/CustomCalibrationCanvas.tsx` renders the second screenshot from its raw top edge.

### Why the current drag feels broken

The current code already allows `bottomOffsetY` values smaller than `topScreenshot.height`, so overlap is supposed to be valid. The reported "moves a few pixels, then bounces back" behavior is more consistent with an interaction-layer failure than with an intentional clamp:

- the seam uses a small responder target inside a scrolling screen
- the canvas height changes as `effectiveOffsetY` changes
- both of those make the control feel unstable even when the stored value model itself allows overlap

## Product Goals

- Make upward overlap stable and reliable on-device.
- Make the overlap control visually obvious enough to use on busy screenshots.
- Remove the repeated top chrome from the lower screenshot before custom panel calibration starts.
- Keep the existing one-shot custom flow unchanged.

## Scope

### In scope

- replace the current overlap seam interaction
- enlarge and restyle the drag surface so it is easier to see and hit
- keep overlap movement vertical-only
- add runtime-only top trimming for the second screenshot
- render the confirmed merged custom canvas using the trimmed lower screenshot
- update docs to describe the seam fix and second-header trim

### Out of scope

- navigation changes
- calibration help content changes
- auto-detecting overlap from image analysis
- support for more than two screenshots
- custom-layout normalization or constrained-column redesign
- persistent storage of raw screenshots after calibration save

## User Experience

### One-shot custom path

The one-screenshot custom path remains unchanged:

1. import one fully expanded Quick Panel screenshot
2. continue directly into the existing panel-by-panel custom calibration flow

### Two-shot custom path

The two-screenshot path becomes:

1. import the top screenshot
2. import the second screenshot
3. trim the repeated top band from the second screenshot
4. drag the seam so the lower screenshot overlaps the upper screenshot correctly
5. confirm the prepared lower screenshot
6. continue into the existing panel-by-panel custom calibration flow

### Alignment surface

The overlap screen should present one stable preparation surface:

- the top screenshot is fixed at `y = 0`
- the lower screenshot is shown as a clipped block whose visible content starts at `bottomCropTopY`
- the seam between the two screenshots is dragged vertically
- the visual canvas height stays fixed during the drag instead of resizing with every move

This means the user sees one preparation screen, not two unrelated mini-tools.

### Drag control design

Replace the current orange seam with a more explicit seam control:

- a full-width translucent seam band across the screenshot join
- a centered high-contrast pill inside the band
- a short hint label such as `Drag to align`
- active-state emphasis while dragging

The seam band is the hit target. The pill is the visual affordance, not the only draggable area.

### Top-band trim control

The second screenshot needs one bounded trim control:

- a horizontal trim line near the top of the second screenshot
- dragging the line moves only downward
- the line cannot move below a reasonable maximum trim window
- the visible lower screenshot content starts below that line

This removes the duplicate system header without introducing freeform cropping.

## Interaction Rules

### Lower screenshot overlap

- only vertical dragging is allowed
- the seam band controls `bottomOffsetY`
- upward overlap is valid
- the lower screenshot must never move so high that its visible content begins above the top of the merged surface
- the lower screenshot must never move so low that it detaches from the preparation canvas entirely

### Lower screenshot top trim

- only downward trimming is allowed
- trimming is bounded to the upper portion of screenshot 2
- trimming is runtime-only session state
- trimming does not rewrite image files on disk

### Confirmation

The user cannot continue until:

- the second screenshot exists
- a valid seam position exists
- a valid trim value exists

The user can still re-import the second screenshot before confirmation.

## State Model

Extend the runtime custom calibration session with one new field:

- `bottomCropTopY`: the number of pixels trimmed from the top of screenshot 2

The full runtime session becomes:

- `sourceMode`
- `topScreenshot`
- `bottomScreenshot`
- `bottomOffsetY`
- `bottomCropTopY`
- `mergedHeight`

This remains runtime-only state. Only final custom panel rects persist after save.

## Geometry Model

### Visible lower screenshot metrics

The lower screenshot should be treated as:

- raw width: `bottomScreenshot.width`
- visible height: `bottomScreenshot.height - bottomCropTopY`
- visible top in raw image space: `bottomCropTopY`

### Alignment-step canvas height

During the preparation step, the visual canvas height should stay fixed to:

- `topScreenshot.height + visibleBottomHeight`

This keeps the drag surface stable while the user adjusts overlap.

### Confirmed merged canvas

After confirmation:

- `mergedWidth = topScreenshot.width`
- `visibleBottomHeight = bottomScreenshot.height - bottomCropTopY`
- `mergedHeight = max(topScreenshot.height, bottomOffsetY + visibleBottomHeight)`

For any panel drawn over the lower screenshot after confirmation:

- `savedX = localX`
- `savedY = bottomOffsetY + localVisibleY`

where `localVisibleY` is measured relative to the trimmed lower screenshot content, not the raw top of screenshot 2.

## Architecture

### 1. Replace the current aligner responder with gesture-handler pan

Use `react-native-gesture-handler` for the seam interaction instead of the current `PanResponder`.

Why:

- it behaves better inside nested scroll views
- it aligns with the rest of the app's gesture stack
- it reduces the chance that parent scroll steals the drag

### 2. Freeze the alignment canvas while dragging

The alignment canvas should no longer resize as `bottomOffsetY` changes. Use a stable visual canvas height during preparation and compute the final merged height only after confirmation.

### 3. Trim the lower screenshot by view composition, not file mutation

Do not create a new bitmap on disk. Render the lower screenshot inside a clipped container:

- container height = visible lower height
- image top = negative trimmed offset

This keeps the implementation reversible and runtime-only.

### 4. Reuse the existing custom calibration flow after confirmation

Once the user confirms trim and overlap:

- seed the custom calibration draft from the merged canvas height
- render the merged custom canvas with the trimmed lower screenshot content
- keep the existing per-panel custom stepper and review flow unchanged

## File Impact

### Likely files to modify

- `src/features/quick-panel/calibration/components/CustomCalibrationOverlapAligner.tsx`
- `src/features/quick-panel/calibration/hooks/useCalibrationScreen.ts`
- `src/features/quick-panel/calibration/custom-calibration-session.ts`
- `src/features/quick-panel/calibration/CalibrationScreen.tsx`
- `src/features/quick-panel/calibration/components/CustomCalibrationCanvas.tsx`
- `src/features/quick-panel/model/types.ts`
- `src/features/quick-panel/store/quick-panel-store.ts`
- `src/features/quick-panel/store/selectors.ts`
- `src/features/quick-panel/store/quick-panel-defaults.ts`
- `src/features/quick-panel/store/quick-panel-transitions.ts`
- `i18next/locales/en.ts`
- `i18next/locales/zh.ts`
- `README.md`
- `CALIBRATION_PLAN.md`

### Likely new helper behavior

`custom-calibration-session.ts` should own:

- clamping trim values
- clamping overlap values
- computing visible lower screenshot metrics
- computing merged screenshot metrics after trim + overlap confirmation

## Error Handling

- reject screenshot 2 if width does not match screenshot 1
- reject screenshot 2 if it is not portrait
- clamp `bottomCropTopY` to a bounded upper region
- clamp `bottomOffsetY` to the allowed preparation range
- preserve the current incomplete-custom-calibration save guard

## Manual Validation

- Import two matching screenshots and drag the seam upward so visible overlap persists after release.
- Confirm the seam can be dragged repeatedly without bouncing back to the old position.
- Confirm the seam band remains easy to see over colorful screenshots.
- Trim the repeated header from screenshot 2 and confirm the merged custom canvas no longer shows two phone headers.
- Continue into panel calibration and confirm a box drawn over the lower screenshot saves and renders in the correct merged Y space.
- Re-run the one-shot custom path and confirm it is unchanged.

## Open Decisions Resolved

- Keep the scope limited to drag reliability and second-header trim: yes.
- Replace the current small seam with a larger full-width seam band: yes.
- Add runtime-only trimming for screenshot 2 instead of file-based image rewriting: yes.
- Keep the solution manual and bounded, with no image analysis: yes.
