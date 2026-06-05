# Custom Layout Preview And Calibration Persistence Design

Author: Codex, GPT-5
Date: 2026-06-05
Status: Ready for implementation

## Summary

The current custom-layout export path is usable, but the final preview still misleads users in two ways:

- the custom `buttonBox` preview can visibly squash faces and other subjects even when the exported Quick Panel result is correct
- the preview still draws generic default-style control overlays that no longer match many customized layouts

The landing flow also persists only one calibration profile globally, so saving a custom calibration replaces the default-layout calibration, and vice versa.

This design keeps the existing default-layout behavior intact while polishing the custom-layout workflow:

- custom-layout preview becomes a simpler box-only preview with no fake control overlays
- custom-layout preview uses uniform image scaling so visible content is not stretched
- the app stores one saved calibration for `default-union` and one saved calibration for `custom-panels`

## Context

### Current runtime behavior

- The custom QuickStar crop model already applies only to `custom-panels` presets.
- Export uses a square source image and preserves one shared background transform across panels.
- Preview currently renders the image in each panel through `PanelSlice.tsx`.
- Generic panel chrome is drawn by `PanelOverlay.tsx` for all modes.
- Storage persists one `CalibrationProfile` under a single MMKV key, and app state treats that one profile as the active saved calibration.

### Why users are feeling friction

The app now supports two legitimate workflows:

- `Default layout`
- `Custom layout`

Those are not two temporary steps inside one calibration. They are two parallel approaches. A user can have a valid saved result for both and should not lose one by using the other.

The custom preview is also now more important than before because it is the user's only visual checkpoint before export. If that preview distorts faces or shows fake panel UI that no longer reflects the real layout, it reduces trust even when export is technically correct.

## Problem Statement

### 1. Custom preview can distort image proportions

The current custom preview uses different width and height multipliers when mapping the image from the snapped crop frame into the visible panel box. That can stretch the preview horizontally or vertically when the saved calibration rectangle is slightly noisy.

The clearest symptom is a wide `buttonBox` preview where faces look shorter and wider than they should.

### 2. Custom preview still shows generic default-style panel assets

The current preview overlays simulated button grids, sliders, and icons on top of the image. Those overlays are based on the default-style panel assumptions and can no longer represent many customized layouts accurately.

### 3. Only one calibration survives at a time

The app currently saves one `CalibrationProfile` globally. Saving a custom calibration overwrites the default-layout result, and saving a default calibration overwrites the custom-layout result.

That creates unnecessary recalibration churn and makes the home screen workflow weaker than the two-mode product model now supports.

## Product Goals

- Make the custom-layout preview trustworthy enough that users can rely on it before export.
- Remove fake panel content from custom-layout preview so the preview does not imply unsupported layout details.
- Preserve one saved calibration result for each mode.
- Keep the default-layout calibration and preview behavior unchanged.

## Scope

### In scope

- Custom-layout preview only
- Removing generic simulated panel overlays from custom-layout preview
- Preventing preview image squashing in custom-layout mode
- Storing one saved calibration for `default-union`
- Storing one saved calibration for `custom-panels`
- Updating landing-screen state to reflect per-mode saved calibration availability
- Lightweight migration from the old single-profile storage model

### Out of scope

- Multiple saved calibrations per mode
- Named presets or profile management
- Redesigning default-layout preview
- Adding new overlay assets that try to simulate customized controls more accurately
- Changing export order, file names, or Good Lock output behavior
- Cloud sync or backup of calibration profiles

## Design Principles

- Trust the export model over decorative preview chrome.
- Prefer simpler preview UI to inaccurate simulated UI.
- Treat `default-union` and `custom-panels` as parallel saved workflows.
- Keep migration simple and one-way.
- Do not change the default-layout path unless required for shared plumbing.

## Proposed Model

### 1. Remove generic overlays from custom-layout preview

For `custom-panels` preview only, stop rendering the simulated control overlays.

The custom preview should keep:

- the panel boxes
- the border/radius shape
- the clipped background image

The custom preview should remove:

- button-grid placeholders
- slider placeholders
- brightness and volume icons
- media-player chrome

Default-layout preview can keep the current overlay treatment.

This is intentionally simpler. A clean box-only preview is more honest than a fake control layout that no longer matches the user's real arrangement.

### 2. Use uniform image scaling in custom preview

Custom preview should not independently scale the image in X and Y.

Instead:

1. derive the same enclosing square used by export
2. derive the snapped visible crop frame inside that square
3. compute one uniform preview scale that covers the visible panel box
4. center the cropped content inside the panel box and clip any tiny overflow

