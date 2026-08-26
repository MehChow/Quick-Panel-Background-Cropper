# Custom Labels with Preset Button Icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:executing-plans` to execute this plan inline task-by-task. This
> repository forbids sub-agent workflows and Git commits by the agent. Steps
> use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a custom Button label reuse any of the 30 preset Button icons and
announce the feature once in v1.6.0 with temporary bundled media.

**Architecture:** Broaden the existing `CustomButtonIconId` union and validator
without changing the persisted `customIconId` field, then present the preset
and generic catalogs through the existing uncontrolled AniUI Tabs component.
Keep the release work descriptor-driven: advance the isolated announcement ID,
add exact bilingual copy, and use one stable image path whose temporary app
icon is replaced in place before the release candidate.

**Tech Stack:** Expo 56, React Native 0.85, TypeScript 6, Uniwind, AniUI Tabs,
`@react-native-vector-icons/lucide`, expo-image, i18next, MMKV, Jest, React
Native Testing Library

**Spec:**
`docs/superpowers/specs/2026-08-25-custom-label-preset-icons-design.md`

## Global Constraints

- Keep the 30 preset Button mappings and order unchanged.
- Keep the 24 generic custom-icon IDs and order unchanged.
- Preserve the persisted `customIconId` property and all existing calibration
  payloads; do not add a migration or reset.
- Canonical built-in labels continue requiring `customIconId: null`; only
  literal custom labels may persist a selected preset glyph.
- Add no `labelOverride`, canonical-ID link, edit mode, search state,
  dependency, or unrelated refactor.
- Keep production component files below 150 lines.
- Use interfaces for props; avoid `any`, `useMemo`, `useCallback`, and
  `React.memo` outside AniUI.
- Use the exact v1.6.0 announcement ID and bilingual copy from the spec.
- Preserve the existing release-announcement acknowledgement key, global host,
  no-navigation behavior, calibrations, and unrelated preferences.
- Use `assets/announcement/v1_6_0.webp` as the stable media path. The temporary
  app-icon copy is development-only and must be replaced by the supplied
  feature screenshot before the release candidate.
- Leave physical-device, phone-size, visual, fresh-install, upgrade, and
  preview/export QA to the user.
- Do not change Expo/app versions, Android `versionCode`, release build files,
  store listing copy, or dependencies.
- Do not commit or push.

---

### Task 1: Broaden the selectable custom-label icon contract

**Files:**

- Modify: `__tests__/button-labels.test.ts`
- Modify: `__tests__/button-selection.test.ts`
- Modify: `__tests__/storage.test.ts`
- Modify: `__tests__/export-files.test.ts`
- Modify: `src/features/quick-panel/model/button-labels.ts:48-175`
- Verify unchanged consumer:
  `src/features/quick-panel/model/types.ts:75-80`
- Verify unchanged consumer:
  `src/features/quick-panel/calibration/advanced/button-selection.ts:1-16`
- Verify parser consumption:
  `src/features/quick-panel/store/storage.ts:465-502`

**Interfaces:**

- Consumes: `builtInButtonIconNames`, `buttonLabelCatalog`, and the existing
  24-item `customButtonIconChoices`
- Produces: `CustomButtonIconId`, the union of all generic and preset glyph
  IDs; `isCustomButtonIconId(value: unknown): value is CustomButtonIconId`
- Preserves: `ButtonCalibrationItem.customIconId: CustomButtonIconId | null`
  and `ButtonSelectionChoice.customIconId: CustomButtonIconId | null`

- [ ] **Step 1: Write failing model assertions for preset glyph reuse**

In `__tests__/button-labels.test.ts`, preserve the existing exact 24-item
generic assertion. Replace the old expectation that `wifi` is invalid with
coverage that every preset glyph is accepted, and add the regional-label
resolution case:

```ts
it("accepts preset glyphs for custom Button labels", () => {
  for (const item of buttonLabelCatalog) {
    expect(isCustomButtonIconId(item.iconName)).toBe(true);
    expect(item.iconName in lucideGlyphMap).toBe(true);
  }
  expect(getButtonIconName("快速分享", "share-2")).toBe("share-2");
  expect(isCustomButtonIconId("not-a-lucide-button-icon")).toBe(false);
});
```

Keep the canonical precedence regression:

```ts
expect(getButtonIconName("Wi-Fi", "star")).toBe("wifi");
```

- [ ] **Step 2: Write failing selection, storage, and preset-output coverage**

In `__tests__/button-selection.test.ts`, use a preset glyph on the custom
choice and assert it survives item creation:

```ts
expect(
  createButtonItems(
    [
      { label: "Wi-Fi", customIconId: null },
      { label: "快速分享", customIconId: "share-2" },
    ],
    outerRect,
  ),
).toMatchObject([
  { id: "button-1", label: "Wi-Fi", customIconId: null },
  { id: "button-2", label: "快速分享", customIconId: "share-2" },
]);
```

In the `currentCalibrations.advancedButtons.buttons` fixture in
`__tests__/storage.test.ts`, replace the existing custom `My scene` item with:

```ts
{
  id: "button-2",
  label: "快速分享",
  customIconId: "share-2",
  rect: { x: 150, y: 40, width: 120, height: 120, radius: 0 },
}
```

The existing current-payload round-trip test must then expect the complete
fixture to survive. Retain the missing custom-icon rejection test and the
canonical built-in `customIconId: null` fixtures. Add this raw-payload parser
regression for the two invalid combinations:

```ts
it.each([
  ["Wi-Fi", "share-2"],
  ["快速分享", "not-a-lucide-button-icon"],
])("rejects invalid icon metadata for %s", (label, customIconId) => {
  const mmkvStore = (globalThis as typeof globalThis & MmkvTestGlobal)
    .__mmkvStore;
  mmkvStore?.set(
    "quick-panel.calibrations",
    JSON.stringify({
      ...currentCalibrations,
      advancedButtons: {
        ...currentCalibrations.advancedButtons,
        buttons: [
          {
            ...currentCalibrations.advancedButtons.buttons[0],
            label,
            customIconId,
          },
        ],
      },
    }),
  );

  expect(loadCalibrations().advancedButtons).toBeNull();
});
```

The first row proves a canonical built-in label still rejects non-null icon
metadata. The second proves an unknown glyph still rejects a custom label.

In `__tests__/export-files.test.ts`, add a preset-construction regression:

```ts
it("uses a preset icon with a literal custom Button label", () => {
  const preset = createButtonsPreset({
    screenshotWidth: 100,
    screenshotHeight: 100,
    grid: { columns: 1, rows: 1 },
    outerRect: { x: 0, y: 0, width: 100, height: 50, radius: 0 },
    buttons: [
      {
        id: "button-1",
        label: "快速分享",
        customIconId: "share-2",
        rect: { x: 0, y: 0, width: 40, height: 40, radius: 0 },
      },
    ],
  });

  expect(preset.panels["button-1"]).toMatchObject({
    label: "快速分享",
    fileName: "01-button.png",
    buttonIdentifier: { iconName: "share-2" },
  });
});
```

- [ ] **Step 3: Run the focused tests to verify the red state**

Run:

```bash
npm test -- --runInBand __tests__/button-labels.test.ts __tests__/button-selection.test.ts __tests__/storage.test.ts __tests__/export-files.test.ts
```

Expected: FAIL because `share-2` is not in the current
`CustomButtonIconId`/validator, and storage rejects the custom regional label.

- [ ] **Step 4: Preserve literal preset-map values and broaden the union**

In `src/features/quick-panel/model/button-labels.ts`, replace the preset map's
type annotation with this exact literal-preserving declaration without
altering its keys, values, or order:

```ts
const builtInButtonIconNames = {
  "wi-fi": "wifi",
  bluetooth: "bluetooth",
  "auto-rotate": "rotate-cw",
  flashlight: "flashlight",
  "flight-mode": "plane",
  location: "map-pin",
  "mobile-data": "arrow-down-up",
  "mobile-hotspot": "radio-tower",
  "power-saving": "leaf",
  "smart-view": "monitor-up",
  "eye-comfort-shield": "eye",
  "do-not-disturb": "circle-minus",
  "link-to-windows": "monitor-smartphone",
  "quick-share": "share-2",
  nfc: "nfc",
  "wireless-powershare": "battery-charging",
  "screen-recorder": "video",
  "take-screenshot": "scan-line",
  modes: "chart-pie",
  "dolby-atmos": "audio-lines",
  "extra-dim": "sun-dim",
  "secure-folder": "folder-lock",
  "always-on-display": "clock-3",
  "qr-code-scanner": "scan-qr-code",
  "live-caption": "captions",
  "performance-profile": "gauge",
  "wireless-dex": "monitor",
  smartthings: "house-plug",
  "camera-access": "camera",
  "microphone-access": "mic",
} as const satisfies Record<string, LucideIconName>;
```

Derive the two source unions and keep the public type name used by all current
consumers:

```ts
type GenericButtonIconId = (typeof customButtonIconChoices)[number]["id"];

type BuiltInButtonIconId =
  (typeof builtInButtonIconNames)[keyof typeof builtInButtonIconNames];

export type CustomButtonIconId = GenericButtonIconId | BuiltInButtonIconId;
```

Remove the widening annotation from `buttonLabelCatalog` so its mapped
`iconName` stays assignable to `CustomButtonIconId` while the public shape is
still checked:

```ts
export const buttonLabelCatalog = [...pinnedLabels, ...otherLabels].map(
  (label) => {
    const id = slug(label);
    const iconName =
      builtInButtonIconNames[id as keyof typeof builtInButtonIconNames];
    if (!iconName) {
      throw new Error(`Built-in Button ${label} has no icon`);
    }
    return { id, iconName, label, translationKey: `buttonLabels.${id}` };
  },
) satisfies BuiltInButtonLabel[];
```

Keep `customButtonIconChoices` unchanged and update the runtime guard to match
the union:

```ts
export function isCustomButtonIconId(
  value: unknown,
): value is CustomButtonIconId {
  if (typeof value !== "string") return false;
  return (
    customButtonIconChoices.some((choice) => choice.id === value) ||
    Object.values(builtInButtonIconNames).some((iconName) => iconName === value)
  );
}
```

Do not change `getButtonIconName` precedence or the storage parser branches.
Their existing types and validator call consume the broadened contract.

- [ ] **Step 5: Run the focused model and persistence tests to verify green**

Run:

```bash
npm test -- --runInBand __tests__/button-labels.test.ts __tests__/button-selection.test.ts __tests__/storage.test.ts __tests__/export-files.test.ts
```

Expected: all four suites PASS. Existing generic IDs and canonical built-in
behavior remain unchanged, and `快速分享` round-trips with `share-2`.

### Task 2: Add the tabbed preset and generic icon picker

**Files:**

- Create:
  `src/features/quick-panel/calibration/advanced/components/ButtonIconChoiceGrid.tsx`
- Modify:
  `src/features/quick-panel/calibration/advanced/components/CustomButtonIconDialog.tsx`
- Modify: `__tests__/custom-button-icon-dialog.test.tsx`
- Modify: `__tests__/locales.test.ts`
- Modify: `i18next/locales/en.ts`
- Modify: `i18next/locales/zh.ts`
- Reuse unchanged: `src/components/ani-ui/tabs.tsx`

**Interfaces:**

- Consumes: `buttonLabelCatalog`, `customButtonIconChoices`,
  `CustomButtonIconId`, AniUI `Tabs`, and localized strings
