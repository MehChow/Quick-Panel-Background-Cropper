# Three-Stop Snap Sensitivity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:executing-plans` to implement this plan inline, task-by-task.
> Steps use checkbox (`- [ ]`) syntax for tracking. Project instructions prohibit
> subagents, staging, commits, and pushes.

**Goal:** Add a persisted three-position Low/Balanced/Strong slider that changes
the live snapping capture and release strength for every editable Advanced panel
without changing saved calibration geometry.

**Architecture:** Define snap sensitivity as a small typed domain preference and
persist it independently in MMKV. Keep snap destinations and `AdvancedSnapGrid`
unchanged, but calculate capture/release thresholds in screen points and pass the
selected multiplier through the existing shared canvas, panel, and Reanimated
gesture path. Render one compact three-stop control only during panel-editing
phases in Controls-only, Buttons-only, and Combined.

**Tech Stack:** Expo 56, React Native 0.85, React 19.2.3, TypeScript, MMKV,
Reanimated/Worklets, React Native Gesture Handler, Jest, React Native Testing
Library, i18next, Uniwind, AniUI.

## Global Constraints

- Work inline only; do not use or suggest subagents.
- Do not stage, commit, or push.
- Read the exact [Expo SDK 56 documentation](https://docs.expo.dev/versions/v56.0.0/)
  before production-code edits.
- Do not add dependencies or replace the shared AniUI `Slider`.
- Do not add `useMemo`, `useCallback`, or `React.memo` outside
  `src/components/ani-ui`.
- Use explicit TypeScript interfaces and typed unions; do not use `any`.
- The only values are `low`, `balanced`, and `strong`; there is no Off or
  intermediate persisted value.
- Multipliers are exactly Low `0.5x`, Balanced `1x`, and Strong `1.5x`.
- Missing or invalid stored data resolves to Balanced.
- Persist one global `quick-panel.snap-sensitivity` preference immediately when
  it changes; do not tie it to calibration confirmation.
- Do not add sensitivity to `AdvancedSnapGrid`, calibration drafts, saved
  Controls/Buttons/Combined calibrations, preview models, or export models.
- Keep grid lines, snap candidates, gap offsets, snap keys, haptics, outer-area
  clamping, and Combined overlap validation unchanged.
- Do not expand the shared Slider's screen-reader behavior.
- Leave physical-device QA to the user.

---

### Task 1: Add the Typed Global Sensitivity Preference

**Files:**

- Create: `src/features/quick-panel/model/snap-sensitivity.ts`
- Modify: `src/features/quick-panel/store/storage.ts:1-180`
- Create: `__tests__/snap-sensitivity.test.ts`
- Modify: `__tests__/storage.test.ts:1-430`

**Interfaces:**

- Consumes: the existing MMKV instance and `useMMKVString` pattern in
  `storage.ts`.
- Produces:
  - `type SnapSensitivity = "low" | "balanced" | "strong"`
  - `snapSensitivityValues: readonly SnapSensitivity[]`
  - `defaultSnapSensitivity: "balanced"`
  - `normalizeSnapSensitivity(value: unknown): SnapSensitivity`
  - `getSnapSensitivityMultiplier(value: SnapSensitivity): number`
  - `getSnapSensitivitySliderValue(value: SnapSensitivity): number`
  - `getSnapSensitivityFromSliderValue(value: number): SnapSensitivity`
  - `loadSnapSensitivity(): SnapSensitivity`
  - `saveSnapSensitivity(value: SnapSensitivity): void`
  - `useSnapSensitivityPreference(): { snapSensitivity: SnapSensitivity; setSnapSensitivity: (value: SnapSensitivity) => void }`

- [ ] **Step 1: Write the failing typed-model tests**

Create `__tests__/snap-sensitivity.test.ts`:

```ts
import {
  defaultSnapSensitivity,
  getSnapSensitivityFromSliderValue,
  getSnapSensitivityMultiplier,
  getSnapSensitivitySliderValue,
  normalizeSnapSensitivity,
  snapSensitivityValues,
} from "@/features/quick-panel/model/snap-sensitivity";

describe("snap sensitivity", () => {
  it("defines exactly three ordered positions with Balanced in the middle", () => {
    expect(snapSensitivityValues).toEqual(["low", "balanced", "strong"]);
    expect(defaultSnapSensitivity).toBe("balanced");
    expect(getSnapSensitivitySliderValue("low")).toBe(0);
    expect(getSnapSensitivitySliderValue("balanced")).toBe(1);
    expect(getSnapSensitivitySliderValue("strong")).toBe(2);
  });

  it("maps slider input to the nearest fixed position", () => {
    expect(getSnapSensitivityFromSliderValue(0.1)).toBe("low");
    expect(getSnapSensitivityFromSliderValue(0.8)).toBe("balanced");
    expect(getSnapSensitivityFromSliderValue(1.9)).toBe("strong");
  });

  it("uses the approved multipliers", () => {
    expect(getSnapSensitivityMultiplier("low")).toBe(0.5);
    expect(getSnapSensitivityMultiplier("balanced")).toBe(1);
    expect(getSnapSensitivityMultiplier("strong")).toBe(1.5);
  });

  it.each([undefined, null, "", "off", 1, {}])(
    "normalizes invalid value %p to Balanced",
    (value) => {
      expect(normalizeSnapSensitivity(value)).toBe("balanced");
    },
  );
});
```

- [ ] **Step 2: Run the model test and verify it fails**

Run:

```bash
npm test -- --runInBand --no-cache __tests__/snap-sensitivity.test.ts
```

Expected: FAIL because `model/snap-sensitivity.ts` does not exist.

- [ ] **Step 3: Implement the typed model and three-stop mapping**

Create `src/features/quick-panel/model/snap-sensitivity.ts` with the exact
ordered values and mappings:

```ts
export const snapSensitivityValues = [
  "low",
  "balanced",
  "strong",
] as const;

export type SnapSensitivity = (typeof snapSensitivityValues)[number];
export const defaultSnapSensitivity: SnapSensitivity = "balanced";

export function normalizeSnapSensitivity(value: unknown): SnapSensitivity {
  return snapSensitivityValues.includes(value as SnapSensitivity)
    ? value as SnapSensitivity
    : defaultSnapSensitivity;
}

export function getSnapSensitivityMultiplier(value: SnapSensitivity) {
  "worklet";
  return value === "low" ? 0.5 : value === "strong" ? 1.5 : 1;
}

export function getSnapSensitivitySliderValue(value: SnapSensitivity) {
  return snapSensitivityValues.indexOf(value);
}

export function getSnapSensitivityFromSliderValue(value: number) {
  const index = Math.max(0, Math.min(2, Math.round(value)));
  if (index === 0) return "low";
  if (index === 2) return "strong";
  return "balanced";
}
```

Use the worklet-safe conditional inside `getSnapSensitivityMultiplier`; do not
index a runtime object from the worklet.

- [ ] **Step 4: Run the model test and verify it passes**

Run the Step 2 command.

Expected: PASS.

- [ ] **Step 5: Add failing storage fallback and independence tests**

In `__tests__/storage.test.ts`, import `loadSnapSensitivity` and
`saveSnapSensitivity`. Add:

```ts
it.each([undefined, "", "off", "medium", "2"])(
  "normalizes snap sensitivity %p to Balanced",
  (value) => {
    const mmkvStore = (globalThis as typeof globalThis & MmkvTestGlobal)
      .__mmkvStore;
    if (value === undefined) {
      mmkvStore?.delete("quick-panel.snap-sensitivity");
    } else {
      mmkvStore?.set("quick-panel.snap-sensitivity", value);
    }

    expect(loadSnapSensitivity()).toBe("balanced");
  },
);

it.each(["low", "balanced", "strong"] as const)(
  "round-trips global snap sensitivity %s independently",
  (value) => {
    saveSnapSensitivity(value);

    expect(loadSnapSensitivity()).toBe(value);
    expect(loadCalibrations()).toEqual({
      default: null,
      advancedControls: null,
      advancedButtons: null,
      advancedCombined: null,
    });
  },
);
```

- [ ] **Step 6: Run the storage test and verify it fails**

Run:

```bash
npm test -- --runInBand --no-cache __tests__/storage.test.ts
```

Expected: FAIL because the new storage functions are not exported.

- [ ] **Step 7: Implement the dedicated MMKV key and reactive preference hook**

In `storage.ts`, import the sensitivity type and normalizer, define:

```ts
const snapSensitivityKey = "quick-panel.snap-sensitivity";
```

Add these exports beside the other independent preferences:

```ts
export function loadSnapSensitivity(): SnapSensitivity {
  return normalizeSnapSensitivity(storage.getString(snapSensitivityKey));
}

export function saveSnapSensitivity(value: SnapSensitivity) {
  storage.set(snapSensitivityKey, value);
}

export function useSnapSensitivityPreference() {
  const [savedValue, setSavedValue] = useMMKVString(
    snapSensitivityKey,
    storage,
  );
  const snapSensitivity = normalizeSnapSensitivity(savedValue);
  const setSnapSensitivity = (value: SnapSensitivity) => {
    setSavedValue(value);
  };

  return { snapSensitivity, setSnapSensitivity };
}
```

Do not put this value into `SavedCalibrations`, `QuickPanelStateData`, Zustand,
or the calibration parser.

- [ ] **Step 8: Run the Task 1 focused tests**

Run:

```bash
npm test -- --runInBand --no-cache \
  __tests__/snap-sensitivity.test.ts \
  __tests__/storage.test.ts
```

Expected: both suites PASS.

Do not stage or commit.

---

### Task 2: Make Snap Thresholds Scale-Consistent and Sensitivity-Aware

**Files:**

- Modify: `src/features/quick-panel/calibration/advanced/advanced-snap-axis.ts:1-155`
- Create: `__tests__/advanced-snap-axis.test.ts`

**Interfaces:**

- Consumes: `SnapSensitivity` and
  `getSnapSensitivityMultiplier()` from Task 1.
- Produces:
  - `interface SnapAxisOptions { scale: number; sensitivity: SnapSensitivity }`
  - `createSnapAxis(start, length, segments, options?): SnapAxis`
  - Balanced/default behavior for callers that do not pass options
  - screen-normalized capture/release thresholds stored in calibration units

- [ ] **Step 1: Write failing threshold-order and scale-normalization tests**

Create `__tests__/advanced-snap-axis.test.ts`:

```ts
import { createSnapAxis } from "@/features/quick-panel/calibration/advanced/advanced-snap-axis";

describe("advanced snap axis sensitivity", () => {
  it("increases capture and release thresholds from Low to Strong", () => {
    const low = createSnapAxis(0, 400, 4, {
      scale: 1,
      sensitivity: "low",
    });
    const balanced = createSnapAxis(0, 400, 4, {
      scale: 1,
      sensitivity: "balanced",
    });
    const strong = createSnapAxis(0, 400, 4, {
      scale: 1,
      sensitivity: "strong",
    });

    expect(low.captureThreshold).toBe(10);
    expect(balanced.captureThreshold).toBe(20);
    expect(strong.captureThreshold).toBe(30);
    expect(low.releaseThreshold).toBe(3.5);
    expect(balanced.releaseThreshold).toBe(7);
    expect(strong.releaseThreshold).toBe(10.5);
  });

  it("keeps the same perceived threshold across canvas scales", () => {
    const scaleOne = createSnapAxis(0, 200, 4, {
      scale: 1,
      sensitivity: "balanced",
    });
    const scaleTwo = createSnapAxis(0, 100, 4, {
      scale: 2,
      sensitivity: "balanced",
    });

    expect(scaleOne.captureThreshold * 1).toBe(12);
    expect(scaleTwo.captureThreshold * 2).toBe(12);
    expect(scaleOne.releaseThreshold * 1).toBe(4);
    expect(scaleTwo.releaseThreshold * 2).toBe(4);
  });

  it("does not change lines or snap candidates between strengths", () => {
    const low = createSnapAxis(0, 400, 4, {
      scale: 1,
      sensitivity: "low",
    });
    const strong = createSnapAxis(0, 400, 4, {
      scale: 1,
      sensitivity: "strong",
    });

    expect(low.lines).toEqual(strong.lines);
    expect(low.candidates).toEqual(strong.candidates);
  });
});
```

- [ ] **Step 2: Run the snap-axis test and verify it fails**

Run:

```bash
npm test -- --runInBand --no-cache __tests__/advanced-snap-axis.test.ts
```

Expected: FAIL because `createSnapAxis()` ignores the fourth argument and uses
the old source-coordinate thresholds.

- [ ] **Step 3: Implement screen-point threshold calculation**

In `advanced-snap-axis.ts`, add:

```ts
import {
  defaultSnapSensitivity,
  getSnapSensitivityMultiplier,
  type SnapSensitivity,
} from "../../model/snap-sensitivity";

export interface SnapAxisOptions {
  scale: number;
  sensitivity: SnapSensitivity;
}

const defaultSnapAxisOptions: SnapAxisOptions = {
  scale: 1,
  sensitivity: defaultSnapSensitivity,
};
```

Change the signature to:

```ts
export function createSnapAxis(
  start: number,
  length: number,
  segments: number,
  options: SnapAxisOptions = defaultSnapAxisOptions,
): SnapAxis {
  "worklet";
```

After calculating `step`, compute thresholds with:

```ts
const scale = options.scale > 0 ? options.scale : 1;
const displayedStep = step * scale;
const multiplier = getSnapSensitivityMultiplier(options.sensitivity);
const captureScreenPoints = Math.max(
  10,
  Math.min(20, displayedStep * 0.24),
) * multiplier;
const releaseScreenPoints = Math.max(
  3,
  Math.min(7, displayedStep * 0.08),
) * multiplier;
```

Return:

```ts
captureThreshold: captureScreenPoints / scale,
releaseThreshold: releaseScreenPoints / scale,
```

Leave `gap`, `gapOffset`, `lines`, and `candidates` byte-for-byte equivalent to
the current behavior.

- [ ] **Step 4: Run the Task 2 test and verify it passes**

Run the Step 2 command.

Expected: PASS.

- [ ] **Step 5: Run the existing gesture and grid regressions**

Run:

```bash
npm test -- --runInBand --no-cache \
  __tests__/advanced-panel-gesture.test.ts \
  __tests__/advanced-panel-canvas-grid.test.tsx \
  __tests__/advanced-grid-controls.test.tsx
```

Expected: all existing suites PASS because omitted options preserve Balanced at
scale `1` and snap destinations are unchanged.

Do not stage or commit.

---

### Task 3: Pass Sensitivity Through Shared Move and Resize Gestures

**Files:**

- Modify: `src/features/quick-panel/calibration/advanced/advanced-grid.ts:78-172`
- Modify: `src/features/quick-panel/calibration/advanced/advanced-panel-gesture.ts:10-63`
- Modify: `src/features/quick-panel/calibration/advanced/hooks/useAdvancedPanelMoveGesture.ts:11-68`
- Modify: `src/features/quick-panel/calibration/advanced/hooks/useAdvancedPanelResizeGesture.ts:10-70`
- Modify: `src/features/quick-panel/calibration/advanced/components/AdvancedPanelResizeHandle.tsx:9-36`
- Modify: `src/features/quick-panel/calibration/advanced/components/AdvancedPanelBox.tsx:18-109`
- Modify: `src/features/quick-panel/calibration/advanced/components/AdvancedPanelCanvas.tsx:20-119`
- Modify: `__tests__/advanced-panel-gesture.test.ts`
- Modify: `__tests__/advanced-panel-box-gesture.test.tsx`
- Modify: `__tests__/advanced-panel-canvas-grid.test.tsx`

**Interfaces:**

- Consumes: Task 2 `createSnapAxis(..., { scale, sensitivity })`.
- Produces:
  - `AdvancedPanelMoveInput.sensitivity: SnapSensitivity`
  - inherited `AdvancedPanelResizeInput.sensitivity`
  - `AdvancedPanelCanvas`, `AdvancedPanelBox`, resize handles, and both gesture
    hooks accepting the same required `snapSensitivity` value
  - movement and resizing using identical threshold options

- [ ] **Step 1: Add failing pure-gesture sensitivity regressions**

Update every existing `getAdvancedPanelMoveResult()` and
`getAdvancedPanelResizeResult()` input in `advanced-panel-gesture.test.ts` with:

```ts
snapSensitivity: "balanced",
```

Add a regression where the moving edge is between the Low and Balanced capture
distances:

```ts
it("changes movement capture distance without changing the target", () => {
  const input = {
    dx: 29,
    dy: 0,
    grid: { columns: 3, rows: 4 },
    outerRect,
    scale: 1,
    startRect,
  } as const;
  const low = getAdvancedPanelMoveResult({
    ...input,
    snapSensitivity: "low",
  });
  const balanced = getAdvancedPanelMoveResult({
    ...input,
    snapSensitivity: "balanced",
  });

  expect(low.rect.x).not.toBe(balanced.rect.x);
  expect(low.snapKey).toBeNull();
  expect(balanced.snapKey).toContain("left:x:94.00");
});
```

Add the equivalent resize assertion using `position: "right"` and `dx: 49`.
With the existing rectangle, the raw right edge is `179`, the shared candidate
is `194`, Low preserves raw width `129`, and Balanced snaps to width `144`:

```ts
it("uses the same sensitivity for resizing", () => {
  const input = {
    dx: 49,
    dy: 0,
    grid: { columns: 3, rows: 4 },
    outerRect,
    position: "right" as const,
    scale: 1,
    startRect,
  };
  const low = getAdvancedPanelResizeResult({
    ...input,
    snapSensitivity: "low",
  });
  const balanced = getAdvancedPanelResizeResult({
    ...input,
    snapSensitivity: "balanced",
  });

  expect(low.rect.width).toBe(129);
  expect(low.snapKey).toBeNull();
  expect(balanced.rect.width).toBe(144);
  expect(balanced.snapKey).toContain("right:x:194.00");
});
```

- [ ] **Step 2: Run the pure gesture test and verify it fails**

Run:

```bash
npm test -- --runInBand --no-cache __tests__/advanced-panel-gesture.test.ts
```

Expected: FAIL because gesture inputs do not accept or forward
`snapSensitivity` and both strengths behave identically.

- [ ] **Step 3: Thread scale and sensitivity into both snap-axis directions**

Change `snapMovedPanelRect()` to accept `scale` and `snapSensitivity` after
`grid`. Create both axes with:

```ts
const options = { scale, sensitivity: snapSensitivity };
const xAxis = createSnapAxis(
  outerRect.x,
  outerRect.width,
  grid.columns,
  options,
);
const yAxis = createSnapAxis(
  outerRect.y,
  outerRect.height,
  grid.rows,
  options,
);
```

Make the same signature and axis changes in `snapResizedPanelRect()` before the
`position` argument. Import `SnapSensitivity` from
`model/snap-sensitivity.ts`.

In `advanced-panel-gesture.ts`, add:

```ts
snapSensitivity: SnapSensitivity;
```

to `AdvancedPanelMoveInput`, destructure it in both helpers, and call:

```ts
return snapMovedPanelRect(
  movedRect,
  startRect,
  outerRect,
  grid,
  scale,
  snapSensitivity,
);
```

Pass the same values to `snapResizedPanelRect()` before `position`.

- [ ] **Step 4: Run the pure gesture test and verify it passes**

Run the Step 2 command.

Expected: PASS, including distinct Low/Balanced movement and resize behavior.

- [ ] **Step 5: Add failing component-pipeline assertions**

In `advanced-panel-canvas-grid.test.tsx`, add
`snapSensitivity: "strong" as const` to `props` and assert
`mockAdvancedPanelBox` receives it.

In `advanced-panel-box-gesture.test.tsx`, add
`snapSensitivity: "balanced" as const` to `baseProps`. Add a rerender regression:

```tsx
it("uses a changed sensitivity on the next gesture", () => {
  const onChange = jest.fn();
  const view = render(
    <AdvancedPanelBox {...baseProps} onChange={onChange} />,
  );
  const balancedMove = mockPanGestures[0];

  view.rerender(
    <AdvancedPanelBox
      {...baseProps}
      snapSensitivity="strong"
      onChange={onChange}
    />,
  );
  const strongMove = mockPanGestures[9];

  expect(balancedMove).toBeDefined();
  expect(strongMove).toBeDefined();
});
```

The current test mock creates one move gesture plus eight resize gestures per
render, so the second move gesture is index `9`. Keep this assertion focused on
gesture reconstruction; pure geometry tests own the numerical threshold result.

- [ ] **Step 6: Run the component tests and verify they fail**

Run:

```bash
npm test -- --runInBand --no-cache \
  __tests__/advanced-panel-canvas-grid.test.tsx \
  __tests__/advanced-panel-box-gesture.test.tsx
```

Expected: FAIL because canvas, panel, handle, and gesture props do not contain
`snapSensitivity`.

- [ ] **Step 7: Thread the required prop through the shared component chain**

Add `snapSensitivity: SnapSensitivity` to:

- `AdvancedPanelCanvas.Props` and each `<AdvancedPanelBox>` call;
- `AdvancedPanelBox.Props` and the move hook input;
- `AdvancedPanelResizeHandle.Props` and the resize hook input;
- both gesture-hook `Params` interfaces and the corresponding pure helper call.

Keep the value as a normal React prop. Do not create a new Reanimated
`SharedValue`, because changing strength during a simultaneous second-finger
panel drag is out of scope.

- [ ] **Step 8: Run the Task 3 focused suites**

Run:

```bash
npm test -- --runInBand --no-cache \
  __tests__/advanced-snap-axis.test.ts \
  __tests__/advanced-panel-gesture.test.ts \
  __tests__/advanced-panel-canvas-grid.test.tsx \
  __tests__/advanced-panel-box-gesture.test.tsx
```

Expected: all suites PASS; existing commit-on-end and haptic-key behavior remains
covered.

Do not stage or commit.

---

### Task 4: Build the Fixed Three-Stop Footer Control

**Files:**

- Create: `src/features/quick-panel/calibration/advanced/components/AdvancedSnapSensitivityControl.tsx`
- Modify: `src/features/quick-panel/calibration/advanced/AdvancedCalibrationControls.tsx:1-101`
- Modify: `i18next/locales/en.ts:128-190`
- Modify: `i18next/locales/zh.ts:118-180`
- Create: `__tests__/advanced-snap-sensitivity-control.test.tsx`
- Create: `__tests__/advanced-calibration-controls.test.tsx`
- Modify: `__tests__/locales.test.ts:183-221`

**Interfaces:**

- Consumes: Task 1 slider-index helpers, the existing AniUI `Slider`, `Text`,
  and established footer surface styles.
- Produces:
  - `AdvancedSnapSensitivityControl({ value, onValueChange })`
  - exactly three visual stops and localized labels
  - `AdvancedCalibrationControls` props `isPanelPhase`, `snapSensitivity`, and
    `onSnapSensitivityChange`
  - footer rendering only when `isPanelPhase === true`

- [ ] **Step 1: Add failing localization assertions**

In the target-aware Advanced locale test, assert both locales define:

```ts
expect(english.snapStrengthTitle).toBe("Snap strength");
expect(english.snapStrengthLow).toBe("Low");
expect(english.snapStrengthBalanced).toBe("Balanced");
expect(english.snapStrengthStrong).toBe("Strong");
expect(chinese.snapStrengthTitle).toBe("吸附強度");
expect(chinese.snapStrengthLow).toBe("低");
expect(chinese.snapStrengthBalanced).toBe("平衡");
expect(chinese.snapStrengthStrong).toBe("強");
```

- [ ] **Step 2: Write the failing three-stop component tests**

Mock the AniUI Slider as the existing grid-control test does. In
`advanced-snap-sensitivity-control.test.tsx`, verify:

```tsx
it("renders the three named stops with Balanced selected", () => {
  render(
    <AdvancedSnapSensitivityControl
      value="balanced"
      onValueChange={jest.fn()}
    />,
  );

  expect(screen.getByText("advancedCalibration.snapStrengthLow")).toBeTruthy();
  expect(screen.getByText("advancedCalibration.snapStrengthBalanced")).toBeTruthy();
  expect(screen.getByText("advancedCalibration.snapStrengthStrong")).toBeTruthy();
  expect(screen.getByTestId("advanced-snap-sensitivity-slider").props).toMatchObject({
    min: 0,
    max: 2,
    step: 1,
    value: 1,
  });
});

it.each([
  [0, "low"],
  [1, "balanced"],
  [2, "strong"],
] as const)("maps slider stop %s to %s", (sliderValue, expected) => {
  const onValueChange = jest.fn();
  render(
    <AdvancedSnapSensitivityControl
      value="balanced"
      onValueChange={onValueChange}
    />,
  );

  fireEvent(
    screen.getByTestId("advanced-snap-sensitivity-slider"),
    "valueChange",
    sliderValue,
  );
  expect(onValueChange).toHaveBeenCalledWith(expected);
});
```

Also assert exactly three marker test IDs exist:
`advanced-snap-sensitivity-stop-low`, `-balanced`, and `-strong`.

- [ ] **Step 3: Run the locale and component tests and verify they fail**

Run:

```bash
npm test -- --runInBand --no-cache \
  __tests__/locales.test.ts \
  __tests__/advanced-snap-sensitivity-control.test.tsx
```

Expected: FAIL because the copy and component do not exist.

- [ ] **Step 4: Add localized copy and implement the compact control**

Add the four exact keys from Step 1 to both locale objects.

Create `AdvancedSnapSensitivityControl.tsx` with:

```ts
interface Props {
  onValueChange: (value: SnapSensitivity) => void;
  value: SnapSensitivity;
}
```

Render:

- one `rounded-xl border border-white/10 bg-zinc-900/90 px-3 py-2` surface;
- the uppercase `Snap strength` title using the existing grid-metadata text
  style;
- one AniUI Slider with `min={0}`, `max={2}`, `step={1}`, `size="sm"`, and the
  Task 1 conversion helpers;
- three non-interactive marker dots aligned at `0%`, `50%`, and `100%` without
  intercepting Slider touches;
- one `flex-row justify-between` label row, with the selected label white and
  the other two labels zinc-400.

Use the three test IDs from Step 2 and do not modify the shared AniUI Slider.

- [ ] **Step 5: Run the locale and control tests and verify they pass**

Run the Step 3 command.

Expected: PASS.

- [ ] **Step 6: Write failing footer phase-visibility tests**

In `advanced-calibration-controls.test.tsx`, mock
`AdvancedGridControls` and `AdvancedSnapSensitivityControl` with test IDs. Build
complete base props and assert:

```tsx
it("shows snap strength only during panel editing", () => {
  const view = render(
    <AdvancedCalibrationControls {...baseProps} isPanelPhase={true} />,
  );
  expect(screen.getByTestId("snap-sensitivity-control-mock")).toBeTruthy();

  view.rerender(
    <AdvancedCalibrationControls
      {...baseProps}
      isPanelPhase={false}
      isConfirmPhase={true}
    />,
  );
  expect(screen.queryByTestId("snap-sensitivity-control-mock")).toBeNull();
});
```

Add separate rerenders for grid setup and panel selection so the test covers all
non-panel footer phases, not only confirmation.

- [ ] **Step 7: Run the footer test and verify it fails**

Run:

```bash
npm test -- --runInBand --no-cache __tests__/advanced-calibration-controls.test.tsx
```

Expected: FAIL because `AdvancedCalibrationControls` has no sensitivity props
or conditional control.

- [ ] **Step 8: Integrate the control above Back and Next**

Add these required props to `AdvancedCalibrationControls`:

```ts
isPanelPhase: boolean;
onSnapSensitivityChange: (value: SnapSensitivity) => void;
snapSensitivity: SnapSensitivity;
```

Inside the existing footer column, render:

```tsx
{isPanelPhase ? (
  <AdvancedSnapSensitivityControl
    value={snapSensitivity}
    onValueChange={onSnapSensitivityChange}
  />
) : null}
```

Place it after grid controls and before the Back/Next action row. Do not show it
in the grid phase or final review.

- [ ] **Step 9: Run all Task 4 focused tests**

Run:

```bash
npm test -- --runInBand --no-cache \
  __tests__/locales.test.ts \
  __tests__/advanced-snap-sensitivity-control.test.tsx \
  __tests__/advanced-calibration-controls.test.tsx \
  __tests__/advanced-grid-controls.test.tsx
```

Expected: all suites PASS.

Do not stage or commit.

---

### Task 5: Connect Both Calibration Controllers and All Three Targets

**Files:**

- Modify: `src/features/quick-panel/calibration/advanced/hooks/useAdvancedCalibrationScreen.ts:1-255`
- Modify: `src/features/quick-panel/calibration/advanced/combined/hooks/useCombinedCalibrationScreen.ts:1-216`
- Modify: `src/features/quick-panel/calibration/advanced/AdvancedCalibrationScreen.tsx:25-240`
- Modify: `src/features/quick-panel/calibration/advanced/combined/CombinedCalibrationScreen.tsx:1-124`
- Modify: `__tests__/advanced-calibration-screen-empty-state.test.tsx`
- Modify: `__tests__/combined-calibration-screen.test.tsx`
- Modify: `__tests__/combined-calibration-controller.test.ts`
- Modify: `__tests__/advanced-calibration-leave-guard.test.tsx`

**Interfaces:**

- Consumes: Task 1 `useSnapSensitivityPreference()`, Task 3 canvas prop, and
  Task 4 footer props.
- Produces: both controllers returning `snapSensitivity` and
  `setSnapSensitivity`; released and Combined screens pass the same preference
  to the footer and shared canvas; all Advanced targets use the same MMKV key.

- [ ] **Step 1: Add the preference to existing hook fixtures**

Update every fixture or mock that represents the return value of
`useAdvancedCalibrationScreen()` or `useCombinedCalibrationScreen()` with:

```ts
snapSensitivity: "balanced" as const,
setSnapSensitivity: jest.fn(),
```

This keeps the test suite type-safe before screen expectations are added.

- [ ] **Step 2: Add failing released-screen prop assertions**

In `advanced-calibration-screen-empty-state.test.tsx`, capture the existing
mocked footer and canvas props during a `buttonBox` panel phase. Assert:

```ts
expect(mockAdvancedCalibrationControls.mock.calls[0][0]).toEqual(
  expect.objectContaining({
    isPanelPhase: true,
    snapSensitivity: "balanced",
    onSnapSensitivityChange: screenState.setSnapSensitivity,
  }),
);
expect(mockAdvancedPanelCanvas.mock.calls[0][0]).toEqual(
  expect.objectContaining({ snapSensitivity: "balanced" }),
);
```

Add a Buttons-target panel-phase fixture and make the same assertions so both
released targets are explicit.

- [ ] **Step 3: Refactor the Combined screen test mocks and add failing assertions**

Replace the fixed `useCombinedCalibrationScreen` mock with
`mockUseCombinedCalibrationScreen`, and make the mocked controls/canvas capture
their props as the released-screen test does.

Render a Combined panel phase with `activePanelId: "buttonBox"`, one valid
panel, screenshot, and outer rectangle. Assert the controls receive
`isPanelPhase: true`, the setter, and `balanced`; assert the canvas receives
`balanced`. Render `phase: "confirm"` and assert the controls receive
`isPanelPhase: false`.

- [ ] **Step 4: Run the screen suites and verify they fail**

Run:

```bash
npm test -- --runInBand --no-cache \
  __tests__/advanced-calibration-screen-empty-state.test.tsx \
  __tests__/combined-calibration-screen.test.tsx
```

Expected: FAIL because neither controller nor screen exposes or forwards the
new preference.

- [ ] **Step 5: Read the preference in both controllers**

In each controller hook, call:

```ts
const {
  snapSensitivity,
  setSnapSensitivity,
} = useSnapSensitivityPreference();
```

Return both fields from each hook. Do not add them to Zustand selectors or
state.

- [ ] **Step 6: Wire released Controls-only and Buttons-only screens**

In `ReleasedAdvancedCalibrationScreen`:

- destructure `snapSensitivity` and `setSnapSensitivity`;
- pass `isPanelPhase={isPanelStep}`,
  `snapSensitivity={snapSensitivity}`, and
  `onSnapSensitivityChange={setSnapSensitivity}` to
  `AdvancedCalibrationControls`;
- pass `snapSensitivity={snapSensitivity}` to `AdvancedPanelCanvas`.

The shared released screen makes this apply equally to Controls-only and
Buttons-only.

- [ ] **Step 7: Wire the Combined screen**

In `CombinedCalibrationScreen`:

- destructure the same two controller values;
- pass `isPanelPhase={activePanelId !== null}` plus the sensitivity value and
  setter to `AdvancedCalibrationControls`;
- pass the sensitivity value to `AdvancedPanelCanvas`.

Do not infer panel phase from `activePanelFamily`; `activePanelId !== null` is
the direct phase signal and works for both families.

- [ ] **Step 8: Run the screen suites and verify they pass**

Run the Step 4 command.

Expected: PASS.

- [ ] **Step 9: Add controller persistence regressions**

In `combined-calibration-controller.test.ts`, assert the default is Balanced,
change it to Strong, and verify the dedicated MMKV key:

```ts
expect(getHook().snapSensitivity).toBe("balanced");
act(() => getHook().setSnapSensitivity("strong"));
expect(getHook().snapSensitivity).toBe("strong");
expect(
  (globalThis as typeof globalThis & MmkvTestGlobal)
    .__mmkvStore?.get("quick-panel.snap-sensitivity"),
).toBe("strong");
```

Add the same default/read behavior to the released controller hook probe in
`advanced-calibration-leave-guard.test.tsx`: pre-seed the key with `"low"`
before rendering, assert the hook exposes `low`, then change it to `strong` and
assert the same global key changes. This proves both controller families share
one preference without adding it to calibration state.

- [ ] **Step 10: Run all Task 5 focused suites**

Run:

```bash
npm test -- --runInBand --no-cache \
  __tests__/advanced-calibration-screen-empty-state.test.tsx \
  __tests__/advanced-calibration-leave-guard.test.tsx \
  __tests__/combined-calibration-screen.test.tsx \
  __tests__/combined-calibration-controller.test.ts \
  __tests__/advanced-calibration-controls.test.tsx
```

Expected: all suites PASS.

Do not stage or commit.

---

### Task 6: Lock Persistence Boundaries, Document Behavior, and Verify

**Files:**

- Modify: `__tests__/advanced-calibration-state.test.ts`
- Modify: `__tests__/combined-calibration-state.test.ts`
- Modify: `__tests__/storage.test.ts`
- Modify: `docs/notes.md`
- Verify: all files changed by Tasks 1-5

**Interfaces:**

- Consumes: the complete implementation from Tasks 1-5.
- Produces: regression proof that sensitivity remains separate from calibration
  and export geometry, current-facing documentation, and final automated
  verification evidence.

- [ ] **Step 1: Strengthen saved-calibration boundary tests**

In `advanced-calibration-state.test.ts`, keep the existing assertions that saved
Controls and Buttons calibrations contain only their `grid` geometry and no
retired snapping toggle. Add:

```ts
expect(result?.grid).toEqual({ columns: 4, rows: 5 });
expect(result?.grid).not.toHaveProperty("snapSensitivity");
expect(result).not.toHaveProperty("snapSensitivity");
```

Add a dedicated regression to `combined-calibration-state.test.ts` using its
existing `validDraft` fixture:

```ts
it("keeps snap sensitivity out of saved Combined geometry", () => {
  const result = getCombinedCalibrationFromDraft(
    validDraft,
    { columns: 4, rows: 6 },
  );

  expect(result?.grid).toEqual({ columns: 4, rows: 6 });
  expect(result?.grid).not.toHaveProperty("snapSensitivity");
  expect(result).not.toHaveProperty("snapSensitivity");
});
```

In `storage.test.ts`, after saving both calibration data and Strong sensitivity,
parse `quick-panel.calibrations` and assert the serialized object has no
`snapSensitivity` field at the root or within any calibration/grid branch.

- [ ] **Step 2: Run calibration persistence tests**

Run:

```bash
npm test -- --runInBand --no-cache \
  __tests__/advanced-calibration-state.test.ts \
  __tests__/combined-calibration-state.test.ts \
  __tests__/storage.test.ts
```

Expected: PASS. If a sensitivity field appears inside calibration JSON, remove
that wiring rather than updating the expected payload.

- [ ] **Step 3: Add a current-facing note**

Append a dated section to `docs/notes.md`:

```markdown
### 2026-08-07: Three-stop Advanced snap sensitivity

- Editable Advanced panel steps expose one compact Low, Balanced, Strong snap
  strength control; snapping remains required and has no Off position.
- Low, Balanced, and Strong use `0.5x`, `1x`, and `1.5x` capture/release
  multipliers. Thresholds are normalized in screen points so canvas scaling does
  not change the perceived strength.
- One global `quick-panel.snap-sensitivity` preference is shared by Controls,
  Buttons, and Combined and defaults to Balanced when missing or invalid.
- Sensitivity is interaction-only and is never added to calibration geometry,
  Button identifier layout, Customize, preview composition, or export data.
```

- [ ] **Step 4: Run the complete focused feature set**

Run:

```bash
npm test -- --runInBand --no-cache \
  __tests__/snap-sensitivity.test.ts \
  __tests__/storage.test.ts \
  __tests__/advanced-snap-axis.test.ts \
  __tests__/advanced-panel-gesture.test.ts \
  __tests__/advanced-panel-box-gesture.test.tsx \
  __tests__/advanced-panel-canvas-grid.test.tsx \
  __tests__/advanced-snap-sensitivity-control.test.tsx \
  __tests__/advanced-calibration-controls.test.tsx \
  __tests__/advanced-calibration-screen-empty-state.test.tsx \
  __tests__/advanced-calibration-leave-guard.test.tsx \
  __tests__/combined-calibration-screen.test.tsx \
  __tests__/combined-calibration-controller.test.ts \
  __tests__/advanced-calibration-state.test.ts \
  __tests__/combined-calibration-state.test.ts \
  __tests__/locales.test.ts
```

Expected: every suite PASS.

- [ ] **Step 5: Run repository-wide automated verification**

Run each command separately:

```bash
npm test -- --runInBand
```

```bash
npm run lint
```

```bash
npx tsc --noEmit
```

```bash
git diff --check
```

Expected: every command exits `0` with no failing test, lint error, TypeScript
error, or whitespace error.

- [ ] **Step 6: Review the final diff without staging or committing**

Run:

```bash
git status --short
git diff --stat
git diff -- \
  src/features/quick-panel/model/snap-sensitivity.ts \
  src/features/quick-panel/store/storage.ts \
  src/features/quick-panel/calibration/advanced \
  i18next/locales/en.ts \
  i18next/locales/zh.ts \
  __tests__ \
  docs/notes.md
```

Confirm the diff contains no dependency changes, no `AdvancedSnapGrid` shape
change, no sensitivity field in saved calibration builders/parsers, no Slider
accessibility expansion, and no unrelated formatting churn.

Do not stage, commit, push, or perform physical-device QA.