Recommended scale rule:

```ts
previewScale = Math.max(
  panel.rect.width / cropRect.width,
  panel.rect.height / cropRect.height,
);
```

That keeps the image proportions intact while still filling the visible panel box. If the calibrated panel rectangle is slightly noisy relative to the snapped ratio, the preview may clip a small amount of overflow instead of stretching the subject.

That tradeoff is correct. Slight crop overflow is less misleading than geometric distortion.

### 3. Store one saved calibration per mode

Replace the single saved calibration profile with a mode-indexed saved structure.

The runtime model should keep:

- one saved profile for `default-union`
- one saved profile for `custom-panels`
- one persisted selected mode for the landing screen

Conceptually:

```ts
interface SavedCalibrationProfiles {
  "default-union": CalibrationProfile | null;
  "custom-panels": CalibrationProfile | null;
}
```

Only the matching profile shape is valid for each mode:

- `default-union` stores a default-union profile
- `custom-panels` stores a custom-panels profile

When the user saves calibration in one mode, update only that mode's slot.

### 4. Make active app state mode-driven

The active calibration state should be derived from the selected mode, not from whichever profile was saved most recently.

When the user switches modes on the landing screen:

- `calibrationMode` changes immediately
- `isCalibrated` reflects whether that mode has a saved profile
- `calibrationProfile` becomes the saved profile for that mode
- `activePreset` becomes the preset derived from that mode's saved profile, or the base preset if missing
- `calibrationRect` and custom draft state update to the selected mode's saved data

This allows the user to switch between `Default layout` and `Custom layout` without overwriting the other mode's saved result.

### 5. Surface per-mode saved state in the landing flow

The home screen should behave like a two-mode launcher rather than a single calibration slot.

Minimum behavior:

- selecting `Default layout` should immediately reflect whether the default mode is calibrated
- selecting `Custom layout` should immediately reflect whether the custom mode is calibrated
- `Start customizing` should work for the selected mode when that mode has a saved calibration
- `Recalibrate` should reopen calibration for the selected mode

Optional lightweight UX polish within the same slice:

- show `Calibrated` / `Not calibrated` state on each mode card

That polish is encouraged if it stays small and does not force a visual-system refactor.

## Data And Migration

### New persistence behavior

Add a new storage payload for per-mode calibration profiles and store the selected mode separately.

Expected persistence concepts:

- one MMKV key for the selected mode
- one MMKV key for the per-mode calibration map

### Legacy migration

The app must continue to read the old storage state so existing users do not lose calibration data.

Migration rules:

- if the old single `CalibrationProfile` exists and is `default-union`, place it in the `default-union` slot
- if the old single `CalibrationProfile` exists and is `custom-panels`, place it in the `custom-panels` slot
- if only the older legacy `is-calibrated` plus rect keys exist, migrate that into the `default-union` slot
- if no selected-mode key exists yet, default to the migrated profile mode when available, otherwise `default-union`

The migration does not need to backfill both slots from one old value. One old saved profile can only populate one new slot.

## Preview Behavior

### Default layout

- unchanged
- current overlay treatment can remain
- current preview mapping can remain

### Custom layout

- no simulated panel chrome
- image proportions preserved
- border boxes retained
- preview stays visually aligned with the export crop model

## Risks

- If the custom preview uses a cover-style uniform scale, a tiny amount of extra clipping may appear when a manually drawn panel box is noticeably off from the snapped ratio.
- Landing-screen UX can still feel sparse if per-mode status is not surfaced clearly enough.
- Storage migration logic needs to validate both slots independently so a bad custom profile does not invalidate a good default profile.

## Manual Validation

- Save a default-layout calibration, then save a custom-layout calibration, then relaunch the app and confirm both survive.
- Switch between the two mode cards on the landing screen and confirm the calibrate/customize CTA reflects the selected mode only.
- Open a custom layout with a face image in a wide `buttonBox` and confirm the preview no longer makes the face look shorter and wider.
- Confirm custom-layout preview no longer shows generic button grids, sliders, or control icons.
- Confirm default-layout preview still behaves as before.

## Success Criteria

- Custom-layout preview no longer applies separate X/Y image scaling that visibly squashes subjects.
- Custom-layout preview no longer renders generic simulated control overlays.
- The app can retain one saved `default-union` calibration and one saved `custom-panels` calibration at the same time.
- Switching modes on the landing screen no longer discards the other mode's saved calibration result.
- Default-layout behavior remains unchanged.
