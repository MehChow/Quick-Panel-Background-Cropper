# Customize Performance Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:executing-plans` to implement this plan inline task-by-task. Do
> not dispatch subagents. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce Customize modal-opening, overall-preview, and slider hitching
without changing composition fidelity, transactional appearance behavior, or
export output.

**Architecture:** Keep one native appearance `Modal` and switch that modal
between the focused inspector and full-layout preview so only one dialog
composition is mounted. Suspend the underlying interactive panel composition
while the appearance modal owns the screen. Keep slider feedback live in React,
but suppress duplicate stepped values and persist the final value once when the
gesture finalizes.

**Tech Stack:** Expo 56.0.8, React Native 0.85.3, React 19.2.3 with React
Compiler, TypeScript 6.0.3, Uniwind/Tailwind v4, AniUI, Zustand, MMKV,
Reanimated 4.3.1, Worklets 0.8.3, React Native Gesture Handler, Expo Image,
Jest 29, and React Native Testing Library.

## Global Constraints

- Read the exact Expo 56 documentation at
  `https://docs.expo.dev/versions/v56.0.0/` before editing application code.
- Execute inline only; do not use or suggest subagents or worktrees.
- Do not stage, commit, push, create branches, or open pull requests.
- Preserve every existing user change in the dirty `feature/v4-combined`
  worktree.
- Leave physical Samsung, QuickStar, Good Lock, and final performance QA to the
  user.
- Do not use a browser demo; implementation discussion and handoff remain text
  only.
- Do not add dependencies or modify Expo/native configuration.
- Use interfaces for props and state; do not introduce `any`.
- Do not add `useMemo`, `useCallback`, or `React.memo` outside AniUI. The AniUI
  slider may retain its existing `useCallback` exception.
- Keep new and materially changed component files below 150 lines.
- Preserve the shared source-coordinate composition: one image, original
  logical dimensions, one `{ x, y, scale }` transform, current panel rectangles,
  identifier settings, and target-specific Button intensity.
- Preserve the 1080-long-edge preview proxy and `cachePolicy="memory-disk"`.
- Preserve sequential, all-or-nothing, original-quality `1024 x 1024` export.
- Preserve appearance transaction semantics: Confirm commits; Cancel,
  backdrop, and Android Back discard; the overall preview never commits.
- Preserve the focused inspector, picker scroll locking, keyboard-safe layout,
  static read-only preview boundary, and localized accessibility copy.
- This plan supersedes only the earlier requirement that the overall preview
  own a second native `Modal`. It remains a visually separate, read-only
  overlay, but now replaces the inspector inside the existing modal root.
- Do not implement a stage-wide masked-image renderer in this plan. Revisit
  that architecture only if user-run measurements still show base pan/pinch
  lag after these changes.
- Treat development-client `gfxinfo` and `meminfo` as directional diagnostics,
  not release-build performance claims.
- Design and investigation contracts:
  - `docs/2026-08-04-customize-page-redesign-handoff.md`
  - `docs/superpowers/specs/2026-08-04-button-appearance-focused-inspector-design.md`
  - `docs/superpowers/specs/2026-08-04-button-appearance-overall-preview-design.md`
  - `docs/optimization/buttons-calibration-customization-performance.md`

---

## File Map

**Create**

- `__tests__/customize-preview-section-lifecycle.test.tsx` — proves that the
  heavy interactive preview is absent only while appearance editing is open
  and returns with the same composition inputs.
- `src/components/ani-ui/__tests__/slider.test.tsx` — proves stepped-value
  deduplication and one final completion callback.

**Modify**

- `src/features/quick-panel/customize/components/ButtonLabelAppearanceDialog.tsx`
  — own the inspector/overall mode and route Android Back within one modal.
- `src/features/quick-panel/customize/components/ButtonLabelAppearanceDialogFrame.tsx`
  — expose one `onRequestClose` boundary and render either normal dialog
  content or one full-screen replacement.
- `src/features/quick-panel/customize/components/ButtonAppearanceOverallPreviewOverlay.tsx`
  — become content inside the existing modal instead of creating a nested
  native `Modal`.
- `src/features/quick-panel/customize/components/CustomizePreviewSection.tsx`
  — suspend `QuickPanelPreview` while the appearance dialog is mounted and
  forward slider completion callbacks.
- `src/components/ani-ui/slider.tsx` — deduplicate rounded values and expose
  `onSlidingComplete` from gesture finalization.
- `src/features/quick-panel/customize/components/ButtonAdjustmentSlider.tsx`
  — forward the adjustment completion callback to AniUI Slider.
- `src/features/quick-panel/customize/components/ButtonAdjustmentTabs.tsx`
  — pair each live adjustment callback with its persistence callback.
- `src/features/quick-panel/customize/components/ButtonCustomizeControls.tsx`
  — accept and forward three slider completion callbacks.
- `src/features/quick-panel/customize/hooks/useButtonCustomizeControls.ts`
  — separate transient slider state from completion-based persistence.
