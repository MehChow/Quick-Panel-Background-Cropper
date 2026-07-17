# Buttons Identifier Position Controls Design

**Date:** 2026-07-17
**Status:** Approved for implementation planning

## Purpose

The first Buttons identifier overlay pass places horizontal icon-and-label
groups near the left edge and vertical icons near the top edge. Real Good Lock
output shows that these fixed positions can conflict with the subject of the
selected artwork and can feel too close to the long Button edge.

Add constrained, screen-local position controls for long Buttons while keeping
square-like Button identifiers exactly as they are today.

## Scope

This change applies only to Advanced Buttons-only Customize previews and
exports. It adds:

- one horizontal position slider for horizontal long Buttons;
- one vertical position slider for vertical long Buttons;
- safe movement constraints derived independently for preview and export; and
- export readiness for any identifier whose final position depends on measured
  content size.

It does not change square-like placement, icon selection, identifier opacity,
Button image intensity, calibration, filenames, export order, Default mode, or
Advanced Controls.

## Alternatives considered

1. **Always center long identifiers.** This fixes the current edge-heavy default
   with no new controls, but cannot adapt to artwork composition.
2. **Use one shared long-shape position slider.** This is compact, but couples
   unrelated directions: shifting Wi-Fi right would also move Bluetooth down.
3. **Use separate horizontal and vertical sliders.** This adds one extra row but
   lets each orientation be composed independently. This is the selected
   approach.

Per-Button position controls are intentionally out of scope. They would add
selection state, substantially more UI, and persistence questions without
evidence that the global orientation controls are insufficient.

## Shape classification

Reuse the saved grid-span metadata:

| Grid relationship | Position behavior |
| --- | --- |
| `columnSpan > rowSpan` | Horizontal slider moves icon and label together left/right |
| `rowSpan > columnSpan` | Vertical slider moves the icon up/down |
| `columnSpan === rowSpan` | No position adjustment; preserve current placement |

This deliberately treats both `1x1` and roomy equal-span Buttons such as `2x2`
as square-like. Their current content and visual centering remain unchanged.

## Customize controls

Add two controls below identifier intensity:

- `Horizontal identifier position`
- `Vertical identifier position`

Each slider ranges from `0` to `100` and defaults to `50`, the midpoint of its
safe movement track. The horizontal slider means left to right; the vertical
slider means top to bottom.

The controls are screen-local and reset to `50` whenever Customize is entered.
They are not stored in Zustand, MMKV, or calibration data. Turning identifiers
off preserves both values for the remainder of that visit while disabling and
dimming the visible position controls.

Only render the horizontal slider when the active preset contains at least one
horizontal long Button. Only render the vertical slider when it contains at
least one vertical long Button. A square-only preset shows neither slider.

## Constrained movement

Position values are normalized intent, not raw pixels. Preview and export each
derive their own safe movement track from their rendered bounds and target-
specific sizes.

### Horizontal long Buttons

Move the icon and localized label as one content group. Measure the rendered
group width, then calculate:

```text
safeStart = inset
safeEnd = bounds.width - inset - contentWidth
travel = max(0, safeEnd - safeStart)
left = safeStart + travel * (horizontalPosition / 100)
```

The group keeps the existing one-line shrink/truncate behavior and cannot
cross either safe inset. Longer localized labels naturally reduce available
travel; if the group consumes the whole safe width, travel becomes zero rather
than clipping outside the Button.

### Vertical long Buttons

Vertical identifiers are icon-only, so their height is already known:

```text
safeStart = inset
safeEnd = bounds.height - inset - iconSize
travel = max(0, safeEnd - safeStart)
top = safeStart + travel * (verticalPosition / 100)
```

The icon remains horizontally centered. The slider only changes its vertical
position.

### Square-like Buttons

Do not apply either position value. Preserve the current identifier layout and
centering exactly.

## Rendering and data flow

Customize owns two numeric states initialized to `50`. It passes their
normalized `0...1` values to `QuickPanelPreview` and `ExportSurfaces`, which
thread them to the shared `ButtonIdentifierOverlay`.

The pure layout module continues to own shape classification and target sizing.
Extend its result with an orientation/position variant and helpers for safe
horizontal and vertical offsets. The overlay owns horizontal content
measurement because only the rendered icon-and-label group knows its final
localized width.

The same normalized values must affect preview and export. Their absolute pixel
offsets differ because their bounds, fonts, icons, and insets differ.

## Export readiness

Horizontal export placement depends on a measured content width. Export capture
must not begin until the horizontal identifier has measured, re-rendered at its
final constrained position, and reported ready.

Extend export readiness so each panel waits for:

1. its image load; and
2. identifier layout readiness when measurement is required.

Panels without a visible horizontal identifier treat identifier layout as
ready immediately. The readiness state resets when the image URI, export load
token, preset, visibility, or either position value changes.

## Accessibility and copy

Both sliders use the existing accessible AniUI Slider behavior and expose
`0...100` values. English copy:

```text
Horizontal identifier position
Vertical identifier position
```

Add natural Traditional Chinese equivalents and preserve locale parity tests.
Do not encode left/right or top/bottom only by color or icons.

## Testing

Add focused coverage for:

- horizontal, vertical, and equal-span classification;
- `0`, `50`, and `100` mapping to safe start, midpoint, and safe end;
- travel clamping to zero when content consumes the safe axis;
- square-like layouts ignoring both position values;
- preview and export using the same normalized values with different absolute
  offsets;
- horizontal content measurement moving icon and label together;
- vertical movement preserving horizontal centering;
- controls appearing only for orientations present in the preset;
- both controls defaulting to `50`, resetting per visit, and remaining
  independent from image intensity and identifier opacity;
- controls staying mounted where applicable but disabled and dimmed while
  identifiers are off;
- preview and export updating together;
- export readiness waiting for measured horizontal content; and
- Controls rendering, Button filenames/order, and existing square-like output
  remaining unchanged.

## Device QA

On a Samsung device, recreate a mixed layout containing horizontal, vertical,
and square-like Buttons. Verify both sliders at `0`, `50`, and `100`, apply the
exports in Good Lock, and confirm:

- long identifiers remain inside rounded visible bounds;
- icon and label move together horizontally;
- vertical icons remain horizontally centered;
- square-like identifiers do not move;
- preview and Good Lock placement correspond; and
- leaving and reopening Customize resets both sliders to `50`.

Record the device model, One UI version, and QuickStar version in the
implementation completion notes.

## Acceptance criteria

- Users can reposition horizontal and vertical long identifiers independently.
- Long identifiers never cross their target-specific safe insets.
- Square-like Buttons are visually unchanged.
- Both controls default and reset to `50` and are never persisted.
- Preview and export share normalized intent and calculate their own absolute
  offsets.
- Export capture waits for final measured horizontal placement.
- Existing opacity, image intensity, calibration, filenames/order, Default,
  and Controls behavior remain unchanged.
