# Screenshot Calibration Plan

## Calibration source

The app uses a Galaxy S25+ on One UI 8.5 preset as the base Quick Panel template. That template stores panel rectangles for Button box, Brightness, Volume, and Media player.

Calibration uses one user-selected rectangle from a fully expanded Quick Panel screenshot. The rectangle should cover the customizable panel stack only: from the top of Button box to the bottom of Media player, and from the left edge to the right edge of those panels.

## Suggested rectangle

The initial suggestion is based on the screenshot size and the base preset's panel-union aspect ratio. It is horizontally inset by a small margin, vertically placed near the expected Quick Panel stack area, and clamped inside the screenshot.

The user can move or resize this single rectangle. They do not manually crop four panels.

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

- This assumes modern slab Galaxy phones keep the same relative panel structure within the customizable panel stack.
- If Samsung changes panel order, spacing, or individual panel proportions on a device, the one-rectangle calibration may be imperfect.
- Advanced per-panel calibration can be added later for edge cases.
- Fold, Flip, tablets, and multi-display layouts remain out of scope for this version.
