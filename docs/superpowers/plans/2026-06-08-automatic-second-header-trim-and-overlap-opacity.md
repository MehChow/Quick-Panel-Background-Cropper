# Automatic Second Header Trim And Alignment Opacity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace manual second-header trimming with automatic runtime trim and make screenshot 2 semi-transparent during two-shot alignment, while keeping one-shot custom calibration unchanged.

**Architecture:** Reuse the existing runtime `bottomCropTopY` session field and merged-canvas geometry, but change who owns that value. Instead of a user drag control, compute a bounded automatic trim when screenshot 2 is imported, remove the crop interaction from the overlap screen, and render the lower screenshot with fixed partial opacity during alignment only. Keep the confirmed merged custom canvas and the one-shot path unchanged.

**Tech Stack:** Expo 56, Expo Router, expo-image, react-native-gesture-handler, Zustand, TypeScript, i18next

---

## Branch Guard

Execute this plan on `codex/auto-header-trim-opacity` or a child branch created from it. Do not run it on `main` or `master`.

## Scope Notes

- Do not reopen navigation or help-sheet work.
- Do not add auto-stitching, CV, or more than two screenshots.
- Do not redesign custom panel calibration or normalization behavior.
- Keep the one-shot custom path unchanged.

## File Structure

### Existing files to modify

- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\custom-calibration-session.ts`
  - add one pure automatic-trim helper and keep merged-metric helpers coherent
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\hooks\useCalibrationScreen.ts`
  - seed `bottomCropTopY` automatically when screenshot 2 is imported
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\components\CustomCalibrationOverlapAligner.tsx`
  - remove manual trim interaction and render screenshot 2 with fixed alignment opacity
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\CalibrationScreen.tsx`
  - stop passing the manual trim setter into the overlap aligner if it is no longer needed
- `E:\Coding_things\Quick-Panel-Background-Cropper\i18next\locales\en.ts`
  - remove or update trim-specific copy that becomes unused
- `E:\Coding_things\Quick-Panel-Background-Cropper\i18next\locales\zh.ts`
  - remove or update the same copy
- `E:\Coding_things\Quick-Panel-Background-Cropper\README.md`
  - document automatic second-header trim plus translucent alignment
- `E:\Coding_things\Quick-Panel-Background-Cropper\CALIBRATION_PLAN.md`
  - document the same bounded runtime model

### Existing tests to update or run

- `E:\Coding_things\Quick-Panel-Background-Cropper\__tests__\custom-calibration-session.test.tsx`
- `E:\Coding_things\Quick-Panel-Background-Cropper\__tests__\custom-calibration-flow.test.tsx` only if current interface assertions break

## Task 1: Replace Manual Trim Seeding With Automatic Runtime Trim

**Files:**
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\custom-calibration-session.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\hooks\useCalibrationScreen.ts`
- Test: `E:\Coding_things\Quick-Panel-Background-Cropper\__tests__\custom-calibration-session.test.tsx`

- [ ] **Step 1: Add a focused failing helper test**

Add assertions for:

```ts
getAutomaticBottomCropTopY({ width: 1440, height: 2993, uri: "file://image.jpg" })
```

and verify it:

- returns a deterministic value derived from width
- is clamped through the existing trim clamp
- stays inside the current allowed trim bounds

- [ ] **Step 2: Run the targeted test and verify it fails**

Run: `npm test -- --runInBand __tests__/custom-calibration-session.test.tsx`

Expected: FAIL because `getAutomaticBottomCropTopY` does not exist yet.

- [ ] **Step 3: Add the automatic trim helper**

In `custom-calibration-session.ts`, add:

```ts
export function getAutomaticBottomCropTopY(bottomScreenshot: PickedImage) {
  const estimatedTrim = Math.round(bottomScreenshot.width * 0.165);
  return clampBottomCropTopY(estimatedTrim, bottomScreenshot.height);
}
```

Do not add image analysis, file mutation, or new dependencies.

- [ ] **Step 4: Use the helper when screenshot 2 is imported**

In `useCalibrationScreen.ts`, replace the current seed:

```ts
bottomCropTopY: clampBottomCropTopY(120, nextScreenshot.height),
```

with:

```ts
bottomCropTopY: getAutomaticBottomCropTopY(nextScreenshot),
```

Keep `bottomOffsetY` and merged-height behavior unchanged.

- [ ] **Step 5: Run the targeted helper test again**

Run: `npm test -- --runInBand __tests__/custom-calibration-session.test.tsx`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/features/quick-panel/calibration/custom-calibration-session.ts src/features/quick-panel/calibration/hooks/useCalibrationScreen.ts __tests__/custom-calibration-session.test.tsx
git commit -m "feat: auto-trim second screenshot header"
```

