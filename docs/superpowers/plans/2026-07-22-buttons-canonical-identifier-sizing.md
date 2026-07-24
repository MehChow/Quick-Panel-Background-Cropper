# Buttons Canonical Identifier Sizing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan inline, task-by-task. Project instructions prohibit subagents, commits, and pushes.

**Goal:** Make every Buttons-only identifier match the accepted default Button size in the applied Quick Panel, including large multi-row/multi-column panels.

**Architecture:** Store one source-coordinate reference cell size on every generated Button identifier. Scale that reference through the existing preview scale or centered-square export scale, then let pure layout logic resolve consistent icon, circle, text, gap, and inset metrics. Classify layouts with exact row/column rules instead of comparing spans.

**Tech Stack:** Expo 56, React Native, TypeScript, React Native Vector Icons Lucide, Jest, React Native Testing Library.

## Global Constraints

- Work inline only; do not use subagents.
- Never commit or push.
- Read the exact Expo 56 documentation before production-code edits, as required by the repository instructions.
- Preserve the current dirty changes in `ButtonIdentifierOverlay.tsx`, `button-identifier-content.ts`, its tests, and the dated handoff.
- Keep all existing calibration data; this change requires no storage reset or migration.
- Keep Customize controls screen-local and preserve the accepted UI layout.
- Do not change Controls-only preview/export, image transforms, opacity behavior, filenames, or Good Lock order.
- Avoid `useMemo`, `useCallback`, and `React.memo` outside AniUI.
- Use interfaces for props/state and avoid `any`.

---

### Task 1: Add the shared source-layout reference and exact layout kinds

**Files:**
- Modify: `src/features/quick-panel/model/types.ts:28-32`
- Modify: `src/features/quick-panel/calibration/advanced/buttons-geometry.ts:15-45`
- Modify: `src/features/quick-panel/model/button-identifier-layout.ts:16-150`
- Test: `__tests__/export-files.test.ts:183-229`
- Test: `__tests__/button-identifier-layout.test.ts:1-149`

**Interfaces:**
- Produces: `ButtonIdentifierDefinition.referenceCellSize: number` in screenshot/source coordinates.
- Produces: `ButtonIdentifierLayoutKind = "horizontal" | "vertical" | "single" | "corner"`.
- Produces: `getButtonIdentifierLayoutKind(identifier): ButtonIdentifierLayoutKind`.
- Produces: `getButtonIdentifierLayout(bounds, identifier, renderedReferenceCellSize): ButtonIdentifierLayout` with resolved `iconBackgroundSize` and `cornerPadding`.

- [ ] **Step 1: Add failing preset and classification tests**

Extend the localized preset assertion in `__tests__/export-files.test.ts`:

```ts
expect(preset.panels["button-1"]).toMatchObject({
  label: "藍牙",
  fileName: "01-bluetooth.png",
  buttonIdentifier: {
    columnSpan: 1,
    rowSpan: 1,
    iconName: "bluetooth",
    referenceCellSize: 50,
  },
});
```

Update `createIdentifier` to return `referenceCellSize: 50`, then replace the
orientation table in `__tests__/button-identifier-layout.test.ts`:

```ts
it.each([
  [4, 1, "horizontal"],
  [1, 3, "vertical"],
  [1, 1, "single"],
  [2, 2, "corner"],
  [3, 2, "corner"],
  [2, 3, "corner"],
  [3, 3, "corner"],
] as const)("classifies %sx%s as %s", (columnSpan, rowSpan, expected) => {
  expect(getButtonIdentifierLayoutKind(
    createIdentifier(columnSpan, rowSpan),
  )).toBe(expected);
});
```

Add a metric regression proving panel bounds no longer control size:

```ts
it("uses one rendered cell reference for every panel kind", () => {
  const horizontal = getButtonIdentifierLayout(
    { x: 0, y: 0, width: 200, height: 50 },
    createIdentifier(4, 1),
    50,
  );
  const vertical = getButtonIdentifierLayout(
    { x: 0, y: 0, width: 50, height: 150 },
    createIdentifier(1, 3),
    50,
  );
  const corner = getButtonIdentifierLayout(
    { x: 0, y: 0, width: 150, height: 150 },
    createIdentifier(3, 3),
    50,
  );

  expect([horizontal.iconSize, vertical.iconSize, corner.iconSize]).toEqual([
    17, 17, 17,
  ]);
  expect([horizontal.iconBackgroundSize, vertical.iconBackgroundSize,
    corner.iconBackgroundSize]).toEqual([29.75, 29.75, 29.75]);
  expect(horizontal.fontSize).toBe(9);
  expect(corner.fontSize).toBe(9);
});
```

