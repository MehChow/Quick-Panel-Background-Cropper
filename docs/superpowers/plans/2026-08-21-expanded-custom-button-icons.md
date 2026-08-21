# Expanded Custom Button Icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:executing-plans` to execute this plan inline task-by-task. This
> repository forbids sub-agent workflows and Git commits by the agent.

**Goal:** Expand custom Button label icon choices from 8 to the approved 24 and
make the four-column picker scroll safely on short screens.

**Architecture:** Keep `customButtonIconChoices` as the typed source of truth,
append the new IDs and locale keys, and render four-item rows inside a bounded
React Native `ScrollView`. Preserve all persistence and downstream icon
consumers by leaving the existing ID model unchanged.

**Tech Stack:** Expo 56, React Native 0.85, TypeScript 6, Uniwind,
`@react-native-vector-icons/lucide`, Jest, React Native Testing Library

**Spec:** `docs/superpowers/specs/2026-08-21-expanded-custom-button-icons-design.md`

## Global Constraints

- Preserve the existing eight custom icon IDs and their order.
- Append exactly the 16 IDs listed in the spec, in the specified order.
- Keep `builtInButtonIconNames`, persistence, calibration, preview, and export
  behavior unchanged.
- Add no dependencies, imported-image fields, release metadata, or release
  announcement changes.
- Use interfaces for props and avoid `any`, `useMemo`, `useCallback`, and
  `React.memo`.
- Leave phone-size scrolling and visual QA to the user.
- Do not commit or push.

---

### Task 1: Expand and validate the typed icon catalog

**Files:**

- Modify: `__tests__/button-labels.test.ts`
- Modify: `src/features/quick-panel/model/button-labels.ts`

**Interfaces:**

- Consumes: installed `Lucide.json` glyph names and existing
  `customButtonIconChoices` records
- Produces: the expanded `customButtonIconChoices` and derived
  `CustomButtonIconId` union

- [ ] **Step 1: Write the failing catalog assertions**

Update the catalog test to expect the exact 24 IDs. Import the installed
`Lucide.json` glyph map and assert every choice exists in it. Derive the 16
added IDs by slicing after the original eight and assert none occur in
`buttonLabelCatalog.map(({ iconName }) => iconName)`.

```ts
expect(customButtonIconChoices.map(({ id }) => id)).toEqual([
  "zap", "star", "sparkles", "circle", "music", "gamepad-2", "globe",
  "sliders-horizontal", "heart", "bell", "bookmark",
  "briefcase-business", "calendar-days", "car", "cloud", "coffee",
  "gift", "key-round", "lightbulb", "palette", "rocket", "shield",
  "shopping-bag", "timer",
]);
```

- [ ] **Step 2: Verify the focused test fails for the missing additions**

Run: `npm test -- --runInBand __tests__/button-labels.test.ts`

Expected: FAIL because the catalog still contains only eight IDs.

- [ ] **Step 3: Append the minimal catalog records**

Append records using `advancedCalibration.customIconHeart` through
`advancedCalibration.customIconTimer` without changing the existing records or
the derived union type.

- [ ] **Step 4: Verify the catalog test passes**

Run: `npm test -- --runInBand __tests__/button-labels.test.ts`

Expected: PASS.

### Task 2: Add localized names for all new choices

**Files:**

- Modify: `__tests__/locales.test.ts`
- Modify: `i18next/locales/en.ts`
- Modify: `i18next/locales/zh.ts`

**Interfaces:**

- Consumes: translation keys added to `customButtonIconChoices`
- Produces: English and Traditional Chinese strings under
  `advancedCalibration`

- [ ] **Step 1: Write failing locale assertions**

Add an expected record for the 16 English labels and assert the corresponding
Traditional Chinese keys are truthy.

