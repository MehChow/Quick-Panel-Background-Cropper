# Buttons Identifier Position Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans`. Execute inline only; do not use subagents. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add independent, constrained horizontal and vertical position sliders for long Buttons identifiers while preserving square-like placement.

**Architecture:** Extend the pure identifier layout model with orientation and safe-axis offset helpers. A small screen-local hook owns all Customize Button controls, while the shared overlay measures horizontal icon-and-label content and applies normalized positions in preview and export. Export readiness waits for final horizontal measurement before capture.

**Tech Stack:** Expo 56, React Native 0.85, TypeScript 6, AniUI, Uniwind, Jest, React Native Testing Library, `react-native-view-shot`.

## Global Constraints

- Before implementation, read <https://docs.expo.dev/versions/v56.0.0/>.
- Work inline only. Do not use subagents or a browser demo.
- Never run `git commit` or `git push`; provide a suggested commit message only.
- Add no dependencies.
- Apply position controls only to Advanced Buttons-only preview/export rendering.
- Preserve square-like (`columnSpan === rowSpan`) placement exactly.
- Preserve identifier visibility/opacity behavior and the independent 78% Button image-intensity default.
- Position controls are screen-local, default to `50`, and must not use MMKV, Zustand, or calibration storage.
- Do not change Default, Advanced Controls, calibration geometry, filenames, or export order.
- Do not use `useMemo`, `useCallback`, or `React.memo` outside AniUI.
- Keep new/materially changed component files under 150 lines; use interfaces and avoid `any`.
- Follow TDD: add each focused test first, confirm the expected failure, then implement.

## File Structure

**Create:**

- `src/features/quick-panel/customize/hooks/useButtonCustomizeControls.ts`

**Modify:**

- Layout: `src/features/quick-panel/model/button-identifier-layout.ts`
- Overlay: `src/features/quick-panel/customize/components/ButtonIdentifierOverlay.tsx`
- Controls: `src/features/quick-panel/customize/components/ButtonCustomizeControls.tsx`
- Screen/prop threading: `CustomizeScreen.tsx`, `QuickPanelPreview.tsx`, `PanelSlice.tsx`, `ExportSurfaces.tsx`, `ExportSurface.tsx`
- Readiness: `src/features/quick-panel/customize/export-surface-readiness.ts`
- Locales: `i18next/locales/en.ts`, `i18next/locales/zh.ts`
- Tests: identifier layout, overlay, controls, Customize integration, export readiness, panel image intensity, locales
- Documentation: `docs/notes.md`

---

### Task 1: Model orientation and constrained safe-axis offsets

**Files:**

- Modify: `src/features/quick-panel/model/button-identifier-layout.ts`
- Modify test: `__tests__/button-identifier-layout.test.ts`

**Interfaces:**

- Produces `ButtonIdentifierOrientation`, `ButtonIdentifierPositions`, `getButtonIdentifierOrientation()`, and `getConstrainedAxisOffset()`.
- Extends `ButtonIdentifierLayout` with `orientation`.

- [ ] **Step 1: Write failing orientation and offset tests**

Add imports and cover unequal/equal spans plus the full normalized track:

```ts
import {
  getButtonIdentifierOrientation,
  getConstrainedAxisOffset,
} from "@/features/quick-panel/model/button-identifier-layout";

it.each([
  [2, 1, "horizontal"],
  [1, 2, "vertical"],
  [1, 1, "square"],
  [2, 2, "square"],
] as const)("classifies %sx%s as %s", (columnSpan, rowSpan, expected) => {
  expect(getButtonIdentifierOrientation(
    createIdentifier(columnSpan, rowSpan),
  )).toBe(expected);
});

it.each([
  [0, 8],
  [0.5, 34],
  [1, 60],
])("maps %s to a constrained safe-axis offset", (position, expected) => {
  expect(getConstrainedAxisOffset({
    axisLength: 100,
    contentLength: 32,
    inset: 8,
    position,
  })).toBe(expected);
});

it("clamps travel to zero when content consumes the safe axis", () => {
  expect(getConstrainedAxisOffset({
    axisLength: 100,
    contentLength: 100,
    inset: 8,
    position: 1,
  })).toBe(8);
});
```

