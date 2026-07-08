# v4 Idea: Controls + Buttons Support

This document captures the v4 brainstorming result for future implementation.
It is product and workflow context only. It is not an implementation plan.

## Current v2 baseline

Quick Panel Background Cropper v2 supports Good Lock Quick Panel customization
for the Controls tab only.

Supported Controls panels:

- Button box
- Brightness
- Volume
- Media player

Current user flow:

1. Landing
2. Select mode
3. Calibration
4. Image selection
5. Preview adjustment
6. Export result

Current modes:

- Default
- Advanced

Default mode asks the user to import a fully expanded Quick Panel screenshot,
draw one green rectangle around the full Controls area, and save it as the
layout basis. It scales the S25+ One UI 8.5 preset into the calibrated outer
union.

Advanced mode lets the user confirm the outer Controls area first, disable
missing supported Controls panels, set the snapping grid, then adjust enabled
panel boxes in this order:

1. Button box
2. Brightness
3. Volume
4. Media player

The current v2 Advanced flow is Controls-only.

## v4 goal

v4 should add the combined Controls + Buttons workflow after Buttons-only
support exists.

The main v4 use case is applying one selected image seamlessly across both
Controls panels and selected Buttons panels. For example, a user may want one
image to flow continuously across Wi-Fi, Bluetooth, and Button box.

The important product promise is:

- One imported Quick Panel screenshot
- One combined outer calibration area
- One shared row/column snapping grid
- One image transform
- One coordinate system
- Multiple Controls and Buttons export surfaces derived from that shared setup

## Non-goals for v4

- Do not change Default mode behavior.
- Do not turn Default into a Buttons-capable flow.
- Do not replace the Buttons-only flow.
- Do not depend on automatic device tile enumeration.
- Do not rely on private Samsung APIs or unsupported Android behavior.
- Do not add a top-level third mode unless later product evidence requires it.

## Mode structure decision

Default should remain exactly as the four Controls-only panels forever.

Advanced should branch into target choices:

- Controls only
- Buttons only
- Controls + Buttons

Recommended select-mode structure:

1. User chooses Default or Advanced.
2. If Default:
   - Continue to the existing Default Controls-only flow.
3. If Advanced:
   - Ask the user to choose the target:
     - Controls only
     - Buttons only
     - Controls + Buttons

This keeps the top-level mode screen simple and avoids mixing "difficulty" with
"customization target".

Buttons-only customization should remain a separate Advanced target or mode.
Controls + Buttons should only handle the mixed use case.

## Controls + Buttons rule

Controls + Buttons must require:

- At least one enabled Controls panel
- At least one included Buttons panel

Reason:

Controls + Buttons exists for users who want one image to span both panel
families. If a user only wants Buttons, that is a different product goal and
should be handled by a future Buttons-only flow.

## Controls + Buttons calibration flow

The agreed flow for Controls + Buttons:

1. Import a fully expanded Quick Panel screenshot.
2. Draw one outer area around all regions the user wants to customize.
   - Example: Wi-Fi + Bluetooth + Button box.
   - Example: Wi-Fi + Button box.
   - The outer area is not Controls-only. It covers both selected Controls and
     selected Buttons.
3. Choose enabled Controls panels.
4. Choose included Buttons panels.
5. Set the row/column count for the whole combined outer area.
6. Adjust the purple boxes for Controls panels.
7. Adjust the blue boxes for Buttons panels.
8. Review all boxes together.
9. Confirm the overall adjustment and save.

The row/column count intentionally stays after Controls and Buttons selection
and before box adjustment. This matches the current v2 Advanced flow order and
still works because snapping is configured before any purple or blue box
adjustment begins.

## Difference from v2 Advanced

Controls-only Advanced can mostly keep the current v2 Advanced flow.

Controls + Buttons should not be implemented as "finish Controls setup, then
start a separate Buttons setup". That would break the seamless-image promise.

Controls + Buttons is a new combined-area calibration flow:

- The green outer area covers every selected Controls and Buttons panel.
- Controls and Buttons share one snapping grid.
- Controls and Buttons share one coordinate space.
- The user adjusts both panel families before saving the calibration.

This is intentionally different from the current v2 Advanced sequence.

## Visual box colors

Use separate visual colors for editable boxes:

- Green: combined outer area
- Purple: Controls panel boxes
- Blue: Buttons panel boxes

The exact shades can be decided during UI design, but future implementation
should keep the panel families visually distinct during adjustment and review.

## Buttons panel selection

The app should not assume it can read every available Quick Settings button on
the device.

Android public Quick Settings APIs are mainly for an app exposing or requesting
its own tile. They do not provide a normal app-level API for reading the user's
complete active Samsung Quick Settings tile list.