```ts
expect(english).toMatchObject({
  customIconHeart: "Heart",
  customIconBell: "Bell",
  customIconBookmark: "Bookmark",
  customIconBriefcase: "Briefcase",
  customIconCalendar: "Calendar",
  customIconCar: "Car",
  customIconCloud: "Cloud",
  customIconCoffee: "Coffee",
  customIconGift: "Gift",
  customIconKey: "Key",
  customIconLightbulb: "Lightbulb",
  customIconPalette: "Palette",
  customIconRocket: "Rocket",
  customIconShield: "Shield",
  customIconShoppingBag: "Shopping Bag",
  customIconTimer: "Timer",
});
```

- [ ] **Step 2: Verify the locale test fails for missing keys**

Run: `npm test -- --runInBand __tests__/locales.test.ts`

Expected: FAIL because the new locale properties do not exist.

- [ ] **Step 3: Add both locale records**

Add the English values from the spec and concise Traditional Chinese values:
愛心、鈴鐺、書籤、公事包、日曆、汽車、雲朵、咖啡、禮物、鑰匙、燈泡、調色盤、
火箭、盾牌、購物袋、計時器.

- [ ] **Step 4: Verify the locale test passes**

Run: `npm test -- --runInBand __tests__/locales.test.ts`

Expected: PASS.

### Task 3: Make the icon picker data-driven and scrollable

**Files:**

- Modify: `__tests__/custom-button-icon-dialog.test.tsx`
- Modify:
  `src/features/quick-panel/calibration/advanced/components/CustomButtonIconDialog.tsx`

**Interfaces:**

- Consumes: all records from `customButtonIconChoices`
- Produces: four-column accessible icon controls that call
  `onSelect(iconId: CustomButtonIconId)`

- [ ] **Step 1: Write the failing dialog coverage**

Provide translations for all 24 choices in the i18n mock. Assert each label is
rendered by accessibility query, press the new `Timer` choice, and expect
`onSelect("timer")`. Assert the grid uses a `ScrollView` test ID with a bounded
`maxHeight` style.

```ts
for (const label of iconLabels) {
  expect(screen.getByLabelText(label)).toBeTruthy();
}
fireEvent.press(screen.getByLabelText("Timer"));
expect(onSelect).toHaveBeenCalledWith("timer");
expect(screen.getByTestId("custom-button-icon-grid").props.style).toEqual(
  expect.objectContaining({ maxHeight: expect.any(Number) }),
);
```

- [ ] **Step 2: Verify the dialog test fails**

Run: `npm test -- --runInBand __tests__/custom-button-icon-dialog.test.tsx`

Expected: FAIL because Timer and the scroll container are absent.

- [ ] **Step 3: Implement the minimal bounded grid**

Import `ScrollView` and `useWindowDimensions`. Build rows with
`Array.from({ length: Math.ceil(customButtonIconChoices.length / 4) })`, retain
the existing square `Pressable`, and wrap the rows in:

```tsx
<ScrollView
  contentContainerClassName="gap-3"
  showsVerticalScrollIndicator={false}
  style={{ maxHeight: Math.min(320, height * 0.45) }}
  testID="custom-button-icon-grid"
>
  {iconRows}
</ScrollView>
```

- [ ] **Step 4: Verify the dialog test passes**

Run: `npm test -- --runInBand __tests__/custom-button-icon-dialog.test.tsx`

Expected: PASS.

### Task 4: Run final automated verification

**Files:**

- Verify all modified files

**Interfaces:**

- Consumes: Tasks 1-3
- Produces: automated evidence for handoff

- [ ] **Step 1: Run focused Jest suites together**

Run:
`npm test -- --runInBand __tests__/button-labels.test.ts __tests__/custom-button-icon-dialog.test.tsx __tests__/locales.test.ts`

Expected: all focused suites PASS.

- [ ] **Step 2: Run TypeScript**

Run: `npx tsc --noEmit`

Expected: exit 0 with no errors.

- [ ] **Step 3: Run lint**

Run: `npm run lint`

Expected: exit 0 with no errors or warnings introduced by this change.

- [ ] **Step 4: Check patch formatting and scope**

Run: `git diff --check`

Expected: exit 0. Review `git status --short` and `git diff --stat` to confirm
only the approved docs, catalog, dialog, locales, and tests changed.
