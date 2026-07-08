# v3 Buttons Follow-Up Handoff And Fix Plan

## Why This Exists

The previous v3 Buttons-only work landed and mostly works, but two follow-up
issues were found in manual testing after the first bugfix pass:

1. The Button label selection step is usable again, but the UX is still poor
   because users cannot easily see what they already selected without scrolling
   down to a separate selected list.
2. The latest Button preview/export treatment introduced a visible center block
   in both Customize preview and exported PNGs.

This document is the approved handoff for the next agent. Do not continue the
old reorder-based Button selection UI. Replace it with the approved toggle
design below.

## Current Repo State

Relevant current files:

- `src/features/quick-panel/calibration/advanced/components/ButtonPanelSelection.tsx`
- `src/features/quick-panel/customize/components/ButtonImageTreatment.tsx`
- `src/features/quick-panel/customize/components/PanelSlice.tsx`
- `src/features/quick-panel/customize/components/ExportSurface.tsx`
- `docs/2026-07-08-v3-buttons-only-handoff.md`
- `docs/superpowers/specs/2026-07-08-v3-buttons-only-design.md`

Recent commit related to the export regression:

- `492e874 (feedback): fixed transparent exports`

## Root Cause Summary

### 1. Label selection UX

`ButtonPanelSelection.tsx` currently treats selected labels as a separate
ordered list rendered below the search results. That solved the overflow bug,
but it still makes selection state hard to scan because:

- the selected state does not live on the label rows themselves
- users must scroll to the lower section to confirm current selection
- reorder controls add visual weight for a behavior the user no longer considers
  important

### 2. Customize/export center block regression

`ButtonImageTreatment.tsx` currently renders only the outer ring segments of the
image and intentionally leaves the center unrendered. That is why both the
Customize preview and exported PNGs show a dark/empty center block.

That behavior is not acceptable for this app. The preview must stay visually
clean for alignment, and exports must not contain that block.

## Approved Product Direction

This direction was explicitly approved by the user in-thread.

### Button label selection step

Use **Option 1**, modified as follows:

- Remove reorder from the Button selection step UI.
- Keep the search field at the top.
- Add a compact selected summary directly under the search field:
  - `Selected N`
  - small wrap chips for currently selected labels
  - tapping a chip removes that label
- Search results remain the main scrollable list.
- Each result row acts as a toggle:
  - tap once to select
  - tap again to deselect
- Selected rows should visually feel like the existing panel-toggle pattern.
- Custom labels created from the search input should also appear as selected
  chips once added.

Important constraint:

- The user does **not** care enough about export ordering to keep reorder
  controls in this screen.

### Button Customize preview/export treatment

Do **not** keep the current center-hole treatment.

Approved direction:

- Keep the Customize preview visually clean, like v2.
- Do not add a dark preview tint there.
- Restore full image rendering inside Button panels for preview.
- For export, try lower image opacity instead of cutout/masking.
- Assume the final applied result in Samsung Quick Panel will appear dimmed, as
  it does in v2-style usage.

Practical interpretation for the next agent:

- `PanelSlice.tsx` for Button panels should return to a full-fill image preview
  with no fake center block.
- `ExportSurface.tsx` for Button panels should use a full-fill image and test a
  reduced opacity value instead of segmented rendering.
- `ButtonImageTreatment.tsx` is likely no longer needed if the full-fill path is
  restored cleanly.

## Fix Plan

1. Replace the current selected-list section in
   `ButtonPanelSelection.tsx` with toggle rows plus a top chip summary.
2. Remove Up/Down/Remove button actions from the label step UI.
3. Keep state updates simple:
   - toggle built-in/custom labels in place
   - preserve current label order by selection/insertion order internally
   - do not expose reorder controls in UI
4. Remove the segmented outer-ring rendering path that caused the center block.
5. Restore full image preview for Button panels in `PanelSlice.tsx`.
6. Restore full image export for Button panels in `ExportSurface.tsx`, then
   apply reduced opacity there instead of a center-hole treatment.
7. Delete `ButtonImageTreatment.tsx` if it becomes unused.
8. Run verification:
   - `npm run lint`
   - `npx tsc --noEmit`
9. Manual QA focus:
   - selected labels are obvious without scrolling
   - toggling on/off works for both built-in and custom labels
   - chips remove labels correctly
   - Customize preview has no center block
   - exported Button PNGs have no center block
   - filenames still generate correctly for repeated labels

## Notes For The Next Agent

- Keep the patch scoped to this follow-up. Do not reopen mixed Controls +
  Buttons scope.
- Prefer the smallest diff that removes reorder UI and removes the center-block
  rendering path.
- If export opacity needs tuning, start with one fixed value only. Do not add a
  slider or settings UI in this pass.
- If removing reorder changes geometry regeneration behavior, preserve the
  existing internal order semantics unless repo evidence shows it breaks Button
  box layout.
- Update this doc or add a new handoff only if implementation lands
  substantially differently than planned.

## What Was Decided In This Session

- Selected summary should use **small chips**.
- The approved approach is toggle-based selection, not reorder-based selection.
- Customize preview should stay visually clean.
- Export should try **decreased opacity** instead of the current cutout-style
  treatment.
- This fix is intentionally deferred to the next agent.
