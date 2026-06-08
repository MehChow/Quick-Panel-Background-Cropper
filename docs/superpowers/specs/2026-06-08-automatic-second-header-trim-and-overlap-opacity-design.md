# Automatic Second Header Trim And Alignment Opacity Design

Author: Codex, GPT-5
Date: 2026-06-08
Status: Ready for planning

## Summary

The current two-screenshot `Custom layout` preparation step still has one product problem and one usability problem:

- `裁切重複的手機頂部` does not work well enough in practice, and the trim should no longer be a user decision
- screenshot 2 is fully opaque during alignment, which makes it harder to visually match overlap against screenshot 1

This design replaces manual top-band trimming with one bounded automatic runtime trim, keeps manual seam alignment as the only user-controlled step, and renders screenshot 2 with reduced opacity during the preparation step only.

The design intentionally does not reopen navigation, help-sheet content, normalization redesign, auto-stitching, CV, feature matching, or support for more than two screenshots.

## Needs

### 1. Header trimming must stop being user-controlled

The app should decide how much repeated phone chrome to remove from screenshot 2. The user should not need to drag a crop control for that.

### 2. The merged calibration canvas must not show a duplicated phone header

The confirmed custom calibration surface should still behave like one long screenshot instead of two screenshots stacked with repeated status/time chrome.

### 3. Alignment must be visually easier

The lower screenshot needs partial opacity during the alignment step so the user can see both layers while matching overlap.

### 4. Scope must stay bounded

This remains inside the current approved two-shot boundaries:

- maximum two screenshots
- manual vertical seam alignment only
- no CV, feature matching, automatic overlap detection, or 3+ screenshot support

## Context

### Current implementation behavior

- The two-shot alignment screen lives in `src/features/quick-panel/calibration/components/CustomCalibrationOverlapAligner.tsx`.
- Runtime session state already carries `bottomCropTopY`, `bottomOffsetY`, `bottomScreenshot`, and `mergedHeight`.
- Screenshot 2 is currently rendered fully opaque in the preparation step.
- The manual trim UI is a floating label, not a strong crop-line affordance.
- `useCalibrationScreen.ts` seeds screenshot 2 with a fixed trim value of `120`.
- `custom-calibration-session.ts` currently clamps trim with `min(height * 0.2, 240)`.

### Why the current trim feels like it does not work

The failure is mostly product and UX, not data plumbing:

- the user does not get a strong visual indication that the crop line moved
- the current crop control is weak enough that it is easy to miss or misunderstand
- the current fixed seed is not explicitly tied to the device-scale top chrome we want to remove

The merged canvas already knows how to render trimmed lower content, so the biggest remaining issue is how the trim value is chosen and how the preparation step communicates the overlap.

## Product Goals

- Remove the repeated phone header from screenshot 2 automatically at import time.
- Keep manual seam alignment as the only user-controlled two-shot preparation action.
- Make screenshot overlap easier to judge by reducing lower-layer opacity during preparation.
- Keep the one-shot custom calibration path unchanged.

## Scope

### In scope

- replace manual header trimming with automatic runtime trim for screenshot 2
- keep `bottomCropTopY` as runtime state because merged geometry already depends on it
- remove the manual trim gesture and trim copy from the alignment surface
- render screenshot 2 with reduced opacity during alignment
- keep the confirmed merged custom calibration canvas based on trimmed lower content
- update docs to describe automatic trim plus translucent alignment

### Out of scope

- navigation changes
- help-sheet changes
- image analysis or feature matching for automatic overlap detection
- support for more than two screenshots
- normalization, constrained-column, or panel-rect redesign
- bitmap rewriting or file mutation on disk

## User Experience

### One-shot custom path

The one-screenshot custom path remains unchanged:

1. import one fully expanded Quick Panel screenshot
2. continue directly into the existing custom per-panel calibration flow

### Two-shot custom path

The two-screenshot path becomes:

1. import the top screenshot
2. import the second screenshot
3. the app automatically trims the repeated top phone chrome from screenshot 2
4. screenshot 2 appears semi-transparent over the preparation surface
5. the user drags the seam vertically to align overlap
6. the user confirms and continues into the existing custom per-panel calibration flow

### Alignment surface

The preparation screen should now ask the user to do one thing only:

- align screenshot 2 vertically against screenshot 1

The app should not present a separate crop decision. The lower screenshot should:

- start at the automatically trimmed visible top
- render with partial opacity
- keep the current stable seam control for vertical drag

### Confirmed custom calibration canvas

After confirmation:

- screenshot 2 returns to full opacity
- the merged canvas uses the already-trimmed lower content
- the existing per-panel calibration flow remains unchanged

## Interaction Rules

### Automatic trim

- trim is computed immediately when screenshot 2 is imported
- trim is runtime-only session state
- trim is recomputed if the user re-imports screenshot 2
- trim is not editable by the user in the two-shot preparation screen

### Seam alignment

- only vertical seam dragging remains user-controlled
- upward overlap remains valid
- screenshot 2 opacity reduction applies only in the preparation step
- confirmed calibration rendering stays fully opaque

