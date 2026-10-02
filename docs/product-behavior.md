# Current product behavior

QPBC creates Samsung Good Lock QuickStar panel backgrounds locally from one
selected image. It targets Samsung phones on Android 16 / One UI 8.5, using
the Galaxy S25+ layout as its base preset. DeX, external displays, automatic
enumeration of device Quick Settings, and multiple saved layout profiles are
outside the current feature set.

The app supports English, Traditional Chinese, and Spanish. Language resolves
from the device locale with English fallback; there is no active in-app language
switcher. User-facing changes must stay synchronized across all three locales.

## Workflow

Landing -> mode selection -> calibration when needed -> background selection
-> image adjustment -> export result. Saved calibration lets later sessions
skip calibration. Recalibration remains available. Successful exports remember
the main mode and Advanced target for subsequent preselection.

| Path | Calibration sequence |
| --- | --- |
| Default | Import expanded screenshot -> confirm one outer Controls rectangle |
| Advanced Controls only | Outer area -> Control selection -> grid -> enabled Controls -> review |
| Advanced Buttons only | Outer area -> Button selection -> grid -> selected Buttons -> review |
| Advanced Controls + Buttons | Outer area -> Control selection -> Button selection -> grid -> enabled Controls -> selected Buttons -> review |

Controls are Button box, Media player, Brightness, and Volume. Guided calibration
order is Button box, Brightness, Volume, Media player. Disabled Controls retain
geometry but do not participate in validation or export. Combined requires at
least one Control and one Button. Each of the four paths stores calibration
independently.

Advanced grids are required, with independent per-target row/column counts
between 1 and 8. Grid counts are edited in the dedicated grid step. Panel move
and resize support snapping and haptics, constrained to the outer area. Global
Low / Balanced / Strong snap strength affects interaction only. There is no
snapping Off mode.

Active Controls are purple, active Buttons blue, and completed boxes orange.
Editing may temporarily overlap completed boxes; Next and final save reject
overlap with visible completed boxes. Pending gestures must commit before Next.

## Buttons and identifiers

The catalog currently contains 32 built-in labels. Custom labels can choose
from preset Button icons or 28 generic icons. The canonical catalog and stable
icon IDs are defined in `src/features/quick-panel/model/button-labels.ts`.
Selection order determines calibration and export order; at least one Button
is required for either Button-containing target.

Buttons-only and Combined share identifier settings: Both / Icon / None,
horizontal and vertical position, glyph color, identifier intensity, and
Light / Dark neutral background theme. None removes identifiers and disables
their appearance and position controls. Icon preserves safe dynamic horizontal
positioning without the text. Exact grid spans determine applicable layouts
and position controls; see the shared identifier-layout model.

Glyph color/brightness changes only the icon glyph. Label and icon-circle
neutral color is white for Light and #666666 for Dark. Identifier intensity
applies to the complete overlay. Appearance changes are transactional: Confirm
persists; Cancel, backdrop dismissal, and closing with Android Back discard.
The full-layout preview returns to the same picker draft and adjustment tab.

Button image intensity defaults to 78%. Combined persists its intensity
separately from Buttons-only, while the identifier settings remain shared.

## Image import, preview and export

All calibration and background selection use the same import pipeline. Images
at or below a 2048-pixel long edge remain unchanged; larger inputs are decoded
at bounded size and saved as a working source, JPEG at 90% or PNG to preserve
transparency. Orientation and actual output dimensions determine geometry.
The optimization is silent. Cancel/failure retains the prior selection.

Customize pans and zooms one image across the selected layout. A temporary
1080-long-edge preview proxy may improve responsiveness; it never becomes the
export source. Both renderers use the same working-source coordinates and
transform. Export does not promise the untouched original file's resolution.

Each export is a 1024 x 1024 PNG. Non-square panels use a centered square
source area, which QuickStar clips to the panel shape. Controls export in
Good Lock order: Button box, Media player, Brightness, Volume. Buttons follow
selection order. Combined exports enabled Controls first, then Buttons, with
one contiguous family-aware filename sequence.

Capture is sequential. A capture failure prevents a partial result and media
save begins only after all captures succeed. A media-library failure stops the
run; already-created gallery assets are not rolled back by the current API loop.
Result shows successful exports and supports opening Good Lock for manual use.

## UI revamp boundary

Layout, visual tokens, and UI primitives can be redesigned. Preserve the four
paths, validation, accessibility, localization, persistence, image composition,
and export contracts above. Current screenshots remain in `flow/`; current
styling is documented separately. The deferred My Icons proposal adds features
and is not part of a feature-preserving revamp.
