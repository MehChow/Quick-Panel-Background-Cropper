# Drag Handle And Second Header Trim Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the two-shot custom calibration step reliably support upward overlap and remove the duplicate phone header from the second screenshot before merged custom calibration begins.

**Architecture:** Keep the current two-shot custom calibration flow and runtime-only session model, but extend it with one additional trim value for screenshot 2. Replace the current overlap seam interaction with a stable gesture-handler-based seam band, freeze the preparation canvas during drag, and feed the confirmed trimmed lower screenshot into the existing merged custom calibration surface.

**Tech Stack:** Expo 56, Expo Router, expo-image, react-native-gesture-handler, Zustand, TypeScript, i18next

---

## Branch Guard

Execute this plan on `plan/drag-handle-header-trim` or a child branch created from it. Do not run it on `main` or `master`.

## Scope Notes

- Do not reopen navigation or help-sheet work.
- Do not add auto-stitching, CV, or more than two screenshots.
- Do not redesign custom panel calibration or normalization behavior.
- Keep the one-shot custom path unchanged.

## File Structure

### Existing files to modify

- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\components\CustomCalibrationOverlapAligner.tsx`
  - replace the unstable seam interaction and add lower-screenshot top trim UI
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\custom-calibration-session.ts`
  - extend geometry helpers for trim + overlap calculations
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\hooks\useCalibrationScreen.ts`
  - store `bottomCropTopY`, confirm merged metrics from trimmed lower content, and keep one-shot behavior unchanged
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\CalibrationScreen.tsx`
  - wire the updated aligner props into the current custom alignment step
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\components\CustomCalibrationCanvas.tsx`
  - render the confirmed merged custom surface with the trimmed lower screenshot content
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\model\types.ts`
  - add `bottomCropTopY` to the runtime custom session type
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\quick-panel-defaults.ts`
  - initialize the new runtime trim field
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\quick-panel-store.ts`
  - allow partial updates to the new trim field and resets
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\quick-panel-transitions.ts`
  - keep the new trim field reset when entering and leaving calibration
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\selectors.ts`
  - expose the new trim state to the calibration hook
- `E:\Coding_things\Quick-Panel-Background-Cropper\i18next\locales\en.ts`
  - add trim/seam control copy
- `E:\Coding_things\Quick-Panel-Background-Cropper\i18next\locales\zh.ts`
  - localize the same copy
- `E:\Coding_things\Quick-Panel-Background-Cropper\README.md`
  - describe the updated two-shot custom preparation step
- `E:\Coding_things\Quick-Panel-Background-Cropper\CALIBRATION_PLAN.md`
  - document the bounded second-header trim model

### Existing tests to update or run

- `E:\Coding_things\Quick-Panel-Background-Cropper\__tests__\custom-calibration-session.test.tsx`
- `E:\Coding_things\Quick-Panel-Background-Cropper\__tests__\custom-calibration-flow.test.tsx`

## Task 1: Extend Runtime Session Geometry For Lower-Screenshot Trim

**Files:**
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\model\types.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\custom-calibration-session.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\quick-panel-defaults.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\quick-panel-store.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\quick-panel-transitions.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\selectors.ts`
- Test: `E:\Coding_things\Quick-Panel-Background-Cropper\__tests__\custom-calibration-session.test.tsx`

- [ ] **Step 1: Add the new runtime trim field**

Update the session type:

```ts
export interface CustomCalibrationSession {
  bottomCropTopY: number | null;
  bottomOffsetY: number | null;
  bottomScreenshot: PickedImage | null;
  mergedHeight: number | null;
  sourceMode: CustomCalibrationSourceMode;
  topScreenshot: PickedImage | null;
}
```

- [ ] **Step 2: Add bounded trim and merged-metric helpers**

Extend `custom-calibration-session.ts` with pure helpers:

```ts
export function clampBottomCropTopY(
  cropTopY: number,
  screenshotHeight: number,
) {
  const maxTrim = Math.min(screenshotHeight * 0.2, 240);
  return Math.max(0, Math.min(maxTrim, cropTopY));
}