### Failure behavior

If the automatic trim estimate is imperfect, the current bounded manual seam still lets the user position the visible lower content correctly. The app should prefer a conservative trim that removes duplicate phone chrome without cutting into the panel content area.

## State Model

Keep the existing runtime session shape:

- `sourceMode`
- `topScreenshot`
- `bottomScreenshot`
- `bottomOffsetY`
- `bottomCropTopY`
- `mergedHeight`

`bottomCropTopY` remains necessary, but it becomes app-derived runtime geometry instead of a user-adjusted preparation value.

## Geometry Model

### Automatic trim heuristic

The automatic trim should be deterministic and bounded. For the first version, use a width-derived estimate anchored to the current Samsung target shape:

```ts
estimatedTrim = Math.round(bottomScreenshot.width * 0.165);
bottomCropTopY = clampBottomCropTopY(estimatedTrim, bottomScreenshot.height);
```

This deliberately stays heuristic-only:

- no CV
- no pixel scanning
- no content detection

The ratio is tied to device scale instead of a fixed pixel constant, which is more stable across same-family Samsung screenshots than the current hardcoded `120` seed.

### Visible lower screenshot metrics

The lower screenshot still uses:

- raw width: `bottomScreenshot.width`
- visible height: `bottomScreenshot.height - bottomCropTopY`
- visible top in raw image space: `bottomCropTopY`

### Alignment-step appearance

During the preparation step:

- screenshot 1 opacity = `1`
- screenshot 2 opacity = fixed alignment opacity such as `0.55`
- visual canvas height remains `topScreenshot.height + visibleBottomHeight`

### Confirmed merged canvas

After confirmation:

- `mergedWidth = topScreenshot.width`
- `visibleBottomHeight = bottomScreenshot.height - bottomCropTopY`
- `mergedHeight = max(topScreenshot.height, bottomOffsetY + visibleBottomHeight)`
- screenshot 2 opacity returns to `1`

## Architecture

### 1. Replace manual trim seeding with one automatic helper

Add one pure helper in `custom-calibration-session.ts` that calculates automatic runtime trim for screenshot 2. The import flow in `useCalibrationScreen.ts` should call that helper instead of seeding `120`.

### 2. Remove trim interaction from the overlap aligner

`CustomCalibrationOverlapAligner.tsx` should stop rendering the crop gesture and crop label. The screen should only show:

- the top screenshot
- the trimmed lower screenshot
- the seam drag control

### 3. Add fixed lower-layer opacity during preparation

Apply reduced opacity to the lower screenshot in the overlap aligner only. Do not carry that opacity into `CustomCalibrationCanvas.tsx`.

### 4. Reuse the existing merged custom calibration flow

The current merged-height and clipped lower-screenshot rendering model already fits the automatic trim behavior. Do not redesign the merged custom calibration flow unless implementation proves a real mismatch.

## File Impact

### Likely files to modify

- `src/features/quick-panel/calibration/custom-calibration-session.ts`
- `src/features/quick-panel/calibration/hooks/useCalibrationScreen.ts`
- `src/features/quick-panel/calibration/components/CustomCalibrationOverlapAligner.tsx`
- `src/features/quick-panel/calibration/CalibrationScreen.tsx`
- `i18next/locales/en.ts`
- `i18next/locales/zh.ts`
- `README.md`
- `CALIBRATION_PLAN.md`

### Likely tests to update or add

- `__tests__/custom-calibration-session.test.tsx`
- `__tests__/custom-calibration-flow.test.tsx` only if the current interface assertions break

## Risks And Mitigations

### Risk 1: The heuristic trim under-trims on some screenshots

Mitigation:

- use a width-scaled estimate instead of a fixed literal
- keep the existing trim clamp
- validate on the user’s device with real screenshots before broadening anything

### Risk 2: The heuristic trim over-trims into panel content

Mitigation:

- keep the ratio conservative
- keep the cap bounded by the existing clamp helper
- prefer leaving a small amount of chrome over cutting into real panel content

### Risk 3: Lower-layer opacity hurts visibility on some screenshots

Mitigation:

- keep opacity fixed and moderate, around `0.55`
- restore full opacity after confirmation
- adjust the constant only if device validation proves it is too faint or too strong

## Verification

- Import screenshot 2 and confirm the app assigns trim automatically without showing a trim control.
- Verify screenshot 2 appears semi-transparent during alignment.
- Verify the confirmed merged custom calibration canvas no longer shows duplicated phone header chrome.
- Verify upward seam drag still persists after release.
- Verify one-shot custom calibration is unchanged.
- Run `npm run lint`.
- Run `npm test -- --runInBand`.

## Decisions

- Make second-header trimming automatic instead of user-controlled: yes.
- Keep the trim runtime-only and heuristic-based instead of using image analysis: yes.
- Add reduced opacity to screenshot 2 during alignment only: yes.
- Keep manual vertical seam alignment as the only two-shot preparation input: yes.
