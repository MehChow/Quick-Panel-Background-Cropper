# Aspect-Ratio-Aware QuickStar Crop Design

Author: Codex, GPT-5
Date: 2026-06-05
Status: Ready for implementation

## Summary

Customized Quick Panel layouts currently export correctly sized PNG files, but the final production render in QuickStar does not stitch back into one continuous image for many non-default layouts. The strongest production evidence is that tall and narrow panels such as `brightness`, `volume`, and some `mediaPlayer` layouts look over-zoomed after import, while the `buttonBox` often still looks correct.

This design changes custom-layout crop behavior to follow the observed Samsung runtime model more closely: export a square source image that encloses the panel, preserve a single shared background coordinate system across all panels, and simulate QuickStar's centered runtime crop in preview.

## Context

### Current app behavior

- Default-layout calibration still uses one outer rectangle and scales `s25PlusOneUi85Preset` into that union.
- Custom-layout calibration stores explicit per-panel rectangles for `buttonBox`, `brightness`, `volume`, and `mediaPlayer`.
- Preview currently renders the positioned image directly inside each panel rectangle.
- Export currently derives a square from `panel.rect.width`, vertically centered in the panel.

That export rule is implemented in `src/features/quick-panel/model/panel-geometry.ts`:

```ts
export function getExportSquareRect(panel: PanelDefinition): PanelRect {
  return {
    x: panel.rect.x,
    y: panel.rect.y + (panel.rect.height - panel.rect.width) / 2,
    width: panel.rect.width,
    height: panel.rect.width,
    radius: 0,
  };
}
```

### Observed production behavior

The current export rule matches the default layout well enough because those panels have similar widths. It fails for customized layouts where panel shapes diverge.

Observed device behavior from production testing:

- QuickStar shows the same centered square crop UI for all supported elements unless the user manually changes it.
- Aspect-ratio groups appear to behave the same regardless of absolute tile size.
- `1:1` groups such as `3x3`, `2x2`, and `1x1` show the same visible content, only scaled differently.
- The most obvious mismatch in customized layouts is over-zooming on narrow or tall panels.

## Problem Statement

The app currently ties export zoom to panel width. That is the wrong source of truth for customized layouts.

For a tall panel such as `238x479`:

- current app exports `238x238`
- QuickStar likely treats the upload as a square source and then center-crops it to the panel shape
- the exported source is already too tight before QuickStar applies its own display crop
- the result is a double-zoomed appearance in production

The app also lets preview and export disagree:

- preview uses the full panel rectangle
- export uses a width-based square
- Samsung production likely behaves as square source -> centered crop to panel shape

## Product Goal

Make customized-layout preview and export match Samsung QuickStar production behavior closely enough that exported panels stitch back into one continuous image without manual crop adjustment in QuickStar.

## Scope

### In scope

- Customized-layout mode only
- Retracted `buttonBox`
- `brightness`
- `volume`
- `mediaPlayer`
- Ratio snapping for slightly imperfect manual calibration rectangles
- Shared-background continuity across all exported panels
- Preview changes needed to reflect the new crop model

### Out of scope

- Expanded `buttonBox`
- Automatic screenshot understanding or vision-based panel detection
- Per-panel manual crop editing as the primary solution
- Foldables, tablets, DeX, or non-One UI 8.5 targets
- Claims about Samsung's internal implementation beyond the observed behavior this app needs to match

## Design Principles

- Separate panel geometry from crop geometry.
- Preserve one shared background transform across all panels.
- Snap noisy calibration ratios to Samsung-style grid ratios.
- Use the same model for preview and export.
- Constrain image placement globally, not panel by panel.

## Proposed Model

### 1. Snap panel ratios to a supported ratio set

Manual calibration rectangles will have small errors, such as `238x479` instead of exactly `1:2`.

The app should derive:

- `measuredAspectRatio = rect.width / rect.height`
- `snappedAspectRatio = nearestSupportedRatio(measuredAspectRatio)`

Initial supported ratio set:

