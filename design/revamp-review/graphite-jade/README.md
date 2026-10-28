# QPBC dark UI exploration

First visual draft, 2026-10-03. Reviewed against `docs/screen-inventory.md`,
`docs/product-behavior.md`, current styling and the existing flow screenshots.
The inventory matches app.json version 1.7.4.

Created with the Pen.dev connector and the requested design-taste-frontend skill.
This is a native Android concept; the skill's typography, color and redesign
guidance informed the draft rather than its web implementation patterns.

## Review artifacts

| Artifact | Inventory coverage | Editable canvas node |
| --- | --- | --- |
| `home.png` | S01 Home | EeI0F |
| `mode-selection.png` | S02, Advanced selected | RTExV |
| `advanced-targets.png` | S03, Controls + Buttons selected | dvedl |
| `customize-combined.png` | C02, C04, C06; Image and Horizontal tab entries | Ebb5z |
| `review-board.png` | Four-screen comparison | PKMGx |

Editable designs are in the connected Pen.dev document:
`C:/Users/Meh Chow/.pencil/documents/3a4c797f-62d3-46d2-a08a-dd33d6fadb46/pencil-new.pen`.
The original jade review board (PKMGx) preserves the first-pass screen copies.
The original editable screen nodes have since been revised to Charcoal + Amber
following user feedback. See `../charcoal-amber/README.md` for the current draft.
The PNGs in this directory remain the first-pass exports.

## Proposed direction

Graphite (#111416), quiet raised surfaces (#1B2023), off-white text (#F1F4F3),
soft jade actions (#B2DDD0), and Geist typography. These are exploratory choices,
not an approved design system. The image carries the color; app chrome stays calm.

Design variance 5, motion intensity 1 (static canvas), visual density 4.
All screens use a 412 x 915 reference with 24-pixel side padding. Primary actions
remain at the bottom. Mode and target selections have explicit selection marks.
Full text labels distinguish Both / Icon / None and Image / Horizontal / Vertical.
Help remains reachable from mode, target and image adjustment screens.

Home and mode choices use existing product imagery. Customize illustrates
four Controls and two Buttons, using one shared image coordinate map for its
region fills. This canvas example is not a calibration or export implementation.

## Behavior carried into later designs

- Default and the three Advanced targets retain their independent calibration.
- Saved calibration skips directly to background selection; Recalibrate remains.
- Every Advanced target still requires its grid and guided calibration steps.
- Combined requires at least one Control and one Button.
- Image tab retains image intensity; Horizontal/Vertical retain geometry-dependent
  identifier positioning. Current vertical position is illustrated at 95%.
- Both / Icon / None retain their existing meaning. None disables identifier
  appearance and positioning. Appearance still opens its transactional editor.
- App chrome being dark does not change the identifier editor's Light / Dark
  neutral background setting or the user's glyph color.
- Export PNGs, image replacement, reset, pan/pinch and placement help remain.
- The complete revamp must preserve persistence, working-source coordinates,
  export ordering, square PNG output and all existing failure behavior.

## Verification and next pass

Pen.dev layout inspection found zero clipped nodes across all four screens and
the review board. Screenshots were visually inspected. Body, selected tabs and
action text contrast ranges from 7.30:1 to 10.28:1; the slider track is 3.85:1.
PNG review exports are at 2x scale. These are static drafts, not device QA.

Refine the theme and initial screens first, then define the design system and
continue the remaining inventory. Calibration, background import, Result,
overlays, busy/error/disabled states, short-screen/Fold layouts, and localized
copy remain for those passes. English concept copy is provisional; implementation
must synchronize English, Traditional Chinese and Spanish.

Application source and runtime behavior have not changed.
