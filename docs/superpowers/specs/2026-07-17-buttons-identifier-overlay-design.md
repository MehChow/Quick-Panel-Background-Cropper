# Buttons Identifier Overlay Design

**Date:** 2026-07-17
**Status:** Approved for implementation planning

## Purpose

Good Lock applies Buttons background PNGs above the system icon, label, and
secondary information. The result can look clean, but users may no longer know
which customized Button performs which action.

Add an optional identifier overlay to Buttons-only previews and exports. The
overlay uses a fixed white icon and, when space permits, the Button label. It
must preserve most of the selected artwork and remain useful across square,
vertical, and horizontal Button shapes.

## Scope

This change applies only to the Advanced `Buttons only` branch.

It includes:

- stable Lucide icon mappings for every built-in Button label;
- required icon selection when adding a custom Button label;
- responsive icon and label layouts based on the calibrated grid span;
- matching live-preview and exported-PNG overlays;
- a screen-local overlay toggle and opacity slider; and
- focused automated coverage plus real-device Good Lock verification.

It does not change Default mode, Advanced Controls, Button image placement,
Button image intensity behavior, export order, or filenames.

## Non-goals

- Recreating Samsung's original iconography exactly.
- Displaying dynamic system information such as a connected Wi-Fi name.
- Persisting the overlay toggle or opacity between Customize screen visits.
- Supporting per-Button overlay visibility, opacity, color, or placement.
- Migrating unreleased Buttons calibration data that lacks custom icon choices.
- Adding another icon library.

## Button label and icon model

Each built-in Button catalog entry receives a stable Lucide icon name. The
mapping is keyed by the catalog's stable ID, not localized display text.

Use the closest meaningful icon available. When no suitable Lucide icon exists,
choose an arbitrary icon once and keep that mapping deterministic. The
implementation must record every arbitrary mapping in `docs/notes.md` and list
the same mappings in its completion summary so they can be reviewed later.

Custom Buttons store both their user-entered label and a required custom icon
ID. Adding a custom label opens a compact dialog containing four choices:

- Star
- Zap
- Home
- App Window

Selecting an icon confirms and adds the custom Button. The selected custom icon
is part of the saved Buttons calibration. Built-in icons remain derived from
the catalog and do not need to be duplicated in calibration storage.

The dialog supports cancel without changing the selection. Each icon choice
has an accessible name instead of relying on the glyph alone.

Because Buttons-only has not been released, the new custom-icon field does not
need a legacy fallback or migration path.

## Customize controls

The Buttons-only Customize screen adds two controls beside Button image
intensity:

1. `Show Button identifiers` toggle
2. `Button identifier intensity` slider

The toggle defaults to enabled whenever Customize opens. The slider ranges from
`0` to `100` and defaults to `70%`. Neither value is persisted because the best
choice can vary with each selected background image.

The toggle affects the live preview and exported Button PNGs together. Turning
it off hides the overlay but preserves the current slider value for the rest of
that screen visit. The slider remains visible but disabled while the toggle is
off.

Identifier color is always white (`#FFFFFF`). The slider controls the shared
opacity of both icon and text. Identifier opacity is independent of Button
image intensity; changing either control must not modify the other.

## Responsive layout rules

Classify each Button from its calibrated grid span. Derive the nearest whole
column and row spans from the Button rectangle, outer rectangle, and saved snap
grid, clamped to at least one cell.

| Shape | Content | Alignment |
| --- | --- | --- |
| Exactly `1x1` | Icon only | Center horizontally and vertically |
| Vertical, where row span exceeds column span | Icon only | Top-center with a responsive inset |
| All other shapes | Icon plus localized label | Left-center with a responsive inset |

This means a roomy square such as `2x2` uses icon plus text, while a `1x1`
square stays icon-only.

Labels must stay on one line. They shrink down to a defined minimum scale to
fit the available safe width, then truncate with an ellipsis only when the
minimum still cannot fit. Labels never wrap.

The icon and text use translucent white with a subtle dark shadow for contrast.
Do not add a capsule, panel, or opaque backing behind the identifier.

## Preview and export sizing

Preview and export share the same content, classification, alignment, and
visual proportions. They must not share fixed absolute icon, font, gap, or
inset sizes.

The live preview calculates sizes from the Button's rendered on-screen width
and height after `layoutScale` is applied. Preview-specific minimum and maximum
clamps keep small on-screen panels legible without overwhelming the artwork.

Every exported PNG remains a 1024 px square. Export sizing and placement must
use the Button's visible sub-rectangle inside that square, not the whole square.
This prevents vertical and horizontal exports from sizing or positioning an
identifier against image regions that Good Lock will not display.

A pure layout helper should accept the Button geometry, calibrated grid, target
render bounds, and render target (`preview` or `export`) and return:

- layout variant;
- visible overlay bounds;
- alignment and inset;
- icon size;
- font size and minimum font scale;
- icon-to-label gap; and
- maximum label width.

The preview and off-screen export surfaces then render one shared identifier
component with the calculated values.

## Rendering and export readiness

The identifier renders above the background image and below any preview-only
calibration or interaction overlay. Controls panels never render it.

The off-screen export must include the icon and label before view capture. Use
the already-installed `@react-native-vector-icons/lucide` package and include
icon readiness in the export readiness contract if the font is not guaranteed
to be ready when the image load callback fires.

Missing catalog mappings are implementation errors, not runtime randomization.
Automated coverage must require a mapping for every built-in catalog entry.

## Component boundaries

- The Button catalog owns built-in label-to-icon mappings.
- Buttons calibration owns the selected custom icon ID.
- A pure layout module owns span classification and target-specific sizing.
- A small shared identifier component owns icon and text rendering.
- Customize owns the screen-local toggle and `70%` opacity state.
- Preview and export surfaces receive the resolved visibility and opacity as
  explicit props.

Do not fold catalog mapping, grid classification, and rendering into one large
component. Existing Controls rendering should remain unchanged.

## Testing

Add focused coverage for:

- every built-in Button catalog entry having a stable icon mapping;
- the documented four custom icon choices;
- the custom-label dialog requiring an icon before adding a Button;
- custom-icon dialog cancel and accessibility behavior;
- saving and restoring the selected custom icon with Buttons calibration;
- `1x1`, vertical, horizontal, and roomy-square layout classification;
- center-center, top-center, and left-center alignment respectively;
- preview and export producing different absolute sizes from their own bounds;
- export calculations using the visible panel sub-rectangle;
- one-line label shrinking and truncation;
- the toggle affecting preview and export together;
- the slider defaulting to `70%` and changing icon and text opacity together;
- fixed white identifier color;
- toggle and opacity remaining independent from Button image intensity; and
- Controls previews and exports remaining unchanged.

Real-device QA should apply representative `1x1`, vertical, horizontal, and
`2x2` exports through Good Lock. Verify placement, legibility, artwork
visibility, slider fidelity, and the clean-artwork result with identifiers off.

## Acceptance criteria

- Users can identify common customized Buttons without relying on Samsung's
  hidden system content.
- Users can disable identifiers for a clean artwork-only export.
- Users can tune white icon and text opacity from `0` to `100%`, starting at
  `70%` on every Customize visit.
- Custom Buttons always receive one of four selected icons.
- `1x1`, vertical, and roomy shapes follow the approved content and alignment
  rules in both preview and export.
- Preview and export use independently calculated absolute sizes while staying
  visually proportional.
- All built-in mappings are stable, and arbitrary mappings are explicitly
  recorded in `docs/notes.md` and reported in the implementation completion
  summary.
- No Controls behavior or persisted released-app data is reset.
