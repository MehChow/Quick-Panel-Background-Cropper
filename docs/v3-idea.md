# v3 Idea: Buttons-Only Support

This document captures the v3 brainstorming result for future implementation.
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

## v3 goal

v3 should add Buttons-only customization before the mixed Controls + Buttons
workflow.

The main v3 use case is applying one selected image across one or more selected
Quick Panel Buttons panels, without involving the existing Controls panels.

This is a lower-risk first step because Buttons behavior does not exist yet,
while Controls-only behavior already works in v2. Building Buttons-only first
lets the app validate dynamic Button selection, resizable Button geometry,
labeling, export naming, and Button readability before v4 combines Buttons with
Controls.

The important product promise is:

- One imported Quick Panel screenshot
- One Buttons outer calibration area
- One shared row/column snapping grid for Buttons
- One image transform
- One coordinate system for the selected Buttons panels
- Multiple Button export surfaces derived from that shared setup

## Non-goals for v3

- Do not change Default mode behavior.
- Do not turn Default into a Buttons-capable flow.
- Do not change the existing Controls-only Advanced flow beyond adding the
  Advanced target choice.
- Do not implement mixed Controls + Buttons in v3.
- Do not depend on automatic device tile enumeration.
- Do not rely on private Samsung APIs or unsupported Android behavior.
- Do not make Buttons sizes fixed presets.

## Mode structure decision

Default should remain exactly as the four Controls-only panels forever.

Advanced should branch into target choices:

- Controls only
- Buttons only

Recommended select-mode structure:

1. User chooses Default or Advanced.
2. If Default:
   - Continue to the existing Default Controls-only flow.
3. If Advanced:
   - Ask the user to choose the target:
     - Controls only
     - Buttons only

This keeps the top-level mode screen simple and avoids adding a third top-level
mode card. It also leaves room for v4 to add a third Advanced target:

- Controls + Buttons

## Buttons-only rule

Buttons-only must require at least one included Buttons panel.

It should not require any Controls panel, and it should not expose Controls
panel setup inside the Buttons-only flow.

Reason:

v3 exists to prove the Buttons system independently. Controls + Buttons is a
future v4 workflow that should reuse this system once it is stable.

## Buttons-only calibration flow

The proposed v3 Buttons-only flow:

1. Import a fully expanded Quick Panel screenshot.
2. Draw one outer area around the Buttons region the user wants to customize.
   - Example: Wi-Fi + Bluetooth.
   - Example: a resized app-specific Button.
   - Example: several custom-sized Buttons inside the Quick Panel area.
3. Choose included Buttons panels.
4. Set the row/column count for the Buttons outer area.
5. Adjust the blue boxes for Buttons panels.
6. Review all Button boxes together.
7. Confirm the overall adjustment and save.
8. Choose a background image.
9. Pan/zoom the image against the Buttons preview.
10. Export the selected Button PNGs.

The row/column count should stay after Buttons selection and before box
adjustment, matching the v2 Advanced flow pattern.

## Relationship to v4

v4 should add Controls + Buttons after Buttons-only is proven.

The v4 mixed flow should reuse the v3 Buttons system for:

- Button selection
- Custom labels
- Resizable Button boxes
- Button export naming
- Button readability treatment

v4 should then combine that system with the existing Controls Advanced system
using one shared outer area, one shared row/column grid, and one shared image
transform across both panel families.

## Visual box colors

Use separate visual colors for editable boxes:

- Green: Buttons outer area
- Blue: Buttons panel boxes

Purple should remain reserved for Controls panel boxes in Controls-only and
future Controls + Buttons flows.

## Buttons panel selection

The app should not assume it can read every available Quick Settings button on
the device.

Android public Quick Settings APIs are mainly for an app exposing or requesting
its own tile. They do not provide a normal app-level API for reading the user's
complete active Samsung Quick Settings tile list.

Therefore, v3 should use manual/screenshot-based Buttons selection.

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

Therefore, v3 should treat Buttons as user-defined export boxes:

- The user decides which Buttons panels are included.
- The user decides each Button box size and position from the screenshot.
- Buttons are editable export boxes inside the calibrated Buttons outer area.
- Buttons should not be modeled as "large pill" vs "small grid" fixed types.

Built-in labels help users name exports, but screenshot geometry should drive
the real positions and dimensions.

## Button export readability concern

Controls and Buttons behave differently after Good Lock applies the exported
background image.

Observed behavior:

- Controls panels apply the image with a dimmed/transparent look.
- Buttons panels apply the image more solidly.
- Solid Buttons images can hide the original icon and make the button hard to
  read.

This means Buttons exports probably need their own image treatment, even though
the crop method is still square cropping.

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

Advanced Buttons-only exports:

- Export only included Buttons panels.
- Export Buttons in the user's selected/reviewed order.
- Use clear filenames based on label plus sequence number when labels repeat.
- Derive all exports from the same image placement and Buttons calibration.

Future implementation needs a naming/order decision for Buttons exports. A
reasonable starting point is:

- `01-wifi.png`
- `02-bluetooth.png`
- `03-custom-label.png`
- Add a numeric suffix when labels repeat.

## Data model implications

The current v2 model is narrow:

- `CustomizationMode` is `default | advanced`.
- `PanelId` only covers the four Controls panels.
- Presets and exports assume Controls panels.

Future implementation will likely need to separate:

- Mode: Default vs Advanced
- Advanced target: Controls only vs Buttons only
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
- Outer area
- Row count
- Column count
- Buttons boxes
- Review

Avoid naming the v3 target "Controls + Buttons" because v3 should not include
Controls panel setup.

## UX principles for v3

- Preserve the v2 Controls-only experience for existing users.
- Keep Default mode fast and unchanged.
- Add Buttons only where users explicitly opt into Buttons-only Advanced setup.
- Make the Buttons-only scope obvious before calibration starts.
- Use one screenshot and one outer area for Buttons-only.
- Do not ask users to manually enter more labels than needed.
- Let geometry come from the screenshot, not from guessed device inventories.
- Keep the final review step visual, showing all blue Button boxes together.

## Future planning notes

When implementation planning starts, first decide:

1. How users add/select Buttons panels in the screenshot.
2. How custom Button labels are entered and edited.
3. How Buttons labels map to export filenames.
4. What default readability treatment Buttons exports should use.
5. Whether Buttons-only should share the current Advanced calibration screen
   shell or use a separate screen/module.

Keep tests secondary and lightweight unless explicitly requested. Product-risk
areas worth testing later are store/state transitions, calibration persistence,
and export ordering/naming. Gesture feel and real Samsung/Good Lock application
should remain manual testing concerns.
