# Customize Source Image Context Design

**Date:** 2026-07-20
**Status:** Approved

## Problem

QuickStar imports a square image for every Controls or Buttons panel, including
panels that are much wider or taller than they are square. The actual panel
shows only a centered sub-rectangle of that square. QPBC therefore keeps the
whole required square export area covered while users pan and zoom one
continuous image across their layout.

This behavior is correct, but the current Customize preview shows only the
visible panel shapes. Users cannot see the source-image edge or the hidden
square area around those panels, so a correct movement clamp can feel like an
app bug. At the fit scale, a portrait image may have no vertical movement room;
zooming creates the additional overscan needed to move farther.

## Evidence

- `getExportSquareRect()` centers each visible panel inside a square export.
- `getImagePlacementBounds()` includes the vertical extent of those square
  exports and is already the authoritative pan, zoom, and fit boundary.
- `PanelSlice` and `ExportSurface` consume the same `ImageTransform`, so the
  current preview and exported PNGs already agree.
- The supplied QuickStar screenshots show a square crop editor and confirm that
  wide panels use approximately the middle strip of the selected square.

The exact square-coordinate behavior is device-observed and is not documented
as a stable Samsung API contract. The feature must continue using QPBC's tested
geometry as its source of truth so later QuickStar changes can be handled in one
place.

## Goals

- Make the source-image boundary visible in Customize so movement limits are
  understandable without interrupting the user.
- Keep the current clean panels-only preview available through an eye toggle.
- Default source context to visible and remember the user's preference across
  future Customize visits and app updates.
- Explain the QuickStar square-crop constraint in a brief, optional helper
  sheet opened from the Customize header.
- Support Default, Advanced Controls, and Advanced Buttons with the same
  geometry and interaction contract.
- Preserve the exact existing image transform, preview semantics, and exported
  PNG output.
- Localize all new user-facing and accessibility copy in English and
  Traditional Chinese.

## Non-goals

- Do not change QuickStar's crop behavior or attempt to bypass it.
- Do not give individual panels independent image transforms.
- Do not fabricate, mirror, blur, or extend pixels beyond the source image.
- Do not change fit, pan, pinch, clamp, panel, or export geometry.
- Do not add edge messages, toasts, haptics, overscroll, or inline explanatory
  text to the Customize screen.
- Do not change Controls opacity, Button image intensity, identifiers, image
  normalization, export order, filenames, dimensions, or capture readiness.
- Do not reset/migrate existing calibration and preference data.

## Approved User Experience

### Customize header helper

- Show the existing amber `helper-balanced` action in the Customize header.
- Use a new `customize-image-placement` help ID so the established first-time
  attention animation stops after the sheet is opened.
- Keep the helper available before and after an image is selected.
- Opening it presents a dynamically sized bottom sheet using the existing dark
  sheet, backdrop, handle, safe-area, and swipe-to-close conventions.
- Keep the sheet brief and text-led; it does not need a new image asset.

Approved English meaning:

> QuickStar applies a square image to every panel. Wide panels display only the
> center part of that square, so the hidden area must remain covered too. Zoom
> in to create more space for moving the image.

Render a second body paragraph below it using the same typography and spacing.
It explains the preview-only movement boundary without adding a legend or new
visual component:

> The amber border marks the full area the image must cover. Zoom in if you
> need more room to move the image within it.

Approved Traditional Chinese meaning for the second paragraph:

> 琥珀色邊框表示圖片必須覆蓋的完整範圍。如需在範圍內有更多移動空間，請放大圖片。

Both Traditional Chinese paragraphs must preserve the approved meaning rather
than translate individual words mechanically. Store the boundary paragraph
under its own locale key so the helper keeps two distinct paragraphs.

### Eye toggle

- Place a 48-point square eye control in the fixed footer, immediately beside
  `Select another image` in the first action row.
- Use `eye` while source context is visible and `eye-off` while the clean view
  is active.
