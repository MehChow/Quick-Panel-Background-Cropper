# Header Helper Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current help icon button with a reusable guidance-style header action and apply the balanced variant to help-enabled screens.

**Architecture:** Add a focused shared header action component that owns press states, icon defaults, and helper variants. Keep `SubPageHeader` as the layout wrapper and pass variant/icon props down so existing screens only need small prop updates.

**Tech Stack:** Expo 56, React Native, NativeWind, Lucide icons

---

### Task 1: Shared Header Helper Action

**Files:**
- Create: `docs/superpowers/specs/2026-06-15-header-helper-button-design.md`
- Create: `src/features/quick-panel/shared/HeaderActionButton.tsx`
- Modify: `src/features/quick-panel/shared/SubPageHeader.tsx`
- Modify: `src/features/quick-panel/select-mode/SelectModeScreen.tsx`
- Modify: `src/features/quick-panel/calibration/default/CalibrationScreen.tsx`
- Modify: `src/features/quick-panel/calibration/advanced/AdvancedCalibrationScreen.tsx`

- [ ] **Step 1: Add a shared action button component**

Create a component that supports:
- icon-only rendering
- `default`, `helper-subtle`, and `helper-balanced` variants
- a guidance-oriented default icon for helper variants
- visible pressed-state feedback

- [ ] **Step 2: Route subpage header actions through the shared button**

Update the shared header so all action rendering is centralized and future screens can choose a variant without reimplementing button styles.

- [ ] **Step 3: Apply the balanced helper style to current help screens**

Update the select mode, default calibration, and advanced calibration screens to use the new helper-sheet icon treatment.

- [ ] **Step 4: Verify formatting and types**

Run: `npx eslint src/features/quick-panel/shared/HeaderActionButton.tsx src/features/quick-panel/shared/SubPageHeader.tsx src/features/quick-panel/select-mode/SelectModeScreen.tsx src/features/quick-panel/calibration/default/CalibrationScreen.tsx src/features/quick-panel/calibration/advanced/AdvancedCalibrationScreen.tsx`

Expected: no lint errors in the touched files
