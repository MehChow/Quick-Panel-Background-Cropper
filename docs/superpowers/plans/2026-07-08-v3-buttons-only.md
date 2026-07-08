# v3 Buttons-Only Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` only. This repo forbids sub-agent workflow; execute inline task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Advanced Buttons-only calibration, preview, and export without changing Default or existing Controls-only behavior.

**Architecture:** Extend the existing preset-driven model so Controls and Buttons can both be represented as export panels. Keep Buttons-only as a target of Advanced, reuse Advanced geometry/grid/canvas mechanics, and make preview/export dynamic over the active preset.

**Tech Stack:** Expo 56, React 19.2.3, React Native 0.85, Expo Router, Zustand, Uniwind, AniUI, MMKV, `expo-image`, `expo-media-library`, `react-native-view-shot`.

## Global Constraints

- Read `https://docs.expo.dev/versions/v56.0.0/` before code changes.
- Do not use or suggest sub-agents.
- Do not use or suggest a web-browser demo.
- Default mode stays Controls-only.
- Existing Advanced Controls-only behavior must keep working.
- Buttons-only requires at least one Button.
- Buttons are manual screenshot-based export boxes, not fixed presets.
- Do not add dependencies.
- Use interfaces for props/state and avoid `any`.
- Do not use `useMemo`, `useCallback`, or `React.memo` outside `src/components/ani-ui`.
- Keep new source files under 150 lines.
- Only write lightweight tests for state, storage, export, and critical fallback behavior.

---

### Task 1: Add Target-Aware Types And Button Label Catalog

**Files:**

- Modify: `src/features/quick-panel/model/types.ts`
- Modify: `src/features/quick-panel/model/panel-ids.ts`
- Create: `src/features/quick-panel/model/button-labels.ts`
- Create: `src/features/quick-panel/model/button-export-names.ts`
- Test: `__tests__/button-labels.test.ts`

**Interfaces:**

- Produces `AdvancedTarget = "controls" | "buttons"`.
- Produces `ControlPanelId`, `ButtonPanelId`, `PanelId`, `PanelFamily`.
- Produces `BuiltInButtonLabel`, `buttonLabelCatalog`, `pinnedButtonLabelIds`, `searchButtonLabels(query: string)`.
- Produces `createButtonFileNames(labels: string[]): string[]`.

- [ ] Define Controls and Buttons panel types in `types.ts`.
- [ ] Replace the old four-value `PanelId` with `ControlPanelId | ButtonPanelId`.
- [ ] Add Button calibration item types with `id`, `label`, and `rect`.
- [ ] Add a built-in label catalog with around 50 labels. Put pinned labels first: Wi-Fi, Bluetooth, Auto rotate, Flashlight, Sound, Airplane mode, Location, Mobile data, Hotspot, Power saving, Smart View, Nearby devices.
- [ ] Implement `searchButtonLabels(query)` as trimmed case-insensitive substring search, returning pinned labels first when the query is empty.
- [ ] Implement slugged export filenames with duplicate suffixes.
- [ ] Run `npx tsc --noEmit`.
- [ ] Run `npm test -- --runTestsByPath __tests__/button-labels.test.ts`.

### Task 2: Migrate Storage To v3 Calibrations

**Files:**

- Modify: `src/features/quick-panel/store/storage.ts`
- Modify: `src/features/quick-panel/store/quick-panel-defaults.ts`
- Test: `__tests__/storage.test.ts`

**Interfaces:**

- Produces `SavedCalibrations` version `3`.
- `loadCalibrations()` returns `{ version: 3, default, advancedControls, advancedButtons }`.
- v2 `advanced` migrates to `advancedControls`.

- [ ] Add v3 storage key `quick-panel.calibrations-v3`.
- [ ] Keep v2 loading as a migration fallback.
- [ ] Save future calibrations only to v3.
- [ ] Parse Controls calibration with existing strict four-panel behavior.
- [ ] Parse Buttons calibration as an ordered non-empty item list with valid rects.
- [ ] Preserve legacy `saveCalibration(rect)` for Default compatibility.
- [ ] Add tests for v2-to-v3 migration and invalid Buttons payload fallback.
- [ ] Run `npm test -- --runTestsByPath __tests__/storage.test.ts`.

### Task 3: Add Advanced Target Selection

**Files:**

- Modify: `src/features/quick-panel/select-mode/SelectModeScreen.tsx`
- Create: `src/features/quick-panel/select-mode/AdvancedTargetSelection.tsx`
- Modify: `src/features/quick-panel/store/quick-panel-store.ts`
- Modify: `src/features/quick-panel/store/quick-panel-transitions.ts`
- Modify: `src/features/quick-panel/store/selectors.ts`
- Modify: `i18next/locales/en.ts`
- Modify: `i18next/locales/zh.ts`
- Test: `__tests__/quick-panel-transitions.test.ts`

**Interfaces:**

- `selectMode("advanced")` moves to an Advanced target choice when no target is selected.
- `selectAdvancedTarget(target: AdvancedTarget)` routes to existing Controls Advanced or new Buttons Advanced.
- `selectedAdvancedTarget` is persisted only in active in-memory flow state, not as a separate user preference.

- [ ] Add store state for `selectedAdvancedTarget`.
- [ ] Keep `selectedMode` as `"default" | "advanced"` so last exported mode behavior remains simple.
- [ ] Add target cards/rows for Controls only and Buttons only after choosing Advanced.
- [ ] Route Controls only to existing Advanced calibration.
- [ ] Route Buttons only to Buttons calibration state.
- [ ] Keep top-level mode cards unchanged.
- [ ] Add English and Chinese copy.
- [ ] Run `npm test -- --runTestsByPath __tests__/quick-panel-transitions.test.ts __tests__/select-mode-screen-layout.test.tsx`.

### Task 4: Generalize Advanced Geometry For Controls And Buttons

**Files:**

- Modify: `src/features/quick-panel/calibration/advanced/advanced-geometry.ts`
- Modify: `src/features/quick-panel/calibration/advanced/advanced-steps.ts`
- Create: `src/features/quick-panel/calibration/advanced/buttons-geometry.ts`
- Modify: `src/features/quick-panel/store/advanced-calibration-state.ts`
- Test: `__tests__/advanced-calibration-state.test.ts`

**Interfaces:**

- Controls phases keep current order: Button box, Brightness, Volume, Media player.
- Buttons phases are generated from the selected Button item order.
- `createButtonsPreset(calibration)` returns a `QuickPanelPreset` using Button definitions and filename order.

- [ ] Keep Controls geometry functions working for the existing four Controls panels.
- [ ] Add Buttons geometry helpers for ordered dynamic Button items.
- [ ] Validate Buttons calibration with at least one Button, all boxes inside outer rect, and no overlaps.
- [ ] Create initial Button boxes inside the outer rect using a simple grid-derived placement.
- [ ] Keep existing snap grid limits of 1 to 8 rows/columns.
- [ ] Run `npm test -- --runTestsByPath __tests__/advanced-calibration-state.test.ts`.

### Task 5: Build Buttons Selection UI

**Files:**

- Create: `src/features/quick-panel/calibration/advanced/components/ButtonPanelSelection.tsx`
- Create: `src/features/quick-panel/calibration/advanced/components/ButtonLabelSearch.tsx`
- Create: `src/features/quick-panel/calibration/advanced/components/SelectedButtonList.tsx`
- Modify: `src/features/quick-panel/calibration/advanced/AdvancedCalibrationScreen.tsx`
- Modify: `i18next/locales/en.ts`
- Modify: `i18next/locales/zh.ts`

**Interfaces:**

- `ButtonPanelSelection` receives selected Button items and emits the updated ordered list.
- Built-in labels are searchable.
- Custom labels can be added when trimmed label text is non-empty.
- Selected Buttons can be removed and moved up/down.

- [ ] Render pinned labels first when search is empty.
- [ ] Render search results for catalog matches.
- [ ] Add a custom-label action using the current search text.
- [ ] Disable Next until at least one Button is selected.
- [ ] Keep touch targets at least 44-ish points.
- [ ] Use existing dark card/list styling.
- [ ] Run `npm test -- --runTestsByPath __tests__/locales.test.ts`.

### Task 6: Reuse Canvas For Buttons Boxes

**Files:**

- Modify: `src/features/quick-panel/calibration/advanced/components/AdvancedPanelCanvas.tsx`
- Modify: `src/features/quick-panel/calibration/advanced/components/AdvancedPanelBox.tsx`
- Modify: `src/features/quick-panel/calibration/advanced/components/AdvancedPanelResizeHandle.tsx`
- Modify: `src/features/quick-panel/calibration/advanced/hooks/useAdvancedPanelMoveResponder.ts`
- Modify: `src/features/quick-panel/calibration/advanced/hooks/useAdvancedPanelResizeResponder.ts`

