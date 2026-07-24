# Buttons Customize Compact Tabs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:executing-plans` to implement this plan inline, task-by-task.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the tall stack of Button Customize sliders with compact
AniUI tabs and one active slider so the live preview stays visible while the
user adjusts it.

**Architecture:** Keep the existing values and setters in
`useButtonCustomizeControls`. Add a presentation-only `ButtonAdjustmentTabs`
component that maps available tabs to those typed props, while
`ButtonCustomizeControls` retains the visibility switch and card layout.

**Tech Stack:** Expo 56, React Native, TypeScript, Uniwind, AniUI Tabs and
Slider, i18next, Jest, and `@testing-library/react-native`.

## Global Constraints

- Work inline only. Do not use subagents, worktrees, browser demos, commits,
  pushes, or staging.
- Preserve the user's untracked `src/components/ani-ui/tabs.tsx` and
  `.aniui.json` changes.
- Use the installed AniUI Tabs API from `https://www.aniui.dev/docs/tabs`; do
  not add or update dependencies.
- Preserve defaults: image 78, identifier 70, horizontal 50, vertical 50, and
  identifiers enabled on each Customize visit.
- Do not change persistence, storage, calibration, preset, preview, export,
  filename, or readiness contracts.
- Do not add `useMemo`, `useCallback`, or `React.memo` outside AniUI.
- Use typed interfaces, no `any`, and keep changed feature components below
  150 lines.
- Follow TDD: add each behavior test, observe the expected failure, then add
  the smallest production implementation.

## File Structure

- Modify: `i18next/locales/en.ts` — concise English tab labels.
- Modify: `i18next/locales/zh.ts` — concise Traditional Chinese tab labels.
- Modify: `__tests__/locales.test.ts` — exact copy expectations.
- Create: `src/features/quick-panel/customize/components/ButtonAdjustmentTabs.tsx`
  — available tabs and the single active slider.
- Create: `src/features/quick-panel/customize/components/ButtonAdjustmentSlider.tsx`
  — shared label, percentage, and slider presentation.
- Modify: `src/features/quick-panel/customize/components/ButtonCustomizeControls.tsx`
  — compact switch row and tab composition.
- Modify: `__tests__/button-customize-controls.test.tsx` — tab behavior.
- Modify: `docs/notes.md` — final decision and device result.
- Review only: `src/components/ani-ui/tabs.tsx` — user-installed primitive.

---

### Task 1: Add concise localized tab labels

**Files:**

- Modify: `__tests__/locales.test.ts`
- Modify: `i18next/locales/en.ts`
- Modify: `i18next/locales/zh.ts`

**Interfaces:** Produces the four `customize.buttonAdjustment*Tab` keys used by
Task 3. Existing long labels remain the slider and accessibility labels.

- [ ] **Step 1: Write failing locale expectations**

Add to the existing Button identifier locale test:

```ts
expect(enLocale.translation.customize.buttonAdjustmentImageTab).toBe("Image");
expect(enLocale.translation.customize.buttonAdjustmentIdentifierTab).toBe("Identifier");
expect(enLocale.translation.customize.buttonAdjustmentHorizontalTab).toBe("Horiz.");
expect(enLocale.translation.customize.buttonAdjustmentVerticalTab).toBe("Vert.");
expect(zhLocale.translation.customize.buttonAdjustmentImageTab).toBe("圖片");
expect(zhLocale.translation.customize.buttonAdjustmentIdentifierTab).toBe("識別標記");
expect(zhLocale.translation.customize.buttonAdjustmentHorizontalTab).toBe("水平");
expect(zhLocale.translation.customize.buttonAdjustmentVerticalTab).toBe("垂直");
```

- [ ] **Step 2: Verify RED**

Run:

```bash
npm test -- --runInBand __tests__/locales.test.ts
```

Expected: FAIL because the four new locale properties are absent.

- [ ] **Step 3: Add exact locale values**

Add after `buttonPanelOpacity` in `i18next/locales/en.ts`:

```ts
buttonAdjustmentImageTab: "Image",
buttonAdjustmentIdentifierTab: "Identifier",
buttonAdjustmentHorizontalTab: "Horiz.",
buttonAdjustmentVerticalTab: "Vert.",
```