- `1:1`
- `2:1`
- `1:2`
- `3:1`
- `1:3`
- `4:1`
- `1:4`
- `3:2`
- `2:3`
- `4:3`
- `3:4`

The snapped ratio is used for runtime simulation and future classification logic. The calibrated rectangle itself remains the positional source of truth.

### 2. Export an enclosing square source per panel

For each present panel, derive a centered source square that fully encloses the panel:

```ts
side = Math.max(panel.rect.width, panel.rect.height)
centerX = panel.rect.x + panel.rect.width / 2
centerY = panel.rect.y + panel.rect.height / 2

square.x = centerX - side / 2
square.y = centerY - side / 2
square.width = side
square.height = side
```

This replaces the current width-based square rule.

Why this is the minimum correct change:

- square panels still behave the same
- wide panels still use their width
- tall panels stop getting undersized square sources

### 3. Simulate QuickStar in preview

Preview should no longer render the positioned image directly into the panel rectangle.

Instead preview should:

1. sample the shared background through the panel's enclosing square
2. render that square as the source content
3. center-crop the source content to the snapped panel ratio inside the visible panel rectangle

This aligns preview with the likely production model:

- uploaded square source
- centered runtime crop to panel shape
- final scale to panel size

### 4. Constrain image placement by export-square coverage

The app must preserve continuity across panels. That means all panels still read from one common coordinate system.

The app should:

1. compute each panel's enclosing export square
2. compute the union of those squares
3. require the positioned image to cover that full union

This replaces the current assumption that the image only needs to cover the panel rectangles or width-based export squares.

If a square extends beyond a panel rectangle, that is expected and valid.

If a square extends beyond the image, the app should not clamp just one panel. It should clamp the shared background transform so every export square stays covered.

### 5. Keep calibration mode behavior unchanged

This design does not replace the current dual-mode calibration model.

- `default-union` mode stays as-is
- `custom-panels` mode keeps the same per-panel calibration flow

The change is to how custom-layout runtime preview and export interpret those saved panel rectangles.

## Data And Utility Changes

The existing custom calibration profile is sufficient for panel position data. The new work belongs in geometry helpers.

Add helpers for:

- supported ratio definitions
- nearest-ratio snapping
- deriving an enclosing square from a panel rectangle
- deriving the visible crop frame from a snapped ratio
- computing image bounds from export squares rather than width-based squares

The app should avoid persisting these derived values. They are runtime geometry derived from the saved calibration.

## Preview Behavior

### Before

- visible panel rect clips directly against the shared background image

### After

- visible panel rect shows a centered crop of a square source window derived from that panel

This difference is especially important for tall and narrow panels, where the preview currently looks more generous than Samsung production.

## Export Behavior

### Before

- exported source square side equals `panel.rect.width`

### After

- exported source square side equals `max(panel.rect.width, panel.rect.height)`

The export file count, naming, hidden-panel filtering, and Good Lock order stay unchanged.

## Risks

- Samsung may use a smaller set of legal aspect ratios than the initial supported set.
- `mediaPlayer` may eventually need panel-type-specific treatment if production behavior differs from `brightness` and `volume`.
- Retracted and expanded `buttonBox` may require separate modeling later.
- If Samsung applies hidden transform metadata during import, an explicit second-stage crop-frame flow may still be needed as a fallback.

## Manual Validation

Manual validation should focus on customized layouts that currently fail:

- `buttonBox` wide layout, expected to remain stable
- `mediaPlayer` `1:2`-style layout
- `brightness` `1:4`-style layout
- `volume` `1:4`-style layout

Validation result to look for:

- exported images align in production without manual crop edits
- preview and production show the same visible content
- tall panels are no longer over-zoomed

## Success Criteria

- Customized-layout exports no longer derive source-square size from panel width alone.
- Preview uses the same source-square model as export.
- Shared-background continuity is preserved across all present panels.
- Image pan and zoom are clamped against the union of required export squares.
- Default-layout mode remains unchanged.
