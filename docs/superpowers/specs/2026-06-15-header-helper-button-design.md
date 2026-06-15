# Header Helper Button Design

## Goal

Replace the current white question-mark header action with a help trigger that feels native to the app's dark theme and more clearly suggests opening contextual guidance for the current page.

## Design

- Introduce a reusable shared header action component for icon-only actions.
- Add two help-focused visual variants:
  - `helper-subtle`: darker, calmer, premium feel
  - `helper-balanced`: stronger border and warmer contrast for better discoverability
- Use a guidance-oriented Lucide icon instead of `circle-help`. The default help icon should suggest "open helper sheet" rather than "generic question".
- Keep the button footprint aligned with the existing back button so the header remains balanced.

## Scope

- Update the shared subpage header to use the new action component.
- Switch existing help-enabled screens to the `helper-balanced` style.
- Do not change bottom sheet content, behavior, navigation, or translations in this pass.

## Success Criteria

- The header action looks cohesive with the dark glassy UI.
- Users can more easily recognize it as a pressable control.
- The icon implies page-specific guidance rather than abstract help.