Update existing layout assertions so horizontal, vertical, `1x1`, and `2x2`
results include their expected `orientation`.

- [ ] **Step 2: Verify the tests fail for missing APIs**

```bash
npm test -- --runInBand __tests__/button-identifier-layout.test.ts
```

Expected: FAIL because the orientation and offset exports do not exist.

- [ ] **Step 3: Add the pure types and helpers**

Add:

```ts
export type ButtonIdentifierOrientation = "horizontal" | "vertical" | "square";

export interface ButtonIdentifierPositions {
  horizontal: number;
  vertical: number;
}

interface ConstrainedAxisOffsetInput {
  axisLength: number;
  contentLength: number;
  inset: number;
  position: number;
}

export function getButtonIdentifierOrientation(
  identifier: ButtonIdentifierDefinition,
): ButtonIdentifierOrientation {
  if (identifier.columnSpan > identifier.rowSpan) return "horizontal";
  if (identifier.rowSpan > identifier.columnSpan) return "vertical";
  return "square";
}

export function getConstrainedAxisOffset({
  axisLength,
  contentLength,
  inset,
  position,
}: ConstrainedAxisOffsetInput): number {
  const safeStart = inset;
  const safeEnd = Math.max(
    safeStart,
    axisLength - inset - contentLength,
  );
  const normalized = clamp(position, 0, 1);
  return safeStart + (safeEnd - safeStart) * normalized;
}
```

Set `orientation: getButtonIdentifierOrientation(identifier)` in
`getButtonIdentifierLayout()`. Do not change the existing sizing, label, inset,
or equal-span alignment behavior.

- [ ] **Step 4: Verify Task 1**

```bash
npm test -- --runInBand __tests__/button-identifier-layout.test.ts
npx tsc --noEmit
git diff --check
```

Expected: PASS. Do not commit.

Suggested checkpoint message: `feat: model Button identifier positions`

---

### Task 2: Position the shared overlay and report measured readiness

**Files:**

- Modify: `src/features/quick-panel/customize/components/ButtonIdentifierOverlay.tsx`
- Modify test: `__tests__/button-identifier-overlay.test.tsx`

**Interfaces:**

Consumes Task 1 helpers and adds:

```ts
interface ButtonIdentifierOverlayProps {
  bounds: ButtonIdentifierBounds;
  identifier: ButtonIdentifierDefinition;
  label: string;
  onPositionReady?: () => void;
  opacity: number;
  positions: ButtonIdentifierPositions;
  target: ButtonIdentifierRenderTarget;
}
```

- [ ] **Step 1: Write failing overlay-position tests**

Update `renderOverlay()` to accept positions and the optional readiness callback:

```ts
function renderOverlay(
  columnSpan: number,
  rowSpan: number,
  positions = { horizontal: 0.5, vertical: 0.5 },
  onPositionReady?: () => void,
) {
  return render(
    <ButtonIdentifierOverlay
      bounds={bounds}
      identifier={{ columnSpan, rowSpan, iconName: "wifi" }}
      label="Wi-Fi"
      onPositionReady={onPositionReady}
      opacity={0.7}
      positions={positions}
      target="preview"
    />,
  );
}
```

Add these behaviors:

```ts
it("moves a measured horizontal icon-and-label group together", () => {
  const screen = renderOverlay(2, 1, { horizontal: 0.5, vertical: 0.5 });
  const content = screen.getByTestId("button-identifier-movable-content");

  fireEvent(content, "layout", {
    nativeEvent: { layout: { height: 20, width: 40, x: 0, y: 0 } },
  });

  expect(StyleSheet.flatten(content.props.style)).toMatchObject({ left: 30 });
  expect(screen.getByTestId("mock-lucide")).toBeTruthy();
  expect(screen.getByTestId("button-identifier-label")).toBeTruthy();
});

it("moves a vertical icon while preserving horizontal centering", () => {
  const screen = renderOverlay(1, 2, { horizontal: 0.5, vertical: 1 });
  expect(StyleSheet.flatten(
    screen.getByTestId("button-identifier-movable-content").props.style,
  )).toMatchObject({ alignItems: "center", left: 0, width: 100 });
});

it.each([[1, 1], [2, 2]])(
  "ignores position values for square-like %sx%s Buttons",
  (columnSpan, rowSpan) => {
    const screen = renderOverlay(
      columnSpan,
      rowSpan,
      { horizontal: 1, vertical: 1 },
    );
    expect(screen.queryByTestId("button-identifier-movable-content")).toBeNull();
  },
);

it("reports horizontal readiness only after measured placement commits", async () => {
  const onPositionReady = jest.fn();
  const screen = renderOverlay(2, 1, undefined, onPositionReady);
  expect(onPositionReady).not.toHaveBeenCalled();
  fireEvent(screen.getByTestId("button-identifier-movable-content"), "layout", {
    nativeEvent: { layout: { height: 20, width: 40, x: 0, y: 0 } },
  });
  await waitFor(() => expect(onPositionReady).toHaveBeenCalled());
});
```

