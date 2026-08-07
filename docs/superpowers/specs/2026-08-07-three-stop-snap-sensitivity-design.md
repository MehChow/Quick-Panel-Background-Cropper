# Three-Stop Snap Sensitivity Design

Date: 2026-08-07

## Goal

Let users choose how strongly editable Advanced panel boxes are attracted to
the snapping grid. The control has exactly three positions: **Low** at the
start, **Balanced** in the middle, and **Strong** at the end.

Snapping remains required in every Advanced target. This feature changes only
the attraction and release distances; it does not provide an Off position or
free-form panel geometry.

## User Experience

- Show a compact `Snap strength` control above the Back and Next buttons during
  editable panel-box steps such as `flow/advanced/controls-only/8.webp`.
- Do not show the control during outer-area selection, panel selection, grid
  setup, or final review.
- Render one slider with three fixed stops. Dragging or tapping the track always
  resolves to `Low`, `Balanced`, or `Strong`; intermediate values cannot remain
  selected.
- Place the three labels beneath their matching start, middle, and end stops so
  the meaning of each position is visible without opening help.
- Default to `Balanced` for users who have not selected a preference.
- Apply a new selection immediately so the next move or resize gesture uses it.
- Keep the existing snap haptic when a rectangle enters a new snap target.

The control uses the existing dark workbench styling: a compact zinc surface,
low-opacity border, white active text, zinc supporting labels, and no new
decorative color.

## Sensitivity Model

Represent the setting with a typed value rather than a free numeric percentage:

- `low`: `0.5x`
- `balanced`: `1x`
- `strong`: `1.5x`

The multiplier applies to both the capture threshold and the release threshold.
This preserves hysteresis: Strong captures from farther away and requires more
movement to detach, while Low captures closer to a target and detaches sooner.

Calculate the base thresholds in displayed screen points so the interaction
feels consistent when screenshot resolution or canvas fitting changes:

- Base capture distance: `24%` of the displayed grid-cell step, clamped to
  `10-20` screen points.
- Base release distance: `8%` of the displayed grid-cell step, clamped to `3-7`
  screen points.
- Multiply each base by the selected sensitivity value.
- Convert the resulting thresholds back to calibration coordinates using the
  canvas scale before running the existing snap matching.

Calculate horizontal and vertical thresholds independently from their displayed
column and row steps. Do not change grid lines, internal snap candidates, panel
constraints, snap keys, or haptic identity when sensitivity changes.

## State and Persistence

Sensitivity is a user interaction preference, not calibration geometry.
Therefore:

- Do not add it to `AdvancedSnapGrid` or the saved Controls-only, Buttons-only,
  or Combined calibration objects.
- Persist one global preference under a dedicated storage key such as
  `quick-panel.snap-sensitivity`.
- Share the preference across Controls-only, Buttons-only, and Combined.
- Persist a valid selection when it changes; it is not tied to calibration
  Confirm because it does not alter saved rectangles, preview composition, or
  exports.
- Treat a missing or invalid stored value as `balanced` without resetting any
  calibration or unrelated preference.

Existing calibration payload parsing remains unchanged and continues accepting
only the saved grid row and column counts.

## Component and Data Flow

Add a small feature component for the three-stop control rather than expanding
`AdvancedGridControls`, because grid-size selection and live snap strength occur
in different phases.

The flow is:

1. The Advanced calibration controller reads the shared sensitivity preference.
2. Editable panel phases pass the selected value to the footer control and the
   shared `AdvancedPanelCanvas`.
3. The canvas passes it with the existing canvas scale to each active
   `AdvancedPanelBox` and its move/resize gesture hooks.
4. Gesture worklets use the selected multiplier when creating the horizontal
   and vertical snap axes.
5. Changing the three-stop slider updates and persists the preference. The next
   gesture uses the new value without leaving the panel step.

A React state/prop update between gestures is sufficient for this interaction.
Simultaneously changing the slider with a second finger during an active panel
drag is out of scope, so the setting does not need a separate Reanimated shared
value.

## Target Coverage

The setting must use the shared canvas and gesture path so behavior stays
identical in:

- Advanced Controls-only;
- Advanced Buttons-only;
- Advanced Controls + Buttons.

Default-mode calibration is unchanged.

## Compatibility and Error Handling

- Existing users start at `Balanced` until they choose another position.
- A malformed persisted sensitivity value falls back to `Balanced`.
- Changing sensitivity never moves an existing rectangle by itself; it only
  affects subsequent drag and resize updates.
- Outer-area clamping and Combined overlap validation remain unchanged.
- Snapping remains mandatory at all three positions.

## Accessibility Scope

Do not expand the shared AniUI Slider with screen-reader increment/decrement
actions as part of this feature. The existing touch interaction and current
accessibility metadata may remain unchanged.

## Testing

Add focused automated coverage for:

- the slider exposing exactly the three Low, Balanced, and Strong positions;
- taps and drags resolving only to the three typed values;
- the control appearing only during editable panel phases;
- the default and invalid-storage fallback being Balanced;
- persistence being shared across all Advanced targets and remaining separate
  from calibration geometry;
- Low, Balanced, and Strong producing increasing capture and release distances;
- thresholds remaining consistent in screen points across different canvas
  scales;
- movement and resize using the same selected sensitivity;
- unchanged clamping, snap-key, and haptic behavior;
- saved Advanced calibration payloads still containing only grid rows and
  columns.

Run the focused snapping, gesture, canvas, controller, storage, and three-stop
control suites, followed by the full Jest suite, lint, TypeScript checking, and
`git diff --check`. Physical-device interaction QA remains with the user.

## Out of Scope

- An Off position or optional snapping
- Freely adjustable or numeric sensitivity values
- Separate sensitivity preferences per Advanced target
- Changing grid row or column limits
- Changing snap destinations or grid-dot rendering
- Moving rectangles automatically when the setting changes
- Default-mode calibration changes
- Preview, Customize, export, or Button identifier-layout changes
- Additional screen-reader behavior for the shared Slider
- New dependencies
