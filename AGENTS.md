# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## App brief

Quick Panel Background Cropper is an Expo app for creating Samsung Good Lock Quick Panel background PNGs from one user-selected image. In v2, the app only supports the Quick Panel **Controls** tab, not the **Buttons** tab. The supported panels are Button box, Media player, Brightness, and Volume.

The user flow is: landing -> mode selection -> calibration -> image selection -> preview adjustment -> export result. Default mode asks the user to import a fully expanded Quick Panel screenshot, adjust one green rectangle around the full Controls area, and save it as the layout basis. Advanced mode adds a guided second stage where the user confirms the outer area first, turns off any supported panel missing from that region, sets the snapping grid, then goes through the enabled panel-box steps in this order: Button box, Brightness, Volume, and Media player. Advanced mode includes an editable snapping grid inside the confirmed outer area so users can fine-tune row and column counts while matching customized layouts.

After calibration, the app lets users choose a background image, pan/zoom it against a live preview of the supported Controls panels, and export square PNGs in Good Lock application order. Advanced mode exports only enabled panels. The S25+ One UI 8.5 preset remains the base template. Default mode scales that preset into the calibrated outer union, while Advanced mode starts from preset-based boxes and then lets the user fine-tune each panel.

For the exact v2 UI flow, refer to the screenshots under `flow/`.

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

## Best Practices

- DRY principle
- Extract business logic into custom hook
- Keep files small, each file under 150 lines of code

## Git Workflow

- When the user asks to stage, commit, or push changes, use the personal skill `project-git-finish` at `C:\Users\User\.codex\skills\project-git-finish\SKILL.md`
- Use commit messages in the format `action: description`

## Testing Notes

- Keep tests secondary and lightweight; prioritize high-value coverage over broad test volume
- Only write tests when the user explicitly asks for them
- Prefer tests for store/state transitions, persistence restore/save behavior, native failure branches, and critical error/fallback UI states
- Keep gesture feel, visual polish, and real Samsung/Good Lock integration as manual testing concerns
