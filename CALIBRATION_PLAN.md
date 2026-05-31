# Screenshot Calibration Plan

## Why calibration is needed

The app currently targets one known layout: Galaxy S25+ on One UI 8.5. That layout is stored as panel rectangles for Button box, Brightness, Volume, and Media player. The export logic then creates square PNGs because Samsung's panel style picker appears to apply images from a centered square crop, even though the visible panel targets are rectangles.

For other Galaxy S and A phones, there is no public One UI API that exposes the exact Quick Panel panel geometry. A model dropdown would still rely on guessed or manually maintained presets. A screenshot from the user's actual device is more precise and avoids asking the user to know screen metrics or model variants.

## Minimum-effort user flow

1. Import a fully expanded Quick Panel screenshot.
2. The app shows a suggested rectangle around the whole customizable panel stack.
3. The user taps "Looks good" or adjusts the single rectangle.
4. The app derives all four panel rectangles from that one rectangle.
5. The user selects the custom background image, adjusts it once, and exports.

The user calibrates the overall area only: from the top of Button box to the bottom of Media player, and from the left edge to the right edge of those panels. They do not manually crop four panels.

## How the geometry is derived

The existing S25+ preset remains the base template. First, calculate the union rectangle that contains the four visible panel rectangles. Then, when the user confirms a screenshot rectangle, scale every base panel from the base union into the calibrated union.

For each panel:

```ts
scaleX = calibratedUnion.width / baseUnion.width
scaleY = calibratedUnion.height / baseUnion.height

panel.x = calibratedUnion.x + (basePanel.x - baseUnion.x) * scaleX
panel.y = calibratedUnion.y + (basePanel.y - baseUnion.y) * scaleY
panel.width = basePanel.width * scaleX
panel.height = basePanel.height * scaleY
panel.radius = basePanel.radius * Math.min(scaleX, scaleY)
```

The export square logic stays the same. Each visible panel rectangle derives a square crop rectangle centered vertically around the panel. That preserves the current workaround for Samsung's square crop behavior.

## Notes and limitations

- Device model selection is optional for v1 because the screenshot is the source of truth.
- This assumes modern slab Galaxy phones keep the same relative panel structure within the customizable panel stack.
- If Samsung changes panel order, spacing, or individual panel proportions on a device, the one-rectangle calibration may be imperfect.
- Advanced per-panel calibration can be added later for edge cases.
- Fold, Flip, tablets, and multi-display layouts remain out of scope for this version.
