# Remaining QPBC screen designs — handoff

Historical handoff context. The later user-authorized [canvas cleanup](../remaining-screens/canvas-organization/README.md) supersedes instructions below to preserve historical review boards. Current screens are grouped; old and duplicate canvas boards were removed while PNG archives were retained.

The user approved the dark Charcoal + Amber theme and requested the remaining
screen designs in a new session with **GPT-6.1 Sol, medium reasoning**. The design
system was completed first. Continue the Pen.dev design work autonomously in
the new chat; do not create another session or implement the Expo app.

## Read first

1. Project `AGENTS.md` and [screen inventory](../../docs/screen-inventory.md).
2. [Design system](README.md), [tokens](tokens.json), [component manifest](components.json).
3. [Product behavior](../../docs/product-behavior.md), [architecture](../../docs/architecture.md)
   and the current route/component logic when a behavior is uncertain.
4. [Approved revision notes](../revamp-review/identifier-concerns/README.md)
   and [previous Amber pass](../revamp-review/charcoal-amber/README.md).
5. Explicitly use `.agents/skills/design-taste-frontend/SKILL.md`; this is a native
   task-oriented app, so its landing-page-only patterns are not a product mandate.
   The Expo overview/design-system skills are useful context for native composition.

No web browser for this Expo project. Read documentation through a documentation
tool or HTTP client. Exact SDK 57 docs must be read before any later code work.
Use the current app.json release metadata (inventory currently records 1.7.4).
Do not use subagents unless needed and explicitly permitted; project instructions
limit any subagent to GPT-6 Luna High or below. The requested GPT-6.1 Sol setting
is for this user-owned chat.

## Canvas and approved references

Document:
`/c:/Users/Meh Chow/.pencil/documents/3a4c797f-62d3-46d2-a08a-dd33d6fadb46/pencil-new.pen`.
Use Pen.dev MCP `get_app_state`, `read_skill` and `execute`. Never read or modify
the encrypted `.pen` via filesystem tools. Follow the schema and execute docs;
patch a failed snippet via `editId`/`edits`. Use FindEmptySpace for new roots.

| Editable reference | Node | Approval |
| --- | --- | --- |
| Home | EeI0F | Headline + applied preview + Start only; no QPBC title or explanatory copy |
| Mode selection | RTExV | Full-width text-led choices, no miniature screenshots |
| Advanced targets | dvedl | Same choice hierarchy, all three targets |
| Combined image adjustment | Ebb5z | Continuous preview with Image inspector at bottom |
| Identifier overview | CKKZM | Content inline; Appearance and Position as separate concern rows |
| Focused identifier position | vWVmS | Back to overview, axis selector and active-axis slider |

Foundations dPOoE, components M54RCv, native patterns w69xX, screen anatomy f9G2sU
are above those screens. Reuse the 27 reusable components with refs and semantic
variables; child slot IDs are in components.json. The approved references are
already token-bound and use component instances as examples. Preserve earlier
review boards as historical snapshots; they are not the current editable source.

## Work to produce

Use the inventory IDs in every frame name and in a new coverage matrix. Design
all remaining screens, relevant family variants and states. Repeated adjustment
screens may share a component, but show the different Control geometries and
at least representative first/later Button steps. A reusable primitive alone
does not count as a finished screen or overlay.

