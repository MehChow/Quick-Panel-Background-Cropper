# Buttons Identifier Overlay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans`. Execute inline only; do not use subagents.

**Goal:** Add optional, opacity-adjustable white Button identifiers to Buttons-only previews and exports, with responsive placement and required icon selection for custom labels.

**Architecture:** Extend the Button catalog and calibration model with stable icon metadata, then derive grid-span metadata when creating the Buttons preset. A pure layout module calculates preview/export-specific bounds and sizes, while one shared overlay component renders the white icon and optional label in both paths. Customize owns non-persisted visibility and opacity state.

**Tech Stack:** Expo 56, React Native 0.85, TypeScript 6, Zustand, MMKV, `@react-native-vector-icons/lucide`, AniUI, Uniwind, Jest, React Native Testing Library, `react-native-view-shot`.

## Global Constraints

- Before implementation, read <https://docs.expo.dev/versions/v56.0.0/>.
- Work inline only. Do not use subagents or a browser demo.
- Never run `git commit` or `git push`; provide suggested commit messages only.
- Add no dependencies. Do not change Default or Advanced Controls rendering.
- Preserve released calibration/preferences. Buttons-only is unreleased, so no legacy custom-icon fallback is required.
- Identifier controls reset to enabled and `70%` on each Customize visit; color stays `#FFFFFF`.
- Keep Button image intensity independent at its existing screen-local `78%` default.
- Do not use `useMemo`, `useCallback`, or `React.memo` outside AniUI.
- Keep new/materially changed component files under 150 lines; use interfaces and avoid `any`.
- Record deliberately arbitrary mappings in `docs/notes.md` and the completion summary. The initial map below has none.

## File Structure

**Create:**

- `src/features/quick-panel/calibration/advanced/button-selection.ts`
- `src/features/quick-panel/calibration/advanced/components/CustomButtonIconDialog.tsx`
- `src/features/quick-panel/model/button-identifier-layout.ts`
- `src/features/quick-panel/customize/components/ButtonIdentifierOverlay.tsx`
- `src/features/quick-panel/customize/components/ButtonCustomizeControls.tsx`
- Tests: `button-selection.test.ts`, `custom-button-icon-dialog.test.tsx`, `button-identifier-layout.test.ts`, `button-identifier-overlay.test.tsx`, `button-customize-controls.test.tsx`

**Modify:**

- Model/store: `button-labels.ts`, `types.ts`, `storage.ts`, `buttons-geometry.ts`
- Calibration UI: `ButtonPanelSelection.tsx`
- Rendering: `PanelSlice.tsx`, `QuickPanelPreview.tsx`, `ExportSurface.tsx`, `ExportSurfaces.tsx`
- Customize UI: `CustomizeScreen.tsx`, English/Chinese locales
- Existing tests: button labels, storage, advanced calibration state, export files, panel intensity, Customize/export mounting, locales
- Documentation: `docs/notes.md`

---

### Task 1: Add stable icon metadata and custom-icon persistence

**Files:**

- Modify: `src/features/quick-panel/model/button-labels.ts:1-119`
- Modify: `src/features/quick-panel/model/types.ts:1-91`
- Modify: `src/features/quick-panel/store/storage.ts:198-238`
- Test: `__tests__/button-labels.test.ts`, `__tests__/storage.test.ts`, `__tests__/advanced-calibration-state.test.ts`, `__tests__/export-files.test.ts`

**Interfaces:**

- Produces `CustomButtonIconId`, `customButtonIconChoices`, `getBuiltInButtonLabel()`, `getButtonIconName()`, `isCustomButtonIconId()`.
- Adds `ButtonCalibrationItem.customIconId: CustomButtonIconId | null`.
- Adds optional `PanelDefinition.buttonIdentifier: ButtonIdentifierDefinition`.

- [ ] **Step 1: Write failing tests**

Add catalog tests that every built-in has a non-empty stable icon, custom choices equal `star`, `zap`, `home`, `app-window`, built-ins ignore `customIconId`, custom labels require it, and invalid custom icon IDs are rejected. Update all built-in Button fixtures with `customIconId: null`; add a storage round-trip custom fixture with `customIconId: "star"` and an invalid fixture with the field omitted.

