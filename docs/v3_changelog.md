# v3 Changelog

Developer-facing summary of the final `feature/v3/buttons` branch state.

## Release context

- Production baseline: Google Play `v1.0.0`, referred to internally as v2.
- v2 supports Controls customization only: Button box, Brightness, Volume, and
  Media player through Default and Advanced modes.
- v3 keeps those Controls workflows and adds a complete Advanced Buttons-only
  workflow, plus shared calibration, customization, persistence, and
  performance improvements.
- This changelog describes final user-relevant behavior. Intermediate
  experiments, temporary review tooling, implementation-only cleanup, and
  debugging/polishing commits are intentionally omitted.

## Summary

v3 expands Advanced mode into two explicit targets:

- **Controls only** preserves the existing customizable Controls workflow.
- **Buttons only** lets users select, calibrate, customize, and export one or
  more Quick Panel Buttons as separate PNGs.

Default remains Controls-only. Mixed Controls + Buttons calibration is not part
of v3.

## Mode selection and saved workflows

- Advanced target selection is now a separate visible step after choosing
  Advanced, rather than a third top-level mode.
- The app remembers the last successfully exported main mode and, for Advanced
  exports, the last successfully exported target.
- Returning users see those choices preselected, but the app does not skip the
  visible selection steps automatically.
- Default, Advanced Controls, and Advanced Buttons use separate saved
  calibrations. Recalibrating one workflow does not overwrite the others.

## Advanced Buttons-only workflow

Buttons-only adds an end-to-end path matching the established app flow:

1. Import a fully expanded Quick Panel screenshot.
2. Place one green outer rectangle around the Buttons region.
3. Select one or more Button labels.
4. Configure the shared row and column grid.
5. Move and resize each generated Button box to match the screenshot.
6. Review all selected Button boxes together and save the calibration.
7. Choose one background image and adjust one shared pan/zoom transform.
8. Customize Button image and identifier appearance.
9. Export one square PNG for every selected Button in the shown order.

Buttons are screenshot-driven, user-sized rectangles. They are not restricted
to preset shapes, and the app does not attempt to read Samsung's active Quick
Settings Button list through unsupported APIs.

## Button selection and labels

- The final catalog contains 30 reviewed built-in Button labels with stable
  icon mappings.
- Common labels are pinned first, while the complete catalog remains searchable.
- Search matches both canonical English labels and localized labels.
- Built-in labels are displayed in English or Traditional Chinese according to
  the app language.
- Canonical English values remain the stored source of truth and are used for
  stable export filenames.
- Users can add device-specific or app-specific custom labels.
- Adding a custom label requires choosing one of eight generic icons: Zap,
  Star, Sparkles, Circle, Music, Gamepad, Globe, or Sliders.
- Selected built-in labels use green chips. Custom labels use amber chips and
  show their chosen icon so they are easy to distinguish and remove.
- At least one Button is required before the workflow can continue.

## Calibration enhancements

- Buttons-only reuses the Advanced outer-area, grid, box-adjustment, review,
  leave-warning, and help-sheet patterns already familiar from Controls.
- Both Advanced panel-selection steps include an eye control that previews the
  previously confirmed outer screenshot area without changing calibration
  data.
- Buttons use blue boxes while being edited and orange boxes after completion,
  matching the established Advanced review semantics.
- Snapping can now be disabled in Advanced Controls or Advanced Buttons.
  Turning it off hides the grid, disables grid-size controls and snap haptics,
  and allows free movement and resizing while keeping every box inside the
  confirmed outer area.
- The previous row and column values are retained when snapping is turned off,
  then restored when it is enabled again.
- Grid-enabled state is saved independently for Advanced Controls and Advanced
  Buttons. Existing saved payloads without the flag default to enabled.

## Buttons Customize controls

Buttons-only receives a compact adjustment panel designed to keep the live
preview visible while editing. It includes:

- **Button image intensity** for the background artwork.
- **Show labels** to include or remove the app-rendered Button icons and names
  from both preview and exported PNGs.
- **Label intensity** for the Button icon and text.
- **Horizontal position** for long horizontal Button labels.
- **Vertical position** for long vertical Button labels.
- A separate light/dark icon-style toggle. Light uses a gray circle with a
  white icon; dark uses a white circle with a dark icon. The toggle is disabled
  when labels are hidden and provides pressed-state feedback.

The Image, Labels, Horiz., and Vert. tabs share one slider area. Orientation
tabs appear only when the active Button layout needs them. Hiding labels
disables label-related controls and returns the active adjustment to Image.