- Use the shared AniUI `Button` with a black surface, subtle white border,
  white 20-point icon, rounded-md shape, and visible pressed state.
- Give each state its own localized accessibility label.
- Disable the eye control whenever image processing or export is active,
  matching the adjacent image action.
- Source context is enabled by default for new and existing users.
- Toggling updates only the preview presentation. It must not reset, clamp,
  commit, or otherwise alter `ImageTransform`.

### Source-context appearance

- The full transformed source image appears within the authoritative placement
  frame behind the panel slices.
- Apply the established `bg-black/50` treatment through an inverse rounded-panel
  SVG path so it covers only the area outside the visible panels.
- Keep the shared source image and all per-panel images mounted across eye
  toggles. Change only their immediate opacity and backing treatment.
- Render the shared source image at the same opacity the current panel images
  use: 0.5 for Controls or the current screen-local Button image intensity.
- Reproduce the existing `bg-white/10` panel backing as rounded SVG shapes below
  the source image. Existing panel slices render borders, Controls overlays,
  Button overlays, and identifiers above the shared source image without
  rendering a second image or background.
- Hide the per-panel images and backing while source context is visible; hide
  the shared image, SVG backing, dim layer, and movement boundary in clean mode.
- Draw one amber outline around the complete placement frame used by preview
  layout and gesture clamps. Keep it preview-only, inset by half its two-point
  visual stroke, with no fill, label, legend, warning, or animation.
- When source context is hidden, the preview must be visually equivalent to the
  current implementation.
- Do not add labels, borders, warnings, or animations to the image edge. Seeing
  the real source stop against the placement frame is the explanation.

## Preview Geometry

The preview always uses `getImagePlacementBounds(preset)` as one static stage
frame, whether source context is visible or hidden. The clean state reserves
the same full placement-frame height and leaves the area outside panel shapes
visually empty.

1. Fit the placement frame into the existing width and height budgets without
   changing its aspect ratio.
2. Derive one layout scale from the rendered frame width and keep it stable
   across eye toggles.
3. Map gesture focal coordinates through the placement-frame origin and layout
   scale.
4. Keep pan/pinch constraints tied to the same placement frame.
5. Position panel slices relative to that fixed origin.
6. Apply the same Reanimated shared `ImageTransform` to the shared source image
   and every mounted panel image.

At higher zoom levels, source pixels may extend beyond the placement frame and
remain clipped by the preview stage. Eye toggles do not change stage size,
origin, aspect ratio, gesture mapping, or `ImageTransform`.

## Component and Data Design

### `CustomizeScreen`

- Own local open/closed state for the helper sheet.
- Mark `customize-image-placement` as seen when the sheet opens.
- Configure `SubPageHeader` with the localized helper accessibility label,
  helper ID, and `helper-balanced` variant.
- Mount `CustomizeImagePlacementHelpSheet` as a screen-level sibling using the
  same pattern as existing calibration and mode helper sheets.

### `CustomizeImagePlacementHelpSheet`

- Own only bottom-sheet presentation.
- Read its title and explanation from i18next.
- Reuse `useBottomSheetInsets`, a 0.6 backdrop, dynamic sizing, the 85% viewport
  height ceiling, and the current dark sheet styling.
- Close through backdrop press, pan-down, or the sheet close callback.

### Persisted source-context preference

- Add a separate MMKV key: `quick-panel.show-source-image-context`.
- Missing values resolve to `true` so the feature is discoverable for existing
  installations without touching other stored data.
- Only a real boolean is accepted; invalid data falls back to `true`.
- Save immediately when the eye control is pressed.
- Expose the value and setter through a small typed hook/helper rather than
  adding it to the main Zustand app state.
- Do not bundle this setting into calibration storage or screen-local Button
  adjustment state.

### `QuickPanelPreview`

- Receive only the persisted source-context value from `CustomizeScreen`.
- Coordinate the fixed placement frame, gesture surface, and stable source and
  panel layers without owning source-context interaction.
