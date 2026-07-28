# Buttons Label Color Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:executing-plans` to implement this plan inline, task-by-task.
> Project instructions prohibit subagents, commits, and pushes.

**Goal:** Replace the Buttons-only light/dark identifier theme and compact
Label-intensity tab with a transactional color dialog that edits one shared
glyph-and-label color plus opacity, previews changes in real time, and sends
only confirmed values to the main preview and export surfaces.

**Architecture:** Persist one normalized six-digit HEX color beside the existing
identifier opacity. Keep the committed path static and deterministic from MMKV
through preview/export. The dialog owns temporary Reanimated shared values so
picker drags update a read-only reuse of the Quick Panel composition without
per-frame React state. A controlled app-owned HEX field handles exact input and
validation because the dependency's `InputWidget` does not expose invalid raw
text.

**Tech Stack:** Expo 56, React Native 0.85, TypeScript, Zustand/MMKV,
React Native Reanimated, React Native Gesture Handler,
`reanimated-color-picker@5.1.2`, AniUI, Jest, React Native Testing Library.

**Design contract:**
`docs/superpowers/specs/2026-07-27-buttons-label-color-picker-design.md`

## Global Constraints

- Work inline only. Do not use or suggest subagents.
- Never commit or push.
- Before production-code edits, re-read the exact Expo 56 documentation required
  by the repository instructions.
- Preserve unrelated working-tree changes.
- Treat color as a direct replacement for `buttonIdentifierTheme`. Do not map
  old light/dark values, introduce a migration version, or clear the settings
  key.
- Preserve image intensity, Show labels, horizontal/vertical positions,
  calibrations, language, help state, announcement acknowledgement, and every
  unrelated preference.
- Keep Controls-only behavior unchanged.
- Keep preview/export panel rectangles, source image, transform, label metrics,
  positions, and export ordering unchanged.
- Apply the same committed color to every Buttons glyph and visible label.
- Keep opacity as one `0...100` persisted value and apply it to the complete
  identifier overlay.
- Do not call React `setState` from the picker's continuous `onChangeJS`.
- Use Reanimated shared values only for the open dialog's draft preview. Main
  preview and exports receive static committed values.
- Keep each new or modified component under 150 lines by extracting picker,
  preview-stage, or animated-visual helpers.
- Avoid `useMemo`, `useCallback`, and `React.memo` outside AniUI.
- Use interfaces for props/state and avoid `any`.
- Use `expo-image` for images and existing AniUI primitives where suitable.

---

### Task 1: Pin the dependency and define the replacement color model

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Create:
  `src/features/quick-panel/customize/button-identifier-color.ts`
- Modify: `src/features/quick-panel/model/types.ts`
- Modify: `src/features/quick-panel/store/storage.ts`
- Create: `__tests__/button-identifier-color.test.ts`
- Modify: `__tests__/storage.test.ts`

**Interfaces:**

```ts
export interface ButtonIdentifierAppearance {
  color: string;
  opacity: number;
}

export const defaultButtonIdentifierColor = "#FFFFFF";

export function normalizeButtonIdentifierColor(
  value: unknown,
): string | null;

export function getButtonIdentifierCircleColor(
  color: string,
): "#666666" | "#FFFFFF";
```

- [ ] **Step 1: Revalidate the package immediately before installation**

Run:

```bash
npm view reanimated-color-picker@5.1.2 version license dependencies peerDependencies
```

Expected: version `5.1.2`, MIT license, no runtime dependency that duplicates
the app's native stack, and peer requirements compatible with the installed
Gesture Handler/Reanimated versions.

Then install the exact version:

```bash
npm install --save-exact reanimated-color-picker@5.1.2
```

Verify `package.json` contains the exact string `"5.1.2"` rather than a caret or
tilde range, and `package-lock.json` resolves the same release.

- [ ] **Step 2: Add failing color utility tests**

Create `__tests__/button-identifier-color.test.ts`:

```ts
import {
  defaultButtonIdentifierColor,
  getButtonIdentifierCircleColor,
  normalizeButtonIdentifierColor,
} from "@/features/quick-panel/customize/button-identifier-color";

describe("button identifier color", () => {
  it.each([
    ["ffffff", "#FFFFFF"],
    ["#1a2b3c", "#1A2B3C"],
    ["  ABCDEF  ", "#ABCDEF"],
  ])("normalizes %s", (input, expected) => {
    expect(normalizeButtonIdentifierColor(input)).toBe(expected);
  });

  it.each([undefined, null, "", "#FFF", "#12345678", "#GG0000", 42])(
    "rejects %p",
    (input) => {
      expect(normalizeButtonIdentifierColor(input)).toBeNull();
    },
  );

  it("defaults to white", () => {
    expect(defaultButtonIdentifierColor).toBe("#FFFFFF");
  });

  it("chooses the neutral circle with greater contrast", () => {
    expect(getButtonIdentifierCircleColor("#FFFFFF")).toBe("#666666");
    expect(getButtonIdentifierCircleColor("#000000")).toBe("#FFFFFF");
  });
});
```

