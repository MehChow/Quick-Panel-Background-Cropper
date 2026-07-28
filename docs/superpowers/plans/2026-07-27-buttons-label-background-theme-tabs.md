# Buttons Label Background Theme and Slider Tabs Handoff

> **For the next session:** Use `superpowers:executing-plans` inline. Project
> instructions prohibit subagents, commits, and pushes.

**Status:** Design approved; implementation has not started.

**Goal:** Give users an explicit Light/Dark choice for the Button identifier
circle background and replace the dialog's two stacked sliders with one compact
Brightness/Intensity tabbed slider card.

**Design contract:**
`docs/superpowers/specs/2026-07-27-buttons-label-color-picker-design.md`

**Supersedes:** The automatic contrast-circle behavior and stacked slider layout
in `docs/superpowers/plans/2026-07-27-buttons-label-color-picker.md`. Keep the
rest of that completed color-picker implementation intact.

## Approved behavior

- The selected HEX color continues to control both the icon glyph and label.
- The new toggle controls only the circular icon background:
  - `light` -> `#FFFFFF`
  - `dark` -> `#666666`
- Default to `dark` when the setting is missing or invalid.
- Put a 44-point sun/moon toggle beside the HEX input, matching the visual
  relationship of Show labels and its palette button.
- Put Brightness and Intensity in one shared slider card with two tabs, matching
  the Customize-page adjustment tabs. Render only the active slider.
- Show the active slider percentage without sending continuous picker changes
  through React state.
- Theme changes update the dialog preview immediately. Cancel discards all draft
  changes; Confirm saves HEX color, intensity, and background theme together.
- Main preview and exports use only the committed theme and must match.
- Do not update flow screenshots in this pass.

## Task 1: Replace automatic contrast with a persisted theme

**Modify:**

- `src/features/quick-panel/customize/button-identifier-color.ts`
- `src/features/quick-panel/store/storage.ts`
- `src/features/quick-panel/customize/hooks/useButtonCustomizeControls.ts`
- `__tests__/button-identifier-color.test.ts`
- `__tests__/storage.test.ts`
- `__tests__/button-customize-controls-hook.test.ts`

Add:

```ts
export type ButtonIdentifierBackgroundTheme = "light" | "dark";

export interface ButtonIdentifierAppearance {
  backgroundTheme: ButtonIdentifierBackgroundTheme;
  color: string;
  opacity: number;
}

export const defaultButtonIdentifierBackgroundTheme = "dark";

export function normalizeButtonIdentifierBackgroundTheme(
  value: unknown,
): ButtonIdentifierBackgroundTheme | null;

export function getButtonIdentifierBackgroundColor(
  theme: ButtonIdentifierBackgroundTheme,
): "#FFFFFF" | "#666666";
```

Delete `getButtonIdentifierCircleColor` and
`getButtonIdentifierCircleColorWorklet`; circle color must no longer depend on
HEX luminance. Persist `buttonIdentifierBackgroundTheme` in the existing
`quick-panel.button-customize-settings` object. Parse only the new field and
fall back to `dark`; do not add a migration or revive the old
`buttonIdentifierTheme` field.

Update `setButtonIdentifierAppearance` so a single write saves normalized color,
clamped opacity, and background theme while preserving unrelated settings.
Write failing tests first, then implement.

## Task 2: Thread the committed theme through preview and export

**Modify:**

- `src/features/quick-panel/customize/components/ButtonIdentifierVisuals.tsx`
- `src/features/quick-panel/customize/components/ButtonIdentifierOverlay.tsx`
- `src/features/quick-panel/customize/components/PanelSlice.tsx`
- `src/features/quick-panel/customize/components/QuickPanelPreviewStage.tsx`
- `src/features/quick-panel/customize/components/QuickPanelPreview.tsx`
- `src/features/quick-panel/customize/components/CustomizePreviewSection.tsx`
- `src/features/quick-panel/customize/components/ButtonCustomizeControls.tsx`
- `src/features/quick-panel/customize/CustomizeScreen.tsx`
- `src/features/quick-panel/customize/components/ExportSurfaceHost.tsx`
- `src/features/quick-panel/customize/components/ExportSurface.tsx`
- `__tests__/button-identifier-overlay.test.tsx`
- `__tests__/animated-button-identifier-visuals.test.tsx`
- `__tests__/customize-screen-export-surfaces.test.tsx`

Add a static `buttonIdentifierBackgroundTheme` prop along the existing color and
opacity path. Resolve the circle fill with
`getButtonIdentifierBackgroundColor(theme)` at the visual boundary. Keep the
chosen HEX color on the glyph and label.