```ts
it("assigns a stable icon to every built-in label", () => {
  for (const item of buttonLabelCatalog) {
    expect(item.iconName).toBeTruthy();
    expect(getButtonIconName(item.label, null)).toBe(item.iconName);
  }
});

it("requires an icon for custom labels", () => {
  expect(() => getButtonIconName("My scene", null)).toThrow(
    "Custom Button My scene has no icon",
  );
  expect(getButtonIconName("My scene", "zap")).toBe("zap");
});
```

- [ ] **Step 2: Verify failure**

```bash
npm test -- --runInBand __tests__/button-labels.test.ts __tests__/storage.test.ts __tests__/advanced-calibration-state.test.ts __tests__/export-files.test.ts
```

Expected: FAIL on missing icon APIs/model fields.

- [ ] **Step 3: Implement the catalog**

Import `LucideIconName` as a type. Add this complete map:

```ts
const builtInButtonIconNames: Record<string, LucideIconName> = {
  "wi-fi": "wifi",
  bluetooth: "bluetooth",
  "auto-rotate": "rotate-cw",
  flashlight: "flashlight",
  sound: "volume-2",
  "airplane-mode": "plane",
  location: "map-pin",
  "mobile-data": "antenna",
  hotspot: "radio-tower",
  "power-saving": "battery-charging",
  "smart-view": "monitor-up",
  "nearby-devices": "radar",
  "eye-comfort-shield": "eye",
  "do-not-disturb": "circle-minus",
  "link-to-windows": "monitor-smartphone",
  "quick-share": "share-2",
  nfc: "nfc",
  "wireless-power-sharing": "battery-charging",
  "screen-recorder": "video",
  screenshot: "scan-line",
  modes: "sliders-horizontal",
  "device-control": "settings-2",
  "music-share": "music-2",
  "dolby-atmos": "audio-lines",
  "extra-dim": "sun-dim",
  "secure-folder": "folder-lock",
  "always-on-display": "clock-3",
  sync: "refresh-cw",
  kids: "baby",
  "scan-qr-code": "scan-qr-code",
  "video-call-effects": "video",
  "live-caption": "captions",
  "call-caption": "message-square-text",
  "microphone-mode": "mic-2",
  "performance-profile": "gauge",
  "battery-protect": "shield-check",
  "bluetooth-tethering": "bluetooth",
  "ultra-wideband": "radio",
  "data-saver": "database",
  vpn: "shield",
  "focus-mode": "focus",
  "bedtime-mode": "bed-double",
  "screen-cast": "cast",
  dex: "monitor",
  smartthings: "house-plug",
  "one-handed-mode": "hand",
  "touch-sensitivity": "pointer",
  "color-inversion": "contrast",
  "color-correction": "palette",
  "reduce-brightness": "sun-dim",
  accessibility: "accessibility",
  "camera-access": "camera",
  "microphone-access": "mic",
  "private-share": "lock-keyhole",
  "nearby-share": "send",
  "work-profile": "briefcase-business",
  "usb-tethering": "usb",
  storage: "hard-drive",
  "hotspot-2-0": "radio-tower",
};

export const customButtonIconChoices = [
  { id: "star", translationKey: "advancedCalibration.customIconStar" },
  { id: "zap", translationKey: "advancedCalibration.customIconZap" },
  { id: "home", translationKey: "advancedCalibration.customIconHome" },
  { id: "app-window", translationKey: "advancedCalibration.customIconAppWindow" },
] as const;
```

Add `iconName` to `BuiltInButtonLabel`, fail fast if a catalog ID lacks a map entry, and export:

```ts
export type CustomButtonIconId = (typeof customButtonIconChoices)[number]["id"];

export function getBuiltInButtonLabel(label: string) {
  return buttonLabelsByCanonicalLabel.get(label) ?? null;
}

export function isCustomButtonIconId(value: unknown): value is CustomButtonIconId {
  return customButtonIconChoices.some((choice) => choice.id === value);
}

export function getButtonIconName(
  label: string,
  customIconId: CustomButtonIconId | null,
): LucideIconName {
  const builtIn = getBuiltInButtonLabel(label);
  if (builtIn) return builtIn.iconName;
  if (customIconId) return customIconId;
  throw new Error(`Custom Button ${label} has no icon`);
}
```

- [ ] **Step 4: Extend types and strict unreleased parser**

Add:

```ts
export interface ButtonIdentifierDefinition {
  columnSpan: number;
  iconName: LucideIconName;
  rowSpan: number;
}
```

