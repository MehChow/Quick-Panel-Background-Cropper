# Buttons Selection Area Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` only. This repo forbids sub-agent workflows; execute inline task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an eye control beside the Buttons-only search field that reveals the previously confirmed green outer area as either a hold-to-peek preview or a tap-pinned preview.

**Architecture:** Keep label selection in `ButtonPanelSelection` and move preview geometry, interaction state, and rendering into focused files. Render the overlay from the eye control itself, measured against the selection panel, so the local overlay can expand from the trigger without replacing the header helper pattern or creating a cropped asset.

**Tech Stack:** Expo 56, React 19.2.3, React Native 0.85.3, TypeScript 6, Uniwind, `expo-image` 56, `expo-haptics` 56, Lucide icons, React Native Reanimated 4.

## Global Constraints

- Read the exact Expo 56 documentation before code changes: `https://docs.expo.dev/versions/v56.0.0/`.
- Use the versioned `expo-image` API documented at `https://docs.expo.dev/versions/v56.0.0/sdk/image/`.
- Use the versioned `expo-haptics` API documented at `https://docs.expo.dev/versions/v56.0.0/sdk/haptics/`.
- Do not use or suggest sub-agents.
- Do not use or suggest a browser demo; verification is text-command and Android-device based.
- Do not add dependencies or persistence.
- Apply this only to Advanced Buttons-only `panelSelection`.
- Keep the header action position reserved for the existing helper pattern.
- Use interfaces for props and state and avoid `any`.
- Do not use `useMemo`, `useCallback`, or `React.memo` outside `src/components/ani-ui`.
- Keep each new source file under 150 lines and keep `ButtonPanelSelection.tsx` under 150 lines.
- Add lightweight Jest coverage for pure geometry and critical preview-controller state/failure branches; keep gesture feel, animation polish, TalkBack behavior, and real haptics as Android manual checks.
- Animate only opacity and transforms, and respect the existing reduced-motion hook.
- Keep the eye button at 48 x 48 points and the long-press threshold at 300 ms.
- Use a 200 ms entrance, a 140 ms exit, and a 120 ms reduced-motion fade.

## File Map

- `src/features/quick-panel/calibration/advanced/buttons-geometry.ts`: own creation of Button calibration items instead of leaving geometry logic in the picker component.
- `src/features/quick-panel/calibration/advanced/button-area-preview-layout.ts`: clamp the confirmed crop and calculate the preview card/image geometry.
- `src/features/quick-panel/calibration/advanced/hooks/useButtonAreaPreview.ts`: own momentary/pinned state, trigger measurement, haptic feedback, timers, focus restoration, and Reanimated shared values.
- `src/features/quick-panel/calibration/advanced/components/ButtonAreaPreview.tsx`: render the eye trigger, dimming layer, cropped image card, caption, and origin-aware animation.
- `src/features/quick-panel/calibration/advanced/components/ButtonPanelSelection.tsx`: arrange search and eye controls, provide the selection-panel measurement, and preserve label behavior.
- `src/features/quick-panel/calibration/advanced/AdvancedCalibrationScreen.tsx`: pass the existing imported screenshot into the Buttons picker.
- `i18next/locales/en.ts`: add English accessibility and momentary-preview copy.
- `i18next/locales/zh.ts`: add Chinese accessibility and momentary-preview copy.
- `__tests__/button-area-preview-geometry.test.ts`: protect Button item generation plus crop clamping and scaling.
- `__tests__/button-area-preview-controller.test.tsx`: protect momentary/pinned transitions, early-release cancellation, and haptic failure handling.

---

### Task 1: Isolate Button And Preview Geometry

**Files:**

- Modify: `src/features/quick-panel/calibration/advanced/buttons-geometry.ts`
- Create: `src/features/quick-panel/calibration/advanced/button-area-preview-layout.ts`
- Modify: `src/features/quick-panel/calibration/advanced/components/ButtonPanelSelection.tsx`
- Test: `__tests__/button-area-preview-geometry.test.ts`

**Interfaces:**

