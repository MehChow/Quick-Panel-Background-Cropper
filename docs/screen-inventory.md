# QPBC screen inventory for the UI revamp

Inventory date: 2026-10-03. App version: **1.7.4**, from [app.json](../app.json).

This describes the current interface, based on routes, rendered components,
workflow logic and maintained product documentation. It is a scope checklist
for a future UI revamp, not an approved redesign or a device QA report.
Screen names below are descriptive; localized titles may differ.

## At a glance

There are **six routed screens**. Several contain separate user-facing steps,
so counting routes alone understates the design work. Calibration also repeats
an adjustment step for each enabled Control or selected Button; its total
screen count depends on the user's selections.

| Route | Screen | Main implementation |
| --- | --- | --- |
| `/` | Home / landing | [LandingScreen](../src/features/quick-panel/home/LandingScreen.tsx) |
| `/select-mode` | Mode selection, then Advanced target selection | [SelectModeScreen](../src/features/quick-panel/select-mode/SelectModeScreen.tsx) |
| `/calibration` | Default calibration | [CalibrationScreen](../src/features/quick-panel/calibration/default/CalibrationScreen.tsx) |
| `/advanced-calibration` | Advanced calibration: Controls only, Buttons only, or Controls + Buttons | [AdvancedCalibrationScreen](../src/features/quick-panel/calibration/advanced/AdvancedCalibrationScreen.tsx), [CombinedCalibrationScreen](../src/features/quick-panel/calibration/advanced/combined/CombinedCalibrationScreen.tsx) |
| `/customize` | Background selection and image adjustment | [CustomizeScreen](../src/features/quick-panel/customize/CustomizeScreen.tsx) |
| `/result` | Export success and generated images | [ResultScreen](../src/features/quick-panel/result/ResultScreen.tsx) |

## Main screens and steps

### Shared entry screens

| ID | Screen / state | Content and actions | Visual references |
| --- | --- | --- | --- |
| S01 | Home | App header, example image, Start customizing; build version when enabled. | Default [1](../flow/default/1.webp); Controls [1](../flow/advanced/controls-only/1.webp); Buttons [1](../flow/advanced/buttons-only/1.webp); Combined [1](../flow/advanced/combined/1.webp) |
| S02 | Mode selection | Default and Advanced cards, selection state, Confirm, help and back navigation. Last successfully exported mode is preselected. | Default [2](../flow/default/2.webp); Controls [2](../flow/advanced/controls-only/2.webp); Buttons [2](../flow/advanced/buttons-only/2.webp); Combined [2](../flow/advanced/combined/2.webp) |
| S03 | Advanced target selection | Controls only, Buttons only, Controls + Buttons; target selection and Confirm. This replaces the mode cards within the same route. | Controls [3](../flow/advanced/controls-only/3.webp); Buttons [3](../flow/advanced/buttons-only/3.webp); Combined [3](../flow/advanced/combined/3.webp) |

Confirming a mode/target opens its calibration when needed. A saved calibration
opens background selection directly. All four paths have independent calibration.

### Default calibration

| ID | Screen / state | Content and actions | Visual references |
| --- | --- | --- | --- |
| D01 | Screenshot import | Empty calibration canvas / import guidance and Choose from album. | [3](../flow/default/3.webp) |
| D02 | Outer Controls rectangle adjustment | Imported expanded screenshot, movable/resizable rectangle, Re-import, Confirm and outer-area help. Confirm saves calibration and continues to Customize. | [4](../flow/default/4.webp) |

Default scales the preset Controls using this outer rectangle. It has no
individual Control selection, grid step, or separate review screen.

### Advanced calibration

The following steps are shared where applicable, but all three targets need
their own design review because copy, geometry and panel families differ.