The palette button in `ButtonCustomizeControls` must also use the committed
theme for its circle preview. Add parity tests proving Light is white, Dark is
`#666666`, changing HEX does not change the circle, and the same committed
values reach main preview and export.

## Task 3: Make the dialog draft transactional for theme

**Modify:**

- `src/features/quick-panel/customize/hooks/useButtonLabelAppearanceDraft.ts`
- `src/features/quick-panel/customize/components/ButtonLabelAppearanceDialog.tsx`
- `__tests__/button-label-appearance-dialog.test.tsx`

Initialize the draft hook with committed color, opacity, and background theme.
Keep the existing animated `circleColor` shared value for the preview, but set
it from the discrete theme helper instead of the live HEX picker. Expose:

```ts
backgroundTheme: ButtonIdentifierBackgroundTheme;
handleBackgroundThemeChange: (
  theme: ButtonIdentifierBackgroundTheme,
) => void;
```

The handler may update React state for this discrete tap and must immediately
update the circle shared value. `readConfirmedAppearance()` must return all
three values. Confirm persists once; Cancel performs no write.

Cover initial state, immediate draft preview, Cancel, Confirm, and reopen after
both paths.

## Task 4: Build the tabbed slider card and HEX-row toggle

**Create:**

- `src/features/quick-panel/customize/components/ButtonLabelAdjustmentTabs.tsx`
- `src/features/quick-panel/customize/components/ButtonIdentifierBackgroundThemeToggle.tsx`

**Modify:**

- `src/features/quick-panel/customize/components/ButtonLabelColorPicker.tsx`
- `src/features/quick-panel/customize/components/ButtonLabelAppearanceDialog.tsx`
- `src/i18next/locales/en.ts`
- `src/i18next/locales/zh.ts`
- `__tests__/button-label-appearance-dialog.test.tsx`
- `__tests__/locales.test.ts`

Inside the existing `ColorPicker`, use AniUI `Tabs`, `TabsList`,
`TabsTrigger`, and `TabsContent`, following `ButtonAdjustmentTabs.tsx`.
Provide `brightness` and `intensity` tabs and mount only the active
`BrightnessSlider` or `OpacitySlider`. Keep the slim track and existing picker
thumb styling. Read the active percentage from the color-picker shared values
and render it with Reanimated props/text so drag frames do not call React
`setState`.

Move the HEX label above a horizontal row containing:

- the existing HEX input with `flex: 1`;
- a 44 x 44 accessible theme toggle using a sun for Light and moon for Dark.

The toggle should visually show its selected white or `#666666` circle
background and have localized accessibility text that states the current
choice. Keep keyboard avoidance, the high-contrast dialog surface, and the
white Cancel button unchanged.

Tests must assert tab switching leaves exactly one slider visible, both picker
values remain intact across switches, the toggle is beside the HEX field, and
the toggle changes only the circle preview.

## Task 5: Update durable docs and verify

**Modify:**

- `docs/v3_changelog.md`
- `docs/notes.md`

Document the manual Light/Dark circle background, Dark default, and shared
Brightness/Intensity slider card. Do not change screenshots.

Run focused tests:

```bash
npm test -- --runInBand --no-cache \
  __tests__/button-identifier-color.test.ts \
  __tests__/storage.test.ts \
  __tests__/button-customize-controls-hook.test.ts \
  __tests__/button-identifier-overlay.test.tsx \
  __tests__/animated-button-identifier-visuals.test.tsx \
  __tests__/button-label-appearance-dialog.test.tsx \
  __tests__/customize-screen-export-surfaces.test.tsx \
  __tests__/locales.test.ts
```

Then run:

```bash
npm test -- --runInBand
npm run lint
npx tsc --noEmit
npx expo export --platform android --output-dir /tmp/qpbc-button-label-theme-tabs-export
git diff --check
rg -n "getButtonIdentifierCircleColor|getButtonIdentifierCircleColorWorklet" src __tests__
rg -n "buttonIdentifierBackgroundTheme|getButtonIdentifierBackgroundColor" src __tests__
```

The first `rg` should return no matches. The second should show the complete
storage -> controls -> preview/dialog -> export path and its tests.

Manual Android QA:

1. Open the label appearance dialog and switch Light/Dark; only circle
   backgrounds change.
2. Change HEX; glyphs and labels change while the chosen circle theme remains.
3. Switch Brightness/Intensity tabs and confirm both values remain controllable.
4. Open the HEX keyboard and verify the input/toggle row remains visible.
5. Cancel and reopen; committed values remain.
6. Confirm and reopen; all three values persist.
7. Export multiple Buttons and compare them with the committed main preview.

Do not stage, commit, push, or capture replacement screenshots.