- Produces `createButtonCalibrationItems(labels: string[], outerRect: PanelRect): ButtonCalibrationItem[]`.
- Produces `PreviewPanelSize { width: number; height: number }`.
- Produces `ButtonAreaPreviewLayout { cardWidth, cardHeight, imageWidth, imageHeight, imageLeft, imageTop }`.
- Produces `getButtonAreaPreviewLayout(screenshot, outerRect, panelSize): ButtonAreaPreviewLayout | null`.

- [ ] **Step 1: Write the failing geometry tests**

Create `__tests__/button-area-preview-geometry.test.ts`:

```ts
import {
  getButtonAreaPreviewLayout,
} from "@/features/quick-panel/calibration/advanced/button-area-preview-layout";
import {
  createButtonCalibrationItems,
} from "@/features/quick-panel/calibration/advanced/buttons-geometry";

const outerRect = {
  x: 10,
  y: 20,
  width: 200,
  height: 300,
  radius: 0,
};

describe("button area preview geometry", () => {
  it("preserves ordered Button ids and the existing two-column layout", () => {
    expect(
      createButtonCalibrationItems(["Wi-Fi", "Bluetooth", "Flashlight"], outerRect),
    ).toEqual([
      {
        id: "button-1",
        label: "Wi-Fi",
        rect: { x: 18, y: 28, width: 88, height: 138, radius: 0 },
      },
      {
        id: "button-2",
        label: "Bluetooth",
        rect: { x: 114, y: 28, width: 88, height: 138, radius: 0 },
      },
      {
        id: "button-3",
        label: "Flashlight",
        rect: { x: 18, y: 174, width: 88, height: 138, radius: 0 },
      },
    ]);
  });

  it("clamps the crop and applies one scale to the card and screenshot", () => {
    expect(
      getButtonAreaPreviewLayout(
        { uri: "file:///panel.png", width: 100, height: 200 },
        { x: 10, y: 150, width: 80, height: 100, radius: 0 },
        { width: 200, height: 300 },
      ),
    ).toEqual({
      cardWidth: 168,
      cardHeight: 105,
      imageWidth: 210,
      imageHeight: 420,
      imageLeft: -21,
      imageTop: -315,
    });
  });

  it("returns null for a crop outside the screenshot or an unavailable panel", () => {
    const screenshot = { uri: "file:///panel.png", width: 100, height: 200 };

    expect(
      getButtonAreaPreviewLayout(
        screenshot,
        { x: 120, y: 20, width: 30, height: 30, radius: 0 },
        { width: 200, height: 300 },
      ),
    ).toBeNull();
    expect(
      getButtonAreaPreviewLayout(screenshot, outerRect, { width: 0, height: 300 }),
    ).toBeNull();
  });
});
```

- [ ] **Step 2: Run the geometry test to verify it fails**

Run:

```bash
npm test -- --runInBand __tests__/button-area-preview-geometry.test.ts
```

Expected: FAIL because `button-area-preview-layout.ts` and `createButtonCalibrationItems` do not exist yet.

- [ ] **Step 3: Move Button item creation into `buttons-geometry.ts`**

Add `ButtonPanelId` to the existing type import and append this implementation after `getButtonPanelRects`:

```ts
export function createButtonCalibrationItems(
  labels: string[],
  outerRect: PanelRect,
): ButtonCalibrationItem[] {
  return labels.map((label, index) => ({
    id: `button-${index + 1}` as ButtonPanelId,
    label,
    rect: getInitialButtonRect(index, labels.length, outerRect),
  }));
}

function getInitialButtonRect(
  index: number,
  count: number,
  outerRect: PanelRect,
): PanelRect {
  const columns = Math.min(2, count);
  const rows = Math.ceil(count / columns);
  const gap = 8;
  const column = index % columns;
  const row = Math.floor(index / columns);
  const width = (outerRect.width - gap * (columns + 1)) / columns;
  const height = (outerRect.height - gap * (rows + 1)) / rows;

  return {
    x: outerRect.x + gap + column * (width + gap),
    y: outerRect.y + gap + row * (height + gap),
    width,
    height,
    radius: 0,
  };
}
```

- [ ] **Step 4: Create pure preview crop geometry**

