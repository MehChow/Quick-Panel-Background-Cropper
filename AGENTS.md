# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## App status

Quick Panel Background Cropper (QPBC) has been released for production on Google Play with version v1.0.0, which is the v2 of app (only support Controls panel customization with default and advanced mode). For any changes in the future, the local data should be persisted across any app updates by default (e.g. calibration preset, helper icon animation flag). If the changes absolutely requires a reset of the local data, warn the user first before proceeding to any further actions.

## App brief

QPBC is an Expo app for creating Samsung Good Lock Quick Panel background PNGs from one user-selected image, with all features run locally. In v3, the app separates advanced mode with **Controls-only** and **Buttons-only** branches. The supported Controls panels are Button box, Media player, Brightness, and Volume. The Buttons-only branch supports one or more manually selected Quick Panel Buttons exported as separate square PNGs.

The user flow is: landing -> mode selection -> calibration -> image selection -> preview adjustment -> export result. Default mode asks the user to import a fully expanded Quick Panel screenshot, adjust one green rectangle around the full Controls area, and save it as the layout basis. Advanced mode now has two visible steps: first choose `Advanced`, then choose either `Controls only` or `Buttons only`.

Advanced Controls keeps the existing guided calibration flow: confirm the outer area first, turn off any supported panel missing from that region, set the snapping grid, then go through the enabled panel-box steps in this order: Button box, Brightness, Volume, and Media player. Advanced Controls includes an editable snapping grid inside the confirmed outer area so users can fine-tune row and column counts while matching customized layouts.

Advanced Buttons asks the user to confirm an outer area, set the snapping grid, choose one or more Quick Panel Button labels through a toggle list with a selected-chip summary, and then fine-tune the generated button boxes. The app remembers the last successful main mode (`Default` or `Advanced`) and, for Advanced exports, also remembers the last successful advanced target (`Controls only` or `Buttons only`) as preselected choices on the Select Mode flow.

After calibration, the app lets users choose a background image, pan/zoom it against a live preview, and export square PNGs in Good Lock application order. Advanced Controls exports only enabled Controls panels. Advanced Buttons exports only the selected Button panels. The S25+ One UI 8.5 preset remains the base template. Default mode scales that preset into the calibrated outer union, while Advanced Controls and Advanced Buttons start from preset-based boxes and then let the user fine-tune each panel.

For Buttons in Customize, the preview/export path uses full-fill image rendering with a user-adjustable opacity slider on the Customize screen. That opacity control is local to the screen, affects both live preview and Button exports, and is intentionally not persisted.

For the exact UI flows, refer to `flow/default`, `flow/advanced/controls-only`, `flow/advanced/buttons-only`, and the bottom helper sheets under `flow/bottom-sheet-tutorial`.

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
