# Built-in Button Selection Icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:executing-plans` to execute this plan inline task-by-task. This
> repository forbids sub-agent workflows and Git commits by the agent. Steps
> use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show each built-in Button's existing Lucide icon beside its label in
the Button selection list and selected summary chips.

**Architecture:** Keep `buttonLabelCatalog` and `getButtonIconName(...)` as the
single sources of icon identity. Update only the shared Button selection UI,
which automatically covers Buttons-only and Controls + Buttons, and extract
the selected-chip presentation so `ButtonPanelSelection.tsx` stays focused and
below the repository's component-size limit.

**Tech Stack:** Expo 56, React Native 0.85, TypeScript 6, Uniwind,
`@react-native-vector-icons/lucide`, Jest, React Native Testing Library

**Spec:** The user request and attached Button selection screenshot in the
2026-08-26 task; this bounded UI change does not require a separate design
document.

## Global Constraints

- Preserve all 30 built-in Button IDs, labels, icon mappings, and catalog order.
- Preserve custom-label icons and the amber custom-chip styling.
- Preserve selection behavior, selection order, search, geometry, storage,
  localization, preview, and export behavior.
- Add no dependency, icon mapping, migration, copy, release announcement, or
  unrelated refactor.
- Keep production component files below 150 lines and avoid `useMemo`,
  `useCallback`, and `React.memo` outside AniUI.
- Leave physical-device, phone-size, and visual QA to the user.
- Do not commit or push.

---

### Task 1: Render built-in icons throughout Button selection

**Files:**

- Create: `src/features/quick-panel/calibration/advanced/components/SelectedButtonChip.tsx`
- Modify: `src/features/quick-panel/calibration/advanced/components/ButtonPanelSelection.tsx`
- Create: `__tests__/button-panel-selection.test.tsx`
- Verify unchanged: `src/features/quick-panel/model/button-labels.ts`

**Interfaces:**

- Consumes: `BuiltInButtonLabel.iconName` for catalog rows and
  `getButtonIconName(label, customIconId)` for selected chips.
- Produces: `SelectedButtonChip`, a presentation-only component accepting a
  `ButtonCalibrationItem`, localized display/remove labels, and `onRemove`.
- Preserves: `ButtonCalibrationItem`, `onButtonsChange`, `customIconId`, and all
  persistence and calibration interfaces.

- [ ] **Step 1: Add a failing selection-component test**

Create `__tests__/button-panel-selection.test.tsx`. Mock `Lucide` as a React
Native `Text` that exposes its `name`, mock `CalibrationAreaPreview` to render
its child content, and mock `CustomButtonIconDialog` as `null`. Render
`ButtonPanelSelection` with selected built-in `Wi-Fi` and custom `My scene`
(`customIconId: "star"`). Assert that:

- the Wi-Fi catalog checkbox contains the `wifi` glyph;
- the selected Wi-Fi removal chip contains the `wifi` glyph;
- the selected custom removal chip still contains the `star` glyph;
- pressing the Wi-Fi catalog row still calls `onButtonsChange` with Wi-Fi
  removed and the remaining Button order unchanged.

- [ ] **Step 2: Run the focused test and confirm the red state**

Run:

```bash
npm test -- --runInBand __tests__/button-panel-selection.test.tsx
```

Expected: FAIL because built-in catalog rows and built-in selected chips do not
currently render their mapped glyphs.

- [ ] **Step 3: Extract the selected chip without changing behavior**

Create `SelectedButtonChip.tsx` with typed props. Move the existing chip
markup into it, retain amber styling for `customIconId !== null` and emerald
styling for canonical built-ins, and always render one leading `Lucide`:

```tsx
<Lucide
  accessible={false}
  color={isCustom ? "#fde68a" : "#d1fae5"}
  name={getButtonIconName(button.label, button.customIconId)}
  size={13}
/>
```

Keep the localized removal accessibility label and trailing `x` icon exactly
as today. Replace the inline chip block in `ButtonPanelSelection.tsx` with this
component.

- [ ] **Step 4: Add each built-in icon to its catalog row**

In the `labels.map(...)` row inside `ButtonPanelSelection.tsx`:

- compute `isSelected` and localized `displayLabel` once per item;
- give the `Pressable` `flex-row items-center gap-2.5` while retaining its
  minimum height, border, background, padding, checkbox role, and checked state;
- set `accessibilityLabel={displayLabel}`;
- render a decorative `Lucide` before the text using `item.iconName`, size `18`,
  emerald `#d1fae5` when selected and white `#ffffff` otherwise;
- keep label typography and selection toggling unchanged.

- [ ] **Step 5: Run automated verification**

Run:

```bash
npm test -- --runInBand __tests__/button-panel-selection.test.tsx __tests__/button-labels.test.ts __tests__/button-selection.test.ts
npm run lint
```

Expected: all focused tests pass and lint reports no new errors. Do not run a
device, emulator, release build, or screenshot-capture workflow.

- [ ] **Step 6: Hand off manual QA**

Ask the user to verify on a phone in both Buttons-only and Controls + Buttons:

- selected and unselected built-in rows show the correct glyph and stay aligned;
- built-in and custom selected chips both show their glyph without crowding the
  label or remove icon;
- long English/Traditional Chinese labels, wrapped chips, search results, and
  removal/toggling remain readable and usable on short screens.

Suggested commit message for the user:

```text
add: show built-in icons in Button selection
```
