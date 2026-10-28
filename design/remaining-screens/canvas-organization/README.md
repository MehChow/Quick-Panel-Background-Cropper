# Organized QPBC canvas

Organized 2026-10-03. [Full overview](slnqi.png) · [Foundations and components](XHgIl.png).

The editable current canvas is `slnqi`. Foundations span the top; fourteen tinted groups run down three aligned columns. Each group uses numbered horizontal rows, at most five phone screens per row, with 40-point padding, 24-point screen gaps and 100-point group gaps. Wrapper frames are unclipped; phone frames retain their clipping and screen internals.

| Group | Canvas frame | Current screens | PNG |
| --- | --- | --- | --- |
| 01  Entry · Home and path selection | S07y6 | 8 | [Open group](S07y6.png) |
| 02  Default · Outer-area calibration | ZnuV0 | 2 | [Open group](ZnuV0.png) |
| 03  Advanced · Controls only | D9Fnb9 | 10 | [Open group](D9Fnb9.png) |
| 04  Advanced · Buttons only | L4REt | 8 | [Open group](L4REt.png) |
| 05  Advanced · Controls + Buttons | v9a33 | 13 | [Open group](v9a33.png) |
| 06  Customize · Background and image | mJqDD | 10 | [Open group](mJqDD.png) |
| 07  Customize · Identifier concerns | RuaZk | 13 | [Open group](RuaZk.png) |
| 08  Result · Exports and Good Lock | MbMO0 | 6 | [Open group](MbMO0.png) |
| 09  Tutorials · Sequential help sheets | PmLrW | 22 | [Open group](PmLrW.png) |
| 10  Dialogs · Selection and external handoff | oNVvI | 7 | [Open group](oNVvI.png) |
| 11  Appearance · Draft editing and preview | MT5nZ | 9 | [Open group](MT5nZ.png) |
| 12  Responsive · Short phone, Fold and locales | COFmY | 7 | [Open group](COFmY.png) |
| 13  States · Validation, busy and recovery | dwnE9 | 18 | [Open group](dwnE9.png) |
| 14  System · Ownership and startup | SptaB | 2 | [Open group](SptaB.png) |

All 128 final variants and six approved screens are present, along with the system annotations, four design-system boards, 27 reusable components and 88 variables. The manifest records each screen's immediate parent, row and group.

Removed thirteen canvas boards: three historical passes (`PKMGx`, `H1qisj`, `X7P7L`) and ten duplicate review boards. Their existing PNG snapshots remain on disk. No repository assets were deleted.

Combined import `imUDj` was absent before cleanup. Its existing editable review-copy screen `GxffP` was moved into the Combined group before deleting the duplicate board. The manifest and coverage matrix now use `GxffP`; the original PNG remains archived.

Static verification: 135 screen/annotation nodes present; zero broken component references, enabled-node clipping problems, overlapping group bounds or unfinished placeholders. All groups and the overview were visually inspected. Overview is exported at 0.5× (4000×7179); groups at 1× for readable zoom; individual screen references remain 2×. This is canvas review, not device QA. Production source, dependencies and configuration were unchanged.
