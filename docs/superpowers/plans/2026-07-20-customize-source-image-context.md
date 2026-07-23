# Customize Source Image Context Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:executing-plans` to implement this plan inline, task-by-task.
> Do not dispatch subagents. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persisted eye toggle that reveals the dimmed source image
around the Customize panels, plus a localized helper sheet explaining
QuickStar's square-crop movement limit, without changing transforms or exports.

**Architecture:** Always render the authoritative image-placement frame and keep
one shared source image plus every per-panel image mounted. The eye changes only
immediate opacity and backing treatment, so stage geometry and native image
lifecycle stay stable. SVG renders panel backings, the inverse dim path, and
one inset amber placement-frame boundary. The fixed footer owns the eye toggle.
Store the default-on preference directly in MMKV and keep helper state local to
`CustomizeScreen`.

**Tech Stack:** Expo 56, React Native 0.85, TypeScript, expo-image,
react-native-svg 15.15.4, Reanimated 4, Gesture Handler, MMKV, i18next, Jest,
React Native Testing Library, Uniwind.

## Global Constraints

- Read and follow the approved design at
  `docs/superpowers/specs/2026-07-20-customize-source-image-context-design.md`.
- Use the exact Expo 56 references:
  <https://docs.expo.dev/versions/v56.0.0/>,
  <https://docs.expo.dev/versions/v56.0.0/sdk/image/>, and
  <https://docs.expo.dev/versions/v56.0.0/sdk/svg/>.
- Work inline only. Do not use or suggest subagents or a browser demo.
- Never commit or push. End with a suggested commit message for the user.
- Preserve every existing MMKV value; do not clear or migrate app data.
- Source context defaults to visible and persists under
  `quick-panel.show-source-image-context`.
- Toggling source context must never change `ImageTransform` or reach any export
  component or service.
- Keep Controls preview opacity at `0.5`; keep Buttons opacity slider-driven.
- Keep the preview proxy URI and `cachePolicy="memory-disk"` behavior.
- Add no package except Expo 56's recommended `react-native-svg@15.15.4`.
- Localize every new visible and accessibility string in English and
  Traditional Chinese.
- Avoid `useMemo`, `useCallback`, and `React.memo` outside AniUI.
- Keep new component files under 150 lines and use interfaces instead of `any`.

---

## File Structure

### New files

- `src/features/quick-panel/customize/source-image-context-geometry.ts` — pure
  frame, radius, SVG-path, and source-opacity decisions.
- `src/features/quick-panel/customize/components/SourceImageContext.tsx` — a
  stable shared image plus SVG backing, dim, and movement-boundary layers.
- `src/features/quick-panel/customize/components/SourceImageContextToggle.tsx`
  — localized 48-point AniUI eye control for the fixed footer.
- `src/features/quick-panel/customize/components/CustomizeImagePlacementHelpSheet.tsx`
  — localized explanatory bottom sheet.
- `src/features/quick-panel/customize/components/CustomizePreviewSection.tsx`
  — preview and optional Button controls, extracted so `CustomizeScreen` stays
  small.
- `__tests__/source-image-context-preference.test.tsx` — default and persisted
  MMKV behavior.
- `__tests__/source-image-context-geometry.test.ts` — frame, radius, path, and
  opacity geometry.
- `__tests__/source-image-context.test.tsx` — stable image rendering, SVG
  layers, visibility, and the movement boundary.
- `__tests__/customize-actions-source-context.test.tsx` — footer layout,
  interaction, accessibility, and busy-state coverage.
- `__tests__/quick-panel-preview-source-context.test.tsx` — stable preview-only
  visibility integration.

### Modified files

- `package.json`, `package-lock.json` — Expo-compatible SVG dependency.
- `jest.setup.ts` — reactive `useMMKVBoolean` mock.
- `src/features/quick-panel/store/storage.ts` — persisted eye preference and new
  Customize help ID.
- `src/features/quick-panel/customize/components/PanelSlice.tsx` — stable image
  nodes with eye-driven opacity and backing treatment.
- `src/features/quick-panel/customize/components/QuickPanelPreview.tsx` — one
  placement frame and stable source/panel layers, with no toggle callback.
- `src/features/quick-panel/customize/components/CustomizeActions.tsx` — footer
  image action and eye toggle in one row.
- `src/features/quick-panel/customize/hooks/useQuickPanelPreviewGestures.ts` —
  placement-frame focal mapping and clamps.
- `src/features/quick-panel/customize/CustomizeScreen.tsx` — persistence,
  helper sheet, extracted preview section, and header action.
- `i18next/locales/en.ts`, `i18next/locales/zh.ts` — helper and eye copy.
- `__tests__/storage.test.ts`, `__tests__/locales.test.ts`,
  `__tests__/panel-image-intensity.test.tsx`,
  `__tests__/quick-panel-preview-gestures.test.tsx`,
  `__tests__/customize-screen.test.tsx`, and
  `__tests__/customize-screen-export-surfaces.test.tsx` — focused regressions.
- `docs/notes.md` — durable behavior and verification record.

---

### Task 1: Install SVG and add the persisted preference contract

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `jest.setup.ts:21-89`
- Modify: `src/features/quick-panel/store/storage.ts:21-100`
- Create: `__tests__/source-image-context-preference.test.tsx`
- Modify: `__tests__/storage.test.ts:1-110`

**Interfaces:**
- Produces:
  `useShowSourceImageContext(): readonly [boolean, (value: boolean) => void]`
- Produces: `HelpEntryId` value `"customize-image-placement"`
- Persists: `quick-panel.show-source-image-context`

- [ ] **Step 1: Install the exact Expo 56-compatible SVG package**

Run:

```bash
npx expo install react-native-svg
npm ls react-native-svg
```

Expected: `package.json` and `package-lock.json` change, and `npm ls` reports
`react-native-svg@15.15.4` without invalid or unmet dependencies.

- [ ] **Step 2: Write the failing persisted-preference test**

Create `__tests__/source-image-context-preference.test.tsx`:

