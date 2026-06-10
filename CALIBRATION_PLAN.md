# Screenshot Calibration Plan

## Product scope

This calibration flow is intended for Samsung phones running Android 16 with One UI 8.5 on Galaxy S25+-class slab phones.

The primary target devices are standard slab phones in Samsung's S series and A series. Fold, Flip, tablets, DeX, and external displays are out of scope for this version.

This is still not a generic "support every Samsung layout" calibration system. It is a narrow adaptation layer for phones that are expected to look very similar to the base reference device, but it now supports two calibration modes:

- `Default layout`: one outer union box for Samsung's default Quick Panel stack
- `Custom layout`: one box per panel for Button box, Brightness, Volume, and Media player, with per-panel hidden support

## Calibration source

The app uses a Galaxy S25+ on One UI 8.5 with the default Quick Panel layout as the base template. That template stores panel rectangles for Button box, Brightness, Volume, and Media player.

Calibration always starts from one fully expanded Quick Panel screenshot.

In `Default layout`, the user selects one rectangle covering the customizable panel stack only: from the top of Button box to the bottom of Media player, and from the left edge to the right edge of those panels.

In `Custom layout`, the user can either:

- continue with one screenshot for shorter layouts
- add one second screenshot for taller layouts, let the app trim its repeated phone header automatically, then align the overlap manually

The second screenshot is optional, but the app never accepts more than two screenshots for one custom calibration session.

After the screenshot entry step, the user calibrates Button box, Brightness, Volume, and Media player one by one. Each panel is either:

- marked `present` with its own saved rectangle
- marked `hidden` and skipped during preview/export

## Why this scope makes sense

Within the target scope, Samsung phones are expected to keep the same overall Quick Panel structure:

- the same four customizable panel types
- the same visual order
- very similar internal spacing
- very similar relative widths and heights

Because of that, the app does not need to discover an entirely new layout for every phone. It only needs either:

- one calibrated outer box for default-like layouts
- explicit per-panel rectangles when the user has customized the layout enough that scaling the default template would be wrong

Each mode now keeps its own saved calibration. Saving `Custom layout` no longer replaces a previously saved `Default layout` calibration, and vice versa.

## Suggested rectangle

The initial suggestion is still based on the screenshot size and the base preset's panel-union aspect ratio. It is horizontally inset by a small margin, vertically placed near the expected Quick Panel stack area, and clamped inside the screenshot.

In `Default layout`, this becomes the starting outer box.

In `Custom layout`, the app uses that same suggested union to derive first-pass panel rectangles for Button box, Brightness, Volume, and Media player.

When the custom flow uses two screenshots, that suggestion runs against the merged calibration surface after overlap confirmation, not just the first screenshot height. Those suggested per-panel boxes are still only starting points; the user can move, resize, or hide each panel before saving.

## How the geometry is derived

The existing S25+ preset remains the base template for default-layout scaling and for custom-layout suggestions.

### Default layout

First, calculate the union rectangle that contains the four visible panel rectangles in the S25+ preset. This "base union" is the full customizable panel stack on the reference device.

Then, when the user confirms one rectangle on their own Quick Panel screenshot, treat that rectangle as the "calibrated union" for their phone.

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

### Custom layout

For taller custom layouts, the app can work in one merged coordinate space built from:

- the top screenshot
- one optional bottom screenshot
- one runtime-only `bottomCropTopY` value that trims the repeated top band from screenshot 2
- one manually chosen `bottomOffsetY`

The alignment step allows vertical dragging only. The second screenshot is rendered as a clipped semi-transparent block during alignment, so the trim is reversible and never rewrites the image on disk. There is no automatic stitching, CV matching, horizontal sliding, scaling, or rotation.

For custom layouts, the saved rectangles become the runtime geometry source of truth. The app does not infer panel placement from one outer box after save.

Each panel record stores:

- `status: present | hidden`
- `rect` when present

Preview uses only present panels. Export keeps Good Lock order, but hidden panels are skipped.

Custom-layout preview and export do not treat those saved rectangles as the final crop source.

Instead, the app now separates:

- panel geometry: the saved visible rectangle and its position in the shared layout
- crop geometry: the square source window and the snapped runtime crop ratio QuickStar is expected to use

When two screenshots are used, a panel drawn over the lower screenshot is still stored in that same merged coordinate space by adding `bottomOffsetY` to the local Y value measured from the trimmed lower content.

## Why both modes exist

The app still assumes that, inside the target scope, differences between phones are often mostly:

- overall position
- overall width
- overall height

That is why `Default layout` still exists and remains the fastest path.

But Samsung now allows users to move, hide, and resize supported Quick Panel controls. Once the internal layout diverges too far from the S25+ reference, one outer rectangle is no longer enough. `Custom layout` solves that by storing real per-panel rectangles instead of scaled guesses.

## Custom-layout crop behavior

For `Custom layout`, each present panel now uses two derived runtime helpers:

- an enclosing square source rect with `side = max(width, height)`
- a snapped visible ratio chosen from the panel's allowed QuickStar groups

The export PNG is the enclosing square. Preview simulates the same square source and then applies the snapped centered crop inside the visible panel frame.

For `Custom layout`, preview is intentionally box-only:

- keep the panel border, radius, and clipped background image
- remove simulated sliders, media controls, and button placeholders
- use one uniform centered cover scale for the visible crop instead of separate X/Y scaling

This means preview may clip a small amount of extra overflow when a manually drawn panel box is noisy, but it will not squash faces or stretch proportions.

Current ratio groups used for snapping:

- `buttonBox`: `1:1`, `2:1`, `3:1`, `4:1`, `1:2`, `3:2`, `1:3`, `2:3`, `4:3`
- `brightness`: `1:1`, `1:2`, `1:3`, `1:4`, `2:1`, `2:3`, `3:1`, `3:2`, `3:4`, `4:1`, `4:3`
- `volume`: same as `brightness`
- `mediaPlayer`: `1:1`, `1:2`, `2:3`, `3:4`, `2:1`, `3:1`, `3:2`, `4:1`, `4:3`

This ratio snapping is only for `Custom layout`, and it exists to absorb small calibration noise without changing the saved panel centers.

## Export behavior

- `Default layout` keeps the previous width-based square export model.
- `Custom layout` exports enclosing squares and clamps the shared background image against the union of those required square sources.
- `Custom layout` preview is a simplified visual check, while export remains the final geometry source of truth.

## Notes and limitations

- This approach is designed for Samsung phones on Android 16 and One UI 8.5.
- `Default layout` works best when Samsung keeps the same panel order and nearly the same relative proportions as the S25+ reference.
- `Custom layout` supports moved, resized, and hidden supported panels, but it still only targets the four exportable surfaces: Button box, Brightness, Volume, and Media player.
- `Custom layout` supports at most two screenshots, and two-shot mode depends on manual overlap alignment by the user.
- In two-shot mode, screenshot 2 first trims its repeated phone header automatically at import time and then uses a fixed-height preparation surface with semi-transparent overlap rendering plus a full-width seam drag control.
- Layouts that introduce unsupported panels, new export targets, foldable-only arrangements, or radically different aspect behavior remain out of scope.
