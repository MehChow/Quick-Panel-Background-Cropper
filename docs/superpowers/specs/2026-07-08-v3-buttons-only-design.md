# v3 Buttons-Only Design

## Goal

Add an Advanced Buttons-only target so users can export one selected background image across one or more manually selected Quick Panel Buttons panels.

## Scope

v3 adds Buttons-only support after the user chooses Advanced. Default remains Controls-only. Existing Advanced Controls-only behavior remains intact except for the new target choice before calibration.

Non-goals:

- No mixed Controls + Buttons flow.
- No automatic device tile enumeration.
- No private Samsung APIs.
- No fixed Button geometry presets.
- No new dependencies.

## Product Flow

1. Landing.
2. Select mode.
3. If Default, continue existing Default Controls-only calibration.
4. If Advanced, choose target:
   - Controls only.
   - Buttons only.
5. Buttons-only calibration:
   - Import a fully expanded Quick Panel screenshot.
   - Draw one green outer area around the Buttons region.
   - Add one or more Buttons from a searchable label list or custom label.
   - Set row/column grid.
   - Adjust blue boxes for each selected Button.
   - Review all Button boxes.
   - Save calibration.
6. Choose background image.
7. Pan/zoom image against the Button preview.
8. Export selected Button PNGs in the user-reviewed order.

## Button Labels

Buttons selection uses an ordered editable list. Users can add built-in labels, add custom labels, remove Buttons, and move Buttons up or down. Export order follows this list.

The built-in label catalog should contain around 50 labels. A pinned subset appears first for fast selection:

- Wi-Fi
- Bluetooth
- Auto rotate
- Flashlight
- Sound
- Airplane mode
- Location
- Mobile data
- Hotspot
- Power saving
- Smart View
- Nearby devices

The rest of the catalog is searchable by case-insensitive substring. Custom labels cover app-specific or device-specific Buttons such as USB debugging or TaoBao.

## Data Model

Use target-aware Advanced state instead of overloading the existing Controls calibration.

- `AdvancedTarget`: `"controls" | "buttons"`.
- Controls panel IDs stay fixed: `buttonBox`, `brightness`, `volume`, `mediaPlayer`.
- Buttons use generated stable IDs, for example `button-1`, `button-2`, and keep the user-facing label separately.
- Panel definitions gain a family or kind so preview/export can distinguish Controls from Buttons.
- Saved calibrations move to a v3 payload:
  - `default`
  - `advancedControls`
  - `advancedButtons`

Existing v2 saved `advanced` data migrates into `advancedControls`. Buttons-only starts empty until calibrated.

## Calibration Behavior

Buttons-only reuses the existing Advanced calibration mechanics:

- Outer rectangle selection.
- Grid row/column controls.
- Snap grid overlay.
- Move/resize responders.
- Overlap validation.
- Confirm/review screen.
- Leave guard after the outer phase.

The differences are limited to selection, labels, panel order, and visual color. Buttons panel boxes use blue. Green remains the outer area. Controls panel boxes keep their existing Controls color behavior.

## Preview And Export

The preview and export pipeline should stay preset-driven:

- `QuickPanelPreset.visualOrder` controls preview order.
- `QuickPanelPreset.goodLockOrder` controls export order.
- Dynamic refs are created from `preset.goodLockOrder` instead of hard-coded Controls refs.
- Buttons exports use square crops from each Button box, like Controls.

Buttons filenames use the reviewed order plus slugged labels:

- `01-wifi.png`
- `02-bluetooth.png`
- `03-custom-label.png`
- Repeated labels get a numeric suffix before `.png`.

Buttons need a readability treatment because Good Lock applies Buttons images more solidly than Controls images. Start with a simple dark overlay on Button preview/export surfaces. Add blur, desaturation, masks, or alpha experiments only after real Samsung testing shows the fixed overlay is insufficient.

## UI Direction

Follow the existing dark phone-first workbench style from `docs/styling.md`.

- Use existing `QuickPanelScreenShell`, `SubPageHeader`, AniUI `Button`, and existing card/list patterns.
- Keep Advanced target choice as a small focused step after selecting Advanced, not as a third top-level mode card.
- Use a search input and selectable rows for label search.
- Use compact reorder controls on selected Buttons.
- Keep footer actions stable.

## Testing

Keep tests narrow and high value:

- Storage migration from v2 to v3.
- Advanced target transitions.
- Buttons label search and filename generation.
- Dynamic export refs/readiness with arbitrary Button IDs.
- Buttons calibration validation for at least one Button and non-overlap.

Gesture feel, Samsung/Good Lock behavior, visual polish, and readability tuning remain manual testing concerns.
