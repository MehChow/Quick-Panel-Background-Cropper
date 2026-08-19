# Button Identifier Content Modes Implementation Plan

> **For implementation:** REQUIRED SUB-SKILL: Use
> `superpowers:executing-plans` to execute this plan inline with review
> checkpoints. Do not use subagents.

**Goal:** Add persisted `Both / Icon / None` Button identifier content modes
with safe dynamic positioning and preview/export parity.

**Architecture:** A small model module owns the mode type and validation.
Customize owns the persisted selection and passes it through the existing
preview/export pipeline. Shared identifier visuals conditionally render
content, while horizontal measurement includes the mode so placement remains
safe.

**Tech Stack:** Expo 56, React Native 0.85, TypeScript, Uniwind, AniUI Toggle
Group, MMKV, and Jest.

## Global constraints

- Preserve the user-installed `.aniui.json`, `toggle.tsx`, and
  `toggle-group.tsx` changes; do not overwrite or broaden those components.
- Do not install dependencies.
- Do not use `useMemo`, `useCallback`, or `React.memo` outside AniUI.
- Do not change calibration, image transforms, export order, filenames, or
  Controls-only behavior.
- Keep Button identifier settings shared between Buttons-only and Combined.
- Keep Combined Button image intensity independently persisted.
- Keep preview and export composition inputs identical.
- Do not commit or push.
- Leave physical Samsung and QuickStar QA for the user.

---

## File structure

### Create

- `src/features/quick-panel/model/button-identifier-content.ts`
  - Owns the content mode values, type, and normalizer.

### Modify: state and controls

- `src/features/quick-panel/store/storage.ts`
- `src/features/quick-panel/customize/hooks/useButtonCustomizeControls.ts`
- `src/features/quick-panel/customize/components/ButtonCustomizeControls.tsx`
- `src/features/quick-panel/customize/components/ButtonAdjustmentTabs.tsx`
- `i18next/locales/en.ts`
- `i18next/locales/zh.ts`

### Modify: shared rendering

- `src/features/quick-panel/customize/components/ButtonIdentifierOverlay.tsx`
- `src/features/quick-panel/customize/components/ButtonIdentifierVisuals.tsx`
- `src/features/quick-panel/customize/components/AnimatedButtonIdentifierVisuals.tsx`

### Modify: preview and export plumbing

- `src/features/quick-panel/customize/CustomizeScreen.tsx`
- `src/features/quick-panel/customize/components/CustomizePreviewSection.tsx`
- `src/features/quick-panel/customize/components/QuickPanelPreview.tsx`
- `src/features/quick-panel/customize/components/StaticQuickPanelPreview.tsx`
- `src/features/quick-panel/customize/components/QuickPanelPreviewStage.tsx`
- `src/features/quick-panel/customize/components/PanelSlice.tsx`
- `src/features/quick-panel/customize/components/ExportSurfaceHost.tsx`
- `src/features/quick-panel/customize/components/ExportSurface.tsx`
- `src/features/quick-panel/customize/hooks/useSequentialExport.ts`
- `src/features/quick-panel/customize/components/ButtonLabelAppearanceDialog.tsx`
- `src/features/quick-panel/customize/components/FocusedButtonAppearancePreview.tsx`
- `src/features/quick-panel/customize/components/ButtonAppearanceOverallPreviewOverlay.tsx`

### Modify: documentation

- `AGENTS.md`
- `docs/notes.md`

### Tests

- `__tests__/storage.test.ts`
- `__tests__/button-customize-controls-hook.test.ts`
- `__tests__/button-customize-controls.test.tsx`
- `__tests__/locales.test.ts`
- `__tests__/button-identifier-overlay.test.tsx`
- `__tests__/animated-button-identifier-visuals.test.tsx`
- `__tests__/customize-screen-export-surfaces.test.tsx`
- `__tests__/export-surfaces-position-readiness.test.tsx`
- `__tests__/sequential-export.test.tsx`
- `__tests__/focused-button-appearance-preview.test.tsx`
- `__tests__/button-label-appearance-dialog.test.tsx`

---

### Task 1: Add the mode model and persistence migration

**Files:**

- Create: `src/features/quick-panel/model/button-identifier-content.ts`
- Modify: `src/features/quick-panel/store/storage.ts`
- Test: `__tests__/storage.test.ts`

