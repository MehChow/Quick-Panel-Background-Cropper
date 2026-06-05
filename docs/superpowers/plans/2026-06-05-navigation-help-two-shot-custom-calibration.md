# Navigation, Help, And Two-Screenshot Custom Calibration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the repeated landing-screen back-stack issue, make calibration help mode-specific without changing its layout, and add an optional two-screenshot custom calibration path with manual overlap alignment.

**Architecture:** Keep the existing landing, calibration, and custom-panel flows intact where possible. Use Expo Router SDK 56 stack dismissal for navigation cleanup, derive help content from `calibrationMode`, and introduce a runtime-only composite screenshot session for custom calibration so tall layouts can be calibrated without real stitching.

**Tech Stack:** Expo 56, Expo Router, expo-image, Zustand, react-native-gesture-handler, TypeScript, i18next

---

## Branch Guard

Execute this plan on `plan/navigation-help-two-shot-calibration` or a child branch created from it. Do not run it on `main` or `master`.

## Scope Notes

- Do not redesign the landing UI or the help-sheet layout.
- Do not add auto-alignment, CV, or 3+ screenshot support.
- Do not add broad new test files unless implementation exposes a gap that cannot be covered by focused updates to existing tests.
- Keep changes surgical around the current calibration flow and dual-mode product model.

## File Structure

### Existing files to modify

- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\home\LandingScreen.tsx`
  - switch route entry to root-friendly navigation methods
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\hooks\useCalibrationScreen.ts`
  - dismiss calibration completion back to landing and orchestrate one-shot versus two-shot custom session flow
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\CalibrationScreen.tsx`
  - insert the optional overlap-alignment step before the panel-by-panel custom wizard
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\CalibrationHelpSheet.tsx`
  - derive help text and image from selected mode
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\CalibrationInstructionCard.tsx`
  - accept a mode-specific image source instead of always using the default illustration
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\components\CustomCalibrationCanvas.tsx`
  - render either one screenshot or a merged two-screenshot canvas
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\components\CustomCalibrationStepper.tsx`
  - expose the one-shot versus two-shot entry choice and the alignment continue action without changing the overall card pattern
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\hooks\useCustomCalibrationFlow.ts`
  - seed suggested panel rects against the merged custom canvas size instead of assuming one screenshot only
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\quick-panel-defaults.ts`
  - initialize transient custom calibration session state
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\quick-panel-store.ts`
  - add setters for custom-session screenshots, alignment offset, and mode-specific help state if needed
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\quick-panel-transitions.ts`
  - reset runtime-only custom screenshot session fields correctly when entering and leaving calibration
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\selectors.ts`
  - expose the custom-session state to calibration hooks
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\model\types.ts`
  - add composite screenshot session types used by custom calibration
- `E:\Coding_things\Quick-Panel-Background-Cropper\i18next\locales\en.ts`
  - add navigation/help/two-shot copy
- `E:\Coding_things\Quick-Panel-Background-Cropper\i18next\locales\zh.ts`
  - localize the same copy
- `E:\Coding_things\Quick-Panel-Background-Cropper\README.md`
  - document mode-specific help and optional two-screenshot custom calibration
- `E:\Coding_things\Quick-Panel-Background-Cropper\CALIBRATION_PLAN.md`
  - document the bounded two-screenshot composite-calibration model

### New files to create

- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\custom-calibration-session.ts`
  - pure helpers for merged canvas dimensions, screenshot validation, and local-to-merged coordinate math
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\components\CustomCalibrationOverlapAligner.tsx`
  - alignment UI for the second screenshot with a draggable vertical overlap handle
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\calibration-help-content.ts`
  - mode-to-copy and mode-to-image mapping so the sheet layout stays unchanged

### Existing tests to run

- `E:\Coding_things\Quick-Panel-Background-Cropper\__tests__\storage.test.ts`
- `E:\Coding_things\Quick-Panel-Background-Cropper\__tests__\quick-panel-transitions.test.ts`
- `E:\Coding_things\Quick-Panel-Background-Cropper\__tests__\customize-screen.test.tsx`

## Task 1: Normalize Navigation Back To One Landing Root

**Files:**
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\home\LandingScreen.tsx`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\hooks\useCalibrationScreen.ts`

- [ ] **Step 1: Replace landing route entry methods that always push**

Update landing actions so they prefer root-friendly navigation:

```ts
const openCalibration = () => {
  goToCalibration();
  router.navigate("/calibration");
};

const openCustomize = () => {
  if (startCustomizing()) {
    router.navigate("/customize");
    return;
  }
  router.navigate("/calibration");
};
```

- [ ] **Step 2: Replace calibration completion replacement with dismissal to landing**

Update both successful calibration save paths to use Expo Router SDK 56 dismissal:

```ts
if (isCustomMode) {
  acceptCalibrationProfile(customCalibrationDraft);
  router.dismissTo("/");
  return;
}

if (acceptCalibration()) {
  router.dismissTo("/");
}
```

- [ ] **Step 3: Run focused lint on the touched files**

