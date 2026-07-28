# Remove Optional Advanced Snapping Grid Design

Date: 2026-07-28

## Goal

Remove the snapping-grid toggle from both Advanced Controls-only and Advanced
Buttons-only calibration. The grid becomes a required part of Advanced
calibration again so row and column values consistently control rectangle
snapping and, for Buttons-only, identifier layout metadata.

## User Experience

- Controls-only and Buttons-only always show the snapping grid during the grid
  and editable-panel steps.
- Row, column, and grid-size controls remain enabled.
- Moving or resizing a panel always snaps to the configured grid and uses the
  existing snap haptics.
- Every panel remains constrained to the confirmed green outer area.
- Remove the snapping switch and its accessibility/localization copy.
- Preserve the existing Grid Help button and grid instructions.

This restores one clear calibration model: users define the outer area, set
the grid, and adjust panels against that grid.

## Buttons-only Behavior

Buttons have fixed grid sizes rather than arbitrary irregular sizes. The
configured rows and columns therefore remain the source for:

- snapping Button rectangles;
- rounding each Button rectangle to its row and column span;
- selecting the Customize identifier layout;
- calculating the shared identifier reference-cell size used by preview and
  export.

There is no automatic grid-independent Button-size estimation in this change.

## State and Persistence

Remove `isGridEnabled` from the active Advanced calibration models, screen
state, store actions, canvas props, and gesture inputs.

Existing v1.1.0 calibration payloads may contain `isGridEnabled: false`.
Storage loading must tolerate and ignore that obsolete field while preserving:

- Advanced Controls and Advanced Buttons rectangles;
- outer areas;
- row and column counts;
- selected Controls and Buttons;
- all unrelated preferences.

No calibration reset or migration announcement is required. New saves omit the
obsolete field, so persisted data is cleaned naturally when calibration is
saved again.

## Gesture and Rendering Flow

Remove disabled-grid branches from movement and resizing. Gesture calculations
always use the existing snap functions, then clamp the result inside the outer
area. The canvas always renders the grid outside the final confirmation phase.

Controls-only and Buttons-only continue sharing the same grid controls and
gesture behavior. Buttons-only continues deriving identifier spans and sizing
from the saved grid without a separate fallback path.

## Preview and Export Boundary

This removal does not change calibration preview crop geometry, Customize image
composition, centered-square Button exports, image transforms, identifier
settings, or PNG dimensions.

The reported enlarged green-area preview strip is a separate coordinate-
alignment investigation. It must not be addressed by allowing free-form Button
rectangles or by changing export geometry as part of this removal.

## Compatibility and Error Handling

- Missing or legacy `isGridEnabled` values must not invalidate saved
  calibrations.
- A previously disabled calibration reopens with snapping enabled and its saved
  grid counts visible.
- Existing invalid-calibration handling remains unchanged.
- No new dependencies or storage keys are introduced.

## Testing

Update focused coverage to verify:

- both Advanced branches render grid controls without a switch;
- row, column, and slider controls are always enabled;
- the grid overlay is present during editable steps;
- movement and resizing always snap, clamp, and produce the expected snap key;
- legacy payloads containing either `isGridEnabled: true` or
  `isGridEnabled: false` load without losing calibration data;
- newly saved calibrations omit `isGridEnabled`;
- Buttons-only still derives `1x1`, long, vertical, and multi-row/multi-column
  identifier layouts from the configured grid;
- existing Controls-only and Buttons-only calibration persistence remains
  independent.

Remove tests that only assert disabled-grid movement, hidden overlays, disabled
controls, or switch interaction.

Run the focused calibration, storage, gesture, Button identifier, and export
suites, followed by the full Jest suite, lint, TypeScript checking, and
`git diff --check`. Device QA remains for the user.

## Out of Scope

- Automatically estimating Button grid sizes without row and column input
- Changing supported Button sizes
- Fixing or compensating for the enlarged green-area preview strip
- Changing Default-mode calibration
- Resetting existing calibration or unrelated persisted preferences
- Changing Customize or export image composition
