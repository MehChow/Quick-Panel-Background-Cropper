# Custom Button Icon Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand the custom icon picker to eight generic icons and visually distinguish custom selected chips while showing their icons.

**Architecture:** Keep icon IDs in the existing button-label model, render the picker as a four-column grid without visible labels, and derive selected-chip presentation from each `ButtonCalibrationItem` rather than only its label.

**Tech Stack:** Expo 56, React Native, Uniwind, Lucide, Zustand state shapes, Jest.

## Global Constraints

- This unreleased version does not require compatibility with previous custom icon IDs.
- Do not change calibration geometry, export behavior, or built-in button labels.
- Do not add dependencies, commit, or push.

### Task 1: Expand the custom icon catalog and translations

**Files:**
- Modify: `src/features/quick-panel/model/button-labels.ts`
- Modify: `locales/en.ts` and `locales/zh.ts` at the existing advanced-calibration translation entries
- Test: existing button-label model test location discovered with `rg --files src | rg 'button-labels.*test'`

- [ ] Replace the four-choice array with eight supported Lucide IDs: `zap`,
  `star`, `sparkles`, `circle`, `music`, `gamepad-2`, `globe`, and
  `sliders-horizontal`.
- [ ] Add English and Chinese accessibility translation keys for the four new icons; retain existing keys for the four existing IDs.
- [ ] Extend the focused model test to assert the catalog has eight unique IDs and all IDs pass `isCustomButtonIconId`.
- [ ] Run the focused model test and confirm it passes.

### Task 2: Update picker and selected-chip presentation

**Files:**
- Modify: `src/features/quick-panel/calibration/advanced/components/CustomButtonIconDialog.tsx`
- Modify: `src/features/quick-panel/calibration/advanced/components/ButtonPanelSelection.tsx`

- [ ] Render choices in a fixed four-column flex row layout with two rows, using each choice’s translated key only for `accessibilityLabel`; render the Lucide glyph without visible text.
- [ ] Change selected-chip mapping from labels to `ButtonCalibrationItem` objects so the chip can inspect `customIconId`.
- [ ] For custom items, use amber/orange border/background/text classes and render `getButtonIconName(item.label, item.customIconId)` before the label.
- [ ] Keep built-in chips green and preserve remove behavior by toggling with the item label.
- [ ] Run TypeScript/lint checks for the changed files.

### Task 3: Verify the final flow

**Files:**
- Verify only; no additional source files.

- [ ] Run the project’s focused test command from `package.json` for button-label coverage.
- [ ] Run the project’s TypeScript and lint checks applicable to the changed source.
- [ ] If a connected Android device is available, navigate to Advanced > Buttons only, add a custom label, and visually confirm the icon-only 2×4 picker and amber icon-leading chip.
- [ ] Confirm `git diff --stat` contains only the intended source, translation, test, spec, and plan files.
