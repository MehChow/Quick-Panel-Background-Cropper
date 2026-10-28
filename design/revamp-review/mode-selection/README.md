# Mode selection redesign

2026-10-04. Editable source: [qpbc-ui-revamp.pen](../../qpbc-ui-revamp.pen).

The open Pencil canvas contains this revision. The editor still has unsaved
changes: automatic desktop saving failed with `failed to activate captured window`.
Press Ctrl+S in the open `.pen` tab to persist the revision. All PNG exports below
are already written to the workspace.

Reviewed `docs/screen-inventory.md`, product behavior, current selection components,
existing mode images and the approved Charcoal + Amber design system. This is a
design-only revision of S02, S03 and O02. App code and storage are unchanged.

## Design audit and direction

The previous Pen screens explained both modes through text-only cards. Selection
was explicit, but users had to infer the panel layouts. Preserve the two-step
information architecture, Confirm, help, navigation, four independent calibration
paths and the existing Advanced preview carousel.

Use the requested design-taste-frontend skill's audit, typography, spacing,
contrast and copy guidance. Its native-mobile exclusion means web landing-page
patterns and implementation rules do not apply here. Direction: focused Android
utility, charcoal surfaces, restrained amber, Geist with Noto Sans TC fallback.
Design variance 4, motion intensity 2, visual density 4. Existing tokens and
shared primary/icon buttons are retained; reusable components for other screens
were not restyled.

Mode choices pair real Quick Panel images with concise setup descriptions.
Advanced targets use larger family icons, readable supporting text and an
explicit radio state. Unselected content stays readable. Confirm remains fixed
above the gesture safe area. No new settings, routes or export targets are added.

## Review exports

| State | Canvas ID / export |
| --- | --- |
| Mode, empty | [fEviX](fEviX.png) |
| Mode, Default | [ZKfZY](ZKfZY.png) |
| Mode, Advanced | [RTExV](RTExV.png) |
| Target, empty | [DSh2f](DSh2f.png) |
| Controls only | [JWUPs](JWUPs.png) |
| Buttons only | [ip8Wv](ip8Wv.png) |
| Controls + Buttons | [dvedl](dvedl.png) |
| Mode help | [mnMTY](mnMTY.png) |
| Help from targets | [SW2D7](SW2D7.png) |
| Traditional Chinese mode | [mbG1O](mbG1O.png) |
| Traditional Chinese targets | [dm1sC](dm1sC.png) |
| Spanish mode | [jst93](jst93.png) |
| Spanish targets | [Bdm38](Bdm38.png) |
| Traditional Chinese help | [cKqlV](cKqlV.png) |
| Spanish help | [Twmoc](Twmoc.png) |
| Mode, 360x740 | [MSJJW](MSJJW.png) |
| Targets, 360x740 | [nig5Q](nig5Q.png) |
| Four Advanced preview examples | [H6VBR](H6VBR.png) |

Main states remain in the Entry section. Locale examples remain in Responsive;
localized help sits in the last Tutorials row. Existing screen IDs are preserved.
The carousel reference is a handoff annotation, not an additional app screen.

## Interaction handoff

- The entire choice is a radio target. Selection changes the border and check,
  and is announced to TalkBack. Header actions are 44 units; Confirm is 54 high.
- With no choice, Confirm is disabled. Preselect the last successfully exported
  mode and Advanced target as the current app does.
- Default Confirm uses Default calibration or opens its calibration flow.
  Advanced Confirm replaces the mode cards with S03 in the same route.
- S03 Confirm uses only that target's saved calibration, otherwise opening its
  calibration flow. Combined still requires at least one of each family.
- All Advanced grids, adjustment order, validation and gesture commits remain
  mandatory. Default still calibrates one outer Controls rectangle.
- Keep the four existing `assets/mode/advanced_1.webp` through `advanced_4.webp`
  images, manual swipe paging and page indicators. Enable swiping only after
  selecting Advanced. Distinguish a swipe from a tap; neither confirms a mode.
  Unselected cards say to select Advanced before comparing layouts.
- Help explains Default, Advanced, required grids and separate calibration.
  Close, backdrop, swipe down and Android Back return to the selected state.
  Preserve current main-screen back-navigation behavior.
- On short phones, shrink preview imagery and spacing, not essential type.
  The target heading uses the compact label "Advanced target". The body must
  scroll for larger system text; the footer stays reachable. On Fold widths,
  keep a centered single column using the existing 520-unit maximum.
- Press feedback uses the existing 120ms opacity transition; reduced motion
  uses 0ms. Do not autoplay the example carousel.
- The Pen screens contain matched English, Traditional Chinese and Spanish
  copy for both selection stages and help. Use these as coordinated copy drafts
  when implementing; device locale selection remains unchanged.

## Verification

Visually inspected empty and selected modes, targets, both short-phone screens,
all locale pairs, all localized help and the four-example reference. Final
resolved-instance bounds were checked for all 18 outputs and their board
wrappers. No clipping, collapsed layouts or unfinished placeholders remain.

Measured contrast for active UI: primary button 8.46:1, body on surface 9.55:1,
muted guidance on background 8.51:1, selected title 13.50:1 and selection caption
11.10:1. Visible copy contains no em/en dash separators. Exported at 2x.

These are static design checks. Native behavior, dynamic text, TalkBack, device
safe areas and swipe gestures need acceptance testing when implemented. No app
test suite was run for this design-only change.