Add at the same location in `i18next/locales/zh.ts`:

```ts
buttonAdjustmentImageTab: "圖片",
buttonAdjustmentIdentifierTab: "識別標記",
buttonAdjustmentHorizontalTab: "水平",
buttonAdjustmentVerticalTab: "垂直",
```

- [ ] **Step 4: Verify GREEN and whitespace**

Run:

```bash
npm test -- --runInBand __tests__/locales.test.ts
git diff --check
```

Expected: both commands exit zero without warnings or snapshots. Do not stage,
commit, or push.

---

### Task 2: Specify compact tab behavior in the component tests

**Files:**

- Modify: `__tests__/button-customize-controls.test.tsx`

**Interfaces:** Preserves existing slider test IDs and adds
`button-adjustment-{image,identifier,horizontal,vertical}-tab` test IDs.

- [ ] **Step 1: Replace stacked-slider expectations with tab expectations**

Keep the existing Slider/i18next mocks, `baseProps`, `beforeEach`, and switch
test. Add these tests:

```tsx
it("starts on image intensity with one active slider", () => {
  const screen = render(<ButtonCustomizeControls {...baseProps} />);

  expect(
    screen.getByTestId("button-adjustment-image-tab").props.accessibilityState,
  ).toEqual({ disabled: false, selected: true });
  expect(screen.getByTestId("button-panel-opacity-slider").props).toMatchObject({
    disabled: false,
    value: 78,
  });
  expect(screen.queryByTestId("button-identifier-opacity-slider")).toBeNull();
  expect(screen.queryByTestId("horizontal-identifier-position-slider")).toBeNull();
  expect(screen.queryByTestId("vertical-identifier-position-slider")).toBeNull();
});

it("routes the shared slider through each selected adjustment tab", () => {
  const screen = render(<ButtonCustomizeControls {...baseProps} />);

  fireEvent.press(screen.getByTestId("button-adjustment-identifier-tab"));
  expect(screen.getByTestId("button-identifier-opacity-slider").props).toMatchObject({
    disabled: false,
    onValueChange: baseProps.onButtonIdentifierOpacityChange,
    value: 70,
  });

  fireEvent.press(screen.getByTestId("button-adjustment-horizontal-tab"));
  expect(screen.getByTestId("horizontal-identifier-position-slider").props).toMatchObject({
    onValueChange: baseProps.onHorizontalIdentifierPositionChange,
    value: 50,
  });

  fireEvent.press(screen.getByTestId("button-adjustment-vertical-tab"));
  expect(screen.getByTestId("vertical-identifier-position-slider").props).toMatchObject({
    onValueChange: baseProps.onVerticalIdentifierPositionChange,
    value: 50,
  });
});

it("only renders position tabs for orientations in the preset", () => {
  const screen = render(
    <ButtonCustomizeControls {...baseProps} hasHorizontalButtons={false} />,
  );
  expect(screen.queryByTestId("button-adjustment-horizontal-tab")).toBeNull();
  expect(screen.getByTestId("button-adjustment-vertical-tab")).toBeTruthy();

  screen.rerender(
    <ButtonCustomizeControls {...baseProps} hasVerticalButtons={false} />,
  );
  expect(screen.getByTestId("button-adjustment-horizontal-tab")).toBeTruthy();
  expect(screen.queryByTestId("button-adjustment-vertical-tab")).toBeNull();
});

it("returns to image when identifiers are hidden from a position tab", () => {
  const screen = render(<ButtonCustomizeControls {...baseProps} />);
  fireEvent.press(screen.getByTestId("button-adjustment-horizontal-tab"));

  screen.rerender(
    <ButtonCustomizeControls {...baseProps} showButtonIdentifiers={false} />,
  );
  expect(
    screen.getByTestId("button-adjustment-image-tab").props.accessibilityState,
  ).toMatchObject({ disabled: false, selected: true });
  expect(screen.getByTestId("button-panel-opacity-slider").props).toMatchObject({
    disabled: false,
    value: 78,
  });
});
```

Preserve this switch regression:

```tsx
it("requests hiding identifiers from the switch", () => {
  const screen = render(<ButtonCustomizeControls {...baseProps} />);
  fireEvent.press(screen.getByRole("switch"));
  expect(baseProps.onShowButtonIdentifiersChange).toHaveBeenCalledWith(false);
});
```

- [ ] **Step 2: Verify RED**

Run:

```bash
npm test -- --runInBand __tests__/button-customize-controls.test.tsx
```

Expected: FAIL because the tab elements do not exist and all four sliders are
still rendered simultaneously.

---

### Task 3: Implement the compact adjustment tabs

**Files:**

- Create: `src/features/quick-panel/customize/components/ButtonAdjustmentTabs.tsx`
- Create: `src/features/quick-panel/customize/components/ButtonAdjustmentSlider.tsx`
- Modify: `src/features/quick-panel/customize/components/ButtonCustomizeControls.tsx`

**Interfaces:** `ButtonAdjustmentTabs` consumes the same values, setters,
orientation flags, and visibility boolean already present in
`ButtonCustomizeControlsProps`. The parent props remain unchanged.

- [ ] **Step 1: Create the shared slider presentation**

Create `ButtonAdjustmentSlider.tsx`:

```tsx
import { Slider } from "@/components/ani-ui/slider";
import { Text } from "@/components/ani-ui/text";
import { View } from "react-native";

export interface ButtonAdjustment {
  accessibilityLabel: string;
  disabled: boolean;
  label: string;
  onValueChange: (value: number) => void;
  sliderTestID: string;
  tabLabel: string;
  tabTestID: string;
  value: number;
  valueKey: string;
}

interface ButtonAdjustmentSliderProps {
  adjustment: ButtonAdjustment;
}

export function ButtonAdjustmentSlider({
  adjustment,
}: ButtonAdjustmentSliderProps) {
  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-semibold uppercase tracking-[0.8px] text-zinc-400">
          {adjustment.label}
        </Text>
        <Text className="text-sm font-semibold tabular-nums text-white">
          {adjustment.value}%
        </Text>
      </View>
      <View className="rounded-lg bg-zinc-800/70 px-3 py-2">
        <Slider
          disabled={adjustment.disabled}
          max={100}
          min={0}
          onValueChange={adjustment.onValueChange}
          size="sm"
          step={1}
          testID={adjustment.sliderTestID}
          value={adjustment.value}
        />
      </View>
    </View>
  );
}
```

- [ ] **Step 2: Create the tabs and adjustment mappings**

Create `ButtonAdjustmentTabs.tsx` with these imports and props:

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ani-ui/tabs";
import { useTranslation } from "react-i18next";
import {
  ButtonAdjustmentSlider,
  type ButtonAdjustment,
} from "./ButtonAdjustmentSlider";

