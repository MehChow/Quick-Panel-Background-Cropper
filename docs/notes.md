# Notes

This file is a running project note log for implementation details that are easy to forget, regress, or repeat.

## What belongs here

- UI behaviors with non-obvious constraints
- Bug patterns and their root causes
- Fix patterns that should be reused
- Device-specific findings
- Testing notes that explain why coverage exists

## Entries

### 2026-06-24: Whole-app responsive reset

#### Original concern

The Fold-specific wide-screen layout pass was too specific and created fragile screen behavior. The app needed to preserve the S25+ reference flow while still behaving well on common phones and Fold 7.

#### What changed

- Removed the app-wide `wide-screen-layout.ts` helper and its tests.
- Replaced numeric screen-level layout policy with Tailwind/Uniwind class constraints in `src/features/quick-panel/shared/QuickPanelScreenShell.tsx` and `src/features/quick-panel/shared/screen-layout.ts`.
- Kept the normal S25+ layout as the baseline: centered phone column, full-width bottom action bars, and the same vertical rhythm as the screenshots under `flow/`.
- Kept runtime measurement only where layout is geometry-dependent:
  - calibration screenshot canvases
  - customize preview fitting
  - export result grid/card fitting
  - landing example height calculation
- Renamed help-sheet sizing from a general layout helper to `src/features/quick-panel/shared/help-sheet-media-layout.ts`, because it only controls bottom-sheet height and example image sizes.
- Fixed select mode after the reset so the two modes remain a non-scrollable row on normal phones, matching the S25+ screenshot.

#### Responsive practice

- Default to phone-first layouts. The S25+ screenshots in `flow/` are the source of truth for normal phone UI.
- Use Tailwind/Uniwind classes for responsive structure, especially width caps and spacing. Prefer shared class constants like `phoneColumnClassName` over screen-specific JS breakpoint objects.
- Do not reintroduce a broad `isWideScreen` or Fold-specific layout helper. Fold/tablet support should usually mean a centered, stable phone-like column unless a screen has a proven need for a different layout.
- Keep JS dimension logic scoped to real measurement problems. If a component needs to fit an image, canvas, or export grid into available space, local measurement is acceptable. If it is only deciding screen structure, use class names.
- Keep bottom action areas outside the main content when the user flow depends on a stable footer. Calibration, select mode, customize with image, and result should not hide primary actions inside scroll content on normal phones.
- Do not add scroll views just to solve wide-screen responsiveness. Add scrolling only when small-device height needs it and make sure it does not change the normal S25+ layout.
- Preserve established screen-specific UX:
  - Select mode shows Default and Advanced in a row on normal phones.
  - Calibration canvases should maximize useful image area without changing footer controls.
  - Customize preview should size from the centered content column, not the whole window.
  - Result export previews should shrink from measured available space, not from device class.

#### Testing and verification

- Remove tests that assert implementation details of deleted responsive helpers.
- Keep focused regression tests for important layout contracts, such as select mode not rendering a `ScrollView`.
- Use `npm test -- --runInBand` and `npm run lint` after responsive refactors.
- Manual verification should include S25+ first, then smaller phones, then Fold 7/tablet widths.

### 2026-06-24: Advanced calibration help-sheet sizing and interaction

#### Original concern

The advanced calibration help sheets regressed during the Fold/wide-screen responsive work.

- The row and column help sheet initially opened too tall on a normal S25 device.
- The outer calibration help sheet then opened too short to show the full content.
- After that was adjusted, the outer calibration help sheet could no longer swipe to page 2 reliably.

#### Root cause

- Several help sheets were using a fixed snap height that was too aggressive for normal phones.
- The outer calibration help sheet was more fragile because it combined:
  - dynamic sheet sizing
  - a horizontally paged inner layout
  - tall image content
- That combination made height measurement and gesture handling unstable.

#### Final solution

- Shared help sheets now use content-fit bottom-sheet sizing with a capped max height from `src/features/quick-panel/shared/help-sheet-media-layout.ts`.
- The row and column help sheet stays vertically scrollable inside that capped sheet.
- The outer calibration help sheet no longer uses horizontal paging.
- Its two former pages are now stacked vertically inside one `BottomSheetScrollView` in `src/features/quick-panel/shared/CalibrationHelpSheet.tsx`.

#### Reuse guidance

- Prefer vertical scroll over nested horizontal paging when help content includes tall images.
- Use explicit image width caps and real aspect ratios to control sheet height.
- When a sheet behaves differently on Fold-style fullscreen and normal phones, fix sizing in shared media helpers first before tuning individual screens.

#### Related verification

- `__tests__/help-sheet-layout.test.ts`
- `__tests__/help-sheet-sizing.test.tsx`