Update the settings round-trip fixture in `__tests__/storage.test.ts` to use:

```ts
buttonIdentifierColor: "#1A2B3C",
buttonIdentifierOpacity: 61,
```

Add parser cases proving:

```ts
expect(loadButtonCustomizeSettings()).toMatchObject({
  buttonIdentifierColor: "#1A2B3C",
});
```

and missing/malformed colors both return `#FFFFFF` while unrelated valid
fields retain their saved values. Include a stored object containing only the
old `buttonIdentifierTheme: "dark"` and assert the normalized color is still
white; this is a replacement test, not a migration test.

- [ ] **Step 3: Run the tests and verify the contract fails**

Run:

```bash
npm test -- --runInBand --no-cache __tests__/button-identifier-color.test.ts __tests__/storage.test.ts
```

Expected: FAIL because the utility and replacement settings field do not yet
exist.

- [ ] **Step 4: Implement strict normalization and neutral contrast**

Create the utility with strict six-digit validation:

```ts
export interface ButtonIdentifierAppearance {
  color: string;
  opacity: number;
}

export const defaultButtonIdentifierColor = "#FFFFFF";

export function normalizeButtonIdentifierColor(
  value: unknown,
): string | null {
  if (typeof value !== "string") return null;
  const compact = value.trim().replace(/^#/, "");
  return /^[0-9a-fA-F]{6}$/.test(compact)
    ? `#${compact.toUpperCase()}`
    : null;
}
```

Implement WCAG relative luminance/contrast locally so static rendering, storage,
and tests do not depend on a UI package. Compare the established circle
candidates `#666666` and `#FFFFFF`, returning the one with the higher contrast
ratio against the normalized chosen color. Break an exact tie in favor of
`#666666` to preserve the default white appearance.

Remove `ButtonIdentifierTheme` from
`src/features/quick-panel/model/types.ts`.

- [ ] **Step 5: Replace the normalized storage field without migration**

Make `ButtonCustomizeSettings` contain:

```ts
buttonIdentifierColor: string;
buttonIdentifierOpacity: number;
```

Set the default:

```ts
buttonIdentifierColor: defaultButtonIdentifierColor,
buttonIdentifierOpacity: 70,
```

Parse only the new property:

```ts
buttonIdentifierColor:
  normalizeButtonIdentifierColor(parsed.buttonIdentifierColor)
  ?? defaultButtonIdentifierColor,
```

Delete every `buttonIdentifierTheme` default, type, and parser branch. Do not
read or translate the old field.

- [ ] **Step 6: Verify the model and dependency task**

Run:

```bash
npm test -- --runInBand --no-cache __tests__/button-identifier-color.test.ts __tests__/storage.test.ts
npx tsc --noEmit
```

Expected: the focused tests pass. TypeScript may still report theme references
in rendering code; record those as the expected remaining work for Task 2.

---

### Task 2: Send one static committed color through preview and export

**Files:**

- Modify:
  `src/features/quick-panel/customize/hooks/useButtonCustomizeControls.ts`
- Modify:
  `src/features/quick-panel/customize/components/ButtonIdentifierVisuals.tsx`
- Modify:
  `src/features/quick-panel/customize/components/button-identifier-content.ts`
- Modify:
  `src/features/quick-panel/customize/components/ButtonIdentifierOverlay.tsx`
- Modify:
  `src/features/quick-panel/customize/components/PanelSlice.tsx`
- Modify:
  `src/features/quick-panel/customize/components/QuickPanelPreview.tsx`
- Modify:
  `src/features/quick-panel/customize/components/CustomizePreviewSection.tsx`
- Modify:
  `src/features/quick-panel/customize/components/ExportSurface.tsx`
- Modify:
  `src/features/quick-panel/customize/components/ExportSurfaceHost.tsx`
- Modify: `src/features/quick-panel/customize/CustomizeScreen.tsx`
- Modify: `__tests__/button-customize-controls-hook.test.ts`
- Modify: `__tests__/button-identifier-overlay.test.tsx`
- Modify: `__tests__/customize-screen-export-surfaces.test.tsx`
- Modify: any fixture found by the final theme search

**Interfaces:**

```ts
interface SetButtonIdentifierAppearanceParams {
  color: string;
  opacity: number;
}

setButtonIdentifierAppearance: (
  appearance: SetButtonIdentifierAppearanceParams,
) => void;
```

- [ ] **Step 1: Update hook and rendering tests first**

