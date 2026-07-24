# Optional Advanced Snapping Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:executing-plans` to implement this plan inline, task by task. Do
> not use subagents. Do not commit or push.

**Goal:** Add a per-target, persisted switch that makes Advanced calibration's
snapping grid optional without resetting existing calibration data.

**Architecture:** Store `isGridEnabled` beside each Advanced calibration's
existing grid dimensions, defaulting missing or invalid saved values to `true`.
Keep the dimensions intact while disabled, but branch the canvas and gesture
paths so the overlay, snapping, and snap haptics are absent while ordinary
clamping remains active.

**Tech Stack:** Expo 56, React Native 0.85, TypeScript, Zustand, MMKV, AniUI
`Switch`, Gesture Handler, Reanimated/worklets, Jest, Testing Library.

## Global Constraints

- Use the existing `src/components/ani-ui/switch.tsx`; add no dependency.
- Preserve existing local data. Missing `isGridEnabled` values load as `true`.
- Persist Controls-only and Buttons-only choices independently.
- Retain row and column values while snapping is disabled.
- Default mode and export geometry remain unchanged.
- Use interfaces and type-safe TypeScript; do not add `any`.
- Do not add `useMemo`, `useCallback`, or `React.memo` outside AniUI.
- Do not commit or push.

---

### Task 1: Persist the Grid-Enabled Flag Safely

**Files:**

- Modify: `src/features/quick-panel/model/types.ts:53-101`
- Modify: `src/features/quick-panel/store/advanced-calibration-state.ts:44-111`
- Modify: `src/features/quick-panel/store/quick-panel-store.ts:58-77,217-245`
- Modify: `src/features/quick-panel/store/storage.ts:158-237`
- Test: `__tests__/advanced-calibration-state.test.ts`
- Test: `__tests__/storage.test.ts`

**Interfaces:**

- Produces: `AdvancedCalibration.isGridEnabled: boolean`
- Produces: `AdvancedButtonsCalibration.isGridEnabled: boolean`
- Produces: `getCalibrationFromDraft(draft, grid, isGridEnabled)`
- Produces: `getButtonsCalibrationFromDraft(draft, grid, isGridEnabled)`
- Produces: `acceptAdvancedCalibration(grid, isGridEnabled): boolean`

- [x] **Step 1: Write failing state-construction tests**

Extend `__tests__/advanced-calibration-state.test.ts` so both builders preserve
the explicit toggle value:

```ts
it("stores the Controls snapping preference", () => {
  const result = getCalibrationFromDraft(createDraft(createPanels()), grid, false);

  expect(result?.isGridEnabled).toBe(false);
  expect(result?.grid).toEqual(grid);
});

it("stores the Buttons snapping preference", () => {
  const result = getButtonsCalibrationFromDraft({
    screenshot: { uri: "file:///screenshot.png", width: 100, height: 100 },
    outerRect: { x: 0, y: 0, width: 100, height: 100, radius: 0 },
    buttons: [
      {
        id: "button-1",
        label: "Wi-Fi",
        customIconId: null,
        rect: { x: 0, y: 0, width: 40, height: 40, radius: 0 },
      },
    ],
  }, grid, false);

  expect(result?.isGridEnabled).toBe(false);
  expect(result?.grid).toEqual(grid);
});
```

Update existing calls in this test file to pass `true` as the third argument.

- [x] **Step 2: Write failing storage compatibility tests**

Add `isGridEnabled: true` to `currentCalibrations.advancedControls` and
`isGridEnabled: false` to `currentCalibrations.advancedButtons`. Then add:

```ts
it("defaults missing or invalid snapping preferences to enabled", () => {
  const mmkvStore = (globalThis as typeof globalThis & MmkvTestGlobal)
    .__mmkvStore;
  const legacyControls = { ...currentCalibrations.advancedControls };
  const legacyButtons = { ...currentCalibrations.advancedButtons };
  delete (legacyControls as Partial<typeof legacyControls>).isGridEnabled;
  Object.assign(legacyButtons, { isGridEnabled: "off" });

  mmkvStore?.set("quick-panel.calibrations", JSON.stringify({
    default: null,
    advancedControls: legacyControls,
    advancedButtons: legacyButtons,
  }));

  const loaded = loadCalibrations();
  expect(loaded.advancedControls?.isGridEnabled).toBe(true);
  expect(loaded.advancedButtons?.isGridEnabled).toBe(true);
});
```

The existing round-trip test must continue to assert the full payload,
including different values for the two Advanced branches.

