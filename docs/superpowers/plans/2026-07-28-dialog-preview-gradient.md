# Dialog Preview Gradient Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:executing-plans` inline. Project instructions prohibit subagents,
> commits, staging, and pushes.

**Goal:** Render the shared app gradient behind only the Label appearance dialog
preview so transparent artwork matches the main Customize preview.

**Architecture:** Add an optional boolean backdrop prop to `QuickPanelPreview`
and forward it to `QuickPanelPreviewStage`. The stage conditionally renders one
existing `AppGradientBackground` per visible panel, clipped to that panel's
scaled rectangle and radius. The existing `0.9` opacity moves from the stage
boundary to a full-size panel-content layer so it does not dim the gradient;
normal page preview content and exports remain unchanged.

> **Superseding correction (2026-07-28):** The original Task 1 snippets below
> placed one gradient across the rectangular stage. Do not follow those
> stage-wide snippets. The final behavior clips separate gradient backdrops to
> the visible panel frames so gaps and outer corners retain the dialog surface.

**Tech Stack:** Expo 56, React Native, Expo Linear Gradient, TypeScript, Jest,
React Native Testing Library

## Global Constraints

- Read the Expo 56 documentation at `https://docs.expo.dev/versions/v56.0.0/`
  before writing code.
- Reuse `AppGradientBackground`; do not duplicate its colors or direction.
- Enable the backdrop only for the Label appearance dialog.
- Clip the gradient to each visible panel; never fill the rectangular gaps
  around or between panels.
- Do not change preview geometry, image opacity, dialog surface styling, or
  exports.
- Do not update flow screenshots.
- Do not stage, commit, or push.

---

### Task 1: Add the optional preview-stage gradient

**Files:**

- Create: `__tests__/quick-panel-preview-stage-background.test.tsx`
- Modify:
  `src/features/quick-panel/customize/components/QuickPanelPreviewStage.tsx`
- Modify: `src/features/quick-panel/customize/components/QuickPanelPreview.tsx`

**Interfaces:**

- Consumes: `AppGradientBackground(): React.JSX.Element`
- Produces: optional `showAppGradientBackground?: boolean` on
  `QuickPanelPreviewProps` and `QuickPanelPreviewStageProps`

- [ ] **Step 1: Write the failing preview-stage test**

Create a focused test that mocks `AppGradientBackground`, renders
`QuickPanelPreviewStage` with `layoutScale={null}`, and proves the backdrop is
absent by default but present when requested:

```tsx
import { QuickPanelPreviewStage } from "@/features/quick-panel/customize/components/QuickPanelPreviewStage";
import { render } from "@testing-library/react-native";
import { View } from "react-native";
import type { SharedValue } from "react-native-reanimated";

jest.mock(
  "@/features/quick-panel/shared/AppGradientBackground",
  () => ({ AppGradientBackground: () => <View testID="app-gradient" /> }),
);

const sharedScale = {
  get: () => 1,
  set: jest.fn(),
  value: 1,
} as unknown as SharedValue<number>;
const sharedTransform = {
  get: () => ({ scale: 1, x: 0, y: 0 }),
  set: jest.fn(),
  value: { scale: 1, x: 0, y: 0 },
} as unknown as SharedValue<{ scale: number; x: number; y: number }>;

const baseProps = {
  buttonIdentifierBackgroundTheme: "dark" as const,
  buttonIdentifierColor: "#FFFFFF",
  buttonIdentifierOpacity: 0.7,
  buttonPanelOpacity: 0.78,
  handleLayout: jest.fn(),
  identifierPositions: { horizontal: 0.5, vertical: 0.5 },
  image: { height: 100, uri: "file:///image.png", width: 100 },
  layoutScale: null,
  preset: {
    customizationArea: { height: 100, radius: 0, width: 100, x: 0, y: 0 },
    goodLockOrder: [],
    height: 100,
    id: "test",
    label: "Test",
    mode: "advanced" as const,
    panels: {},
    visualOrder: [],
    width: 100,
  },
  previewFrame: { height: 100, radius: 0, width: 100, x: 0, y: 0 },
  previewRatio: 1,
  previewScale: sharedScale,
  previewUri: "file:///preview.png",
  previewWidth: 100,
  showButtonIdentifiers: true,
  transform: sharedTransform,
};

it("renders the app gradient only when requested", () => {
  const screen = render(<QuickPanelPreviewStage {...baseProps} />);
  expect(screen.queryByTestId("app-gradient")).toBeNull();

  screen.rerender(
    <QuickPanelPreviewStage
      {...baseProps}
      showAppGradientBackground
    />,
  );
  expect(screen.getByTestId("app-gradient")).toBeTruthy();
});
```

