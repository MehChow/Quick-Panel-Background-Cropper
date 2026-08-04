# Button Appearance Focused Inspector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:executing-plans` to implement this plan inline task-by-task. Do
> not dispatch subagents.

**Goal:** Replace the Button appearance dialog's tiny full-layout preview with
an export-faithful, magnified inspector for one real calibrated Button at a
time while preserving the main Customize composition and transactional
appearance behavior.

**Architecture:** Derive inspectable Button panels from `preset.visualOrder`,
render only the focused panel through the existing `QuickPanelPreviewStage` and
`PanelSlice` composition path, and keep focus/comparison state local to
`ButtonLabelAppearanceDialog`. The existing appearance draft remains
authoritative: `New` uses its animated shared values, while `Before` renders
the committed values passed into the dialog.

**Tech Stack:** Expo 56, React Native 0.85, React 19 with React Compiler,
TypeScript 6, Uniwind/Tailwind v4, AniUI primitives, Zustand-owned persisted
settings, Reanimated 4, `reanimated-color-picker` 5.1.2, Jest 29, and React
Native Testing Library.

## Global Constraints

- Read the exact Expo 56 documentation at
  `https://docs.expo.dev/versions/v56.0.0/` before editing application code.
- Execute inline only; do not use or suggest subagents.
- Do not stage, commit, push, create branches, or open pull requests.
- Preserve every existing user change in the dirty combined-mode worktree.
- Leave physical Samsung, QuickStar, and Good Lock QA to the user.
- Do not use a browser demo; implementation discussion and handoff remain text
  only.
- Do not add dependencies or modify Expo/native configuration.
- Use interfaces for props and state; do not introduce `any`.
- Do not use `useMemo`, `useCallback`, or `React.memo` outside AniUI.
- Keep new components focused and under 150 lines each.
- Reuse the current source image, logical dimensions, `{ x, y, scale }`
  transform, Button intensity, identifier layout, and animated appearance
  values. Do not create another crop, transform, export surface, or persisted
  field.
- Keep the main Customize preview, pan/pinch gestures, Button controls card,
  reset behavior, export actions, and sequential `1024 x 1024` export pipeline
  unchanged.
- Keep appearance global across all Buttons. Inspector focus is screen-local
  display state and must never change selection, calibration, ordering,
  filenames, or persistence.
- Preserve transactional semantics: Confirm commits; Cancel, backdrop, and
  Android Back discard; invalid HEX preserves the last valid preview and
  disables Confirm.
- Use explicit Previous/Next controls with at least 44×44dp hit areas; do not
  add a competing swipe gesture.
- The focused view shows the calibrated applied Button shape, not the raw
  square PNG capture surface.
- Design contract:
  `docs/superpowers/specs/2026-08-04-button-appearance-focused-inspector-design.md`.

---

## File Map

**Create**

- `src/features/quick-panel/customize/focused-button-inspector.ts` — pure
  inspectable-panel filtering and cyclic index logic.
- `src/features/quick-panel/customize/components/ButtonAppearanceInspectorControls.tsx`
  — focused label/count, Previous/Next actions, and controlled Before/New
  comparison UI.
- `src/features/quick-panel/customize/components/FocusedButtonAppearancePreview.tsx`
  — responsive single-panel wrapper around `QuickPanelPreviewStage`.
- `src/features/quick-panel/customize/components/ButtonLabelAppearanceDialogFrame.tsx`
  — existing modal/backdrop/keyboard/scroll/footer shell extracted so every
  edited component remains under 150 lines.
- `__tests__/focused-button-inspector.test.ts` — pure ordering and cycling
  coverage.
- `__tests__/button-appearance-inspector-controls.test.tsx` — navigation,
  accessibility, and controlled comparison coverage.
- `__tests__/focused-button-appearance-preview.test.tsx` — focused renderer
  geometry and composition-prop coverage.

**Modify**

- `src/features/quick-panel/customize/components/ButtonLabelAppearanceDialog.tsx`
  — replace `QuickPanelPreview` with the focused inspector and own local focus
  and comparison state.
- `src/features/quick-panel/customize/components/ButtonLabelColorPicker.tsx`
  — notify the dialog when a valid draft interaction should return comparison
  to `New`.
- `__tests__/button-label-appearance-dialog.test.tsx` — mixed preset fixture,
  focus cycling, comparison, empty state, and existing transaction regression.
- `i18next/locales/en.ts` — English inspector copy.
- `i18next/locales/zh.ts` — Traditional Chinese inspector copy.
- `__tests__/locales.test.ts` — locale parity and exact inspector strings.
- `docs/notes.md` — newest durable behavior entry after implementation passes.

**Intentionally unchanged**

