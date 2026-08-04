# Controls + Buttons Combined Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:executing-plans` to implement this plan task-by-task, inline in
> the current session. Project instructions prohibit subagents, commits, and
> pushes. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status:** Design approved; application implementation has not started.

**Goal:** Add an independent Advanced `Controls + Buttons` target that uses one
calibration area, grid, image, transform, and ordered export run across both
panel families.

**Architecture:** Keep the released Controls-only and Buttons-only controller
behavior intact. Add an independent combined calibration shape, pure state and
phase helpers, combined preset builder, and dedicated combined screen
controller; reuse the existing selection, grid, gesture, canvas, Customize,
sequential export, and Result primitives through small explicit interfaces.

**Tech Stack:** Expo SDK 56, Expo Router, React Native 0.85, TypeScript 6,
Zustand 5, MMKV 4, Uniwind/Tailwind 4, AniUI, Jest 29, React Native Testing
Library.

**Design contract:**
`docs/superpowers/specs/2026-07-31-controls-buttons-combined-mode-design.md`

## Global Constraints

- Read `AGENTS.md`, `docs/styling.md`, and the exact Expo 56 documentation at
  `https://docs.expo.dev/versions/v56.0.0/` before writing application code.
- Work inline only. Do not dispatch or suggest subagents.
- Do not stage, commit, or push. Do not capture flow screenshots in this pass.
- Leave physical Samsung/Good Lock QA to the user; run the automated checks in
  Task 8.
- Add no dependencies and do not change Default, Controls-only, or Buttons-only
  product behavior.
- Keep the shared grid required, with integer rows and columns from `1` through
  `8`.
- Preserve all existing persisted data. Add `advancedCombined` without a reset
  or migration that rewrites unrelated preferences.
- Keep combined Button image intensity under
  `quick-panel.combined-button-image-intensity`, defaulting to `78%`; all other
  Button appearance settings remain shared under
  `quick-panel.button-customize-settings`.
- Use one normalized image and one `{ x, y, scale }` transform. The 1080-pixel
  preview proxy remains preview-only; exports use the normalized original.
- Export original-quality `1024 x 1024` PNGs sequentially and all-or-nothing:
  enabled Controls in Good Lock order, then Buttons in selected order.
- Use interfaces for state/props, avoid `any`, and do not add `useMemo`,
  `useCallback`, or `React.memo` outside AniUI.
- Keep new `.tsx` component files below 150 lines by splitting presentation
  from controller state where needed.
- Do not add release announcements, changelogs, store assets, or a version bump.

---

### Task 1: Add the combined model and additive persistence

**Files:**

- Modify: `src/features/quick-panel/model/types.ts`
- Modify: `src/features/quick-panel/store/storage.ts`
- Modify: `__tests__/storage.test.ts`

**Interfaces:**

- Consumes: existing `AdvancedSnapGrid`, `ButtonCalibrationItem`,
  `ControlPanelId`, `ControlPanelRects`, `PanelRect`, and `PickedImage`.
- Produces: `AdvancedTarget` including `"combined"`,
  `AdvancedCombinedCalibration`, `AdvancedCombinedDraft`,
  `SavedCalibrations.advancedCombined`, `loadCombinedButtonImageIntensity()`,
  and `saveCombinedButtonImageIntensity(value)`.

- [ ] **Step 1: Add failing storage compatibility and isolation tests**

Extract the existing Control rectangles into an `advancedControlPanels`
constant, then extend the `currentCalibrations` fixture with this valid branch:

```ts
advancedCombined: {
  screenshotWidth: 1080,
  screenshotHeight: 2340,
  grid: { columns: 4, rows: 6 },
  outerRect: rect,
  enabledControls: ["buttonBox", "brightness"],
  controlPanels: advancedControlPanels,
  buttons: [
    {
      id: "button-1",
      label: "Wi-Fi",
      customIconId: null,
      rect: { x: 20, y: 460, width: 120, height: 120, radius: 0 },
    },
  ],
},
```

Write a v1.2.0 object containing only `default`, `advancedControls`, and
`advancedButtons` directly to the MMKV test map under
`quick-panel.calibrations`, then add assertions that:

```ts
expect(loadCalibrations()).toMatchObject({
  default: expect.anything(),
  advancedControls: expect.anything(),
  advancedButtons: expect.anything(),
  advancedCombined: null,
});
expect(loadLastExportedAdvancedTarget()).toBe("combined");
expect(loadCombinedButtonImageIntensity()).toBe(78);
```

Write MMKV-backed cases proving `64` round-trips, values `-1`, `101`, `NaN`,
and non-numbers load as `78`, and an invalid combined branch becomes `null`
without discarding the other three calibration branches.

- [ ] **Step 2: Run the storage test and confirm the expected failures**

Run:

```bash
npm test -- --runInBand __tests__/storage.test.ts
```

Expected: failures for the missing combined types, target parser, calibration
branch, and intensity functions.

- [ ] **Step 3: Add the combined domain types**

Add the following shapes to `model/types.ts`:

```ts
export type AdvancedTarget = "controls" | "buttons" | "combined";

export interface AdvancedCombinedCalibration {
  screenshotWidth: number;
  screenshotHeight: number;
  grid: AdvancedSnapGrid;
  outerRect: PanelRect;
  enabledControls: ControlPanelId[];
  controlPanels: ControlPanelRects;
  buttons: ButtonCalibrationItem[];
}

export interface AdvancedCombinedDraft {
  screenshot: PickedImage | null;
  outerRect: PanelRect | null;
  enabledControls: ControlPanelId[];
  controlPanels: ControlPanelRects | null;
  buttons: ButtonCalibrationItem[];
}
```