Run: `npx eslint src/features/quick-panel/home/LandingScreen.tsx src/features/quick-panel/calibration/hooks/useCalibrationScreen.ts`

Expected: no errors

- [ ] **Step 4: Manually verify the back-stack behavior**

Run the app, then verify:

1. Open calibration from landing.
2. Save calibration.
3. Open customize.
4. Press back once.

Expected: one landing screen only, not repeated landing entries.

- [ ] **Step 5: Commit**

```bash
git add src/features/quick-panel/home/LandingScreen.tsx src/features/quick-panel/calibration/hooks/useCalibrationScreen.ts
git commit -m "fix: normalize landing navigation stack"
```

## Task 2: Keep The Help Sheet Layout And Make Its Content Mode-Specific

**Files:**
- Create: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\calibration-help-content.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\CalibrationHelpSheet.tsx`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\CalibrationInstructionCard.tsx`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\i18next\locales\en.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\i18next\locales\zh.ts`

- [ ] **Step 1: Add dedicated translation keys for default and custom help**

Define separate instruction strings:

```ts
defaultInstruction:
  "Drag any edge or corner to resize the green box around the whole customizable control panel.",
customInstruction:
  "Import a fully expanded Quick Panel screenshot, then place a green box on each supported panel one by one or mark it hidden.",
```

Add matching localized keys in `zh.ts`.

- [ ] **Step 2: Create a mode-to-help-content helper**

Create a small helper with one mapping per mode:

```ts
export interface CalibrationHelpContent {
  imageSource: number;
  instructionKey: string;
}

export const calibrationHelpContentByMode = {
  "custom-panels": {
    imageSource: require("@/assets/calibrate_customized.jpg"),
    instructionKey: "calibration.customInstruction",
  },
  "default-union": {
    imageSource: require("@/assets/calibrate.jpeg"),
    instructionKey: "calibration.defaultInstruction",
  },
} satisfies Record<CalibrationMode, CalibrationHelpContent>;
```

- [ ] **Step 3: Keep the current sheet shell and swap only the content**

Pass `calibrationMode` into the sheet content and keep the existing layout:

```tsx
const content = calibrationHelpContentByMode[calibrationMode];

<Text className="mb-4 text-sm font-medium leading-6 text-zinc-300">
  {t(content.instructionKey)}
</Text>
<CalibrationInstructionCard imageSource={content.imageSource} />
```

- [ ] **Step 4: Manually verify both modes**

Expected:

1. `Default layout` help still shows one-box guidance and the original image.
2. `Custom layout` help shows per-panel guidance and `assets/calibrate_customized.jpg`.
3. The bottom-sheet layout and spacing remain unchanged.

- [ ] **Step 5: Commit**

```bash
git add src/features/quick-panel/calibration/calibration-help-content.ts src/features/quick-panel/calibration/CalibrationHelpSheet.tsx src/features/quick-panel/calibration/CalibrationInstructionCard.tsx i18next/locales/en.ts i18next/locales/zh.ts
git commit -m "feat: split calibration help by mode"
```

## Task 3: Add A Runtime-Only Two-Screenshot Custom Calibration Session

**Files:**
- Create: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\custom-calibration-session.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\model\types.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\quick-panel-defaults.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\quick-panel-store.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\quick-panel-transitions.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\selectors.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\hooks\useCalibrationScreen.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\i18next\locales\en.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\i18next\locales\zh.ts`

- [ ] **Step 1: Add bounded two-shot session types**

Introduce explicit runtime-only session types:

```ts
export type CustomCalibrationSourceMode = "single" | "double";

export interface CustomCalibrationSession {
  bottomOffsetY: number | null;
  bottomScreenshot: PickedImage | null;
  mergedHeight: number | null;
  sourceMode: CustomCalibrationSourceMode;
  topScreenshot: PickedImage | null;
}
```

- [ ] **Step 2: Add pure helpers for validation and merged geometry**

Create helpers such as:

```ts
export function canUseAsSecondCustomScreenshot(
  top: PickedImage,
  bottom: PickedImage,
) {
  return top.width === bottom.width && top.height >= top.width && bottom.height >= bottom.width;
}

export function getMergedCustomScreenshotMetrics(
  top: PickedImage,
  bottom: PickedImage,
  bottomOffsetY: number,
) {
  return {
    height: Math.max(top.height, bottomOffsetY + bottom.height),
    width: top.width,
  };
}
```

- [ ] **Step 3: Store and reset session state without persisting it**

Add transient setters such as:

```ts
setCustomCalibrationSession: (session: Partial<CustomCalibrationSession>) => void;
resetCustomCalibrationSession: () => void;
```

Reset them when entering calibration, changing calibration mode, or leaving a completed calibration flow.

- [ ] **Step 4: Add user-facing copy for the two-shot entry choice**

Add concise strings for:

- continue with one screenshot
- add second screenshot
- align overlap
- second screenshot size mismatch

- [ ] **Step 5: Run focused verification**

