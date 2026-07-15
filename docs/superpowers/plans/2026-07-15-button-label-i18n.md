# Button Label i18n Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. This repo requires inline execution; do not dispatch subagents.

**Goal:** Translate all 60 built-in Quick Panel Button labels through i18next everywhere they are displayed while keeping stored labels and PNG filenames in canonical English.

**Architecture:** Keep `ButtonCalibrationItem.label` unchanged as the canonical English or custom value. Add translation keys and pure lookup/search helpers to the built-in catalog, then resolve built-in labels at display boundaries; custom labels pass through unchanged. Button preset filenames continue to be generated before display translation.

**Tech Stack:** Expo 56, React Native 0.85, TypeScript 6, i18next 26, react-i18next 17, Jest 29

## Global Constraints

- Read and follow Expo SDK 56 documentation at `https://docs.expo.dev/versions/v56.0.0/` before code changes.
- Keep built-in labels stored in English and keep generated PNG filenames English.
- Translate built-in labels everywhere they are displayed; never translate custom labels.
- Add no language persistence; release language remains device-language driven.
- Add no dependencies and do not edit generated native projects.
- Use interfaces instead of `any`; do not add memo hooks or `React.memo`.
- Execute inline only and use text-only verification.

---

### Task 1: Add localized catalog primitives

**Files:**
- Modify: `src/features/quick-panel/model/button-labels.ts`
- Modify: `src/features/quick-panel/model/i18n.ts`
- Modify: `i18next/locales/en.ts`
- Modify: `i18next/locales/zh.ts`
- Test: `__tests__/button-labels.test.ts`

**Interfaces:**
- Produces: `ButtonLabelTranslator = (key: string) => string`
- Produces: `BuiltInButtonLabel.translationKey: string`
- Produces: `getButtonDisplayLabel(label: string, translate: ButtonLabelTranslator): string`
- Produces: `searchButtonLabels(query: string, translate?: ButtonLabelTranslator): BuiltInButtonLabel[]`
- Produces: `getButtonLabel(label: string): string` from `model/i18n.ts`

- [ ] **Step 1: Write failing catalog tests**

Extend `__tests__/button-labels.test.ts` to import `en`, `zh`, and `getButtonDisplayLabel`. Add a translator over each locale's `buttonLabels` object and assert:

```ts
interface ButtonLabelTranslations {
  [id: string]: string;
}

function createTranslator(labels: ButtonLabelTranslations) {
  return (key: string) => labels[key.replace("buttonLabels.", "")] ?? key;
}

it("provides English and Chinese translations for every built-in label", () => {
  const enLabels = Reflect.get(en.translation, "buttonLabels") as ButtonLabelTranslations;
  const zhLabels = Reflect.get(zh.translation, "buttonLabels") as ButtonLabelTranslations;

  for (const item of buttonLabelCatalog) {
    expect(enLabels[item.id]).toBe(item.label);
    expect(zhLabels[item.id]).toBeTruthy();
    expect(item.translationKey).toBe(`buttonLabels.${item.id}`);
  }
});

it("localizes built-in labels and preserves custom labels", () => {
  const zhLabels = Reflect.get(zh.translation, "buttonLabels") as ButtonLabelTranslations;
  const translateZh = createTranslator(zhLabels);

  expect(getButtonDisplayLabel("Bluetooth", translateZh)).toBe("藍牙");
  expect(getButtonDisplayLabel("My custom tile", translateZh)).toBe("My custom tile");
});

it("searches canonical and localized labels", () => {
  const zhLabels = Reflect.get(zh.translation, "buttonLabels") as ButtonLabelTranslations;
  const translateZh = createTranslator(zhLabels);

  expect(searchButtonLabels("Bluetooth", translateZh).map((item) => item.label)).toContain("Bluetooth");
  expect(searchButtonLabels("藍牙", translateZh).map((item) => item.label)).toContain("Bluetooth");
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- --runTestsByPath __tests__/button-labels.test.ts --runInBand`

Expected: FAIL because `getButtonDisplayLabel`, translation keys, and locale entries do not exist.

- [ ] **Step 3: Implement the catalog helpers**

In `button-labels.ts`, add `translationKey` while retaining `id` and canonical `label`. Build one module-level lookup map, then implement:

```ts
export type ButtonLabelTranslator = (key: string) => string;

export interface BuiltInButtonLabel {
  id: string;
  label: string;
  translationKey: string;
}

export const buttonLabelCatalog: BuiltInButtonLabel[] = [
  ...pinnedLabels,
  ...otherLabels,
].map((label) => {
  const id = slug(label);
  return { id, label, translationKey: `buttonLabels.${id}` };
});

const buttonLabelsByCanonicalLabel = new Map(
  buttonLabelCatalog.map((item) => [item.label, item]),
);

export function getButtonDisplayLabel(
  label: string,
  translate: ButtonLabelTranslator,
): string {
  const item = buttonLabelsByCanonicalLabel.get(label);
  return item ? translate(item.translationKey) : label;
}

export function searchButtonLabels(
  query: string,
  translate?: ButtonLabelTranslator,
): BuiltInButtonLabel[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return buttonLabelCatalog;

  return buttonLabelCatalog.filter((item) => {
    const localizedLabel = translate?.(item.translationKey) ?? item.label;
    return item.label.toLowerCase().includes(needle) ||
      localizedLabel.toLowerCase().includes(needle);
  });
}
```

In `model/i18n.ts`, add `getButtonLabel(label)` by calling `getButtonDisplayLabel(label, translate)`.

- [ ] **Step 4: Add all locale entries**

Add `buttonLabels` after `panels` in both locale files. English values exactly match the canonical catalog. Use these initial Traditional Chinese values:

| English | Chinese | English | Chinese |
|---|---|---|---|
| Wi-Fi | Wi-Fi | Bluetooth | 藍牙 |
| Auto rotate | 自動旋轉 | Flashlight | 手電筒 |
| Sound | 音效 | Airplane mode | 飛航模式 |
| Location | 定位 | Mobile data | 行動數據 |
| Hotspot | 行動無線基地台 | Power saving | 省電模式 |
| Smart View | Smart View | Nearby devices | 附近裝置 |
| Dark mode | 深色模式 | Eye comfort shield | 護眼模式 |
| Do not disturb | 請勿打擾 | Link to Windows | 連結至 Windows |
| Quick Share | Quick Share | NFC | NFC |
| Wireless power sharing | 無線電力分享 | Screen recorder | 螢幕錄影 |
| Screenshot | 截圖 | Modes | 模式 |
| Device control | 裝置控制 | Music Share | Music Share |
| Dolby Atmos | Dolby Atmos | Extra dim | 額外調暗 |
| Secure Folder | 安全資料夾 | Always On Display | Always On Display |
| Sync | 同步 | Kids | 兒童模式 |
| Scan QR code | 掃描 QR 碼 | Video call effects | 視像通話效果 |
| Live Caption | 即時字幕 | Call caption | 通話字幕 |
| Microphone mode | 麥克風模式 | Performance profile | 效能設定檔 |
| Battery protect | 電池保護 | Bluetooth tethering | 藍牙網絡共享 |
| Ultra-wideband | 超寬頻 | Data saver | 數據節省器 |
| VPN | VPN | Focus mode | 專注模式 |
| Bedtime mode | 就寢模式 | Screen cast | 投放螢幕 |
| Dex | DeX | SmartThings | SmartThings |
| One-handed mode | 單手模式 | Touch sensitivity | 觸控靈敏度 |
| Color inversion | 色彩反轉 | Color correction | 色彩校正 |
| Reduce brightness | 降低亮度 | Accessibility | 協助工具 |
| Camera access | 相機存取權 | Microphone access | 麥克風存取權 |
| Private Share | 私人分享 | Nearby Share | 鄰近分享 |
| Work profile | 工作設定檔 | USB tethering | USB 網絡共享 |
| Storage | 儲存空間 | Hotspot 2.0 | Hotspot 2.0 |

Use each catalog slug as the object key, including `wi-fi`, `auto-rotate`, and `hotspot-2-0`.

- [ ] **Step 5: Run the focused test and verify GREEN**

Run: `npm test -- --runTestsByPath __tests__/button-labels.test.ts --runInBand`

Expected: PASS with all button-label tests green.

---

