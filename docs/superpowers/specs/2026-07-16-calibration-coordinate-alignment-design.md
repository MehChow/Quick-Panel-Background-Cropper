# Calibration Coordinate Alignment Design

## Goal

Ensure the outer green calibration rectangle matches the screenshot pixels shown
to the user in Default, Advanced Controls, and Advanced Buttons, including the
read-only area preview and later editable canvas.

## Root Cause

The shared outer calibration canvas calculates one scale from its outer width
and height, then applies a layout border to that same container. React Native
lays the screenshot out inside the border while the green overlay continues to
use the outer scale. The saved rectangle is therefore compressed toward the
top-left before later screens receive it.

The read-only Advanced preview has a second instance of the same layout pattern:
its bordered clipping view is sized to the crop dimensions, so the border
reduces the visible image area.

## Selected Approach

Keep coordinate and clipping surfaces borderless. Draw every decorative border
as an absolute, non-interactive overlay that does not participate in layout.

This approach preserves the current rounded frame, white outline, shadow, green
outline, gestures, and animations without adding border compensation to the
coordinate math.

## Outer Calibration Canvas

The shared outer canvas will use three layers:

1. A shadow wrapper sized to the calculated screenshot dimensions.
2. A borderless rounded coordinate surface containing the screenshot and green
   rectangle overlay.
3. Absolute frame overlays containing the existing white and dark borders with
   `pointerEvents="none"`.

The screenshot and green overlay will therefore occupy the same width and
height and use the same scale. Gesture conversion and the `PanelRect` data shape
remain unchanged.

This shared change covers Default, Advanced Controls, and Advanced Buttons.

## Read-Only Area Preview

The Advanced selection-area preview will keep its measured card at exactly the
calculated preview size. The screenshot will be clipped by a borderless rounded
surface, and the emerald outline will be drawn as an absolute sibling overlay.

Animation origin, timing, haptics, modal dismissal, accessibility focus, crop
clamping, and aspect-ratio fitting remain unchanged.

## Editable Canvas and Export

The editable Advanced canvas does not need new coordinate compensation. Once it
receives a correctly saved `outerRect`, its current screenshot translation and
scaling should reproduce the selected area accurately.

Panel movement and resize constraints remain relative to `outerRect`. Default
and Advanced export geometry remains unchanged.

## Calibration Persistence

Existing calibrations cannot be corrected reliably because the viewport
dimensions and device density used when they were created were not stored.

Calibration persistence will be rebuilt on one stable, unversioned
`quick-panel.calibrations` key. The payload will contain only the current
Default, Advanced Controls, and Advanced Buttons calibration shapes. It will
not contain an app version or storage version.

Legacy calibration flags and versioned calibration keys will not be read,
migrated, or deleted. Users with only old calibration data will receive an
empty calibration state and recalibrate once. Unrelated persisted preferences
remain untouched, including language, seen-help state, last exported mode, and
last exported Advanced target.

## Testing

Automated coverage will verify:

- The outer coordinate surface has the exact calculated screenshot dimensions
  and no layout border.
- Decorative frame borders are absolute and non-interactive.
- The screenshot and selection overlay receive the same scale.
- The read-only preview clips at the full preview dimensions while its emerald
  border remains decorative.
- Wide, tall, and small crops preserve their aspect ratios.
- Legacy calibration keys are ignored and the new unversioned payload
  round-trips correctly.
- Unrelated persisted preferences survive the calibration storage replacement.

Focused tests will be followed by the complete Jest suite, ESLint, TypeScript,
and `git diff --check`.

## Manual Acceptance Criteria

Using the same imported screenshot:

- Default, Advanced Controls, and Advanced Buttons show the same selected pixel
  boundaries after leaving the outer step.
- The Advanced eye preview and editable canvas agree with the outer selection.
- Left and top edges do not gain gaps, and right and bottom edges do not intrude.
- Small button-area crops do not magnify the mismatch.
- Differences between stages are limited to at most one physical pixel from
  raster rounding.
- Existing rounded frames, borders, shadows, handles, animations, and gestures
  look and behave unchanged.
- One Controls export and one Button export match their final editable boxes.

## Out of Scope

- Changing preset geometry or panel definitions.
- Adding separate horizontal and vertical gesture scales.
- Migrating mathematically corrected version-3 coordinates.
- Redesigning calibration UI or help content.
- Adding dependencies.