- Produces:
  `ButtonIconChoiceGrid({ choices, maxHeight, onSelect, testID })`
- Produces: `CustomButtonIconDialog.onSelect(iconId: CustomButtonIconId)` for
  either catalog

- [ ] **Step 1: Write failing locale assertions for the two tabs**

In the Advanced calibration locale test in `__tests__/locales.test.ts`, add:

```ts
expect(english.customIconPresetTab).toBe("Preset buttons");
expect(english.customIconOtherTab).toBe("Other icons");
expect(chinese.customIconPresetTab).toBe("預設按鈕");
expect(chinese.customIconOtherTab).toBe("其他圖示");
```

- [ ] **Step 2: Write failing dialog tests for both catalogs and tab reset**

Update the i18n mock in `__tests__/custom-button-icon-dialog.test.tsx` so the
two tab keys return their exact English labels and all other keys return the
key itself:

```ts
t: (key: string) =>
  ({
    "advancedCalibration.customIconPresetTab": "Preset buttons",
    "advancedCalibration.customIconOtherTab": "Other icons",
    "advancedCalibration.customIconDialogTitle": "Choose an icon",
    "advancedCalibration.customIconDialogBody": "Choose an icon for My scene",
    "common.cancel": "Cancel",
  })[key] ?? key;
```

Import `buttonLabelCatalog` and `customButtonIconChoices`, then assert:

```ts
for (const item of buttonLabelCatalog) {
  expect(screen.getByLabelText(item.translationKey)).toBeTruthy();
}
expect(
  screen.queryByLabelText(customButtonIconChoices[0].translationKey),
).toBeNull();

fireEvent.press(screen.getByRole("tab", { name: "Other icons" }));

for (const item of customButtonIconChoices) {
  expect(screen.getByLabelText(item.translationKey)).toBeTruthy();
}
```

Press the Quick Share preset choice and expect `onSelect("share-2")`. In a
separate test, switch to `Other icons`, press the Timer choice, and expect
`onSelect("timer")`. Then rerender the open dialog with a new `label` and
assert the preset grid is visible while the generic grid is not. Retain
cancellation coverage and assert both grid containers have a bounded numeric
`maxHeight` style when active.

- [ ] **Step 3: Run the focused UI and locale tests to verify red**

Run:

```bash
npm test -- --runInBand __tests__/custom-button-icon-dialog.test.tsx __tests__/locales.test.ts
```

Expected: FAIL because the locale keys, tabs, preset choices, shared grid, and
tab reset do not exist.

- [ ] **Step 4: Add exact localized tab copy**

Add these keys beside the existing custom-icon dialog strings in both locale
files:

```ts
// i18next/locales/en.ts
customIconPresetTab: "Preset buttons",
customIconOtherTab: "Other icons",

// i18next/locales/zh.ts
customIconPresetTab: "預設按鈕",
customIconOtherTab: "其他圖示",
```

- [ ] **Step 5: Extract the shared bounded icon grid**

Create `ButtonIconChoiceGrid.tsx` with these interfaces:

```ts
export interface ButtonIconChoice {
  id: CustomButtonIconId;
  label: string;
}

interface ButtonIconChoiceGridProps {
  choices: ButtonIconChoice[];
  maxHeight: number;
  onSelect: (iconId: CustomButtonIconId) => void;
  testID: string;
}
```

Render four-item rows inside a `ScrollView`. Each `Pressable` must use
`accessibilityLabel={choice.label}`, `accessibilityRole="button"`, call
`onSelect(choice.id)`, and retain the existing square dark tile styling and
minimum touch target. Render the icon and a visible two-line label:

```tsx
<Lucide color="#ffffff" name={choice.id} size={22} />
<Text
  className="text-center text-[9px] leading-3 text-zinc-300"
  numberOfLines={2}
>
  {choice.label}
</Text>
```

The scroll container contract is:

```tsx
<ScrollView
  contentContainerClassName="gap-3"
  showsVerticalScrollIndicator={false}
  style={{ maxHeight }}
  testID={testID}
>
  {rows}
</ScrollView>
```

For a row with fewer than four choices, append non-interactive spacer Views
until the row contains four `flex-1` cells:

```tsx
{
  Array.from({ length: 4 - row.length }, (_, spacerIndex) => (
    <View
      key={`spacer-${spacerIndex}`}
      className="aspect-square min-h-12 flex-1"
    />
  ));
}
```

- [ ] **Step 6: Compose the two catalogs with uncontrolled Tabs**

In `CustomButtonIconDialog.tsx`, remove its local row construction and import
`Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`, `buttonLabelCatalog`, and the
new grid. Build already-localized choices directly during render:

```ts
const presetChoices = buttonLabelCatalog.map((item) => ({
  id: item.iconName,
  label: t(item.translationKey),
}));
const otherChoices = customButtonIconChoices.map((item) => ({
  id: item.id,
  label: t(item.translationKey),
}));
const maxGridHeight = Math.min(320, height * 0.45);
```

Place this after the dialog header and before the footer:

```tsx
<Tabs key={label} defaultValue="preset" size="sm">
  <TabsList className="w-full border border-white/15 bg-zinc-800/95">
    <TabsTrigger
      activeClassName="bg-black"
      activeTextClassName="text-white"
      value="preset"
    >
      {t("advancedCalibration.customIconPresetTab")}
    </TabsTrigger>
    <TabsTrigger
      activeClassName="bg-black"
      activeTextClassName="text-white"
      value="other"
    >
      {t("advancedCalibration.customIconOtherTab")}
    </TabsTrigger>
  </TabsList>
  <TabsContent value="preset">
    <ButtonIconChoiceGrid
      choices={presetChoices}
      maxHeight={maxGridHeight}
      onSelect={onSelect}
      testID="preset-button-icon-grid"
    />
  </TabsContent>
  <TabsContent value="other">
    <ButtonIconChoiceGrid
      choices={otherChoices}
      maxHeight={maxGridHeight}
      onSelect={onSelect}
      testID="other-button-icon-grid"
    />
  </TabsContent>
</Tabs>
```

Do not add state to `ButtonPanelSelection` or change its selection callback.

- [ ] **Step 7: Run the focused UI and locale tests to verify green**

Run:

```bash
npm test -- --runInBand __tests__/custom-button-icon-dialog.test.tsx __tests__/locales.test.ts
```

Expected: both suites PASS; the default tab contains 30 preset choices, the
other tab contains the unchanged 24 generic choices, and a new pending label
resets the uncontrolled Tabs instance.

### Task 3: Activate the v1.6.0 release announcement with temporary media

**Files:**

- Create: `assets/announcement/v1_6_0.webp`
- Modify: `__tests__/release-announcement.test.tsx`
- Modify: `__tests__/locales.test.ts`
- Modify: `__tests__/storage.test.ts`
- Modify: `src/features/quick-panel/store/storage.ts:43-51`
- Modify:
  `src/features/quick-panel/release/ReleaseAnnouncementContent.ts`
- Modify:
  `src/features/quick-panel/release/ReleaseAnnouncementDialog.tsx`
- Modify: `i18next/locales/en.ts`
- Modify: `i18next/locales/zh.ts`
- Modify: `docs/release-announcement-guideline.md`

**Interfaces:**

- Consumes: existing `ReleaseAnnouncementDescriptor.mediaSource`,
  `mediaAccessibilityKey`, global host, and acknowledgement API
- Produces: active ID
  `v1.6.0-custom-label-preset-icons-announcement`
- Produces: `releaseAnnouncement.v1_6_0.{title,body,gotIt,mediaAccessibilityLabel}`
- Produces: stable bundled media path `assets/announcement/v1_6_0.webp`

- [ ] **Step 1: Add the exact temporary image at the stable final path**

