# Controls Selection Area Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. This repository requires inline execution and forbids sub-agent workflows.

**Goal:** Extract the Advanced Buttons selection-area preview into a reusable calibration preview and add the same clean outer-area crop to the Advanced Controls panel-toggle step.

**Architecture:** Rename the Button-specific preview component, overlay, geometry, animation helper, and tests to calibration-area names without changing their behavior. Each selection component places the shared render-prop trigger locally; `AdvancedCalibrationScreen` supplies the same screenshot and confirmed outer rectangle to both branches.

**Tech Stack:** Expo 56, React Native 0.85, React 19.2, TypeScript, Uniwind, expo-image, expo-haptics, Reanimated, Jest, React Native Testing Library.

## Global Constraints

- Read and follow `https://docs.expo.dev/versions/v56.0.0/` before code changes; this was completed during design discovery.
- Keep the preview a clean crop of the confirmed green outer area with no panel-box overlay.
- Preserve the current haptic, animation, reduced-motion, dismissal, crop-clamping, and accessibility-focus behavior.
- Add no dependency, generated crop file, persistence, or calibration mutation.
- Keep Buttons behavior and appearance unchanged.
- Use interfaces for props/state and avoid `any`.
- Do not add `useMemo`, `useCallback`, or `React.memo` outside AniUI.
- Keep component files under 150 lines.
- Use `expo-image` for the screenshot crop.
- Execute inline only; do not use sub-agents or a browser demo.
- Preserve unrelated working-tree changes.

---

## File Structure

- `src/features/quick-panel/calibration/advanced/components/CalibrationAreaPreview.tsx`: shared eye trigger, transient modal state, haptic, origin measurement, and animation lifecycle.
- `src/features/quick-panel/calibration/advanced/components/CalibrationAreaPreviewOverlay.tsx`: shared dimmed modal and cropped screenshot rendering.
- `src/features/quick-panel/calibration/advanced/calibration-area-preview-geometry.ts`: shared crop clamping and aspect-ratio fitting.
- `src/features/quick-panel/calibration/advanced/calibration-area-preview-animation.ts`: shared animation-value reset.
- `src/features/quick-panel/calibration/advanced/components/ButtonPanelSelection.tsx`: Buttons placement of the shared preview trigger beside search.
- `src/features/quick-panel/calibration/advanced/components/AdvancedPanelSelection.tsx`: Controls placement of the shared preview trigger beside explanatory copy.
- `src/features/quick-panel/calibration/advanced/AdvancedCalibrationScreen.tsx`: supplies screenshot and outer rectangle to Controls selection.
- `__tests__/calibration-area-preview.test.tsx`: shared preview interaction contract.
- `__tests__/calibration-area-preview-geometry.test.ts`: shared geometry contract.
- `__tests__/calibration-area-preview-animation.test.ts`: shared animation reset contract.
- `__tests__/advanced-panel-selection.test.tsx`: Controls integration and toggle regression coverage.

### Task 1: Generalize The Preview Foundation

**Files:**
- Create: `__tests__/calibration-area-preview.test.tsx`
- Create: `__tests__/calibration-area-preview-geometry.test.ts`
- Create: `__tests__/calibration-area-preview-animation.test.ts`
- Create: `src/features/quick-panel/calibration/advanced/components/CalibrationAreaPreview.tsx`
- Create: `src/features/quick-panel/calibration/advanced/components/CalibrationAreaPreviewOverlay.tsx`
- Create: `src/features/quick-panel/calibration/advanced/calibration-area-preview-geometry.ts`
- Create: `src/features/quick-panel/calibration/advanced/calibration-area-preview-animation.ts`
- Modify: `src/features/quick-panel/calibration/advanced/components/ButtonPanelSelection.tsx`
- Delete: `__tests__/button-area-preview.test.tsx`
- Delete: `__tests__/button-area-preview-geometry.test.ts`
- Delete: `__tests__/button-area-preview-animation.test.ts`
- Delete: `src/features/quick-panel/calibration/advanced/components/ButtonAreaPreview.tsx`
- Delete: `src/features/quick-panel/calibration/advanced/components/ButtonAreaPreviewOverlay.tsx`
- Delete: `src/features/quick-panel/calibration/advanced/button-area-preview-geometry.ts`
- Delete: `src/features/quick-panel/calibration/advanced/button-area-preview-animation.ts`

