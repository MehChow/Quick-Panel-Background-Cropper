# Architecture and compatibility

## Code map

- `src/app`: Expo Router entry points and shared providers.
- `src/features/quick-panel/model`: panel definitions, geometry, icons and identifier metrics.
- `calibration/default`, `calibration/advanced`, `calibration/advanced/combined`:
  controllers and views for independent calibration branches.
- `store`: Zustand transitions, atomic panel actions, defaults and MMKV parsing.
- `shared`: image import lifecycle, screen structure and contextual help.
- `customize`: shared composition, appearance editing and sequential export.
- `cache`: URI ownership, cleanup and cold-start recovery.
- `release`: current startup announcement descriptor and acknowledgement host.
- `src/components/ani-ui`: currently used UI primitives.

Paths above are relative to `src/features/quick-panel` unless stated otherwise.
Keep domain logic separable from screen styling during the UI revamp.

## Geometry and gestures

Persist panel rectangles in full screenshot coordinates, even when Advanced
editing displays a viewport cropped to the outer rectangle. Convert between
local display and stored coordinates at the canvas boundary. Borders and
decorative insets must not change the stored coordinate surface.

Default scales the preset panels from the preset union into the calibrated
outer rectangle. Advanced starts from preset-derived or restored geometry.
Disabled Controls retain their rectangles; validation and export consider only
enabled panels. Preserve the small inside-edge tolerance in panel constraints.

Advanced move/resize uses a Reanimated draft rectangle on the UI thread. Do
not send each movement through React or Zustand. Commit the final valid
rectangle on completion/cancellation using panel-scoped atomic store actions.
The panel/token commit gate rejects stale callbacks and guards phase advance.

Use the same worklet-compatible snap helpers for move and resize. Internal
grid candidates are directional: bottom/right edges use the before side and
top/left edges the after side. Snap capture/release thresholds are normalized
in screen points. Low / Balanced / Strong multipliers are 0.5 / 1 / 1.5.
Single-row/column grids remain valid; do not coerce their counts to two.

## Image composition and export readiness

`prepare-picked-image.ts` produces the authoritative working image for every
import path. Keep the 2048-edge bounded decode, orientation handling, native
reference release, transparency handling and thin-strip decode guard. Import
controllers reject duplicate/stale completion and retain old data on cancel or
failure. Never restore the retired 6144-edge/20MP rejection.

Preview and export share panel rectangles, working-source dimensions,
`{ x, y, scale }`, panel intensity, identifier content/appearance and normalized
positions. A preview proxy changes the URI only, not logical dimensions.
Wait for proxy preparation before showing large-image previews; preparation
failure can fall back to the working image. Never create per-panel transforms
or an export-only crop model.

For each panel, the square export source has side `max(width, height)` and is
centered on that panel. Panel-local rendering subtracts the panel origin from
the shared transform. Identifier metrics use the shared calibrated grid-cell
reference and fit within visible Button bounds. Horizontal content measurements
must match the current content mode before the overlay/capture becomes ready.

`useSequentialExport` and `ExportSurfaceHost` mount one surface at a time.
Wait for image load and any required identifier measurement; use run/panel
tokens to reject stale callbacks. Capture every panel before media saving.
On failure, clean run-owned captures and do not navigate to a partial Result.
Media writes themselves are sequential and are not a rollback transaction.

Keep interactive image motion transform-only. Static focused/overall appearance
previews do not need per-panel image animation subscriptions. Keep image and
identifier component boundaries separate so appearance changes can reuse image
rendering. Repeated image surfaces currently use memory-disk caching.

## Appearance editing

One modal owns the appearance draft. Focused and full-layout image previews
are mutually exclusive. Keep the picker mounted but hidden from display, touch
and accessibility during full preview so HSV/alpha, zero-brightness hue and tab
state survive. Dismiss the keyboard on full-preview entry. Android Back closes
that preview before cancelling the dialog.

Picker dragging uses shared values; it must not persist or update React every
frame. Disable modal scrolling during picker/slider touches and restore it on
completion/cancellation. Underlying interactive Customize preview is suspended
while appearance editing is open and remounts from the same controlled transform.
Adjustment sliders suppress duplicate stepped values and persist on gesture
finalization; toggles and confirmed appearance changes persist immediately.

## Persistence contract

MMKV instance ID is `quick-panel`. Keep existing keys and parsers stable:

| Key suffix (prefix `quick-panel.`) | Purpose |
| --- | --- |
| `calibrations` | Independent default, advancedControls, advancedButtons, advancedCombined branches |
| `button-customize-settings` | Shared identifier appearance/position/content plus Buttons-only image intensity |
| `combined-button-image-intensity` | Independent Combined image intensity |
| `snap-sensitivity` | Global interaction preference, not calibration geometry |
| `last-exported-mode`, `last-exported-advanced-target` | Successful-export preselection |
| `seen-help` | Help acknowledgement |
| `acknowledged-release-announcement` | Stable announcement acknowledgement |
| `last-image-disk-cache-clear-at` | Last successful periodic disk-cache clear |

Preserve these compatibility behaviors:

- Retired calibration keys (`calibration-rect`, `calibrations-v2`,
  `calibrations-v3`) remain ignored. Their coordinate surface was inaccurate;
  do not resurrect them or trigger another reset of current calibration.
- Missing enabled-Control lists default to all Controls. Invalid Combined
  data does not discard valid sibling calibration branches.
- Legacy `showButtonIdentifiers` migrates to Both/None without clearing other
  settings. Retired optional-grid fields are ignored and omitted on save.
- Saved custom icons remain valid, including `shield`, now accepted through
  the built-in icon set. Do not narrow validation to only the current generic list.
- Snap strength stays separate from persisted geometry. Imported screenshots,
  working images and preview proxies are temporary, not saved layouts.

The historical calibration reset is not permission for future resets. Preserve
local data across updates; warn the user before any newly required reset.
Keep compatibility tests even when they mention old releases.

## Ownership and verification

See [cache ownership](cache-optimization.md) for lifecycle rules. Never delete
unowned files or the whole cache root. Keep legacy export-file recognition for
upgrade cleanup. Result owns successful captures until unmount; gallery copies
are independent.

See [testing](testing.md) and [manual acceptance](production-manual-test-checklist.md).
Automated structure does not prove native gesture smoothness or QuickStar output.
Do not turn past device anecdotes into current performance claims; compare
the same device, build, image and panel count when measuring a future change.
