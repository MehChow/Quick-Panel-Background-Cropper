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
containing the four customizable panels. The app then asks the user to set the
snapping grid once, initializes four labeled boxes from the default preset,
and guides the user through four separate adjustment steps in this order:

- Button box
- Brightness
- Volume
- Media player

This wizard-style flow keeps the screen focused on one active box instead of
making all four boxes editable at once. Completed boxes stay visible as fixed
references, so the user can compare the remaining panels against what has
already been aligned before moving to the final four-box review screen.

If the user already saved an Advanced calibration before, re-importing a new
screenshot rescales that saved Advanced layout into the new screenshot first,
so the user starts from their previous arrangement instead of the default one.

The outer rectangle:

- defines the background customization area
- constrains all four panel boxes
- provides alignment edges and a stable preview coordinate space

### Snapping grid

Advanced mode includes a snapping grid helper inside the confirmed outer
rectangle.

- The default grid starts at 4 columns and usually 5 rows.
- Right after the outer area is confirmed, the user chooses the column and row
  counts once before the first panel-box adjustment step.
- The chosen grid remains visible as alignment guidance during panel-box
  adjustment and review. To change it later, the user goes back to the grid
  step instead of editing it inline on each panel step.
- The active panel box snaps against nearby grid targets while still allowing
  slow, precise drag and resize adjustments.
- Interior snap targets intentionally leave small visible gaps between panel
  boxes, which better matches the real Quick Panel spacing and reduces accidental
  overlap.

The goal of the grid is not to force a rigid layout. It acts as a lightweight
alignment assist so customized Samsung layouts can be matched more accurately,
with less manual pixel-pushing, while still letting users override the grid
when needed.

### Current implementation notes

The current advanced panel-editing screen intentionally behaves differently
from the outer-rectangle confirmation step:

- The **outer confirmation step** still shows the full imported screenshot so
  the user can place the master green rectangle against the full Quick Panel.
- The **grid, panel-box editing, and confirm steps** crop the displayed
  screenshot to the confirmed outer rectangle only. This reduces wasted
  vertical space and keeps the alignment view focused.

Important implementation details for future changes:

- The app still stores `outerRect` and all panel rects in **full screenshot
  coordinates**.
- `AdvancedPanelCanvas.tsx` creates a **local cropped viewport** for display
  only.
- The canvas uses a real inner wrapper with `inset-px` so the green border can
  be visible on all four sides without corrupting snapping math.
- The image, green outer border, orange panel boxes, and snap points are all
  rendered inside that same inner wrapper. This keeps the visible alignment
  correct and avoids the right/bottom drift that happened when inset math was
  applied separately to overlays.
- `toLocalRect(...)` and `fromLocalRect(...)` convert between stored full-image
  coordinates and cropped local display coordinates. If a future change touches
  drag, resize, or snapping behavior, this transform layer is the first place
  to inspect.
- Advanced validation now intentionally allows a small inside-edge tolerance
  (`0.75`) when checking whether panel boxes remain inside the outer rectangle.
  This prevents false invalidation when snapping/scaling leaves a box only a
  fraction of a pixel outside the stored bounds even though it still appears
  visually inside on screen.

Grid controls also changed from the original bottom-sheet-only approach:

- The help/examples still live in the bottom sheet opened from the header
  helper button or the inline grid help button during the dedicated grid step.
- The live grid controls now appear only during the dedicated grid step in the
  fixed bottom action area.
- The current control UI is a compact **axis chip + shared slider** dock:
  `Col`/`Row` chips show the current values, and one shared slider adjusts
  whichever axis is active while the user is on the grid step.
- The slider box intentionally does **not** repeat the label/value because the
  top chips already carry that context.

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

### Export rendering notes

The current export flow mounts hidden export surfaces only when export begins in
order to keep preview adjustment responsive with large source images.

Important implementation details for future changes:

- Hidden export surfaces must not be captured immediately after they mount.
- `ExportSurface.tsx` now reports when its image finishes loading.
- `ExportSurfaces.tsx` waits until all four hidden export images have reported
  loaded before signaling readiness.
- `useCustomizeScreen.ts` only starts `captureRef(...)` after that readiness
  signal. Without this gate, the first export tile can be captured before its
  image paints and appear as a black square, most noticeably for Button box
  because it is first in Good Lock export order.

### Customization image handling

Customization image import now behaves differently from calibration screenshot
import:

- Calibration screenshot import remains untouched and is still meant to reflect
  the user’s real Quick Panel screenshot as directly as possible.
- Customization background import may downscale large images locally for
  smoother drag/zoom adjustment.
- User-facing optimize/too-large messages should be stored as translation keys
  and translated at render time, not pretranslated strings, so language toggles
  update inline feedback correctly.

## Persistence

Default and Advanced calibrations are stored independently. Existing v1
single-rectangle calibrations migrate into the Default calibration slot.
Imported screenshots and selected background images are not persisted.