Create `button-area-preview-layout.ts` with the complete implementation:

```ts
import type { PanelRect, PickedImage } from "../../model/types";

export interface PreviewPanelSize {
  width: number;
  height: number;
}

export interface ButtonAreaPreviewLayout {
  cardWidth: number;
  cardHeight: number;
  imageWidth: number;
  imageHeight: number;
  imageLeft: number;
  imageTop: number;
}

export function getButtonAreaPreviewLayout(
  screenshot: PickedImage,
  outerRect: PanelRect,
  panelSize: PreviewPanelSize,
): ButtonAreaPreviewLayout | null {
  const left = clamp(outerRect.x, 0, screenshot.width);
  const top = clamp(outerRect.y, 0, screenshot.height);
  const right = clamp(outerRect.x + outerRect.width, 0, screenshot.width);
  const bottom = clamp(outerRect.y + outerRect.height, 0, screenshot.height);
  const cropWidth = right - left;
  const cropHeight = bottom - top;
  const maxCardWidth = Math.max(panelSize.width - 32, 0);
  const maxCardHeight = Math.max(panelSize.height * 0.6, 0);

  if (cropWidth <= 0 || cropHeight <= 0 || maxCardWidth <= 0 || maxCardHeight <= 0) {
    return null;
  }

  const scale = Math.min(maxCardWidth / cropWidth, maxCardHeight / cropHeight);

  if (!Number.isFinite(scale) || scale <= 0) {
    return null;
  }

  return {
    cardWidth: cropWidth * scale,
    cardHeight: cropHeight * scale,
    imageWidth: screenshot.width * scale,
    imageHeight: screenshot.height * scale,
    imageLeft: -left * scale,
    imageTop: -top * scale,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
```

This uses one scale for the screenshot and crop, matching the coordinate behavior already used by `AdvancedPanelCanvas`. Do not call `expo-image-manipulator` or create a second file.

- [ ] **Step 5: Replace picker-local Button geometry**

In `ButtonPanelSelection.tsx`:

1. Remove the `ButtonPanelId` type import.
2. Delete the local `createButtonItems` and `getInitialButtonRect` functions.
3. Import the new helper:

```ts
import { createButtonCalibrationItems } from "../buttons-geometry";
```

4. Change `setLabels` to:

```ts
const setLabels = (nextLabels: string[]) => {
  onButtonsChange(createButtonCalibrationItems(nextLabels, outerRect));
};
```

- [ ] **Step 6: Run focused tests and static verification**

Run:

```bash
npm test -- --runInBand __tests__/button-area-preview-geometry.test.ts
npx eslint src/features/quick-panel/calibration/advanced/buttons-geometry.ts src/features/quick-panel/calibration/advanced/button-area-preview-layout.ts src/features/quick-panel/calibration/advanced/components/ButtonPanelSelection.tsx
npx tsc --noEmit
git diff --check
```

Expected: the focused suite passes with three tests and all remaining commands exit `0`; label selection behavior and generated Button IDs/rectangles are unchanged.

- [ ] **Step 7: Commit the geometry boundary**

```bash
git add __tests__/button-area-preview-geometry.test.ts src/features/quick-panel/calibration/advanced/buttons-geometry.ts src/features/quick-panel/calibration/advanced/button-area-preview-layout.ts src/features/quick-panel/calibration/advanced/components/ButtonPanelSelection.tsx
git commit -m "refactor: isolate button preview geometry"
```

---

### Task 2: Add And Wire The Area Preview

**Files:**

- Create: `src/features/quick-panel/calibration/advanced/hooks/useButtonAreaPreview.ts`
- Create: `src/features/quick-panel/calibration/advanced/components/ButtonAreaPreview.tsx`
- Modify: `src/features/quick-panel/calibration/advanced/components/ButtonPanelSelection.tsx`
- Modify: `src/features/quick-panel/calibration/advanced/AdvancedCalibrationScreen.tsx`
- Modify: `i18next/locales/en.ts`
- Modify: `i18next/locales/zh.ts`
- Test: `__tests__/button-area-preview-controller.test.tsx`