**Interfaces:**

- Produces:

```ts
export type ButtonIdentifierContentMode = "both" | "icon" | "none";

export function normalizeButtonIdentifierContentMode(
  value: unknown,
): ButtonIdentifierContentMode | null;
```

- Later tasks consume the type in Customize controls, preview props, shared
  visuals, and export readiness.

- [ ] **Step 1: Write failing persistence tests**

Update the round-trip fixture to use:

```ts
const settings: ButtonCustomizeSettings = {
  buttonIdentifierBackgroundTheme: "light",
  buttonIdentifierColor: "#1A2B3C",
  buttonIdentifierContentMode: "icon",
  buttonIdentifierOpacity: 61,
  buttonPanelOpacity: 84,
  horizontalIdentifierPosition: 23,
  verticalIdentifierPosition: 77,
};
```

Write raw-MMKV cases for the legacy and invalid values:

```ts
it.each([
  [true, "both"],
  [false, "none"],
] as const)("migrates legacy identifier visibility %s", (saved, expected) => {
  const mmkvStore = (globalThis as typeof globalThis & MmkvTestGlobal)
    .__mmkvStore;
  mmkvStore?.set(
    "quick-panel.button-customize-settings",
    JSON.stringify({ showButtonIdentifiers: saved }),
  );

  expect(loadButtonCustomizeSettings().buttonIdentifierContentMode)
    .toBe(expected);
});

it.each(["text", "", 1, null])(
  "defaults invalid identifier content mode %p to both",
  (saved) => {
    const mmkvStore = (globalThis as typeof globalThis & MmkvTestGlobal)
      .__mmkvStore;
    mmkvStore?.set(
      "quick-panel.button-customize-settings",
      JSON.stringify({ buttonIdentifierContentMode: saved }),
    );

    expect(loadButtonCustomizeSettings().buttonIdentifierContentMode)
      .toBe("both");
  },
);
```

- [ ] **Step 2: Run the focused test and verify failure**

Run:

```bash
npm test -- --runInBand __tests__/storage.test.ts
```

Expected: failure because `buttonIdentifierContentMode` does not exist in the
settings interface or parsed result.

- [ ] **Step 3: Create the content mode model**

Add:

```ts
export const buttonIdentifierContentModes = [
  "both",
  "icon",
  "none",
] as const;

export type ButtonIdentifierContentMode =
  (typeof buttonIdentifierContentModes)[number];

export function normalizeButtonIdentifierContentMode(
  value: unknown,
): ButtonIdentifierContentMode | null {
  return typeof value === "string"
    && buttonIdentifierContentModes.includes(
      value as ButtonIdentifierContentMode,
    )
    ? (value as ButtonIdentifierContentMode)
    : null;
}
```

- [ ] **Step 4: Replace the runtime boolean and implement migration**

In `ButtonCustomizeSettings`, replace `showButtonIdentifiers` with:

```ts
buttonIdentifierContentMode: ButtonIdentifierContentMode;
```

Set the default to `both`. Extend the raw parsed shape only for legacy input,
then resolve the saved value in this order:

```ts
buttonIdentifierContentMode:
  normalizeButtonIdentifierContentMode(
    parsed.buttonIdentifierContentMode,
  )
  ?? (
    typeof parsed.showButtonIdentifiers === "boolean"
      ? parsed.showButtonIdentifiers
        ? "both"
        : "none"
      : defaultButtonCustomizeSettings.buttonIdentifierContentMode
  ),
```

Keep the legacy field out of `ButtonCustomizeSettings`, so new saves serialize
only the new mode.

- [ ] **Step 5: Run the focused test and verify success**

Run:

```bash
npm test -- --runInBand __tests__/storage.test.ts
```

Expected: all storage tests pass.

---

### Task 2: Replace the Switch with the Toggle Group

**Files:**

- Modify: `src/features/quick-panel/customize/hooks/useButtonCustomizeControls.ts`
- Modify: `src/features/quick-panel/customize/components/ButtonCustomizeControls.tsx`
- Modify: `src/features/quick-panel/customize/components/ButtonAdjustmentTabs.tsx`
- Modify: `i18next/locales/en.ts`
- Modify: `i18next/locales/zh.ts`
- Test: `__tests__/button-customize-controls-hook.test.ts`
- Test: `__tests__/button-customize-controls.test.tsx`
- Test: `__tests__/locales.test.ts`

