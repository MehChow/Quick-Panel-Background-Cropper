# Customize Pinch Flash Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` and execute inline in the current checkout.

**Goal:** Prevent the Customize preview image from jumping to a stale transform when a two-finger pinch begins.

**Architecture:** Keep the existing simultaneous native pan and pinch recognizers, but give pinch exclusive ownership of transform updates while it is active. Move pan to incremental deltas and calculate pinch placement from the transform and focal point captured when pinch actually activates.

**Tech Stack:** Expo 56, React Native Gesture Handler 2.31, Reanimated 4, Jest, TypeScript

## Global Constraints

- Preserve one-finger pan, two-finger drag, focal zoom, clamping, and the final Zustand transform commit.
- Do not reset persisted app data or add dependencies.
- Do not use memo hooks or commit/push changes.

---

### Task 1: Reproduce the pan-to-pinch reset

**Files:**
- Create: `__tests__/quick-panel-preview-gestures.test.tsx`
- Modify: `src/features/quick-panel/customize/worklets/gesture-worklets.ts`
- Modify: `src/features/quick-panel/customize/hooks/useQuickPanelPreviewGestures.ts`

**Interfaces:**
- Consumes: `ImageTransform`, `clampTransformWorklet`, RNGH pan/pinch events.
- Produces: `getPinchTransformWorklet(...)`, used by the gesture hook and pure geometry tests.

- [x] **Step 1: Write the failing test**

Mock the gesture builders, render `useQuickPanelPreviewGestures`, move with pan, then activate pinch with `scale: 1`. Assert the first pinch update retains the moved transform. Add a second assertion that moving the pinch focal point at constant scale translates the image continuously.

- [x] **Step 2: Verify the red phase**

Run: `npm test -- --runInBand __tests__/quick-panel-preview-gestures.test.tsx`

Expected: the first pinch update restores the stale starting transform instead of retaining the pan result.

- [x] **Step 3: Implement the minimal fix**

Add a pure focal-transform worklet using:

```ts
x = focalX - (startFocalX - startTransform.x) * scaleRatio;
y = focalY - (startFocalY - startTransform.y) * scaleRatio;
```

Capture pinch transform/focal values in `onStart`, set an `isPinching` shared value, ignore pan updates while pinch owns the transform, and apply pan `changeX`/`changeY` incrementally outside pinch.

- [x] **Step 4: Verify the green phase**

Run: `npm test -- --runInBand __tests__/quick-panel-preview-gestures.test.tsx`

Expected: all gesture regression tests pass.

- [x] **Step 5: Verify the repository**

Run `npm test -- --runInBand`, `npx tsc --noEmit`, `npm run lint`, and `git diff --check`. Review the final diff for unrelated changes and keep manual Android QA as the final gesture-feel check.