| ID | Screen / step | Controls only | Buttons only | Controls + Buttons | Content and actions | Visual references |
| --- | --- | --- | --- | --- | --- | --- |
| A01 | Screenshot import | Yes | Yes | Yes | Empty canvas / guidance, Choose from album. | Controls [4](../flow/advanced/controls-only/4.webp); Buttons [4](../flow/advanced/buttons-only/4.webp); Combined [4](../flow/advanced/combined/4.webp) |
| A02 | Outer area adjustment | Yes | Yes | Yes | Screenshot, movable/resizable outer rectangle, Re-import, Next and help. | Controls [5](../flow/advanced/controls-only/5.webp); Buttons [5](../flow/advanced/buttons-only/5.webp); Combined [5](../flow/advanced/combined/5.webp) |
| A03 | Control selection | Yes | — | Yes | Enable/disable Button box, Brightness, Volume and Media player; calibration-area preview; Back/Next. At least one Control is required. | Controls [6](../flow/advanced/controls-only/6.webp); Combined [6](../flow/advanced/combined/6.webp) |
| A04 | Button selection | — | Yes | Yes | Search built-in labels, selected chips with removal, add a custom label and choose its icon; calibration-area preview; Back/Next. At least one Button is required. | Buttons [6](../flow/advanced/buttons-only/6.webp); Combined [7](../flow/advanced/combined/7.webp) |
| A05 | Grid setup | Yes | Yes | Yes | Screenshot canvas, row/column controls (1–8 each), grid help, Back/Next. This is a required step for every Advanced target. | Controls [7](../flow/advanced/controls-only/7.webp); Buttons [7](../flow/advanced/buttons-only/7.webp); Combined [8](../flow/advanced/combined/8.webp) |
| A06 | Button box adjustment | If enabled | — | If enabled | Active rectangle, move/resize handles, completed rectangles, snapping strength, help, Back/Next. | Controls [8](../flow/advanced/controls-only/8.webp); Combined [9](../flow/advanced/combined/9.webp) |
| A07 | Brightness adjustment | If enabled | — | If enabled | Same adjustment interaction, focused on Brightness. | No active-step capture; completed Brightness box visible in Controls [9](../flow/advanced/controls-only/9.webp) and Combined [10](../flow/advanced/combined/10.webp) |
| A08 | Volume adjustment | If enabled | — | If enabled | Same adjustment interaction, focused on Volume. | Controls [9](../flow/advanced/controls-only/9.webp); Combined has completed box only in [10](../flow/advanced/combined/10.webp) |
| A09 | Media player adjustment | If enabled | — | If enabled | Same adjustment interaction, focused on Media player. | No active-step capture; completed Media player box visible in Combined [10](../flow/advanced/combined/10.webp) |
| A10 | Individual Button adjustment | — | Each selected Button | Each selected Button | Repeated adjustment step in selection order, with Button-specific label and active rectangle. | Buttons [8](../flow/advanced/buttons-only/8.webp), [9](../flow/advanced/buttons-only/9.webp); Combined [10](../flow/advanced/combined/10.webp), [11](../flow/advanced/combined/11.webp) |
| A11 | Calibration review / confirm | Yes | Yes | Yes | All enabled/selected rectangles, review help, Back and save/confirm calibration. | Controls [10](../flow/advanced/controls-only/10.webp); Buttons [10](../flow/advanced/buttons-only/10.webp); Combined [12](../flow/advanced/combined/12.webp) |

Guided Control adjustment order is **Button box → Brightness → Volume → Media
player**, skipping disabled Controls. Combined then adjusts Buttons in selection
order. Bounds and overlap validation apply before Next/save; pending gestures
must commit before advancing. Combined requires both families.

### Customize

These are states of `/customize`, not additional routes.

| ID | Screen / state | Applies to | Content and actions | Visual references |
| --- | --- | --- | --- | --- |
| C01 | Background selection | All four paths | Empty image picker card, calibrated layout preview, recalibrate link, Choose from album and image-placement help. | Default [5](../flow/default/5.webp); Controls [11](../flow/advanced/controls-only/11.webp); Buttons [11](../flow/advanced/buttons-only/11.webp); Combined [13](../flow/advanced/combined/13.webp) |
| C02 | Background image adjustment | All four paths | Interactive layout preview, pan/pinch, Choose another image, Reset position, Export PNGs and image-placement help. | Default [6](../flow/default/6.webp); Controls [12](../flow/advanced/controls-only/12.webp); Buttons [12](../flow/advanced/buttons-only/12.webp); Combined [14](../flow/advanced/combined/14.webp) |
| C03 | Button image intensity | Buttons only / Combined | Image adjustment tab and intensity slider; Buttons-only and Combined retain separate saved intensity. | Image tab visible, not active: Buttons [12](../flow/advanced/buttons-only/12.webp); Combined [14](../flow/advanced/combined/14.webp) |
| C04 | Button identifier content | Buttons only / Combined | Both / Icon / None and appearance trigger. None disables appearance and identifier position adjustments. | Buttons [12](../flow/advanced/buttons-only/12.webp); Combined [14](../flow/advanced/combined/14.webp) (Both selected) |
| C05 | Horizontal identifier position | Applicable Button layouts | Horizontal adjustment tab and slider. Availability depends on the calibrated Button geometry. | Buttons [12](../flow/advanced/buttons-only/12.webp) (horizontal tab active) |
| C06 | Vertical identifier position | Applicable Button layouts | Vertical adjustment tab and slider. Availability depends on the calibrated Button geometry. | Combined [14](../flow/advanced/combined/14.webp) (vertical tab active) |