**Interfaces:**

- Canvas accepts ordered editable panel items with IDs, labels, family, and rects.
- Controls boxes keep existing color behavior.
- Buttons boxes render blue labels and borders.

- [ ] Replace Controls-only label typing with generic panel item typing.
- [ ] Keep existing Controls phases and labels unchanged.
- [ ] Add Button phase labels from user labels.
- [ ] Use blue border/label styling for Buttons.
- [ ] Keep green outer border and grid overlay unchanged.
- [ ] Run `npx tsc --noEmit`.

### Task 7: Make Preview And Export Dynamic

**Files:**

- Modify: `src/features/quick-panel/customize/hooks/useCustomizeScreen.ts`
- Modify: `src/features/quick-panel/customize/components/ExportSurfaces.tsx`
- Modify: `src/features/quick-panel/customize/export-surface-readiness.ts`
- Modify: `src/features/quick-panel/customize/services/export-files.ts`
- Modify: `src/features/quick-panel/customize/components/PanelSlice.tsx`
- Modify: `src/features/quick-panel/customize/components/PanelOverlay.tsx`
- Modify: `src/features/quick-panel/customize/components/ExportSurface.tsx`
- Test: `__tests__/export-files.test.ts`
- Test: `__tests__/export-surface-readiness.test.ts`
- Test: `__tests__/customize-screen-export-surfaces.test.tsx`

**Interfaces:**

- `ExportRefs` becomes a partial/dynamic ref map keyed by active preset panel IDs.
- Export loop still uses `preset.goodLockOrder`.
- Buttons surfaces get the simple readability dark overlay.
- Controls preview/export remains visually unchanged.

- [ ] Generate refs from `activePreset.goodLockOrder`.
- [ ] Make readiness accept dynamic string panel IDs.
- [ ] Keep missing-ref export errors readable with the panel label.
- [ ] Add Button dark overlay to preview/export surfaces only when `panel.family === "button"`.
- [ ] Keep Controls overlay behavior unchanged.
- [ ] Add export tests using two Button IDs and duplicate labels.
- [ ] Run `npm test -- --runTestsByPath __tests__/export-files.test.ts __tests__/export-surface-readiness.test.ts __tests__/customize-screen-export-surfaces.test.tsx`.

### Task 8: Wire Buttons Calibration Save And Recalibrate

**Files:**

- Modify: `src/features/quick-panel/calibration/advanced/hooks/useAdvancedCalibrationScreen.ts`
- Modify: `src/features/quick-panel/customize/CustomizeScreen.tsx`
- Modify: `src/features/quick-panel/customize/components/ImagePickerCard.tsx`
- Modify: `src/features/quick-panel/store/quick-panel-store.ts`
- Modify: `src/features/quick-panel/store/quick-panel-defaults.ts`

**Interfaces:**

- Saved Buttons calibration creates the active Buttons preset and routes to Customize.
- Recalibrate from Customize returns to the selected Advanced target.
- Existing Controls recalibrate still returns to Controls Advanced.

- [ ] Load saved Buttons calibration when the user selects Advanced > Buttons only.
- [ ] Save Buttons calibration under `advancedButtons`.
- [ ] Preserve saved Controls calibration under `advancedControls`.
- [ ] Update Customize recalibrate routing to respect `selectedAdvancedTarget`.
- [ ] Show target-specific calibrated copy.
- [ ] Run `npx tsc --noEmit`.

### Task 9: Final Verification

**Files:**

- No new source files expected.

**Interfaces:**

- Default Controls-only flow works.
- Advanced Controls-only flow works.
- Advanced Buttons-only flow reaches export result with selected Buttons only.

- [ ] Run `npm test -- --runInBand`.
- [ ] Run `npm run lint`.
- [ ] Run `npx tsc --noEmit`.
- [ ] Manually check text-only flow notes for:
  - Default still routes directly to Default calibration/customize.
  - Advanced target choice appears only after Advanced.
  - Buttons search finds pinned and non-pinned labels.
  - Custom labels can be added.
  - Export filenames follow reviewed order.
  - Controls calibration remains available after Buttons calibration is saved.