**Interfaces:**

- Consumes: `ButtonIdentifierContentMode` and
  `normalizeButtonIdentifierContentMode` from Task 1.
- Produces:

```ts
buttonIdentifierContentMode: ButtonIdentifierContentMode;
setButtonIdentifierContentMode: (
  value: ButtonIdentifierContentMode,
) => void;
```

- [ ] **Step 1: Update hook tests to the new mode**

Replace boolean fixtures and assertions with exact mode values. In the shared
Buttons-only/Combined test, set the mode through the Combined hook and assert
that a reloaded Buttons-only hook reads the same mode.

```ts
act(() => {
  combined.result.current.setButtonIdentifierContentMode("icon");
});

expect(loadButtonCustomizeSettings().buttonIdentifierContentMode)
  .toBe("icon");
```

- [ ] **Step 2: Add failing Toggle Group behavior tests**

Mocking the installed Toggle Group is unnecessary because it uses React Native
core components. Assert the selected radio and selection callback:

```ts
expect(
  screen.getByTestId("button-content-both").props.accessibilityState,
).toEqual({ selected: true });

fireEvent.press(screen.getByTestId("button-content-icon"));
expect(baseProps.onButtonIdentifierContentModeChange)
  .toHaveBeenCalledWith("icon");
```

Add cases proving:

- the palette remains enabled for `icon`;
- the palette is disabled for `none`;
- position tabs remain enabled for `icon`;
- entering `none` selects Image; and
- switching from `both` to `icon` preserves the selected position tab.

- [ ] **Step 3: Add failing locale assertions**

Assert the exact English copy and the existence of every Traditional Chinese
equivalent:

```ts
expect(enLocale.translation.customize.buttonIdentifierContentBoth)
  .toBe("Both");
expect(enLocale.translation.customize.buttonIdentifierContentIcon)
  .toBe("Icon");
expect(enLocale.translation.customize.buttonIdentifierContentNone)
  .toBe("None");
```

- [ ] **Step 4: Run the focused tests and verify failure**

Run:

```bash
npm test -- --runInBand \
  __tests__/button-customize-controls-hook.test.ts \
  __tests__/button-customize-controls.test.tsx \
  __tests__/locales.test.ts
```

Expected: failures for missing props, test IDs, and locale keys.

- [ ] **Step 5: Update the Customize hook**

Expose the saved mode and persist selection immediately:

```ts
setButtonIdentifierContentMode: (value) =>
  commitSetting("buttonIdentifierContentMode", value),
```

Do not change the existing live-versus-committed behavior of image intensity or
position sliders.

- [ ] **Step 6: Replace the Switch with a controlled Toggle Group**

Import the installed `ToggleGroup` and `ToggleGroupItem`. Validate its string
callback before calling the typed feature handler:

```ts
const handleContentModeChange = (value: string) => {
  const mode = normalizeButtonIdentifierContentMode(value);
  if (mode) {
    onButtonIdentifierContentModeChange(mode);
  }
};
```

Render the three items from typed data so their value, copy key, accessibility
key, and test ID remain aligned. Give each item `flex-1`; apply the established
black active surface and white active text locally using the current mode.

- [ ] **Step 7: Update disabled and tab-reset behavior**

Use:

```ts
const identifiersHidden =
  props.buttonIdentifierContentMode === "none";
```

Key the Tabs only by the visible/hidden boundary:

```tsx
<Tabs
  defaultValue="image"
  key={identifiersHidden ? "identifiers-off" : "identifiers-on"}
  size="sm"
>
```

This returns to Image for `none` without resetting the active tab when the user
switches between `both` and `icon`.

- [ ] **Step 8: Run the focused tests and verify success**

Run the command from Step 4. Expected: all three focused suites pass.

---

### Task 3: Render the selected identifier content safely

**Files:**

- Modify: `src/features/quick-panel/customize/components/ButtonIdentifierOverlay.tsx`
- Modify: `src/features/quick-panel/customize/components/ButtonIdentifierVisuals.tsx`
- Modify: `src/features/quick-panel/customize/components/AnimatedButtonIdentifierVisuals.tsx`
- Test: `__tests__/button-identifier-overlay.test.tsx`
- Test: `__tests__/animated-button-identifier-visuals.test.tsx`