In `__tests__/button-customize-controls-hook.test.ts`, replace theme assertions
with the loaded color and test one atomic appearance update:

```ts
act(() => {
  result.current.setButtonIdentifierAppearance({
    color: "#336699",
    opacity: 42,
  });
});

expect(saveButtonCustomizeSettings).toHaveBeenLastCalledWith(
  expect.objectContaining({
    buttonIdentifierColor: "#336699",
    buttonIdentifierOpacity: 42,
  }),
);
```

In `__tests__/button-identifier-overlay.test.tsx`, replace light/dark cases with
color cases. Assert:

- Lucide receives the selected color;
- visible label style resolves to the same selected color;
- white selects a `#666666` circle;
- black selects a `#FFFFFF` circle;
- overlay opacity behavior and horizontal readiness remain unchanged.

In `__tests__/customize-screen-export-surfaces.test.tsx`, replace captured theme
props and interaction assertions with:

```ts
expect(mockPreviewProps).toMatchObject({
  buttonIdentifierColor: "#336699",
  buttonIdentifierOpacity: 0.42,
});
expect(mockExportProps).toMatchObject({
  buttonIdentifierColor: "#336699",
  buttonIdentifierOpacity: 0.42,
});
```

- [ ] **Step 2: Run the focused tests and confirm failure**

Run:

```bash
npm test -- --runInBand --no-cache __tests__/button-customize-controls-hook.test.ts __tests__/button-identifier-overlay.test.tsx __tests__/customize-screen-export-surfaces.test.tsx
```

Expected: FAIL because the hook and rendering surfaces still expose theme.

- [ ] **Step 3: Add one atomic committed appearance setter**

Update `ButtonCustomizeControlState` to expose
`buttonIdentifierColor` and `setButtonIdentifierAppearance`.

Implement the setter with one `setSettings` callback and one persistence call:

```ts
setButtonIdentifierAppearance: ({ color, opacity }) => {
  setSettings((current) => {
    const next = {
      ...current,
      buttonIdentifierColor:
        normalizeButtonIdentifierColor(color)
        ?? defaultButtonIdentifierColor,
      buttonIdentifierOpacity: Math.min(100, Math.max(0, opacity)),
    };
    saveButtonCustomizeSettings(next);
    return next;
  });
},
```

Remove the public per-field theme setter. The opacity setter is no longer needed
by the compact controls; keep no second persistence route unless an existing
test proves another caller requires it.

- [ ] **Step 4: Make static visuals color-driven**

Change `ButtonIdentifierVisuals` to accept `color: string` and resolve:

```tsx
const circleColor = getButtonIdentifierCircleColor(color);

<View style={[styles.iconBackground, { backgroundColor: circleColor, ...size }]}>
  <Lucide color={color} ... />
</View>

<Text style={[styles.label, styles.shadow, { color, ...metrics }]}>
```

Delete fixed label color and `darkIconBackground` from
`button-identifier-content.ts`. Preserve the existing text shadow.

Replace `theme` with `color` through:

```text
ButtonIdentifierOverlay
  <- PanelSlice
  <- QuickPanelPreview / ExportSurface
  <- CustomizePreviewSection / ExportSurfaceHost
  <- CustomizeScreen
```

Keep opacity normalized to `0...1` at render boundaries, exactly as it is now.
Do not add a separate export conversion.

- [ ] **Step 5: Remove every production theme reference**

Run:

```bash
rg -n "ButtonIdentifierTheme|buttonIdentifierTheme|setButtonIdentifierTheme" src __tests__
```

Update remaining fixtures and mocks to the new color prop. Expected final
production result: no matches. Test names may use the word "theme" only when
asserting that legacy storage is ignored.

- [ ] **Step 6: Verify preview/export parity**

Run:

```bash
npm test -- --runInBand --no-cache __tests__/button-customize-controls-hook.test.ts __tests__/button-identifier-overlay.test.tsx __tests__/customize-screen-export-surfaces.test.tsx __tests__/panel-image-intensity.test.tsx __tests__/sequential-export.test.tsx __tests__/export-surfaces-position-readiness.test.tsx
npx tsc --noEmit
```

Expected: all focused suites and TypeScript pass, with existing horizontal
measurement readiness and sequential export behavior intact.

---

### Task 3: Replace the compact theme/Label controls with a swatch entry point

**Files:**

- Modify:
  `src/features/quick-panel/customize/components/ButtonCustomizeControls.tsx`
- Modify:
  `src/features/quick-panel/customize/components/ButtonAdjustmentTabs.tsx`
- Modify:
  `src/features/quick-panel/customize/components/CustomizePreviewSection.tsx`