export function getVisibleBottomScreenshotMetrics(
  bottomScreenshot: PickedImage,
  bottomCropTopY: number,
) {
  return {
    height: Math.max(1, bottomScreenshot.height - bottomCropTopY),
    width: bottomScreenshot.width,
  };
}
```

- [ ] **Step 3: Compute merged height from trimmed lower content**

Update merged-metric computation to use the visible lower height:

```ts
const visibleBottom = getVisibleBottomScreenshotMetrics(
  bottomScreenshot,
  bottomCropTopY,
);

return {
  height: Math.max(topScreenshot.height, bottomOffsetY + visibleBottom.height),
  width: topScreenshot.width,
};
```

- [ ] **Step 4: Reset and expose the trim field through Zustand**

Ensure session defaults and resets include:

```ts
bottomCropTopY: null,
```

and that `setCustomCalibrationSession` can update it like any other runtime field.

- [ ] **Step 5: Add focused helper tests**

Add tests for:

- `clampBottomCropTopY`
- visible lower height calculation
- merged height calculation with non-zero trim

Run: `npm test -- --runInBand __tests__/custom-calibration-session.test.tsx`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/features/quick-panel/model/types.ts src/features/quick-panel/calibration/custom-calibration-session.ts src/features/quick-panel/store/quick-panel-defaults.ts src/features/quick-panel/store/quick-panel-store.ts src/features/quick-panel/store/quick-panel-transitions.ts src/features/quick-panel/store/selectors.ts __tests__/custom-calibration-session.test.tsx
git commit -m "feat: add trimmed second-screenshot session geometry"
```

## Task 2: Replace The Current Seam With A Stable Preparation Surface

**Files:**
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\components\CustomCalibrationOverlapAligner.tsx`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\hooks\useCalibrationScreen.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\CalibrationScreen.tsx`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\i18next\locales\en.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\i18next\locales\zh.ts`

- [ ] **Step 1: Replace `PanResponder` with a gesture-handler pan seam**

Move the seam interaction to `Gesture.Pan()`:

```ts
const seamGesture = Gesture.Pan()
  .onBegin(() => {
    dragOrigin.value = effectiveOffsetY;
  })
  .onUpdate((event) => {
    const nextOffsetY = clampBottomOffsetY(
      dragOrigin.value + event.translationY / scale,
      topScreenshot.height,
      visibleBottomHeight,
    );
    runOnJS(onBottomOffsetYChange)(nextOffsetY);
  });
```

- [ ] **Step 2: Freeze the alignment canvas height during drag**

Use a stable preparation height:

```ts
const visibleBottomHeight = bottomScreenshot
  ? getVisibleBottomScreenshotMetrics(bottomScreenshot, effectiveCropTopY).height
  : 0;

const canvasHeight = topScreenshot.height + visibleBottomHeight;
```

Do not recalculate `canvasHeight` from the current overlap offset.

- [ ] **Step 3: Add a bounded top-trim control for screenshot 2**

Render screenshot 2 inside a clipped view and drive the crop from `bottomCropTopY`:

```tsx
<View
  className="absolute overflow-hidden"
  style={{
    height: visibleBottomHeight * scale,
    top: effectiveOffsetY * scale,
    width: "100%",
  }}
>
  <Image
    source={{ uri: bottomScreenshot.uri }}
    contentFit="fill"
    style={{
      height: bottomScreenshot.height * scale,
      position: "absolute",
      top: -effectiveCropTopY * scale,
      width: "100%",
    }}
  />
</View>
```

- [ ] **Step 4: Replace the small orange pill with a full-width seam band**

Render a larger hit target:

```tsx
<View className="absolute left-4 right-4 items-center" style={{ top: seamTop }}>
  <View className="w-full rounded-2xl bg-black/55 px-4 py-3">
    <View className="items-center">
      <View className="rounded-full bg-zinc-50 px-4 py-2">
        <Text className="text-xs font-semibold text-zinc-900">
          {t("calibration.dragToAlign")}
        </Text>
      </View>
    </View>
  </View>
