## Goal

Make custom Button labels easier to distinguish and configure in the Advanced Buttons-only selection screen.

## Design

- Offer eight generic Lucide icons in a fixed two-row, four-column picker:
  `Zap`, `Star`, `Sparkles`, `Circle`, `Music`, `Gamepad`, `Globe`, and `Sliders`.
- Show the icon glyphs without visible text labels. Preserve translated accessibility labels for each choice.
- Keep the selected icon ID only for the current unreleased flow. No migration
  or local-data compatibility is required.
- Render built-in selected-button chips with the current green styling.
- Render custom selected-button chips with an amber/orange border and background.
- Render the selected custom icon before its label, followed by the remove icon.

## Scope

Update the custom icon catalog, picker presentation, selected-chip presentation, and focused automated coverage. Do not change calibration geometry, export behavior, built-in labels, or persisted storage.

## Verification

- Run the focused model/component tests.
- Run TypeScript/lint checks applicable to the changed files.
- Visually inspect the selection screen if an Android device is available.