- Keep export state and export callbacks out of this component.

### `CustomizeActions`

- Receive the persisted source-context value and setter from `CustomizeScreen`.
- Keep `Select another image` flexible and render the square eye control beside
  it in a `flex-row gap-3` footer row.
- Disable both first-row actions while image processing or export is active.

### `SourceImageContext`

- Render rounded `bg-white/10` panel backing shapes, one fixed-size animated
  source-image layer, an inverse rounded-panel dim mask, and one placement-frame
  movement boundary. Keep every node mounted while visibility changes.
- Reuse the preview proxy URI, original logical image dimensions,
  `cachePolicy="memory-disk"`, `contentFit="fill"`, top-left transform origin,
  and the same Reanimated transform-only placement used by `PanelSlice`.
- Build the mask path from the placement-frame rectangle followed by each
  visible panel's rounded rectangle. Use SVG even-odd fill so the outer
  frame is dimmed and panel shapes remain clear.
- Accept the current uniform image opacity explicitly: 0.5 for Controls or the
  Button image-intensity value for Advanced Buttons.
- Draw the amber movement boundary above the dim layer and below panel slices,
  inset it by `1 / layoutScale`, and keep a two-point rendered stroke.

### `PanelSlice`

- Keep its animated image node mounted in both eye states.
- Switch the image opacity to zero and backing to transparent while source
  context is visible, without changing rounded clipping, borders, Controls
  overlays, Button overlays, or identifier behavior.

### Gesture hook

- Accept the static placement frame as explicit input for layout scaling and
  focal-coordinate mapping.
- Continue deriving the actual clamp bounds and minimum scale from
  `getImagePlacementBounds(preset)`.
- Eye state never reaches the gesture hook and never invalidates layout scale or
  calls `onTransformChange`.

## Export Isolation

The source-context value must never be passed to `ExportSurfaceHost`,
`ExportSurface`, `useSequentialExport`, or export file services. Export continues
to consume only the normalized original image, active preset, existing
`ImageTransform`, and current Button-specific controls.

A regression test must demonstrate that footer eye changes update preview
rendering only while export props and transform callbacks remain unchanged.

## Dependency

Install the Expo SDK 56-compatible `react-native-svg` package through
`npx expo install react-native-svg`. Expo 56 recommends version `15.15.4` and
includes its native implementation in Expo Go.

Use SVG only for the three dynamic geometry layers required here: rounded panel
backings, the inverse even-odd dim path, and the movement boundary. Do not use
it to replace image, gesture, overlay, or export rendering.

Reference: <https://docs.expo.dev/versions/v56.0.0/sdk/svg/>

## Localization

Add matching keys to `i18next/locales/en.ts` and `i18next/locales/zh.ts` for:

- Customize helper accessibility label;
- helper title;
- QuickStar square-crop explanation;
- amber movement-boundary explanation;
- show-source-context accessibility label; and
- hide-source-context accessibility label.

Locale tests must require every new key in both languages. Visible copy and
accessibility labels must not be hard-coded in components.

## Accessibility

- The helper remains a labeled button and retains the established helper
  attention behavior with reduced-motion support.
- The eye control uses button semantics, a 48-point square target, and localized
  state-specific labels.
- Expose selected state for the eye control so assistive technology can announce
  whether source context is currently shown.
- Keep the eye control outside the gesture detector to avoid competing with pan
  and pinch interactions.
- The bottom sheet must preserve existing screen-reader and dismissal behavior.

## Performance Constraints

- Reuse the existing bounded preview proxy rather than loading another
  full-resolution bitmap for the source layer.
- Keep one shared source `expo-image` and all per-panel `expo-image` nodes
  mounted across toggles; invisible proxy-backed nodes are an approved tradeoff
  for eliminating native image lifecycle flashes.
- Keep all gesture-frame placement on Reanimated shared values and animated
  transforms; do not introduce React or Zustand writes during pan/pinch updates.