```tsx
import { act, renderHook } from "@testing-library/react-native";
import { useShowSourceImageContext } from "@/features/quick-panel/store/storage";

interface MmkvTestGlobal {
  __mmkvStore?: Map<string, boolean | string>;
}

describe("source image context preference", () => {
  it("defaults to visible and persists an explicit eye choice", () => {
    const first = renderHook(() => useShowSourceImageContext());
    expect(first.result.current[0]).toBe(true);

    act(() => first.result.current[1](false));
    expect(first.result.current[0]).toBe(false);
    first.unmount();

    const second = renderHook(() => useShowSourceImageContext());
    expect(second.result.current[0]).toBe(false);
  });

  it("falls back to visible for an invalid stored value", () => {
    const store = (globalThis as typeof globalThis & MmkvTestGlobal).__mmkvStore;
    store?.set("quick-panel.show-source-image-context", "invalid");

    const hook = renderHook(() => useShowSourceImageContext());
    expect(hook.result.current[0]).toBe(true);
  });
});
```

Extend `__tests__/storage.test.ts` inside the existing preservation test:

```ts
mmkvStore?.set("quick-panel.show-source-image-context", false);
expect(mmkvStore?.get("quick-panel.show-source-image-context")).toBe(false);
```

- [ ] **Step 3: Run the preference test and verify the intended failure**

Run:

```bash
npm test -- --runInBand __tests__/source-image-context-preference.test.tsx
```

Expected: FAIL because `useShowSourceImageContext` and the boolean hook mock do
not exist yet.

- [ ] **Step 4: Add a reactive boolean hook to the MMKV Jest mock**

In `jest.setup.ts`, add this beside `useMMKVString` and return it from the mock:

```ts
const useMMKVBoolean = (key: string) => {
  const value = React.useSyncExternalStore(
    React.useCallback((onStoreChange: () => void) => {
      const subscription = instance.addOnValueChangedListener((changedKey) => {
        if (changedKey === key) onStoreChange();
      });
      return () => subscription.remove();
    }, [key]),
    React.useCallback(() => getBoolean(key), [key]),
    React.useCallback(() => getBoolean(key), [key]),
  );

  return [
    value,
    (nextValue: boolean | undefined) => {
      if (nextValue === undefined) {
        instance.remove(key);
        return;
      }
      instance.set(key, nextValue);
    },
  ] as const;
};

return {
  createMMKV: () => instance,
  useMMKVBoolean,
  useMMKVString,
};
```

- [ ] **Step 5: Implement the storage hook and help ID**

Update the storage import and constants in `storage.ts`:

```ts
import { createMMKV, useMMKVBoolean, useMMKVString } from "react-native-mmkv";

const showSourceImageContextKey = "quick-panel.show-source-image-context";

export const helpEntryIds = [
  "select-mode",
  "calibration-outer",
  "advanced-calibration-panel-alignment",
  "advanced-calibration-panel-review",
  "customize-image-placement",
] as const;
```

Add the typed hook after the exported mode/target preference helpers:

```ts
export function useShowSourceImageContext() {
  const [savedValue, setSavedValue] = useMMKVBoolean(
    showSourceImageContextKey,
    storage,
  );

  return [savedValue ?? true, setSavedValue] as const;
}
```

Do not modify or migrate any existing storage key.

- [ ] **Step 6: Run the focused storage verification**

Run:

```bash
npm test -- --runInBand __tests__/source-image-context-preference.test.tsx __tests__/storage.test.ts __tests__/seen-help-reactivity.test.tsx
```

Expected: all focused suites PASS and existing preference data remains intact.

---

### Task 2: Define preview-frame and SVG geometry with pure tests

**Files:**
- Create: `src/features/quick-panel/customize/source-image-context-geometry.ts`
- Create: `__tests__/source-image-context-geometry.test.ts`

**Interfaces:**
- Produces:
  `getCustomizePreviewFrame(preset): PanelRect`
- Produces: `getPreviewPanelRadius(rect, layoutScale): number`
- Produces: `getSourceContextPanelRects(preset, layoutScale): PanelRect[]`
- Produces: `getSourceContextDimPath(frame, panelRects): string`
- Produces:
  `getSourceContextImageOpacity(preset, buttonPanelOpacity): number`

- [ ] **Step 1: Write failing geometry tests**

Create `__tests__/source-image-context-geometry.test.ts`:

```ts
import {
  getCustomizePreviewFrame,
  getPreviewPanelRadius,
  getSourceContextDimPath,
  getSourceContextImageOpacity,
  getSourceContextPanelRects,
} from "@/features/quick-panel/customize/source-image-context-geometry";
import { getImagePlacementBounds } from "@/features/quick-panel/model/panel-geometry";
import { s25PlusOneUi85Preset } from "@/features/quick-panel/model/preset";
import type { QuickPanelPreset } from "@/features/quick-panel/model/types";

const buttonPreset: QuickPanelPreset = {
  ...s25PlusOneUi85Preset,
  id: "button-test",
  mode: "advanced",
  panels: {
    "button-1": {
      id: "button-1",
      family: "button",
      fileName: "button.png",
      label: "Wi-Fi",
      rect: { x: 14, y: 164, width: 120, height: 60, radius: 20 },
    },
  },
  visualOrder: ["button-1"],
  goodLockOrder: ["button-1"],
};

describe("source image context geometry", () => {
  it("always uses the authoritative placement frame", () => {
    expect(getCustomizePreviewFrame(s25PlusOneUi85Preset)).toEqual(
      getImagePlacementBounds(s25PlusOneUi85Preset),
    );
  });

  it("matches the rendered 32-point panel radius after scaling", () => {
    expect(getPreviewPanelRadius({ x: 0, y: 0, width: 100, height: 40, radius: 0 }, 1)).toBe(20);
    expect(getPreviewPanelRadius({ x: 0, y: 0, width: 200, height: 100, radius: 0 }, 0.5)).toBe(25);
  });

  it("builds logical rounded panel shapes and one even-odd path", () => {
    const panels = getSourceContextPanelRects(s25PlusOneUi85Preset, 0.5);
    expect(panels).toHaveLength(4);
    expect(panels[1]).toMatchObject({ x: 14, y: 291, width: 272, height: 56, radius: 28 });

    const frame = getImagePlacementBounds(s25PlusOneUi85Preset);
    const path = getSourceContextDimPath(frame, panels);
    expect(path).toContain(`M ${frame.x} ${frame.y}`);
    expect(path).toContain("A 28 28 0 0 1");
    expect(path.match(/Z/g)).toHaveLength(5);
  });

  it("uses Controls or Button preview intensity", () => {
    expect(getSourceContextImageOpacity(s25PlusOneUi85Preset, 0.63)).toBe(0.5);
    expect(getSourceContextImageOpacity(buttonPreset, 0.63)).toBe(0.63);
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
npm test -- --runInBand __tests__/source-image-context-geometry.test.ts
```

