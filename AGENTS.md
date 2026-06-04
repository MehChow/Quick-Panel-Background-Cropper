# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## App brief

Quick Panel Exporter is an Expo app for creating Samsung Good Lock Quick Panel background PNGs from one user-selected image. Users calibrate once by importing a fully expanded Quick Panel screenshot, adjusting one green rectangle around the customizable panel stack, and saving that geometry for future exports.

The app then lets users choose a background image, pan/zoom it against a preview of the calibrated Button box, Brightness, Volume, and Media player panels, and export square PNGs in the Good Lock application order. The S25+ One UI 8.5 preset remains the base template; calibration scales that template into the user's screenshot-derived panel union.

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
- Prevent using `useMemo, useCallback, React.memo` as it is handled by React Complier

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

## Testing Notes

- Keep tests secondary and lightweight; prioritize high-value coverage over broad test volume
- Only write tests when the user explicitly asks for them
- Prefer tests for store/state transitions, persistence restore/save behavior, native failure branches, and critical error/fallback UI states
- Keep gesture feel, visual polish, and real Samsung/Good Lock integration as manual testing concerns
