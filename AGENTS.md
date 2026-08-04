# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## App status

Quick Panel Background Cropper (QPBC) is released on Google Play as v1.0.0, referred to internally as v2. That production version supports Controls customization through Default and Advanced modes. v3 keeps those flows and adds the complete Advanced Buttons-only workflow. The current v4 work keeps every existing path and adds an independent Advanced **Controls + Buttons** target for a single image that spans both panel families.

v3 intentionally ignores legacy calibration coordinates because the old bordered coordinate surface could save inaccurate rectangles. Users updating from v1.0.0/v2 must recalibrate Default, Advanced Controls, and Advanced Buttons once. A one-time release announcement explains the new workflow and recalibration requirement. This is the approved exception to the normal persistence rule: language, seen-help state, last exported choices, release-announcement acknowledgement, and other unrelated preferences must remain intact. For future changes, persist local data across app updates by default. If another reset is absolutely required, warn the user before proceeding.

## App brief

QPBC is an Expo app for creating Samsung Good Lock Quick Panel background PNGs from one user-selected image, with all features run locally. Advanced mode has three independent targets: **Controls only**, **Buttons only**, and **Controls + Buttons**. The supported Controls panels are Button box, Media player, Brightness, and Volume. Buttons are manually selected and exported as separate square PNGs. The combined target requires at least one Control and one Button and lets one image flow continuously across both families.

The user flow is: landing -> mode selection -> calibration -> image selection -> preview adjustment -> export result. Default mode asks the user to import a fully expanded Quick Panel screenshot, adjust one green rectangle around the full Controls area, and save it as the layout basis. Advanced mode has two visible selection steps: first choose `Advanced`, then choose `Controls only`, `Buttons only`, or `Controls + Buttons`.

Advanced Controls keeps the existing guided calibration flow: confirm the outer area first, turn off any supported panel missing from that region, set the snapping grid, then go through the enabled panel-box steps in this order: Button box, Brightness, Volume, and Media player. Advanced Controls includes an editable snapping grid inside the confirmed outer area so users can fine-tune row and column counts while matching customized layouts.

Advanced Buttons asks the user to confirm an outer area, set the snapping grid, choose one or more Quick Panel Button labels through a toggle list with a selected-chip summary, and then fine-tune the generated button boxes. The final catalog has 30 reviewed built-in labels with stable icon mappings. Custom labels require one of eight generic icons: Zap, Star, Sparkles, Circle, Music, Gamepad, Globe, or Sliders. At least one Button must be selected.

Advanced Controls + Buttons uses one fully expanded screenshot, one combined outer area, and one required grid. Its exact calibration order is: outer area -> Control selection -> Button selection -> grid -> enabled Controls in guided order -> selected Buttons in selection order -> combined review. Controls are purple while active, Buttons are blue while active, and completed boxes are orange. Boxes may overlap while they are actively edited, but Next and final save reject overlap with visible completed boxes. Combined calibration is stored independently from all existing calibration branches.

The snapping grid is required in all Advanced targets. Row and column controls remain available, all editable boxes snap with haptic feedback, and boxes remain constrained to the confirmed outer area. Controls-only, Buttons-only, and Controls + Buttons retain independent grid counts with their separate calibrations. The app remembers the last successful main mode (`Default` or `Advanced`) and, for Advanced exports, the last successful advanced target (`Controls only`, `Buttons only`, or `Controls + Buttons`) as preselected choices on the Select Mode flow. Default, Advanced Controls, Advanced Buttons, and Advanced Combined calibrations are stored independently.

After calibration, the app lets users choose a background image, pan/zoom it against a live preview, and export square PNGs in Good Lock application order. Advanced Controls exports only enabled Controls panels. Advanced Buttons exports only the selected Button panels. Combined exports enabled Controls first in Good Lock order, then Buttons in selection order, with one contiguous family-aware filename sequence. The S25+ One UI 8.5 preset remains the base template. Default mode scales that preset into the calibrated outer union, while each Advanced target starts from preset-based boxes and then lets the user fine-tune each panel.

For targets containing Buttons, the preview/export path uses full-fill image rendering and a compact adjustment panel for Button image intensity, label visibility, horizontal and vertical label position, and a focused label-appearance dialog for color, intensity, and light/dark background style. These settings affect both preview and export. Identifier settings are shared with Buttons-only under `quick-panel.button-customize-settings`. Combined Button image intensity defaults to `78%` and persists separately under `quick-panel.combined-button-image-intensity`, so changing it does not change Buttons-only intensity.

Buttons preview and export must share one source-coordinate composition: the same panel rectangles, original image dimensions, `{ x, y, scale }` transform, image intensity, label settings, and normalized label positions. A preview-only proxy may cap large images at a 1080-pixel long edge, but exports must use the normalized original. Do not add separate per-panel or export-only crops/transforms. Keep label metrics relative to the shared calibrated grid-cell reference and constrain them to the visible Button bounds.

Each Button export is an original-quality `1024 x 1024` PNG. Non-square Buttons use a centered square source area for QuickStar to clip into the final shape. Export one panel at a time in Good Lock order, wait for the original image and any measured horizontal label position to be ready, and keep the run all-or-nothing if a capture fails.

For the exact UI flows, refer to `flow/default`, `flow/advanced/controls-only`, `flow/advanced/buttons-only`, `flow/advanced/combined`, and the bottom helper sheets under `flow/bottom-sheet-tutorial`.

For final v3 behavior, refer to `docs/v3_changelog.md`. For the additive v4 combined target, refer to `docs/superpowers/specs/2026-07-31-controls-buttons-combined-mode-design.md` and the newest superseding entries in `docs/notes.md`. `docs/v4-idea.md` is historical context only. Older notes and specs may describe a deferred combined target, screen-local Customize settings, a `50%` non-persisted combined intensity, older label/icon catalogs, separate preview/export sizing, or removed experiments; do not treat those as current behavior. Use `docs/release-announcement-guideline.md` for future startup announcements.

## Tech Stack

- **Framework:** Expo 56
- **Styling:** Uniwind (Tailwind v4)
- **State management:** Zustand
- **UI:** AniUi

## TypeScript

- Use interfaces for props/state, avoid `any`

## Code Style

- Concise, type-safe TypeScript
- Modular, feature-organized files
- Prevent using `useMemo, useCallback, React.memo` as it is handled by React Complier (except AniUI components under `src/components/ani-ui`)

## Naming

- camelCase for variables/functions: `isFetchingData`
- PascalCase for components: `UserProfile`
- lowercase + hyphenated directories: `user-profile`

## Styling Rules

- Consistent padding, responsive design
- Use `expo-image` for images
- Preferrably use / install components from AniUi under src/components/ani-ui for base components
- Read `docs/styling.md` for detailed guideline on ui designs

## Best Practices

- DRY principle
- Extract business logic into custom hook
- Keep components files small (.tsx, .jsx), each file under 150 lines of code