Expected: FAIL because the geometry module does not exist.

- [ ] **Step 3: Implement the pure geometry module**

Create `source-image-context-geometry.ts`:

```ts
import { getImagePlacementBounds } from "../model/panel-geometry";
import type { PanelRect, QuickPanelPreset } from "../model/types";

const previewPanelRadius = 32;

export function getCustomizePreviewFrame(
  preset: QuickPanelPreset,
): PanelRect {
  return getImagePlacementBounds(preset);
}

export function getPreviewPanelRadius(rect: PanelRect, layoutScale: number) {
  return Math.min(
    previewPanelRadius,
    rect.width * layoutScale / 2,
    rect.height * layoutScale / 2,
  );
}

export function getSourceContextPanelRects(
  preset: QuickPanelPreset,
  layoutScale: number,
): PanelRect[] {
  return preset.visualOrder.map((id) => {
    const rect = preset.panels[id].rect;
    return {
      ...rect,
      radius: getPreviewPanelRadius(rect, layoutScale) / layoutScale,
    };
  });
}

export function getSourceContextDimPath(
  frame: PanelRect,
  panelRects: PanelRect[],
) {
  return [getRoundedRectPath({ ...frame, radius: 0 }), ...panelRects.map(getRoundedRectPath)].join(" ");
}

export function getSourceContextImageOpacity(
  preset: QuickPanelPreset,
  buttonPanelOpacity: number,
) {
  const firstPanel = preset.visualOrder
    .map((id) => preset.panels[id])
    .find(Boolean);
  return firstPanel?.family === "button" ? buttonPanelOpacity : 0.5;
}

function getRoundedRectPath(rect: PanelRect) {
  const right = rect.x + rect.width;
  const bottom = rect.y + rect.height;
  const radius = Math.max(
    0,
    Math.min(rect.radius, rect.width / 2, rect.height / 2),
  );
  if (radius === 0) {
    return `M ${rect.x} ${rect.y} H ${right} V ${bottom} H ${rect.x} Z`;
  }
  return [
    `M ${rect.x + radius} ${rect.y}`,
    `H ${right - radius}`,
    `A ${radius} ${radius} 0 0 1 ${right} ${rect.y + radius}`,
    `V ${bottom - radius}`,
    `A ${radius} ${radius} 0 0 1 ${right - radius} ${bottom}`,
    `H ${rect.x + radius}`,
    `A ${radius} ${radius} 0 0 1 ${rect.x} ${bottom - radius}`,
    `V ${rect.y + radius}`,
    `A ${radius} ${radius} 0 0 1 ${rect.x + radius} ${rect.y}`,
    "Z",
  ].join(" ");
}
```

- [ ] **Step 4: Run the geometry test**

Run:

```bash
npm test -- --runInBand __tests__/source-image-context-geometry.test.ts
```

Expected: PASS with four tests. If the exact path expectation differs, fix the
implementation rather than weakening the frame, radius, or closure assertions.

---

### Task 3: Keep source and panel images mounted and preserve intensity

**Files:**
- Create: `src/features/quick-panel/customize/components/SourceImageContext.tsx`
- Modify: `src/features/quick-panel/customize/components/PanelSlice.tsx:1-129`
- Create: `__tests__/source-image-context.test.tsx`
- Modify: `__tests__/panel-image-intensity.test.tsx:1-120`

**Interfaces:**
- Produces: `SourceImageContextProps` with preset, frame, image, proxy URI,
  layout scale, Button opacity, shared preview scale, shared transform, and
  immediate visibility.
- Extends: `PanelSliceProps.isImageLayerVisible?: boolean`, default `true`.

- [ ] **Step 1: Write the failing rendering tests**

Create `__tests__/source-image-context.test.tsx` with an `expo-image` mock and a
small `react-native-svg` host mock. Assert these exact behaviors:

```tsx
expect(screen.getAllByTestId("source-context-panel-backing")).toHaveLength(4);
expect(screen.getByTestId("source-context-dim-path").props.fillRule).toBe("evenodd");
expect(screen.getByTestId("source-context-dim-path").props.fill).toBe("rgba(0,0,0,0.5)");
expect(screen.getAllByTestId("expo-image")).toHaveLength(1);
expect(StyleSheet.flatten(screen.getByTestId("expo-image").props.style)).toMatchObject({ opacity: 0.5 });
```

Render a Buttons preset with `buttonPanelOpacity={0.63}` and assert the one
source image uses `0.63`. In `panel-image-intensity.test.tsx`, add:

```tsx
it("keeps the image mounted but visually hidden in source-context mode", () => {
  const screen = render(
    <PanelSlice
      buttonIdentifierOpacity={0.7}
      buttonPanelOpacity={0.63}
      image={image}
      identifierPositions={{ horizontal: 0.5, vertical: 0.5 }}
      layoutScale={1}
      mode="default"
      originX={0}
      originY={0}
      panel={createPanel("control")}
      previewScale={previewScale}
      previewUri="file:///preview.png"
      isImageLayerVisible={false}
      showOverlay={false}
      showButtonIdentifiers
      transform={sharedTransform}
    />,
  );

  expect(StyleSheet.flatten(screen.getByTestId("expo-image").props.style))
    .toMatchObject({ opacity: 0 });
});
```

Also rerender `SourceImageContext` with `visible={false}` and assert its image,
backing, dim, and movement-boundary nodes remain mounted with zero opacity.

- [ ] **Step 2: Run the rendering tests and verify they fail**

Run:

```bash
npm test -- --runInBand __tests__/source-image-context.test.tsx __tests__/panel-image-intensity.test.tsx
```

Expected: FAIL because stable hidden layers and movement-boundary rendering do
not exist.

- [ ] **Step 3: Implement `SourceImageContext`**

Create the component with this structure:

```tsx
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import Animated, { type SharedValue, useAnimatedStyle } from "react-native-reanimated";
import Svg, { Path, Rect } from "react-native-svg";
import type { ImageTransform, PanelRect, PickedImage, QuickPanelPreset } from "../../model/types";
import { getPanelImageTransform } from "../panel-image-transform";
import {
  getSourceContextDimPath,
  getSourceContextImageOpacity,
  getSourceContextPanelRects,
} from "../source-image-context-geometry";

interface SourceImageContextProps {
  buttonPanelOpacity: number;
  frame: PanelRect;
  image: PickedImage;
  layoutScale: number;
  preset: QuickPanelPreset;
  previewScale: SharedValue<number>;
  previewUri: string;
  transform: SharedValue<ImageTransform>;
  visible: boolean;
}

export function SourceImageContext(props: SourceImageContextProps) {
  const panelRects = getSourceContextPanelRects(props.preset, props.layoutScale);
  const viewBox = `${props.frame.x} ${props.frame.y} ${props.frame.width} ${props.frame.height}`;
  const imageStyle = useAnimatedStyle(() => {
    const placement = getPanelImageTransform({
      panelX: props.frame.x,
      panelY: props.frame.y,
      previewScale: props.previewScale.get(),
      transform: props.transform.get(),
    });
    return {
      transform: [
        { translateX: placement.translateX },
        { translateY: placement.translateY },
        { scale: placement.scale },
      ],
    };
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg opacity={props.visible ? 1 : 0} style={StyleSheet.absoluteFill} viewBox={viewBox}>
        {panelRects.map((rect, index) => (
          <Rect
            fill="rgba(255,255,255,0.1)"
            height={rect.height}
            key={props.preset.visualOrder[index]}
            rx={rect.radius}
            testID="source-context-panel-backing"
            width={rect.width}
            x={rect.x}
            y={rect.y}
          />
        ))}
      </Svg>
      <Animated.View
        style={[
          {
            height: props.image.height,
            left: 0,
            position: "absolute",
            top: 0,
            transformOrigin: [0, 0, 0],
            width: props.image.width,
          },
          imageStyle,
        ]}
      >
        <Image
          cachePolicy="memory-disk"
          contentFit="fill"
          source={{ uri: props.previewUri }}
          style={{
            height: props.image.height,
            opacity: getSourceContextImageOpacity(props.preset, props.buttonPanelOpacity)
              * Number(props.visible),
            width: props.image.width,
          }}
        />
      </Animated.View>
      <Svg style={StyleSheet.absoluteFill} viewBox={viewBox}>
        <Path
          d={getSourceContextDimPath(props.frame, panelRects)}
          fill="rgba(0,0,0,0.5)"
          fillRule="evenodd"
          testID="source-context-dim-path"
        />
      </Svg>
      <Svg style={StyleSheet.absoluteFill} viewBox={viewBox}>
        <Rect
          fill="none"
          height={props.frame.height - 2 / props.layoutScale}
          stroke="#f5d6aa"
          strokeOpacity={props.visible ? 0.55 : 0}
          strokeWidth={2 / props.layoutScale}
          testID="source-context-movement-boundary"
          width={props.frame.width - 2 / props.layoutScale}
          x={props.frame.x + 1 / props.layoutScale}
          y={props.frame.y + 1 / props.layoutScale}
        />
      </Svg>
    </View>
  );
}
```

- [ ] **Step 4: Keep `PanelSlice` image nodes mounted**

Import `cn` and `getPreviewPanelRadius`, add
`isImageLayerVisible?: boolean`, default it to true, and change only opacity and
backing treatment:

```tsx
<View
  className={cn(
    "absolute overflow-hidden",
    isImageLayerVisible ? "bg-white/10" : "bg-transparent",
  )}
  style={{
    borderColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderRadius: getPreviewPanelRadius(panel.rect, layoutScale),
    height: panel.rect.height * layoutScale,
    left: (panel.rect.x - originX) * layoutScale,
    top: (panel.rect.y - originY) * layoutScale,
    width: panel.rect.width * layoutScale,
  }}
>
  <Animated.View style={[baseImageStyle, imageStyle]}>
    <Image
      cachePolicy="memory-disk"
      contentFit="fill"
      source={{ uri: previewUri }}
      style={{
        height: image.height,
        opacity: isImageLayerVisible
          ? panel.family === "button" ? buttonPanelOpacity : 0.5
          : 0,
        width: image.width,
      }}
    />
  </Animated.View>
  {/* Keep the existing identifier and PanelOverlay blocks unchanged. */}
</View>
```

Define `baseImageStyle` as a module-level `StyleSheet.create` entry so the
component stays under 150 lines. Do not conditionally call `useAnimatedStyle`.

- [ ] **Step 5: Run the rendering tests**

Run:

```bash
npm test -- --runInBand __tests__/source-image-context.test.tsx __tests__/panel-image-intensity.test.tsx __tests__/panel-image-transform.test.ts
```

Expected: PASS. Both shared and per-panel image nodes remain mounted; only the
appropriate layer is visible in each eye state.

---

### Task 4: Lock the preview frame and keep interaction out of the preview

**Files:**
- Create: `src/features/quick-panel/customize/components/SourceImageContextToggle.tsx`
- Modify: `src/features/quick-panel/customize/hooks/useQuickPanelPreviewGestures.ts:1-180`
- Modify: `src/features/quick-panel/customize/components/QuickPanelPreview.tsx:1-104`
- Modify: `__tests__/quick-panel-preview-gestures.test.tsx`
- Create: `__tests__/quick-panel-preview-source-context.test.tsx`

**Interfaces:**
- Extends `UseQuickPanelPreviewGesturesParams` with `previewFrame: PanelRect`.
- Extends `QuickPanelPreviewProps` with `showSourceImageContext: boolean` only.
- Produces `SourceImageContextToggleProps` with the same boolean/setter pair.