- Modify: `__tests__/button-customize-controls.test.tsx`
- Modify: `__tests__/locales.test.ts`
- Modify: `i18next/locales/en.ts`
- Modify: `i18next/locales/zh.ts`

**Control contract:**

```ts
interface ButtonCustomizeControlsProps {
  buttonIdentifierColor: string;
  onOpenButtonIdentifierAppearance: () => void;
  // existing Image, horizontal, vertical, and Show labels props only
}
```

- [ ] **Step 1: Rewrite the compact-control tests first**

Remove tests that toggle the sun/moon theme or select a Labels tab. Add:

```ts
expect(screen.queryByText("Labels")).toBeNull();
expect(screen.queryByLabelText("Toggle label icon style")).toBeNull();
```

Render with `buttonIdentifierColor="#1A2B3C"` and assert:

- a button named like `Choose label color, current #1A2B3C` exists;
- its visual swatch resolves to `#1A2B3C`;
- pressing it calls `onOpenButtonIdentifierAppearance` once;
- it has at least a 44-point target;
- it is disabled/dimmed while `showButtonIdentifiers={false}`;
- Image/Horiz./Vert. visibility and the existing Image reset behavior remain
  unchanged.

Update locale tests to assert the new labels and remove the old theme-toggle
expectation.

- [ ] **Step 2: Run the tests and confirm failure**

Run:

```bash
npm test -- --runInBand --no-cache __tests__/button-customize-controls.test.tsx __tests__/locales.test.ts
```

Expected: FAIL because the theme button and Labels descriptor still exist.

- [ ] **Step 3: Implement the swatch trigger**

In `ButtonCustomizeControls`:

- remove theme and identifier-opacity props/callbacks;
- preserve the Show labels switch;
- add a 44-point Pressable beside it;
- fill the swatch with `buttonIdentifierColor`;
- render the installed Lucide `palette` glyph with a contrasting neutral color;
- set `accessibilityRole="button"`;
- localize a label including the committed HEX value;
- set `disabled={!showButtonIdentifiers}`;
- dim the disabled state without clearing the saved color.

Validate the glyph name against the installed icon package before finalizing:

```bash
rg -n "\"palette\"|palette" node_modules/@react-native-vector-icons/lucide
```

If the package's generated name union differs, use its exact supported Palette
name rather than adding a custom icon.

- [ ] **Step 4: Remove the Labels tab**

Delete identifier-opacity props and descriptor construction from
`ButtonAdjustmentTabs`. Keep only:

- Image;
- Horiz. when horizontal Buttons exist and labels are shown;
- Vert. when vertical Buttons exist and labels are shown.

Retain the keyed reset behavior that returns presentation to Image when labels
are hidden.

- [ ] **Step 5: Add localized copy**

Add concise English and Traditional Chinese keys for:

- Label appearance;
- choose label color with current HEX;
- brightness;
- opacity;
- HEX color;
- invalid HEX error;
- picker/control accessibility hints;
- Cancel;
- Confirm.

Reuse existing common Cancel/Confirm strings if they already express the exact
actions. Remove unused theme-toggle and Label-intensity-tab keys only after
`rg` proves there are no callers.

- [ ] **Step 6: Verify the compact controls**

Run:

```bash
npm test -- --runInBand --no-cache __tests__/button-customize-controls.test.tsx __tests__/locales.test.ts
npx tsc --noEmit
```

Expected: focused tests and TypeScript pass.

---

### Task 4: Add a read-only composition path and animated draft visuals

**Files:**

- Create:
  `src/features/quick-panel/customize/components/button-identifier-animated-appearance.ts`
- Create:
  `src/features/quick-panel/customize/components/AnimatedButtonIdentifierVisuals.tsx`
- Create:
  `src/features/quick-panel/customize/components/AnimatedButtonIdentifierFrame.tsx`
- Create:
  `src/features/quick-panel/customize/components/QuickPanelPreviewStage.tsx`
- Modify:
  `src/features/quick-panel/customize/components/ButtonIdentifierOverlay.tsx`
- Modify:
  `src/features/quick-panel/customize/components/PanelSlice.tsx`
- Modify:
  `src/features/quick-panel/customize/components/QuickPanelPreview.tsx`
- Create: `__tests__/quick-panel-read-only-preview.test.tsx`
- Extend: `__tests__/button-identifier-overlay.test.tsx`

**Interfaces:**

```ts
import type { SharedValue } from "react-native-reanimated";

export interface AnimatedButtonIdentifierAppearance {
  circleColor: SharedValue<string>;
  color: SharedValue<string>;
  opacity: SharedValue<number>;
}
```

`QuickPanelPreview` gains:

```ts
animatedButtonIdentifierAppearance?: AnimatedButtonIdentifierAppearance;
interactive?: boolean;
```

- [ ] **Step 1: Add failing read-only and animated-path tests**