**Interfaces:**

- `useButtonAreaPreview({ panelRef, panelSize })` produces `ButtonAreaPreviewController`.
- `ButtonAreaPreviewController.mode` is `"hidden" | "momentary" | "pinned"`.
- The controller exposes the trigger ref/position, animation shared values, reduced-motion state, `handlePressIn`, `handlePressOut`, `handleLongPress`, `handlePress`, and `dismissPinned`.
- `ButtonAreaPreview` consumes the current screenshot, confirmed `outerRect`, selection-panel ref, and panel size.
- `ButtonPanelSelection` gains `screenshot: PickedImage` while keeping its existing Button mutation callback.

- [ ] **Step 1: Write the failing preview-controller tests**

Create `__tests__/button-area-preview-controller.test.tsx`:

```tsx
import { act, render } from "@testing-library/react-native";
import * as Haptics from "expo-haptics";
import type { RefObject } from "react";
import { View, type View as NativeView } from "react-native";
import {
  useButtonAreaPreview,
  type ButtonAreaPreviewController,
} from "@/features/quick-panel/calibration/advanced/hooks/useButtonAreaPreview";

jest.mock("expo-haptics", () => ({
  selectionAsync: jest.fn(),
}));

jest.mock("@/features/quick-panel/shared/useReducedMotionEnabled", () => ({
  useReducedMotionEnabled: () => false,
}));

type MeasureSuccess = (x: number, y: number, width: number, height: number) => void;
type PreviewWindow = typeof globalThis & {
  __buttonAreaPreviewController?: ButtonAreaPreviewController;
};

const panelRef: RefObject<NativeView | null> = { current: null };
const selectionAsyncMock = Haptics.selectionAsync as jest.MockedFunction<
  typeof Haptics.selectionAsync
>;
let unmount: () => void = () => undefined;

function HookProbe() {
  const controller = useButtonAreaPreview({
    panelRef,
    panelSize: { width: 320, height: 500 },
  });
  (globalThis as PreviewWindow).__buttonAreaPreviewController = controller;

  return (
    <View
      ref={(node) => {
        panelRef.current = node;
      }}
    />
  );
}

function getController() {
  return (globalThis as PreviewWindow).__buttonAreaPreviewController!;
}

function attachTrigger(
  measureLayout: (panel: NativeView, onSuccess: MeasureSuccess) => void,
) {
  getController().triggerRef.current = { measureLayout } as unknown as NativeView;
}

describe("useButtonAreaPreview", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    selectionAsyncMock.mockReset();
    selectionAsyncMock.mockResolvedValue(undefined);
    unmount = render(<HookProbe />).unmount;
    attachTrigger((_panel, onSuccess) => onSuccess(12, 16, 48, 48));
  });

  afterEach(() => {
    unmount();
    panelRef.current = null;
    delete (globalThis as PreviewWindow).__buttonAreaPreviewController;
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("opens momentarily on long press and hides after release", () => {
    act(() => {
      getController().handlePressIn();
      getController().handleLongPress();
      jest.advanceTimersByTime(0);
    });

    expect(getController().mode).toBe("momentary");
    expect(selectionAsyncMock).toHaveBeenCalledTimes(1);

    act(() => {
      getController().handlePressOut();
      jest.advanceTimersByTime(140);
    });

    expect(getController().mode).toBe("hidden");
  });

  it("keeps a tap preview pinned when haptics reject, then dismisses it", async () => {
    selectionAsyncMock.mockRejectedValueOnce(new Error("haptics unavailable"));

    await act(async () => {
      getController().handlePress();
      jest.advanceTimersByTime(0);
      await Promise.resolve();
    });

    expect(getController().mode).toBe("pinned");

    act(() => {
      getController().triggerRef.current = null;
      getController().dismissPinned();
      jest.advanceTimersByTime(140);
    });

    expect(getController().mode).toBe("hidden");
  });

  it("does not open when the hold ends before measurement completes", () => {
    let completeMeasurement: MeasureSuccess | undefined;
    attachTrigger((_panel, onSuccess) => { completeMeasurement = onSuccess; });

    act(() => {
      getController().handlePressIn();
      getController().handleLongPress();
      getController().handlePressOut();
    });
    act(() => {
      completeMeasurement?.(12, 16, 48, 48);
    });

    expect(getController().mode).toBe("hidden");
    expect(selectionAsyncMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the controller test to verify it fails**

Run:

```bash
npm test -- --runInBand __tests__/button-area-preview-controller.test.tsx
```

Expected: FAIL because `useButtonAreaPreview.ts` does not exist yet.

- [ ] **Step 3: Add localized preview copy**

Add these keys under `advancedCalibration` in `i18next/locales/en.ts`:

```ts
previewOutlinedArea: "Preview outlined area",
previewOutlinedAreaHint:
  "Tap to keep the preview open, or touch and hold for a quick preview.",