Add `buttonIdentifier?` to `PanelDefinition` and `customIconId` to `ButtonCalibrationItem`. In `parseButtonItems`, require `customIconId === null` for catalog labels and `isCustomButtonIconId(customIconId)` for custom labels. Missing fields invalidate only the unreleased `advancedButtons` branch; keep the current MMKV key and other branches untouched.

- [ ] **Step 5: Verify and checkpoint**

Run the Step 2 command, `npx tsc --noEmit`, and `git diff --check`. Expected: PASS. Do not commit.

Suggested commit message: `feat: add Button icon metadata`

---

### Task 2: Require a custom icon through a dialog

**Files:**

- Create: `src/features/quick-panel/calibration/advanced/button-selection.ts`
- Create: `src/features/quick-panel/calibration/advanced/components/CustomButtonIconDialog.tsx`
- Modify: `src/features/quick-panel/calibration/advanced/components/ButtonPanelSelection.tsx:1-145`
- Modify: `i18next/locales/en.ts`, `i18next/locales/zh.ts`
- Test: `__tests__/button-selection.test.ts`, `__tests__/custom-button-icon-dialog.test.tsx`, `__tests__/locales.test.ts`

**Interfaces:** Consumes Task 1 types; produces `createButtonItems()` and `CustomButtonIconDialog`.

- [ ] **Step 1: Write failing tests**

Test that rebuilt items preserve reviewed order and custom icons:

```ts
expect(createButtonItems([
  { label: "Wi-Fi", customIconId: null },
  { label: "My scene", customIconId: "zap" },
], outerRect)).toMatchObject([
  { id: "button-1", label: "Wi-Fi", customIconId: null },
  { id: "button-2", label: "My scene", customIconId: "zap" },
]);
```

Render the dialog, press the accessible Zap choice, and expect `onSelect("zap")`. In a second test, press Cancel and expect `onClose` without `onSelect`.

- [ ] **Step 2: Verify failure**

```bash
npm test -- --runInBand __tests__/button-selection.test.ts __tests__/custom-button-icon-dialog.test.tsx __tests__/locales.test.ts
```

- [ ] **Step 3: Extract selection rebuilding**

Move the current two-column/8 px-gap rectangle creation unchanged into `button-selection.ts`:

```ts
export interface ButtonSelectionChoice {
  customIconId: CustomButtonIconId | null;
  label: string;
}

export function createButtonItems(
  choices: ButtonSelectionChoice[],
  outerRect: PanelRect,
): ButtonCalibrationItem[] {
  return choices.map((choice, index) => ({
    ...choice,
    id: `button-${index + 1}` as ButtonPanelId,
    rect: getInitialButtonRect(index, choices.length, outerRect),
  }));
}
```

- [ ] **Step 4: Build and wire the dialog**

Use AniUI `AlertDialog`, four accessible Lucide Pressables, and this contract:

```ts
interface CustomButtonIconDialogProps {
  label: string;
  onClose: () => void;
  onSelect: (iconId: CustomButtonIconId) => void;
  open: boolean;
}
```

In `ButtonPanelSelection`, built-ins add `{ label, customIconId: null }`. Tapping the custom Add row only sets `pendingCustomLabel` and opens the dialog. Selecting adds `{ label, customIconId }`, clears the query, and closes. Cancel changes nothing. Preserve duplicate prevention and chip removal.

- [ ] **Step 5: Add locale copy**

Add `customIconDialogTitle`, `customIconDialogBody`, `customIconStar`, `customIconZap`, `customIconHome`, and `customIconAppWindow` in English and natural Traditional Chinese. Extend locale tests.

- [ ] **Step 6: Verify and checkpoint**

Run the Step 2 command, `npx tsc --noEmit`, `git diff --check`, and confirm both new files are under 150 lines. Expected: PASS. Do not commit.

Suggested commit message: `feat: require custom Button icons`

---

### Task 3: Calculate responsive preview/export layouts

**Files:**

- Create: `src/features/quick-panel/model/button-identifier-layout.ts`
- Modify: `src/features/quick-panel/calibration/advanced/buttons-geometry.ts:13-35`
- Test: `__tests__/button-identifier-layout.test.ts`, `__tests__/export-files.test.ts`

**Interfaces:** Produces `getButtonGridSpan()`, `getButtonExportBounds()`, `getButtonIdentifierLayout()`, and preset `buttonIdentifier` metadata.

- [ ] **Step 1: Write failing pure tests**