Add a focused test proving `interactive={false}` renders
`quick-panel-preview-stage` without wrapping it in a `GestureDetector`, while
the default main preview remains interactive.

Extend the overlay test with mocked shared values and assert the animated path:

- receives shared color, circle color, and opacity;
- leaves positioning/layout metrics unchanged;
- does not call position readiness differently;
- does not replace the static path used by export tests.

Use a small local Reanimated mock extension only if the existing Jest setup
does not expose `useAnimatedProps`/`useAnimatedStyle`.

- [ ] **Step 2: Run tests and confirm failure**

Run:

```bash
npm test -- --runInBand --no-cache __tests__/quick-panel-read-only-preview.test.tsx __tests__/button-identifier-overlay.test.tsx
```

Expected: FAIL because neither optional path exists.

- [ ] **Step 3: Extract the shared preview stage**

Move only the stage markup and `preset.visualOrder.map(...)` block from
`QuickPanelPreview` into `QuickPanelPreviewStage`. It must receive the same:

- preview frame origin;
- layout scale;
- image and URI;
- shared transform and scale;
- preset panels;
- image intensity;
- Show labels;
- identifier positions;
- committed static color/opacity;
- optional animated draft appearance.

The main preview continues to compute the same display frame, dimensions, and
gesture shared values. Render the extracted stage inside `GestureDetector` only
when `interactive !== false`; render the exact same stage directly for the
dialog.

Do not create a second crop transform or panel-mapping implementation.

- [ ] **Step 4: Add isolated animated identifier visuals**

Keep `ButtonIdentifierVisuals` static for main preview/export.

Create `AnimatedButtonIdentifierVisuals` using:

- `Animated.createAnimatedComponent(Lucide)` for the glyph color;
- `useAnimatedProps` for the glyph's `color`;
- `useAnimatedStyle` for label color and circle background;
- existing layout metrics and styles.

Create `AnimatedButtonIdentifierFrame` to animate the complete overlay opacity.
It receives the already-resolved base position/size style plus the shared
opacity.

`ButtonIdentifierOverlay` should always compute layout, movement, measurement,
and readiness once. It selects:

```text
static appearance
  -> View + ButtonIdentifierVisuals

dialog draft appearance
  -> AnimatedButtonIdentifierFrame
     + AnimatedButtonIdentifierVisuals
```

Do not put Reanimated hooks behind conditional branches in the same component.
The animated helper components own those hooks.

- [ ] **Step 5: Thread the optional draft without changing export**

Pass `animatedButtonIdentifierAppearance` only through:

```text
QuickPanelPreview
  -> QuickPanelPreviewStage
  -> PanelSlice
  -> ButtonIdentifierOverlay
```

Do not add that prop to `ExportSurface` or `ExportSurfaceHost`. Their public
surface stays static and committed.

- [ ] **Step 6: Verify both rendering paths**

Run:

```bash
npm test -- --runInBand --no-cache __tests__/quick-panel-read-only-preview.test.tsx __tests__/button-identifier-overlay.test.tsx __tests__/customize-screen-export-surfaces.test.tsx __tests__/export-surfaces-position-readiness.test.tsx
npx tsc --noEmit
```

Expected: read-only preview and animated visual tests pass; export tests still
observe plain committed color/opacity.

---

### Task 5: Build the transactional label-appearance dialog

**Files:**

- Create:
  `src/features/quick-panel/customize/components/ButtonLabelAppearanceDialog.tsx`
- Create:
  `src/features/quick-panel/customize/components/ButtonLabelColorPicker.tsx`
- Create:
  `src/features/quick-panel/customize/hooks/useButtonLabelAppearanceDraft.ts`
- Modify or reuse: the existing AniUI dialog/input/button primitives identified
  during implementation
- Create: `__tests__/button-label-appearance-dialog.test.tsx`
- Modify: `jest.setup.ts` only if the dependency needs a shared native mock

**Dialog contract:**

```ts
interface ButtonLabelAppearanceDialogProps {
  color: string;
  image: PickedImage;
  identifierPositions: ButtonIdentifierPositions;
  imageOpacity: number;
  onCancel: () => void;
  onConfirm: (appearance: ButtonIdentifierAppearance) => void;
  opacity: number;
  open: boolean;
  preset: QuickPanelPreset;
  previewUri: string;
  showButtonIdentifiers: boolean;
  transform: ImageTransform;
}
```

The draft hook returns:

```ts
interface ButtonLabelAppearanceDraft {
  animatedAppearance: AnimatedButtonIdentifierAppearance;
  confirmDisabled: boolean;
  error: string | null;
  handleHexChange: (text: string) => void;
  handlePickerChange: (colors: ColorFormatsObject) => void; // worklet
  handlePickerComplete: (colors: ColorFormatsObject) => void;
  hexText: string;
  pickerRef: RefObject<ColorPickerRef | null>;
  readConfirmedAppearance: () => ButtonIdentifierAppearance;
}
```

