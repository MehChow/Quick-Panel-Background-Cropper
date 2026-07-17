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
- `src/features/quick-panel/customize/components/ExportSurfaceHost.tsx`
- `src/features/quick-panel/customize/hooks/useSequentialExport.ts`
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

## Later follow-up: Buttons-only performance optimization

- Advanced panel move/resize gestures use Reanimated draft rectangles and
  commit to React/Zustand once when a gesture ends or is cancelled. The shared
  snap, constraint, haptic, and phase behavior remains intact.
- Customize creates a transient PNG proxy only when the normalized source is
  larger than a 1080-pixel long edge. Panel previews render that proxy through
  fixed-size image layers with transform-only animation and memory-disk cache;
  exports retain the original normalized URI.
- Export prefetches best-effort, mounts one 1024-square surface at a time in
  Good Lock order, ignores stale readiness tokens, waits only for the current
  horizontal identifier measurement, and saves media only after every capture
  succeeds.
- Focused and full automated verification passes: 40 Jest suites, 138 tests,
  ESLint, TypeScript, `git diff --check`, and an Android production bundle
  export to a temporary directory.
- The signed `apk` benchmark and physical output/persistence QA remain pending.
  `npm run build-apk` is blocked before Gradle because the four Android
  upload-key values are not configured. No dev-client metrics were substituted;
  see `docs/notes.md` for the unavailable baseline record.