- [ ] **Step 1: Add failing gesture and eye tests**

Update every `useQuickPanelPreviewGestures` test call with:

```ts
previewFrame: preset.customizationArea,
```

Add a preview rerender regression that changes only the eye state:

```tsx
it("keeps frame, layout, and image mounts stable across eye toggles", () => {
  const screen = render(<QuickPanelPreview {...props} showSourceImageContext />);
  const sourceStage = screen.getByTestId("quick-panel-preview-stage");
  const sourceImages = screen.getAllByTestId("expo-image").length;

  screen.rerender(
    <QuickPanelPreview {...props} showSourceImageContext={false} />,
  );

  expect(screen.getByTestId("quick-panel-preview-stage").props.style).toEqual(
    sourceStage.props.style,
  );
  expect(screen.getAllByTestId("expo-image")).toHaveLength(sourceImages);
  expect(onTransformChange).not.toHaveBeenCalled();
});
```

Create `quick-panel-preview-source-context.test.tsx` and verify:

```tsx
expect(screen.getByTestId("source-image-context")).toBeTruthy();
expect(screen.queryByTestId("source-image-context-toggle")).toBeNull();
screen.rerender(
  <QuickPanelPreview {...props} showSourceImageContext={false} />,
);
expect(onTransformChange).not.toHaveBeenCalled();
```

Mock `SourceImageContext` to return a `View` with
`testID="source-image-context"`, and mock translations to return their keys.

- [ ] **Step 2: Run the tests and verify they fail**

Run:

```bash
npm test -- --runInBand __tests__/quick-panel-preview-gestures.test.tsx __tests__/quick-panel-preview-source-context.test.tsx
```

Expected: FAIL because the fixed-frame visibility interface does not exist.

- [ ] **Step 3: Implement the localized eye control**

Create `SourceImageContextToggle.tsx`:

```tsx
import { Button } from "@/components/ani-ui/button";
import { Lucide } from "@react-native-vector-icons/lucide";
import { useTranslation } from "react-i18next";

interface SourceImageContextToggleProps {
  disabled?: boolean;
  onChange: (value: boolean) => void;
  value: boolean;
}

export function SourceImageContextToggle({
  disabled,
  onChange,
  value,
}: SourceImageContextToggleProps) {
  const { t } = useTranslation();
  return (
    <Button
      accessibilityLabel={t(
        value
          ? "customize.hideSourceImageContext"
          : "customize.showSourceImageContext",
      )}
      accessibilityState={{ selected: value }}
      className="h-12 w-12 rounded-md border border-white/15 bg-black p-0"
      disabled={disabled}
      icon={<Lucide color="#ffffff" name={value ? "eye" : "eye-off"} size={20} />}
      onPress={() => onChange(!value)}
      testID="source-image-context-toggle"
    />
  );
}
```

- [ ] **Step 4: Keep the gesture hook tied to the placement frame**

Import `PanelRect`, add the static `previewFrame` to the params, and derive
layout scale from it. The eye state never reaches this hook:

```ts
interface PreviewLayout {
  frameKey: string;
  scale: number;
}

const frameKey = [
  previewFrame.x,
  previewFrame.y,
  previewFrame.width,
  previewFrame.height,
].join(":");
const [previewLayout, setPreviewLayout] = useState<PreviewLayout | null>(null);
const layoutScale = previewLayout?.frameKey === frameKey
  ? previewLayout.scale
  : null;

const handleLayout = (event: LayoutChangeEvent) => {
  const nextScale = event.nativeEvent.layout.width / previewFrame.width;
  if (nextScale > 0) setPreviewLayout({ frameKey, scale: nextScale });
};
```

Use `previewFrame.x` and `previewFrame.y` for pinch focal conversion:

```ts
pinchStartFocalX.set(previewFrame.x + event.focalX / scaleFactor);
pinchStartFocalY.set(previewFrame.y + event.focalY / scaleFactor);
// and in onUpdate:
const focalX = previewFrame.x + event.focalX / scaleFactor;
const focalY = previewFrame.y + event.focalY / scaleFactor;
```

Keep `imageBounds = getImagePlacementBounds(preset)` and all worklet clamp
arguments unchanged. Return `layoutScale`, `handleLayout`, `sharedScale`, and
`sharedTransform`; stop returning `panelUnion`.

- [ ] **Step 5: Wire the static frame and stable layers**

In `QuickPanelPreview`:

```tsx
const previewFrame = getCustomizePreviewFrame(preset);
const previewRatio = previewFrame.width / previewFrame.height;
```

Pass `previewFrame` to the gesture hook and keep all image components mounted.
`QuickPanelPreview` receives the persisted value only:

```tsx
<View style={{ width: previewWidth }}>
  <GestureDetector gesture={gesture}>
    <Animated.View
      onLayout={handleLayout}
      style={{ aspectRatio: previewRatio, opacity: 0.9, width: previewWidth }}
    >
      {layoutScale ? (
        <SourceImageContext
          buttonPanelOpacity={buttonPanelOpacity}
          frame={previewFrame}
          image={image}
          layoutScale={layoutScale}
          preset={preset}
          previewScale={sharedScale}
          previewUri={previewUri}
          transform={sharedTransform}
          visible={showSourceImageContext}
        />
      ) : null}
      {layoutScale
        ? preset.visualOrder.map((id) => (
            <PanelSlice
              buttonIdentifierOpacity={buttonIdentifierOpacity}
              buttonPanelOpacity={buttonPanelOpacity}
              identifierPositions={identifierPositions}
              image={image}
              key={id}
              layoutScale={layoutScale}
              mode={preset.mode}
              originX={previewFrame.x}
              originY={previewFrame.y}
              panel={preset.panels[id]}
              previewScale={sharedScale}
              previewUri={previewUri}
              showButtonIdentifiers={showButtonIdentifiers}
              isImageLayerVisible={!showSourceImageContext}
              showOverlay
              transform={sharedTransform}
            />
          ))
        : null}
    </Animated.View>
  </GestureDetector>
</View>
```

The toggle belongs to `CustomizeActions`, so the preview tree contains no
source-context control or callback.