Keep the existing opacity, fixed-white, shadow, and fitted-label assertions.

- [ ] **Step 2: Verify the overlay tests fail**

```bash
npm test -- --runInBand __tests__/button-identifier-overlay.test.tsx
```

Expected: FAIL because the overlay has no position props or movable content.

- [ ] **Step 3: Implement constrained long-shape rendering**

Use `useState` for a horizontal measurement record that includes a stable key:

```ts
interface HorizontalMeasurement {
  key: string;
  width: number;
}

const measurementKey = [
  bounds.width,
  layout.fontSize,
  layout.iconSize,
  label,
  target,
].join(":");
const [measurement, setMeasurement] = useState<HorizontalMeasurement | null>(null);
const measuredWidth = measurement?.key === measurementKey
  ? measurement.width
  : null;
```

For horizontal layouts, render one shrink-wrapped absolute row containing both
the Lucide icon and label. Give it `maxWidth: bounds.width - layout.inset * 2`,
measure it with `onLayout`, and calculate `left` with
`getConstrainedAxisOffset()`. Keep vertical centering.

For vertical layouts, calculate `top` from `bounds.height`, `layout.iconSize`,
`layout.inset`, and `positions.vertical`; render an absolute full-width wrapper
with `alignItems: "center"`.

For equal-span layouts, render the current center/roomy content without reading
either position value.

After a horizontal measurement with the current key has rendered, call
`onPositionReady` in `useEffect`. Do not call it directly from `onLayout`, which
would allow export capture before the positioned re-render commits.

- [ ] **Step 4: Keep the component below 150 lines**

If `ButtonIdentifierOverlay.tsx` would exceed 149 lines, extract only the pure
style/branch construction into
`src/features/quick-panel/customize/components/button-identifier-content.ts`.
Do not introduce memo hooks or a general positioning abstraction.

- [ ] **Step 5: Verify Task 2**

```bash
npm test -- --runInBand __tests__/button-identifier-overlay.test.tsx __tests__/button-identifier-layout.test.ts
npx tsc --noEmit
git diff --check
wc -l src/features/quick-panel/customize/components/ButtonIdentifierOverlay.tsx
```

Expected: PASS and the component is below 150 lines. Do not commit.

Suggested checkpoint message: `feat: position long Button identifiers`

---

### Task 3: Add screen-local orientation controls and thread position values

**Files:**

- Create: `src/features/quick-panel/customize/hooks/useButtonCustomizeControls.ts`
- Modify: `src/features/quick-panel/customize/CustomizeScreen.tsx`
- Modify: `src/features/quick-panel/customize/components/ButtonCustomizeControls.tsx`
- Modify: `src/features/quick-panel/customize/components/QuickPanelPreview.tsx`
- Modify: `src/features/quick-panel/customize/components/PanelSlice.tsx`
- Modify: `src/features/quick-panel/customize/components/ExportSurfaces.tsx`
- Modify: `src/features/quick-panel/customize/components/ExportSurface.tsx`
- Modify: `i18next/locales/en.ts`
- Modify: `i18next/locales/zh.ts`
- Modify test: `__tests__/button-customize-controls.test.tsx`
- Modify test: `__tests__/customize-screen-export-surfaces.test.tsx`
- Modify test: `__tests__/panel-image-intensity.test.tsx`
- Modify test: `__tests__/locales.test.ts`

**Interfaces:**

The hook produces raw control percentages plus normalized render positions:

```ts
export interface ButtonCustomizeControlState {
  buttonIdentifierOpacity: number;
  buttonPanelOpacity: number;
  hasHorizontalButtons: boolean;
  hasVerticalButtons: boolean;
  horizontalIdentifierPosition: number;
  identifierPositions: ButtonIdentifierPositions;
  setButtonIdentifierOpacity: (value: number) => void;
  setButtonPanelOpacity: (value: number) => void;
  setHorizontalIdentifierPosition: (value: number) => void;
  setShowButtonIdentifiers: (value: boolean) => void;
  setVerticalIdentifierPosition: (value: number) => void;
  showButtonIdentifiers: boolean;
  verticalIdentifierPosition: number;
}

export function useButtonCustomizeControls(
  preset: QuickPanelPreset,
): ButtonCustomizeControlState;
```

Preview/export components receive one explicit
`identifierPositions: ButtonIdentifierPositions` prop.

- [ ] **Step 1: Write failing control tests**

Extend `baseProps` in `button-customize-controls.test.tsx`:

```ts
hasHorizontalButtons: true,
hasVerticalButtons: true,
horizontalIdentifierPosition: 50,
onHorizontalIdentifierPositionChange: jest.fn(),
onVerticalIdentifierPositionChange: jest.fn(),
verticalIdentifierPosition: 50,
```

Assert both sliders receive `50`, the exact test IDs
`horizontal-identifier-position-slider` and
`vertical-identifier-position-slider`, and their supplied callbacks. Add
separate renders proving each slider is omitted when its orientation flag is
false. Extend the identifiers-off test to assert both visible orientation
sliders remain mounted, disabled, and inside the existing dimmed control area.

- [ ] **Step 2: Write failing Customize integration tests**

Expand the Buttons preset in `customize-screen-export-surfaces.test.tsx` to
contain one `2x1`, one `1x2`, and one `1x1` identifier. Assert initial preview
and export props include:

```ts
identifierPositions: { horizontal: 0.5, vertical: 0.5 },
```

Press the horizontal mock slider so it emits `35`, and the vertical mock slider
so it emits `80`. Assert preview/export both update to `{ horizontal: 0.35,
vertical: 0.8 }` while image opacity stays `0.78` and identifier opacity stays
`0.7`. Unmount/remount and assert both return to `0.5`.

- [ ] **Step 3: Add locale test expectations**

Require exact English copy and non-empty Chinese parity:

```ts
expect(enLocale.translation.customize.horizontalIdentifierPosition).toBe(
  "Horizontal identifier position",
);
expect(enLocale.translation.customize.verticalIdentifierPosition).toBe(
  "Vertical identifier position",
);
expect(zhLocale.translation.customize.horizontalIdentifierPosition).toBeTruthy();
expect(zhLocale.translation.customize.verticalIdentifierPosition).toBeTruthy();
```

- [ ] **Step 4: Verify the new tests fail**

```bash
npm test -- --runInBand \
  __tests__/button-customize-controls.test.tsx \
  __tests__/customize-screen-export-surfaces.test.tsx \
  __tests__/locales.test.ts
```

Expected: FAIL because the new sliders, state, and props are missing.

- [ ] **Step 5: Extract all Button Customize state into the hook**

Use these exact defaults:

```ts
const DEFAULT_BUTTON_PANEL_OPACITY = 78;
const DEFAULT_BUTTON_IDENTIFIER_OPACITY = 70;
const DEFAULT_BUTTON_IDENTIFIER_POSITION = 50;
```

The hook uses `useState` only. Determine orientation availability from
`preset.visualOrder`, each panel's `buttonIdentifier`, and
`getButtonIdentifierOrientation()`. Return normalized render values:

```ts
identifierPositions: {
  horizontal: horizontalIdentifierPosition / 100,
  vertical: verticalIdentifierPosition / 100,
},
```

Do not add persistence or reset effects; mounting a new Customize screen is the
reset boundary.

- [ ] **Step 6: Add the conditional position sliders**