- [x] **Step 3: Run the focused tests and verify RED**

Run:

```bash
npm test -- --runInBand __tests__/advanced-calibration-state.test.ts __tests__/storage.test.ts
```

Expected: FAIL because the calibration types/builders and storage parser do not
yet expose `isGridEnabled`.

- [x] **Step 4: Add the model field and thread it through save construction**

Add the required field to both saved calibration interfaces:

```ts
export interface AdvancedCalibration {
  screenshotWidth: number;
  screenshotHeight: number;
  grid: AdvancedSnapGrid;
  isGridEnabled: boolean;
  outerRect: PanelRect;
  enabledPanels: ControlPanelId[];
  panels: ControlPanelRects;
}

export interface AdvancedButtonsCalibration {
  screenshotWidth: number;
  screenshotHeight: number;
  grid: AdvancedSnapGrid;
  isGridEnabled: boolean;
  outerRect: PanelRect;
  buttons: ButtonCalibrationItem[];
}
```

Change both builder signatures and returned objects:

```ts
export function getCalibrationFromDraft(
  draft: AdvancedCalibrationDraft | null,
  grid: AdvancedSnapGrid,
  isGridEnabled: boolean,
): AdvancedCalibration | null {
  // existing validation
  return {
    screenshotWidth: draft.screenshot.width,
    screenshotHeight: draft.screenshot.height,
    grid,
    isGridEnabled,
    outerRect: draft.outerRect,
    enabledPanels: draft.enabledPanels,
    panels: draft.panels,
  };
}
```

Apply the same third parameter and field to
`getButtonsCalibrationFromDraft`. Update `QuickPanelState` and the store action:

```ts
acceptAdvancedCalibration: (
  grid: AdvancedSnapGrid,
  isGridEnabled: boolean,
) => boolean;
```

Pass both values into the correct builder for Controls and Buttons.

- [x] **Step 5: Parse old and malformed toggle values without invalidating data**

Add one helper in `storage.ts`:

```ts
function parseGridEnabled(value: unknown): boolean {
  return typeof value === "boolean" ? value : true;
}
```

Include `isGridEnabled: parseGridEnabled(item.isGridEnabled)` in both parsed
Advanced calibration return objects. Do not change the current unversioned
`quick-panel.calibrations` key or reject either branch solely because this new
field is absent or malformed.

- [x] **Step 6: Run focused tests and verify GREEN**

Run:

```bash
npm test -- --runInBand __tests__/advanced-calibration-state.test.ts __tests__/storage.test.ts
```

Expected: both suites PASS.

- [x] **Step 7: Review checkpoint**

Run `git diff --check` and inspect `git diff --` for only the files in this
task. Do not stage or commit.

---

### Task 2: Disable Snapping While Preserving Clamping

**Files:**

- Modify: `src/features/quick-panel/calibration/advanced/advanced-panel-gesture.ts`
- Modify: `src/features/quick-panel/calibration/advanced/hooks/useAdvancedPanelMoveGesture.ts`
- Modify: `src/features/quick-panel/calibration/advanced/hooks/useAdvancedPanelResizeGesture.ts`
- Modify: `src/features/quick-panel/calibration/advanced/components/AdvancedPanelResizeHandle.tsx`
- Modify: `src/features/quick-panel/calibration/advanced/components/AdvancedPanelBox.tsx`
- Modify: `src/features/quick-panel/calibration/advanced/components/AdvancedPanelCanvas.tsx`
- Test: `__tests__/advanced-panel-gesture.test.ts`
- Create: `__tests__/advanced-panel-canvas-grid.test.tsx`

**Interfaces:**

- Consumes: `isGridEnabled: boolean` from the screen hook.
- Produces: `AdvancedPanelMoveInput.isGridEnabled: boolean`
- Produces: `AdvancedPanelCanvas` and `AdvancedPanelBox` required
  `isGridEnabled` props.
- Preserves: `SnapResult = { rect: PanelRect; snapKey: string | null }`.

- [x] **Step 1: Write failing free-movement and free-resize tests**

Update existing gesture calls to pass `isGridEnabled: true`, then add:

