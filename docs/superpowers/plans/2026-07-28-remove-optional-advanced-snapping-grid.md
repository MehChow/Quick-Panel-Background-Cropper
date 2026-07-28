# Remove Optional Advanced Snapping Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:executing-plans` to implement this plan inline, task-by-task.
> Steps use checkbox (`- [ ]`) syntax for tracking. Project instructions prohibit
> subagents, commits, and pushes.

**Goal:** Remove the Advanced snapping-grid toggle from Controls-only and
Buttons-only so grid controls, snapping, haptics, and grid-based Button metadata
are always active.

**Architecture:** First make the shared Advanced UI and gesture chain
unconditionally grid-driven while leaving the persisted flag inert. Then remove
that inert flag from calibration models, store flow, and serialized output while
tolerating it in existing JSON. Finish by removing obsolete localized copy and
updating current-facing documentation and manual checks.

**Tech Stack:** Expo 56, React Native 0.85, React 19.2.3, TypeScript, Zustand,
MMKV, Reanimated/Worklets, React Native Gesture Handler, Jest, React Native
Testing Library, Uniwind, AniUI.

## Global Constraints

- Work inline only; do not use or suggest subagents.
- Never commit or push.
- Read the exact [Expo SDK 56 documentation](https://docs.expo.dev/versions/v56.0.0/)
  before production-code edits.
- Do not add dependencies or replace the shared AniUI components.
- Do not use `useMemo`, `useCallback`, or `React.memo` outside
  `src/components/ani-ui`.
- Preserve Default, Advanced Controls, and Advanced Buttons calibrations and all
  unrelated preferences.
- Existing JSON containing `isGridEnabled: true` or `false` must remain valid.
- Do not change calibration preview geometry, Customize composition, Button
  identifier rules, centered-square export geometry, or PNG dimensions.
- Keep the green-area preview-strip investigation out of this change.
- Keep TypeScript interfaces explicit and avoid `any`.
- Leave device QA to the user.

---

### Task 1: Make Advanced Grid Interaction Always On

**Files:**

- Modify: `src/features/quick-panel/calibration/advanced/components/AdvancedGridControls.tsx:1-136`
- Modify: `src/features/quick-panel/calibration/advanced/AdvancedCalibrationControls.tsx:6-57`
- Modify: `src/features/quick-panel/calibration/advanced/AdvancedCalibrationScreen.tsx:27-190`
- Modify: `src/features/quick-panel/calibration/advanced/components/AdvancedPanelCanvas.tsx:18-110`
- Modify: `src/features/quick-panel/calibration/advanced/components/AdvancedPanelBox.tsx:16-103`
- Modify: `src/features/quick-panel/calibration/advanced/components/AdvancedPanelResizeHandle.tsx:8-27`
- Modify: `src/features/quick-panel/calibration/advanced/advanced-panel-gesture.ts:12-92`
- Modify: `src/features/quick-panel/calibration/advanced/hooks/useAdvancedPanelMoveGesture.ts:11-61`
- Modify: `src/features/quick-panel/calibration/advanced/hooks/useAdvancedPanelResizeGesture.ts:11-62`
- Test: `__tests__/advanced-grid-controls.test.tsx`
- Test: `__tests__/advanced-panel-canvas-grid.test.tsx`
- Test: `__tests__/advanced-panel-gesture.test.ts`
- Test: `__tests__/advanced-panel-box-gesture.test.tsx`
- Test: `__tests__/advanced-calibration-screen-empty-state.test.tsx`

**Interfaces:**

- Consumes: existing `AdvancedSnapGrid`, `snapMovedPanelRect()`,
  `snapResizedPanelRect()`, `AdvancedSnapGridOverlay`, and snap haptics.
- Produces: `AdvancedGridControls` without toggle props,
  `AdvancedPanelCanvas` without `isGridEnabled`, and gesture helpers that always
  return snapped/clamped `SnapResult` values.

- [x] **Step 1: Replace toggle-specific grid-control tests**

In `__tests__/advanced-grid-controls.test.tsx`, remove `isGridEnabled` and
`onGridEnabledChange` from `baseProps`. Replace the two toggle tests with:

```tsx
it("keeps the grid controls and help available without a toggle", () => {
  render(<AdvancedGridControls {...baseProps} />);

  expect(screen.queryByTestId("advanced-grid-toggle")).toBeNull();
  expect(screen.getByTestId("advanced-grid-columns-chip").props.disabled)
    .toBeFalsy();
  expect(screen.getByTestId("advanced-grid-rows-chip").props.disabled)
    .toBeFalsy();
  expect(screen.getByTestId("advanced-grid-slider").props.disabled)
    .toBeFalsy();
  expect(screen.getByTestId("advanced-grid-help")).toBeTruthy();
});

it("changes the active grid axis and forwards slider values", () => {
  render(<AdvancedGridControls {...baseProps} />);

  fireEvent.press(screen.getByTestId("advanced-grid-rows-chip"));
  fireEvent(
    screen.getByTestId("advanced-grid-slider"),
    "valueChange",
    6,
  );

  expect(baseProps.onRowsChange).toHaveBeenCalledWith(6);
  expect(baseProps.onColumnsChange).not.toHaveBeenCalled();
});
```

- [x] **Step 2: Run the grid-control test and verify it fails**

Run:

```bash
npm test -- --runInBand --no-cache __tests__/advanced-grid-controls.test.tsx
```

Expected: FAIL because the switch still renders and the axis controls are
disabled by `isGridEnabled`.

- [x] **Step 3: Remove the switch and disabled branches from grid controls**

In `AdvancedGridControls.tsx`:

- delete the `Switch` import;
- remove `isGridEnabled` and `onGridEnabledChange` from `Props` and the function
  parameters;
- render only `GridHelpButton` on the right side of the title row;
- remove `disabled` from `AxisChipProps` and `GridSliderProps`;
- remove `disabled`, disabled opacity, and disabled accessibility state from
  both axis chips and the slider.

The public prop contract becomes:

```ts
interface Props {
  columns: number;
  onColumnsChange: (value: number) => void;
  onGridHelpPress: () => void;
  onRowsChange: (value: number) => void;
  rows: number;
}
```

Keep `activeAxis`, the localized Col/Row labels, slider range `1...8`, step `1`,
and the existing help button unchanged.

- [x] **Step 4: Run the grid-control test and verify it passes**

Run the Step 2 command.

Expected: PASS.

- [x] **Step 5: Replace disabled-canvas and free-gesture regressions**

In `__tests__/advanced-panel-canvas-grid.test.tsx`, render
`<AdvancedPanelCanvas {...props} />` without `isGridEnabled`. Assert:

```tsx
it("always shows the overlay and gives panel boxes the grid", () => {
  render(<AdvancedPanelCanvas {...props} />);

  expect(mockAdvancedSnapGridOverlay).toHaveBeenCalledTimes(1);
  expect(mockAdvancedPanelBox).toHaveBeenCalledWith(
    expect.objectContaining({ grid: props.grid }),
  );
  expect(mockAdvancedPanelBox.mock.calls[0][0]).not.toHaveProperty(
    "isGridEnabled",
  );
});

it("hides the overlay only during confirmation", () => {
  render(<AdvancedPanelCanvas {...props} phase="confirm" />);

  expect(mockAdvancedSnapGridOverlay).not.toHaveBeenCalled();
});
```

In `__tests__/advanced-panel-gesture.test.ts`:

- remove every `isGridEnabled` input;
- delete the two free-movement tests;
- add this regression using the former disabled-grid delta:

```ts
it("always snaps movement to the configured grid", () => {
  const result = getAdvancedPanelMoveResult({
    dx: 47,
    dy: 0,
    grid: { columns: 3, rows: 4 },
    outerRect,
    scale: 1,
    startRect,
  });

  expect(result.rect.x).toBe(94);
  expect(result.snapKey).toContain("left:x:94.00");
});
```

Remove `isGridEnabled` from `baseProps` in
`__tests__/advanced-panel-box-gesture.test.tsx`.

- [x] **Step 6: Run the canvas and gesture tests and verify they fail**

Run:

```bash
npm test -- --runInBand --no-cache \
  __tests__/advanced-panel-canvas-grid.test.tsx \
  __tests__/advanced-panel-gesture.test.ts \
  __tests__/advanced-panel-box-gesture.test.tsx
```

Expected: FAIL because `isGridEnabled` remains required and `undefined` still
selects the free-movement branch.

- [x] **Step 7: Remove the disabled-grid branch from pure gesture geometry**

In `advanced-panel-gesture.ts`:

- remove `isGridEnabled` from `AdvancedPanelMoveInput`;
- remove the destructured flag from move and resize;
- delete the `clampPanelRect` and `clampResizedPanelRect` imports;
- delete both `if (!isGridEnabled)` branches.

The two function tails must be:

```ts
return snapMovedPanelRect(movedRect, startRect, outerRect, grid);
```

and:

```ts
return snapResizedPanelRect(
  resizedRect,
  startRect,
  outerRect,
  grid,
  position,
);
```

The existing snap helpers continue performing outer-area clamping.

- [x] **Step 8: Remove the flag through gesture hooks and panel components**

Remove `isGridEnabled` from:

- `Params` and function destructuring in both gesture hooks;
- calls to `getAdvancedPanelMoveResult()` and
  `getAdvancedPanelResizeResult()`;
- `AdvancedPanelBox` props;
- `AdvancedPanelResizeHandle` props;
- `AdvancedPanelCanvas` props and `AdvancedPanelBox` calls.

In `AdvancedPanelCanvas`, replace:

```tsx
{isGridEnabled && phase !== "confirm" ? (
```

with:

```tsx
{phase !== "confirm" ? (
```

Keep the grid hidden on the final confirmation phase.

- [x] **Step 9: Remove toggle wiring from the screen and footer**

In `AdvancedCalibrationControls.tsx`, remove `isGridEnabled` and
`onGridEnabledChange` from its props, destructuring, and
`<AdvancedGridControls>`.

In `AdvancedCalibrationScreen.tsx`:

- stop destructuring `isGridEnabled` and `setIsGridEnabled` from the screen
  hook;
- stop passing them to `AdvancedCalibrationControls`;
- stop passing `isGridEnabled` to `AdvancedPanelCanvas`.

Update `__tests__/advanced-calibration-screen-empty-state.test.tsx`:

- remove the two fields from `createScreenState()`;
- replace “passes the snapping preference” assertions with assertions that
  `grid` reaches the canvas and controls;
- assert neither mocked child receives `isGridEnabled` or
  `onGridEnabledChange`.

- [x] **Step 10: Run the full Task 1 focused set**

Run:

```bash
npm test -- --runInBand --no-cache \
  __tests__/advanced-grid-controls.test.tsx \
  __tests__/advanced-panel-canvas-grid.test.tsx \
  __tests__/advanced-panel-gesture.test.ts \
  __tests__/advanced-panel-box-gesture.test.tsx \
  __tests__/advanced-calibration-screen-empty-state.test.tsx
```

Expected: all suites PASS.

Do not commit.

---

### Task 2: Retire Toggle State and Preserve Legacy Calibrations

**Files:**

- Modify: `src/features/quick-panel/model/types.ts:59-97`
- Modify: `src/features/quick-panel/store/advanced-calibration-state.ts:44-114`
- Modify: `src/features/quick-panel/store/quick-panel-store.ts:73-81,220-254`
- Modify: `src/features/quick-panel/store/storage.ts:234-317`
- Modify: `src/features/quick-panel/calibration/advanced/hooks/useAdvancedCalibrationScreen.ts:51-108,220-254`
- Modify: `src/features/quick-panel/calibration/advanced/advanced-geometry.ts:77-91`
- Modify: `__tests__/export-files.test.ts:183-230`
- Test: `__tests__/advanced-calibration-state.test.ts`
- Test: `__tests__/storage.test.ts`

**Interfaces:**

- Consumes: Task 1 screen components, which no longer require toggle state.
- Produces:
  `getCalibrationFromDraft(draft, grid)`,
  `getButtonsCalibrationFromDraft(draft, grid)`, and
  `acceptAdvancedCalibration(grid): boolean`; calibration types and serialized
  output no longer contain `isGridEnabled`.

- [x] **Step 1: Change calibration-builder tests to the new contract**

In `__tests__/advanced-calibration-state.test.ts`:

- call both builders with only `draft` and `grid`;
- rename the preference tests to verify that each branch retains its grid;
- assert the retired property is absent:

```ts
it("stores the Controls grid without a snapping preference", () => {
  const result = getCalibrationFromDraft(
    createDraft(createPanels()),
    grid,
  );

  expect(result?.grid).toEqual(grid);
  expect(result).not.toHaveProperty("isGridEnabled");
});

it("stores the Buttons grid without a snapping preference", () => {
  const result = getButtonsCalibrationFromDraft({
    screenshot: { uri: "file:///screenshot.png", width: 100, height: 100 },
    outerRect: { x: 0, y: 0, width: 100, height: 100, radius: 0 },
    buttons: [{
      id: "button-1",
      label: "Wi-Fi",
      customIconId: null,
      rect: { x: 0, y: 0, width: 40, height: 40, radius: 0 },
    }],
  }, grid);

  expect(result?.grid).toEqual(grid);
  expect(result).not.toHaveProperty("isGridEnabled");
});
```

- [x] **Step 2: Add a legacy JSON compatibility regression**

Remove `isGridEnabled` from both branches in the typed
`currentCalibrations` fixture in `__tests__/storage.test.ts`.

Replace “defaults missing or invalid snapping preferences to enabled” with:

```ts
it("ignores retired snapping preferences without losing calibration data", () => {
  const mmkvStore = (globalThis as typeof globalThis & MmkvTestGlobal)
    .__mmkvStore;
  mmkvStore?.set(
    "quick-panel.calibrations",
    JSON.stringify({
      ...currentCalibrations,
      advancedControls: {
        ...currentCalibrations.advancedControls,
        isGridEnabled: false,
      },
      advancedButtons: {
        ...currentCalibrations.advancedButtons,
        isGridEnabled: true,
      },
    }),
  );

  const loaded = loadCalibrations();
  expect(loaded).toEqual(currentCalibrations);
  expect(loaded.advancedControls).not.toHaveProperty("isGridEnabled");
  expect(loaded.advancedButtons).not.toHaveProperty("isGridEnabled");

  saveCalibrations(loaded);
  const serialized = JSON.parse(
    mmkvStore?.get("quick-panel.calibrations") as string,
  ) as Record<string, Record<string, unknown>>;
  expect(serialized.advancedControls).not.toHaveProperty("isGridEnabled");
  expect(serialized.advancedButtons).not.toHaveProperty("isGridEnabled");
});
```

- [x] **Step 3: Run the builder and storage tests and verify they fail**

Run:

```bash
npm test -- --runInBand --no-cache \
  __tests__/advanced-calibration-state.test.ts \
  __tests__/storage.test.ts
```

Expected: FAIL because builders still require the flag and parsed calibrations
still add `isGridEnabled`.

- [x] **Step 4: Remove the flag from models, builders, and storage parsing**

In `model/types.ts`, remove `isGridEnabled` from both
`AdvancedCalibration` and `AdvancedButtonsCalibration`.

In `advanced-calibration-state.ts`:

- remove the Boolean parameter from both builder signatures;
- remove `isGridEnabled` from both returned objects.

In `storage.ts`:

- remove `isGridEnabled: parseGridEnabled(item.isGridEnabled)` from both
  calibration parsers;
- delete `parseGridEnabled()`.

The parsers already construct fresh typed objects from known keys, so extra
legacy JSON fields are ignored without a migration or reset.

- [x] **Step 5: Simplify store and hook save signatures**

Change the Zustand interface and action to:

```ts
acceptAdvancedCalibration: (grid: AdvancedSnapGrid) => boolean;
```

Call the appropriate builder with only its draft and `grid`.

In `useAdvancedCalibrationScreen.ts`:

- remove the `isGridEnabled` state;
- remove initialization from `savedCalibration`;
- remove reset logic during screenshot import;
- call `acceptAdvancedCalibration(grid)`;
- stop returning `isGridEnabled` and `setIsGridEnabled`.

Do not change the independent saved grids for Controls and Buttons.

- [x] **Step 6: Update remaining typed calibration fixtures**

Remove `isGridEnabled` from:

- the synthetic calibration in `advanced-geometry.ts`;
- both Buttons calibration fixtures in `__tests__/export-files.test.ts`;
- any other fixture reported by:

```bash
rg -n "isGridEnabled" src __tests__
```

Do not alter grid counts, rectangles, labels, filenames, or identifier
expectations.

- [x] **Step 7: Run the Task 2 focused suites**

Run:

```bash
npm test -- --runInBand --no-cache \
  __tests__/advanced-calibration-state.test.ts \
  __tests__/storage.test.ts \
  __tests__/export-files.test.ts \
  __tests__/button-identifier-layout.test.ts
```

Expected: all suites PASS, including legacy JSON compatibility and existing
Button span/layout behavior.

- [x] **Step 8: Verify the retired identifier is gone from runtime code**

Run:

```bash
rg -n "isGridEnabled|gridToggleLabel|gridToggleOn|gridToggleOff" src
```

Expected: no runtime matches. Legacy compatibility tests and locale keys remain
until Task 3.

Do not commit.

---

### Task 3: Remove Obsolete Copy and Synchronize Current Documentation

**Files:**

- Modify: `i18next/locales/en.ts:13-18,148-154`
- Modify: `i18next/locales/zh.ts:12-17,134-140`
- Modify: `docs/v3_changelog.md:74-90,209-215`
- Modify: `docs/v3_changelog_public.md:36-43`
- Modify: `docs/production-manual-test-checklist.md:126-188,335-339`
- Modify: `docs/notes.md`

**Interfaces:**

- Consumes: Tasks 1-2 final always-on behavior and legacy storage contract.
- Produces: accurate English/Traditional Chinese release copy, durable
  changelogs, and reusable manual checks without optional-grid instructions.

- [x] **Step 1: Remove toggle localization and stale announcement claims**

Delete these locale keys from both languages:

```ts
gridToggleLabel
gridToggleOn
gridToggleOff
```

Update the existing v1.1.0 announcement bodies so users who have not yet
acknowledged it do not see a removed feature:

```ts
body: "• New Buttons layout customization\n• Improved Customize page performance\n\nReminder: After updating, please recalibrate once for the best experience.",
```

```ts
body: "• 新增「按鈕版面」自訂功能\n• 優化自訂頁面效能\n\n提醒：更新後，請再重新校正一次以達最佳體驗。",
```

Keep the announcement ID, title, CTA, acknowledgement storage, and no-redirect
behavior unchanged.

- [x] **Step 2: Update final developer and public changelogs**

In `docs/v3_changelog.md`, replace the optional-grid bullets with:

```md
- The snapping grid is required in Advanced Controls and Advanced Buttons.
  Row and column controls remain available, every editable box snaps to the
  configured grid with haptic feedback, and boxes remain constrained to the
  confirmed outer area.
- Controls and Buttons retain independent grid counts with their separate saved
  calibrations.
```

Also replace the earlier statement that Buttons are unrestricted user-sized
rectangles with:

```md
Buttons are screenshot-driven, grid-aligned rectangles. Their row and column
spans come from the configured grid, which keeps supported Button sizing and
Customize identifier layout consistent.
```

In “Data that remains preserved,” remove “each target's snapping-grid choice”
while retaining independent Advanced target, custom icon, Customize settings,
language, help, and mode persistence.

In `docs/v3_changelog_public.md`, replace the optional-grid bullet with:

```md
- The snapping grid remains active while aligning Controls and Buttons so panel
  boxes and Button layout sizing consistently follow the selected rows and
  columns.
```

- [x] **Step 3: Update the reusable manual checklist**

In Journey 2:

- rename “grid modes” to “required grid”;
- remove all turn-off/turn-on steps;
- verify the overlay remains visible, controls remain enabled, snapping and
  haptics work, and boxes stay inside the outer area;
- verify saved Controls grid counts persist independently from Default and
  Buttons.

In Journey 3:

- replace “snapping independence” with “independent grid persistence”;
- remove the “opposite snapping state” step;
- verify Buttons grid counts persist independently from Controls.

Change the reusable geometry check to:

```md
- [ ] Repeat small edge boxes, `1x1`, `1xN`, and `Nx1` grids. Confirm snapping,
  haptics, and outer-area clamping remain active throughout adjustment.
```

Do not rewrite the completed historical
`docs/release-tests/v1.1.0-30000022.md`.

- [x] **Step 4: Append the final decision to implementation notes**

Append a concise dated entry to `docs/notes.md`:

```md
### 2026-07-28: Required Advanced snapping grid

- Removed the snapping toggle from Advanced Controls-only and Buttons-only.
- Grid controls, snapping, snap haptics, and outer-area clamping are always
  active.
- Existing calibrations preserve their rectangles and grid counts; obsolete
  `isGridEnabled` values are ignored and omitted from future saves.
- Buttons continue deriving identifier layout and reference sizing from their
  configured grid.
- The enlarged green-area preview strip remains a separate coordinate-alignment
  investigation.
```

- [x] **Step 5: Verify copy and documentation consistency**

Run:

```bash
rg -n -i \
  "isGridEnabled|gridToggle|snapping grid toggle|snapping on/off|turn snapping off|opposite snapping state|snapping-grid choice" \
  src i18next README.md docs/v3_changelog.md \
  docs/v3_changelog_public.md docs/production-manual-test-checklist.md
```

Expected: no matches. Historical specs, plans, notes, and the completed v1.1.0
release-test record may still describe the feature as it existed at that time.

- [x] **Step 6: Run final automated verification**

Run focused coverage:

```bash
npm test -- --runInBand --no-cache \
  __tests__/advanced-grid-controls.test.tsx \
  __tests__/advanced-panel-canvas-grid.test.tsx \
  __tests__/advanced-panel-gesture.test.ts \
  __tests__/advanced-panel-box-gesture.test.tsx \
  __tests__/advanced-calibration-screen-empty-state.test.tsx \
  __tests__/advanced-calibration-state.test.ts \
  __tests__/storage.test.ts \
  __tests__/button-identifier-layout.test.ts \
  __tests__/export-files.test.ts \
  __tests__/release-announcement.test.tsx
```

Then run:

```bash
npm test -- --runInBand
npm run lint
npx tsc --noEmit
git diff --check
```

Expected: every command exits successfully.

- [x] **Step 7: Confirm final scope**

Run:

```bash
git status --short
git diff --stat
```

Review the diff and confirm:

- no screenshot/flow assets changed;
- no Customize or export geometry changed;
- no dependency or native configuration changed;
- no unrelated user changes were overwritten;
- no commit or push was performed.

Leave physical-device verification to the user.

Suggested commit message for the user:

```text
remove: make advanced snapping grid required
```
