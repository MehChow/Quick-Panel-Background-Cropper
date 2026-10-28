# QPBC Charcoal + Amber, revision 2

Revision 2's board and PNGs are retained as review snapshots. Home and identifier
controls have since been refined in `../identifier-concerns/README.md`; use those
notes and exports for the current versions of those screens.

Revised the Pen.dev visual drafts on 2026-10-03 in response to the four requested
changes. Uses the requested design-taste-frontend skill's visual guidance,
adapted to the app's native Android workflow. No application code changed.

## Changes

- Removed the QPBC brand row from Home. The image and Quick Panel headline lead.
- Mode selection uses text-led, full-width choices. Removed tiny screenshots
  and reorganized descriptions and calibration summaries under each choice.
- Customize uses a larger unboxed preview and a bottom inspector. Image and
  Identifiers have separate panels, with both states included for review.
- Replaced jade and green-tinted neutrals with charcoal and muted amber:
  background #141416, surface #202024, accent #E2B77A, text #F0EFEC.

## Artifacts and editable nodes

| PNG | Canvas node | Coverage |
| --- | --- | --- |
| `home.png` | EeI0F | S01 |
| `mode-selection.png` | RTExV | S02 |
| `advanced-targets.png` | dvedl | S03 |
| `customize-image.png` | Ebb5z | C02, C03 |
| `customize-identifiers.png` | CKKZM | C04, C05/C06 entries; C06 active |
| `review-board.png` | H1qisj | Five-screen comparison |

The two Customize artboards represent panel states of the same route.
Image intensity remains Button-specific and is illustrated at 78%.
Identifiers keeps Both / Icon / None, the appearance-editor trigger and
geometry-dependent horizontal/vertical positioning. Vertical is illustrated
at 95%. None still disables appearance and positioning. The existing appearance
editor remains transactional; switching inspector panels adds no save transaction.
Image replacement and reset sit in Image; Export PNGs remains visible in both.
Recalibration and placement help remain in the upper screen navigation.

The preview is smaller with Identifiers open so all controls remain reachable.
Its regions still share one source-coordinate map. This is a visual example,
not a calibration/export implementation. The four customization paths and
their required calibration steps remain unchanged in scope.

Editable Pen.dev document:
`C:/Users/Meh Chow/.pencil/documents/3a4c797f-62d3-46d2-a08a-dd33d6fadb46/pencil-new.pen`.
Top-level screens are named `Taste / ... / Charcoal + Amber`. Revision 2's review
board is below the first board. The original jade board and PNGs remain available
under `../graphite-jade` for comparison. Board copies are review snapshots;
continue editing the individual screen nodes.

## Verification and remaining scope

Visible layout checks found zero clipped nodes across all five drafts and the
review board. Screenshots and the exported board were visually inspected.
Body/action/selected-tab contrast is at least 8.45:1; the slider track is 3.51:1.
PNG exports use 2x scale. This is static design review, not runtime/device QA.

Design variance 5, motion intensity 1, visual density 4. Theme and design-system
choices remain provisional. Other screens, overlays, disabled/error/busy states,
short-screen and Fold layouts, and synchronized English/Traditional Chinese/
Spanish copy remain for later design passes after this direction is refined.