Extend `ButtonCustomizeControlsProps` with the fields tested in Step 1. Reuse
the existing `OpacityControl` row component for position sliders; its label,
percentage value, `0...100` range, disabled state, and test ID already match the
required UI.

Render horizontal and vertical rows only when their corresponding flags are
true. Keep them inside the identifier-dependent dimmed area so they disable and
dim together when identifiers are off.

Add locale values:

```ts
// English
horizontalIdentifierPosition: "Horizontal identifier position",
verticalIdentifierPosition: "Vertical identifier position",

// Traditional Chinese
horizontalIdentifierPosition: "水平識別標記位置",
verticalIdentifierPosition: "垂直識別標記位置",
```

- [ ] **Step 7: Thread one positions object through both render paths**

In `CustomizeScreen`, replace the local Button states with
`useButtonCustomizeControls(activePreset)`. Pass raw percentages and setters to
`ButtonCustomizeControls`, and pass `identifierPositions` to
`QuickPanelPreview` and `ExportSurfaces`.

Add the required prop to `QuickPanelPreview`, `PanelSlice`, `ExportSurfaces`,
and `ExportSurface`; pass it unchanged to `ButtonIdentifierOverlay`. Update all
direct component fixtures in `panel-image-intensity.test.tsx` with
`identifierPositions={{ horizontal: 0.5, vertical: 0.5 }}` and confirm image
opacity assertions remain unchanged.

- [ ] **Step 8: Verify Task 3**

```bash
npm test -- --runInBand \
  __tests__/button-customize-controls.test.tsx \
  __tests__/customize-screen-export-surfaces.test.tsx \
  __tests__/button-identifier-overlay.test.tsx \
  __tests__/panel-image-intensity.test.tsx \
  __tests__/locales.test.ts
npx tsc --noEmit
git diff --check
wc -l \
  src/features/quick-panel/customize/CustomizeScreen.tsx \
  src/features/quick-panel/customize/components/ButtonCustomizeControls.tsx
```

Expected: PASS and both component files remain below 150 lines. Do not commit.

Suggested checkpoint message: `feat: control long identifier positions`

---

### Task 4: Gate export capture on final horizontal placement

**Files:**

- Modify: `src/features/quick-panel/customize/export-surface-readiness.ts`
- Modify: `src/features/quick-panel/customize/components/ExportSurfaces.tsx`
- Modify: `src/features/quick-panel/customize/components/ExportSurface.tsx`
- Modify test: `__tests__/export-surface-readiness.test.ts`
- Modify test: `__tests__/customize-screen-export-surfaces.test.tsx`

**Interfaces:**

Change readiness creation to:

```ts
export function createExportSurfaceReadiness(
  expectedIds: PanelId[],
  measuredIdentifierIds?: PanelId[],
): {
  markIdentifierReady: (id: PanelId) => boolean;
  markImageLoaded: (id: PanelId) => boolean;
};
```

`ExportSurface` adds `onIdentifierPositionReady: () => void` and forwards it as
`onPositionReady` to the overlay.

- [ ] **Step 1: Write failing readiness tests**

Keep existing behavior with no measured IDs, renaming `markLoaded` to
`markImageLoaded`. Add:

```ts
it("waits for required horizontal identifier measurements", () => {
  const readiness = createExportSurfaceReadiness(
    ["button-1", "button-2"],
    ["button-1"],
  );

  expect(readiness.markImageLoaded("button-1")).toBe(false);
  expect(readiness.markImageLoaded("button-2")).toBe(false);
  expect(readiness.markIdentifierReady("button-1")).toBe(true);
});

it("ignores identifier events for panels that do not require measurement", () => {
  const readiness = createExportSurfaceReadiness(["button-1"], []);
  expect(readiness.markIdentifierReady("button-1")).toBe(false);
  expect(readiness.markImageLoaded("button-1")).toBe(true);
});
```

- [ ] **Step 2: Verify readiness tests fail**

```bash
npm test -- --runInBand __tests__/export-surface-readiness.test.ts
```

Expected: FAIL on the new signature and methods.

- [ ] **Step 3: Implement the two-signal tracker**