Run: `npx eslint src/features/quick-panel/calibration/custom-calibration-session.ts src/features/quick-panel/store/quick-panel-defaults.ts src/features/quick-panel/store/quick-panel-store.ts src/features/quick-panel/store/quick-panel-transitions.ts src/features/quick-panel/store/selectors.ts src/features/quick-panel/calibration/hooks/useCalibrationScreen.ts`

Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add src/features/quick-panel/calibration/custom-calibration-session.ts src/features/quick-panel/model/types.ts src/features/quick-panel/store/quick-panel-defaults.ts src/features/quick-panel/store/quick-panel-store.ts src/features/quick-panel/store/quick-panel-transitions.ts src/features/quick-panel/store/selectors.ts src/features/quick-panel/calibration/hooks/useCalibrationScreen.ts i18next/locales/en.ts i18next/locales/zh.ts
git commit -m "feat: add custom calibration two-shot session state"
```

## Task 4: Build Manual Overlap Alignment And Feed The Existing Custom Wizard

**Files:**
- Create: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\components\CustomCalibrationOverlapAligner.tsx`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\CalibrationScreen.tsx`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\components\CustomCalibrationCanvas.tsx`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\components\CustomCalibrationStepper.tsx`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\hooks\useCustomCalibrationFlow.ts`

- [ ] **Step 1: Add a simple overlap aligner with vertical drag only**

The component should render:

```tsx
<View>
  <Image source={{ uri: topScreenshot.uri }} />
  <Animated.View style={{ top: bottomOffsetY * scale }}>
    <Image source={{ uri: bottomScreenshot.uri }} />
  </Animated.View>
  <View className="absolute ..." />
</View>
```

The drag handle updates only `bottomOffsetY`.

- [ ] **Step 2: Insert the two-shot alignment step before panel calibration**

Update the custom-mode branch in `CalibrationScreen.tsx` to choose between:

- import prompt
- overlap alignment
- panel-by-panel calibration
- review

Expected control flow:

```ts
if (!topScreenshot) { ... }
else if (sourceMode === "double" && !isAlignmentConfirmed) { ... }
else if (isCustomCalibrationReview) { ... }
else { ...panel calibration... }
```

- [ ] **Step 3: Make the custom calibration canvas understand merged geometry**

When a second screenshot exists, render both images in one absolute-positioned canvas and keep the existing green-box overlay operating in merged coordinates.

- [ ] **Step 4: Seed suggested panel rects against the merged height**

Update the suggested custom-profile seeding logic so it uses merged canvas metrics:

```ts
const mergedScreenshot = {
  height: mergedHeight,
  uri: topScreenshot.uri,
  width: topScreenshot.width,
};
```

The seed still comes from the S25+ reference logic; only the calibration surface size changes.

- [ ] **Step 5: Manually verify both custom paths**

Expected:

1. One-shot custom calibration still reaches the existing stepper directly.
2. Two-shot custom calibration requires overlap confirmation before the stepper.
3. A panel box can be drawn in the lower screenshot area and stays aligned visually.

- [ ] **Step 6: Commit**

```bash
git add src/features/quick-panel/calibration/components/CustomCalibrationOverlapAligner.tsx src/features/quick-panel/calibration/CalibrationScreen.tsx src/features/quick-panel/calibration/components/CustomCalibrationCanvas.tsx src/features/quick-panel/calibration/components/CustomCalibrationStepper.tsx src/features/quick-panel/calibration/hooks/useCustomCalibrationFlow.ts
git commit -m "feat: add manual overlap alignment for tall custom layouts"
```

## Task 5: Update Docs And Run Repo Verification

**Files:**
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\README.md`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\CALIBRATION_PLAN.md`

- [ ] **Step 1: Update user-facing docs**

Document:

- landing navigation now returns to one root
- help content differs by calibration mode
- custom layout can use one screenshot or two manually aligned screenshots
- maximum supported screenshot count is two

- [ ] **Step 2: Run repo verification commands**

Run:

```bash
npm run lint
npm test -- --runInBand
```

Expected: commands complete without new failures caused by this slice

- [ ] **Step 3: Run final manual calibration checks**

Verify:

1. repeated landing screens no longer occur
2. custom help uses the new image
3. two-shot custom calibration can reach review and save
4. existing one-shot custom calibration still works

- [ ] **Step 4: Commit**

```bash
git add README.md CALIBRATION_PLAN.md
git commit -m "docs: describe navigation and two-shot calibration flow"
```

## Self-Review

- Spec coverage:
  - navigation cleanup is covered by Task 1
  - mode-specific help is covered by Task 2
  - bounded two-shot custom calibration is covered by Tasks 3 and 4
  - docs and verification are covered by Task 5
- Placeholder scan:
  - removed `TBD`-style placeholders
  - kept file paths concrete
  - kept verification commands explicit
- Type consistency:
  - one runtime session type name is used consistently: `CustomCalibrationSession`
  - one bounded source-mode type name is used consistently: `CustomCalibrationSourceMode`

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-05-navigation-help-two-shot-custom-calibration.md`. Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints
