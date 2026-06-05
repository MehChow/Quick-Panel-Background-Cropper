# Aspect-Ratio-Aware QuickStar Crop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make customized-layout preview and export follow the observed QuickStar square-source crop model so tall and narrow panels stop rendering over-zoomed in production while continuity across panels is preserved.

**Architecture:** Keep the existing dual-mode calibration system and change only the custom-layout runtime geometry model. Add ratio-snapping and source-square helpers, use those helpers for export and preview, and clamp image placement against the union of the required source squares instead of only the visible panel rectangles.

**Tech Stack:** Expo 56, expo-image, react-native-reanimated, Zustand, TypeScript

---

## Branch Guard

Execute this plan on `feat/custom-layout-calibration` or a child branch created from it. Do not run it on `main` or `master`.

## File Structure

### Existing files to modify

- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\model\panel-geometry.ts`
  - replace width-based export square logic with enclosing-square helpers
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\model\image-placement.ts`
  - clamp pan and zoom against the union of enclosing export squares
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\customize\components\PanelSlice.tsx`
  - render preview using the new square-source model instead of direct panel clipping
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\customize\components\ExportSurface.tsx`
  - export the enclosing square instead of a width-based square
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\customize\hooks\useQuickPanelPreviewGestures.ts`
  - continue to use the shared transform, but derive bounds from the new geometry helpers
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\customize\services\export-files.ts`
  - no algorithm change expected, but verify assumptions still hold after source-square changes
- `E:\Coding_things\Quick-Panel-Background-Cropper\README.md`
  - document that custom layouts now simulate QuickStar's square-source crop model
- `E:\Coding_things\Quick-Panel-Background-Cropper\CALIBRATION_PLAN.md`
  - update the calibration explanation to separate panel geometry from crop geometry

### New files to create

- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\model\quickstar-crop.ts`
  - ratio definitions, nearest-ratio snapping, enclosing-square helpers, and preview crop helpers for custom-layout runtime geometry
- `E:\Coding_things\Quick-Panel-Background-Cropper\docs\superpowers\tasks\2026-06-05-aspect-ratio-aware-quickstar-crop.md`
  - minimal executable task list derived from this plan

## Task 1: Add QuickStar Crop Geometry Helpers

**Files:**
- Create: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\model\quickstar-crop.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\model\panel-geometry.ts`

- [ ] Define the supported aspect-ratio set used for ratio snapping.
- [ ] Add a helper that snaps a calibrated panel rectangle to the nearest supported ratio without changing its center.
- [ ] Add a helper that derives the centered enclosing square for a panel rectangle using `max(width, height)`.
- [ ] Replace the current width-based `getExportSquareRect()` implementation with the enclosing-square helper.
- [ ] Update any geometry callers to use the new helper names and keep default-layout behavior unchanged.
- [ ] Commit the geometry changes.

## Task 2: Clamp The Shared Background Against Export-Square Coverage

**Files:**
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\model\panel-geometry.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\model\image-placement.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\customize\hooks\useQuickPanelPreviewGestures.ts`

- [ ] Make image-bounds calculation use the union of the enclosing export squares.
- [ ] Keep `getCoverScale()` based on those bounds so the positioned image always covers every required source square.
- [ ] Verify gesture clamping still uses one shared transform and does not clamp per panel.
- [ ] Check that resetting the image fit still centers the image against the visible panel union while respecting the larger coverage area.
- [ ] Commit the transform-bounds changes.

## Task 3: Make Preview Match The QuickStar Runtime Model

**Files:**
- Create or extend: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\model\quickstar-crop.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\customize\components\PanelSlice.tsx`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\customize\components\QuickPanelPreview.tsx`

- [ ] Derive each panel's preview source square from the same helper used by export.
- [ ] Snap the panel ratio for preview rendering so small calibration noise does not change the simulated crop behavior.
- [ ] Render the image in `PanelSlice` from the square source window, then clip it to the visible panel rectangle.
- [ ] Confirm that present-panel filtering from custom layouts still works after the preview logic changes.
- [ ] Commit the preview-alignment changes.

## Task 4: Keep Export Consistent With Preview

**Files:**
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\customize\components\ExportSurface.tsx`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\customize\services\export-files.ts`

- [ ] Export the same source square used by preview.
- [ ] Verify offscreen render sizing still produces `1024x1024` outputs in the same Good Lock order.
- [ ] Keep the existing hidden-panel filtering and missing-surface errors intact.
- [ ] Commit the export-alignment changes.

## Task 5: Update Docs And Run Manual Verification

**Files:**
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\README.md`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\CALIBRATION_PLAN.md`

- [ ] Document that custom-layout runtime crop now models QuickStar as square source plus centered display crop.
- [ ] State that retracted `buttonBox` is covered and expanded `buttonBox` remains out of scope.
- [ ] Run the repo's normal static verification commands that are already in use for this app.
- [ ] Build a testable Android artifact and validate the customized-layout sample manually on device.
- [ ] Commit the doc and verification updates.

## Implementation Notes

- Do not change the saved calibration profile format unless the runtime helpers truly require it.
- Do not add a second-stage manual crop-frame UI in this slice.
- Do not change default-layout geometry logic in this slice.
- If preview cannot fully model Samsung's runtime crop with the current component structure, prefer a focused helper refactor over panel-specific special cases.