Maintain `loadedImageIds`, `readyIdentifierIds`, and a
`measuredIdentifierIdSet`. Both mark methods call one shared `isReady()` that
requires every expected image and every required identifier measurement.
Events for IDs outside `measuredIdentifierIds` must not count as readiness by
themselves.

- [ ] **Step 4: Identify measured panels and reset readiness correctly**

In `ExportSurfaces`, derive the measured IDs from `preset.goodLockOrder` where:

- identifiers are visible;
- the panel is a Button;
- `buttonIdentifier` exists; and
- its orientation is horizontal.

Create/reset readiness with both ID arrays. Add
`identifierPositions.horizontal`, `identifierPositions.vertical`, and
`showButtonIdentifiers` to the reset effect dependencies so a new export waits
for the current layout.

Rename `handleImageLoad` and add `handleIdentifierReady`; either one may be the
last signal that calls `onReady()` exactly once. Pass the identifier callback
through `ExportSurface` to `ButtonIdentifierOverlay`.

- [ ] **Step 5: Verify Task 4**

```bash
npm test -- --runInBand \
  __tests__/export-surface-readiness.test.ts \
  __tests__/button-identifier-overlay.test.tsx \
  __tests__/customize-screen-export-surfaces.test.tsx
npx tsc --noEmit
git diff --check
```

Expected: PASS. Do not commit.

Suggested checkpoint message: `fix: wait for positioned Button exports`

---

### Task 5: Document and verify the finished behavior

**Files:**

- Modify: `docs/notes.md`
- Review: `docs/superpowers/specs/2026-07-17-buttons-identifier-position-controls-design.md`

- [ ] **Step 1: Record the final decisions**

Add a dated `docs/notes.md` entry stating:

- horizontal and vertical long Buttons use independent screen-local sliders;
- both reset to `50` per Customize visit;
- movement is constrained by target-specific safe insets and rendered content
  size;
- square-like identifiers remain unchanged; and
- horizontal export capture waits for final measured placement.

Record any tuning change made during device QA. If none is made, write
`Additional arbitrary tuning: None`.

- [ ] **Step 2: Run focused regression coverage**

```bash
npm test -- --runInBand \
  __tests__/button-identifier-layout.test.ts \
  __tests__/button-identifier-overlay.test.tsx \
  __tests__/button-customize-controls.test.tsx \
  __tests__/customize-screen-export-surfaces.test.tsx \
  __tests__/export-surface-readiness.test.ts \
  __tests__/panel-image-intensity.test.tsx \
  __tests__/export-files.test.ts \
  __tests__/locales.test.ts
```

Expected: PASS without console warnings or snapshots.

- [ ] **Step 3: Run full automated verification**

```bash
npm test -- --runInBand
npm run lint
npx tsc --noEmit
git diff --check
```

Expected: every command exits zero.

- [ ] **Step 4: Perform Samsung/Good Lock QA**

Use a mixed Buttons-only calibration containing at least one `2x1`, `1x2`,
`1x1`, and `2x2` Button.

1. Confirm only sliders for orientations present in the preset are shown.
2. Test horizontal and vertical sliders independently at `0`, `50`, and `100`.
3. Verify horizontal icon and label move together and never cross rounded edges.
4. Verify vertical icons stay horizontally centered and never cross top/bottom
   safe insets.
5. Verify `1x1` and `2x2` identifiers do not move.
6. Turn identifiers off; confirm all visible position sliders disable and dim,
   then turn them back on and confirm values are preserved within that visit.
7. Export at non-default positions, apply in Good Lock, and compare against the
   live preview.
8. Leave and reopen Customize; confirm both values reset to `50`.

Record the device model, One UI version, QuickStar version, and any tuning
change in the completion notes.

- [ ] **Step 5: Final contract audit**

Confirm all of the following:

- square-like output is unchanged;
- position values are absent from storage and calibration types;
- Button image intensity still starts at `78` and identifier opacity at `70`;
- Controls and Default outputs are unchanged;
- filenames and `goodLockOrder` are unchanged;
- no dependency, memo hook, `any`, commit, or push was introduced; and
- every materially changed component remains below 150 lines.

Do not commit or push. Return the working tree with test/device results.

Suggested commit message: `feat: adjust long Button identifier positions`