- `src/features/quick-panel/customize/CustomizeScreen.tsx`
- `src/features/quick-panel/customize/components/CustomizePreviewSection.tsx`
- `src/features/quick-panel/customize/components/QuickPanelPreview.tsx`
- `src/features/quick-panel/customize/components/QuickPanelPreviewStage.tsx`
- `src/features/quick-panel/customize/components/PanelSlice.tsx`
- `src/features/quick-panel/customize/components/ExportSurface.tsx`
- `src/features/quick-panel/customize/hooks/useButtonCustomizeControls.ts`
- `src/features/quick-panel/customize/hooks/useSequentialExport.ts`
- all calibration, storage, and combined-preset modules

---

### Task 1: Inspectable Button ordering and controls

**Files:**

- Create: `src/features/quick-panel/customize/focused-button-inspector.ts`
- Create: `src/features/quick-panel/customize/components/ButtonAppearanceInspectorControls.tsx`
- Create: `__tests__/focused-button-inspector.test.ts`
- Create: `__tests__/button-appearance-inspector-controls.test.tsx`
- Modify: `i18next/locales/en.ts` inside `translation.customize`
- Modify: `i18next/locales/zh.ts` inside `translation.customize`
- Modify: `__tests__/locales.test.ts` inside the Button identifier controls case

**Interfaces:**

- Produces:

```ts
export interface InspectableButtonPanel extends PanelDefinition {
  buttonIdentifier: ButtonIdentifierDefinition;
  family: "button";
}

export type ButtonAppearanceComparison = "before" | "new";

export function getInspectableButtonPanels(
  preset: QuickPanelPreset,
): InspectableButtonPanel[];

export function getCycledButtonIndex(
  currentIndex: number,
  buttonCount: number,
  direction: -1 | 1,
): number;
```

```ts
interface ButtonAppearanceInspectorControlsProps {
  comparison: ButtonAppearanceComparison;
  current: number;
  label: string;
  onComparisonChange: (value: ButtonAppearanceComparison) => void;
  onNext: () => void;
  onPrevious: () => void;
  total: number;
}
```

- Consumes: `QuickPanelPreset`, `PanelDefinition`, and
  `ButtonIdentifierDefinition` from `model/types`.

- [ ] **Step 1: Read the Expo 56 documentation and inspect the dirty boundary**

Read `https://docs.expo.dev/versions/v56.0.0/`, then run:

```bash
git status --short
git diff -- src/features/quick-panel/customize i18next __tests__ docs/notes.md
```

Record the existing combined-mode files mentally and do not rewrite or clean
them while implementing this plan.

- [ ] **Step 2: Write failing pure helper tests**

Create `__tests__/focused-button-inspector.test.ts` with a mixed preset whose
visual order is Control, Button 2, Button 1. Assert that malformed Button
entries without `buttonIdentifier` are excluded and cycling wraps:

```ts
import {
  getCycledButtonIndex,
  getInspectableButtonPanels,
} from "@/features/quick-panel/customize/focused-button-inspector";
import type { QuickPanelPreset } from "@/features/quick-panel/model/types";

const preset = {
  id: "mixed",
  label: "Mixed",
  mode: "advanced",
  width: 300,
  height: 600,
  customizationArea: { x: 0, y: 0, width: 300, height: 600, radius: 0 },
  panels: {
    brightness: {
      id: "brightness",
      label: "Brightness",
      fileName: "01-control-brightness.png",
      family: "control",
      rect: { x: 0, y: 0, width: 300, height: 80, radius: 40 },
    },
    "button-2": {
      id: "button-2",
      label: "Bluetooth",
      fileName: "02-button-bluetooth.png",
      family: "button",
      rect: { x: 0, y: 100, width: 140, height: 70, radius: 35 },
      buttonIdentifier: {
        columnSpan: 2,
        iconName: "bluetooth",
        referenceCellSize: 70,
        rowSpan: 1,
      },
    },
    "button-1": {
      id: "button-1",
      label: "Wi-Fi",
      fileName: "03-button-wi-fi.png",
      family: "button",
      rect: { x: 160, y: 100, width: 70, height: 70, radius: 35 },
      buttonIdentifier: {
        columnSpan: 1,
        iconName: "wifi",
        referenceCellSize: 70,
        rowSpan: 1,
      },
    },
    "button-3": {
      id: "button-3",
      label: "Broken",
      fileName: "04-button-broken.png",
      family: "button",
      rect: { x: 0, y: 200, width: 70, height: 70, radius: 35 },
    },
  },
  visualOrder: ["brightness", "button-2", "button-1", "button-3"],
  goodLockOrder: ["brightness", "button-2", "button-1", "button-3"],
} satisfies QuickPanelPreset;

it("keeps only inspectable Buttons in visual order", () => {
  expect(getInspectableButtonPanels(preset).map((panel) => panel.id)).toEqual([
    "button-2",
    "button-1",
  ]);
});

it("cycles in both directions and handles an empty list", () => {
  expect(getCycledButtonIndex(0, 2, 1)).toBe(1);
  expect(getCycledButtonIndex(1, 2, 1)).toBe(0);
  expect(getCycledButtonIndex(0, 2, -1)).toBe(1);
  expect(getCycledButtonIndex(5, 0, 1)).toBe(0);
});
```