Do not merge these with either released Advanced calibration interface.

- [ ] **Step 4: Parse and save the additive calibration branch**

Extend `SavedCalibrations` and both `loadCalibrations()` fallbacks with
`advancedCombined: AdvancedCombinedCalibration | null`. Add
`parseAdvancedCombinedCalibration(value)` using the existing grid, rect,
enabled-Control, Control-rect, and Button-item parsers:

```ts
function parseAdvancedCombinedCalibration(
  value: unknown,
): AdvancedCombinedCalibration | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<AdvancedCombinedCalibration>;
  const grid = parseAdvancedGrid(item.grid);
  const outerRect = parseRectValue(item.outerRect);
  const controlPanels = parsePanelRects(item.controlPanels);
  const buttons = parseButtonItems(item.buttons);
  const enabledControls = parseCombinedEnabledControls(item.enabledControls);
  if (
    typeof item.screenshotWidth !== "number" ||
    typeof item.screenshotHeight !== "number" ||
    !grid || !outerRect || !enabledControls || !controlPanels ||
    !buttons || buttons.length === 0
  ) return null;
  return {
    screenshotWidth: item.screenshotWidth,
    screenshotHeight: item.screenshotHeight,
    grid,
    outerRect,
    enabledControls,
    controlPanels,
    buttons,
  };
}
```

Add `parseCombinedEnabledControls(value): ControlPanelId[] | null` beside the
existing tolerant Controls-only parser. It keeps unique known IDs in
`panelIds` order and returns `null` for a missing, invalid, or empty array;
combined persistence must never silently turn an empty selection into all four
Controls.

Parse this branch independently in `parseCalibrations`; do not make the whole
payload conditional on its validity. Widen `isAdvancedTarget` to accept
`"combined"`.

- [ ] **Step 5: Add separate combined intensity storage**

Add these exact exports beside the existing Button settings functions:

```ts
const combinedButtonImageIntensityKey =
  "quick-panel.combined-button-image-intensity";
export const defaultCombinedButtonImageIntensity = 78;

export function loadCombinedButtonImageIntensity(): number {
  const saved = Number(storage.getString(combinedButtonImageIntensityKey));
  return parsePercentage(
    Number.isFinite(saved) ? saved : undefined,
    defaultCombinedButtonImageIntensity,
  );
}

export function saveCombinedButtonImageIntensity(value: number) {
  storage.set(combinedButtonImageIntensityKey, String(value));
}
```

The string representation deliberately uses the existing `getString` MMKV
mock contract and avoids expanding global test setup for one scalar setting.

- [ ] **Step 6: Run focused storage tests**

Run:

```bash
npm test -- --runInBand __tests__/storage.test.ts
```

Expected: all storage tests pass, including the unchanged v1.2.0 preference
preservation cases.

---

### Task 2: Build pure combined draft, phase, and overlap logic

**Files:**

- Create: `src/features/quick-panel/calibration/advanced/combined/combined-calibration-state.ts`
- Create: `src/features/quick-panel/calibration/advanced/combined/combined-steps.ts`
- Create: `__tests__/combined-calibration-state.test.ts`
- Create: `__tests__/combined-calibration-steps.test.ts`

**Interfaces:**

- Consumes: Task 1 combined types, `getInitialAdvancedPanels()`,
  `scaleControlPanelsToOuter()`, `scalePanelsToOuter()`, `arePanelsValid()`,
  `advancedPanelPhases`, `getButtonPanelRects()`, and existing screenshot/grid
  shapes.
- Produces: `createAdvancedCombinedDraft()`, `initializeCombinedControlPanels()`,
  `scaleCombinedDraftToOuter()`, `getCombinedCalibrationFromDraft()`,
  `getCombinedPanelItems()`, `getCombinedPanelRects()`,
  `CombinedCalibrationPhase`, `getCombinedPanelOrder()`,
  `getCombinedPhaseOrder()`, `getNextCombinedPhase()`,
  `getPreviousCombinedPhase()`, `getVisibleCombinedPanelIds()`, and
  `getCombinedActivePanelError()`.

- [ ] **Step 1: Write failing draft creation and validation tests**

Cover first use, saved rescaling, outer rescaling, and final cross-family
validation with fixtures shaped like:

```ts
const screenshot = { uri: "file:///panel.png", width: 200, height: 400 };
const outerRect = { x: 0, y: 0, width: 200, height: 400, radius: 0 };

expect(createAdvancedCombinedDraft(screenshot, outerRect, null)).toMatchObject({
  screenshot,
  outerRect,
  enabledControls: ["buttonBox", "brightness", "volume", "mediaPlayer"],
  controlPanels: null,
  buttons: [],
});
```

Use a saved `100 x 200` calibration to prove every outer, Control, and Button
coordinate doubles on a `200 x 400` screenshot. Prove final acceptance rejects
zero Controls, zero Buttons, out-of-bounds rectangles, Control-Control,
Button-Button, and Control-Button overlap while ignoring disabled Control
rectangles.

- [ ] **Step 2: Write failing phase and active-overlap tests**

Use enabled Controls `["buttonBox", "volume"]` and Buttons
`["button-1", "button-2"]` to assert the exact phase order:

```ts
expect(getCombinedPhaseOrder(enabledControls, buttons)).toEqual([
  "outer",
  "controlSelection",
  "buttonSelection",
  "grid",
  "buttonBox",
  "volume",
  "button-1",
  "button-2",
  "confirm",
]);
```