releaseToClosePreview: "Release to close",
```

Add the matching keys under `advancedCalibration` in `i18next/locales/zh.ts`:

```ts
previewOutlinedArea: "預覽框選區域",
previewOutlinedAreaHint: "點一下可保持預覽開啟，或長按以快速查看。",
releaseToClosePreview: "放開即可關閉",
```

- [ ] **Step 4: Create the preview interaction controller**

Create `hooks/useButtonAreaPreview.ts` with the complete implementation below. `Pressable` cancels its normal `onPress` after `onLongPress`, so no synthetic long-press suppression flag is needed.

```ts
import { useEffect, useRef, useState, type RefObject } from "react";
import * as Haptics from "expo-haptics";
import {
  AccessibilityInfo,
  findNodeHandle,
  type View,
} from "react-native";
import {
  Easing,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { useReducedMotionEnabled } from "../../../shared/useReducedMotionEnabled";
import type { PreviewPanelSize } from "../button-area-preview-layout";

export type ButtonAreaPreviewMode = "hidden" | "momentary" | "pinned";

interface PreviewPoint {
  x: number;
  y: number;
}

interface UseButtonAreaPreviewOptions {
  panelRef: RefObject<View | null>;
  panelSize: PreviewPanelSize;
}

export interface ButtonAreaPreviewController {
  dismissPinned: () => void;
  handleLongPress: () => void;
  handlePress: () => void;
  handlePressIn: () => void;
  handlePressOut: () => void;
  isReducedMotionEnabled: boolean;
  mode: ButtonAreaPreviewMode;
  originX: SharedValue<number>;
  originY: SharedValue<number>;
  progress: SharedValue<number>;
  triggerPosition: PreviewPoint;
  triggerRef: RefObject<View | null>;
}

export function useButtonAreaPreview({
  panelRef,
  panelSize,
}: UseButtonAreaPreviewOptions): ButtonAreaPreviewController {
  const [mode, setMode] = useState<ButtonAreaPreviewMode>("hidden");
  const [triggerPosition, setTriggerPosition] = useState<PreviewPoint>({ x: 0, y: 0 });
  const modeRef = useRef<ButtonAreaPreviewMode>("hidden");
  const triggerRef = useRef<View | null>(null);
  const isHoldingRef = useRef(false);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progress = useSharedValue(0);
  const originX = useSharedValue(0);
  const originY = useSharedValue(0);
  const isReducedMotionEnabled = useReducedMotionEnabled();

  const setPreviewMode = (nextMode: ButtonAreaPreviewMode) => {
    modeRef.current = nextMode;
    setMode(nextMode);
  };

  const clearTimer = (timerRef: typeof openTimerRef) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const closePreview = (restoreFocus: boolean) => {
    clearTimer(openTimerRef);
    clearTimer(closeTimerRef);
    const duration = isReducedMotionEnabled ? 120 : 140;
    progress.value = withTiming(0, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
    closeTimerRef.current = setTimeout(() => {
      setPreviewMode("hidden");
      if (restoreFocus) {
        const reactTag = findNodeHandle(triggerRef.current);
        if (reactTag) AccessibilityInfo.setAccessibilityFocus(reactTag);
      }
    }, duration);
  };

  const openPreview = (nextMode: Exclude<ButtonAreaPreviewMode, "hidden">) => {
    const panel = panelRef.current;
    const trigger = triggerRef.current;
    if (!panel || !trigger || panelSize.width <= 0 || panelSize.height <= 0) return;

    trigger.measureLayout(panel, (x, y, width, height) => {
      if (nextMode === "momentary" && !isHoldingRef.current) return;
      clearTimer(openTimerRef);
      clearTimer(closeTimerRef);
      setTriggerPosition({ x, y });
      originX.value = x + width / 2 - panelSize.width / 2;
      originY.value = y + height / 2 - panelSize.height / 2;
      setPreviewMode(nextMode);
      void Haptics.selectionAsync().catch(() => undefined);
      openTimerRef.current = setTimeout(() => {
        progress.value = withTiming(1, {
          duration: isReducedMotionEnabled ? 120 : 200,
          easing: Easing.out(Easing.cubic),
        });
      }, 0);
    });
  };

  useEffect(() => () => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
  }, []);

  return {
    dismissPinned: () => {
      if (modeRef.current === "pinned") closePreview(true);
    },
    handleLongPress: () => {
      if (modeRef.current !== "pinned") openPreview("momentary");
    },
    handlePress: () => {
      if (modeRef.current === "pinned") closePreview(true);
      else openPreview("pinned");
    },
    handlePressIn: () => {
      isHoldingRef.current = true;
    },
    handlePressOut: () => {
      isHoldingRef.current = false;
      if (modeRef.current === "momentary") closePreview(false);
    },
    isReducedMotionEnabled,
    mode,
    originX,
    originY,
    progress,
    triggerPosition,
    triggerRef,
  };
}
```

- [ ] **Step 5: Render the eye control and origin-aware overlay**

Create `components/ButtonAreaPreview.tsx` with this implementation:

```tsx
import { Text } from "@/components/ani-ui/text";
import { cn } from "@/lib/utils";
import { Lucide } from "@react-native-vector-icons/lucide";
import { Image } from "expo-image";
import type { RefObject } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View, type View as NativeView } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import type { PanelRect, PickedImage } from "../../../model/types";
import {
  getButtonAreaPreviewLayout,
  type PreviewPanelSize,
} from "../button-area-preview-layout";
import { useButtonAreaPreview } from "../hooks/useButtonAreaPreview";