Final branch behavior persists all six Buttons Customize settings across
screen visits and app restarts under `quick-panel.button-customize-settings`.
The defaults for a fresh install are:

- Button image intensity: `78%`
- Label intensity: `70%`
- Show labels: enabled
- Horizontal label position: `50%`
- Vertical label position: `50%`
- Label icon style: Light

This persistence is newer than the earlier v3 specs and README text that
describe these values as screen-local; the final implementation is the source
of truth.

## Button identifiers

Buttons-only can render stable icons and labels above the selected image in both
the live preview and final PNGs. The selected light or dark icon style is
shared by preview and export. Controls exports are unchanged.

Identifier content follows the calibrated grid span:

| Button shape                        | Identifier layout                          | Position control |
| ----------------------------------- | ------------------------------------------ | ---------------- |
| `1 x N`, where `N > 1`              | Icon and label in one centered row         | Horizontal       |
| `N x 1`, where `N > 1`              | Centered icon only                         | Vertical         |
| `1 x 1`                             | Centered icon only                         | None             |
| Other multi-row/multi-column shapes | Icon at top-left and label at bottom-right | None             |

Identifier sizing is based on one shared calibrated grid-cell reference. This
keeps icons, circles, and text at a consistent apparent size across differently
sized Buttons after QuickStar applies each PNG. Position controls use safe
bounds, so long identifiers remain inside the visible rounded Button area.

## Preview and export behavior

- All selected Buttons share one source image and one pan/zoom transform, so
  adjacent Buttons reveal continuous portions of the same composition.
- Preview and export project the same source-coordinate rectangles, image
  transform, opacity, identifier visibility, identifier intensity, and
  identifier positions.
- Every Button export is an original-quality `1024 x 1024` PNG.
- Non-square Buttons are represented by a centered square export area, leaving
  QuickStar to apply the final Button-shaped clip.
- Filenames use selected order plus canonical labels, for example
  `01-wi-fi.png`; repeated labels receive a numeric suffix.
- Exports are produced in the same order shown on the Result screen.
- Result cards display the real localized/custom Button label rather than a
  raw dynamic panel ID.
- Export is all-or-nothing: the app does not navigate to Result or save a
  partial set when a capture fails.

## Performance improvements introduced in v3

- Advanced panel movement and resizing now run continuously on the UI thread
  and commit the final rectangle to React/Zustand once per gesture. Advanced
  Controls benefits from the same shared calibration path.
- Large Customize images use a temporary preview-only proxy capped at a
  1080-pixel long edge, while exports continue to use the normalized original.
- Pan and pinch update transforms instead of changing image layout properties
  every frame.
- Repeated images use memory-and-disk caching.
- Export mounts, prepares, captures, and releases one `1024 x 1024` panel at a
  time instead of mounting every selected Button export surface together.
- Device QA reported smooth calibration and customization after these changes.
  No numeric frame-rate, memory, or duration improvement should be claimed
  because a controlled before/after release benchmark was not captured.

## Update and persistence behavior

### Required one-time recalibration

Users updating from the released v1.0.0/v2 app must recalibrate before their
next export. v2 calibration coordinates are intentionally not migrated because
the old bordered coordinate surfaces could save a rectangle that did not match
the visible green selection, and the original viewport information needed to
correct those coordinates was not stored.

The current app stores accurate Default, Advanced Controls, and Advanced
Buttons calibrations together under the stable `quick-panel.calibrations` key.

On first launch after the v3 update, the app shows a one-time release
announcement explaining the new workflow and recalibration requirement. Its
acknowledgement is stored separately from calibration and preferences. The
panel uses concise bullet points and a single acknowledgement button; the
recalibration requirement is presented as a reminder rather than an automatic
redirect.

### Data that remains preserved

The recalibration boundary does not clear unrelated preferences. Existing
language and seen-help state remain intact, as does the last successfully
exported main mode. v3 adds independent persistence for the last Advanced
target, each target's snapping-grid choice, custom Button icons, and Buttons
Customize settings.

After users create the new calibrations and settings, they are expected to
survive normal future app updates.

## Final v3 boundaries

- Default is still Controls-only.
- Advanced can export either Controls-only or Buttons-only in one run.
- Mixed Controls + Buttons export is deferred beyond v3.
- Button selection remains manual and screenshot-based.
- The four supported Controls panels and their Good Lock order are unchanged.
- Images are still selected, adjusted, and rendered on-device; users apply the
  exported PNGs in Good Lock QuickStar manually.
