# Buttons canonical identifier sizing design

Date: 2026-07-22
Scope: Buttons-only Customize preview and PNG export identifiers.

## Goal

Keep the accepted Buttons-only Customize design while making every Button
identifier use the same apparent icon, circle, and text sizes after its PNG is
applied in the real Quick Panel. Panel dimensions may change placement and
available space, but must not enlarge the applied identifier.

The current Wi-Fi and Bluetooth identifiers are the visual reference. A large
multi-row, multi-column panel such as Shazam must use those same identifier
sizes in Customize and after its exported PNG is applied in Good Lock.

## Panel behavior

Grid dimensions are interpreted as rows by columns.

| Grid shape | Identifier treatment | Position control |
| --- | --- | --- |
| `1xN`, `N > 1` | Icon and text in one row, centered vertically | Horizontal |
| `Nx1`, `N > 1` | Icon only, centered horizontally | Vertical |
| `1x1` | Centered icon only | None |
| Any other `NxM` | Icon at top-left and text at bottom-right | None |

The last category includes `2x2`, `2x3`, `3x2`, `3x3`, and larger shapes.

## Sizing model

- Derive one canonical source-layout reference from the calibrated grid's
  single-cell dimensions and share it across every Button in the preset.
- Preserve the currently accepted Wi-Fi/Bluetooth visual sizing by applying
  the existing icon, circle, text, gap, and inset proportions to that shared
  cell reference rather than to each panel's short side.
- Preview metrics scale the shared source-layout reference by the preview's
  layout scale, so every identifier has the same apparent size on Customize.
- Export metrics scale that same reference by each panel's centered-square
  export scale. Raw identifier pixels may differ between `1x4`, `3x1`, and
  `3x3` PNGs because Good Lock scales those square PNGs by different amounts;
  the identifiers must match after Good Lock applies them to their panels.
- Keep the export calculation proportional so `PixelRatio` cancels naturally;
  fixed point caps must not reintroduce device-density-dependent output.
- Bounds continue to control safe insets, label fitting, horizontal travel,
  vertical travel, and corner placement only.
- Corner layouts use the full `0.14` single-cell inset for all four edges so
  the icon, label, and text shadow remain clear of the clipped panel boundary.
- Corner labels add another `0.04` single-cell inset on the bottom and right;
  this does not change the approved icon position.

## Architecture

- Replace comparison-only orientation branching with an explicit identifier
  layout kind: `horizontal`, `vertical`, `single`, or `corner`.
- Keep grid spans on `ButtonIdentifierDefinition`; no calibration schema or
  persisted-data migration is required.
- Keep `ButtonIdentifierOverlay` shared by preview and export.
- Move final visual metric selection into pure layout logic so the component
  renders resolved values instead of applying panel-specific scale constants
  or orientation-specific size reductions.
- Horizontal label width must reserve the full circular background width, not
  only the inner Lucide glyph width.
- Preserve the existing screen-local visibility, opacity, horizontal position,
  and vertical position state.

## Export behavior

- Continue exporting sequentially in `goodLockOrder`.
- Continue placing a non-square panel within its centered 1024x1024 export
  square.
- Continue waiting for measured horizontal content before capture.
- Do not change image opacity, image transforms, filenames, calibration data,
  or Good Lock ordering.

## Verification

Add focused coverage for:

- `1x4` horizontal icon/text behavior and horizontal positioning.
- `3x1` vertical icon-only behavior and vertical positioning.
- `1x1` centered icon-only behavior.
- `2x2`, `2x3`, `3x2`, and `3x3` corner behavior.
- Identical apparent glyph, circle, and text metrics across representative
  panel kinds in source-layout and Customize coordinates.
- Export metrics normalized by each panel's square scale so the applied
  Quick Panel result is identical even when raw PNG metrics differ.
- Density-independent export calculations at multiple mocked `PixelRatio`
  values.
- Horizontal label width reserving the entire icon circle.
- Existing image/identifier opacity, export readiness, and sequential export
  behavior remaining intact.

Run the focused identifier/layout/export suites, TypeScript, lint, and
`git diff --check`. Device confirmation should compare Wi-Fi, Bluetooth, and
Shazam in Customize and after applying the exported PNGs in Good Lock.

## Out of scope

- Persisting Customize controls.
- Changing Controls-only rendering or export.
- Allowing position sliders for `1x1` or corner-layout panels.
- Changing the accepted Customize controls layout.
- Resetting or migrating existing calibration data.