Assert that visible IDs at `button-1` are
`["buttonBox", "volume", "button-1"]`, going Back to `volume` hides both
Buttons, overlap with a future hidden rectangle is allowed, and overlap with a
visible completed rectangle returns `"overlap"`.

- [ ] **Step 3: Run both new suites and confirm they fail**

Run:

```bash
npm test -- --runInBand \
  __tests__/combined-calibration-state.test.ts \
  __tests__/combined-calibration-steps.test.ts
```

Expected: module-not-found failures.

- [ ] **Step 4: Implement pure combined draft state**

Use these exact signatures:

```ts
export function createAdvancedCombinedDraft(
  screenshot: PickedImage,
  suggestedOuter: PanelRect,
  saved: AdvancedCombinedCalibration | null,
): AdvancedCombinedDraft;

export function initializeCombinedControlPanels(
  draft: AdvancedCombinedDraft,
): AdvancedCombinedDraft;

export function scaleCombinedDraftToOuter(
  draft: AdvancedCombinedDraft,
  outerRect: PanelRect,
): AdvancedCombinedDraft;

export function getCombinedCalibrationFromDraft(
  draft: AdvancedCombinedDraft | null,
  grid: AdvancedSnapGrid,
): AdvancedCombinedCalibration | null;

export function getCombinedPanelItems(
  draft: AdvancedCombinedDraft,
): EditablePanelItem[];

export function getCombinedPanelRects(
  draft: AdvancedCombinedDraft,
): PanelRects | null;
```

For saved drafts, calculate `scaleX` and `scaleY` from saved screenshot
dimensions, scale the saved outer rect, then map both families from the saved
outer into that scaled outer. For outer edits, rescale both families from the
old outer into the new outer. Preserve Control radii as the existing Control
helper does; keep Button radii at zero.

Final acceptance must merge only enabled Control rectangles and selected
Button rectangles, then call `arePanelsValid(merged, outerRect, orderedIds)`.
The item and rect helpers return enabled Controls in calibration order followed
by Buttons in selected order, use `getPanelLabel()` for Controls and
`getButtonLabel()` for Buttons, and return `null` until Control rectangles have
been initialized.

- [ ] **Step 5: Implement the deterministic phase helper**

Define:

```ts
export type CombinedCalibrationPhase =
  | "outer"
  | "controlSelection"
  | "buttonSelection"
  | "grid"
  | PanelId
  | "confirm";

export type CombinedActivePanelError = "invalid" | "overlap" | null;

export function getCombinedPanelOrder(
  enabledControls: ControlPanelId[],
  buttons: ButtonCalibrationItem[],
): PanelId[];

export function getCombinedPhaseOrder(
  enabledControls: ControlPanelId[],
  buttons: ButtonCalibrationItem[],
): CombinedCalibrationPhase[];

export function getNextCombinedPhase(
  phase: CombinedCalibrationPhase,
  panelOrder: PanelId[],
): CombinedCalibrationPhase | null;

export function getPreviousCombinedPhase(
  phase: CombinedCalibrationPhase,
  panelOrder: PanelId[],
): CombinedCalibrationPhase | null;

export function getVisibleCombinedPanelIds(
  phase: CombinedCalibrationPhase,
  panelOrder: PanelId[],
): PanelId[];

export function getCombinedActivePanelError(
  activeId: PanelId,
  visiblePanelIds: PanelId[],
  panels: PanelRects,
  outerRect: PanelRect,
): CombinedActivePanelError;
```

Build Control order with `advancedPanelPhases.filter(...)`, then append Button
IDs in array order. `getVisibleCombinedPanelIds()` returns no panels during the
four setup phases, the completed prefix plus active panel during editing, and
all panel IDs during confirmation.

Implement active validation by checking the active rect and the visible prefix
with the same `arePanelsValid()` function used at final validation. First call
it with `[activeId]`; failure means `"invalid"`. Then call it with the completed
prefix plus `activeId`; failure there means `"overlap"`. Future hidden IDs are
excluded from both calls.

- [ ] **Step 6: Run the pure logic suites**

Run the command from Step 3. Expected: both suites pass.

---

### Task 3: Build the combined preset and collision-safe export names

**Files:**

- Create: `src/features/quick-panel/model/combined-export-names.ts`
- Create: `src/features/quick-panel/calibration/advanced/combined/combined-preset.ts`
- Modify: `src/features/quick-panel/calibration/advanced/buttons-geometry.ts`
- Modify: `src/features/quick-panel/model/button-export-names.ts`
- Create: `__tests__/combined-export-names.test.ts`
- Create: `__tests__/combined-preset.test.ts`
- Modify: `__tests__/button-labels.test.ts`

**Interfaces:**

- Consumes: Task 1 saved calibration, existing Control `visualOrder` and
  `goodLockOrder`, Button icon/grid-span logic, canonical Button labels, and
  calibrated panel definitions.
- Produces: `createButtonFileNameSlugs()`, `createCombinedPanelFileNames()`,
  `createButtonPanelDefinitions()`, and `createCombinedPreset()`.

- [ ] **Step 1: Write failing naming tests**

Assert:

```ts
expect(createCombinedPanelFileNames(
  ["buttonBox", "brightness"],
  ["Wi-Fi", "Wi-Fi", "My Scene"],
)).toEqual([
  "01-control-button-box.png",
  "02-control-brightness.png",
  "03-button-wi-fi.png",
  "04-button-wi-fi-2.png",
  "05-button-my-scene.png",
]);
```