- [ ] **Step 3: Write failing inspector-control tests**

Create `__tests__/button-appearance-inspector-controls.test.tsx`. Mock
`react-i18next` and Lucide as existing component tests do, then assert:

```ts
const props = {
  comparison: "new" as const,
  current: 1,
  label: "Wi-Fi",
  onComparisonChange: jest.fn(),
  onNext: jest.fn(),
  onPrevious: jest.fn(),
  total: 3,
};

const screen = render(<ButtonAppearanceInspectorControls {...props} />);
expect(screen.getByText("Wi-Fi · 1 of 3")).toBeTruthy();
expect(screen.getByTestId("button-appearance-new").props.accessibilityState)
  .toEqual({ selected: true });
expect(screen.getByTestId("button-appearance-before").props.accessibilityState)
  .toEqual({ selected: false });

fireEvent.press(screen.getByTestId("button-appearance-previous"));
fireEvent.press(screen.getByTestId("button-appearance-next"));
fireEvent.press(screen.getByTestId("button-appearance-before"));
expect(props.onPrevious).toHaveBeenCalledTimes(1);
expect(props.onNext).toHaveBeenCalledTimes(1);
expect(props.onComparisonChange).toHaveBeenCalledWith("before");
```

Rerender with `total={1}` and assert both navigation test IDs are absent while
the label remains. Assert navigation controls use `min-h-11 min-w-11` and the
Before/New controls expose `accessibilityRole="tab"` plus controlled selected
state.

- [ ] **Step 4: Run the focused tests and verify the missing modules fail**

Run:

```bash
npm test -- --runInBand __tests__/focused-button-inspector.test.ts __tests__/button-appearance-inspector-controls.test.tsx
```

Expected: FAIL because `focused-button-inspector` and
`ButtonAppearanceInspectorControls` do not exist.

- [ ] **Step 5: Implement the pure inspector helper**

Create `focused-button-inspector.ts`:

```ts
import type {
  ButtonIdentifierDefinition,
  PanelDefinition,
  QuickPanelPreset,
} from "../model/types";

export interface InspectableButtonPanel extends PanelDefinition {
  buttonIdentifier: ButtonIdentifierDefinition;
  family: "button";
}

export type ButtonAppearanceComparison = "before" | "new";

export function getInspectableButtonPanels(
  preset: QuickPanelPreset,
): InspectableButtonPanel[] {
  return preset.visualOrder
    .map((id) => preset.panels[id])
    .filter((panel): panel is InspectableButtonPanel =>
      panel?.family === "button" && panel.buttonIdentifier !== undefined
    );
}

export function getCycledButtonIndex(
  currentIndex: number,
  buttonCount: number,
  direction: -1 | 1,
): number {
  if (buttonCount <= 0) return 0;
  return (currentIndex + direction + buttonCount) % buttonCount;
}
```

- [ ] **Step 6: Add exact locale keys**

Add these English values to `translation.customize`:

```ts
buttonAppearancePosition: "{{label}} · {{current}} of {{total}}",
buttonAppearancePreview: "{{label}} appearance preview",
buttonAppearancePrevious: "Previous Button",
buttonAppearanceNext: "Next Button",
buttonAppearanceBefore: "Before",
buttonAppearanceNew: "New",
buttonAppearanceUnavailable: "Button preview unavailable.",
```

Add these Traditional Chinese values to the same section:

```ts
buttonAppearancePosition: "{{label}} · 第 {{current}} / {{total}} 個",
buttonAppearancePreview: "{{label}} 外觀預覽",
buttonAppearancePrevious: "上一個按鈕",
buttonAppearanceNext: "下一個按鈕",
buttonAppearanceBefore: "變更前",
buttonAppearanceNew: "新設定",
buttonAppearanceUnavailable: "無法顯示按鈕預覽。",
```

Extend `__tests__/locales.test.ts` with exact expectations for all seven keys in
both locales.

- [ ] **Step 7: Implement the controlled inspector controls**

Create `ButtonAppearanceInspectorControls.tsx` using `Text`, `Pressable`, and
Lucide `chevron-left` / `chevron-right`. Keep it controlled rather than using
the current uncontrolled AniUI `Tabs`. Import `cn` from `@/lib/utils` and use
only static class strings:

```tsx
export function ButtonAppearanceInspectorControls(
  props: ButtonAppearanceInspectorControlsProps,
) {
  const { t } = useTranslation();
  const position = t("customize.buttonAppearancePosition", {
    current: props.current,
    label: props.label,
    total: props.total,
  });
  return (
    <View className="gap-2">
      <View className="min-h-11 flex-row items-center justify-between">
        {props.total > 1 ? (
          <Pressable
            accessibilityLabel={t("customize.buttonAppearancePrevious")}
            accessibilityRole="button"
            className="min-h-11 min-w-11 items-center justify-center"
            onPress={props.onPrevious}
            testID="button-appearance-previous"
          >
            <Lucide color="#FFFFFF" name="chevron-left" size={20} />
          </Pressable>
        ) : <View className="h-11 w-11" />}
        <Text className="flex-1 text-center text-sm font-semibold text-white">
          {position}
        </Text>
        {props.total > 1 ? (
          <Pressable
            accessibilityLabel={t("customize.buttonAppearanceNext")}
            accessibilityRole="button"
            className="min-h-11 min-w-11 items-center justify-center"
            onPress={props.onNext}
            testID="button-appearance-next"
          >
            <Lucide color="#FFFFFF" name="chevron-right" size={20} />
          </Pressable>
        ) : <View className="h-11 w-11" />}
      </View>
      <View accessibilityRole="tablist" className="flex-row rounded-lg border border-white/15 bg-zinc-800/95 p-1">
        {(["before", "new"] as const).map((value) => {
          const selected = props.comparison === value;
          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              className={cn(
                "min-h-11 flex-1 items-center justify-center rounded-md",
                selected && "bg-black",
              )}
              key={value}
              onPress={() => props.onComparisonChange(value)}
              testID={`button-appearance-${value}`}
            >
              <Text
                className={cn(
                  "font-medium",
                  selected ? "text-white" : "text-zinc-300",
                )}
              >
                {value === "before"
                  ? t("customize.buttonAppearanceBefore")
                  : t("customize.buttonAppearanceNew")}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
```

Preserve these test IDs and the controlled accessibility contract.

- [ ] **Step 8: Run Task 1 tests**

Run:

```bash
npm test -- --runInBand __tests__/focused-button-inspector.test.ts __tests__/button-appearance-inspector-controls.test.tsx __tests__/locales.test.ts
```

Expected: PASS.

---

### Task 2: Export-faithful focused Button renderer

**Files:**

- Create: `src/features/quick-panel/customize/components/FocusedButtonAppearancePreview.tsx`
- Create: `__tests__/focused-button-appearance-preview.test.tsx`

**Interfaces:**

- Consumes: `InspectableButtonPanel` from Task 1,
  `AnimatedButtonIdentifierAppearance`, `ButtonIdentifierPositions`,
  `ButtonIdentifierBackgroundTheme`, `PickedImage`, `ImageTransform`, and
  `QuickPanelPreset`.
- Produces:

```ts
interface FocusedButtonAppearancePreviewProps {
  animatedAppearance?: AnimatedButtonIdentifierAppearance;
  backgroundTheme: ButtonIdentifierBackgroundTheme;
  buttonIdentifierColor: string;
  buttonIdentifierOpacity: number;
  buttonPanelOpacity: number;
  identifierPositions: ButtonIdentifierPositions;
  image: PickedImage;
  panel: InspectableButtonPanel;
  preset: QuickPanelPreset;
  previewUri: string;
  showButtonIdentifiers: boolean;
  transform: ImageTransform;
}
```

- [ ] **Step 1: Write the failing focused-renderer test**

Create `__tests__/focused-button-appearance-preview.test.tsx`. Mock
`QuickPanelPreviewStage` as a `View` exposing its props. Render a `160×80`
horizontal Button, fire a `320×180` container layout, and assert:

```ts
expect(screen.getByTestId("focused-button-preview-stage").props).toMatchObject({
  buttonIdentifierBackgroundTheme: "dark",
  buttonIdentifierColor: "#D9CCFF",
  buttonIdentifierOpacity: 0.7,
  buttonPanelOpacity: 0.42,
  identifierPositions: { horizontal: 0.23, vertical: 0.77 },
  layoutScale: 2,
  previewFrame: panel.rect,
  previewRatio: 2,
  previewScale: 2,
  previewUri: "file://preview",
  previewWidth: 320,
  showAppGradientBackground: true,
  showButtonIdentifiers: true,
  transform: { x: 12, y: -8, scale: 1.4 },
});
expect(screen.getByTestId("focused-button-preview-stage").props.preset)
  .toMatchObject({ visualOrder: ["button-1"], goodLockOrder: ["button-1"] });
```

Rerender with an `80×160` vertical Button in the same container and assert the
scale is `1.125`, preview width is `90`, and the entire panel remains fitted.
Assert that the wrapper accessibility label uses
`customize.buttonAppearancePreview` with the panel label.