Therefore, v4 should keep using manual/screenshot-based Buttons selection.

Recommended selection model:

- Provide common built-in button labels:
  - Wi-Fi
  - Bluetooth
  - Flashlight
  - Sound
  - Auto rotate
  - Airplane mode
  - Location
  - Mobile data
  - Hotspot
  - Smart View
  - Nearby devices
- Allow a custom label for app-specific or device-specific buttons.
  - Example: USB debugging
  - Example: TaoBao
- Let users select or create only the Buttons panels they want to customize.

Do not make a fake "all possible buttons" list the source of truth. The source
of truth should be the user's screenshot and selected boxes.

## Button geometry considerations

Buttons are not limited to fixed preset sizes.

In One UI 8.5, users can freely resize Buttons panels inside the available
Quick Panel area. A Button can be small, large, tall, wide, or any supported
grid-sized shape such as 1x1 or 4x5.

Therefore, v4 should treat Buttons like Controls panels from a geometry
perspective:

- The user decides which Buttons panels are included.
- The user decides each Button box size and position from the screenshot.
- Buttons are editable export boxes inside the calibrated area.
- Buttons should not be modeled as "large pill" vs "small grid" fixed types.

Built-in labels from the Buttons-only system help users name exports, but
screenshot geometry should drive the real positions and dimensions.

## Button export readability concern

Controls and Buttons behave differently after Good Lock applies the exported
background image.

Observed behavior:

- Controls panels apply the image with a dimmed/transparent look.
- Buttons panels apply the image more solidly.
- Solid Buttons images can hide the original icon and make the button hard to
  read.

This means Buttons exports probably need a different image treatment from
Controls exports, even though the crop method is still square cropping.

Potential Buttons export treatment:

- Darken the exported button image.
- Blur or desaturate the exported button image.
- Add a readability overlay.
- Protect likely icon/text zones with a mask.
- Tune readability based on the Button box dimensions and aspect ratio.

Do not assume PNG alpha will solve this until it is verified on real Samsung
devices and Good Lock. If alpha works reliably, transparent safe zones may be
useful later. If not, the app should use solid-image treatments that preserve
icon readability.

## Export behavior

Controls exports should continue to follow Good Lock application order.

Advanced Controls-only exports:

- Export only enabled Controls panels.

Advanced Controls + Buttons exports:

- Export enabled Controls panels.
- Export included Buttons panels.
- All exports derive from the same image placement and combined calibration.

Future implementation needs a naming/order decision for Buttons exports. A
reasonable starting point is:

- Keep Controls in existing Good Lock order.
- Export Buttons in the user's selected/reviewed order.
- Use clear filenames based on label plus sequence number when labels repeat.

## Data model implications

The current v2 model is narrow:

- `CustomizationMode` is `default | advanced`.
- `PanelId` only covers the four Controls panels.
- Presets and exports assume Controls panels.

Future implementation will likely need to separate:

- Mode: Default vs Advanced
- Advanced target: Controls only vs Buttons only vs Controls + Buttons
- Panel family: Controls vs Buttons
- Panel IDs for fixed Controls panels
- User-defined IDs or instances for Buttons panels

Avoid forcing dynamic Buttons into the existing fixed `PanelId` union. The four
Controls panels are stable product concepts; Buttons are user-selected instances
from a screenshot.

## Suggested future terminology

Potential user-facing terms:

- Default
- Advanced
- Controls only
- Buttons only
- Controls + Buttons
- Outer area
- Row count
- Column count
- Controls boxes
- Buttons boxes
- Review

Avoid naming the combined flow "Buttons mode" because it still requires at
least one Control and one Button.

## UX principles for v4

- Preserve the v2 Controls-only experience for existing users.
- Keep Default mode fast and unchanged.
- Add Buttons only where users explicitly opt into the combined Advanced flow.
- Make the shared-image concept obvious in the combined flow.
- Use one screenshot and one outer area for Controls + Buttons.
- Do not ask users to manually enter more labels than needed.
- Let geometry come from the screenshot, not from guessed device inventories.
- Keep the final review step visual, showing all purple and blue boxes together.

## Future planning notes

When implementation planning starts, first decide:

1. How the combined flow reuses the Buttons-only selection, label, export, and
   readability systems.
2. How Controls and Buttons share one outer area and snapping grid without
   regressing the existing Controls-only Advanced flow.
3. How mixed Controls and Buttons exports should be ordered in the result UI.
4. Whether the current Advanced calibration screen should branch internally or
   whether Controls + Buttons deserves a separate screen/module.

Keep tests secondary and lightweight unless explicitly requested. Product-risk
areas worth testing later are store/state transitions, calibration persistence,
and export ordering/naming. Gesture feel and real Samsung/Good Lock application
should remain manual testing concerns.