</View>
```

- [ ] **Step 5: Add concise localized copy**

Add keys such as:

```ts
dragToAlign: "Drag to align",
trimSecondHeader: "Trim repeated phone header",
```

and matching `zh` translations.

- [ ] **Step 6: Verify the preparation step manually**

Expected:

1. upward drag persists after release
2. seam remains visible on busy screenshots
3. trim line changes the visible top of screenshot 2

- [ ] **Step 7: Commit**

```bash
git add src/features/quick-panel/calibration/components/CustomCalibrationOverlapAligner.tsx src/features/quick-panel/calibration/hooks/useCalibrationScreen.ts src/features/quick-panel/calibration/CalibrationScreen.tsx i18next/locales/en.ts i18next/locales/zh.ts
git commit -m "fix: stabilize custom overlap seam and trim repeated header"
```

## Task 3: Feed Trimmed Lower Content Into The Existing Custom Calibration Flow

**Files:**
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\hooks\useCalibrationScreen.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\components\CustomCalibrationCanvas.tsx`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\hooks\useCustomCalibrationFlow.ts`
- Test: `E:\Coding_things\Quick-Panel-Background-Cropper\__tests__\custom-calibration-flow.test.tsx`

- [ ] **Step 1: Initialize trim when screenshot 2 is imported**

When the second screenshot is accepted, seed a bounded default trim:

```ts
setCustomCalibrationSession({
  bottomCropTopY: clampBottomCropTopY(120, nextScreenshot.height),
  bottomScreenshot: nextScreenshot,
  bottomOffsetY: topScreenshot.height,
  mergedHeight: null,
});
```

- [ ] **Step 2: Confirm merged custom metrics from trimmed lower content**

Use the stored trim when the user confirms alignment:

```ts
const nextBottomCropTopY = bottomCropTopY ?? 0;
const mergedHeight = getMergedCustomScreenshotMetrics(
  topScreenshot,
  bottomScreenshot,
  nextBottomOffsetY,
  nextBottomCropTopY,
).height;
```

- [ ] **Step 3: Render the merged custom canvas with the trimmed lower block**

Mirror the clipped lower-screenshot rendering inside `CustomCalibrationCanvas.tsx` so the panel overlay sees the same merged content that was confirmed in the preparation step.

- [ ] **Step 4: Seed suggested custom panel rects from the confirmed merged height**

Keep the current suggestion flow, but use the confirmed merged screenshot height:

```ts
const mergedScreenshot = {
  ...topScreenshot,
  height: mergedHeight,
};
```

- [ ] **Step 5: Add focused tests for confirmation state**

Cover:

- merged height uses trimmed lower height
- one-shot mode remains unchanged
- two-shot confirmation preserves `bottomCropTopY`

Run: `npm test -- --runInBand __tests__/custom-calibration-flow.test.tsx`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/features/quick-panel/calibration/hooks/useCalibrationScreen.ts src/features/quick-panel/calibration/components/CustomCalibrationCanvas.tsx src/features/quick-panel/calibration/hooks/useCustomCalibrationFlow.ts __tests__/custom-calibration-flow.test.tsx
git commit -m "feat: carry trimmed lower screenshot into merged calibration"
```

## Task 4: Update Docs And Run Final Verification

**Files:**
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\README.md`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\CALIBRATION_PLAN.md`

- [ ] **Step 1: Update user-facing docs**

Document:

- the seam drag is now a full-width alignment control
- screenshot 2 trims its repeated phone header before merged calibration
- the overall flow still supports only one or two screenshots

- [ ] **Step 2: Run repo verification**

Run:

```bash
npm run lint
npm test -- --runInBand
```

Expected: commands complete without new failures caused by this slice

- [ ] **Step 3: Run final phone-focused manual checks**

Verify:

1. upward overlap can be set and kept
2. the second screenshot no longer shows a duplicated phone header after confirmation
3. one-shot custom calibration still behaves as before
4. two-shot custom calibration still reaches review and save

- [ ] **Step 4: Commit**

```bash
git add README.md CALIBRATION_PLAN.md
git commit -m "docs: describe stable overlap and second-header trim"
```

## Self-Review

- Spec coverage:
  - reliable upward seam drag is covered by Task 2
  - improved seam visibility is covered by Task 2
  - second-header trim is covered by Tasks 1 through 3
  - docs and verification are covered by Task 4
- Placeholder scan:
  - kept file paths concrete
  - kept commands explicit
  - kept trim and seam state names consistent
- Type consistency:
  - one trim field name is used consistently: `bottomCropTopY`
  - one overlap field name is used consistently: `bottomOffsetY`

## Execution Handoff

This plan is intentionally narrowed to the approved scope only: drag reliability plus duplicate-header trimming. It is ready to execute without reopening the discarded normalization redesign.