interface ButtonAdjustmentTabsProps {
  buttonIdentifierOpacity: number;
  buttonPanelOpacity: number;
  hasHorizontalButtons: boolean;
  hasVerticalButtons: boolean;
  horizontalIdentifierPosition: number;
  onButtonIdentifierOpacityChange: (value: number) => void;
  onButtonPanelOpacityChange: (value: number) => void;
  onHorizontalIdentifierPositionChange: (value: number) => void;
  onVerticalIdentifierPositionChange: (value: number) => void;
  showButtonIdentifiers: boolean;
  verticalIdentifierPosition: number;
}
```

Complete that file with this exported component:

```tsx
export function ButtonAdjustmentTabs(props: ButtonAdjustmentTabsProps) {
  const { t } = useTranslation();
  const identifierDisabled = !props.showButtonIdentifiers;
  const adjustments: ButtonAdjustment[] = [
    {
      accessibilityLabel: t("customize.buttonPanelOpacity"),
      disabled: false,
      label: t("customize.buttonPanelOpacity"),
      onValueChange: props.onButtonPanelOpacityChange,
      sliderTestID: "button-panel-opacity-slider",
      tabLabel: t("customize.buttonAdjustmentImageTab"),
      tabTestID: "button-adjustment-image-tab",
      value: props.buttonPanelOpacity,
      valueKey: "image",
    },
    {
      accessibilityLabel: t("customize.buttonIdentifierOpacity"),
      disabled: identifierDisabled,
      label: t("customize.buttonIdentifierOpacity"),
      onValueChange: props.onButtonIdentifierOpacityChange,
      sliderTestID: "button-identifier-opacity-slider",
      tabLabel: t("customize.buttonAdjustmentIdentifierTab"),
      tabTestID: "button-adjustment-identifier-tab",
      value: props.buttonIdentifierOpacity,
      valueKey: "identifier",
    },
  ];

  if (props.hasHorizontalButtons) {
    adjustments.push({
      accessibilityLabel: t("customize.horizontalIdentifierPosition"),
      disabled: identifierDisabled,
      label: t("customize.horizontalIdentifierPosition"),
      onValueChange: props.onHorizontalIdentifierPositionChange,
      sliderTestID: "horizontal-identifier-position-slider",
      tabLabel: t("customize.buttonAdjustmentHorizontalTab"),
      tabTestID: "button-adjustment-horizontal-tab",
      value: props.horizontalIdentifierPosition,
      valueKey: "horizontal",
    });
  }
  if (props.hasVerticalButtons) {
    adjustments.push({
      accessibilityLabel: t("customize.verticalIdentifierPosition"),
      disabled: identifierDisabled,
      label: t("customize.verticalIdentifierPosition"),
      onValueChange: props.onVerticalIdentifierPositionChange,
      sliderTestID: "vertical-identifier-position-slider",
      tabLabel: t("customize.buttonAdjustmentVerticalTab"),
      tabTestID: "button-adjustment-vertical-tab",
      value: props.verticalIdentifierPosition,
      valueKey: "vertical",
    });
  }

  return (
    <Tabs
      defaultValue="image"
      key={props.showButtonIdentifiers ? "identifiers-on" : "identifiers-off"}
      size="sm"
    >
      <TabsList className="w-full bg-zinc-800/70">
        {adjustments.map((adjustment) => (
          <TabsTrigger
            accessibilityLabel={adjustment.accessibilityLabel}
            disabled={adjustment.disabled}
            key={adjustment.valueKey}
            testID={adjustment.tabTestID}
            value={adjustment.valueKey}
          >
            {adjustment.tabLabel}
          </TabsTrigger>
        ))}
      </TabsList>
      {adjustments.map((adjustment) => (
        <TabsContent
          className="mt-3"
          key={adjustment.valueKey}
          value={adjustment.valueKey}
        >
          <ButtonAdjustmentSlider adjustment={adjustment} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
```

- [ ] **Step 3: Simplify `ButtonCustomizeControls`**

Remove its Slider import, `OpacityControlProps`, `OpacityControl`, and stacked
slider controls. Import `ButtonAdjustmentTabs`, preserve the existing props,
and render this compact card:

```tsx
<View className="mt-4 w-full max-w-md gap-3 rounded-2xl border border-white/10 bg-zinc-900/90 px-4 py-3">
  <Pressable
    accessibilityRole="switch"
    accessibilityState={{ checked: showButtonIdentifiers }}
    className={`min-h-11 flex-row items-center justify-between rounded-xl border px-3 ${
      showButtonIdentifiers
        ? "border-emerald-300/40 bg-emerald-300/10"
        : "border-white/10 bg-zinc-800/70"
    }`}
    onPress={() => onShowButtonIdentifiersChange(!showButtonIdentifiers)}
  >
    <Text className="font-semibold text-white">
      {t("customize.showButtonIdentifiers")}
    </Text>
    <Text className={`text-xs font-semibold uppercase ${
      showButtonIdentifiers ? "text-emerald-200" : "text-zinc-500"
    }`}>
      {t(showButtonIdentifiers
        ? "customize.buttonIdentifiersOn"
        : "customize.buttonIdentifiersOff")}
    </Text>
  </Pressable>
  <ButtonAdjustmentTabs
    buttonIdentifierOpacity={buttonIdentifierOpacity}
    buttonPanelOpacity={buttonPanelOpacity}
    hasHorizontalButtons={hasHorizontalButtons}
    hasVerticalButtons={hasVerticalButtons}
    horizontalIdentifierPosition={horizontalIdentifierPosition}
    onButtonIdentifierOpacityChange={onButtonIdentifierOpacityChange}
    onButtonPanelOpacityChange={onButtonPanelOpacityChange}
    onHorizontalIdentifierPositionChange={onHorizontalIdentifierPositionChange}
    onVerticalIdentifierPositionChange={onVerticalIdentifierPositionChange}
    showButtonIdentifiers={showButtonIdentifiers}
    verticalIdentifierPosition={verticalIdentifierPosition}
  />
</View>
```

- [ ] **Step 4: Verify GREEN**

Run:

```bash
npm test -- --runInBand __tests__/button-customize-controls.test.tsx
```

Expected: PASS without warnings or snapshots.

- [ ] **Step 5: Verify types, lint, size, and whitespace**

Run:

```bash
npx tsc --noEmit
npm run lint
wc -l src/features/quick-panel/customize/components/ButtonAdjustmentSlider.tsx src/features/quick-panel/customize/components/ButtonAdjustmentTabs.tsx src/features/quick-panel/customize/components/ButtonCustomizeControls.tsx
git diff --check
```

Expected: every command exits zero and each component is at most 149 lines.
Do not stage, commit, or push.

---

### Task 4: Document and verify the finished UI-only redesign

**Files:**

- Modify: `docs/notes.md`
- Review: `docs/superpowers/specs/2026-07-17-buttons-customize-compact-tabs-design.md`
- Review: `src/features/quick-panel/customize/CustomizeScreen.tsx`

**Interfaces:** No new production interface. Customize-to-preview/export props
and all screen-local defaults remain unchanged.

- [ ] **Step 1: Record the decision**

Add near the top of `docs/notes.md`:

```md
### 2026-07-17: Compact Button Customize adjustment tabs

- Replaced the stacked Button Customize sliders with four direct adjustment
  tabs and one active slider so the live preview remains visible while tuning.
- Image is the default tab. Hiding identifiers returns the selector to Image
  while disabling the identifier-related tabs without resetting their values.
- Orientation tabs remain conditional on the active Buttons preset.
- Values, defaults, preview/export behavior, and persistence remain unchanged.
- Additional arbitrary tuning: None.
```

- [ ] **Step 2: Run focused regressions**

Run:

```bash
npm test -- --runInBand __tests__/button-customize-controls.test.tsx __tests__/customize-screen.test.tsx __tests__/customize-screen-export-surfaces.test.tsx __tests__/panel-image-intensity.test.tsx __tests__/locales.test.ts
```

Expected: PASS without warnings or snapshots.

- [ ] **Step 3: Check for a connected Samsung device**

Run `adb devices -l`. Do not reset app data. If available, verify on the
existing Buttons-only calibration:

1. Preview and complete compact card are visible together without scrolling.
2. Image is the default tab and exactly one slider is visible.
3. Every tab routes to the correct value and live preview adjustment.
4. Orientation tabs are conditional.
5. Hiding identifiers from Identifier, Horiz., or Vert. returns to Image and
   disables the identifier tabs; re-enabling preserves values.
6. Export output still matches the preview.
7. Reopening Customize resets values to 78, 70, 50, and 50 and selects Image.

Record model, One UI, QuickStar, and tuning in `docs/notes.md`. If no device is
available, append:

```md
- Device QA was not run because ADB reported no connected device. The supplied
  screenshots use `SM-S9360`; One UI and QuickStar versions were not recorded.
```

- [ ] **Step 4: Run full verification**

Run:

```bash
npm test -- --runInBand
npm run lint
npx tsc --noEmit
git diff --check
```

Expected: every command exits zero without warnings or snapshots.

- [ ] **Step 5: Final contract audit**

Confirm only Buttons Customize presentation changed; no storage, calibration,
preview, export, dependency, memo hook, `any`, commit, push, or staging change
was introduced; changed feature components remain below 150 lines; and the
user's `.aniui.json` and `src/components/ani-ui/tabs.tsx` changes are preserved.

Suggested commit message for the user:

```text
refactor: compact Button adjustment controls into tabs
```
