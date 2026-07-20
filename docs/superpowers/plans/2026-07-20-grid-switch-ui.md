# Grid Switch UI Implementation Plan

**Goal:** Make the optional snapping-grid switch visually clear, consistently sized, and self-labeled without changing its public behavior.

**Architecture:** Replace the platform-native visual with a small controlled `Pressable` track/thumb component inside the existing AniUI `Switch`. Keep the existing props and accessibility contract, and render the `ON`/`OFF` label inside the thumb so every caller receives the same treatment.

**Tech Stack:** Expo SDK 56, React Native, Uniwind, Jest, React Native Testing Library.

## Global Constraints

- Keep the change scoped to `src/components/ani-ui/switch.tsx` and its focused test.
- Preserve `value`, `onValueChange`, `disabled`, `testID`, and switch accessibility behavior.
- Keep the switch height at 32px to align with the neighboring grid-help control.
- Keep the thumb inside the track with visible padding in both states.
- Do not add a dependency or change persisted calibration data.

### Task 1: Add switch behavior and state-visual tests

**Files:**
- Create: `src/components/ani-ui/__tests__/switch.test.tsx`

- [ ] Render the controlled switch and assert it exposes `accessibilityRole="switch"`, the supplied `testID`, and the correct `ON`/`OFF` label.
- [ ] Press the switch and assert `onValueChange` receives the inverted value.
- [ ] Render the disabled state and assert it cannot be pressed.
- [ ] Run `npx jest src/components/ani-ui/__tests__/switch.test.tsx --runInBand` and confirm the new expectations fail against the native-only implementation.

### Task 2: Implement the custom switch visual

**Files:**
- Modify: `src/components/ani-ui/switch.tsx`

- [ ] Replace the native switch visual with a controlled `Pressable` using a 52x32 rounded track and a 26x26 thumb inset by 3px.
- [ ] Use a high-contrast off state and an emerald on state; keep the label inside the thumb with compact uppercase text.
- [ ] Forward supported pressable props and preserve accessibility state, disabled behavior, `onValueChange`, `value`, and `testID`.
- [ ] Keep the existing color override props meaningful for track and thumb colors.
- [ ] Run the focused test and confirm it passes.

### Task 3: Verify project impact

**Files:**
- No additional files.

- [ ] Run `npm test -- --runInBand`.
- [ ] Run `npm run lint`.
- [ ] Inspect `git diff --check` and the final diff to confirm the scope is limited and no persisted-data behavior changed.