- `__tests__/button-label-appearance-dialog.test.tsx` — assert one modal, one
  active dialog preview, and two-level Android Back behavior.
- `__tests__/button-customize-controls.test.tsx` — assert completion callback
  wiring.
- `__tests__/button-customize-controls-hook.test.ts` — assert live values do
  not persist until completion and target-specific intensity remains isolated.
- `docs/notes.md` — record the durable modal and slider performance boundary.
- `docs/2026-08-04-customize-page-redesign-handoff.md` — replace the open
  investigation with implemented status and remaining user QA.

**Intentionally unchanged**

- `src/features/quick-panel/customize/components/QuickPanelPreview.tsx`
- `src/features/quick-panel/customize/components/QuickPanelPreviewStage.tsx`
- `src/features/quick-panel/customize/components/PanelSlice.tsx`
- `src/features/quick-panel/customize/components/FocusedButtonAppearancePreview.tsx`
- `src/features/quick-panel/customize/hooks/useQuickPanelPreviewGestures.ts`
- `src/features/quick-panel/customize/hooks/useButtonLabelAppearanceDraft.ts`
- `src/features/quick-panel/customize/hooks/useSequentialExport.ts`
- `src/features/quick-panel/customize/components/ExportSurfaceHost.tsx`
- calibration, preset, filename, storage-key, and export-composition modules

---

### Task 1: Use one native modal and one active dialog composition

**Files:**

- Modify: `__tests__/button-label-appearance-dialog.test.tsx`
- Modify: `src/features/quick-panel/customize/components/ButtonLabelAppearanceDialog.tsx`
- Modify: `src/features/quick-panel/customize/components/ButtonLabelAppearanceDialogFrame.tsx`
- Modify: `src/features/quick-panel/customize/components/ButtonAppearanceOverallPreviewOverlay.tsx`

**Interfaces:**

- `ButtonAppearanceOverallPreviewOverlay` remains a controlled, read-only
  component but no longer accepts `open` and no longer owns a native `Modal`.
- `ButtonLabelAppearanceDialogFrame` adds:

```ts
interface ButtonLabelAppearanceDialogFrameProps extends PropsWithChildren {
  confirmDisabled: boolean;
  fullScreenContent?: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  onOpenOverallPreview: () => void;
  onRequestClose: () => void;
  open: boolean;
  scrollEnabled: boolean;
}
```

- `onRequestClose` closes the overall preview first. Only a second Android Back
  from the focused inspector calls the dialog's existing `onCancel`.

- [ ] **Step 1: Read the required docs and preserve the dirty boundary**

Read the Expo 56 documentation, the four design/investigation documents in
Global Constraints, then run:

```bash
git status --short
git diff -- src/features/quick-panel/customize __tests__/button-label-appearance-dialog.test.tsx docs/notes.md
```

Expected: the combined-mode and appearance redesign remain intentionally dirty.
Do not clean, stage, or rewrite unrelated hunks.

- [ ] **Step 2: Write the failing one-modal lifecycle test**

Add `Modal` to the existing React Native test import, then replace the current
overall-preview test with a test that asserts one native root and mutually
exclusive content:

```tsx
it("uses one native modal and mounts one dialog preview at a time", () => {
  const screen = render(<ButtonLabelAppearanceDialog {...props} />);

  expect(screen.UNSAFE_getAllByType(Modal)).toHaveLength(1);
  expect(screen.getByTestId("focused-button-preview")).toBeTruthy();
  expect(screen.getByTestId("mock-color-picker")).toBeTruthy();
  expect(
    screen.queryByTestId("button-appearance-overall-preview-overlay"),
  ).toBeNull();

  fireEvent.press(
    screen.getByTestId("button-label-appearance-overall-preview"),
  );

  expect(screen.UNSAFE_getAllByType(Modal)).toHaveLength(1);
  expect(screen.queryByTestId("focused-button-preview")).toBeNull();
  expect(screen.queryByTestId("mock-color-picker")).toBeNull();
  expect(
    screen.getByTestId("button-appearance-overall-preview-overlay"),
  ).toBeTruthy();
  expect(screen.getByTestId("overall-preview-panel").props).toMatchObject({
    animatedButtonIdentifierAppearance: expect.any(Object),
    buttonIdentifierBackgroundTheme: "light",
    image: props.image,
    interactive: false,
    preset: props.preset,
    previewUri: props.previewUri,
    transform: props.transform,
  });

  fireEvent.press(
    screen.getByTestId("button-appearance-overall-preview-backdrop"),
  );

  expect(
    screen.queryByTestId("button-appearance-overall-preview-overlay"),
  ).toBeNull();
  expect(screen.getByTestId("focused-button-preview")).toBeTruthy();
  expect(screen.getByTestId("mock-color-picker")).toBeTruthy();
});
```

- [ ] **Step 3: Write the failing Android Back routing test**

Add this case to the same test file:

```tsx
it("closes the overall preview before Android Back cancels the dialog", () => {
  const screen = render(<ButtonLabelAppearanceDialog {...props} />);
  fireEvent.press(
    screen.getByTestId("button-label-appearance-overall-preview"),
  );

  act(() => screen.UNSAFE_getByType(Modal).props.onRequestClose());
  expect(
    screen.queryByTestId("button-appearance-overall-preview-overlay"),
  ).toBeNull();
  expect(screen.getByTestId("focused-button-preview")).toBeTruthy();
  expect(props.onCancel).not.toHaveBeenCalled();

  act(() => screen.UNSAFE_getByType(Modal).props.onRequestClose());
  expect(props.onCancel).toHaveBeenCalledTimes(1);
  expect(props.onConfirm).not.toHaveBeenCalled();
});
```

- [ ] **Step 4: Run the focused test and verify RED**

```bash
npm test -- --runInBand __tests__/button-label-appearance-dialog.test.tsx
```

Expected: FAIL because opening the overall preview currently creates a second
`Modal`, keeps the focused preview mounted, and routes Back inside the nested
modal.

- [ ] **Step 5: Convert the overall overlay to in-modal content**

In `ButtonAppearanceOverallPreviewOverlay.tsx`, remove `Modal` from the import,
remove the `open` prop and early return, and return the existing full-screen
view directly:

```tsx
interface ButtonAppearanceOverallPreviewOverlayProps {
  animatedAppearance?: AnimatedButtonIdentifierAppearance;
  backgroundTheme: ButtonIdentifierBackgroundTheme;
  buttonIdentifierColor: string;
  buttonIdentifierOpacity: number;
  buttonPanelOpacity: number;
  identifierPositions: ButtonIdentifierPositions;
  image: PickedImage;
  onDismiss: () => void;
  preset: QuickPanelPreset;
  previewUri: string;
  showButtonIdentifiers: boolean;
  transform: ImageTransform;
}

return (
  <View
    accessibilityViewIsModal
    className="flex-1 items-center justify-center p-6"
    testID="button-appearance-overall-preview-overlay"
  >
    <Pressable
      accessibilityLabel={t("customize.buttonAppearanceOverallPreviewClose")}
      accessibilityRole="button"
      className="absolute inset-0 bg-black/60"
      onPress={props.onDismiss}
      testID="button-appearance-overall-preview-backdrop"
    />
    <View
      className="w-full max-w-[430px] rounded-2xl border border-white/15 bg-slate-950 p-4"
      pointerEvents="box-none"
    >
      <QuickPanelPreview
        animatedButtonIdentifierAppearance={props.animatedAppearance}
        buttonIdentifierBackgroundTheme={props.backgroundTheme}
        buttonIdentifierColor={props.buttonIdentifierColor}
        buttonIdentifierOpacity={props.buttonIdentifierOpacity}
        buttonPanelOpacity={props.buttonPanelOpacity}
        identifierPositions={props.identifierPositions}
        image={props.image}
        interactive={false}
        maxHeight={Math.min(windowHeight * 0.7, 560)}
        onAdjustingChange={() => undefined}
        onTransformChange={() => undefined}
        preset={props.preset}
        previewUri={props.previewUri}
        showAppGradientBackground
        showButtonIdentifiers={props.showButtonIdentifiers}
        transform={props.transform}
      />
    </View>
  </View>
);
```

- [ ] **Step 6: Give the existing modal one replacement-content slot**

In `ButtonLabelAppearanceDialogFrame.tsx`, import `ReactNode`, add
`fullScreenContent` and `onRequestClose`, route the native callback to
`onRequestClose`, and replace the modal body only when full-screen content is
present:

```tsx
const normalContent = (
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
        <View className="flex-row items-center justify-between px-5 pb-3 pt-5">
          <Text className="text-lg font-semibold text-white">
            {t("customize.buttonIdentifierAppearance")}
          </Text>
          <Pressable
            accessibilityHint={t("customize.buttonAppearanceOverallPreviewHint")}
            accessibilityLabel={t("customize.buttonAppearanceOverallPreview")}
            accessibilityRole="button"
            className="h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-zinc-950"
            onPress={props.onOpenOverallPreview}
            testID="button-label-appearance-overall-preview"
          >
            <Lucide color="#ffffff" name="eye" size={20} />
          </Pressable>
        </View>
        <ScrollView
          className="px-5"
          contentContainerStyle={{ gap: 16, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={props.scrollEnabled}
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
            testID="button-label-appearance-confirm"
            textClassName="text-green-900"
          >
            {t("common.confirm")}
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  </View>
);

<Modal
  accessibilityViewIsModal
  animationType="fade"
  onRequestClose={props.onRequestClose}
  transparent
  visible={props.open}
>
  {props.fullScreenContent ?? normalContent}
</Modal>
```

Return that `Modal` after defining `normalContent`; do not duplicate the normal
body or change keyboard/backdrop/footer behavior.

- [ ] **Step 7: Route both dialog modes through the frame**