- [ ] **Step 1: Mock the package at its public boundary**

In the new dialog test, mock the default `ColorPicker` with an imperative
`setColor` ref and render simple test controls for `Panel3`,
`BrightnessSlider`, and `OpacitySlider`. Expose helpers that can trigger:

- continuous `onChange` with a representative `ColorFormatsObject`;
- release `onCompleteJS`;
- a valid controlled HEX edit;
- an invalid controlled HEX edit.

Do not mock private package modules. If Jest cannot parse the package before the
local mock is installed, add the smallest reusable public mock to
`jest.setup.ts`.

- [ ] **Step 2: Add failing transactional tests**

Cover:

1. opening starts from committed color/opacity;
2. continuous picker change updates shared preview values;
3. picker release synchronizes the visible HEX field and draft ref;
4. valid HEX normalizes, updates the picker through `setColor`, and updates the
   shared preview;
5. invalid/incomplete HEX keeps the last valid preview, shows an inline error,
   and disables Confirm;
6. Confirm emits normalized color and `0...100` opacity once;
7. Cancel emits no appearance;
8. Android Back calls Cancel;
9. backdrop press calls Cancel;
10. reopening after Cancel starts from the latest committed values;
11. the embedded QuickPanel preview is `interactive={false}`;
12. actions remain rendered outside the scrollable content.

- [ ] **Step 3: Run the test and confirm failure**

Run:

```bash
npm test -- --runInBand --no-cache __tests__/button-label-appearance-dialog.test.tsx
```

Expected: FAIL because the dialog and draft hook do not exist.

- [ ] **Step 4: Implement the draft hook without per-frame React state**

On every dialog mount/open, initialize:

```ts
const draftColor = useSharedValue(color);
const draftCircleColor = useSharedValue(
  getButtonIdentifierCircleColor(color),
);
const draftOpacity = useSharedValue(opacity / 100);
const latestValidDraft = useRef<ButtonIdentifierAppearance>({
  color,
  opacity,
});
const [hexText, setHexText] = useState(color);
const [error, setError] = useState<string | null>(null);
```

The continuous picker callback must be a worklet:

```ts
const handlePickerChange = (colors: ColorFormatsObject) => {
  "worklet";
  const nextColor = colorKit.runOnUI()
    .HEX(colors.rgba, false)
    .toUpperCase();
  const nextAlpha = colorKit.runOnUI()
    .RGB(colors.rgba)
    .object(false)
    .a;

  draftColor.value = nextColor;
  draftCircleColor.value = getButtonIdentifierCircleColorWorklet(nextColor);
  draftOpacity.value = nextAlpha;
};
```

Provide a worklet-safe contrast helper beside the pure static helper, sharing
the same constants/math. Do not call back to JS or React during drag.

Use `onCompleteJS` only on release to:

- derive a non-alpha HEX value with
  `colorKit.HEX(colors.rgba, false)`, then normalize it;
- read alpha from `colors.rgba`;
- update `latestValidDraft.current`;
- synchronize `hexText`;
- clear the input error.

This release-time React update is deliberate; the preview and picker thumbs
remain continuous, while the controlled text field avoids per-frame renders.

For valid HEX typing:

- normalize the value;
- keep the current opacity;
- update all three shared values;
- update `latestValidDraft.current`;
- call `pickerRef.current?.setColor(rgbaWithCurrentOpacity, 0)`;
- clear the error.

For invalid/incomplete typing:

- keep the raw text visible;
- do not change the last valid ref or shared preview;
- set the localized error;
- disable Confirm.

Do not encode alpha in the displayed or persisted HEX value.

- [ ] **Step 5: Implement the picker section**

`ButtonLabelColorPicker` wraps exactly:

```tsx
<ColorPicker
  ref={pickerRef}
  value={rgbaInitialValue}
  onChange={handlePickerChange}
  onCompleteJS={handlePickerComplete}
>
  <Panel3 />
  <BrightnessSlider />
  <OpacitySlider />
</ColorPicker>
```

Style the wheel and sliders with explicit responsive dimensions and outlined
thumbs. Add distinct localized accessibility labels/hints.

Below the library controls, render the app-owned AniUI/React Native text input:

- value `hexText`;
- `autoCapitalize="characters"`;
- no alpha input;
- visible error text;
- `#RRGGBB` placeholder;
- submit/end-edit normalization without discarding an invalid draft.

If the picker is placed in scrollable content, use
`ScrollView` from `react-native-gesture-handler`, matching the library guidance.

- [ ] **Step 6: Implement the modal shell and preview**