- [ ] **Step 2: Run the test and verify the red state**

Run:

```bash
npm test -- --runInBand --no-cache \
  __tests__/quick-panel-preview-stage-background.test.tsx
```

Expected: FAIL because `QuickPanelPreviewStage` does not render the mocked
gradient.

- [ ] **Step 3: Implement the optional stage backdrop**

Apply these exact additions in `QuickPanelPreviewStage.tsx`:

```diff
@@
+import { AppGradientBackground } from "../../shared/AppGradientBackground";
@@
 interface QuickPanelPreviewStageProps {
+  showAppGradientBackground?: boolean;
@@
     >
+      {props.showAppGradientBackground ? <AppGradientBackground /> : null}
+      <View style={styles.content} testID="quick-panel-preview-content">
+        {layoutScale ? props.preset.visualOrder.map((id) => (
```

Remove `opacity: 0.9` from the outer stage style, wrap the existing
`PanelSlice` map in that `View`, and add:

```tsx
const styles = StyleSheet.create({
  content: {
    bottom: 0,
    left: 0,
    opacity: 0.9,
    position: "absolute",
    right: 0,
    top: 0,
  },
});
```

Apply these exact additions in `QuickPanelPreview.tsx`:

```diff
@@
 interface QuickPanelPreviewProps {
+  showAppGradientBackground?: boolean;
@@
   preset,
+  showAppGradientBackground = false,
   showButtonIdentifiers,
@@
       previewWidth={previewWidth}
+      showAppGradientBackground={showAppGradientBackground}
       showButtonIdentifiers={showButtonIdentifiers}
```

- [ ] **Step 4: Run the focused test and verify green**

Run:

```bash
npm test -- --runInBand --no-cache \
  __tests__/quick-panel-preview-stage-background.test.tsx
```

Expected: PASS.

### Task 2: Enable the gradient only in the dialog and verify

**Files:**

- Modify:
  `src/features/quick-panel/customize/components/ButtonLabelAppearanceDialog.tsx`
- Modify: `__tests__/button-label-appearance-dialog.test.tsx`

**Interfaces:**

- Consumes: `QuickPanelPreviewProps.showAppGradientBackground?: boolean`
- Produces: the dialog opts into the shared gradient while all other preview
  call sites retain the false default

- [ ] **Step 1: Write the failing dialog integration assertion**

Extend the existing read-only preview assertion:

```tsx
expect(screen.getByTestId("dialog-preview").props).toMatchObject({
  buttonIdentifierBackgroundTheme: "light",
  buttonPanelOpacity: 0.42,
  identifierPositions: { horizontal: 0.23, vertical: 0.77 },
  showAppGradientBackground: true,
});
```

- [ ] **Step 2: Run the dialog test and verify the red state**

Run:

```bash
npm test -- --runInBand --no-cache \
  __tests__/button-label-appearance-dialog.test.tsx
```

Expected: FAIL because the dialog has not requested the gradient.

- [ ] **Step 3: Enable the backdrop on the dialog preview**

Apply this exact addition only to the `QuickPanelPreview` inside
`ButtonLabelAppearanceDialog.tsx`:

```diff
@@
               previewUri={props.previewUri}
+              showAppGradientBackground
               showButtonIdentifiers={props.showButtonIdentifiers}
```

- [ ] **Step 4: Run focused verification**

Run:

```bash
npm test -- --runInBand --no-cache \
  __tests__/quick-panel-preview-stage-background.test.tsx \
  __tests__/button-label-appearance-dialog.test.tsx \
  __tests__/customize-screen-export-surfaces.test.tsx
```

Expected: all focused suites PASS. The Customize screen test protects the
normal preview/export path from unintended prop or rendering changes.

- [ ] **Step 5: Run full verification**

Run:

```bash
npm test -- --runInBand
npm run lint
npx tsc --noEmit
git diff --check
git diff --name-only -- flow
```

Expected: Jest, lint, TypeScript, and diff checks pass. The final command
returns no flow screenshot paths.

- [ ] **Step 6: Report without staging or committing**

Leave the existing `feature/customize-icon-color` working tree intact and
provide:

```text
fix: match dialog preview gradient with Customize
```