In `ButtonLabelAppearanceDialog.tsx`, define the Back boundary and pass the
overall content into the existing frame:

```tsx
const handleRequestClose = () => {
  if (isOverallPreviewOpen) {
    setIsOverallPreviewOpen(false);
    return;
  }
  props.onCancel();
};

const overallPreview = isOverallPreviewOpen ? (
  <ButtonAppearanceOverallPreviewOverlay
    animatedAppearance={draft.animatedAppearance}
    backgroundTheme={draft.backgroundTheme}
    buttonIdentifierColor={props.color}
    buttonIdentifierOpacity={props.opacity / 100}
    buttonPanelOpacity={props.imageOpacity}
    identifierPositions={props.identifierPositions}
    image={props.image}
    onDismiss={() => setIsOverallPreviewOpen(false)}
    preset={props.preset}
    previewUri={props.previewUri}
    showButtonIdentifiers={props.showButtonIdentifiers}
    transform={props.transform}
  />
) : undefined;

return (
  <ButtonLabelAppearanceDialogFrame
    confirmDisabled={draft.confirmDisabled || focusedPanel === undefined}
    fullScreenContent={overallPreview}
    onCancel={props.onCancel}
    onConfirm={() => props.onConfirm(draft.readConfirmedAppearance())}
    onOpenOverallPreview={() => setIsOverallPreviewOpen(true)}
    onRequestClose={handleRequestClose}
    open={props.open}
    scrollEnabled={!isPickerInteracting}
  >
    {focusedPanel ? (
      <>
        <FocusedButtonAppearancePreview
          animatedAppearance={draft.animatedAppearance}
          backgroundTheme={draft.backgroundTheme}
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
          current={displayedIndex + 1}
          label={focusedPanel.label}
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
          onHexChange={draft.handleHexChange}
          onInteractionEnd={() => setIsPickerInteracting(false)}
          onInteractionStart={() => setIsPickerInteracting(true)}
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
  </ButtonLabelAppearanceDialogFrame>
);
```

Remove the sibling `ButtonAppearanceOverallPreviewOverlay`. Because the frame
does not render `children` while `fullScreenContent` exists, the focused image,
picker, and their native views must be unmounted during the full-layout view.

- [ ] **Step 8: Run the modal and static-preview regressions**

```bash
npm test -- --runInBand __tests__/button-label-appearance-dialog.test.tsx __tests__/focused-button-appearance-preview.test.tsx __tests__/quick-panel-preview-read-only.test.tsx __tests__/quick-panel-preview-stage-background.test.tsx
```

Expected: PASS. The test tree contains one `Modal`; overall and focused
compositions are mutually exclusive; static previews never initialize gesture
state.

---

### Task 2: Suspend the underlying interactive preview during appearance editing

**Files:**

- Create: `__tests__/customize-preview-section-lifecycle.test.tsx`
- Modify: `src/features/quick-panel/customize/components/CustomizePreviewSection.tsx`

**Interfaces:** No exported runtime interface changes. The section retains
`image`, `preset`, `previewUri`, and `transform` while the dialog is open, but
does not mount `QuickPanelPreview` until the dialog closes.

- [ ] **Step 1: Write the failing preview-lifecycle test**

Create a focused component test. Mock `QuickPanelPreview` as
`testID="interactive-customize-preview"`, mock `ButtonCustomizeControls` with a
pressable `testID="open-button-appearance"`, and mock
`ButtonLabelAppearanceDialog` with `testID="button-appearance-dialog"` plus a
pressable `testID="cancel-button-appearance"`.

Use a mixed preset containing one Control and one Button and a complete
`ButtonCustomizeControlState` fixture. Assert this lifecycle:

```ts
const buttonControls = {
  buttonIdentifierBackgroundTheme: "light" as const,
  buttonIdentifierColor: "#FFFFFF",
  buttonIdentifierOpacity: 70,
  buttonPanelOpacity: 78,
  hasHorizontalButtons: true,
  hasVerticalButtons: false,
  horizontalIdentifierPosition: 50,
  identifierPositions: { horizontal: 0.5, vertical: 0.5 },
  setButtonIdentifierAppearance: jest.fn(),
  setButtonPanelOpacity: jest.fn(),
  setHorizontalIdentifierPosition: jest.fn(),
  setShowButtonIdentifiers: jest.fn(),
  setVerticalIdentifierPosition: jest.fn(),
  showButtonIdentifiers: true,
  verticalIdentifierPosition: 50,
} satisfies ButtonCustomizeControlState;
```

