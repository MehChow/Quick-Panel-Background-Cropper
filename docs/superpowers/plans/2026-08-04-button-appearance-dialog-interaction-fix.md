# Button Appearance Dialog Interaction Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:executing-plans` to implement this plan inline task-by-task. Do
> not dispatch subagents.

**Goal:** Remove the redundant Button appearance comparison tabs and prevent
the dialog scroll view from competing with color-picker drags while preserving
live draft feedback and transactional settings.

**Architecture:** Keep the current focused preview and Reanimated draft path.
Delete comparison state and always render the current valid draft. Add a small
interaction boundary between `ButtonLabelColorPicker`, the dialog, and its
frame so the outer `ScrollView` is disabled only while the wheel or picker
sliders own an active touch.

**Tech Stack:** Expo 56, React Native 0.85, React 19 with React Compiler,
TypeScript 6, RNGH, Reanimated 4, `reanimated-color-picker` 5.1.2, Uniwind,
Jest 29, and React Native Testing Library.

## Global constraints

- Read the exact Expo 56 documentation at
  `https://docs.expo.dev/versions/v56.0.0/` before editing application code.
- Execute inline only. Do not use or suggest subagents.
- Do not stage, commit, push, create a branch, or open a pull request.
- Preserve all existing combined-mode and focused-inspector changes in the
  dirty worktree.
- Leave physical Samsung, QuickStar, and Good Lock QA to the user.
- Do not use a browser demo or add dependencies.
- Use interfaces for props and do not introduce `any`.
- Do not add `useMemo`, `useCallback`, or `React.memo` outside AniUI.
- Keep components focused and under 150 lines.
- Preserve Confirm-to-commit and Cancel/backdrop/Back-to-discard semantics.
- Preserve the existing Reanimated `onChange` shared-value path. Never add
  `onChangeJS` or React state updates for continuous picker frames.
- Do not change the preview/export composition, persisted schema, main preview,
  image transform, intensity, identifier layout, or export pipeline.
- Design contract:
  `docs/superpowers/specs/2026-08-04-button-appearance-dialog-interaction-fix-design.md`.

## File map

**Modify**

- `src/features/quick-panel/customize/components/ButtonLabelAppearanceDialog.tsx`
  — remove comparison state, always render the valid draft, and own temporary
  picker-interaction state.
- `src/features/quick-panel/customize/components/ButtonAppearanceInspectorControls.tsx`
  — keep Button navigation and remove comparison UI/props.
- `src/features/quick-panel/customize/components/ButtonLabelColorPicker.tsx`
  — replace comparison notification with picker interaction start/end events.
- `src/features/quick-panel/customize/components/ButtonLabelAppearanceDialogFrame.tsx`
  — accept and apply `scrollEnabled`.
- `src/features/quick-panel/customize/focused-button-inspector.ts` — remove the
  obsolete comparison type.
- `__tests__/button-appearance-inspector-controls.test.tsx` — assert the
  navigation-only controls.
- `__tests__/button-label-appearance-dialog.test.tsx` — cover always-live draft
  rendering and picker scroll ownership.
- `i18next/locales/en.ts` and `i18next/locales/zh.ts` — remove comparison copy.
- `__tests__/locales.test.ts` — preserve exact locale parity.
- `docs/notes.md` — record the final durable interaction contract.

**Intentionally unchanged**

- `FocusedButtonAppearancePreview.tsx`
- `QuickPanelPreviewStage.tsx`
- `PanelSlice.tsx`
- `CustomizeScreen.tsx`
- all store, persistence, calibration, export, and result modules

---

### Task 1: Remove comparison UI and always show the live draft

**Files:**

- Modify: `ButtonLabelAppearanceDialog.tsx`
- Modify: `ButtonAppearanceInspectorControls.tsx`
- Modify: `ButtonLabelColorPicker.tsx`
- Modify: `focused-button-inspector.ts`
- Modify: `button-appearance-inspector-controls.test.tsx`
- Modify: `button-label-appearance-dialog.test.tsx`
- Modify: `i18next/locales/en.ts`
- Modify: `i18next/locales/zh.ts`
- Modify: `__tests__/locales.test.ts`

- [ ] **Step 1: Inspect the dirty boundary**

Run:

```bash
git status --short
git diff -- src/features/quick-panel/customize i18next __tests__ docs/notes.md
```

Do not clean or rewrite unrelated combined-mode work.

- [ ] **Step 2: Change the tests first**

Update the inspector-controls test so its props contain only `current`,
`label`, `onNext`, `onPrevious`, and `total`. Keep the label/count, cyclic
navigation callback, 44dp hit-area, single-Button, and accessibility checks.
Assert that `button-appearance-before` and `button-appearance-new` are absent.

Update the dialog test to expect the focused preview to receive the animated
draft appearance and current draft theme unconditionally. Remove cases that
select Before or expect a valid edit to return to New.

Update locale tests to expect parity without `buttonAppearanceBefore` and
`buttonAppearanceNew`.

- [ ] **Step 3: Run the focused tests and observe the expected failures**

```bash
npm test -- --runInBand \
  __tests__/button-appearance-inspector-controls.test.tsx \
  __tests__/button-label-appearance-dialog.test.tsx \
  __tests__/locales.test.ts
```

Expected: FAIL because the current implementation still renders and types the
comparison controls.

- [ ] **Step 4: Remove the comparison implementation**

In `focused-button-inspector.ts`, delete `ButtonAppearanceComparison`.

In `ButtonAppearanceInspectorControls.tsx`:

- remove `comparison`, `onComparisonChange`, and their imported type;
- remove the Before/New tab row and any styling import used only by it; and
- retain the focused label/count and Previous/Next behavior unchanged.

In `ButtonLabelAppearanceDialog.tsx`:

- remove the comparison state and derived `isNew` branch;
- always pass `draft.animatedAppearance` and the current valid draft background
  theme to `FocusedButtonAppearancePreview`; and
- stop passing comparison props to the controls or picker.

In `ButtonLabelColorPicker.tsx`, remove `onDraftInteraction` and calls that
exist only to select New. Keep valid draft callbacks and invalid-HEX behavior
unchanged; Task 2 will add the separate gesture-lifecycle API.

Remove `buttonAppearanceBefore` and `buttonAppearanceNew` from both locales.

- [ ] **Step 5: Re-run the focused tests**

Run the Step 3 command. Expected: PASS.

---

### Task 2: Give picker drags exclusive ownership over dialog scrolling

**Files:**

- Modify: `ButtonLabelAppearanceDialog.tsx`
- Modify: `ButtonLabelColorPicker.tsx`
- Modify: `ButtonLabelAppearanceDialogFrame.tsx`
- Modify: `button-label-appearance-dialog.test.tsx`

**Interfaces:**

```ts
interface ButtonLabelColorPickerProps {
  onInteractionEnd: () => void;
  onInteractionStart: () => void;
  // Keep all existing appearance props.
}

interface ButtonLabelAppearanceDialogFrameProps {
  scrollEnabled: boolean;
  // Keep all existing frame props.
}
```

- [ ] **Step 1: Add failing scroll-ownership tests**

Expose a stable test ID such as `button-label-picker-gesture-region` for the
view surrounding the `ColorPicker` only. In the dialog test, assert:

1. the frame/scroll view starts with `scrollEnabled={true}`;
2. `touchStart` on that region changes it to `false`;
3. `touchEnd` restores `true`;
4. `touchCancel` restores `true`; and
5. after another start, invoking the mocked picker's `onCompleteJS` restores
   `true`.

Retain or add an assertion that the mocked picker receives `onChange` and does
not receive `onChangeJS`.

- [ ] **Step 2: Run the dialog test and observe the expected failure**

```bash
npm test -- --runInBand __tests__/button-label-appearance-dialog.test.tsx
```

Expected: FAIL because the picker has no interaction region and the frame has
no controlled scroll state.

- [ ] **Step 3: Implement the temporary scroll lock**

In `ButtonLabelAppearanceDialog.tsx`, add screen-local
`isPickerInteracting` state. Pass:

```tsx
scrollEnabled={!isPickerInteracting}
```

to the frame, and pass start/end callbacks to the color picker that set the
state to `true` and `false`.

In `ButtonLabelAppearanceDialogFrame.tsx`, add the required boolean prop and
forward it to the existing RNGH `ScrollView`. Do not move the backdrop,
`KeyboardAvoidingView`, content container, or sticky action footer.

In `ButtonLabelColorPicker.tsx`, wrap only the `ColorPicker` subtree with a
plain `View` that has:

```tsx
testID="button-label-picker-gesture-region"
onTouchStart={onInteractionStart}
onTouchEnd={onInteractionEnd}
onTouchCancel={onInteractionEnd}
```

This region naturally covers `Panel3`, Brightness, and Opacity. Keep the HEX
input and Light/Dark selector outside it so a normal modal scroll can begin
there.

The existing `onCompleteJS` handler must call the current completion callback
and then `onInteractionEnd()` as a defensive release. Do not replace the
worklet `onChange` handler.

- [ ] **Step 4: Re-run the focused interaction tests**

```bash
npm test -- --runInBand \
  __tests__/button-label-color-picker.test.tsx \
  __tests__/button-label-appearance-dialog.test.tsx
```

Expected: PASS. If the color-picker test file has a different current name,
use the existing focused picker suite discovered with `rg --files __tests__`.

---

### Task 3: Record the contract and verify the implementation

**Files:**

- Modify: `docs/notes.md`

- [ ] **Step 1: Update durable notes**

Amend the newest focused-inspector entry so it says:

- the preview always shows the current valid draft;
- the selector contains Button navigation only;
- the modal scroll view is disabled during wheel/Brightness/Opacity touches and
  restored on end, cancel, or picker completion; and
- continuous color values remain on Reanimated shared values while Confirm is
  the only persistence boundary.

Remove the superseded Before/New bullet. Do not rewrite unrelated history.

- [ ] **Step 2: Run focused verification**

```bash
npm test -- --runInBand \
  __tests__/focused-button-inspector.test.ts \
  __tests__/button-appearance-inspector-controls.test.tsx \
  __tests__/focused-button-appearance-preview.test.tsx \
  __tests__/button-label-appearance-dialog.test.tsx \
  __tests__/locales.test.ts
```

- [ ] **Step 3: Run repository gates**

```bash
npm test -- --runInBand
npm run lint
npx tsc --noEmit
git diff --check
git status --short
```

All automated commands must pass. Preserve unrelated dirty files and report
their presence rather than altering them.

- [ ] **Step 4: Hand off manual device QA**

Do not run or claim physical-device QA. Give the user the design document's
manual acceptance checklist, emphasizing short-screen scrolling, continuous
wheel and slider drags, keyboard open/dismiss, every dismissal route, Confirm,
and export/application comparison.

If scroll competition is fixed but meaningful lag remains, stop and create a
separate profiler-backed investigation. Do not add speculative preview
optimizations to this patch.

Suggested commit message after the user reviews and commits the implementation:

`fix: stabilize button appearance picker interaction`
