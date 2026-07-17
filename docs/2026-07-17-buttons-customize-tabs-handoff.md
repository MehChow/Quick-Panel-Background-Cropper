# Buttons Customize Tabs Handoff

## Implemented behavior

- Advanced Buttons Customize uses one compact control card beneath the live
  preview instead of a tall stack of sliders.
- Filled AniUI tabs select Image intensity, Identifier intensity, horizontal
  identifier position, or vertical identifier position. Only the active
  adjustment renders a slider.
- Horizontal and vertical tabs appear only when the active Buttons preset
  contains that orientation.
- Hiding Button identifiers disables the identifier-related tabs. If
  Identifier, Horiz., or Vert. is selected, the active tab immediately returns
  to Image while every identifier value remains unchanged.
- Each Customize visit still starts with Image 78, Identifier 70, Horizontal
  50, Vertical 50, identifiers visible, and Image selected.
- Preview and export share the same identifier values and constrained placement.
  Square-like `1x1` and `2x2` identifiers remain unaffected by position values.
- No control value or selected tab is persisted.

## Main files

- `src/features/quick-panel/customize/components/ButtonCustomizeControls.tsx`
- `src/features/quick-panel/customize/components/ButtonAdjustmentTabs.tsx`
- `src/features/quick-panel/customize/components/ButtonAdjustmentSlider.tsx`
- `src/features/quick-panel/customize/hooks/useButtonCustomizeControls.ts`
- `src/features/quick-panel/customize/components/ButtonIdentifierOverlay.tsx`
- `src/features/quick-panel/customize/components/ExportSurfaces.tsx`
- `src/features/quick-panel/model/button-identifier-layout.ts`
- `__tests__/button-customize-controls.test.tsx`
- `__tests__/customize-screen-export-surfaces.test.tsx`

## Verification and device result

- Focused tests cover default selection, callback routing, conditional tabs,
  identifier visibility, automatic return to Image, and preserved values.
- Focused verification passed: 3 suites and 11 tests.
- Full verification passed: 35 Jest suites and 115 tests, `npm run lint`,
  `npx tsc --noEmit`, and `git diff --check`.
- A follow-up `npm run android` completed the Android debug build successfully.
  Installation was stopped at the user's request; the user will perform the
  final device check later.
- The user confirmed the compact Customize UI, live adjustment behavior,
  exported output, and applied Good Lock result. QuickStar version was not
  recorded.

## Later follow-up: Buttons-only performance

The user reports an obvious laggy feeling throughout the Buttons-only feature
on the high-end `SM-S9360`, affecting both Advanced Buttons calibration and
Customize. Treat this as a separate optimization investigation rather than part
of the tab UI work.

Before changing behavior, profile both flows on the physical device and compare
JS/UI frame timing. Check render frequency during calibration gestures and
Customize image transforms, full-resolution image/overlay work, and any
off-screen preview or export surfaces that may remain mounted unnecessarily.
Preserve calibration data and output fidelity while investigating.