```tsx
it("mounts the heavy interactive preview only outside appearance editing", () => {
  const screen = render(
    <CustomizePreviewSection
      buttonControls={buttonControls}
      image={image}
      onAdjustingChange={jest.fn()}
      onTransformChange={jest.fn()}
      preset={preset}
      previewUri="file:///preview.png"
      transform={transform}
    />,
  );

  expect(screen.getByTestId("interactive-customize-preview").props)
    .toMatchObject({ image, preset, previewUri: "file:///preview.png", transform });
  expect(screen.queryByTestId("button-appearance-dialog")).toBeNull();

  fireEvent.press(screen.getByTestId("open-button-appearance"));
  expect(screen.queryByTestId("interactive-customize-preview")).toBeNull();
  expect(screen.getByTestId("button-appearance-dialog")).toBeTruthy();

  fireEvent.press(screen.getByTestId("cancel-button-appearance"));
  expect(screen.queryByTestId("button-appearance-dialog")).toBeNull();
  expect(screen.getByTestId("interactive-customize-preview").props)
    .toMatchObject({ image, preset, previewUri: "file:///preview.png", transform });
});
```

Task 3 explicitly adds its three completion callbacks to this fixture when it
extends `ButtonCustomizeControlState`.

- [ ] **Step 2: Run the lifecycle test and verify RED**

```bash
npm test -- --runInBand __tests__/customize-preview-section-lifecycle.test.tsx
```

Expected: FAIL because the interactive preview remains mounted behind the
dialog.

- [ ] **Step 3: Gate only the heavy preview subtree**

Keep the existing flex preview slot and its `onLayout`; conditionally mount its
child:

```tsx
<View
  className="w-full flex-1 items-center justify-center"
  onLayout={(event) => setPreviewSlotHeight(event.nativeEvent.layout.height)}
>
  {isAppearanceDialogOpen ? null : (
    <QuickPanelPreview
      buttonIdentifierBackgroundTheme={buttonControls.buttonIdentifierBackgroundTheme}
      buttonIdentifierColor={buttonControls.buttonIdentifierColor}
      buttonIdentifierOpacity={buttonControls.buttonIdentifierOpacity / 100}
      buttonPanelOpacity={buttonControls.buttonPanelOpacity / 100}
      identifierPositions={buttonControls.identifierPositions}
      image={image}
      maxHeight={previewSlotHeight || undefined}
      onAdjustingChange={onAdjustingChange}
      onTransformChange={onTransformChange}
      preset={preset}
      previewUri={previewUri}
      showButtonIdentifiers={buttonControls.showButtonIdentifiers}
      transform={transform}
    />
  )}
</View>
```

Do not hide the Button controls card or remove the preview slot itself. The
native modal covers that UI, while retaining the slot prevents the underlying
screen structure from changing more than necessary.

- [ ] **Step 4: Run lifecycle and preview-scale regressions**

```bash
npm test -- --runInBand __tests__/customize-preview-section-lifecycle.test.tsx __tests__/quick-panel-preview-read-only.test.tsx __tests__/quick-panel-preview-gestures.test.tsx
```

Expected: PASS. Closing the modal remounts the interactive preview from the
same controlled transform, and read-only previews remain independent from
gesture state.

---

### Task 3: Deduplicate slider crossings and persist only on completion

**Files:**

- Create: `src/components/ani-ui/__tests__/slider.test.tsx`
- Modify: `src/components/ani-ui/slider.tsx`
- Modify: `src/features/quick-panel/customize/components/ButtonAdjustmentSlider.tsx`
- Modify: `src/features/quick-panel/customize/components/ButtonAdjustmentTabs.tsx`
- Modify: `src/features/quick-panel/customize/components/ButtonCustomizeControls.tsx`
- Modify: `src/features/quick-panel/customize/components/CustomizePreviewSection.tsx`
- Modify: `src/features/quick-panel/customize/hooks/useButtonCustomizeControls.ts`
- Modify: `__tests__/button-customize-controls.test.tsx`
- Modify: `__tests__/button-customize-controls-hook.test.ts`
- Modify: `__tests__/customize-preview-section-lifecycle.test.tsx`

**Interfaces:**

```ts
// Add this exact property to the existing SliderProps interface.
onSlidingComplete?: (value: number) => void;
```

```ts
// Add these exact properties to ButtonCustomizeControlState.
commitButtonPanelOpacity: (value: number) => void;
commitHorizontalIdentifierPosition: (value: number) => void;
commitVerticalIdentifierPosition: (value: number) => void;
```

`ButtonCustomizeControlsProps` uses the corresponding prop names:

```ts
onButtonPanelOpacityCommit: (value: number) => void;
onHorizontalIdentifierPositionCommit: (value: number) => void;
onVerticalIdentifierPositionCommit: (value: number) => void;
```

- [ ] **Step 1: Write the failing AniUI Slider gesture test**

Create `src/components/ani-ui/__tests__/slider.test.tsx`. Capture a mock Pan
gesture's `onBegin`, `onUpdate`, and `onFinalize` callbacks; make
`scheduleOnRN` invoke immediately. After firing a 100-point track layout,
assert duplicate rounded values cross to React once and finalization reports
the last value:

```tsx
it("emits each stepped value once and completes with the last value", () => {
  const onValueChange = jest.fn();
  const onSlidingComplete = jest.fn();
  const screen = render(
    <Slider
      max={100}
      min={0}
      onSlidingComplete={onSlidingComplete}
      onValueChange={onValueChange}
      step={1}
      testID="slider"
      value={50}
    />,
  );

  fireEvent(screen.getByTestId("slider"), "layout", {
    nativeEvent: { layout: { height: 32, width: 100, x: 0, y: 0 } },
  });
  act(() => {
    panHandlers.onBegin?.({ x: 10 });
    panHandlers.onUpdate?.({ x: 10.2 });
    panHandlers.onUpdate?.({ x: 11 });
    panHandlers.onUpdate?.({ x: 11.4 });
  });

  expect(onValueChange.mock.calls).toEqual([[10], [11]]);
  expect(onSlidingComplete).not.toHaveBeenCalled();

  act(() => panHandlers.onFinalize?.());
  expect(onSlidingComplete).toHaveBeenCalledTimes(1);
  expect(onSlidingComplete).toHaveBeenCalledWith(11);
});
```

Add a second case that rerenders with an externally controlled value and proves
the same value is not re-emitted. The mock gesture builder must implement every
builder method used by `Slider`: `enabled`, `onBegin`, `onUpdate`,
`onFinalize`, and `minDistance`.

- [ ] **Step 2: Write failing persistence-boundary hook tests**

Extend `__tests__/button-customize-controls-hook.test.ts` with both storage
paths:

```ts
it("keeps shared Button slider changes live and persists on completion", () => {
  saveButtonCustomizeSettings({
    buttonIdentifierBackgroundTheme: "dark",
    buttonIdentifierColor: "#FFFFFF",
    buttonIdentifierOpacity: 70,
    buttonPanelOpacity: 78,
    horizontalIdentifierPosition: 50,
    showButtonIdentifiers: true,
    verticalIdentifierPosition: 50,
  });
  const hook = renderHook(() =>
    useButtonCustomizeControls(s25PlusOneUi85Preset, "buttons"),
  );

  act(() => hook.result.current.setHorizontalIdentifierPosition(23));
  expect(hook.result.current.horizontalIdentifierPosition).toBe(23);
  expect(loadButtonCustomizeSettings().horizontalIdentifierPosition).toBe(50);

  act(() => hook.result.current.commitHorizontalIdentifierPosition(23));
  expect(loadButtonCustomizeSettings().horizontalIdentifierPosition).toBe(23);
});

it("persists combined intensity only when its slider completes", () => {
  saveCombinedButtonImageIntensity(63);
  const hook = renderHook(() =>
    useButtonCustomizeControls(s25PlusOneUi85Preset, "combined"),
  );

  act(() => hook.result.current.setButtonPanelOpacity(42));
  expect(hook.result.current.buttonPanelOpacity).toBe(42);
  expect(loadCombinedButtonImageIntensity()).toBe(63);

  act(() => hook.result.current.commitButtonPanelOpacity(42));
  expect(loadCombinedButtonImageIntensity()).toBe(42);
});
```

- [ ] **Step 3: Write the failing callback-wiring test**

Add these mocks to `baseProps` in
`__tests__/button-customize-controls.test.tsx`:

```ts
onButtonPanelOpacityCommit: jest.fn(),
onHorizontalIdentifierPositionCommit: jest.fn(),
onVerticalIdentifierPositionCommit: jest.fn(),
```

Then assert the active Slider receives and calls the image completion callback:

```tsx
const slider = screen.getByTestId("button-panel-opacity-slider");
act(() => slider.props.onSlidingComplete(64));
expect(baseProps.onButtonPanelOpacityCommit).toHaveBeenCalledWith(64);
```

Switch to the horizontal and vertical tabs and assert their Slider instances
route completion to the matching callback.

- [ ] **Step 4: Run focused tests and verify RED**

```bash
npm test -- --runInBand src/components/ani-ui/__tests__/slider.test.tsx __tests__/button-customize-controls.test.tsx __tests__/button-customize-controls-hook.test.ts
```

Expected: FAIL because Slider has no completion contract, duplicate values are
not suppressed, and every live hook update currently writes MMKV.

- [ ] **Step 5: Implement stepped-value deduplication and finalization**

In AniUI `slider.tsx`, import `useEffect` and `useSharedValue`, add the optional
completion prop, and track the last emitted and last gesture values:

```tsx
const lastEmittedValue = useSharedValue(value);
const gestureValue = useSharedValue(value);

useEffect(() => {
  lastEmittedValue.set(value);
  gestureValue.set(value);
}, [gestureValue, lastEmittedValue, value]);

const emitValue = useCallback(
  (locationX: number) => {
    "worklet";
    if (trackWidth <= 0) return;
    const ratio = Math.max(0, Math.min(1, locationX / trackWidth));
    const raw = min + ratio * (max - min);
    const stepped = Math.round(raw / step) * step;
    const clamped = Math.max(min, Math.min(max, stepped));
    gestureValue.set(clamped);
    if (lastEmittedValue.get() === clamped) return;
    lastEmittedValue.set(clamped);
    if (onValueChange) scheduleOnRN(onValueChange, clamped);
  },
  [gestureValue, lastEmittedValue, max, min, onValueChange, step, trackWidth],
);

const gesture = Gesture.Pan()
  .enabled(!disabled)
  .onBegin((event) => emitValue(event.x))
  .onUpdate((event) => emitValue(event.x))
  .onFinalize(() => {
    if (onSlidingComplete) {
      scheduleOnRN(onSlidingComplete, gestureValue.get());
    }
  })
  .minDistance(0);
```

