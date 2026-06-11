# Quick Panel Calibration Plan

## Product scope

Quick Panel Background Cropper targets Samsung phones running Android 16 with
One UI 8.5. In v2 it only exports backgrounds for the four Good Lock
**Controls** targets: Button box, Media player, Brightness, and Volume.

The app provides two modes:

- Default customization for phones using the standard Quick Panel Controls
  layout.
- Advanced customization for users who have rearranged or resized those four
  Controls panels.

Fold, Flip, tablets, DeX, external displays, other One UI versions, additional
panel types, the Good Lock **Buttons** tab, and multiple saved layout profiles
remain out of scope.

## Default customization

Default mode uses a Galaxy S25+ on One UI 8.5 as the base preset. The user
imports a fully expanded Quick Panel screenshot and adjusts one rectangle around
the customizable panel stack.

The app scales every base panel from the base preset union into that calibrated
rectangle:

```ts
scaleX = calibratedUnion.width / baseUnion.width
scaleY = calibratedUnion.height / baseUnion.height

panel.x = calibratedUnion.x + (basePanel.x - baseUnion.x) * scaleX
panel.y = calibratedUnion.y + (basePanel.y - baseUnion.y) * scaleY
panel.width = basePanel.width * scaleX
panel.height = basePanel.height * scaleY
```

This remains the fastest path when the panel structure is unchanged.

## Advanced customization

Advanced mode also starts from a fully expanded Quick Panel screenshot. The
outer customization area is still anchored from the same S25+ preset logic used
in Default mode, and the first set of four boxes is initialized from that
calibrated preset.

The user first confirms a required outer rectangle around the full area
containing the four customizable panels. The app then initializes four labeled
boxes from the default preset and lets the user move and resize each box to
match the screenshot.

If the user already saved an Advanced calibration before, re-importing a new
screenshot rescales that saved Advanced layout into the new screenshot first,
so the user starts from their previous arrangement instead of the default one.

The outer rectangle:

- defines the background customization area
- constrains all four panel boxes
- provides alignment edges and a stable preview coordinate space

Panel boxes may be horizontal, vertical, square, reordered, or separated. They
must remain inside the outer rectangle and may not overlap.

## Export behavior

Good Lock accepts one square image for each panel and displays the centered area
that matches the panel's aspect ratio. The export square therefore uses the
panel's longest side:

```ts
side = Math.max(panel.width, panel.height)
x = panel.x + (panel.width - side) / 2
y = panel.y + (panel.height - side) / 2
```

The same background transform is rendered into all four centered export
squares, preserving continuity across arbitrary panel layouts. PNGs are always
exported in Good Lock application order: Button box, Media player, Brightness,
then Volume.

## Persistence

Default and Advanced calibrations are stored independently. Existing v1
single-rectangle calibrations migrate into the Default calibration slot.
Imported screenshots and selected background images are not persisted.