- Do not remount image nodes or regenerate the preview proxy when the eye value
  changes.
- Preserve `cachePolicy="memory-disk"`.

## Testing

Implement with focused tests before production changes:

1. Storage tests verify missing, true, false, and invalid persisted values; the
   default is true and saves do not affect other MMKV keys.
2. Pure geometry tests verify the fixed placement frame, panel radii, inverse
   dim path, and Controls/Button image opacity.
3. SVG geometry tests verify the panel backing shapes and even-odd dim path use
   the selected frame origin, panel radii, and scaled coordinates without
   dimming panel interiors.
4. Footer component tests verify the eye shares the image-action row, toggles
   both directions, exposes localized selected state, and disables while busy.
5. Rendering tests verify shared and per-panel images stay mounted while their
   opacity/backing visibility changes immediately.
6. Preview and gesture regressions verify value changes preserve frame, layout
   scale, focal mapping, transform, and image-node mounts.
7. Screen tests verify the localized header helper opens/closes the sheet,
   renders the boundary explanation as a separate paragraph, and marks the new
   help ID as seen.
8. Locale tests verify every English and Traditional Chinese key, including the
   approved amber-boundary meaning.
9. Export-isolation tests verify the eye state never reaches export surfaces and
   does not alter image URI, transform, opacity, identifier, or readiness props.

Then run the full Jest suite, TypeScript checking, Expo lint, `git diff --check`,
and an Android Expo export.

## Manual Android Verification

Verify on the S25+ baseline in both supported languages:

1. Open Customize before selecting an image; confirm the header helper opens
   and closes correctly.
2. Select a portrait image in Default, Advanced Controls, and Advanced Buttons.
3. Confirm source context starts visible on a fresh preference state.
4. At fit scale, pan to every boundary and confirm the real image edge explains
   why movement stops.
5. Zoom in and confirm additional movement room appears naturally.
6. Toggle the eye repeatedly at fit, pan, and zoom positions; confirm there is
   no image jump, transform reset, gesture conflict, or preview-proxy reload.
7. Leave and reopen Customize, then restart the app; confirm the eye preference
   persists.
8. Confirm the clean state matches the previous panels-only preview.
9. Export once in each branch and compare the PNG dimensions, order, filenames,
   and visible composition with the preview and pre-feature behavior.
10. Switch languages and confirm the helper and accessibility copy update.

## Acceptance Criteria

- Users can reveal or hide the dimmed source image with one eye-button press.
- Source context is on by default and the user's last eye choice persists.
- The source-image edge visibly meets the same boundary used by fit and clamp
  logic.
- Clean mode preserves the existing preview appearance.
- Eye toggling never changes `ImageTransform`, panel-specific controls, or any
  exported PNG.
- The helper sheet clearly explains the square-crop limitation and identifies
  the amber movement boundary without adding instructional UI to the main
  Customize screen.
- All new copy is available in English and Traditional Chinese.
- Existing stored calibration, mode, target, helper, and Button-control data is
  preserved across the update.
- Source-context mode does not stack duplicate semi-transparent source images
  inside panel shapes.
- Focused and full automated verification pass, followed by Android device QA.

## Alternatives Considered

### Always show source context

This maximizes discoverability but permanently makes the screen busier and can
reduce the displayed panel size. Rejected because experienced users may prefer
the current clean composition view.

### Show source context only while dragging or at an edge

This preserves a clean idle state but introduces reactive behavior, requires
additional edge-state communication, and can make the UI appear to flash.
Rejected because the approved design needs no response or explanation on the
main canvas.

### Keep the current preview and add only a helper sheet

This has the smallest implementation cost but does not let users see the source
edge while they are experiencing the limitation. Rejected because visual
evidence is the main teaching mechanism.

### Separate minimap

A small overview would preserve the large panel preview but splits attention
between two representations and consumes additional vertical space. Rejected in
favor of toggling context directly around the interactive preview.