`onFinalize` is intentional: completion must run for successful release and
gesture cancellation, and the passed value must not depend on React state
having committed first.

- [ ] **Step 6: Separate live state from persistent state**

In `useButtonCustomizeControls.ts`, replace `updateSetting` with live and
commit helpers:

```ts
const setSetting = <K extends keyof ButtonCustomizeSettings>(
  key: K,
  value: ButtonCustomizeSettings[K],
) => {
  setSettings((current) =>
    Object.is(current[key], value) ? current : { ...current, [key]: value },
  );
};

const commitSetting = <K extends keyof ButtonCustomizeSettings>(
  key: K,
  value: ButtonCustomizeSettings[K],
) => {
  setSettings((current) => {
    const next = Object.is(current[key], value)
      ? current
      : { ...current, [key]: value };
    saveButtonCustomizeSettings(next);
    return next;
  });
};
```

Add the three completion methods to `ButtonCustomizeControlState`. Clamp image
intensity in both live and completion paths:

```ts
commitButtonPanelOpacity: (value) => {
  const next = Math.min(100, Math.max(0, value));
  if (target === "combined") {
    setCombinedButtonPanelOpacity(next);
    saveCombinedButtonImageIntensity(next);
    return;
  }
  commitSetting("buttonPanelOpacity", next);
},
commitHorizontalIdentifierPosition: (value) =>
  commitSetting("horizontalIdentifierPosition", value),
commitVerticalIdentifierPosition: (value) =>
  commitSetting("verticalIdentifierPosition", value),
setButtonPanelOpacity: (value) => {
  const next = Math.min(100, Math.max(0, value));
  if (target === "combined") {
    setCombinedButtonPanelOpacity(next);
    return;
  }
  setSetting("buttonPanelOpacity", next);
},
setHorizontalIdentifierPosition: (value) =>
  setSetting("horizontalIdentifierPosition", value),
setShowButtonIdentifiers: (value) =>
  commitSetting("showButtonIdentifiers", value),
setVerticalIdentifierPosition: (value) =>
  setSetting("verticalIdentifierPosition", value),
```

Keep `setButtonIdentifierAppearance` transactional and immediately persistent
because it already runs only on Confirm.

- [ ] **Step 7: Thread completion callbacks through the controls**

Add `onSlidingComplete` to `ButtonAdjustment`, pass it from
`ButtonAdjustmentSlider` into AniUI Slider, and assign the matching completion
prop to every adjustment in `ButtonAdjustmentTabs`:

```ts
export interface ButtonAdjustment {
  accessibilityLabel: string;
  disabled: boolean;
  label: string;
  onSlidingComplete: (value: number) => void;
  onValueChange: (value: number) => void;
  sliderTestID: string;
  tabLabel: string;
  tabTestID: string;
  value: number;
  valueKey: string;
}
```

For the image adjustment, for example:

```ts
{
  accessibilityLabel: t("customize.buttonPanelOpacity"),
  disabled: false,
  label: t("customize.buttonPanelOpacity"),
  onSlidingComplete: props.onButtonPanelOpacityCommit,
  onValueChange: props.onButtonPanelOpacityChange,
  sliderTestID: "button-panel-opacity-slider",
  tabLabel: t("customize.buttonAdjustmentImageTab"),
  tabTestID: "button-adjustment-image-tab",
  value: props.buttonPanelOpacity,
  valueKey: "image",
}
```

Add the three `...Commit` props to `ButtonCustomizeControls`, pass them into
`ButtonAdjustmentTabs`, then wire them from `CustomizePreviewSection`:

```tsx
<ButtonCustomizeControls
  buttonIdentifierBackgroundTheme={buttonControls.buttonIdentifierBackgroundTheme}
  buttonIdentifierColor={buttonControls.buttonIdentifierColor}
  buttonPanelOpacity={buttonControls.buttonPanelOpacity}
  hasHorizontalButtons={buttonControls.hasHorizontalButtons}
  hasVerticalButtons={buttonControls.hasVerticalButtons}
  horizontalIdentifierPosition={buttonControls.horizontalIdentifierPosition}
  onButtonPanelOpacityCommit={buttonControls.commitButtonPanelOpacity}
  onButtonPanelOpacityChange={buttonControls.setButtonPanelOpacity}
  onHorizontalIdentifierPositionCommit={
    buttonControls.commitHorizontalIdentifierPosition
  }
  onHorizontalIdentifierPositionChange={
    buttonControls.setHorizontalIdentifierPosition
  }
  onOpenButtonIdentifierAppearance={() => setAppearanceDialogOpen(true)}
  onShowButtonIdentifiersChange={buttonControls.setShowButtonIdentifiers}
  onVerticalIdentifierPositionCommit={
    buttonControls.commitVerticalIdentifierPosition
  }
  onVerticalIdentifierPositionChange={
    buttonControls.setVerticalIdentifierPosition
  }
  showButtonIdentifiers={buttonControls.showButtonIdentifiers}
  verticalIdentifierPosition={buttonControls.verticalIdentifierPosition}
/>
```

