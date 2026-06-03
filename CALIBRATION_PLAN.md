# Screenshot Calibration Plan

## Product scope

This calibration flow is only intended for Samsung phones running Android 16 with One UI 8.5, using the default Quick Panel layout.

The primary target devices are standard slab phones in Samsung's S series and A series. Fold, Flip, tablets, DeX, external displays, and heavily customized Quick Panel layouts are out of scope for this version.

This is not a generic "support every Samsung layout" calibration system. It is a narrow adaptation layer for phones that are expected to look very similar to the base reference device.

## Calibration source

The app uses a Galaxy S25+ on One UI 8.5 with the default Quick Panel layout as the base template. That template stores panel rectangles for Button box, Brightness, Volume, and Media player.

Calibration uses one user-selected rectangle from a fully expanded Quick Panel screenshot. The rectangle should cover the customizable panel stack only: from the top of Button box to the bottom of Media player, and from the left edge to the right edge of those panels.

The user only adjusts this one rectangle. They do not manually crop four separate panels.

## Why this scope makes sense

Within the target scope, Samsung phones are expected to keep the same overall Quick Panel structure:

- the same four customizable panel types
- the same visual order
- very similar internal spacing
- very similar relative widths and heights

Because of that, the app does not need to discover an entirely new layout for every phone. It only needs to adapt one known-good layout to a slightly different size and position on another similar Samsung phone.

## Suggested rectangle

The initial suggestion is based on the screenshot size and the base preset's panel-union aspect ratio. It is horizontally inset by a small margin, vertically placed near the expected Quick Panel stack area, and clamped inside the screenshot.

This suggested rectangle is only a starting point. The user can move or resize it to match their own screenshot before confirming.

## How the geometry is derived

The existing S25+ preset remains the base template.

First, calculate the union rectangle that contains the four visible panel rectangles in the S25+ preset. This "base union" is the full customizable panel stack on the reference device.

Then, when the user confirms a rectangle on their own Quick Panel screenshot, treat that rectangle as the "calibrated union" for their phone.

The app scales every base panel from the base union into the calibrated union:

```ts
scaleX = calibratedUnion.width / baseUnion.width
scaleY = calibratedUnion.height / baseUnion.height

panel.x = calibratedUnion.x + (basePanel.x - baseUnion.x) * scaleX
panel.y = calibratedUnion.y + (basePanel.y - baseUnion.y) * scaleY
panel.width = basePanel.width * scaleX
panel.height = basePanel.height * scaleY
panel.radius = basePanel.radius * Math.min(scaleX, scaleY)
```

This means:

- if another phone's panel stack is lower, every panel moves lower
- if another phone's panel stack is narrower, every panel becomes narrower
- if another phone's panel stack is taller, every panel becomes taller

The app never needs to know the device's exact Quick Panel size from an API. The screenshot already contains the real layout as rendered on that phone, and the user-provided rectangle gives the app the key measurements it needs.

## Why one rectangle is enough in this version

The app assumes that, inside the target scope, differences between phones are mostly:

- overall position
- overall width
- overall height

It does not assume the internal layout is completely different.

So instead of asking the user to mark Button box, Brightness, Volume, and Media player one by one, the app asks for a single outer rectangle covering the whole stack. That one rectangle gives enough information to infer the inner panel rectangles when the phone's layout is still structurally similar to the S25+ reference.

## Export behavior

The export square logic stays the same. Each visible panel rectangle derives a square crop rectangle centered vertically around the panel. That preserves the current workaround for Samsung's square crop behavior in Good Lock.

## Notes and limitations

- This approach is designed for Samsung phones on Android 16 and One UI 8.5 with the default Quick Panel layout.
- It should work best when Samsung keeps the same panel order and nearly the same relative proportions across supported S series and A series phones.
- If Samsung changes panel order, spacing, or individual panel proportions on a device, the one-rectangle calibration may be imperfect.
- If a user has significantly customized the Quick Panel layout, the inferred panel rectangles may no longer match.
- Advanced per-panel calibration can be added later if broader device coverage is needed.