```ts
it("moves freely without a snap key when the grid is disabled", () => {
  const result = getAdvancedPanelMoveResult({
    dx: 47,
    dy: 0,
    grid: { columns: 3, rows: 4 },
    isGridEnabled: false,
    outerRect,
    scale: 1,
    startRect,
  });

  expect(result.rect.x).toBe(97);
  expect(result.snapKey).toBeNull();
});

it("resizes freely but remains clamped when the grid is disabled", () => {
  const free = getAdvancedPanelResizeResult({
    dx: 47,
    dy: 0,
    grid: { columns: 3, rows: 4 },
    isGridEnabled: false,
    outerRect,
    position: "bottomRight",
    scale: 1,
    startRect,
  });
  const clamped = getAdvancedPanelMoveResult({
    dx: 400,
    dy: 500,
    grid: { columns: 3, rows: 4 },
    isGridEnabled: false,
    outerRect,
    scale: 1,
    startRect,
  });

  expect(free.rect).toMatchObject({ width: 127, height: 100 });
  expect(free.snapKey).toBeNull();
  expect(clamped.rect).toMatchObject({ x: 220, y: 300 });
});
```

- [x] **Step 2: Write the failing canvas visibility/propagation test**

Create `__tests__/advanced-panel-canvas-grid.test.tsx`. Mock `expo-image`,
`AdvancedSnapGridOverlay`, and `AdvancedPanelBox` as simple test nodes. Render a
grid-phase canvas twice with the same fixture and assert:

```ts
expect(screen.queryByTestId("advanced-snap-grid-overlay")).toBeNull();
expect(screen.getByTestId("advanced-panel-buttonBox").props.isGridEnabled)
  .toBe(false);
```

For the enabled render, assert the overlay exists and the panel receives
`isGridEnabled: true`. Keep the fixture minimal: one `buttonBox` item, a
`300 x 400` screenshot/outer rect, and an `onPanelsChange` spy.

- [x] **Step 3: Run focused tests and verify RED**

Run:

```bash
npm test -- --runInBand __tests__/advanced-panel-gesture.test.ts __tests__/advanced-panel-canvas-grid.test.tsx
```

Expected: FAIL because geometry and canvas props do not accept the toggle and
the overlay is always rendered outside the confirm phase.

- [x] **Step 4: Add the unsnapped geometry branch**

Import `clampPanelRect` and `clampResizedPanelRect` from `panel-constraints`.
Add `isGridEnabled` to `AdvancedPanelMoveInput`, then branch after calculating
the raw gesture rectangle:

```ts
const movedRect = {
  ...startRect,
  x: startRect.x + dx / scale,
  y: startRect.y + dy / scale,
};

if (!isGridEnabled) {
  return {
    rect: clampPanelRect(movedRect, outerRect),
    snapKey: null,
  };
}

return snapMovedPanelRect(movedRect, startRect, outerRect, grid);
```

For resize, compute `resizedRect = resizeRect(...)` once and use:

```ts
if (!isGridEnabled) {
  return {
    rect: clampResizedPanelRect(resizedRect, outerRect, position),
    snapKey: null,
  };
}
```

Then pass `resizedRect` into the existing snap function.

- [x] **Step 5: Thread the required flag through gesture components**

Add `isGridEnabled: boolean` to both gesture hook parameter interfaces,
`AdvancedPanelResizeHandle`, and `AdvancedPanelBox`. Forward it into
`getAdvancedPanelMoveResult` and `getAdvancedPanelResizeResult`.

Because disabled geometry returns `snapKey: null`, the existing hook condition
already prevents `triggerSnapHaptic`; do not add a second haptic branch.

- [x] **Step 6: Make the canvas conditional**

Add `isGridEnabled: boolean` to `AdvancedPanelCanvas` props and use:

```tsx
{isGridEnabled && phase !== "confirm" ? (
  <AdvancedSnapGridOverlay
    grid={grid}
    outerRect={localOuterRect}
    scale={scale}
  />
) : null}
```

Pass `isGridEnabled` to every `AdvancedPanelBox`.

- [x] **Step 7: Run focused tests and verify GREEN**

Run:

```bash
npm test -- --runInBand __tests__/advanced-panel-gesture.test.ts __tests__/advanced-panel-canvas-grid.test.tsx
```

Expected: both suites PASS, including unchanged enabled snapping assertions.

- [x] **Step 8: Review checkpoint**

Run `git diff --check` and inspect the Task 2 diff. Confirm the disabled branch
still calls the same constraint helpers used by snapping. Do not stage or
commit.

---

### Task 3: Add the AniUI Switch and Screen State

**Files:**