Add the three completion callbacks to the Task 2
`ButtonCustomizeControlState` test fixture as `jest.fn()` values so that test
continues to type-check.

- [ ] **Step 8: Run focused slider and control tests**

```bash
npm test -- --runInBand src/components/ani-ui/__tests__/slider.test.tsx __tests__/button-customize-controls.test.tsx __tests__/button-customize-controls-hook.test.ts __tests__/customize-preview-section-lifecycle.test.tsx __tests__/advanced-grid-controls.test.tsx
```

Expected: PASS. Advanced grid behavior remains compatible because
`onSlidingComplete` is optional; Customize values update live, while MMKV sees
only the finalized value.

---

### Task 4: Record the boundary and complete automated verification

**Files:**

- Modify: `docs/notes.md`
- Modify: `docs/2026-08-04-customize-page-redesign-handoff.md`
- Verify all files listed in the File Map

**Interfaces:** Documentation only. No runtime interface changes.

- [ ] **Step 1: Add the durable performance entry**

Add this newest entry near the top of `docs/notes.md`:

```markdown
### 2026-08-04: Customize appearance performance boundary

- Button appearance uses one native Modal. The focused inspector and overall
  preview are mutually exclusive states inside that root; Android Back closes
  the overall preview before it can cancel the appearance draft.
- While appearance editing is open, Customize suspends the underlying
  interactive QuickPanelPreview. Closing or confirming remounts it from the
  same controlled image, preset, preview URI, and `{ x, y, scale }` transform.
- Button adjustment sliders suppress duplicate stepped values. Live values
  still update preview state, while MMKV persistence occurs once from gesture
  finalization. Toggles and confirmed appearance changes remain immediately
  persistent.
- Preview proxy size, panel geometry, identifier composition, export fidelity,
  and sequential export are unchanged. A single masked stage image remains a
  separate investigation only if base pan/pinch lag persists.
```

- [ ] **Step 2: Update the redesign handoff**

In `docs/2026-08-04-customize-page-redesign-handoff.md`:

- change status from “Performance investigation remains open” to automated
  implementation complete with user device QA pending;
- replace the known-issue section with the measured diagnostic finding: three
  roots/contexts in the former nested-overlay state and UI/root setup as the
  primary target;
- describe the final single-modal, mutually exclusive composition lifecycle;
- describe base-preview suspension and completion-based slider persistence;
- retain the warning that development-client counters are directional;
- list the exact user-owned manual checks from Step 5.

- [ ] **Step 3: Run focused verification**

```bash
npm test -- --runInBand __tests__/button-label-appearance-dialog.test.tsx __tests__/focused-button-appearance-preview.test.tsx __tests__/quick-panel-preview-read-only.test.tsx __tests__/quick-panel-preview-stage-background.test.tsx __tests__/customize-preview-section-lifecycle.test.tsx src/components/ani-ui/__tests__/slider.test.tsx __tests__/button-customize-controls.test.tsx __tests__/button-customize-controls-hook.test.ts __tests__/advanced-grid-controls.test.tsx
```

Expected: PASS with one modal and one active appearance composition, a
suspended base preview during appearance editing, and completion-based slider
persistence.

- [ ] **Step 4: Run full automated verification**

```bash
npm test -- --runInBand
npm run lint
npx tsc --noEmit
git diff --check
```

Expected: every command exits zero. Do not claim physical performance,
QuickStar fidelity, or release-build results from these checks.

- [ ] **Step 5: Hand off user-owned Samsung QA**

Ask the user to verify these exact states on the S25+ without the agent driving
the device:

1. Open the nine-panel combined Customize page and confirm pan/pinch remains
   continuous.
2. Drag Image, Horizontal, and Vertical sliders; confirm live preview feedback
   and restart persistence.
3. Open Label appearance; confirm the focused Button and picker behavior are
   visually unchanged.
4. Open the eye preview; confirm the full layout replaces the inspector rather
   than visually stacking another modal.
5. Press Android Back once to return to the inspector, then again to discard
   the draft.
6. Close and reopen appearance repeatedly; confirm the main preview never
   enlarges, flashes, or loses its transform.
7. Confirm appearance, export, and verify the same Good Lock order, filenames,
   image placement, identifier styling, and `1024 x 1024` PNG output.

Report automated checks separately from this manual acceptance. Do not stage,
commit, or push; after code work, provide only this suggested commit message:

```text
optimize: reduce Customize modal and slider work
```