**Interfaces:**
- Consumes: `PanelRect`, `PickedImage`, `ReactNode`, and the current Buttons preview behavior.
- Produces: `CalibrationAreaPreview({ children, outerRect, screenshot })`, `clampCalibrationAreaPreviewRect(rect, screenshot)`, `fitCalibrationAreaPreview(crop, maxWidth, maxHeight)`, and `resetCalibrationAreaPreviewAnimation(progress, originX, originY)`.

- [x] **Step 1: Add shared-name tests before production files exist**

Copy the current three preview tests to the new filenames, then change imports,
suite names, test IDs, and function names to the shared contract:

```tsx
import { CalibrationAreaPreview } from "@/features/quick-panel/calibration/advanced/components/CalibrationAreaPreview";

describe("CalibrationAreaPreview", () => {
  it("pins the preview on tap and dismisses it from the backdrop", async () => {
    const view = render(
      <CalibrationAreaPreview outerRect={outerRect} screenshot={screenshot}>
        {(previewTrigger) => <View>{previewTrigger}</View>}
      </CalibrationAreaPreview>,
    );

    fireEvent.press(view.getByLabelText("Preview outlined area"));
    expect(view.getByTestId("calibration-area-preview-overlay")).toBeTruthy();
    fireEvent.press(view.getByLabelText("Close outlined area preview"));

    await waitFor(() => {
      expect(view.queryByTestId("calibration-area-preview-overlay")).toBeNull();
    });
  });
});
```

```ts
import {
  clampCalibrationAreaPreviewRect,
  fitCalibrationAreaPreview,
} from "@/features/quick-panel/calibration/advanced/calibration-area-preview-geometry";

expect(
  fitCalibrationAreaPreview(
    { x: 0, y: 0, width: 200, height: 100, radius: 0 },
    268,
    120,
  ),
).toEqual({ height: 120, scale: 1.2, width: 240 });
```

```ts
import { resetCalibrationAreaPreviewAnimation } from "@/features/quick-panel/calibration/advanced/calibration-area-preview-animation";

resetCalibrationAreaPreviewAnimation(progress, originX, originY);
expect(progress.value).toBe(0);
expect(originX.value).toBe(0);
expect(originY.value).toBe(0);
```

- [x] **Step 2: Run the shared tests and verify RED**

Run:

```bash
npm test -- --runInBand __tests__/calibration-area-preview.test.tsx __tests__/calibration-area-preview-geometry.test.ts __tests__/calibration-area-preview-animation.test.ts
```

Expected: FAIL because the shared-name modules do not exist.

- [x] **Step 3: Add the shared production files with behavior-preserving renames**

Move the current implementation into the shared filenames and apply these exact
renames throughout:

```ts
ButtonAreaPreview -> CalibrationAreaPreview
ButtonAreaPreviewOverlay -> CalibrationAreaPreviewOverlay
ButtonAreaPreviewSize -> CalibrationAreaPreviewSize
clampButtonAreaPreviewRect -> clampCalibrationAreaPreviewRect
fitButtonAreaPreview -> fitCalibrationAreaPreview
resetButtonAreaPreviewAnimation -> resetCalibrationAreaPreviewAnimation
button-area-preview-overlay -> calibration-area-preview-overlay
```

Keep `CalibrationAreaPreview`'s public props unchanged apart from the component
name:

```ts
interface Props {
  children: (previewTrigger: ReactNode) => ReactNode;
  outerRect: PanelRect;
  screenshot: PickedImage;
}
```

Do not alter timing, easing, crop limits, haptic behavior, accessibility copy,
or modal behavior while renaming.

- [x] **Step 4: Switch Buttons selection to the shared component**

Make these three mechanical replacements in `ButtonPanelSelection.tsx`:

```text
import { ButtonAreaPreview } from "./ButtonAreaPreview";
-> import { CalibrationAreaPreview } from "./CalibrationAreaPreview";

<ButtonAreaPreview outerRect={outerRect} screenshot={screenshot}>
-> <CalibrationAreaPreview outerRect={outerRect} screenshot={screenshot}>

</ButtonAreaPreview>
-> </CalibrationAreaPreview>
```

Delete the old Button-specific source and test files after all imports point to
the shared names.

- [x] **Step 5: Run focused tests and static checks**

Run:

```bash
npm test -- --runInBand __tests__/calibration-area-preview.test.tsx __tests__/calibration-area-preview-geometry.test.ts __tests__/calibration-area-preview-animation.test.ts
npx eslint src/features/quick-panel/calibration/advanced/components/CalibrationAreaPreview.tsx src/features/quick-panel/calibration/advanced/components/CalibrationAreaPreviewOverlay.tsx src/features/quick-panel/calibration/advanced/components/ButtonPanelSelection.tsx src/features/quick-panel/calibration/advanced/calibration-area-preview-geometry.ts src/features/quick-panel/calibration/advanced/calibration-area-preview-animation.ts
```

Expected: three suites pass and ESLint exits with code 0.

### Task 2: Add The Preview To Controls Selection

**Files:**
- Create: `__tests__/advanced-panel-selection.test.tsx`
- Modify: `src/features/quick-panel/calibration/advanced/components/AdvancedPanelSelection.tsx`
- Modify: `src/features/quick-panel/calibration/advanced/AdvancedCalibrationScreen.tsx`

**Interfaces:**
- Consumes: `CalibrationAreaPreview`, `PanelRect`, `PickedImage`, `ControlPanelId[]`.
- Produces: `AdvancedPanelSelection({ enabledPanels, outerRect, screenshot, onEnabledPanelsChange })` with a top-right preview trigger and unchanged panel-toggle ordering.

- [x] **Step 1: Write the failing Controls integration tests**

Create `__tests__/advanced-panel-selection.test.tsx` with deterministic
translations and the current screenshot geometry:

```tsx
import { fireEvent, render } from "@testing-library/react-native";
import { AdvancedPanelSelection } from "@/features/quick-panel/calibration/advanced/components/AdvancedPanelSelection";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const screenshot = { uri: "file:///quick-panel.png", width: 1080, height: 2340 };
const outerRect = { x: 40, y: 300, width: 1000, height: 1400, radius: 0 };

it("opens the confirmed outer-area preview", () => {
  const view = render(
    <AdvancedPanelSelection
      enabledPanels={["buttonBox", "brightness", "volume", "mediaPlayer"]}
      outerRect={outerRect}
      screenshot={screenshot}
      onEnabledPanelsChange={jest.fn()}
    />,
  );

  fireEvent.press(view.getByLabelText("Preview outlined area"));
  expect(view.getByTestId("calibration-area-preview-overlay")).toBeTruthy();
});

it("keeps panel toggles independent from the preview", () => {
  const onEnabledPanelsChange = jest.fn();
  const view = render(
    <AdvancedPanelSelection
      enabledPanels={["buttonBox", "brightness", "volume", "mediaPlayer"]}
      outerRect={outerRect}
      screenshot={screenshot}
      onEnabledPanelsChange={onEnabledPanelsChange}
    />,
  );

  fireEvent.press(view.getByText("panels.brightness"));
  expect(onEnabledPanelsChange).toHaveBeenCalledWith([
    "buttonBox",
    "volume",
    "mediaPlayer",
  ]);
});
```

- [x] **Step 2: Run the Controls tests and verify RED**

Run:

```bash
npm test -- --runInBand __tests__/advanced-panel-selection.test.tsx
```

Expected: FAIL because `AdvancedPanelSelection` does not accept or render the
shared preview inputs.

- [x] **Step 3: Add the preview inputs and approved placement**

Update `AdvancedPanelSelection.tsx` to this complete implementation. The trigger
sits in a header row whose text column remains flexible:

```tsx
import { Text } from "@/components/ani-ui/text";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import type {
  ControlPanelId,
  PanelRect,
  PickedImage,
} from "../../../model/types";
import { advancedPanelPhases } from "../advanced-steps";
import { CalibrationAreaPreview } from "./CalibrationAreaPreview";

interface Props {
  enabledPanels: ControlPanelId[];
  outerRect: PanelRect;
  screenshot: PickedImage;
  onEnabledPanelsChange: (enabledPanels: ControlPanelId[]) => void;
}

export function AdvancedPanelSelection({
  enabledPanels,
  outerRect,
  screenshot,
  onEnabledPanelsChange,
}: Props) {
  const { t } = useTranslation();

  const togglePanel = (panelId: ControlPanelId) => {
    const isEnabled = enabledPanels.includes(panelId);
    const nextPanels = isEnabled
      ? enabledPanels.filter((id) => id !== panelId)
      : advancedPanelPhases.filter(
          (id) => id === panelId || enabledPanels.includes(id),
        );
    onEnabledPanelsChange(nextPanels);
  };

  return (
    <CalibrationAreaPreview outerRect={outerRect} screenshot={screenshot}>
      {(previewTrigger) => (
        <View className="gap-3 rounded-2xl border border-white/10 bg-zinc-900/80 p-4">
          <View className="flex-row items-start gap-3">
            <View className="flex-1 gap-1">
              <Text className="text-base font-semibold text-white">
                {t("advancedCalibration.panelSelectionTitle")}
              </Text>
              <Text className="text-sm leading-5 text-zinc-400">
                {t("advancedCalibration.panelSelectionBody")}
              </Text>
            </View>
            {previewTrigger}
          </View>
          <View className="gap-2">
            {advancedPanelPhases.map((panelId) => {
              const isEnabled = enabledPanels.includes(panelId);
              return (
                <Pressable
                  key={panelId}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: isEnabled }}
                  className={`flex-row items-center justify-between rounded-xl border px-3 py-3 ${
                    isEnabled
                      ? "border-emerald-300/40 bg-emerald-300/10"
                      : "border-white/10 bg-zinc-800/70"
                  }`}
                  onPress={() => togglePanel(panelId)}
                >
                  <Text className="font-semibold text-white">
                    {t(`panels.${panelId}`)}
                  </Text>
                  <Text
                    className={`text-xs font-semibold uppercase ${
                      isEnabled ? "text-emerald-200" : "text-zinc-500"
                    }`}
                  >
                    {isEnabled
                      ? t("advancedCalibration.panelEnabled")
                      : t("advancedCalibration.panelDisabled")}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </CalibrationAreaPreview>
  );
}
```

The shared wrapper must fill the available selection area consistently with the
Buttons branch, while the inner Controls card remains content-sized and centered.

- [x] **Step 4: Supply screenshot geometry from the screen**

Update the Controls branch in `AdvancedCalibrationScreen.tsx`:

```tsx
<AdvancedPanelSelection
  enabledPanels={controlEnabledPanels}
  outerRect={outerRect}
  screenshot={screenshot}
  onEnabledPanelsChange={setAdvancedEnabledPanels}
/>
```

- [x] **Step 5: Run focused Controls and shared preview tests**

Run:

```bash
npm test -- --runInBand __tests__/advanced-panel-selection.test.tsx __tests__/calibration-area-preview.test.tsx
npx eslint src/features/quick-panel/calibration/advanced/AdvancedCalibrationScreen.tsx src/features/quick-panel/calibration/advanced/components/AdvancedPanelSelection.tsx __tests__/advanced-panel-selection.test.tsx
```

Expected: both suites pass and ESLint exits with code 0.

### Task 3: Verify The Complete Change

**Files:**
- Verify all files listed in Tasks 1 and 2.
- Do not modify unrelated files unless a verification failure proves they are in scope.

**Interfaces:**
- Consumes: completed shared preview and Controls integration.
- Produces: repository-wide verification evidence and a concise Android manual-QA checklist.

- [x] **Step 1: Run the complete automated checks**

Run:

```bash
npm test -- --runInBand
npm run lint
npx tsc --noEmit
git diff --check
```

Expected: all Jest suites pass, lint and TypeScript exit with code 0, and
`git diff --check` produces no output.

- [x] **Step 2: Review scope and naming**

Run:

```bash
rg -n "ButtonAreaPreview|button-area-preview" src __tests__
git status --short
git diff --stat
```

Expected: no stale Button-specific preview symbols remain under `src` or
`__tests__`; status still shows the user's unrelated pre-existing changes; the
feature diff contains only shared-preview renames, Controls integration, tests,
and this plan.

- [x] **Step 3: Record manual Android checks for handoff**

Report these checks without claiming they were run unless a device was used:

1. Controls eye appears at the upper-right of the selection card.
2. Eye opens the same clean green-outlined crop as Buttons.
3. Backdrop and Android back close it; repeated opens animate from the eye.
4. TalkBack announces the trigger and focus returns after closing.
5. Controls toggles and Next-button enablement remain unchanged.
6. Buttons search-row preview remains visually and behaviorally unchanged.