Copy the existing app icon without modifying its source:

```bash
cp assets/images/appicon.png assets/announcement/v1_6_0.webp
```

Verify:

```bash
file assets/announcement/v1_6_0.webp
```

Expected: a valid 1024 x 1024 RGBA PNG. This is the explicit temporary
development image; later replace this same file with the user-provided feature
screenshot before preparing the release candidate.

- [ ] **Step 2: Write failing announcement behavior expectations**

In `__tests__/release-announcement.test.tsx`, replace v1.5.0 keys and IDs with:

```ts
"releaseAnnouncement.v1_6_0.title";
"releaseAnnouncement.v1_6_0.body";
"releaseAnnouncement.v1_6_0.gotIt";
"releaseAnnouncement.v1_6_0.mediaAccessibilityLabel";
"v1.6.0-custom-label-preset-icons-announcement";
```

Replace the current no-media assertion with:

```ts
expect(screen.getByTestId("release-announcement-media-wrapper")).toBeTruthy();
expect(
  screen.getByLabelText("releaseAnnouncement.v1_6_0.mediaAccessibilityLabel")
    .props.contentFit,
).toBe("contain");
```

Retain explicit CTA acknowledgement, platform dismissal, and
already-acknowledged coverage using the new ID.

In `__tests__/storage.test.ts`, update the independent acknowledgement test to
save `currentCalibrations`, last mode `advanced`, last Advanced target
`buttons`, and seen-help ID `calibration-outer` before acknowledging. Write and
expect `v1.6.0-custom-label-preset-icons-announcement`, then assert
`loadCalibrations()`, `loadLastExportedMode()`,
`loadLastExportedAdvancedTarget()`, and `hasSeenHelp("calibration-outer")`
return the values saved before acknowledgement. Add the required existing
storage helpers to the test imports; production preference APIs do not change.

- [ ] **Step 3: Write the failing exact bilingual locale contract**

Replace the v1.5.0 announcement locale assertion in
`__tests__/locales.test.ts` with:

```ts
expect(enLocale.translation.releaseAnnouncement.v1_6_0).toEqual({
  title: "v1.6.0 Updates 🌟\n",
  body: "• New: Custom Button labels can now use any preset Button icon, so you can match the wording shown on your device.",
  gotIt: "Got it",
  mediaAccessibilityLabel:
    "Custom Button label choosing from preset Button icons",
});
expect(zhLocale.translation.releaseAnnouncement.v1_6_0).toEqual({
  title: "v1.6.0 更新內容 🌟\n",
  body: "• 新功能：自訂按鈕標籤現在可使用任何預設按鈕圖示，方便配合你裝置上顯示的用字。",
  gotIt: "知道了",
  mediaAccessibilityLabel: "自訂按鈕標籤選擇預設按鈕圖示",
});
```

- [ ] **Step 4: Run the focused announcement tests to verify red**

Run:

```bash
npm test -- --runInBand __tests__/storage.test.ts __tests__/release-announcement.test.tsx __tests__/locales.test.ts
```

Expected: FAIL because production still uses the v1.5.0 ID/descriptor/copy,
omits media, and renders media with `contentFit="cover"`.

- [ ] **Step 5: Activate the new reason-specific announcement ID**

In `src/features/quick-panel/store/storage.ts`, change only the exported active
ID:

```ts
export const activeReleaseAnnouncementId =
  "v1.6.0-custom-label-preset-icons-announcement";
```

Do not delete or rename `quick-panel.acknowledged-release-announcement` and do
not touch calibration or preference keys.

- [ ] **Step 6: Add exact copy and descriptor media**

Add the exact `v1_6_0` objects from Step 3 to both locale files. Update
`activeReleaseAnnouncement` to:

```ts
export const activeReleaseAnnouncement: ReleaseAnnouncementDescriptor = {
  actionKey: "releaseAnnouncement.v1_6_0.gotIt",
  bodyKey: "releaseAnnouncement.v1_6_0.body",
  id: activeReleaseAnnouncementId,
  mediaAccessibilityKey: "releaseAnnouncement.v1_6_0.mediaAccessibilityLabel",
  mediaSource: require("../../../../assets/announcement/v1_6_0.webp"),
  titleKey: "releaseAnnouncement.v1_6_0.title",
};
```

In `ReleaseAnnouncementDialog.tsx`, change only the existing media Image's
`contentFit` value from `cover` to `contain` so the complete temporary and
final images follow the announcement guideline.

- [ ] **Step 7: Update the announcement guideline's current reference**

Replace only the `Current reference` section with an accurate v1.6.0 summary:

```markdown
## Current reference

The current announcement ID is
`v1.6.0-custom-label-preset-icons-announcement`. It announces that custom
Button labels can reuse preset Button icons, includes localized supporting
media, and has a single `Got it` / `知道了` acknowledgement CTA. Its
acknowledgement is independent from `quick-panel.calibrations`.

During development, `assets/announcement/v1_6_0.webp` is a temporary app-icon
image. Replace it in place with the final feature screenshot before preparing
the v1.6.0 release candidate.
```

- [ ] **Step 8: Run focused announcement tests to verify green**

Run:

```bash
npm test -- --runInBand __tests__/storage.test.ts __tests__/release-announcement.test.tsx __tests__/locales.test.ts
```

Expected: all suites PASS; the new ID displays once, both dismissal paths
acknowledge it, the exact locale objects exist, the media is accessible and
contained, and calibration storage remains independent.

### Task 4: Run final automated verification and prepare the manual handoff

**Files:**

- Verify every file changed by Tasks 1-3
- Verify no version, build, dependency, calibration-geometry, Customize, or
  export-surface files changed outside the listed scope

**Interfaces:**

- Consumes: the completed model, picker, persistence, locale, announcement,
  media, and documentation changes
- Produces: automated evidence plus a clear user-owned QA/release-image handoff

- [ ] **Step 1: Run all focused suites together**

Run:

```bash
npm test -- --runInBand __tests__/button-labels.test.ts __tests__/button-selection.test.ts __tests__/custom-button-icon-dialog.test.tsx __tests__/storage.test.ts __tests__/export-files.test.ts __tests__/release-announcement.test.tsx __tests__/locales.test.ts
```

Expected: all focused suites PASS.

- [ ] **Step 2: Run TypeScript**

Run:

```bash
npx tsc --noEmit
```

Expected: exit 0 with no type errors, including the widened literal icon union
and both dialog catalogs.

- [ ] **Step 3: Run lint**

Run:

```bash
npm run lint
```

Expected: exit 0 with no new errors or warnings.

- [ ] **Step 4: Check formatting and approved scope**

Run:

```bash
git diff --check
git status --short
git diff --stat
```

Expected: `git diff --check` exits 0. The diff contains only the approved icon
model, shared picker grid/dialog, locales, persistence/announcement descriptor,
announcement media/guideline, tests, spec, and plan.

- [ ] **Step 5: Hand off the explicit user-owned manual checks**

Report these checks as not run by the agent:

1. On a phone, enter `快速分享`, add it, choose the Quick Share preset icon,
   complete calibration, and verify preview/export show `快速分享` with the
   expected share icon.
2. Verify all 30 preset and 24 other icons scroll without hiding the dialog
   title, tabs, or Cancel action on a short screen.
3. Close and reopen the dialog with a different pending label and verify
   `Preset buttons` is selected.
4. Verify fresh-install, upgrade, acknowledgement, platform-dismissal, and
   relaunch behavior for the v1.6.0 announcement.
5. Replace `assets/announcement/v1_6_0.webp` with the final feature screenshot
   before release-candidate preparation, then verify it is fully visible with
   the localized accessibility label.

Do not execute release metadata or build steps as part of this feature plan.