**Interfaces:**

- Consumes: `ButtonIdentifierContentMode` from Task 1.
- Produces: static and animated visuals that accept
  `contentMode: ButtonIdentifierContentMode`.

- [ ] **Step 1: Add failing static rendering tests**

Extend the overlay helper with a `contentMode` argument defaulted to `both`.
Add cases proving:

- horizontal `icon` renders the icon but not text;
- corner `icon` removes the bottom-right text;
- vertical and `1x1` `both` preserve existing icon-only output; and
- `none` renders no identifier content.

- [ ] **Step 2: Add a failing horizontal remeasurement test**

Measure `both`, change to `icon`, and require the overlay to hide until the new
width commits:

```ts
screen.rerender(createOverlay({
  contentMode: "icon",
  positions: { horizontal: 1, vertical: 0.5 },
}));

expect(StyleSheet.flatten(
  screen.getByTestId("button-identifier-overlay").props.style,
).opacity).toBe(0);

fireEvent(
  screen.getByTestId("button-identifier-movable-content"),
  "layout",
  { nativeEvent: { layout: { height: 20, width: 30, x: 0, y: 0 } } },
);
```

For the existing 100-pixel test bounds and 7-pixel inset, assert that a
30-pixel Icon-only group at position `1` resolves to `left: 63`.

Rerender `both`, require another hidden/unmeasured state, then commit the wider
measurement and assert the group moves left while retaining position `1`.

- [ ] **Step 3: Add failing animated rendering tests**

Pass `contentMode="icon"` to the corner visual and assert the icon background
exists while `Shazam` does not. Keep the existing independent circle and glyph
color assertions.

- [ ] **Step 4: Run the focused tests and verify failure**

Run:

```bash
npm test -- --runInBand \
  __tests__/button-identifier-overlay.test.tsx \
  __tests__/animated-button-identifier-visuals.test.tsx
```

Expected: failures because the shared visuals do not accept or apply the mode.

- [ ] **Step 5: Implement conditional static and animated content**

Pass the mode into both visual components. Use the same content rules in both:

```ts
const showIcon = contentMode !== "none";
const showText = contentMode === "both" && layout.showLabel;
```

Wrap the existing icon circle in `showIcon` and the existing text in
`showText`. Do not change icon, font, gap, color, shadow, or corner metrics.

- [ ] **Step 6: Invalidate horizontal measurement by mode**

Add `contentMode` to `measurementKey`. Preserve the current hidden-until-
measured behavior, `onPositionReady` effect, and constrained offset helper.

- [ ] **Step 7: Run the focused tests and verify success**

Run the command from Step 4. Expected: both suites pass.

---

### Task 4: Propagate the mode through preview and export

**Files:**

- Modify every preview/export file listed under File structure.
- Update the preview, appearance, export-host, and sequential-export tests
  listed under Tests.

**Interfaces:**

- Consumes: the control-state mode from Task 2 and mode-aware overlay from
  Task 3.
- Produces: one `buttonIdentifierContentMode` prop used consistently by every
  preview and export surface.

- [ ] **Step 1: Update test fixtures to use the enum**

Replace runtime fixture properties such as:

```ts
showButtonIdentifiers: true
```

with:

```ts
buttonIdentifierContentMode: "both"
```

Keep `showButtonIdentifiers` only in the deliberate storage migration tests.

- [ ] **Step 2: Add failing preview/export parity assertions**

In `customize-screen-export-surfaces.test.tsx`, select each mode and assert the
same value reaches `QuickPanelPreview` and `ExportSurfaceHost`:

```ts
expect(mockPreviewProps).toMatchObject({
  buttonIdentifierContentMode: "icon",
});
expect(mockExportProps).toMatchObject({
  buttonIdentifierContentMode: "icon",
});
```

Verify the value remains shared after switching between Buttons-only and
Combined presets.

- [ ] **Step 3: Add failing export-readiness assertions**

Update `useSequentialExport` tests to require horizontal measurement for
`both` and `icon`, and image-only readiness for `none`:

```ts
const waitsForIdentifier = Boolean(
  buttonIdentifierContentMode !== "none"
  && identifier
  && getButtonIdentifierLayoutKind(identifier) === "horizontal",
);
```