interface ButtonAreaPreviewProps {
  outerRect: PanelRect;
  panelRef: RefObject<NativeView | null>;
  panelSize: PreviewPanelSize;
  screenshot: PickedImage;
}

export function ButtonAreaPreview({
  outerRect,
  panelRef,
  panelSize,
  screenshot,
}: ButtonAreaPreviewProps) {
  const { t } = useTranslation();
  const controller = useButtonAreaPreview({ panelRef, panelSize });
  const layout = getButtonAreaPreviewLayout(screenshot, outerRect, panelSize);
  const isVisible = controller.mode !== "hidden" && Boolean(layout);
  const isPinned = controller.mode === "pinned";
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: controller.progress.value * 0.45,
  }));
  const cardStyle = useAnimatedStyle(() => {
    const progress = controller.progress.value;
    return {
      opacity: progress,
      transform: [
        {
          translateX: controller.isReducedMotionEnabled
            ? 0
            : controller.originX.value * (1 - progress),
        },
        {
          translateY: controller.isReducedMotionEnabled
            ? 0
            : controller.originY.value * (1 - progress),
        },
        {
          scale: controller.isReducedMotionEnabled
            ? 1
            : 0.65 + 0.35 * progress,
        },
      ],
    };
  });

  return (
    <View className="relative h-12 w-12" style={{ zIndex: isVisible ? 30 : 0 }}>
      <Pressable
        ref={controller.triggerRef}
        accessibilityHint={t("advancedCalibration.previewOutlinedAreaHint")}
        accessibilityLabel={t("advancedCalibration.previewOutlinedArea")}
        accessibilityRole="button"
        accessibilityState={{ expanded: isVisible }}
        className={cn(
          "absolute inset-0 z-30 items-center justify-center rounded-xl border bg-zinc-950",
          isVisible
            ? "border-emerald-300/40 bg-emerald-300/10"
            : "border-white/10",
        )}
        delayLongPress={300}
        onLongPress={controller.handleLongPress}
        onPress={controller.handlePress}
        onPressIn={controller.handlePressIn}
        onPressOut={controller.handlePressOut}
      >
        <Lucide color="#f4f4f5" name="eye" size={20} />
      </Pressable>

      {isVisible && layout ? (
        <View
          accessibilityViewIsModal={isPinned}
          className="absolute z-20 items-center justify-center"
          importantForAccessibility={isPinned ? "yes" : "no-hide-descendants"}
          pointerEvents={isPinned ? "box-none" : "none"}
          style={{
            height: panelSize.height,
            left: -controller.triggerPosition.x,
            top: -controller.triggerPosition.y,
            width: panelSize.width,
          }}
        >
          <Animated.View
            className="absolute inset-0 overflow-hidden rounded-2xl bg-black"
            style={backdropStyle}
          >
            <Pressable
              accessibilityLabel={`${t("common.close")} ${t("advancedCalibration.previewOutlinedArea")}`}
              accessibilityRole="button"
              className="flex-1"
              disabled={!isPinned}
              onPress={controller.dismissPinned}
            />
          </Animated.View>

          <Animated.View className="items-center gap-2" pointerEvents="none" style={cardStyle}>
            <View
              className="overflow-hidden rounded-xl border-2 border-emerald-300 bg-black"
              style={{ height: layout.cardHeight, width: layout.cardWidth }}
            >
              <Image
                accessible={false}
                contentFit="fill"
                source={{ uri: screenshot.uri }}
                style={{
                  height: layout.imageHeight,
                  left: layout.imageLeft,
                  position: "absolute",
                  top: layout.imageTop,
                  width: layout.imageWidth,
                }}
              />
            </View>
            {controller.mode === "momentary" ? (
              <Text className="rounded-full bg-black/70 px-3 py-1 text-xs text-zinc-200">
                {t("advancedCalibration.releaseToClosePreview")}
              </Text>
            ) : null}
          </Animated.View>
        </View>
      ) : null}
    </View>
  );
}
```

The overlay is positioned from the eye control back to the measured selection-panel origin. The eye remains above the overlay, so a pinned preview can close from either the eye or the backdrop.

- [ ] **Step 6: Wire the preview into `ButtonPanelSelection`**

Update imports:

```ts
import { useRef, useState } from "react";
import { Pressable, ScrollView, TextInput, View, type View as NativeView } from "react-native";
import type {
  ButtonCalibrationItem,
  PanelRect,
  PickedImage,
} from "../../../model/types";
import type { PreviewPanelSize } from "../button-area-preview-layout";
import { ButtonAreaPreview } from "./ButtonAreaPreview";
```

Extend the props interface and component parameters:

```ts
interface Props {
  buttons: ButtonCalibrationItem[];
  outerRect: PanelRect;
  screenshot: PickedImage;
  onButtonsChange: (buttons: ButtonCalibrationItem[]) => void;
}