Also cover punctuation-only custom labels falling back to `button`, contiguous
renumbering when Controls are disabled, and unchanged output from the existing
`createButtonFileNames()` API.

- [ ] **Step 2: Write a failing mixed preset contract test**

Create a calibration with Button box, Brightness, Wi-Fi, and a custom Button.
Assert:

```ts
expect(preset.visualOrder).toEqual([
  "buttonBox", "brightness", "button-1", "button-2",
]);
expect(preset.goodLockOrder).toEqual([
  "buttonBox", "brightness", "button-1", "button-2",
]);
expect(preset.panels.buttonBox.family).toBe("control");
expect(preset.panels["button-1"].family).toBe("button");
expect(preset.panels["button-1"].buttonIdentifier?.referenceCellSize)
  .toBe(Math.min(outerRect.width / 4, outerRect.height / 6));
expect(Object.keys(preset.panels)).toEqual([
  "buttonBox", "brightness", "button-1", "button-2",
]);
```

Use a fixture that includes Media player to separately prove Control Good Lock
order is Button box, Media player, Brightness, Volume even though Control visual
order remains Button box, Brightness, Volume, Media player. Assert preset width,
height, and `customizationArea` exactly match the combined calibration.

- [ ] **Step 3: Run the naming and preset tests and confirm failure**

Run:

```bash
npm test -- --runInBand \
  __tests__/combined-export-names.test.ts \
  __tests__/combined-preset.test.ts \
  __tests__/button-labels.test.ts
```

- [ ] **Step 4: Extract reusable Button filename bases without changing Buttons-only**

In `button-export-names.ts`, expose:

```ts
export function createButtonFileNameSlugs(labels: string[]): string[];
```

It returns duplicate-safe slugs such as `wi-fi`, `wi-fi-2`, and `button`.
Keep `createButtonFileNames(labels)` as a thin sequence formatter over those
slugs so existing Buttons-only names remain byte-for-byte unchanged.

- [ ] **Step 5: Implement family-aware contiguous names**

In `combined-export-names.ts`, map Control IDs to `button-box`, `brightness`,
`volume`, and `media-player`; prefix every entry with a two-digit combined
sequence and `control-` or `button-`:

```ts
export function createCombinedPanelFileNames(
  controlsInExportOrder: ControlPanelId[],
  buttonLabels: string[],
): string[];
```

Never derive Control filenames from translated labels.

- [ ] **Step 6: Share Button definition construction and build the mixed preset**

Extract this helper from `createButtonsPreset()` while retaining its existing
call path:

```ts
interface CreateButtonPanelDefinitionsInput {
  buttons: ButtonCalibrationItem[];
  fileNames: string[];
  grid: AdvancedSnapGrid;
  outerRect: PanelRect;
}

export function createButtonPanelDefinitions(
  input: CreateButtonPanelDefinitionsInput,
): Record<string, PanelDefinition>;
```

Implement:

```ts
export function createCombinedPreset(
  calibration: AdvancedCombinedCalibration,
): QuickPanelPreset;
```

Build enabled Control definitions from `createAdvancedPreset()`, replace their
filenames with the combined sequence, omit disabled Controls from the combined
panel dictionary, build Button definitions with the shared helper and remaining
filenames, and merge both dictionaries. Use preset ID
`one-ui-8-5-combined`; use enabled Controls in existing visual order followed
by Buttons for `visualOrder`, and Controls in existing Good Lock order followed
by Buttons for `goodLockOrder`.

- [ ] **Step 7: Run the focused naming/preset suites**

Run the command from Step 3. Expected: all suites pass and existing Buttons-only
filename tests remain unchanged.

---

### Task 4: Integrate combined state into Zustand transitions

**Files:**

- Modify: `src/features/quick-panel/store/quick-panel-defaults.ts`
- Modify: `src/features/quick-panel/store/quick-panel-transitions.ts`
- Modify: `src/features/quick-panel/store/quick-panel-store.ts`
- Modify: `src/features/quick-panel/store/selectors.ts`
- Modify: `__tests__/quick-panel-transitions.test.ts`
- Modify: `__tests__/advanced-calibration-state.test.ts`
- Modify: `__tests__/quick-panel-store-errors.test.ts`

**Interfaces:**

- Consumes: Tasks 1–3 types, storage, draft helpers, and combined preset.
- Produces: `advancedCombinedCalibration`, `advancedCombinedDraft`, dedicated
  combined store actions, target-aware preset selection, recalibration, save,
  and last-successful-export state.

- [ ] **Step 1: Add failing transition and store tests**

Cover these observable transitions:

```ts
expect(selectAdvancedTarget("combined")).toBe(false);
expect(store.step).toBe("advancedCalibration");

// After a saved combined calibration is injected:
expect(selectAdvancedTarget("combined")).toBe(true);
expect(store.step).toBe("imageSelection");
expect(store.activePreset.id).toBe("one-ui-8-5-combined");
```

Add a successful combined calibration save case that preserves Default,
Controls-only, and Buttons-only calibrations. Add a successful export case
that persists `lastExportedAdvancedTarget === "combined"`. Add distinct errors
for empty combined Controls, empty combined Buttons, and invalid final geometry.

- [ ] **Step 2: Run the three store suites and confirm failure**

Run:

```bash
npm test -- --runInBand \
  __tests__/quick-panel-transitions.test.ts \
  __tests__/advanced-calibration-state.test.ts \
  __tests__/quick-panel-store-errors.test.ts
```

- [ ] **Step 3: Extend initial state and preset selection**

Add to `QuickPanelStateData`:

```ts
advancedCombinedCalibration: AdvancedCombinedCalibration | null;
advancedCombinedDraft: AdvancedCombinedDraft | null;
```

Load `saved.advancedCombined` during initialization. Extend
`getPresetForMode(...)` with an `advancedCombinedCalibration` parameter and a
`target === "combined"` branch calling `createCombinedPreset()`.

Every reset/landing/mode-selection transition must clear only in-progress
combined draft state, not saved combined calibration.

- [ ] **Step 4: Add dedicated combined transitions**

Add:

```ts
export function getAdvancedCombinedCalibrationState(
  calibration: AdvancedCombinedCalibration | null,
): QuickPanelStatePatch;

export function getAcceptAdvancedCombinedCalibrationResult(
  calibration: AdvancedCombinedCalibration,
): QuickPanelStatePatch;
```

The first selects Advanced/combined, sets `step: "advancedCalibration"`, seeds
an empty-screenshot combined draft from saved selections/geometry, and clears
the two released drafts. The acceptance result sets the combined preset,
stores the calibration in state, clears the combined draft, and moves to
`imageSelection`.

- [ ] **Step 5: Add explicit combined store actions**

Add these signatures to `QuickPanelState`:

```ts
setCombinedScreenshot: (screenshot: PickedImage, suggestedOuter: PanelRect) => void;
setCombinedOuterRect: (rect: PanelRect) => void;
confirmCombinedOuterRect: () => void;
setCombinedEnabledControls: (ids: ControlPanelId[]) => void;
setCombinedButtons: (buttons: ButtonCalibrationItem[]) => void;
setCombinedPanels: (panels: PanelRects) => void;
acceptCombinedCalibration: (grid: AdvancedSnapGrid) => boolean;
```

Implement them with the pure Task 2 helpers. `setCombinedPanels` maps Control
IDs back into `controlPanels` and Button IDs back into ordered Button items.
`acceptCombinedCalibration` writes all four calibration branches in one
`saveCalibrations()` call and never clears valid siblings.

Update the existing Default, Controls-only, and Buttons-only acceptance save
calls to pass through `advancedCombined: state.advancedCombinedCalibration`.
This prevents a later recalibration of a released target from erasing the new
combined branch.

Keep the existing `setAdvanced*` actions binary between Controls-only and
Buttons-only; do not add combined nesting to them.

- [ ] **Step 6: Route target selection and recalibration through combined state**

Update `selectAdvancedTarget`, `getModeState`, and `goToAdvancedCalibration` so
each target checks and selects its own calibration. Add combined data/actions
to a dedicated `quickPanelSelectors.combinedCalibrationScreen`; add
`selectedAdvancedTarget` to `customizeScreen` so Customize can choose the
correct intensity store in Task 7.

- [ ] **Step 7: Run focused store suites**

Run the command from Step 2. Expected: all pass without changing released
target expectations.

---

### Task 5: Expose the third target and localize combined guidance

**Files:**

- Modify: `src/features/quick-panel/select-mode/AdvancedTargetSelection.tsx`
- Modify: `src/features/quick-panel/select-mode/SelectModeScreen.tsx`
- Modify: `i18next/locales/en.ts`
- Modify: `i18next/locales/zh.ts`
- Modify: `__tests__/select-mode-screen-layout.test.tsx`
- Modify: `__tests__/locales.test.ts`

**Interfaces:**

- Consumes: Task 1 `AdvancedTarget` and Task 4 target-aware store flow.
- Produces: a visible, selectable `Controls + Buttons` target and complete
  English/Traditional Chinese copy for combined selection, calibration, and
  validation.

- [ ] **Step 1: Write failing selection and locale tests**

Render the Advanced target selection, press the combined row, and assert
`onSelectTarget("combined")`. In the screen test, seed last exported mode as
Advanced and target as combined, enter target selection, and assert its radio
is preselected without skipping the target-selection screen.

Extend locale tests to require the same new keys in both locales:

```ts
mode.advancedCombined
mode.advancedCombinedDescription
advancedCalibration.combinedOuterSubtitle
advancedCalibration.combinedControlSelectionSubtitle
advancedCalibration.combinedButtonSelectionSubtitle
advancedCalibration.combinedGridSubtitle
advancedCalibration.combinedConfirmSubtitle
advancedCalibration.combinedGridSheetSubtitle
errors.selectCombinedControl
errors.selectCombinedButton
errors.combinedPanelOverlap
errors.invalidCombinedPanels
preset.combinedLabel
```

- [ ] **Step 2: Run the mode and locale tests and confirm failure**

Run:

```bash
npm test -- --runInBand \
  __tests__/select-mode-screen-layout.test.tsx \
  __tests__/locales.test.ts
```

- [ ] **Step 3: Add the third target row**

Append this row after Buttons-only:

```tsx
<TargetRow
  isSelected={selectedTarget === "combined"}
  title={t("mode.advancedCombined")}
  body={t("mode.advancedCombinedDescription")}
  onPress={() => onSelectTarget("combined")}
/>
```

Keep the existing two-step Select Mode behavior. Update the general Advanced
description so it names all three targets.

- [ ] **Step 4: Add exact English and Traditional Chinese copy**

Use concise product terminology consistent with the existing locales:

```ts
// English
advancedCombined: "Controls + Buttons",
advancedCombinedDescription:
  "One image across selected Controls and Quick Panel Buttons.",
combinedOuterSubtitle: "Wrap every Control and Button you want to calibrate",
combinedControlSelectionSubtitle: "Choose the Controls in this region",
combinedButtonSelectionSubtitle: "Choose the Quick Panel Buttons in this region",
combinedGridSubtitle: "Set one grid for every selected Control and Button",
combinedConfirmSubtitle: "Review all Control and Button boxes before saving",
combinedGridSheetSubtitle:
  "Choose row and column counts that place the grid dots in the gaps around both Controls and Buttons.",
selectCombinedControl: "Select at least one Control to continue.",
selectCombinedButton: "Select at least one Button to continue.",
combinedPanelOverlap:
  "Move or resize the current box so it does not overlap a completed box.",
invalidCombinedPanels: "Check every selected Control and Button box before saving.",
combinedLabel: "One UI 8.5 combined Controls and Buttons layout",
```

```ts
// Traditional Chinese
advancedCombined: "控制版面 + 按鈕",
advancedCombinedDescription: "用同一張圖片連接所選控制版面與 Quick Panel 按鈕。",
combinedOuterSubtitle: "框住所有要校正的控制版面與按鈕",
combinedControlSelectionSubtitle: "選擇這個區域中的控制版面",
combinedButtonSelectionSubtitle: "選擇這個區域中的 Quick Panel 按鈕",
combinedGridSubtitle: "為所有所選控制版面與按鈕設定同一格線",
combinedConfirmSubtitle: "儲存前確認所有控制版面與按鈕方框",
combinedGridSheetSubtitle: "選擇能讓格線圓點落在控制版面與按鈕周圍留白處的列數與欄數。",
selectCombinedControl: "請至少選擇一個控制版面再繼續。",
selectCombinedButton: "請至少選擇一個按鈕再繼續。",
combinedPanelOverlap: "請移動或調整目前方框，避免與已完成的方框重疊。",
invalidCombinedPanels: "儲存前請檢查所有所選控制版面與按鈕方框。",
combinedLabel: "One UI 8.5 控制版面與按鈕組合版面",
```

- [ ] **Step 5: Run the mode and locale tests**

Run the command from Step 2. Expected: both suites pass.

---

### Task 6: Add the dedicated combined calibration controller and screen

**Files:**

- Create: `src/features/quick-panel/calibration/advanced/combined/hooks/useCombinedCalibrationScreen.ts`
- Create: `src/features/quick-panel/calibration/advanced/combined/CombinedCalibrationScreen.tsx`
- Create: `src/features/quick-panel/calibration/advanced/combined/CombinedSelectionStep.tsx`
- Create: `src/features/quick-panel/calibration/advanced/ReleasedAdvancedCalibrationScreen.tsx`
- Modify: `src/features/quick-panel/calibration/advanced/AdvancedCalibrationScreen.tsx`
- Modify: `src/features/quick-panel/calibration/advanced/components/AdvancedPanelCanvas.tsx`
- Modify: `src/features/quick-panel/shared/PanelAlignmentHelpSheet.tsx`
- Modify: `src/features/quick-panel/shared/PanelAlignmentTips.tsx`
- Modify: `src/features/quick-panel/calibration/advanced/AdvancedGridSheet.tsx`
- Modify: `__tests__/advanced-calibration-screen-empty-state.test.tsx`
- Modify: `__tests__/advanced-calibration-leave-guard.test.tsx`
- Modify: `__tests__/advanced-panel-canvas-grid.test.tsx`
- Modify: `__tests__/advanced-panel-box-gesture.test.tsx`
- Create: `__tests__/combined-calibration-screen.test.tsx`
- Create: `__tests__/combined-calibration-controller.test.tsx`

**Interfaces:**

- Consumes: Tasks 2, 4, and 5 combined phase/store/copy plus existing image
  picker, selection components, grid controls, canvas, gestures, help sheets,
  and leave dialog.
- Produces: target dispatch at `/advanced-calibration`, the exact combined
  phase flow, active-overlap blocking, Back pending behavior, and approved box
  colors.

- [ ] **Step 1: Lock released routing and reusable canvas behavior with tests**

Add assertions that `AdvancedCalibrationScreen` renders the released screen
for `controls` and `buttons`, and the new combined screen only for `combined`.
Refactor the canvas test contract to pass explicit values:

```tsx
<AdvancedPanelCanvas
  activePanelId="button-1"
  isReview={false}
  visiblePanelIds={["buttonBox", "button-1"]}
  {...sharedProps}
/>
```

Assert it renders only those IDs, shows the grid while `isReview={false}`, and
hides it during review. Preserve current gesture tests.

- [ ] **Step 2: Write failing combined controller tests**

Drive the hook through:

```text
outer -> controlSelection -> buttonSelection -> grid -> enabled Controls
-> selected Buttons -> confirm
```

Assert:

- outer starts with saved grid or the existing default-grid suggestion;
- grid controls clamp direct and increment/decrement changes to `1..8`;
- leaving at outer calls router Back immediately;
- leaving after outer opens the existing leave dialog;
- empty selections use their family-specific errors;
- active overlap leaves the phase unchanged and sets
  `errors.combinedPanelOverlap`;
- Back to an earlier panel passes only the earlier completed prefix to canvas;
- final save calls `acceptCombinedCalibration(grid)` and dismisses to Customize
  only on success.

- [ ] **Step 3: Run the calibration suites and confirm failure**

Run:

```bash
npm test -- --runInBand \
  __tests__/advanced-calibration-screen-empty-state.test.tsx \
  __tests__/advanced-calibration-leave-guard.test.tsx \
  __tests__/advanced-panel-canvas-grid.test.tsx \
  __tests__/advanced-panel-box-gesture.test.tsx \
  __tests__/combined-calibration-screen.test.tsx \
  __tests__/combined-calibration-controller.test.tsx
```