- [ ] **Step 4: Add failing appearance-preview parity assertions**

Assert that the focused and overall appearance previews receive `icon` and do
not restore text while the user edits intensity, glyph color, or circle theme.

- [ ] **Step 5: Run affected tests and verify failure**

Run:

```bash
npm test -- --runInBand \
  __tests__/customize-screen-export-surfaces.test.tsx \
  __tests__/export-surfaces-position-readiness.test.tsx \
  __tests__/sequential-export.test.tsx \
  __tests__/focused-button-appearance-preview.test.tsx \
  __tests__/button-label-appearance-dialog.test.tsx
```

Expected: failures for the missing mode props and readiness behavior.

- [ ] **Step 6: Replace runtime boolean prop drilling**

Thread `buttonIdentifierContentMode` from `CustomizeScreen` through:

1. `CustomizePreviewSection`;
2. interactive and static `QuickPanelPreview`;
3. `QuickPanelPreviewStage` and `PanelSlice`;
4. `ButtonLabelAppearanceDialog`, focused preview, and overall preview; and
5. `ExportSurfaceHost` and `ExportSurface`.

Do not maintain a second derived visibility boolean in component state.

- [ ] **Step 7: Avoid mounting a hidden overlay**

In preview and export panel surfaces, render `ButtonIdentifierOverlay` only
when:

```ts
buttonIdentifierContentMode !== "none"
  && panel.family === "button"
  && panel.buttonIdentifier
```

Pass the exact mode to the overlay for `both` and `icon`.

- [ ] **Step 8: Update sequential export readiness**

Replace visibility checks with the mode expression from Step 3. Icon-only
horizontal output must wait for its measured placement. `none`, vertical,
single, and corner panels remain identifier-ready immediately.

- [ ] **Step 9: Run affected tests and verify success**

Run the command from Step 5. Expected: all affected suites pass.

---

### Task 5: Synchronize documentation and run verification

**Files:**

- Modify: `AGENTS.md`
- Modify: `docs/notes.md`
- Do not replace: `flow/advanced/buttons-only/12.webp`

- [ ] **Step 1: Update current behavior documentation**

Document that Buttons-only and Combined share a persisted
`Both / Icon / None` identifier content mode, that `Icon` retains dynamic
positioning, and that legacy visibility values migrate without clearing other
settings.

- [ ] **Step 2: Check obsolete runtime naming**

Run:

```bash
rg -n "showButtonIdentifiers" src __tests__
```

Expected: matches remain only in the storage legacy parser and its explicit
migration tests.

- [ ] **Step 3: Run focused feature verification**

Run:

```bash
npm test -- --runInBand \
  __tests__/storage.test.ts \
  __tests__/button-customize-controls-hook.test.ts \
  __tests__/button-customize-controls.test.tsx \
  __tests__/locales.test.ts \
  __tests__/button-identifier-overlay.test.tsx \
  __tests__/animated-button-identifier-visuals.test.tsx \
  __tests__/customize-screen-export-surfaces.test.tsx \
  __tests__/export-surfaces-position-readiness.test.tsx \
  __tests__/sequential-export.test.tsx \
  __tests__/focused-button-appearance-preview.test.tsx \
  __tests__/button-label-appearance-dialog.test.tsx
```

Expected: all focused suites pass.

- [ ] **Step 4: Run full automated verification**

Run each command separately:

```bash
npm test -- --runInBand
npm run lint
npx tsc --noEmit
git diff --check
git status --short
```

Expected: Jest, lint, TypeScript, and diff checks pass. `git status --short`
must retain the user's installed AniUI changes alongside the intended feature
changes.

- [ ] **Step 5: Report evidence and manual boundary**

Report focused and full automated results separately. State explicitly that no
physical Samsung, QuickStar, signed artifact, Play, or store QA was run.

Provide the user with this manual acceptance scope:

- Buttons-only and Combined show the same persisted selection.
- `Icon` removes horizontal and corner text.
- Horizontal Icon-only reaches the right safe edge at `100`.
- Returning to `Both` at `100` moves the icon left enough to retain the text.
- `None` exports artwork without icon or text.
- Preview, exported PNG, and QuickStar output correspond.
- Existing vertical, square, color, intensity, and position behavior remains
  intact.

