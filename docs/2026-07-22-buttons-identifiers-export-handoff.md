# Button identifier Customize/export handoff

Date: 2026-07-22
Scope: `ButtonIdentifierOverlay` rendering for Buttons-only Customize preview and PNG export.

## Current status

Customize is visually accepted by the user. Identifier sizing is now normalized
to the calibrated grid's shared single-cell reference, so large panels no longer
enlarge their identifiers after the exported PNGs are applied in Good Lock.

The current work is uncommitted by user instruction. Preserve the existing dirty changes; do not reset or commit them.

## Implemented behavior

Files changed:

- `src/features/quick-panel/calibration/advanced/buttons-geometry.ts`
- `src/features/quick-panel/customize/components/ButtonIdentifierOverlay.tsx`
- `src/features/quick-panel/customize/components/ButtonIdentifierVisuals.tsx`
- `src/features/quick-panel/customize/components/ExportSurface.tsx`
- `src/features/quick-panel/customize/components/PanelSlice.tsx`
- `src/features/quick-panel/customize/components/button-identifier-content.ts`
- `src/features/quick-panel/model/button-identifier-layout.ts`
- `src/features/quick-panel/model/types.ts`

### Shared identifier icon

- Lucide icons are wrapped in a grey circular background (`#666666`).
- The circle uses a `1.75` multiplier over the base icon size.
- The white Lucide glyph is centered inside the circle.
- Horizontal and vertical positioning continues to use the existing movement controls.

### Vertical overflow fix

- Vertical movement now constrains the enlarged circle size, not the original Lucide glyph size.
- The movable vertical container height also uses the full circle size.
- This prevents a vertical identifier at 100% position from overflowing outside its panel.

### Corner-layout panels

- The icon is anchored top-left.
- The label is anchored bottom-right.
- Corner padding uses the full `0.14` single-cell inset so the icon, label, and
  text shadow stay clear of the clipped panel boundary.
- The label alone adds `0.04` of a cell on its bottom and right margins while
  the icon remains at the approved `0.14` inset.
- Labels use the full available width after that padding and remain single-line.

### Export-specific sizing

- Preview and export share the same icon, circle, text, gap, and inset ratios.
- Preview scales the common cell reference through `layoutScale`.
- Export scales the same reference through each panel's centered-square scale.
- Raw identifier pixels may differ between exported panel PNGs; their apparent
  sizes match after Good Lock scales each square PNG onto its real panel.
- Fixed export point caps were removed so `PixelRatio` cancels naturally.
- Labels use `lineHeight: fontSize * 1.2` to reduce vertical clipping in exported surfaces.

### Exact grid-shape behavior

- `1xN`, where `N > 1`: icon and text, horizontal position control.
- `Nx1`, where `N > 1`: icon only, vertical position control.
- `1x1`: centered icon only, no position control.
- Any other shape: icon top-left and text bottom-right, no position control.

## Resolved size mismatch

The reproduced layout was `1x4` Wi-Fi, `3x1` Bluetooth, and `3x3` Shazam.
Shazam was oversized because identifier metrics were derived from the full
panel short side; its three-cell thickness therefore enlarged the icon and
text. Fixed point caps also prevented consistent density cancellation.

`ButtonIdentifierDefinition.referenceCellSize` now records the shared calibrated
cell size. Preview and export transform that same source-coordinate value into
their local surfaces. Tests cover the reproduced panel proportions at 2x and
3x density and verify equal apparent identifier size in source/Quick Panel
coordinates.

## Tests already passing

Focused verification currently passes:

```text
7 suites / 59 tests
__tests__/button-identifier-layout.test.ts
__tests__/button-identifier-overlay.test.tsx
__tests__/customize-screen-export-surfaces.test.tsx
__tests__/export-files.test.ts
__tests__/export-surfaces-position-readiness.test.tsx
__tests__/panel-image-intensity.test.tsx
__tests__/sequential-export.test.tsx
```

Also passed:

- Full Jest suite: `45 suites / 175 tests`
- `npx tsc --noEmit`
- `npm run lint`
- `git diff --check`