- [ ] **Step 4: Preserve the released controller behind a target dispatcher**

Move the current screen presentation unchanged into
`ReleasedAdvancedCalibrationScreen.tsx`. Keep
`useAdvancedCalibrationScreen()` unchanged except for the explicit reusable
canvas props required below. Make `AdvancedCalibrationScreen.tsx` a small
dispatcher:

```tsx
export function AdvancedCalibrationScreen() {
  const selectedTarget = useQuickPanelStore(
    (state) => state.selectedAdvancedTarget,
  );
  return selectedTarget === "combined"
    ? <CombinedCalibrationScreen />
    : <ReleasedAdvancedCalibrationScreen />;
}
```

Do not create a new route.

- [ ] **Step 5: Make the shared canvas phase-agnostic**

Replace its `phase` prop with:

```ts
interface Props {
  activePanelId: PanelId | null;
  isReview: boolean;
  visiblePanelIds: PanelId[];
  // retain grid, panelItems, outerRect, panels, screenshot, onPanelsChange
}
```

The released screen computes these values through existing
`isPanelPhase()`/`getVisiblePanelIds()`. The combined screen computes them
through Task 2 helpers. Keep `AdvancedPanelBox` unchanged: it already renders
active Controls purple, active Buttons blue, and completed panels orange.

- [ ] **Step 6: Implement the dedicated combined hook**

The hook owns screen-local `phase`, `grid`, resume phase, leave-dialog state,
and screenshot importing. It reads and invokes only the dedicated combined
store fields/actions. Expose a stable presentation object containing:

```ts
interface CombinedCalibrationScreenState {
  draft: AdvancedCombinedDraft | null;
  phase: CombinedCalibrationPhase;
  grid: AdvancedSnapGrid;
  panelItems: EditablePanelItem[];
  panels: PanelRects | null;
  visiblePanelIds: PanelId[];
  activePanelId: PanelId | null;
  activePanelFamily: PanelFamily | null;
  canGoBack: boolean;
  isControlSelectionPhase: boolean;
  isButtonSelectionPhase: boolean;
  isGridPhase: boolean;
  isConfirmPhase: boolean;
  isOuterPhase: boolean;
  isLeaveDialogOpen: boolean;
  error: string | null;
  errorKey: string | null;
  // event handlers for import, Back, Next, save, grid, selection, and panels
}
```

On a panel Next press, validate only the current visible prefix. Set the
specific overlap error and keep the phase unchanged. Future rectangles are not
in `visiblePanelIds`, so they neither render nor block. Final save delegates to
the store's all-panel validation.

- [ ] **Step 7: Compose the combined screen from released primitives**

`CombinedSelectionStep.tsx` renders `AdvancedPanelSelection` during
`controlSelection` and `ButtonPanelSelection` during `buttonSelection`.
`CombinedCalibrationScreen.tsx` uses `OuterCalibrationStep`,
`AdvancedCalibrationControls`, `AdvancedPanelCanvas`, the existing leave
dialog, and existing help sheets. Keep each new `.tsx` file below 150 lines.

For alignment help, change `PanelAlignmentHelpSheet` and
`PanelAlignmentTips` to consume `family: PanelFamily` instead of inferring from
the target. Released flows pass `button` for Buttons-only and `control` for
Controls-only; combined passes the active panel family. `AdvancedGridSheet`
continues accepting `AdvancedTarget` and selects the combined grid subtitle
when target is combined.

- [ ] **Step 8: Run the focused calibration suites**

Run the command from Step 3. Expected: all released and combined calibration
tests pass.

---

### Task 7: Isolate combined Button intensity while sharing identifier settings

**Files:**

- Modify: `src/features/quick-panel/customize/hooks/useCustomizeScreen.ts`
- Modify: `src/features/quick-panel/customize/hooks/useButtonCustomizeControls.ts`
- Modify: `src/features/quick-panel/customize/CustomizeScreen.tsx`
- Modify: `__tests__/button-customize-controls-hook.test.ts`
- Modify: `__tests__/customize-screen-export-surfaces.test.tsx`
- Modify: `__tests__/panel-image-intensity.test.tsx`

**Interfaces:**

- Consumes: Task 1 intensity storage and Task 4 selected target selector.
- Produces: target-aware `useButtonCustomizeControls(preset, target)` where only
  image intensity changes persistence owner; all identifier settings stay
  shared.

- [ ] **Step 1: Write failing hook persistence-isolation tests**

Seed Buttons-only intensity `84`, combined intensity `63`, and shared
identifier values. Render both targets separately and assert:

```ts
expect(buttons.result.current.buttonPanelOpacity).toBe(84);
expect(combined.result.current.buttonPanelOpacity).toBe(63);
```

Change combined intensity to `42`; assert the separate key becomes `42` while
`loadButtonCustomizeSettings().buttonPanelOpacity` remains `84`. Change shared
visibility, identifier opacity, positions, color, and Light/Dark appearance
from combined; render Buttons-only again and assert it sees those changes.

Add a missing/invalid combined intensity case that renders `78`.

- [ ] **Step 2: Write a failing mixed Customize parity test**

Use a preset containing one Control and two Buttons. Seed target `combined` and
assert the same `0.78` Button opacity and shared identifier props reach
`QuickPanelPreview` and `ExportSurfaceHost`. Move the slider to `35`; assert
both receive `0.35`. Keep the existing Controls preview `0.5` and export `1`
assertions in `panel-image-intensity.test.tsx`.

