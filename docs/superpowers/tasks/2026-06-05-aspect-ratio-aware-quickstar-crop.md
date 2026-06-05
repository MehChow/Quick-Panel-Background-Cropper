# Aspect-Ratio-Aware QuickStar Crop Tasks

Author: Codex, GPT-5
Date: 2026-06-05
Status: Ready for execution

## Minimal Tasks

- [ ] Add `src/features/quick-panel/model/quickstar-crop.ts` with supported ratios, nearest-ratio snapping, and centered enclosing-square helpers.
- [ ] Replace the current width-based export square in `src/features/quick-panel/model/panel-geometry.ts` with the enclosing-square model.
- [ ] Update `src/features/quick-panel/model/image-placement.ts` and `src/features/quick-panel/customize/hooks/useQuickPanelPreviewGestures.ts` so pan and zoom are clamped against the union of the required source squares.
- [ ] Update `src/features/quick-panel/customize/components/PanelSlice.tsx` to preview the same square-source crop model that export uses.
- [ ] Update `src/features/quick-panel/customize/components/ExportSurface.tsx` so export and preview use the same source-square geometry.
- [ ] Verify that hidden-panel filtering still works for custom layouts and that default-layout mode still behaves the same.
- [ ] Update `README.md` and `CALIBRATION_PLAN.md` with the new crop model and current scope.
- [ ] Run the normal project verification commands and produce a testable Android build for manual validation.
- [ ] Commit each completed implementation slice with focused messages.

## Execution Order

1. Geometry helpers
2. Shared transform bounds
3. Preview alignment
4. Export alignment
5. Docs and validation