The Button controls accompany the image preview. Default and Controls-only
do not show those identifier/intensity controls. The appearance editor and its
full-layout preview are listed below as overlays.

### Result

| ID | Screen / state | Content and actions | Visual references |
| --- | --- | --- | --- |
| R01 | Export success | Success message, scrollable grid of generated square images with labels, Open Good Lock and Back home. | Default [7](../flow/default/7.webp); Controls [13](../flow/advanced/controls-only/13.webp); Buttons [13](../flow/advanced/buttons-only/13.webp); Combined [17](../flow/advanced/combined/17.webp) |
| R02 | Opening Good Lock | Loading state on Open Good Lock; unavailable-app fallback dialog when needed. | No capture of loading state |

Review Result with one export and many exports, including Combined's two
families. Entering `/result` without exports redirects home instead of showing
an empty result screen.

## Sheets, dialogs and full-screen overlays

These surfaces are part of the revamp scope even though they have no route.

| ID | Surface | Entry point / variants | Implementation | Visual references |
| --- | --- | --- | --- | --- |
| O01 | Release announcement dialog | Startup when the active announcement has not been acknowledged; localized content and persisted dismissal | [ReleaseAnnouncementDialog](../src/features/quick-panel/release/ReleaseAnnouncementDialog.tsx) | No capture in `flow/` |
| O02 | Mode explanation sheet | Help from mode/target selection; Default and Advanced explanations | [ModeHelpSheet](../src/features/quick-panel/select-mode/ModeHelpSheet.tsx) | [select-mode](../flow/bottom-sheet-tutorial/select-mode.webp) |
| O03 | Outer calibration tutorial sheet | Help while adjusting the outer rectangle in Default or Advanced | [CalibrationHelpSheet](../src/features/quick-panel/shared/CalibrationHelpSheet.tsx) | [outer-rect-1](../flow/bottom-sheet-tutorial/outer-rect-1.webp), [outer-rect-2](../flow/bottom-sheet-tutorial/outer-rect-2.webp) |
| O04 | Grid tutorial sheet | Grid step; Controls, Buttons and Combined variants with example images | [AdvancedGridSheet](../src/features/quick-panel/calibration/advanced/AdvancedGridSheet.tsx) | [row-col-count](../flow/bottom-sheet-tutorial/row-col-count.webp) (Controls tutorial) |
| O05 | Panel alignment tutorial sheet | Individual adjustment steps; Control and Button variants | [PanelAlignmentHelpSheet](../src/features/quick-panel/shared/PanelAlignmentHelpSheet.tsx) | [panelbox-adjust](../flow/bottom-sheet-tutorial/panelbox-adjust.webp) (Control tutorial) |
| O06 | Calibration review tutorial sheet | Advanced review step | [PanelReviewHelpSheet](../src/features/quick-panel/shared/PanelReviewHelpSheet.tsx) | [panelbox-confirm](../flow/bottom-sheet-tutorial/panelbox-confirm.webp) |
| O07 | Image placement help sheet | Customize help; pan/pinch and square export explanation | [CustomizeImagePlacementHelpSheet](../src/features/quick-panel/customize/components/CustomizeImagePlacementHelpSheet.tsx) | No capture in `flow/` |
| O08 | Enlarged tutorial image viewer | Tap supported tutorial images; pan/pinch and dismissal | [HelpSheetZoomImage](../src/features/quick-panel/shared/HelpSheetZoomImage.tsx) | No capture in `flow/` |
| O09 | Calibration-area preview overlay | Preview trigger on Control or Button selection; enlarged selected screenshot area | [CalibrationAreaPreviewOverlay](../src/features/quick-panel/calibration/advanced/components/CalibrationAreaPreviewOverlay.tsx) | No capture in `flow/` |
| O10 | Custom Button icon picker dialog | Add a custom label; Preset and Other icon tabs, selection and Cancel | [CustomButtonIconDialog](../src/features/quick-panel/calibration/advanced/components/CustomButtonIconDialog.tsx) | No capture in `flow/` |
| O11 | Leave calibration confirmation dialog | Request to leave Advanced calibration after progressing; stay/cancel or leave | [AdvancedCalibrationLeaveDialog](../src/features/quick-panel/calibration/advanced/components/AdvancedCalibrationLeaveDialog.tsx) | No capture in `flow/` |
| O12 | Button identifier appearance editor | Appearance trigger in Buttons-only / Combined; focused Button preview with previous/next, color wheel, hex input, Brightness / Intensity tabs, Light / Dark neutral background, Confirm / Cancel | [ButtonLabelAppearanceDialog](../src/features/quick-panel/customize/components/ButtonLabelAppearanceDialog.tsx) | Combined [15](../flow/advanced/combined/15.webp) (Brightness tab, Light theme) |
| O13 | Overall appearance preview | Full-layout preview opened from the appearance editor; dismiss returns to the same draft and tab | [ButtonAppearanceOverallPreviewOverlay](../src/features/quick-panel/customize/components/ButtonAppearanceOverallPreviewOverlay.tsx) | Combined [16](../flow/advanced/combined/16.webp) |
| O14 | Good Lock unavailable dialog | Failed/unavailable Good Lock launch from Result; close or open Samsung store, with store-opening busy state | [GoodLockUnavailableDialog](../src/features/quick-panel/customize/components/GoodLockUnavailableDialog.tsx) | No capture in `flow/` |