- [ ] **Step 2: Run the tests and verify the new contract fails**

Run:

```bash
npm test -- --runInBand --no-cache __tests__/button-identifier-layout.test.ts __tests__/export-files.test.ts
```

Expected: FAIL because `referenceCellSize` and `getButtonIdentifierLayoutKind` do not exist and layout still derives metrics from each panel's short side.

- [ ] **Step 3: Add the shared reference to generated identifiers**

Extend `ButtonIdentifierDefinition` in `src/features/quick-panel/model/types.ts`:

```ts
export interface ButtonIdentifierDefinition {
  columnSpan: number;
  iconName: LucideIconName;
  referenceCellSize: number;
  rowSpan: number;
}
```

Calculate the common source-coordinate value once in `createButtonsPreset`:

```ts
const referenceCellSize = Math.min(
  calibration.outerRect.width / calibration.grid.columns,
  calibration.outerRect.height / calibration.grid.rows,
);
```

Include `referenceCellSize` in every generated `buttonIdentifier`. This repeats one immutable number across ephemeral panel definitions but avoids changing persisted calibration data or threading preset-wide optional state.

- [ ] **Step 4: Replace orientation and panel-derived sizing with pure canonical layout**

In `button-identifier-layout.ts`, replace the orientation type/function and target sizing with:

```ts
export type ButtonIdentifierLayoutKind =
  | "horizontal"
  | "vertical"
  | "single"
  | "corner";

const identifierRatios = {
  cornerPadding: 0.098,
  font: 0.18,
  gap: 0.08,
  icon: 0.34,
  iconBackground: 1.75,
  inset: 0.14,
} as const;

export function getButtonIdentifierLayoutKind(
  identifier: ButtonIdentifierDefinition,
): ButtonIdentifierLayoutKind {
  const { columnSpan, rowSpan } = identifier;
  if (rowSpan === 1 && columnSpan === 1) return "single";
  if (rowSpan === 1 && columnSpan > 1) return "horizontal";
  if (columnSpan === 1 && rowSpan > 1) return "vertical";
  return "corner";
}
```

Resolve final metrics from `renderedReferenceCellSize`:

```ts
export function getButtonIdentifierLayout(
  bounds: ButtonIdentifierBounds,
  identifier: ButtonIdentifierDefinition,
  renderedReferenceCellSize: number,
): ButtonIdentifierLayout {
  const kind = getButtonIdentifierLayoutKind(identifier);
  const iconSize = round(renderedReferenceCellSize * identifierRatios.icon);
  const iconBackgroundSize = round(iconSize * identifierRatios.iconBackground);
  const fontSize = round(renderedReferenceCellSize * identifierRatios.font);
  const gap = round(renderedReferenceCellSize * identifierRatios.gap);
  const inset = round(renderedReferenceCellSize * identifierRatios.inset);
  const cornerPadding = round(
    renderedReferenceCellSize * identifierRatios.cornerPadding,
  );
  const showLabel = kind === "horizontal" || kind === "corner";
  const maxLabelWidth = kind === "corner"
    ? Math.max(0, bounds.width - cornerPadding * 2)
    : showLabel
      ? Math.max(0, bounds.width - inset * 2 - iconBackgroundSize - gap)
      : 0;

  return {
    bounds,
    cornerPadding,
    fontSize,
    gap,
    iconBackgroundSize,
    iconSize,
    inset,
    kind,
    maxLabelWidth,
    minimumFontScale: 0.7,
    showLabel,
  };
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}
```

Update `ButtonIdentifierLayout` to match those returned properties. Retain `getButtonGridSpan`, `getButtonExportBounds`, and `getConstrainedAxisOffset` unchanged.
Remove the superseded `ButtonIdentifierAlignment`,
`ButtonIdentifierOrientation`, `ButtonIdentifierRenderTarget`,
`targetSizing`, and `getButtonIdentifierOrientation` exports.

- [ ] **Step 5: Update test identifiers and verify the model task**

Add `referenceCellSize: 50` to every manually constructed
`ButtonIdentifierDefinition` in these fixtures:

- `__tests__/button-identifier-overlay.test.tsx`
- `__tests__/customize-screen-export-surfaces.test.tsx`
- `__tests__/export-files.test.ts`
- `__tests__/export-surfaces-position-readiness.test.tsx`
- `__tests__/panel-image-intensity.test.tsx`
- `__tests__/sequential-export.test.tsx`

Confirm no constructor was missed with:

```bash
rg -n "buttonIdentifier:|iconName:" __tests__ src/features/quick-panel
```

Then run:

```bash
npm test -- --runInBand --no-cache __tests__/button-identifier-layout.test.ts __tests__/export-files.test.ts
npx tsc --noEmit
```

Expected: both suites PASS and TypeScript reports no errors.

---

### Task 2: Render the four layout kinds with shared visual metrics

**Files:**
- Create: `src/features/quick-panel/customize/components/ButtonIdentifierVisuals.tsx`
- Modify: `src/features/quick-panel/customize/components/ButtonIdentifierOverlay.tsx:1-187`
- Modify: `src/features/quick-panel/customize/components/button-identifier-content.ts:1-30`
- Modify: `src/features/quick-panel/customize/components/PanelSlice.tsx:93-106`
- Test: `__tests__/button-identifier-overlay.test.tsx:1-215`
- Test: `__tests__/panel-image-intensity.test.tsx`

**Interfaces:**
- Consumes: `getButtonIdentifierLayout(bounds, identifier, renderedReferenceCellSize)` from Task 1.
- Produces: `ButtonIdentifierOverlayProps.referenceCellSize`, expressed in the current render surface's layout units.
- Produces: `ButtonIdentifierVisuals` for the shared icon/circle/label markup.

- [ ] **Step 1: Rewrite overlay tests around exact kinds and shared sizes**

Change the test helper to pass `referenceCellSize={50}` and remove `target`. Keep the existing measurement/readiness assertions, then cover the four rules:

```ts
it.each([
  [4, 1, true, true],
  [1, 3, false, true],
  [1, 1, false, false],
  [2, 2, true, false],
  [2, 3, true, false],
  [3, 2, true, false],
  [3, 3, true, false],
] as const)(
  "%sx%s resolves label=%s movable=%s",
  (columnSpan, rowSpan, hasLabel, isMovable) => {
    const screen = renderOverlay(columnSpan, rowSpan);
    expect(Boolean(screen.queryByTestId("button-identifier-label"))).toBe(hasLabel);
    expect(Boolean(screen.queryByTestId(
      "button-identifier-movable-content",
    ))).toBe(isMovable);
  },
);
```

Add a regression comparing `1x4`, `3x1`, and `3x3`:

```ts
it("keeps canonical icon and text metrics across panel sizes", () => {
  const horizontal = renderOverlay(4, 1);
  const horizontalIcon = horizontal.getByTestId("mock-lucide").props.size;
  const horizontalText = StyleSheet.flatten(
    horizontal.getByTestId("button-identifier-label").props.style,
  ).fontSize;
  horizontal.unmount();

  const vertical = renderOverlay(1, 3);
  expect(vertical.getByTestId("mock-lucide").props.size).toBe(horizontalIcon);
  vertical.unmount();

  const corner = renderOverlay(3, 3);
  expect(corner.getByTestId("mock-lucide").props.size).toBe(horizontalIcon);
  expect(StyleSheet.flatten(
    corner.getByTestId("button-identifier-label").props.style,
  ).fontSize).toBe(horizontalText);
});
```

- [ ] **Step 2: Run the overlay suite and verify it fails**

Run:

```bash
npm test -- --runInBand --no-cache __tests__/button-identifier-overlay.test.tsx
```

Expected: FAIL because the overlay still accepts `target`, applies square/export scale constants, and lacks the explicit corner kind.

- [ ] **Step 3: Extract shared visual markup and simplify the overlay**

Create `ButtonIdentifierVisuals.tsx`:

```tsx
import { Text } from "@/components/ani-ui/text";
import { Lucide } from "@react-native-vector-icons/lucide";
import { View } from "react-native";
import type { ButtonIdentifierLayout } from "../../model/button-identifier-layout";
import type { ButtonIdentifierDefinition } from "../../model/types";
import { buttonIdentifierStyles as styles } from "./button-identifier-content";

interface ButtonIdentifierVisualsProps {
  identifier: ButtonIdentifierDefinition;
  label: string;
  layout: ButtonIdentifierLayout;
}

export function ButtonIdentifierVisuals({
  identifier,
  label,
  layout,
}: ButtonIdentifierVisualsProps) {
  return (
    <>
      <View
        testID="button-identifier-icon-background"
        style={[
          styles.iconBackground,
          {
            borderRadius: layout.iconBackgroundSize / 2,
            height: layout.iconBackgroundSize,
            width: layout.iconBackgroundSize,
          },
        ]}
      >
        <Lucide
          color="#FFFFFF"
          name={identifier.iconName}
          size={layout.iconSize}
          style={styles.shadow}
        />
      </View>
      {layout.showLabel ? (
        <Text
          adjustsFontSizeToFit
          allowFontScaling={false}
          ellipsizeMode="tail"
          minimumFontScale={layout.minimumFontScale}
          numberOfLines={1}
          testID="button-identifier-label"
          style={[
            styles.label,
            styles.shadow,
            {
              fontSize: layout.fontSize,
              lineHeight: layout.fontSize * 1.2,
              maxWidth: layout.maxLabelWidth,
            },
            layout.kind === "corner" && styles.cornerLabel,
          ]}
        >
          {label}
        </Text>
      ) : null}
    </>
  );
}
```

In `ButtonIdentifierOverlay.tsx`:

- Replace `target` with `referenceCellSize` in the props interface.
- Call `getButtonIdentifierLayout(bounds, identifier, referenceCellSize)`.
- Use `layout.iconBackgroundSize` in the vertical constraint.
- Branch on `layout.kind`.
- Render horizontal and vertical kinds in their movable containers.
- Render `single` with `styles.center`.
- Render `corner` with `styles.corner` and `layout.cornerPadding`.
- Use `ButtonIdentifierVisuals` inside each branch.
- Keep horizontal measurement/readiness, with a key composed from `bounds.width`, `layout.fontSize`, `layout.iconBackgroundSize`, and `label`.

Rename the existing `square` and `squareLabel` styles to `corner` and `cornerLabel`. The extraction should bring `ButtonIdentifierOverlay.tsx` under the project's 150-line component guideline.

- [ ] **Step 4: Scale the common source reference into preview units**

Update the preview call in `PanelSlice.tsx`:

```tsx
<ButtonIdentifierOverlay
  bounds={{
    x: 0,
    y: 0,
    width: panel.rect.width * layoutScale,
    height: panel.rect.height * layoutScale,
  }}
  identifier={panel.buttonIdentifier}
  label={panel.label}
  opacity={showButtonIdentifiers ? buttonIdentifierOpacity : 0}
  positions={identifierPositions}
  referenceCellSize={panel.buttonIdentifier.referenceCellSize * layoutScale}
/>
```

- [ ] **Step 5: Verify preview rendering and existing intensity behavior**

Run:

```bash
npm test -- --runInBand --no-cache __tests__/button-identifier-overlay.test.tsx __tests__/panel-image-intensity.test.tsx
npx tsc --noEmit
```

Expected: both suites PASS, TypeScript passes, and `ButtonIdentifierOverlay.tsx` is under 150 lines.

---

### Task 3: Normalize export sizing and retain export readiness

**Files:**
- Modify: `src/features/quick-panel/customize/components/ExportSurface.tsx:45-81`
- Modify: `src/features/quick-panel/customize/hooks/useButtonCustomizeControls.ts:1-67`
- Modify: `src/features/quick-panel/customize/hooks/useSequentialExport.ts:1-160`
- Test: `__tests__/button-identifier-layout.test.ts`
- Test: `__tests__/export-surfaces-position-readiness.test.tsx`
- Test: `__tests__/customize-screen-export-surfaces.test.tsx`
- Test: `__tests__/sequential-export.test.tsx`

**Interfaces:**
- Consumes: `ButtonIdentifierDefinition.referenceCellSize` and `getButtonIdentifierLayoutKind` from Task 1.
- Consumes: `ButtonIdentifierOverlay.referenceCellSize` from Task 2.
- Preserves: sequential export readiness waits only for horizontal measured identifiers.

- [ ] **Step 1: Add source-to-export normalization tests**

Add this density and panel-scale regression in `__tests__/button-identifier-layout.test.ts`:

```ts
it.each([2, 3])(
  "keeps applied identifier size stable at PixelRatio %s",
  (pixelRatio) => {
    const side = 1024 / pixelRatio;
    const panels = [
      createPanel({ width: 400, height: 100 }, 4, 1),
      createPanel({ width: 100, height: 300 }, 1, 3),
      createPanel({ width: 300, height: 300 }, 3, 3),
    ];
    const appliedSizes = panels.map((panel) => {
      const square = getExportSquareRect(panel);
      const squareScale = side / square.width;
      const layout = getButtonIdentifierLayout(
        getButtonExportBounds(panel, side),
        panel.buttonIdentifier!,
        panel.buttonIdentifier!.referenceCellSize * squareScale,
      );
      return layout.iconSize * pixelRatio * square.width / 1024;
    });

    expect(appliedSizes[0]).toBeCloseTo(34);
    expect(appliedSizes[1]).toBeCloseTo(34);
    expect(appliedSizes[2]).toBeCloseTo(34);
  },
);
```

Define `createPanel` in the test so every panel has `referenceCellSize: 100` and the supplied spans. The final multiplication converts export layout points to PNG pixels and then back to source/applied coordinates.

- [ ] **Step 2: Run the export-focused tests and verify failure**

Run:

```bash
npm test -- --runInBand --no-cache __tests__/button-identifier-layout.test.ts __tests__/export-surfaces-position-readiness.test.tsx __tests__/sequential-export.test.tsx
```

Expected: FAIL until `ExportSurface` passes the reference through its centered-square scale and readiness callers use the new layout kind.

- [ ] **Step 3: Scale the shared reference for each centered-square export**

Update the overlay call in `ExportSurface.tsx`:

```tsx
<ButtonIdentifierOverlay
  bounds={getButtonExportBounds(panel, side)}
  identifier={panel.buttonIdentifier}
  label={panel.label}
  onPositionReady={onIdentifierPositionReady}
  opacity={buttonIdentifierOpacity}
  positions={identifierPositions}
  referenceCellSize={panel.buttonIdentifier.referenceCellSize * squareScale}
/>
```

Do not change `ExportSurfaceHost`: keeping `side = 1024 / PixelRatio.get()` makes the proportional reference render at 1024 real pixels without density-dependent point caps.

- [ ] **Step 4: Update orientation consumers to exact layout kinds**

In `useButtonCustomizeControls.ts` and `useSequentialExport.ts`, replace `getButtonIdentifierOrientation` with `getButtonIdentifierLayoutKind`.

Keep these decisions unchanged:

```ts
hasHorizontalButtons: kinds.includes("horizontal"),
hasVerticalButtons: kinds.includes("vertical"),
```

```ts
const waitsForIdentifier = Boolean(
  showButtonIdentifiers
  && identifier
  && getButtonIdentifierLayoutKind(identifier) === "horizontal",
);
```

Corner and single panels must not expose position tabs and must not wait for horizontal measurement.

- [ ] **Step 5: Run focused and full static verification**

Run:

```bash
npm test -- --runInBand --no-cache __tests__/button-identifier-layout.test.ts __tests__/button-identifier-overlay.test.tsx __tests__/export-surfaces-position-readiness.test.tsx __tests__/customize-screen-export-surfaces.test.tsx __tests__/sequential-export.test.tsx __tests__/panel-image-intensity.test.tsx __tests__/export-files.test.ts
npx tsc --noEmit
npm run lint
git diff --check
```

Expected: all focused suites PASS, TypeScript and lint exit successfully, and `git diff --check` prints no errors.

- [ ] **Step 6: Perform the device acceptance check**

Use the user's `1x4` Wi-Fi, `3x1` Bluetooth, and `3x3` Shazam calibration:

1. Confirm Customize shows the same glyph and circle size on all three.
2. Confirm Wi-Fi shows icon plus text and responds only to Horizontal.
3. Confirm Bluetooth shows only the icon and responds only to Vertical.
4. Confirm Shazam shows its icon top-left and text bottom-right and ignores both position controls.
5. Export and apply all three PNGs in Good Lock.
6. Confirm their identifiers match the default Button identifiers in the real Quick Panel.
7. Confirm the PNGs remain 1024x1024 and preserve image placement and opacity.

No commit or push follows verification. Report changed files, automated results, and whether device confirmation was performed by Codex or remains for the user.
