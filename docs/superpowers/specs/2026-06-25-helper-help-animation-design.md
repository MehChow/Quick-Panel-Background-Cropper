# Helper Button First-Time Attention Design

## Goal

Improve first-time UX by making existing header helper buttons more noticeable
without forcing modal interruptions. Users who have not opened a screen's help
yet should see a subtle continuous attention animation on that screen's helper
button.

## Scope

This design covers:

- Header helper buttons that already exist on Quick Panel screens
- Persistent first-time tracking with MMKV
- Shared animation behavior and reduced-motion fallback

This design does not add:

- Mandatory onboarding popups
- New help content
- New inline tutorial flows
- Attention animation for non-header help affordances such as the advanced grid
  help button

## Product Behavior

Each screen with a header helper button has its own persistent `seen` state.

- If that screen's help has never been opened, the helper button animates.
- The animation loops continuously until the help sheet is opened once.
- Opening the help sheet marks that help entry as seen immediately.
- Once seen, that screen's helper button stays static on future visits and app
  launches unless app storage is cleared.

Per-screen tracking is required. Opening help on one screen must not suppress
the attention cue on other screens.

## Help Entry IDs

Use stable explicit ids rather than deriving keys from route names at runtime.

Initial ids:

- `select-mode`
- `default-calibration`
- `advanced-calibration-outer`
- `advanced-calibration-panel-alignment`
- `advanced-calibration-panel-review`

For advanced calibration, the cue should be tracked per help context rather than
as one shared screen-level flag. The help meaning changes across steps, so each
distinct help sheet should keep its own first-time state.

## Persistence

Persist seen state in the existing Quick Panel MMKV storage module.

- Storage key: `quick-panel.seen-help`
- Value shape: JSON object map from help id to `true`

Recommended storage helpers:

- `loadSeenHelp(): Partial<Record<HelpEntryId, true>>`
- `hasSeenHelp(helpId: HelpEntryId): boolean`
- `markHelpSeen(helpId: HelpEntryId): void`

Persistence rules:

- Invalid or missing stored data falls back to an empty map.
- Unknown keys are ignored during reads.
- Writes should merge with existing seen entries rather than replace unrelated
  ones.

## Component Ownership

The animation should live in the shared header helper button path, not in each
screen.

- Screens continue to own when a help sheet opens and closes.
- Screens pass a stable `helpId` plus the existing `onPress` handler.
- The shared header action button decides whether to render static or animated
  helper visuals for that `helpId`.

This keeps motion, persistence checks, and accessibility behavior centralized.

## Animation Spec

The helper cue should feel like guidance, not an alert.

Loop structure:

1. Brief micro-shake on the icon
2. Two soft circular wave pulses behind the button
3. Longer idle pause before repeating

Motion constraints:

- Small shake amplitude only
- No layout shift
- No hit-area change
- Warm accent colors aligned to the existing helper button palette
- Low-opacity wave pulses so the effect reads as ambient

The idle gap should be longer than the active motion window to avoid visual
fatigue.

## Accessibility

If reduced motion is enabled:

- Do not shake or pulse
- Render the helper button in a static emphasized state instead

Accessibility label, role, and tapping behavior remain unchanged.

## Integration Notes

Likely integration points based on current structure:

- MMKV helpers in `src/features/quick-panel/store/storage.ts`
- Shared helper button visuals in
  `src/features/quick-panel/shared/HeaderActionButton.tsx`
- Screen wiring in:
  - `src/features/quick-panel/select-mode/SelectModeScreen.tsx`
  - `src/features/quick-panel/calibration/default/CalibrationScreen.tsx`
  - `src/features/quick-panel/calibration/advanced/AdvancedCalibrationScreen.tsx`

Advanced calibration should map the current help-sheet context to the matching
explicit help id before rendering the header action.

## Error Handling

- Corrupt MMKV help data should fail safe to an empty seen map so the helper can
  animate again instead of silently disappearing forever.
- Missing help id means render the current static helper button behavior.

## Testing Strategy

No new tests are required by default for this change.

If tests are added later, prioritize:

- MMKV parse/load/save behavior for seen help ids
- Advanced calibration mapping from help context to help id
- Reduced-motion fallback behavior

Manual verification remains the main check for animation feel and non-intrusive
timing.

## Success Criteria

- First-time users can more easily notice the help entry point
- Returning users do not keep seeing the animation on help they already opened
- Later steps with unseen help still surface their own cue independently
- The animation feels noticeable but not error-like or distracting