export function ButtonPanelSelection({
  buttons,
  outerRect,
  screenshot,
  onButtonsChange,
}: Props) {
```

Add panel measurement immediately after the existing `query` state:

```ts
const panelRef = useRef<NativeView | null>(null);
const [panelSize, setPanelSize] = useState<PreviewPanelSize>({
  width: 0,
  height: 0,
});
```

Add the ref and layout handler to the root selection panel:

```tsx
<View
  ref={panelRef}
  className="min-h-0 flex-1 rounded-2xl border border-white/10 bg-zinc-900/80 p-4"
  onLayout={(event) => {
    setPanelSize({
      width: event.nativeEvent.layout.width,
      height: event.nativeEvent.layout.height,
    });
  }}
>
```

Replace the standalone search input with this row, preserving its existing props:

```tsx
<View className="flex-row gap-3">
  <TextInput
    className="min-h-12 flex-1 rounded-xl border border-white/10 bg-zinc-950 px-4 text-white"
    placeholder={t("advancedCalibration.buttonSearchPlaceholder")}
    placeholderTextColor="#71717a"
    value={query}
    onChangeText={setQuery}
  />
  <ButtonAreaPreview
    outerRect={outerRect}
    panelRef={panelRef}
    panelSize={panelSize}
    screenshot={screenshot}
  />
</View>
```

Leave the selected summary, chips, label rows, custom-label action, and ScrollView configuration unchanged. Confirm the file remains under 150 lines after formatting.

- [ ] **Step 7: Pass the imported screenshot from `AdvancedCalibrationScreen`**

In the Buttons-only branch, add the required prop without changing the Controls-only branch:

```tsx
<ButtonPanelSelection
  buttons={buttons}
  outerRect={outerRect}
  screenshot={screenshot}
  onButtonsChange={setAdvancedButtons}
/>
```

- [ ] **Step 8: Run automated and static verification**

Run:

```bash
npm test -- --runInBand __tests__/button-area-preview-controller.test.tsx
npm test -- --runInBand
npx eslint src/features/quick-panel/calibration/advanced/hooks/useButtonAreaPreview.ts src/features/quick-panel/calibration/advanced/components/ButtonAreaPreview.tsx src/features/quick-panel/calibration/advanced/components/ButtonPanelSelection.tsx src/features/quick-panel/calibration/advanced/AdvancedCalibrationScreen.tsx i18next/locales/en.ts i18next/locales/zh.ts
npx tsc --noEmit
npm run lint
git diff --check
```

Expected: the focused controller suite passes with three tests, the full Jest suite passes, every static command exits `0`, both locale objects satisfy the inferred English resource shape, and no new dependency or persistence diff appears.

- [ ] **Step 9: Perform Android manual verification**

Use an Android development build and complete this checklist:

1. Enter Advanced > Buttons only, import a screenshot, and confirm a green area containing several Buttons.
2. Confirm the eye is a 48-point square immediately to the right of search and that the header helper position remains unchanged.
3. Hold the eye for at least 300 ms. Confirm one haptic, a crop matching the prior green area, a green border, and a zoom from the eye toward panel center.
4. Release before and after the 200 ms entrance completes. Confirm both cases reverse immediately and fully remove the overlay.
5. Tap the eye. Confirm the preview remains pinned, then closes from both the eye and the dimmed backdrop.
6. Scroll the label list, return to the search row, and repeat the preview. Confirm the previous overlay state did not remain stuck.
7. Enable Android Remove animations/reduced motion. Confirm the preview uses only the 120 ms fade.
8. Enable TalkBack. Confirm the eye announces its label and hint, the pinned backdrop can dismiss the preview, and focus returns to the eye.
9. Repeat on a short screen and with unusually wide and tall outer rectangles. Confirm the crop stays inside 16-point side margins and the 60% panel-height cap.
10. Select and remove built-in/custom labels after previewing. Confirm Button selection behavior and Next-button enablement are unchanged.

- [ ] **Step 10: Commit the working preview**

```bash
git add __tests__/button-area-preview-controller.test.tsx i18next/locales/en.ts i18next/locales/zh.ts src/features/quick-panel/calibration/advanced/AdvancedCalibrationScreen.tsx src/features/quick-panel/calibration/advanced/components/ButtonAreaPreview.tsx src/features/quick-panel/calibration/advanced/components/ButtonPanelSelection.tsx src/features/quick-panel/calibration/advanced/hooks/useButtonAreaPreview.ts
git commit -m "feat: add button area preview"
```

## Completion Criteria

- The eye control is picker-local and never replaces the header helper action.
- Long press is momentary; tap is pinned and dismissible.
- The displayed crop matches the confirmed `outerRect` without creating a new asset.
- The card animates from and back toward the eye using transform and opacity only.
- Reduced motion, TalkBack dismissal/focus restoration, haptic failure, early release, missing layout, and out-of-bounds crop coordinates fail safely.
- Label selection, generated Button geometry, Controls-only calibration, footer behavior, persistence, and export remain unchanged.
- Focused geometry/controller tests and the full Jest suite pass.
- Lint, TypeScript, full repo lint, and `git diff --check` pass.
