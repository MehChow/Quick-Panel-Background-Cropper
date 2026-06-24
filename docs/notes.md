# Notes

This file is a running project note log for implementation details that are easy to forget, regress, or repeat.

## What belongs here

- UI behaviors with non-obvious constraints
- Bug patterns and their root causes
- Fix patterns that should be reused
- Device-specific findings
- Testing notes that explain why coverage exists

## Entries

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

- Shared help sheets now use content-fit bottom-sheet sizing with a capped max height from `src/features/quick-panel/shared/help-sheet-layout.ts`.
- The row and column help sheet stays vertically scrollable inside that capped sheet.
- The outer calibration help sheet no longer uses horizontal paging.
- Its two former pages are now stacked vertically inside one `BottomSheetScrollView` in `src/features/quick-panel/shared/CalibrationHelpSheet.tsx`.

#### Reuse guidance

- Prefer vertical scroll over nested horizontal paging when help content includes tall images.
- Use explicit image width caps and real aspect ratios to control sheet height.
- When a sheet behaves differently on Fold-style fullscreen and normal phones, fix sizing in shared layout helpers first before tuning individual screens.

#### Related verification

- `__tests__/help-sheet-layout.test.ts`
- `__tests__/help-sheet-sizing.test.tsx`