Use the existing feature-compatible dialog primitive if it supports:

- transparent/dimmed overlay;
- explicit backdrop press;
- Android `onRequestClose`;
- fixed action row;
- screen-reader modal semantics.

Otherwise use React Native `Modal` with a dedicated backdrop Pressable and
centered card. Do not put the card inside the backdrop Pressable in a way that
lets inner touches dismiss it.

Render the existing `QuickPanelPreview` with:

```tsx
interactive={false}
animatedButtonIdentifierAppearance={animatedAppearance}
```

Pass the current image, transform, preset, preview URI, panel image intensity,
identifier positions, and Show labels value. Keep Cancel and Confirm fixed
below the scroll container. Confirm is disabled while the HEX text is invalid.

- [ ] **Step 7: Verify the dialog**

Run:

```bash
npm test -- --runInBand --no-cache __tests__/button-label-appearance-dialog.test.tsx __tests__/quick-panel-read-only-preview.test.tsx
npx tsc --noEmit
```

Expected: dialog lifecycle, validation, real-time shared preview, and read-only
composition tests pass.

---

### Task 6: Integrate the dialog and prove draft/commit/export separation

**Files:**

- Modify:
  `src/features/quick-panel/customize/components/CustomizePreviewSection.tsx`
- Modify:
  `src/features/quick-panel/customize/components/ButtonCustomizeControls.tsx`
- Modify:
  `src/features/quick-panel/customize/CustomizeScreen.tsx`
- Modify: `__tests__/customize-screen-export-surfaces.test.tsx`
- Create or extend:
  `__tests__/customize-button-label-appearance.test.tsx`

- [ ] **Step 1: Add a failing integration test**

Render the Buttons Customize surface with committed:

```ts
buttonIdentifierColor: "#FFFFFF",
buttonIdentifierOpacity: 70,
```

Assert this sequence:

1. main preview and export host start with white/0.7;
2. swatch opens the dialog;
3. simulated draft changes update only the dialog's animated appearance;
4. main preview and export props remain white/0.7 while the dialog is open;
5. Cancel preserves white/0.7 and writes nothing;
6. reopen, change to `#336699` and `42`, then Confirm;
7. exactly one settings save contains both new values;
8. main preview and export host both receive `#336699`/0.42;
9. hiding labels disables opening but does not reset color/opacity.

- [ ] **Step 2: Run the integration test and confirm failure**

Run:

```bash
npm test -- --runInBand --no-cache __tests__/customize-button-label-appearance.test.tsx __tests__/customize-screen-export-surfaces.test.tsx
```

Expected: FAIL because the swatch and dialog are not connected.

- [ ] **Step 3: Own open/close state at the preview section**

`CustomizePreviewSection` already has the preset, image, transform, preview URI,
and Button control state needed by both previews. Add only:

```ts
const [isAppearanceDialogOpen, setAppearanceDialogOpen] = useState(false);
```

Wire:

- swatch press -> open;
- Cancel/backdrop/Android Back -> close without settings update;
- Confirm -> `buttonControls.setButtonIdentifierAppearance(appearance)`, then
  close;
- render the dialog conditionally while open so every close unmounts it and
  every reopen creates a fresh draft from the latest committed values;
- section unmount -> modal unmount naturally discards the draft.

Render one dialog instance only for Buttons presets. Do not move this state into
the global store.

- [ ] **Step 4: Keep export committed-only**

Confirm `CustomizeScreen` passes only:

```ts
buttonIdentifierColor={buttonControls.buttonIdentifierColor}
buttonIdentifierOpacity={buttonControls.buttonIdentifierOpacity / 100}
```

to `ExportSurfaceHost`.

There must be no dialog-open state, shared value, picker ref, or draft object in
`CustomizeScreen`, `ExportSurfaceHost`, or `ExportSurface`.

- [ ] **Step 5: Verify the complete behavior**

Run:

```bash
npm test -- --runInBand --no-cache __tests__/customize-button-label-appearance.test.tsx __tests__/customize-screen-export-surfaces.test.tsx __tests__/button-customize-controls.test.tsx __tests__/button-label-appearance-dialog.test.tsx
npx tsc --noEmit
```

Expected: all integration tests pass and no export sees an unconfirmed draft.

---

### Task 7: Update durable docs and complete automated verification

**Files:**

- Modify: `docs/v3_changelog.md`
- Modify: `docs/notes.md`
- Review:
  `docs/superpowers/specs/2026-07-27-buttons-label-color-picker-design.md`
- Review:
  `docs/superpowers/plans/2026-07-27-buttons-label-color-picker.md`

- [ ] **Step 1: Update final-state documentation**

In `docs/v3_changelog.md`, replace light/dark style wording and separate Label
intensity wording with:

- one shared glyph-and-label HEX color;
- color dialog wheel/brightness/opacity/HEX controls;
- real-time read-only preview;
- committed-only preview/export parity;
- replacement default `#FFFFFF`;
- main compact controls now Image/Horiz./Vert.

Append a dated `2026-07-27` entry to `docs/notes.md` documenting:

- dependency and exact pinned version;
- controlled HEX field reason;
- shared-value live-preview rule;
- transactional Cancel/Confirm behavior;
- no old-theme migration;
- automated and device verification outcomes.

Do not preserve obsolete theme IDs or compatibility mappings in the final docs.

- [ ] **Step 2: Run targeted search audits**

Run:

```bash
rg -n "ButtonIdentifierTheme|buttonIdentifierTheme|setButtonIdentifierTheme" src __tests__ docs/v3_changelog.md docs/notes.md
rg -n "buttonIdentifierColor|setButtonIdentifierAppearance" src __tests__
rg -n "InputWidget" src package.json
```

Expected:

- no production theme references;
- color and atomic setter appear across the intended path;
- `InputWidget` is not imported or used.

- [ ] **Step 3: Run the full automated gate**

Run:

```bash
npm test -- --runInBand
npm run lint
npx tsc --noEmit
npx expo export --platform android --output-dir /tmp/qpbc-button-label-color-export
git diff --check
```

Expected:

- all Jest suites pass;
- lint and TypeScript report no errors;
- Android JS bundling/export completes;
- the diff has no whitespace errors.

Inspect scope:

```bash
git status --short
git diff --stat
git diff -- package.json package-lock.json src/features/quick-panel i18next __tests__ docs/v3_changelog.md docs/notes.md
```

Do not stage, commit, or push.

---

### Task 8: Perform connected-device QA and refresh the accepted flow image

**Required project skill:**
`.codex/skills/capture-flow-screenshot/SKILL.md`

**Target asset:**
`flow/advanced/buttons-only/18.webp`

- [ ] **Step 1: Prepare a device build without resetting app data**

Use the repo's normal development build/run path. Do not uninstall the app,
clear storage, or reset unrelated preferences. Prefer the `.dev` package when
both development and production packages are installed.

Confirm the device:

```bash
adb devices -l
```

Record the exact serial and pass it explicitly to every later ADB/capture
command.

- [ ] **Step 2: Run the manual acceptance matrix**

Navigate on the device to Advanced -> Buttons only -> Customize and verify:

- the main compact box has Show labels, color swatch, and
  Image/Horiz./Vert. only;
- the swatch disables while labels are hidden without losing its color;
- the dialog dims the background and shows the current full composition;
- the dialog preview does not pan or pinch;
- wheel/brightness/opacity drags update glyph, label, circle, and opacity
  smoothly in real time;
- HEX without `#` normalizes to uppercase `#RRGGBB`;
- invalid/incomplete HEX preserves the last valid preview and disables Confirm;
- Cancel, backdrop, and Android Back discard changes;
- Confirm updates the main preview;
- reopening starts from the confirmed values;
- short-screen scrolling does not hide the fixed actions;
- exporting after Confirm matches the main preview;
- Controls-only Customize remains unchanged.

Also watch Logcat during repeated open/drag/close cycles for Fabric, Reanimated,
Gesture Handler, or state-update crashes.

- [ ] **Step 3: Capture and visually inspect a temporary PNG**

With the final Buttons Customize state matching the intended flow frame, capture
a temporary PNG using the selected serial. Open/inspect it before replacing the
repository asset. Confirm:

- correct screen and dialog state;
- no touch indicators, transient toasts, keyboard, or debug overlays;
- expected device dimensions/orientation;
- localized copy and controls are not clipped.

- [ ] **Step 4: Replace only the approved WebP through the project skill**

Run:

```bash
.codex/skills/capture-flow-screenshot/scripts/capture-flow-screenshot.sh flow/advanced/buttons-only/18.webp DEVICE_SERIAL
```

Replace `DEVICE_SERIAL` with the exact serial from Step 1.

Inspect the saved WebP visually, then verify:

```bash
webpinfo -summary flow/advanced/buttons-only/18.webp
git diff --stat -- flow/advanced/buttons-only/18.webp
git status --short flow/advanced/buttons-only
```

Expected: the WebP is valid and only
`flow/advanced/buttons-only/18.webp` changes in that flow directory.

- [ ] **Step 5: Report completion without Git mutation**

Provide:

- implemented behavior summary;
- dependency/version and controlled-HEX rationale;
- automated verification results;
- device QA result;
- screenshot path;
- any remaining manual caveat.

Do not stage, commit, or push. End with a suggested commit message in the
repository format:

```text
enhance: add Buttons label color picker
```