- [ ] **Step 6: Run focused gesture and preview tests**

Run:

```bash
npm test -- --runInBand __tests__/quick-panel-preview-gestures.test.tsx __tests__/quick-panel-preview-source-context.test.tsx __tests__/panel-image-transform.test.ts
```

Expected: PASS, including the existing pointer-lift and pinch-rebase
regressions.

---

### Task 5: Add the localized helper sheet and screen integration

**Files:**
- Create: `src/features/quick-panel/customize/components/CustomizeImagePlacementHelpSheet.tsx`
- Create: `src/features/quick-panel/customize/components/CustomizePreviewSection.tsx`
- Modify: `src/features/quick-panel/customize/CustomizeScreen.tsx:1-158`
- Modify: `i18next/locales/en.ts:62-90`
- Modify: `i18next/locales/zh.ts:55-85`
- Modify: `__tests__/locales.test.ts:1-90`
- Modify: `__tests__/customize-screen.test.tsx`
- Modify: `__tests__/customize-screen-export-surfaces.test.tsx`

**Interfaces:**
- Consumes: `useShowSourceImageContext()` from Task 1.
- Consumes: extended `QuickPanelPreviewProps` from Task 4.
- Produces: `CustomizeImagePlacementHelpSheet({ onClose })`.
- Produces: `CustomizePreviewSection` accepting `ButtonCustomizeControlState`,
  preset/image/transform props, and the source-context boolean/setter.

- [ ] **Step 1: Add failing locale and screen tests**

Extend `__tests__/locales.test.ts`:

```ts
it("defines Customize image-placement help in English and Chinese", () => {
  const english = enLocale.translation.customize;
  const chinese = zhLocale.translation.customize;
  for (const locale of [english, chinese]) {
    expect(locale.imagePlacementHelpButton).toBeTruthy();
    expect(locale.imagePlacementHelpTitle).toBeTruthy();
    expect(locale.imagePlacementHelpBody).toBeTruthy();
    expect(locale.showSourceImageContext).toBeTruthy();
    expect(locale.hideSourceImageContext).toBeTruthy();
  }
});
```

Update the `SubPageHeader` mock in `customize-screen.test.tsx` to render a
button for `onActionPress`, mock the new help sheet as visible text, and add:

```tsx
it("opens localized image-placement help from the header", () => {
  render(<CustomizeScreen />);
  fireEvent.press(screen.getByLabelText("customize.imagePlacementHelpButton"));
  expect(screen.getByText("customize.imagePlacementHelpTitle")).toBeTruthy();
});
```

Capture the new `CustomizeActions` and `QuickPanelPreview` props in
`customize-screen-export-surfaces.test.tsx` and assert:

```ts
expect(mockActionProps).toMatchObject({ showSourceImageContext: true });
expect(mockActionProps).toHaveProperty(
  "onShowSourceImageContextChange",
  expect.any(Function),
);
expect(mockPreviewProps).toMatchObject({ showSourceImageContext: true });
expect(mockPreviewProps).not.toHaveProperty("onShowSourceImageContextChange");
expect(mockExportProps).not.toHaveProperty("showSourceImageContext");
expect(mockExportProps).not.toHaveProperty("onShowSourceImageContextChange");
```

- [ ] **Step 2: Run the tests and verify they fail**

Run:

```bash
npm test -- --runInBand __tests__/locales.test.ts __tests__/customize-screen.test.tsx __tests__/customize-screen-export-surfaces.test.tsx
```

Expected: FAIL because locale keys, helper sheet, and screen wiring are absent.

- [ ] **Step 3: Add exact English and Traditional Chinese copy**

Add to both `customize` locale objects.

English:

```ts
imagePlacementHelpButton: "Open image placement help",
imagePlacementHelpTitle: "Why image movement has limits",
imagePlacementHelpBody:
  "QuickStar applies a square image to every panel. Wide panels display only the center part of that square, so the hidden area must remain covered too. Zoom in to create more space for moving the image.",
showSourceImageContext: "Show full source image",
hideSourceImageContext: "Hide full source image",
```

Traditional Chinese:

```ts
imagePlacementHelpButton: "開啟圖片位置說明",
imagePlacementHelpTitle: "為什麼圖片移動有限制？",
imagePlacementHelpBody:
  "QuickStar 會為每個版面套用正方形圖片。較寬的版面只會顯示正方形中央的部分，因此隱藏區域也必須保持被圖片覆蓋。放大圖片即可騰出更多移動空間。",
showSourceImageContext: "顯示完整來源圖片",
hideSourceImageContext: "隱藏完整來源圖片",
```

- [ ] **Step 4: Implement the helper sheet**

Create `CustomizeImagePlacementHelpSheet.tsx` using the existing Mode sheet
pattern:

```tsx
import { Text } from "@/components/ani-ui/text";
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import { useWindowDimensions, View } from "react-native";
import { useBottomSheetInsets } from "../../shared/useBottomSheetInsets";

interface CustomizeImagePlacementHelpSheetProps {
  onClose: () => void;
}

export function CustomizeImagePlacementHelpSheet({
  onClose,
}: CustomizeImagePlacementHelpSheetProps) {
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const { bottomInset, contentPaddingBottom } = useBottomSheetInsets();
  return (
    <BottomSheet
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.6}
          pressBehavior="close"
        />
      )}
      backgroundStyle={{
        backgroundColor: "#18181b",
        borderColor: "#27272a",
        borderRadius: 32,
        borderWidth: 1,
      }}
      bottomInset={bottomInset}
      enableDynamicSizing
      enablePanDownToClose
      handleIndicatorStyle={{ backgroundColor: "#52525b", height: 6, width: 48 }}
      index={0}
      maxDynamicContentSize={height * 0.85}
      onClose={onClose}
    >
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingBottom: contentPaddingBottom,
          paddingHorizontal: 20,
          paddingTop: 8,
        }}
      >
        <View className="gap-2">
          <Text className="text-lg font-semibold text-white">
            {t("customize.imagePlacementHelpTitle")}
          </Text>
          <Text className="text-sm leading-6 text-zinc-300">
            {t("customize.imagePlacementHelpBody")}
          </Text>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
```

