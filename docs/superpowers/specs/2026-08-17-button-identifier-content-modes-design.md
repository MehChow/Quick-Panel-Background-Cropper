# Button Identifier Content Modes Design

**Date:** 2026-08-17
**Status:** Approved for implementation planning

## Goal

Replace the existing `Show labels` boolean switch with a single-select
`Both / Icon / None` control shared by Advanced Buttons-only and Combined
modes.

## Content modes

| Mode | Icon | Text |
| --- | --- | --- |
| `both` | Visible | Visible where the existing layout supports text |
| `icon` | Visible | Hidden |
| `none` | Hidden | Hidden |

Current shape rules remain unchanged:

- Horizontal Buttons show an icon and optional text that move together.
- Vertical Buttons show an icon only and retain vertical adjustment.
- `1x1` Buttons show a centered icon only.
- Corner/roomy Buttons show an icon at the top-left and optional text at the
  bottom-right.

`Both` and `Icon` therefore look identical on vertical and `1x1` Buttons.
Text-only output is out of scope because it would require new placement and
fitting rules for shapes that currently never render text.

## Scope

This feature applies to Button panels in:

- Advanced Buttons-only Customize; and
- Advanced Controls + Buttons Customize.

It includes:

- a persisted three-state identifier content mode;
- backward-compatible migration from the existing visibility boolean;
- a controlled AniUI Toggle Group;
- mode-aware identifier rendering in every preview and export surface;
- horizontal content remeasurement when the mode changes; and
- focused automated coverage for state, UI, layout, and export readiness.

It does not change:

- image composition or transforms;
- Button image intensity;
- identifier intensity, color, or background theme;
- calibration;
- export dimensions, filenames, order, or all-or-nothing behavior;
- Default mode or Advanced Controls-only mode; or
- the existing horizontal and vertical position values.

## Customize UI

Replace the Switch in `ButtonCustomizeControls` with the installed controlled
AniUI Toggle Group.

Visible English copy:

- Heading: `Show labels`
- Options: `Both`, `Icon`, `None`

Visible Traditional Chinese copy:

- Heading: `顯示標籤`
- Options: `全部`, `圖示`, `無`

Accessible option labels must state the full effect instead of relying on the
short visible text:

- `Show icon and text`
- `Show icon only`
- `Hide icon and text`

Add equivalent Traditional Chinese accessibility labels.

The selector is a full-width three-segment row inside the existing label card.
Each item receives equal width and retains the Toggle Group's radio-group
semantics and minimum touch target. Style the feature usage locally; do not
broaden or rewrite the newly installed AniUI component for this feature.

The palette button is:

- enabled for `both` and `icon`; and
- disabled and dimmed for `none`.

Horizontal and vertical position tabs are:

- enabled for `both` and `icon`; and
- disabled for `none`.

Selecting `none` returns the active adjustment tab to Image. Switching directly
between `both` and `icon` does not reset the active tab, the horizontal position,
or the vertical position.

## State and migration

Introduce the following shared type:

```ts
export type ButtonIdentifierContentMode = "both" | "icon" | "none";
```

Replace `showButtonIdentifiers` in current runtime settings with:

```ts
buttonIdentifierContentMode: ButtonIdentifierContentMode;
```

The default is `both`.

Use the following backward-compatible parsing rules:

- a valid `buttonIdentifierContentMode` is preserved;
- legacy `showButtonIdentifiers: true` becomes `both`;
- legacy `showButtonIdentifiers: false` becomes `none`; and
- invalid or missing values become `both`.

New saves contain only `buttonIdentifierContentMode`. The old boolean remains
recognized only by the persistence parser.

The content mode remains in `quick-panel.button-customize-settings`, so
Buttons-only and Combined share it with the other identifier settings. Combined
Button image intensity remains independently stored under
`quick-panel.combined-button-image-intensity`.

## Dynamic horizontal positioning

The existing slider continues storing normalized intent from `0...100`.
Preview and export independently convert that value into a safe pixel offset
using their rendered bounds:

```text
safeStart = inset
safeEnd = panelWidth - inset - measuredContentWidth
left = safeStart + (safeEnd - safeStart) x normalizedPosition
```

Mode changes must invalidate the old horizontal measurement. Include the mode
in the measurement key:

```ts
const measurementKey = [
  bounds.width,
  layout.fontSize,
  layout.iconBackgroundSize,
  label,
  contentMode,
].join(":");
```

This produces the required behavior:

- `Icon` measures a narrower group and can travel farther right.
- Restoring `Both` measures the wider group and moves it left as necessary.
- The normalized slider value does not change between modes.
- The horizontal preview remains hidden until its new width commits, avoiding
  a stale-position flash.
- Export waits for the same committed measurement before capture.

At position `0`, the icon remains at the left inset and restored text extends
to its right. At position `100`, restoring text produces the largest automatic
leftward shift while keeping the complete group inside the right inset.

## Shared rendering

Pass `buttonIdentifierContentMode` identically through:

- the main Customize preview;
- the focused Button appearance preview;
- the overall Button appearance preview; and
- the sequential export surface.

Static and animated identifier visuals use the same content rules:

- render the icon and its circle for `both` and `icon`;
- render text only when the mode is `both` and the existing layout permits it;
  and
- render no identifier overlay for `none`.

Horizontal `icon` output still requires content measurement and export
readiness. `none` requires neither.

Preview and export must continue using the same panel rectangles, original
image dimensions, image transform, Button image intensity, identifier
appearance, and normalized position values. Do not add a mode-specific crop,
transform, or export-only layout.

## Error and failure behavior

Invalid persisted modes fall back to `both`; they do not discard calibration or
other Button settings. A mode change during normal Customize interaction must
not start or interrupt an export. Customize controls remain non-interactive
during the existing export run.

Existing sequential export behavior remains all-or-nothing. A rendering or
capture failure continues to clean completed temporary captures and reports the
existing export error.

## Automated acceptance

Automated coverage must prove:

- new settings round-trip;
- legacy booleans migrate correctly;
- invalid values fall back to `both`;
- Buttons-only and Combined share the content mode;
- Toggle Group selection and accessibility state are correct;
- the palette and position controls are enabled for `both` and `icon` and
  disabled for `none`;
- selecting `none` returns adjustment tabs to Image;
- switching between `both` and `icon` preserves the active position tab and
  both position values;
- horizontal content remeasures on mode changes;
- Icon-only reaches the safe right edge;
- restoring text constrains the wider group automatically;
- corner labels disappear in `icon`;
- vertical and `1x1` behavior remains icon-only;
- the main preview, both appearance previews, and export receive the same mode;
  and
- horizontal export readiness waits for `both` and `icon`, but not `none`.

## User-owned manual QA

Physical Samsung and QuickStar QA remains user-owned. The manual acceptance
scope is:

- confirm the same persisted selection in Buttons-only and Combined;
- confirm Icon-only removes horizontal and corner text;
- move a horizontal Icon-only identifier to `100`, restore `Both`, and confirm
  the wider group moves left without clipping;
- confirm `None` exports artwork without icon or text;
- compare the live preview, exported PNG, and QuickStar result; and
- confirm existing vertical, square, color, intensity, and position behavior
  remains intact.