## System surfaces and temporary states

| Surface / state | Where to include it in design review |
| --- | --- |
| Native splash | Startup before Home; configured in app settings and root layout. |
| Android photo picker | Screenshot import/reimport and background selection/replacement. System-owned UI; review the handoff and cancellation behavior. |
| Media-library permission request | Export/save when required. System-owned UI; denial must produce understandable app feedback. |
| Good Lock / Samsung store handoff | External apps reached from Result and its unavailable-app dialog. |
| Keyboard visible | Button search/custom label and appearance hex input; actions must remain reachable. |
| Import / image preparation | Calibration import loading, background preparation and preview preparation spinner. |
| Export busy | Export button loading/skeleton and interaction lock while capturing/saving. |
| Inline errors | Image import/processing failures, invalid bounds, overlap, export/permission/save failure and invalid hex input. These are states of their parent screen/editor. |
| Empty / disabled selections | No mode/target selected, no Controls/Buttons selected, identifier None, reset unavailable and appearance preview unavailable. |

The hidden export capture surface is rendering infrastructure, not a screen to
redesign. Its output must continue to match the visible preview.

## Screenshot-by-screenshot visual references

All **60 WebP files** in `flow/` were visually inspected and matched below.
The screen tables above also link directly to their corresponding captures.
Numbers are filenames within each flow, not inventory IDs.

These are visual references from existing captures, not proof of current-build
QA. Some Home captures display build **1.3.1-apk (30000028)**, while current
`app.json` is 1.7.4. Follow current code and product contracts when a capture's
copy or behavior differs. Screenshots in the same folder may also use different
background images or capture sessions.

### Default

| Screenshot | Inventory ID | Visible screen / state |
| --- | --- | --- |
| [1](../flow/default/1.webp) | S01 | Home |
| [2](../flow/default/2.webp) | S02 | Default selected |
| [3](../flow/default/3.webp) | D01 | Screenshot import guidance |
| [4](../flow/default/4.webp) | D02 | Outer Controls rectangle adjustment |
| [5](../flow/default/5.webp) | C01 | Background selection / layout preview |
| [6](../flow/default/6.webp) | C02 | Image adjustment across default Controls |
| [7](../flow/default/7.webp) | R01 | Export success with four Controls |
| [8](../flow/default/8.webp) | External result | Samsung Quick Panel with exported backgrounds applied |

### Advanced Controls only