- [ ] **Step 5: Extract the preview section to keep screen components small**

Create `CustomizePreviewSection.tsx`. It receives the existing exported
`ButtonCustomizeControlState`, renders `QuickPanelPreview`, and conditionally
renders `ButtonCustomizeControls` exactly as `CustomizeScreen` does today. Pass
only the source-context value to the preview:

```ts
interface CustomizePreviewSectionProps {
  buttonControls: ButtonCustomizeControlState;
  image: PickedImage;
  onAdjustingChange: (value: boolean) => void;
  onTransformChange: (value: ImageTransform) => void;
  preset: QuickPanelPreset;
  previewUri: string;
  showSourceImageContext: boolean;
  transform: ImageTransform;
}
```

Move the existing `hasButtonPanels` check and Button controls JSX unchanged.
Do not move export state or export components into this file.

- [ ] **Step 6: Wire persistence and help into `CustomizeScreen`**

Add imports for `useState`, `markHelpSeen`,
`useShowSourceImageContext`, `CustomizePreviewSection`, and the helper sheet.
Add state and actions:

```ts
const [isHelpOpen, setIsHelpOpen] = useState(false);
const [showSourceImageContext, setShowSourceImageContext] =
  useShowSourceImageContext();
const openHelp = () => {
  markHelpSeen("customize-image-placement");
  setIsHelpOpen(true);
};
```

Configure the header:

```tsx
<SubPageHeader
  actionAccessibilityLabel={t("customize.imagePlacementHelpButton")}
  actionHelpId="customize-image-placement"
  actionVariant="helper-balanced"
  onActionPress={openHelp}
  subtitle={t("customize.subtitle")}
  title={t("customize.title")}
/>
```

Replace the existing image-present preview block with:

```tsx
<CustomizePreviewSection
  buttonControls={buttonControls}
  image={image}
  onAdjustingChange={setIsPreviewAdjusting}
  onTransformChange={setTransform}
  preset={activePreset}
  previewUri={previewImage.previewUri}
  showSourceImageContext={showSourceImageContext}
  transform={transform}
/>
```

Pass the persisted value and setter to the fixed footer instead:

```tsx
<CustomizeActions
  // existing action props stay unchanged
  onShowSourceImageContextChange={setShowSourceImageContext}
  showSourceImageContext={showSourceImageContext}
/>
```

Mount the sheet beside the existing export host, still inside `SafeAreaView`:

```tsx
{isHelpOpen ? (
  <CustomizeImagePlacementHelpSheet onClose={() => setIsHelpOpen(false)} />
) : null}
```

Confirm `CustomizeScreen.tsx` and every new `.tsx` component remain under 150
lines. Do not pass either source-context prop to `ExportSurfaceHost`.

- [ ] **Step 7: Run screen, locale, and export-isolation tests**

Run:

```bash
npm test -- --runInBand __tests__/locales.test.ts __tests__/customize-screen.test.tsx __tests__/customize-screen-export-surfaces.test.tsx __tests__/source-image-context-preference.test.tsx
```

Expected: PASS. The helper opens, default eye state reaches only the visible
preview, and export props remain unchanged.

---

### Task 6: Document and verify the complete feature

**Files:**
- Modify: `docs/notes.md`
- Verify all files from Tasks 1-5

**Interfaces:**
- Consumes the completed source-context preference, geometry, rendering,
  gestures, localization, helper, and export-isolation contracts.
- Produces a verified implementation ready for the user's Android QA.

- [ ] **Step 1: Add a durable notes entry**

Append a dated section to `docs/notes.md`:

```md
### 2026-07-20: Toggleable Customize source-image context

- Customize can reveal the transformed source image around panel shapes; only
  the outside area is dimmed, while panel opacity and overlays keep their
  previous behavior.
- The eye preference defaults on and persists under
  `quick-panel.show-source-image-context`; it never changes transform or export
  data.
- A localized header helper explains QuickStar's square-crop movement limit.
- The preview always reserves placement-frame geometry; the fixed-footer eye
  changes only stable layer visibility, with no resize or image remount.
- One preview-only amber outline shows the complete movement boundary and stays
  mounted with zero opacity in the clean state.
```

- [ ] **Step 2: Run every focused suite**

Run:

```bash
npm test -- --runInBand \
  __tests__/source-image-context-preference.test.tsx \
  __tests__/source-image-context-geometry.test.ts \
  __tests__/source-image-context.test.tsx \
  __tests__/quick-panel-preview-source-context.test.tsx \
  __tests__/quick-panel-preview-gestures.test.tsx \
  __tests__/panel-image-intensity.test.tsx \
  __tests__/panel-image-transform.test.ts \
  __tests__/customize-screen.test.tsx \
  __tests__/customize-screen-export-surfaces.test.tsx \
  __tests__/storage.test.ts \
  __tests__/locales.test.ts
```

Expected: all focused suites PASS.

- [ ] **Step 3: Run full static and automated verification**

Run each command separately:

```bash
npm test -- --runInBand
npx tsc --noEmit
npm run lint
git diff --check
npx expo export --platform android --output-dir /tmp/qpbc-source-context-export
```

Expected: full Jest, TypeScript, lint, diff check, and Android bundle export all
complete successfully. Report any pre-existing unrelated failure separately;
do not weaken new tests.

- [ ] **Step 4: Inspect the final diff for scope and data safety**

Run:

```bash
git status --short
git diff --stat
git diff -- src/features/quick-panel/store/storage.ts src/features/quick-panel/customize i18next __tests__ docs package.json package-lock.json
```

Confirm:

- no calibration or existing preference key was removed or renamed;
- the eye state is absent from every export component/service;
- shared and per-panel images stay mounted in both eye states;
- only source layers are visible with context on, and only per-panel image
  layers/backings are visible with context off;
- no component file exceeds 150 lines; and
- there are no unrelated changes.

- [ ] **Step 5: Perform Android manual QA**

On the S25+ baseline, test both languages and all three branches:

1. Open the helper before choosing an image; close by backdrop and swipe.
2. Select a portrait image; confirm source context starts visible on a fresh
   preference state.
3. Pan to all four edges at fit scale and confirm the real image boundary is
   visible around the panels.
