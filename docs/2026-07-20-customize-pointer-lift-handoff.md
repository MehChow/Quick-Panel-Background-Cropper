# Customize Pointer-Lift Gesture Handoff

## Goal

Finish the Customize image gesture fix so lifting one finger after a two-finger
drag/zoom leaves the image in exactly the same visual position. One-finger pan,
two-finger drag, focal zoom, clamping, and smooth return to one-finger pan must
continue working.

## Read first

1. `AGENTS.md`
2. `docs/superpowers/plans/2026-07-20-customize-pinch-flash-fix.md`
3. `src/features/quick-panel/customize/hooks/useQuickPanelPreviewGestures.ts`
4. `src/features/quick-panel/customize/worklets/gesture-worklets.ts`
5. `__tests__/quick-panel-preview-gestures.test.tsx`

Review the two user recordings:

- Original pinch-start flash:
  `/Users/mac/Downloads/WhatsApp Video 2026-07-17 at 18.09.21.mp4`
- New two-finger-to-one-finger shift:
  `/Users/mac/Downloads/WhatsApp Video 2026-07-20 at 10.39.39.mp4`

## Current working tree

The first fix is implemented but intentionally uncommitted. Preserve these
changes; do not reset or recreate them:

- Modified:
  `src/features/quick-panel/customize/hooks/useQuickPanelPreviewGestures.ts`
- Modified:
  `src/features/quick-panel/customize/worklets/gesture-worklets.ts`
- Added: `__tests__/quick-panel-preview-gestures.test.tsx`
- Added:
  `docs/superpowers/plans/2026-07-20-customize-pinch-flash-fix.md`

That fix removed the old pinch-start flash by capturing transform/focal state
when pinch activates, letting pinch own transform updates while active, and
using incremental pan changes. Before the new device report, verification
passed with 41 Jest suites / 142 tests, TypeScript, Expo lint, and
`git diff --check`.

## Confirmed follow-up root cause

The new video shows one persistent crop jump at about 3.9 seconds. It is not an
image reload or scale reset.

On Android, lifting one of two fingers produces `ACTION_POINTER_UP`. RNGH's
pinch handler:

1. Remains active because it ends only on final `ACTION_UP`.
2. Recomputes its focal point after excluding the lifted pointer, changing the
   focal point from the two-finger midpoint to the remaining finger.
3. Dispatches a final active pinch update with that changed focal point.

The app's pinch `onUpdate` treats every focal change as two-finger translation,
so this pointer-removal update shifts the image by roughly the focal-point
jump. `isPinching` has not finalized yet.

Exact installed-library evidence:

- `node_modules/react-native-gesture-handler/android/src/main/java/com/swmansion/gesturehandler/core/PinchGestureHandler.kt`
  updates the focal point for every touch event and ends only on `ACTION_UP`.
- `node_modules/react-native-gesture-handler/android/src/main/java/com/swmansion/gesturehandler/core/GestureHandlerOrchestrator.kt`
  dispatches `onTouchesUp` before the handler processes and emits its trailing
  update.
- `node_modules/react-native-gesture-handler/android/src/main/java/com/swmansion/gesturehandler/core/GestureHandler.kt`
  reduces `numberOfTouches` before dispatching the touch-up callback.

The existing test at the end of
`__tests__/quick-panel-preview-gestures.test.tsx` directly calls
`pinch.onFinalize()` before resuming pan. That does not reproduce Android's
real `onTouchesUp -> trailing pinch onUpdate` sequence, which is why the issue
escaped coverage.

## Required implementation sequence

Use systematic debugging and TDD. Read the exact Expo 56 docs before editing.
Work inline only; do not commit, push, use subagents, or add dependencies.

1. Extend the gesture mock with `onTouchesUp` and a typed touch event containing
   `numberOfTouches`.
2. Add a failing regression that performs a valid two-finger zoom, records the
   transform, calls `onTouchesUp({ numberOfTouches: 1 })`, then emits a pinch
   update whose focal point jumps to the remaining finger. The transform must
   stay byte-for-byte equal to the recorded value.
3. In the same test, emit a later one-finger pan delta and assert that only that
   real delta moves the image. The pointer-up transition itself must contribute
   zero movement.
4. Implement the narrow ownership transition in
   `useQuickPanelPreviewGestures.ts`: use `onTouchesUp` to freeze pinch before
   the trailing Android update, ignore that invalid pinch update, and release
   ownership so pan resumes from the frozen transform.
5. Cover adding a second finger again without first lifting the remaining
   finger. Either rebase the existing pinch handler to the current transform
   and focal point before accepting new zoom updates, or require a full release
   only if device behavior proves rebasing unsafe. Do not allow another jump.
6. Keep `getPinchTransformWorklet` and all clamp/export geometry unchanged
   unless the new red test proves the pure math itself is wrong; current
   evidence says the invalid pointer-removal event is the problem.

## Verification

Run:

```bash
npm test -- --runInBand __tests__/quick-panel-preview-gestures.test.tsx
npm test -- --runInBand
npx tsc --noEmit
npm run lint
git diff --check
```

Then verify on the user's Android device:

1. Pan with one finger.
2. Add a second finger and drag without changing scale.
3. Zoom around several focal points.
4. Lift either finger while the other stays still; the image must not move.
5. Continue panning with the remaining finger; movement must start from the
   frozen position without a pause or jump.
6. Add the second finger again and repeat zoom/lift.
7. Fully release, start a fresh pan/pinch, reset position, and export once to
   confirm final transform persistence and output remain unchanged.

Suggested commit message for the user to run:

`fix: keep image stable when pinch pointer lifts`