- [ ] **Step 3: Run the three Customize suites and confirm failure**

Run:

```bash
npm test -- --runInBand \
  __tests__/button-customize-controls-hook.test.ts \
  __tests__/customize-screen-export-surfaces.test.tsx \
  __tests__/panel-image-intensity.test.tsx
```

- [ ] **Step 4: Make only Button image intensity target-aware**

Change the hook signature to:

```ts
export function useButtonCustomizeControls(
  preset: QuickPanelPreset,
  target: AdvancedTarget | null,
): ButtonCustomizeControlState;
```

Initialize `settings` from `loadButtonCustomizeSettings()` as today. Initialize
a separate `combinedButtonPanelOpacity` from
`loadCombinedButtonImageIntensity()`. Return the combined value only when
`target === "combined"`.

Implement `setButtonPanelOpacity(value)` as:

```ts
if (target === "combined") {
  const next = Math.min(100, Math.max(0, value));
  setCombinedButtonPanelOpacity(next);
  saveCombinedButtonImageIntensity(next);
  return;
}
updateSetting("buttonPanelOpacity", value);
```

Keep every identifier getter/setter on the existing `settings` object and key.

- [ ] **Step 5: Thread the selected target into Customize**

Return `selectedAdvancedTarget` from `useCustomizeScreen()` and call:

```ts
const buttonControls = useButtonCustomizeControls(
  activePreset,
  selectedAdvancedTarget,
);
```

Do not change `PanelSlice`, `ExportSurface`, image normalization, preview proxy,
or transform logic; they are already family-aware and shared-coordinate.

- [ ] **Step 6: Run the focused Customize suites**

Run the command from Step 3. Expected: all pass, including Buttons-only
round-trip behavior.

---

### Task 8: Prove mixed export ordering, failure atomicity, Result order, and regressions

**Files:**

- Modify: `__tests__/sequential-export.test.tsx`
- Modify: `__tests__/result-screen-layout.test.tsx`
- Modify: `__tests__/customize-screen.test.tsx`
- Modify: `__tests__/advanced-calibration-state.test.ts`
- Modify: `__tests__/storage.test.ts`
- Modify: `__tests__/locales.test.ts`
- No production file is expected to change in this task. If a new assertion
  fails, invoke `superpowers:systematic-debugging`, identify the exact generic
  export or Result contract violation, and keep the fix within that owning
  module.

**Interfaces:**

- Consumes: final combined preset and the existing generic sequential export,
  capture cleanup, generated export state, and Result input order.
- Produces: regression evidence that the mixed target needs no separate export
  or Result pipeline.

- [ ] **Step 1: Add a mixed preset to sequential export tests**

Use Good Lock order:

```ts
["buttonBox", "mediaPlayer", "brightness", "button-1", "button-2"]
```

Assert one mounted surface at a time, Controls advance after image readiness,
horizontal Buttons wait for image plus identifier position, captured filenames
match the family-aware contiguous sequence, and `saveCapturedExports()`
receives the exact same order.

- [ ] **Step 2: Add mixed failure cleanup coverage**

Fail capture on the first Button after two Controls have completed. Assert both
temporary Control captures are deleted, media save is never called, Result
navigation never occurs, and store exports remain empty. Retain the existing
media-save failure case.

- [ ] **Step 3: Assert Result preserves supplied mixed order**

Pass mixed `GeneratedExport[]` into `ExportSuccessPanel` or capture its props
from `ResultScreen`. Assert labels render in Controls-first then Buttons order;
do not sort in Result.

- [ ] **Step 4: Run all focused feature suites together**

Run:

```bash
npm test -- --runInBand \
  __tests__/storage.test.ts \
  __tests__/combined-calibration-state.test.ts \
  __tests__/combined-calibration-steps.test.ts \
  __tests__/combined-export-names.test.ts \
  __tests__/combined-preset.test.ts \
  __tests__/quick-panel-transitions.test.ts \
  __tests__/quick-panel-store-errors.test.ts \
  __tests__/select-mode-screen-layout.test.tsx \
  __tests__/combined-calibration-screen.test.tsx \
  __tests__/combined-calibration-controller.test.tsx \
  __tests__/button-customize-controls-hook.test.ts \
  __tests__/customize-screen-export-surfaces.test.tsx \
  __tests__/panel-image-intensity.test.tsx \
  __tests__/sequential-export.test.tsx \
  __tests__/result-screen-layout.test.tsx \
  __tests__/locales.test.ts
```

Expected: every focused suite passes.

- [ ] **Step 5: Run the complete automated verification gate**

Run exactly:

```bash
npm test -- --runInBand
npm run lint
npx tsc --noEmit
git diff --check
```

Expected: Jest exits zero with no failed suites, Expo lint exits zero,
TypeScript reports no errors, and `git diff --check` prints nothing.

- [ ] **Step 6: Audit scope and hand off manual QA**

Run:

```bash
git status --short
git diff --stat
rg -n "combined|advancedCombined|combined-button-image-intensity" \
  src i18next __tests__
```

Confirm there are no dependency, version, release-announcement, flow-image, or
unrelated Default/single-family changes. Report automated results and leave
these checks to the user on a physical Samsung device: first calibration,
recalibration, overlapping starting boxes, snap/haptic feel, seamless shared
image, `78%` first use and persistence, QuickStar application order, filename
uniqueness, and visual comparison of every exported PNG.

Suggested commit message for the user:

```text
feat: add combined Controls and Buttons mode
```