| Screenshot | Inventory ID | Visible screen / state |
| --- | --- | --- |
| [1](../flow/advanced/controls-only/1.webp) | S01 | Home with build label |
| [2](../flow/advanced/controls-only/2.webp) | S02 | Advanced selected |
| [3](../flow/advanced/controls-only/3.webp) | S03 | Controls only selected |
| [4](../flow/advanced/controls-only/4.webp) | A01 | Screenshot import guidance |
| [5](../flow/advanced/controls-only/5.webp) | A02 | Outer Controls area adjustment |
| [6](../flow/advanced/controls-only/6.webp) | A03 | Control selection; Media player disabled |
| [7](../flow/advanced/controls-only/7.webp) | A05 | Grid setup: 4 columns, 3 rows |
| [8](../flow/advanced/controls-only/8.webp) | A06 | Active Button box adjustment |
| [9](../flow/advanced/controls-only/9.webp) | A08 | Active Volume adjustment; Button box and Brightness completed |
| [10](../flow/advanced/controls-only/10.webp) | A11 | Review of three enabled Controls |
| [11](../flow/advanced/controls-only/11.webp) | C01 | Background selection / vertical Controls layout |
| [12](../flow/advanced/controls-only/12.webp) | C02 | Image adjustment across three Controls |
| [13](../flow/advanced/controls-only/13.webp) | R01 | Export success with three Controls |
| [14](../flow/advanced/controls-only/14.webp) | External result | Samsung Quick Panel with Controls backgrounds applied |

### Advanced Buttons only

| Screenshot | Inventory ID | Visible screen / state |
| --- | --- | --- |
| [1](../flow/advanced/buttons-only/1.webp) | S01 | Home with build label |
| [2](../flow/advanced/buttons-only/2.webp) | S02 | Advanced selected |
| [3](../flow/advanced/buttons-only/3.webp) | S03 | Buttons only selected |
| [4](../flow/advanced/buttons-only/4.webp) | A01 | Screenshot import guidance |
| [5](../flow/advanced/buttons-only/5.webp) | A02 | Outer Button area adjustment |
| [6](../flow/advanced/buttons-only/6.webp) | A04 | Five selected Buttons, including custom Shazam |
| [7](../flow/advanced/buttons-only/7.webp) | A05 | Grid setup: 4 columns, 4 rows |
| [8](../flow/advanced/buttons-only/8.webp) | A10 | Active Wi-Fi adjustment |
| [9](../flow/advanced/buttons-only/9.webp) | A10 | Active SmartThings adjustment; previous Buttons completed |
| [10](../flow/advanced/buttons-only/10.webp) | A11 | Review of five Buttons |
| [11](../flow/advanced/buttons-only/11.webp) | C01 | Background selection / Button layout preview |
| [12](../flow/advanced/buttons-only/12.webp) | C02, C04, C05 | Image adjustment, Both identifiers, horizontal position tab active (5%); Image/vertical tabs visible |
| [13](../flow/advanced/buttons-only/13.webp) | R01 | Export success with scrollable Button images |
| [14](../flow/advanced/buttons-only/14.webp) | External result | Samsung Quick Panel with Button backgrounds applied |

### Advanced Controls + Buttons

| Screenshot | Inventory ID | Visible screen / state |
| --- | --- | --- |
| [1](../flow/advanced/combined/1.webp) | S01 | Home with build label |
| [2](../flow/advanced/combined/2.webp) | S02 | Advanced selected |
| [3](../flow/advanced/combined/3.webp) | S03 | Controls + Buttons selected |
| [4](../flow/advanced/combined/4.webp) | A01 | Screenshot import guidance |
| [5](../flow/advanced/combined/5.webp) | A02 | Outer area covers both families |
| [6](../flow/advanced/combined/6.webp) | A03 | All four Controls enabled |
| [7](../flow/advanced/combined/7.webp) | A04 | Five selected Buttons, including custom Shazam |
| [8](../flow/advanced/combined/8.webp) | A05 | Grid setup: 4 columns, 8 rows |
| [9](../flow/advanced/combined/9.webp) | A06 | Active Button box adjustment |
| [10](../flow/advanced/combined/10.webp) | A10 | Active Wi-Fi adjustment; all Controls completed |
| [11](../flow/advanced/combined/11.webp) | A10 | Active SmartThings adjustment; earlier items completed |
| [12](../flow/advanced/combined/12.webp) | A11 | Review of both families |
| [13](../flow/advanced/combined/13.webp) | C01 | Background selection / Combined layout preview |
| [14](../flow/advanced/combined/14.webp) | C02, C04, C06 | Image adjustment, Both identifiers, vertical position tab active (95%); Image/horizontal tabs visible |
| [15](../flow/advanced/combined/15.webp) | O12 | Appearance editor: focused Wi-Fi, color wheel, Brightness active, hex input and Light theme |
| [16](../flow/advanced/combined/16.webp) | O13 | Overall appearance preview over Customize |
| [17](../flow/advanced/combined/17.webp) | R01 | Export success; Controls first and Buttons further down the scrollable grid |
| [18](../flow/advanced/combined/18.webp) | External result | Samsung Quick Panel with both families applied |