| Inventory group | Remaining design coverage |
| --- | --- |
| S01–S03 | Preserve approved roots; complete selected/unselected/disabled/help-related states |
| D01–D02 | Default screenshot import, outer Controls rectangle and import/error states |
| A01–A02 | Import and outer-area adjustment for Controls-only, Buttons-only and Combined |
| A03 | Control selection, enabled/disabled options and no-Control validation |
| A04 | Button search, selected/removable chips, custom label/icon trigger, empty results, no-Button validation and keyboard |
| A05 | Required rows/columns grid step for every Advanced target; 1–8 boundaries |
| A06–A09 | Active Button box, Brightness, Volume and Media player; completed geometry, handles, snapping and help |
| A10 | Individual Button adjustment, first and later selected Button, Button label/icon and progress |
| A11 | Review and confirmation for each Advanced target, bounds/overlap failures |
| C01 | Empty background selection for all four paths, calibrated preview and recalibration |
| C02 | Default and Controls-only image adjustment; Buttons-only variant; preserve approved Combined |
| C03 | Buttons-only/Combined image intensity, replacement/reset/export readiness and busy |
| C04 | Both, Icon and None; None disables Appearance/Position; preserve concern separation |
| C05–C06 | Horizontal/Vertical focused position, geometry-dependent availability and summary |
| R01–R02 | One/many exports, Combined families in Good Lock order, Open Good Lock, busy and Back home |
| O01–O07 | Release announcement and all mode/calibration/grid/alignment/review/image-placement tutorial sheets with required family variants |
| O08–O09 | Enlarged tutorial image viewer and calibration-area preview overlay |
| O10–O11 | Custom Button icon picker (Preset/Other/Cancel) and leave-calibration confirmation |
| O12 | Full transactional appearance editor: focused Button, previous/next, color wheel, hex field, Brightness/Intensity, neutral Light/Dark, overall preview, Confirm/Cancel |
| O13 | Overall appearance preview returning to the same editor draft and tab |
| O14 | Good Lock unavailable, Samsung store action and store-opening busy |
| Transient/system | Splash reference, import/preparation/preview/export busy, permission/save errors, keyboard, picker cancellation, external-app handoff and disabled/reset-unavailable states |

Android photo picker, permission prompts, Good Lock and Samsung store are
system/external surfaces. Annotate their entry, cancellation and error handoff;
do not invent QPBC-controlled replacements. The hidden capture surface is
infrastructure and is not a new user screen. No Settings, saved-layout library
or deferred My Icons feature belongs in this task.

## Preserve behavior while redesigning

- Default and three independent Advanced targets remain available. Combined
  requires at least one Control and one Button. Saved calibration may bypass
  calibration; retain recalibration and last successfully exported choices.
- Advanced grids are required for all targets. Keep bounds/overlap validation,
  snapping, haptics and atomic gesture commit before advancing.
- Guided order: Button box → Brightness → Volume → Media player (skip disabled),
  then selected Buttons in their selection order; review before save.
- Default has only outer-area calibration; do not add individual selection/grid.
- Customize retains pan/pinch, replacement and reset. Default/Controls-only does
  not acquire Button controls. Buttons-only and Combined keep independent saved
  image intensity where the existing model requires it.
- Identifier Content, Appearance and Position have separate view concerns without
  duplicated setting ownership. None disables Appearance and Position. Axis
  availability follows geometry. Position is an inspector state, not a route.
- Appearance Confirm saves; Cancel/backdrop/Android Back discards draft changes.
  Back from overall preview first returns to the editor. Neutral Light/Dark is
  a preview background choice within the approved dark app theme.
- Preview/export share one working-image coordinate system and transform. Exports
  remain 1024-square PNGs from the working source, centered square source areas,
  Good Lock order, sequential image/identifier readiness and capture cleanup.
- Preserve local data/storage keys/parsers, URI cache ownership and prior image
  after failed or cancelled import. Do not introduce a reset flow.
- English, Traditional Chinese and Spanish must remain synchronized in later
  implementation. Design copy is provisional: check long Spanish labels and
  Chinese glyph fallback without shrinking type. No language switcher is added.

## Deliverables and completion checks

Create a new `design/remaining-screens/` artifact folder with PNG exports,
inventory-to-canvas coverage matrix, design notes and short flow review boards.
Group boards by Default, each Advanced target, Customize, Result and overlays.
Keep meaningful labels and current sources; real screenshot/tutorial/example
assets are preferable to simulated calibration content.

Check resolved bounds and enabled-node clipping for all new roots and refs.
Inspect screenshots after each coherent group, fix warnings, then export final
PNG references at 2×. Cover 412×915, one short-phone layout, one Fold-width layout
and keyboard cases. Include accessibility state/labels, minimum 44 touch targets,
selection cues, localization notes and reduced-motion behavior in annotations.

Finish the coverage matrix with every inventory row mapped to node IDs and
variants, and explain any system-owned annotation. Report design verification
as static canvas review, not device QA. Do not run production builds or alter
runtime source for this design-only request. Do not stop after just a few of the
remaining screens or ask for theme approval again; the theme is approved.