4. Zoom and confirm additional movement room appears.
5. Toggle the eye at fit, pan, and zoom positions; confirm no jump, reset,
   gesture conflict, or proxy reload.
6. Leave/reopen Customize and restart the app; confirm eye persistence.
7. Confirm clean view matches the previous panel-only appearance.
8. Check Default, Advanced Controls, and Advanced Buttons, including Button
   intensity and identifiers.
9. Export each branch and confirm dimensions, filenames, order, composition,
   and applied QuickStar result remain unchanged.
10. Confirm all English and Traditional Chinese helper/accessibility copy.

- [ ] **Step 6: Hand off without committing or pushing**

Report the automated results and remaining device QA clearly. Provide this
suggested commit message for the user:

```text
feat: add toggleable source image context
```

Do not run `git add`, `git commit`, or `git push`.

---

### Task 7: Explain the amber movement boundary in the helper sheet

**Files:**
- Modify: `i18next/locales/en.ts`
- Modify: `i18next/locales/zh.ts`
- Modify: `src/features/quick-panel/customize/components/CustomizeImagePlacementHelpSheet.tsx`
- Modify: `__tests__/locales.test.ts`
- Create: `__tests__/customize-image-placement-help-sheet.test.tsx`
- Modify: `docs/notes.md`

**Interfaces:**
- Consumes: existing `customize.imagePlacementHelpBody` square-crop explanation.
- Produces: localized `customize.imagePlacementBoundaryHelp` string in English
  and Traditional Chinese.
- Preserves: helper-sheet layout behavior, preview geometry, source-context
  state, transforms, and export behavior.

- [ ] **Step 1: Add failing locale assertions**

Extend the first test in `__tests__/locales.test.ts` with the approved copy:

```ts
expect(english.imagePlacementBoundaryHelp).toBe(
  "The amber border marks the full area the image must cover. Zoom in if you need more room to move the image within it.",
);
expect(chinese.imagePlacementBoundaryHelp).toBe(
  "琥珀色邊框表示圖片必須覆蓋的完整範圍。如需在範圍內有更多移動空間，請放大圖片。",
);
```

- [ ] **Step 2: Add a failing helper-rendering test**

Create `__tests__/customize-image-placement-help-sheet.test.tsx`:

```tsx
import { CustomizeImagePlacementHelpSheet } from "@/features/quick-panel/customize/components/CustomizeImagePlacementHelpSheet";
import { render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("@gorhom/bottom-sheet", () => {
  const { View } = jest.requireActual("react-native");
  return {
    __esModule: true,
    default: ({ children }: { children?: ReactNode }) => <>{children}</>,
    BottomSheetBackdrop: () => null,
    BottomSheetScrollView: ({ children }: { children?: ReactNode }) => (
      <View>{children}</View>
    ),
  };
});

jest.mock("@/features/quick-panel/shared/useBottomSheetInsets", () => ({
  useBottomSheetInsets: () => ({ bottomInset: 0, contentPaddingBottom: 32 }),
}));

describe("CustomizeImagePlacementHelpSheet", () => {
  it("explains the amber boundary in a separate paragraph", () => {
    render(<CustomizeImagePlacementHelpSheet onClose={jest.fn()} />);

    expect(screen.getByText("customize.imagePlacementHelpBody")).toBeTruthy();
    expect(
      screen.getByText("customize.imagePlacementBoundaryHelp"),
    ).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run both tests and verify the red phase**

Run:

```bash
npm test -- --runInBand __tests__/locales.test.ts __tests__/customize-image-placement-help-sheet.test.tsx
```

Expected: FAIL because `imagePlacementBoundaryHelp` is absent from both locale
objects and the helper sheet does not render the new translation key.

- [ ] **Step 4: Add the approved localized copy**

Add this beside `imagePlacementHelpBody` in `i18next/locales/en.ts`:

```ts
imagePlacementBoundaryHelp:
  "The amber border marks the full area the image must cover. Zoom in if you need more room to move the image within it.",
```

Add the matching Traditional Chinese key in `i18next/locales/zh.ts`:

```ts
imagePlacementBoundaryHelp:
  "琥珀色邊框表示圖片必須覆蓋的完整範圍。如需在範圍內有更多移動空間，請放大圖片。",
```

- [ ] **Step 5: Render the copy as a separate paragraph**

In `CustomizeImagePlacementHelpSheet.tsx`, group the two body paragraphs with
their own spacing while keeping the existing typography:

```tsx
<View className="gap-2">
  <Text className="text-lg font-semibold text-white">
    {t("customize.imagePlacementHelpTitle")}
  </Text>
  <View className="gap-3">
    <Text className="text-sm leading-6 text-zinc-300">
      {t("customize.imagePlacementHelpBody")}
    </Text>
    <Text className="text-sm leading-6 text-zinc-300">
      {t("customize.imagePlacementBoundaryHelp")}
    </Text>
  </View>
</View>
```

- [ ] **Step 6: Run the focused tests and verify the green phase**

Run:

```bash
npm test -- --runInBand __tests__/locales.test.ts __tests__/customize-image-placement-help-sheet.test.tsx __tests__/customize-screen.test.tsx
```

Expected: all three suites PASS; the original explanation and the new boundary
explanation render as distinct text nodes.

- [ ] **Step 7: Update the durable note**

Add this bullet to the existing `2026-07-20: Toggleable Customize source-image
context` entry in `docs/notes.md`:

```md
- The helper explains the preview-only amber movement boundary in its own
  localized paragraph.
```

- [ ] **Step 8: Run complete automated verification**

Run each command separately:

```bash
npm test -- --runInBand --no-cache
npx tsc --noEmit
npm run lint
git diff --check
npx expo export --platform android --output-dir /tmp/qpbc-source-context-helper-copy
```

Expected: all Jest suites, TypeScript, Expo lint, diff checks, and the Android
Expo export complete successfully. Leave physical/helper-sheet QA to the user.

- [ ] **Step 9: Hand off without committing or pushing**

Do not run `git add`, `git commit`, or `git push`. Provide this suggested commit
message:

```text
explain: describe amber border in helper
```