### Tutorial sheets

| Screenshot | Inventory ID | Visible surface / state |
| --- | --- | --- |
| [select-mode](../flow/bottom-sheet-tutorial/select-mode.webp) | O02 | Mode explanation sheet over S02 |
| [outer-rect-1](../flow/bottom-sheet-tutorial/outer-rect-1.webp) | O03 | Outer calibration tutorial over A02; top portion with instructions and correct/incorrect edge examples |
| [outer-rect-2](../flow/bottom-sheet-tutorial/outer-rect-2.webp) | O03 | Same outer tutorial scrolled lower to full example images |
| [row-col-count](../flow/bottom-sheet-tutorial/row-col-count.webp) | O04 | Controls grid tutorial over A05; 4-column / 3-row and 4-column / 5-row examples |
| [panelbox-adjust](../flow/bottom-sheet-tutorial/panelbox-adjust.webp) | O05 | Control alignment tutorial over A06; correct/incorrect purple box alignment |
| [panelbox-confirm](../flow/bottom-sheet-tutorial/panelbox-confirm.webp) | O06 | Review tutorial over A11; completed orange boxes |

### External applied-result references

The final screenshot of each flow shows the **Samsung Quick Panel after applying
exports with QuickStar**. These are external outcome references, not R01 or R02
and not additional QPBC routes:

- Default: [8](../flow/default/8.webp).
- Controls only: [14](../flow/advanced/controls-only/14.webp).
- Buttons only: [14](../flow/advanced/buttons-only/14.webp).
- Combined: [18](../flow/advanced/combined/18.webp).

### Capture coverage gaps

- A07 Brightness and A09 Media player have no capture while actively adjusting;
  their completed boxes appear in later calibration captures. A08 Volume has an
  active Controls-only capture, but no active Combined capture.
- A10 has active Wi-Fi and SmartThings examples, not every selected Button step.
- C03 Image intensity has a visible tab but no active-tab capture. C04 shows
  Both; Icon, None and their disabled-control states are not captured.
- O12 shows Brightness and Light theme; the active Intensity tab, Dark theme,
  keyboard and invalid-hex states are not captured.
- O01 release announcement, O07 image-placement help, O08 enlarged tutorial
  image viewer, O09 calibration-area preview, O10 custom icon picker, O11 leave
  confirmation and O14 Good Lock unavailable dialog have no capture in `flow/`.
  Visible triggers or custom-label chips do not count as captures of these surfaces.
- O04 and O05 have Control tutorial captures; Button and Combined-specific
  tutorial variants still need references where their content differs.
- R02 Good Lock loading, splash, photo picker, permission prompts, import/preview
  preparation, export busy, errors and other disabled/empty states lack captures.

## Revamp coverage checklist

- [ ] Cover all six routes, their steps/states and every overlay above.
- [ ] Run all four paths from first import through Result, plus saved-calibration entry and recalibration.
- [ ] Preserve existing local calibration, storage keys, compatibility parsing, last choices, help state and appearance settings.
- [ ] Preserve Advanced grids, bounds, overlap checks, snapping, haptics and atomic gesture commits.
- [ ] Preserve transactional appearance editing: Confirm saves; Cancel, backdrop and Android Back discard. Back from overall preview first returns to the editor.
- [ ] Preserve shared preview/export coordinates and working source, 1024-square PNG output, centered square source areas, export order, sequential readiness and capture-failure cleanup.
- [ ] Preserve URI-based cache ownership and existing image selection after cancelled/failed imports.
- [ ] Review English, Traditional Chinese and Spanish; there is currently no in-app language switcher.
- [ ] Review short phones, Fold widths, safe areas, keyboard, touch targets, accessibility, Android Back and reduced motion.

Use [product behavior](product-behavior.md), [architecture](architecture.md),
[current styling](styling.md) and [manual acceptance](production-manual-test-checklist.md)
for detailed contracts. The deferred [My Icons proposal](backlog/my-icons-library.md)
is outside this inventory's current feature scope. No Settings, saved-layout
library or My Icons screen is currently routed.