- [ ] **Step 2: Run the focused-renderer test and verify it fails**

Run:

```bash
npm test -- --runInBand __tests__/focused-button-appearance-preview.test.tsx
```

Expected: FAIL because `FocusedButtonAppearancePreview` does not exist.

- [ ] **Step 3: Implement the responsive single-panel renderer**

Create `FocusedButtonAppearancePreview.tsx`. Measure the available width,
reserve `180dp` maximum height, and calculate one display scale:

```tsx
const maxPreviewHeight = 180;
const [containerWidth, setContainerWidth] = useState(0);
const displayScale = containerWidth > 0
  ? Math.min(
      containerWidth / props.panel.rect.width,
      maxPreviewHeight / props.panel.rect.height,
    )
  : 0;
const previewWidth = props.panel.rect.width * displayScale;
const previewRatio = props.panel.rect.width / props.panel.rect.height;
const focusedPreset: QuickPanelPreset = {
  ...props.preset,
  panels: { [props.panel.id]: props.panel },
  visualOrder: [props.panel.id],
  goodLockOrder: [props.panel.id],
};
```

Render a `View` with `height: maxPreviewHeight`, centered content, and
`onLayout` setting `containerWidth`. Once `displayScale > 0`, render
`QuickPanelPreviewStage` with:

```tsx
<QuickPanelPreviewStage
  animatedButtonIdentifierAppearance={props.animatedAppearance}
  buttonIdentifierBackgroundTheme={props.backgroundTheme}
  buttonIdentifierColor={props.buttonIdentifierColor}
  buttonIdentifierOpacity={props.buttonIdentifierOpacity}
  buttonPanelOpacity={props.buttonPanelOpacity}
  handleLayout={() => undefined}
  identifierPositions={props.identifierPositions}
  image={props.image}
  layoutScale={displayScale}
  preset={focusedPreset}
  previewFrame={props.panel.rect}
  previewRatio={previewRatio}
  previewScale={displayScale}
  previewUri={props.previewUri}
  previewWidth={previewWidth}
  showAppGradientBackground
  showButtonIdentifiers={props.showButtonIdentifiers}
  transform={props.transform}
/>
```

Set the stage test ID in the Jest mock; do not modify
`QuickPanelPreviewStage` solely for this test. Add an accessible wrapper label
from `customize.buttonAppearancePreview`. Do not add gesture handlers or local
transform state.

- [ ] **Step 4: Run the focused renderer and existing composition regressions**

Run:

```bash
npm test -- --runInBand __tests__/focused-button-appearance-preview.test.tsx __tests__/quick-panel-preview-stage-background.test.tsx __tests__/panel-image-intensity.test.tsx
```

Expected: PASS. This confirms the focused wrapper still delegates gradient,
panel intensity, identifier layout, source coordinates, and frame rendering to
the existing composition primitives.

---

### Task 3: Dialog focus, Before/New comparison, and transactions

**Files:**

- Create: `src/features/quick-panel/customize/components/ButtonLabelAppearanceDialogFrame.tsx`
- Modify: `src/features/quick-panel/customize/components/ButtonLabelAppearanceDialog.tsx`
- Modify: `src/features/quick-panel/customize/components/ButtonLabelColorPicker.tsx`
- Modify: `__tests__/button-label-appearance-dialog.test.tsx`

**Interfaces:**

- Consumes: Task 1 helpers and controls, Task 2 focused preview, and the
  existing `useButtonLabelAppearanceDraft` return object.
- Adds to `ButtonLabelColorPickerProps`:

```ts
onDraftInteraction: () => void;
```

- Produces this extracted shell interface:

```ts
interface ButtonLabelAppearanceDialogFrameProps extends PropsWithChildren {
  confirmDisabled: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
}
```

- Local dialog state:

```ts
const [focusedIndex, setFocusedIndex] = useState(0);
const [comparison, setComparison] =
  useState<ButtonAppearanceComparison>("new");
```

- [ ] **Step 1: Replace the old preview mock and give the dialog fixture real panels**

In `__tests__/button-label-appearance-dialog.test.tsx`:

- remove the `QuickPanelPreview` mock;
- mock `FocusedButtonAppearancePreview` as a `View` with test ID
  `focused-button-preview` and all received props;
- change the shared `preset` fixture to contain one Control followed by three
  valid Button panels: horizontal Wi-Fi, vertical Bluetooth, and square Smart
  View; and
- keep a separate `emptyPreset` for the defensive test.

The first existing transaction test must now assert that the focused preview
receives Wi-Fi, `buttonPanelOpacity: 0.42`, the current identifier positions,
and no interactive/gesture prop.

- [ ] **Step 2: Write failing focus-navigation tests**

Add this behavior:

```ts
const screen = render(<ButtonLabelAppearanceDialog {...props} />);
expect(screen.getByTestId("focused-button-preview").props.panel.id)
  .toBe("button-1");

fireEvent.press(screen.getByTestId("button-appearance-next"));
expect(screen.getByTestId("focused-button-preview").props.panel.id)
  .toBe("button-2");

fireEvent.press(screen.getByTestId("button-appearance-next"));
fireEvent.press(screen.getByTestId("button-appearance-next"));
expect(screen.getByTestId("focused-button-preview").props.panel.id)
  .toBe("button-1");

fireEvent.press(screen.getByTestId("button-appearance-previous"));
expect(screen.getByTestId("focused-button-preview").props.panel.id)
  .toBe("button-3");
```

Assert that none of `onConfirm`, `onCancel`, image transform props, or preset
ordering change while focus cycles.

- [ ] **Step 3: Write failing Before/New and empty-state tests**

Assert default `New` passes `draft.animatedAppearance`. Press Before and assert:

```ts
expect(screen.getByTestId("focused-button-preview").props).toMatchObject({
  animatedAppearance: undefined,
  backgroundTheme: "light",
  buttonIdentifierColor: "#FFFFFF",
  buttonIdentifierOpacity: 0.7,
});
expect(props.onConfirm).not.toHaveBeenCalled();
```

While Before is selected, press the Light/Dark toggle. Assert comparison
returns to New, the focused preview again receives `animatedAppearance`, and
Confirm commits the new theme. Repeat through valid HEX input to prove draft
interaction switches the comparison without early persistence.

Render `emptyPreset` and assert:

- `customize.buttonAppearanceUnavailable` is visible;
- the focused preview, picker, and navigation are absent;
- Cancel remains enabled; and
- Confirm is disabled and does not call `onConfirm`.

- [ ] **Step 4: Run the dialog tests and verify the new cases fail**

Run:

```bash
npm test -- --runInBand __tests__/button-label-appearance-dialog.test.tsx
```

Expected: FAIL because the dialog still renders the complete
`QuickPanelPreview` and has no focus or comparison state.

- [ ] **Step 5: Add draft-interaction notification to the picker**

Extend `ButtonLabelColorPickerProps` with `onDraftInteraction`. Call it without
moving committed state:

```tsx
const handlePickerCompleteAndShowNew = (colors: ColorFormatsObject) => {
  onDraftInteraction();
  onComplete(colors);
};
const handleHexTextChange = (text: string) => {
  onDraftInteraction();
  onHexChange(text);
};
const handleThemeChange = (theme: ButtonIdentifierBackgroundTheme) => {
  onDraftInteraction();
  onBackgroundThemeChange(theme);
};

<View className="gap-2" onTouchStart={onDraftInteraction}>
  <ColorPicker
    ref={pickerRef}
    onChange={onChange}
    onCompleteJS={handlePickerCompleteAndShowNew}
    sliderThickness={12}
    thumbSize={28}
    thumbStyle={{ borderColor: "#FFFFFF", borderWidth: 2 }}
    value={initialValue}
  >
    <Panel3
      accessibilityLabel={t("customize.buttonIdentifierColorWheel")}
      style={{ alignSelf: "center", height: 190, width: 190 }}
    />
    <View className="mt-2">
      <ButtonLabelAdjustmentTabs />
    </View>
  </ColorPicker>
  <Text className="text-xs font-semibold text-zinc-300">
    {t("customize.buttonIdentifierHex")}
  </Text>
  <View
    className="flex-row items-center gap-2"
    testID="button-identifier-hex-theme-row"
  >
  <Input
    accessibilityLabel={t("customize.buttonIdentifierHex")}
    autoCapitalize="characters"
    className="flex-1 border-white/20 bg-zinc-900 text-white"
    onChangeText={handleHexTextChange}
    placeholder="#RRGGBB"
    testID="button-identifier-hex-input"
    value={hexText}
  />
  <ButtonIdentifierBackgroundThemeToggle
    onChange={handleThemeChange}
    theme={backgroundTheme}
  />
  </View>
  {error ? <Text className="text-sm text-red-300">{error}</Text> : null}
</View>
```

Keep the worklet `onChange` callback untouched. `onTouchStart` returns the
preview to New as soon as a native touch begins; the explicit JS wrappers cover
keyboard input, theme actions, completion, and accessibility activation.

- [ ] **Step 6: Replace the full-layout preview in the dialog**

First create `ButtonLabelAppearanceDialogFrame.tsx` by moving the existing
modal shell out of `ButtonLabelAppearanceDialog` without changing its test IDs,
classes, keyboard behavior, or actions:

```tsx
import { Button } from "@/components/ani-ui/button";
import { Text } from "@/components/ani-ui/text";
import type { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Modal, Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";

interface ButtonLabelAppearanceDialogFrameProps extends PropsWithChildren {
  confirmDisabled: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
}

export function ButtonLabelAppearanceDialogFrame(
  props: ButtonLabelAppearanceDialogFrameProps,
) {
  const { t } = useTranslation();
  return (
    <Modal
      accessibilityViewIsModal
      animationType="fade"
      onRequestClose={props.onCancel}
      transparent
      visible={props.open}
    >
      <View className="flex-1" testID="button-label-appearance-root">
        <Pressable
          accessibilityLabel={t("customize.cancelButtonIdentifierAppearance")}
          className="absolute inset-0 bg-black/50"
          onPress={props.onCancel}
          testID="button-label-appearance-backdrop"
        />
        <KeyboardAvoidingView
          behavior="padding"
          className="flex-1 items-center justify-center px-5 py-8"
          keyboardVerticalOffset={12}
          pointerEvents="box-none"
          testID="button-label-appearance-keyboard-avoider"
        >
          <View
            className="max-h-full w-full max-w-[430px] overflow-hidden rounded-lg border border-slate-700 bg-slate-950"
            testID="button-label-appearance-card"
          >
            <Text className="px-5 pb-3 pt-5 text-lg font-semibold text-white">
              {t("customize.buttonIdentifierAppearance")}
            </Text>
            <ScrollView
              className="px-5"
              contentContainerStyle={{ gap: 16, paddingBottom: 20 }}
              keyboardShouldPersistTaps="handled"
              testID="button-label-appearance-scroll"
            >
              {props.children}
            </ScrollView>
            <View className="flex-row gap-3 border-t border-white/10 px-5 py-4">
              <Button
                className="flex-1 bg-white"
                onPress={props.onCancel}
                testID="button-label-appearance-cancel"
                textClassName="text-black"
              >
                {t("common.cancel")}
              </Button>
              <Button
                className="flex-1 bg-green-200/90"
                disabled={props.confirmDisabled}
                onPress={props.onConfirm}
                textClassName="text-green-900"
              >
                {t("common.confirm")}
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
```

Keep `ButtonLabelAppearanceDialogFrame.tsx` and the rewritten
`ButtonLabelAppearanceDialog.tsx` below 150 lines each.

In `ButtonLabelAppearanceDialog`:

```ts
const inspectablePanels = getInspectableButtonPanels(props.preset);
const focusedPanel = inspectablePanels[focusedIndex] ?? inspectablePanels[0];
const displayedIndex = focusedPanel
  ? inspectablePanels.findIndex((panel) => panel.id === focusedPanel.id)
  : 0;
const isNew = comparison === "new";
const cycleFocus = (direction: -1 | 1) => {
  setFocusedIndex((current) =>
    getCycledButtonIndex(current, inspectablePanels.length, direction)
  );
};
```

Return `ButtonLabelAppearanceDialogFrame` with
`confirmDisabled={draft.confirmDisabled || focusedPanel === undefined}` and
`onConfirm={() => props.onConfirm(draft.readConfirmedAppearance())}`. Replace
`QuickPanelPreview` with this conditional block as the frame children:

```tsx
{focusedPanel ? (
  <>
    <FocusedButtonAppearancePreview
      animatedAppearance={isNew ? draft.animatedAppearance : undefined}
      backgroundTheme={isNew ? draft.backgroundTheme : props.backgroundTheme}
      buttonIdentifierColor={props.color}
      buttonIdentifierOpacity={props.opacity / 100}
      buttonPanelOpacity={props.imageOpacity}
      identifierPositions={props.identifierPositions}
      image={props.image}
      panel={focusedPanel}
      preset={props.preset}
      previewUri={props.previewUri}
      showButtonIdentifiers={props.showButtonIdentifiers}
      transform={props.transform}
    />
    <ButtonAppearanceInspectorControls
      comparison={comparison}
      current={displayedIndex + 1}
      label={focusedPanel.label}
      onComparisonChange={setComparison}
      onNext={() => cycleFocus(1)}
      onPrevious={() => cycleFocus(-1)}
      total={inspectablePanels.length}
    />
    <ButtonLabelColorPicker
      backgroundTheme={draft.backgroundTheme}
      error={draft.error}
      hexText={draft.hexText}
      initialValue={initialValue}
      onBackgroundThemeChange={draft.handleBackgroundThemeChange}
      onChange={draft.handlePickerChange}
      onComplete={draft.handlePickerComplete}
      onDraftInteraction={() => setComparison("new")}
      onHexChange={draft.handleHexChange}
      pickerRef={draft.pickerRef}
    />
  </>
) : (
  <Text
    className="py-12 text-center text-sm text-zinc-300"
    testID="button-appearance-unavailable"
  >
    {t("customize.buttonAppearanceUnavailable")}
  </Text>
)}
```