### Task 2: Resolve translations at every display boundary

**Files:**
- Modify: `src/features/quick-panel/calibration/advanced/components/ButtonPanelSelection.tsx`
- Modify: `src/features/quick-panel/calibration/advanced/buttons-geometry.ts`
- Modify: `src/features/quick-panel/calibration/advanced/AdvancedCalibrationScreen.tsx`
- Test: `__tests__/button-labels.test.ts`
- Test: `__tests__/export-files.test.ts`

**Interfaces:**
- Consumes: `getButtonDisplayLabel`, localized `searchButtonLabels`, and `getButtonLabel`
- Preserves: `ButtonCalibrationItem.label` and `createButtonFileNames(labels: string[])`

- [ ] **Step 1: Write failing integration assertions**

In `__tests__/export-files.test.ts`, import `i18n` from `../i18next/i18next`, switch it to Chinese for a Buttons preset containing `Bluetooth`, assert the preset's panel display label is `藍牙`, and assert its filename is still `01-bluetooth.png`. Restore English in `finally` so other tests remain isolated.

```ts
it("localizes button display labels without translating filenames", async () => {
  await i18n.changeLanguage("zh");
  try {
    const preset = createButtonsPreset({
      screenshotWidth: 100,
      screenshotHeight: 100,
      grid: { columns: 1, rows: 1 },
      outerRect: { x: 0, y: 0, width: 100, height: 50, radius: 0 },
      buttons: [
        {
          id: "button-1",
          label: "Bluetooth",
          rect: { x: 0, y: 0, width: 40, height: 40, radius: 0 },
        },
      ],
    });

    expect(preset.panels["button-1"].label).toBe("藍牙");
    expect(preset.panels["button-1"].fileName).toBe("01-bluetooth.png");
  } finally {
    await i18n.changeLanguage("en");
  }
});
```

- [ ] **Step 2: Run the integration test and verify RED**

Run: `npm test -- --runTestsByPath __tests__/export-files.test.ts --runInBand`

Expected: FAIL because the preset label is still `Bluetooth`.

- [ ] **Step 3: Localize the selection screen without changing selection values**

In `ButtonPanelSelection`, pass `(key) => t(key)` into `searchButtonLabels`. For each catalog option and selected chip, compute `getButtonDisplayLabel(canonicalLabel, (key) => t(key))` for visible text and accessibility labels. Keep `toggleLabel`, `selectedLabels`, and `onButtonsChange` operating on canonical English strings.

- [ ] **Step 4: Localize later calibration and export labels**

In `buttons-geometry.ts`, call `getButtonLabel(button.label)` for `PanelDefinition.label` and `EditablePanelItem.label`, but continue calling `createButtonFileNames` with the original `calibration.buttons.map((button) => button.label)` values.

In `AdvancedCalibrationScreen`, pass `panelItems` into `getSubtitle`. For a button phase, use the matching `panelItems` label; for a Controls phase, retain `t(`panels.${phase}`)`. This removes the invalid `panels.button-N` lookup and keeps custom labels unchanged.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `npm test -- --runTestsByPath __tests__/button-labels.test.ts __tests__/export-files.test.ts --runInBand`

Expected: PASS; Chinese display labels resolve while filenames stay English.

---

### Task 3: Verify the complete change

**Files:**
- Verify only; do not modify unrelated dirty or untracked files.

- [ ] **Step 1: Run the full Jest suite**

Run: `npm test -- --runInBand`

Expected: all suites and tests pass with zero failures.

- [ ] **Step 2: Run ESLint**

Run: `npm run lint`

Expected: exit code 0 with no errors.

- [ ] **Step 3: Run TypeScript**

Run: `npx tsc --noEmit`

Expected: exit code 0 with no type errors.

- [ ] **Step 4: Inspect the scoped diff**

Run: `git diff --check`

Expected: no whitespace errors. Confirm only the plan, locale files, button-label model/tests, Buttons selection, Buttons geometry, and Advanced calibration subtitle changed; preserve the user's existing `.gitignore` and unrelated untracked docs.

- [ ] **Step 5: Commit the implementation**

Stage only implementation and test files from Tasks 1-2, then commit:

```bash
git commit -m "feat: localize button labels"
```