- Create: `src/features/quick-panel/calibration/advanced/components/AdvancedGridControls.tsx`
- Modify: `src/features/quick-panel/calibration/advanced/AdvancedCalibrationControls.tsx`
- Modify: `src/features/quick-panel/calibration/advanced/AdvancedCalibrationScreen.tsx`
- Modify: `src/features/quick-panel/calibration/advanced/hooks/useAdvancedCalibrationScreen.ts`
- Modify: `i18next/locales/en.ts`
- Modify: `i18next/locales/zh.ts`
- Create: `__tests__/advanced-grid-controls.test.tsx`
- Modify: `__tests__/advanced-calibration-screen-empty-state.test.tsx`

**Interfaces:**

- Consumes: `acceptAdvancedCalibration(grid, isGridEnabled)` from Task 1.
- Consumes: `AdvancedPanelCanvas.isGridEnabled` from Task 2.
- Produces from hook: `isGridEnabled: boolean` and
  `setIsGridEnabled: (enabled: boolean) => void`.
- Produces: `AdvancedGridControls` with grid values, switch state, and change
  handlers as explicit props.
- Produces in the footer shell: `isGridEnabled`, `onGridEnabledChange` props.

- [x] **Step 1: Write the failing controls interaction test**

Create `__tests__/advanced-grid-controls.test.tsx` with a translation mock that
returns keys and `i18n.resolvedLanguage: "en"`. Render the controls with
`isGridEnabled={false}` and spies for every handler. Assert:

```ts
expect(screen.getByTestId("advanced-grid-columns-chip").props.disabled)
  .toBe(true);
expect(screen.getByTestId("advanced-grid-rows-chip").props.disabled)
  .toBe(true);
expect(screen.getByTestId("advanced-grid-slider").props.accessibilityState)
  .toEqual(expect.objectContaining({ disabled: true }));

fireEvent(
  screen.getByTestId("advanced-grid-toggle"),
  "valueChange",
  true,
);
expect(onGridEnabledChange).toHaveBeenCalledWith(true);
```

Also assert the switch uses
`accessibilityLabel="advancedCalibration.gridToggleLabel"` and that the Grid
Help button remains rendered while disabled.

- [x] **Step 2: Extend the screen wiring test before implementation**

In `advanced-calibration-screen-empty-state.test.tsx`, replace the null mocks
for `AdvancedCalibrationControls` and `AdvancedPanelCanvas` with capturing mock
functions. Add `isGridEnabled: false` and `setIsGridEnabled: jest.fn()` to the
hook fixture. Render a non-outer panel phase with a screenshot, outer rect,
panel item, and panels. Assert the canvas received `isGridEnabled: false`.

Render a grid-phase fixture and assert controls received:

```ts
expect(mockAdvancedCalibrationControls).toHaveBeenCalledWith(
  expect.objectContaining({
    isGridEnabled: false,
    onGridEnabledChange: screenState.setIsGridEnabled,
  }),
  undefined,
);
```

- [x] **Step 3: Run focused tests and verify RED**

Run:

```bash
npm test -- --runInBand __tests__/advanced-grid-controls.test.tsx __tests__/advanced-calibration-screen-empty-state.test.tsx
```

Expected: FAIL because the controls, hook return, and screen wiring do not yet
contain the new props.

- [x] **Step 4: Add localized accessible copy**

Add these keys under `advancedCalibration`:

```ts
// en.ts
gridToggleLabel: "Enable snapping grid",

// zh.ts
gridToggleLabel: "啟用對齊格線",
```

- [x] **Step 5: Extract the focused grid-control card**

Create `components/AdvancedGridControls.tsx` and move the current grid-card
markup, `AxisChip`, and `GridSlider` into it. Define this interface:

```ts
interface Props {
  columns: number;
  isGridEnabled: boolean;
  onColumnsChange: (value: number) => void;
  onGridEnabledChange: (enabled: boolean) => void;
  onGridHelpPress: () => void;
  onRowsChange: (value: number) => void;
  rows: number;
}
```

The component owns `activeAxis`, translated axis labels, the switch, and the
dimension controls. This keeps `AdvancedCalibrationControls.tsx` focused on
footer navigation and below the repo's preferred component size.

- [x] **Step 6: Render the switch beside Grid Help and disable dimensions**

Import `Switch` from `@/components/ani-ui/switch` in the new component.

Render the right side of the control-card header as:

```tsx
<View className="flex-row items-center gap-2">
  <Switch
    accessibilityLabel={t("advancedCalibration.gridToggleLabel")}
    onValueChange={onGridEnabledChange}
    testID="advanced-grid-toggle"
    value={isGridEnabled}
  />
  <GridHelpButton
    label={t("advancedCalibration.gridHelpButton")}
    onPress={onGridHelpPress}
  />
</View>
```

