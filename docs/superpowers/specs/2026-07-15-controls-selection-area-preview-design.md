# Controls Selection Area Preview Design

## Goal

Make the existing Advanced Buttons selection-area preview reusable and add it
to the Advanced Controls panel-toggle step. The preview is a memory aid: it
shows the clean crop of the green outer area the user confirmed previously.

## Shared Preview

Rename the Button-specific preview component, overlay, geometry helpers, and
animation reset helper to calibration-area names. Both selection branches use
that shared feature with the same `screenshot` and `outerRect` inputs.

The shared preview preserves the current behavior:

- Tap the eye to open a read-only crop of the confirmed outer area.
- Dim and block the selection screen while the preview is open.
- Close from the backdrop or Android back and return accessibility focus.
- Trigger one selection haptic when opening.
- Clamp the crop to screenshot bounds and preserve its aspect ratio.
- Animate between the eye and preview card, with the existing reduced-motion
  behavior and animation reset on every opening.
- Do not create a cropped asset, persist preview state, or mutate calibration.

The crop does not show enabled Controls boxes or react to panel-toggle state.

## Controls Placement

Place a 48-by-48 eye button at the upper-right of the Controls selection card,
beside the title and supporting text. The text remains the dominant explanation,
while the eye is visible before the user starts scanning the four toggles. This
keeps the control away from the per-panel On/Off affordances and preserves the
header help position.

Use the existing dark inset surface, quiet border, white eye icon, and emerald
open state so the control matches the Buttons branch and the app's calibration
color language.

## Data Flow

`AdvancedCalibrationScreen` passes the current screenshot and confirmed outer
rectangle into `AdvancedPanelSelection`, as it already does for
`ButtonPanelSelection`. Each selection component decides where to render the
trigger, while the shared preview owns crop geometry, transient open state,
animation, haptics, modal dismissal, and accessibility focus.

Panel enablement remains owned by `AdvancedPanelSelection`. Previewing must not
change the enabled panel list or Next-button state.

## Testing

- Rename and retain the shared preview interaction, geometry, and animation
  tests.
- Add a Controls selection integration test proving the eye opens the shared
  preview and panel toggles still update normally.
- Run the focused tests first, then the complete Jest suite, lint, TypeScript,
  and `git diff --check`.

## Out of Scope

- Drawing enabled or disabled panel boxes in the preview.
- Editing or returning to the outer-area step from the preview.
- Changing the Buttons preview interaction or appearance.
- Adding dependencies, persistence, or generated crop files.