Set Confirm disabled to
`draft.confirmDisabled || focusedPanel === undefined`. Keep Cancel, backdrop,
Android `onRequestClose`, keyboard avoidance, scroll container, and sticky
footer unchanged.

Do not add a reset effect: `CustomizePreviewSection` already conditionally
mounts the dialog only while open, so unmounting resets focus and comparison
without `react-hooks/set-state-in-effect`.

- [ ] **Step 7: Run focused dialog and controls tests**

Run:

```bash
npm test -- --runInBand __tests__/button-label-appearance-dialog.test.tsx __tests__/button-appearance-inspector-controls.test.tsx __tests__/focused-button-appearance-preview.test.tsx
```

Expected: PASS, including all pre-existing dialog transaction and keyboard
tests.

- [ ] **Step 8: Run Customize and read-only preview regressions**

Run:

```bash
npm test -- --runInBand __tests__/customize-screen.test.tsx __tests__/customize-screen-export-surfaces.test.tsx __tests__/quick-panel-preview-read-only.test.tsx __tests__/panel-image-intensity.test.tsx
```

Expected: PASS. Confirm no changes were needed in the intentionally unchanged
main preview or export files.

---

### Task 4: Durable notes and complete automated verification

**Files:**

- Modify: `docs/notes.md`
- Verify only: every source and test file from Tasks 1–3

**Interfaces:** None. This task records the final contract and proves the
integrated worktree remains healthy.

- [ ] **Step 1: Add the newest durable behavior note**

Append a dated entry to `docs/notes.md` after implementation passes:

```markdown
### 2026-08-04: Focused Button appearance inspector

- Buttons-only and combined Customize keep the full calibrated union as the
  shared image-transform canvas.
- The appearance dialog previews one real calibrated Button at a time through
  the existing source-coordinate composition path; Previous/Next focus is
  screen-local and never changes selection or export order.
- New uses the live transactional draft, while Before uses the committed
  appearance captured when the dialog opens. Only Confirm persists changes.
- The focused preview is read-only, uses the current target's Button image
  intensity and shared identifier settings, and does not add a crop, transform,
  export surface, or persisted field.
```

- [ ] **Step 2: Run all focused inspector tests together**

Run:

```bash
npm test -- --runInBand __tests__/focused-button-inspector.test.ts __tests__/button-appearance-inspector-controls.test.tsx __tests__/focused-button-appearance-preview.test.tsx __tests__/button-label-appearance-dialog.test.tsx __tests__/locales.test.ts
```

Expected: PASS.

- [ ] **Step 3: Run the full Jest suite**

Run:

```bash
npm test -- --runInBand
```

Expected: all suites pass. Do not update unrelated snapshots or weaken existing
combined-mode assertions to obtain a pass.

- [ ] **Step 4: Run Expo lint**

Run:

```bash
npm run lint
```

Expected: exit 0 with no new errors. Fix only findings introduced by this
feature.

- [ ] **Step 5: Run TypeScript**

Run:

```bash
npx tsc --noEmit
```

Expected: exit 0. Confirm the inspectable-panel type removes the optional
`buttonIdentifier` ambiguity without casts or `any`.

- [ ] **Step 6: Check whitespace and review the exact scope**

Run:

```bash
git diff --check
git status --short
git diff --stat
git diff -- src/features/quick-panel/customize/focused-button-inspector.ts src/features/quick-panel/customize/components/ButtonAppearanceInspectorControls.tsx src/features/quick-panel/customize/components/FocusedButtonAppearancePreview.tsx src/features/quick-panel/customize/components/ButtonLabelAppearanceDialog.tsx src/features/quick-panel/customize/components/ButtonLabelColorPicker.tsx __tests__/focused-button-inspector.test.ts __tests__/button-appearance-inspector-controls.test.tsx __tests__/focused-button-appearance-preview.test.tsx __tests__/button-label-appearance-dialog.test.tsx __tests__/locales.test.ts i18next/locales/en.ts i18next/locales/zh.ts docs/notes.md
```

Expected: no whitespace errors. The diff contains only the focused inspector,
its tests/locales/note, plus the user's pre-existing combined-mode work. Do not
stage or commit anything.

- [ ] **Step 7: Hand physical acceptance back to the user**

Report the automated results and ask the user to perform the seven manual
acceptance checks from the approved design on the Samsung portrait device.
Do not run `npm run android`, build an APK, capture screenshots, or claim
QuickStar visual parity in this implementation session.

---

## Completion Boundary

Implementation is complete only when Tasks 1–4 pass and the source diff stays
within the listed files. Automated completion does not claim physical Samsung
or QuickStar acceptance. The final implementation handoff must provide a brief
suggested commit message in the project format, but Codex must not stage or
commit it.