Cover `1x1 -> center/icon-only`, vertical span -> top/icon-only, horizontal and `2x2` -> left/icon+label, preview/export absolute sizes differing, and horizontal/vertical export bounds occupying only the centered visible sub-rectangle.

- [ ] **Step 2: Verify failure**

```bash
npm test -- --runInBand __tests__/button-identifier-layout.test.ts __tests__/export-files.test.ts
```

- [ ] **Step 3: Implement geometry**

Define `ButtonIdentifierBounds`, alignment/render-target unions, and a layout result containing bounds, alignment, showLabel, iconSize, fontSize, gap, inset, maxLabelWidth, and `minimumFontScale: 0.7`.

Derive spans with nearest-cell rounding: `columnSpan = round(rect.width / (outerRect.width / grid.columns))` and the equivalent row formula. Clamp each result from `1` through its configured axis count. Classify `1x1` first, then `rowSpan > columnSpan` as vertical, otherwise roomy.

Use these exact initial tuning values:

```ts
const targetSizing = {
  preview: {
    icon: [0.34, 12, 28], font: [0.18, 9, 16],
    gap: [0.08, 4, 10], inset: [0.14, 6, 18],
  },
  export: {
    icon: [0.34, 18, 96], font: [0.18, 14, 56],
    gap: [0.08, 8, 32], inset: [0.14, 12, 48],
  },
} as const;
```

Each tuple is `[shortSideFactor, min, max]`. For roomy layouts, calculate `maxLabelWidth = max(0, width - inset * 2 - iconSize - gap)`.

Map export bounds into the square crop exactly:

```ts
const square = getExportSquareRect(panel);
const scale = side / square.width;
return {
  x: (panel.rect.x - square.x) * scale,
  y: (panel.rect.y - square.y) * scale,
  width: panel.rect.width * scale,
  height: panel.rect.height * scale,
};
```

- [ ] **Step 4: Attach preset metadata**

In `createButtonsPreset`, add:

```ts
buttonIdentifier: {
  ...getButtonGridSpan(button.rect, calibration.outerRect, calibration.grid),
  iconName: getButtonIconName(button.label, button.customIconId),
},
```

Extend export tests to assert built-in `wifi`, selected custom icon, grid spans, localized labels, and unchanged filenames/order.

- [ ] **Step 5: Verify and checkpoint**

Run the Step 2 command, `npx tsc --noEmit`, and `git diff --check`. Expected: PASS. Do not commit.

Suggested commit message: `feat: calculate Button identifier layouts`

---

### Task 4: Render one shared identifier overlay in preview and export

**Files:**

- Create: `src/features/quick-panel/customize/components/ButtonIdentifierOverlay.tsx`
- Modify: `src/features/quick-panel/customize/components/PanelSlice.tsx`
- Modify: `src/features/quick-panel/customize/components/QuickPanelPreview.tsx`
- Modify: `src/features/quick-panel/customize/components/ExportSurface.tsx`
- Modify: `src/features/quick-panel/customize/components/ExportSurfaces.tsx`
- Test: `__tests__/button-identifier-overlay.test.tsx`
- Modify test: `__tests__/panel-image-intensity.test.tsx`

**Interface:**

```ts
interface ButtonIdentifierOverlayProps {
  bounds: ButtonIdentifierBounds;
  identifier: ButtonIdentifierDefinition;
  label: string;
  opacity: number;
  target: ButtonIdentifierRenderTarget;
}
```

- [ ] **Step 1: Write failing component tests**

Mock the Lucide glyph as a React Native `Text` node with a stable test ID. Assert all of the following:

- `1x1` uses a centered icon and omits the label.
- A vertical panel uses a top-centered icon and omits the label.
- A roomy panel uses a left-centered icon plus the localized label.
- Opacity is applied once to the identifier wrapper and the icon/text color is fixed to `#FFFFFF`.
- Roomy text has `numberOfLines={1}`, `adjustsFontSizeToFit`, `minimumFontScale={0.7}`, `ellipsizeMode="tail"`, and `allowFontScaling={false}`.
- Existing Button image opacity remains controlled only by the image-intensity value.

- [ ] **Step 2: Verify failure**

```bash
npm test -- --runInBand __tests__/button-identifier-overlay.test.tsx __tests__/panel-image-intensity.test.tsx
```

- [ ] **Step 3: Implement the shared overlay**