Add `disabled: boolean` and `testID: string` to `AxisChip`; pass `disabled` to
`Pressable`, apply `opacity-50` when disabled, and assign stable IDs for columns
and rows. Add `disabled` to `GridSlider`, pass it to `Slider`, and set
`testID="advanced-grid-slider"` plus
`accessibilityState={{ disabled }}`. Keep current values visible.

- [x] **Step 7: Integrate the card into the footer shell**

Add `isGridEnabled: boolean` and
`onGridEnabledChange: (enabled: boolean) => void` to
`AdvancedCalibrationControls` props. Replace its inline grid card with:

```tsx
{isGridPhase ? (
  <AdvancedGridControls
    columns={columns}
    isGridEnabled={isGridEnabled}
    onColumnsChange={onColumnsChange}
    onGridEnabledChange={onGridEnabledChange}
    onGridHelpPress={onGridHelpPress}
    onRowsChange={onRowsChange}
    rows={rows}
  />
) : null}
```

- [x] **Step 8: Own, restore, and save toggle state in the hook**

Derive the current saved calibration once per render:

```ts
const savedCalibration = selectedAdvancedTarget === "buttons"
  ? advancedButtonsCalibration
  : advancedCalibration;
```

Initialize beside `grid`:

```ts
const [isGridEnabled, setIsGridEnabled] = useState(
  () => savedCalibration?.isGridEnabled ?? true,
);
```

When importing a screenshot, restore both values independently:

```ts
setGrid(savedCalibration?.grid ?? getDefaultAdvancedSnapGrid(suggestedRect));
setIsGridEnabled(savedCalibration?.isGridEnabled ?? true);
```

Save with `acceptAdvancedCalibration(grid, isGridEnabled)` and return both
`isGridEnabled` and `setIsGridEnabled`. Toggling must not call `setGrid`.

- [x] **Step 9: Wire the screen**

Destructure `isGridEnabled` and `setIsGridEnabled` from the hook. Pass both to
`AdvancedCalibrationControls` as `isGridEnabled` and
`onGridEnabledChange={setIsGridEnabled}`. Pass `isGridEnabled` to
`AdvancedPanelCanvas`.

- [x] **Step 10: Run focused tests and verify GREEN**

Run:

```bash
npm test -- --runInBand __tests__/advanced-grid-controls.test.tsx __tests__/advanced-calibration-screen-empty-state.test.tsx
```

Expected: both suites PASS.

- [x] **Step 11: Review checkpoint**

Run `git diff --check`. Inspect the full feature diff and verify the pre-existing
user changes to `.aniui.json` and `src/components/ani-ui/switch.tsx` were not
rewritten. Do not stage or commit.

---

### Task 4: Full Verification

**Files:** No production changes expected.

**Interfaces:** Verifies every interface and constraint above together.

- [x] **Step 1: Run all focused feature suites together**

```bash
npm test -- --runInBand \
  __tests__/advanced-calibration-state.test.ts \
  __tests__/storage.test.ts \
  __tests__/advanced-panel-gesture.test.ts \
  __tests__/advanced-panel-canvas-grid.test.tsx \
  __tests__/advanced-grid-controls.test.tsx \
  __tests__/advanced-calibration-screen-empty-state.test.tsx
```

Expected: all listed suites PASS with zero failed tests.

- [x] **Step 2: Run the full test suite**

```bash
npm test -- --runInBand
```

Expected: all Jest suites PASS.

- [x] **Step 3: Run lint and TypeScript**

```bash
npm run lint
npx tsc --noEmit
```

Expected: both commands exit `0`. If lint reports only the already-known AniUI
slider immutability issue, report it accurately rather than changing unrelated
code; TypeScript must still pass.

- [x] **Step 4: Check the patch**

```bash
git diff --check
git status --short
```

Expected: no whitespace errors. Status includes the feature files plus the
pre-existing `.aniui.json` and untracked AniUI switch changes. Do not stage,
commit, or push.

- [x] **Step 5: Manual QA handoff**

Ask the user to verify both Advanced targets on-device:

1. Switch off: dots disappear; row/column controls dim; panels move and resize
   freely without snap haptics but cannot leave the green outer area.
2. Switch on: previous dimensions return; dots, snapping, and haptics return.
3. Save Controls with one state and Buttons with the other; revisit both and
   confirm their independent choices remain selected.

Suggested commit message only after all automated verification succeeds:

```text
feat: make advanced snapping grid optional
```
