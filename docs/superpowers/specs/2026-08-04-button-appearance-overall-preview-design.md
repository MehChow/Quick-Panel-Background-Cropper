# Button Appearance Overall Preview Design

## Goal

Make the Button appearance dialog less vertically constrained and provide an
optional full-layout view for checking the draft against the complete Quick
Panel composition.

## Approved behavior

- Reduce the color wheel to 150dp by 150dp. Keep the existing slider, HEX
  input, theme toggle, validation, and transaction behavior unchanged.
- Add an eye button to the dialog title row's top-right corner.
- Open a separate modal overlay containing the existing static
  `QuickPanelPreview` composition. The overlay is read-only and receives the
  current image, preview URI, transform, panel intensity, identifier settings,
  and latest valid draft appearance.
- Dismiss through the dimmed backdrop or Android Back. The preview must not
  create a second crop, transform, or persistence path.
- Localize the trigger label, hint, and dismissal label in English and
  Traditional Chinese.

## Verification

- Focused tests cover the 150dp wheel and overlay open/dismiss behavior.
- Tests assert that the overlay receives the live transactional appearance and
  existing preview inputs.
- Manual device QA remains required for visual spacing and the full-layout
  overlay on the target Samsung portrait viewport.