Render an absolute, pointer-events-none root within the supplied bounds. Apply identifier opacity on that root so the icon and label fade together. Use the Task 3 layout helper for center, top-center, or left-center placement.

Use fixed white icon/text with a subtle dark shadow (`rgba(0, 0, 0, 0.45)`, offset `{ width: 0, height: 1 }`, radius `2`). Do not add a capsule, scrim, or background behind the identifier.

- [ ] **Step 4: Thread preview and export props through both render paths**

Add `showButtonIdentifiers` and `buttonIdentifierOpacity` to the preview/export component interfaces.

- In preview, `PanelSlice` is already positioned at the panel origin, so supply local bounds `{ x: 0, y: 0, width: panel.rect.width * layoutScale, height: panel.rect.height * layoutScale }`. Render the identifier after the image but before the existing `PanelOverlay`.
- In export, calculate bounds with `getButtonExportBounds()` so horizontal and vertical panels position the identifier inside their visible panel sub-rectangle, not the whole 1024-square crop. Render after the image.
- Render only when the panel family is Buttons, `buttonIdentifier` exists, and the toggle is enabled. Controls behavior must remain unchanged.

Do not change export-readiness gating initially: Lucide already renders in navigation before Customize. During device QA, explicitly verify that the icon appears on the first export; add font preloading to readiness only if that check exposes a real race.

- [ ] **Step 5: Verify and checkpoint**

Run the Step 2 command, `npx tsc --noEmit`, and `git diff --check`. Expected: PASS. Keep each new component under 150 lines. Do not commit.

Suggested commit message: `feat: render Button identifiers`

---

### Task 5: Add screen-local identifier controls to Customize

**Files:**

- Create: `src/features/quick-panel/customize/components/ButtonCustomizeControls.tsx`
- Modify: `src/features/quick-panel/customize/CustomizeScreen.tsx`
- Modify: `i18next/locales/en.ts`
- Modify: `i18next/locales/zh.ts`
- Test: `__tests__/button-customize-controls.test.tsx`
- Modify test: `__tests__/customize-screen-export-surfaces.test.tsx`
- Modify test: `__tests__/locales.test.ts`

**Interface:**

```ts
interface ButtonCustomizeControlsProps {
  buttonIdentifierOpacity: number;
  buttonPanelOpacity: number;
  onButtonIdentifierOpacityChange: (value: number) => void;
  onButtonPanelOpacityChange: (value: number) => void;
  onShowButtonIdentifiersChange: (value: boolean) => void;
  showButtonIdentifiers: boolean;
}
```

- [ ] **Step 1: Write failing control and integration tests**

For the extracted controls, assert:

- The existing image-intensity slider receives its supplied value unchanged.
- The identifier toggle exposes `accessibilityRole="switch"` and the correct checked state.
- The identifier slider starts at 70 and is enabled while the toggle is on.
- Pressing the toggle calls `onShowButtonIdentifiersChange(false)`.
- While off, the identifier slider remains mounted but is visibly dimmed and disabled.

At the screen level, mount a Buttons preset and assert preview/export both initially receive `showButtonIdentifiers=true`, identifier opacity `0.7`, and image opacity `0.78`. Exercise the controls and assert preview/export update together without changing image opacity. Unmount and remount to confirm the toggle and identifier slider reset to enabled/70 for a new screen visit.

- [ ] **Step 2: Verify failure**

```bash
npm test -- --runInBand __tests__/button-customize-controls.test.tsx __tests__/customize-screen-export-surfaces.test.tsx __tests__/locales.test.ts
```

- [ ] **Step 3: Extract the Buttons controls**

Move the current Button image-intensity row from `CustomizeScreen` into `ButtonCustomizeControls` without changing its label, default, or behavior. Add an AniUI-consistent pressable On/Off switch row and the second slider below it. Keep the identifier slider mounted and preserve its current value while the toggle is off; only disable and dim it.

Use these English keys and copy:

```ts
showButtonIdentifiers: "Show Button identifiers",
buttonIdentifierOpacity: "Button identifier intensity",
buttonIdentifiersOn: "On",
buttonIdentifiersOff: "Off",
```

Add natural Traditional Chinese equivalents and extend locale parity tests.

- [ ] **Step 4: Add non-persisted Customize state**

Initialize exactly:

```ts
const DEFAULT_BUTTON_PANEL_OPACITY = 78;
const DEFAULT_BUTTON_IDENTIFIER_OPACITY = 70;

const [buttonPanelOpacity, setButtonPanelOpacity] = useState(DEFAULT_BUTTON_PANEL_OPACITY);
const [buttonIdentifierOpacity, setButtonIdentifierOpacity] = useState(
  DEFAULT_BUTTON_IDENTIFIER_OPACITY,
);
const [showButtonIdentifiers, setShowButtonIdentifiers] = useState(true);
```

Render the extracted controls only when the preset contains Button panels. Normalize the identifier slider to `0...1` before passing it to both `QuickPanelPreview` and `ExportSurfaces`.

Do not add MMKV, Zustand fields, storage parsing, or any persistence for these Customize choices. Leaving and re-entering Customize intentionally resets them to enabled and 70.

- [ ] **Step 5: Verify and checkpoint**

Run the Step 2 command, `npx tsc --noEmit`, and `git diff --check`. Expected: PASS. Confirm `CustomizeScreen.tsx` and the new component are each under 150 lines. Do not commit.

Suggested commit message: `feat: control Button identifier visibility`

---

### Task 6: Document decisions and verify the complete flow

**Files:**

- Modify: `docs/notes.md`
- Review: `docs/superpowers/specs/2026-07-17-buttons-identifier-overlay-design.md`

- [ ] **Step 1: Record the final implementation decisions**

Add a dated `docs/notes.md` section covering the shape rules, screen-local default-enabled toggle, 70% identifier intensity, fixed white treatment, separate preview/export sizing, and the four custom choices: Star, Zap, Home, and App Window.

List every built-in label that ultimately received an arbitrary rather than semantically suitable icon. The initial Task 1 mapping has no intentionally arbitrary entries; write `None` if implementation keeps that mapping unchanged. If any mapping changes during implementation because Lucide lacks the proposed glyph or device rendering is unclear, record the exact label and final icon here and include it in the implementation handoff.

- [ ] **Step 2: Run focused regression tests**

```bash
npm test -- --runInBand \
  __tests__/button-labels.test.ts \
  __tests__/storage.test.ts \
  __tests__/advanced-calibration-state.test.ts \
  __tests__/custom-button-icon-dialog.test.tsx \
  __tests__/button-identifier-layout.test.ts \
  __tests__/export-files.test.ts \
  __tests__/button-identifier-overlay.test.tsx \
  __tests__/panel-image-intensity.test.tsx \
  __tests__/button-customize-controls.test.tsx \
  __tests__/customize-screen-export-surfaces.test.tsx \
  __tests__/locales.test.ts
```

Expected: PASS with no snapshot or console-warning regressions.

- [ ] **Step 3: Run the full automated verification**

```bash
npm test -- --runInBand
npm run lint
npx tsc --noEmit
git diff --check
```

Expected: all commands exit zero.

- [ ] **Step 4: Perform physical-device QA**

Use a connected Samsung device and the existing Buttons-only flow; keep the verification text-only and do not use a browser demo.

1. Create built-in `1x1`, vertical, horizontal, and `2x2` Buttons plus one custom Button.
2. Verify adding a custom Button opens the four-icon dialog, confirming adds the chosen icon, and canceling adds nothing.
3. Enter Customize and verify Button image intensity is 78%, identifiers are enabled, and identifier intensity is 70%.
4. Confirm the live preview follows the exact icon-only/icon-plus-text placement rules for every shape.
5. Check identifier intensity at 0%, 70%, and 100%: white icon/text change opacity together while the artwork slider remains independent.
6. Turn identifiers off and confirm clean artwork; turn them back on and confirm the previous slider value is preserved within that visit.
7. Export, apply the images in Good Lock, and verify identifiers land inside the actual visible Button region. Confirm Lucide appears on the first export attempt.
8. Leave and reopen Customize; confirm the toggle resets on and identifier intensity resets to 70%.

Record the device model, One UI version, QuickStar version, and any arbitrary icon mapping in the completion notes.

- [ ] **Step 5: Final spec/diff review**

Compare the completed diff against every requirement in the design spec. Confirm Controls-only output, filenames/order, calibration data, and released local data are unchanged. Confirm all new component files are under 150 lines and no `useMemo`, `useCallback`, `React.memo`, `any`, commit, or push was introduced.

Do not commit or push. Hand the verified working tree back to the user with the test results, device-QA result, and any arbitrary mappings.

Suggested commit message: `feat: add Button identifier overlays`