## Task 2: Simplify The Alignment Screen To Seam-Only Control

**Files:**
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\components\CustomCalibrationOverlapAligner.tsx`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\CalibrationScreen.tsx`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\i18next\locales\en.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\i18next\locales\zh.ts`
- Test: `E:\Coding_things\Quick-Panel-Background-Cropper\__tests__\custom-calibration-flow.test.tsx` only if current prop expectations break

- [ ] **Step 1: Remove the manual crop gesture and crop UI**

Delete the crop-related pieces from `CustomCalibrationOverlapAligner.tsx`:

- `cropOriginY`
- `cropGesture`
- the trim label view
- the `onBottomCropTopYChange` prop if it becomes unused

The aligner should keep only the seam drag interaction.

- [ ] **Step 2: Add fixed lower-layer alignment opacity**

Render screenshot 2 with a moderate fixed opacity during preparation:

```tsx
<Image
  source={{ uri: bottomScreenshot.uri }}
  contentFit="fill"
  style={{
    height: bottomScreenshot.height * scale,
    left: 0,
    opacity: 0.55,
    position: "absolute",
    top: -effectiveCropTopY * scale,
    width: "100%",
  }}
/>
```

Do not apply this opacity in the confirmed merged custom calibration canvas.

- [ ] **Step 3: Keep the seam drag model unchanged**

Do not touch:

- the existing seam `Gesture.Pan()`
- upward-overlap support
- the fixed-height preparation surface

This task is about removing the extra crop interaction and improving visual overlap only.

- [ ] **Step 4: Clean up props and copy**

If `onBottomCropTopYChange` is no longer used:

- remove it from `CalibrationScreen.tsx`
- remove any now-unused translation keys such as `trimSecondHeader`

Keep `dragToAlign` or equivalent seam copy.

- [ ] **Step 5: Run targeted tests only if interface changes require it**

Run if needed: `npm test -- --runInBand __tests__/custom-calibration-flow.test.tsx`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/features/quick-panel/calibration/components/CustomCalibrationOverlapAligner.tsx src/features/quick-panel/calibration/CalibrationScreen.tsx i18next/locales/en.ts i18next/locales/zh.ts __tests__/custom-calibration-flow.test.tsx
git commit -m "fix: simplify two-shot alignment surface"
```

## Task 3: Update Docs And Run Final Verification

**Files:**
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\README.md`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\CALIBRATION_PLAN.md`

- [ ] **Step 1: Update the user-facing docs**

Document that:

- screenshot 2 is trimmed automatically at import time
- the user no longer chooses the second-header crop
- screenshot 2 is semi-transparent during alignment only
- one-shot custom calibration is unchanged

- [ ] **Step 2: Run repository verification**

Run:

```bash
npm run lint
npm test -- --runInBand
```

Expected:

- lint passes
- tests pass

- [ ] **Step 3: Manually verify on device**

Check:

1. screenshot 2 imports with no visible manual trim control
2. repeated phone header is trimmed out before merged calibration
3. screenshot 2 opacity makes overlap easier to judge
4. upward seam drag still persists after release
5. one-shot custom calibration still behaves as before

- [ ] **Step 4: Commit**

```bash
git add README.md CALIBRATION_PLAN.md
git commit -m "docs: describe automatic trim and overlap opacity"
```

## Notes

- Do not add image-analysis libraries or bitmap processing in this slice.
- If the width-derived heuristic proves wrong on-device, adjust the ratio or clamp only after evidence from real screenshots.
- Do not broaden this into automatic overlap detection.
