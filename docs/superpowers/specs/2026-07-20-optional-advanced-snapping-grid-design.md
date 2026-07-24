# Optional Advanced Snapping Grid Design

## Goal

Let users disable the snapping grid in both Advanced Controls-only and
Buttons-only calibration. The setting is controlled by an AniUI switch beside
the existing Grid Help button and is remembered independently for each target.

## Interaction

- The grid starts enabled for new calibrations and saved calibrations that do
  not yet contain the new setting.
- The Grid Help button remains available in both states.
- Turning the grid off hides the grid overlay, disables snap behavior and snap
  haptics, and dims/disables the row, column, and slider controls.
- With the grid off, panels still move and resize freely while remaining
  clamped inside the confirmed outer area.
- Turning the grid back on restores the previous row and column values.

## Data Model and Persistence

Add `isGridEnabled: boolean` to `AdvancedCalibration` and
`AdvancedButtonsCalibration`. Pass it through calibration save and restore so
Controls-only and Buttons-only remember separate choices.

The storage parser must treat a missing value as `true`, preserving all current
saved calibrations without resetting user data. Invalid non-boolean values also
fall back to `true` rather than invalidating an otherwise valid calibration.

## Components and Data Flow

- `useAdvancedCalibrationScreen` owns the in-progress toggle state, initializes
  it from the selected target's saved calibration, and passes it when saving.
- `AdvancedCalibrationControls` renders `src/components/ani-ui/switch.tsx`
  beside `GridHelpButton` and disables the grid-dimension controls when off.
- `AdvancedPanelCanvas` hides `AdvancedSnapGridOverlay` when off and forwards
  the flag to each editable panel.
- Move and resize gesture geometry accepts the flag. Enabled behavior keeps the
  existing snap calculation; disabled behavior applies the raw gesture delta,
  then clamps the result to the outer area without producing a snap key.

No grid dimensions are discarded or rewritten when the toggle changes.

## Accessibility and Copy

Add localized English and Traditional Chinese labels for the snapping switch.
The switch exposes that label through `accessibilityLabel`; native switch state
communicates whether it is on or off.

## Testing

- Storage tests verify legacy payloads default to enabled and both target
  branches round-trip explicit disabled values.
- Gesture tests verify disabled movement and resizing do not snap, still clamp,
  and return no snap key; existing enabled snapping tests remain unchanged.
- Control tests verify the switch calls the toggle handler and grid-dimension
  inputs are disabled while snapping is off.
- Screen/canvas tests verify the enabled flag is wired to controls and editable
  panels, and the overlay is hidden when disabled.

Verification runs focused Jest tests first, followed by the full Jest suite,
Expo lint, TypeScript checking, and `git diff --check`.

## Out of Scope

- Default-mode calibration
- Changing saved grid dimensions when snapping is disabled
- Changing Button grid-span metadata or export geometry
- Adding dependencies or replacing the existing AniUI switch component
