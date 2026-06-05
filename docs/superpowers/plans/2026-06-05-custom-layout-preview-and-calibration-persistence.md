# Custom Layout Preview And Calibration Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make custom-layout preview trustworthy and simple while allowing `default-union` and `custom-panels` to keep one saved calibration each.

**Architecture:** Treat this as a follow-up slice on top of the existing QuickStar crop model. Keep default-layout behavior intact, simplify custom preview instead of adding more simulated UI, and move calibration persistence from one global profile to a mode-indexed saved-state model with lightweight legacy migration.

**Tech Stack:** Expo 56, expo-image, Zustand, react-native-mmkv, TypeScript, i18next

---

## Branch Guard

Execute this plan on `feat/custom-layout-calibration` or a child branch created from it. Do not run it on `main` or `master`.

## Scope Notes

- This slice does **not** change the default-layout calibration model.
- This slice does **not** change export file naming, Good Lock order, or output size.
- Per repo testing guidance, prefer existing project verification commands and focused manual validation. Do not add broad new test coverage in this slice unless a tiny targeted storage/transition test is required to keep existing behavior safe.

## File Structure

### Existing files to modify

- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\storage.ts`
  - replace the single saved calibration profile with a per-mode saved profile map and selected-mode persistence
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\quick-panel-defaults.ts`
  - initialize app state from the selected mode and its saved profile while preserving legacy migration behavior
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\quick-panel-store.ts`
  - save calibration into the active mode slot and switch active state when the selected mode changes
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\quick-panel-transitions.ts`
  - derive calibration, preset, and draft state from the selected mode instead of a single global profile
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\selectors.ts`
  - expose the per-mode landing status needed by the home screen
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\home\LandingScreen.tsx`
  - show mode-specific calibration readiness and keep the CTA bound to the selected mode
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\components\CalibrationModeCard.tsx`
  - support lightweight per-card calibration status text or badge
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\customize\components\PanelSlice.tsx`
  - remove generic overlays from custom layouts and replace non-uniform preview scaling with one uniform crop scale
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\customize\components\PanelOverlay.tsx`
  - keep the overlay implementation only for modes that still use it
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\model\quickstar-crop.ts`
  - add any helper needed to compute centered preview crop frames or preview cover scaling cleanly
- `E:\Coding_things\Quick-Panel-Background-Cropper\i18next\locales\en.ts`
  - add any landing-mode status copy introduced by the UX change
- `E:\Coding_things\Quick-Panel-Background-Cropper\i18next\locales\zh.ts`
  - keep the new landing-mode status copy localized
- `E:\Coding_things\Quick-Panel-Background-Cropper\README.md`
  - describe that custom preview is box-only and that each mode keeps its own saved calibration
- `E:\Coding_things\Quick-Panel-Background-Cropper\CALIBRATION_PLAN.md`
  - document per-mode saved calibration behavior and the simplified custom preview

### Existing tests to verify

- `E:\Coding_things\Quick-Panel-Background-Cropper\__tests__\storage.test.ts`
  - validate that legacy migration expectations still hold after persistence changes
- `E:\Coding_things\Quick-Panel-Background-Cropper\__tests__\quick-panel-transitions.test.ts`
  - verify selected-mode behavior still matches expected state transitions
- `E:\Coding_things\Quick-Panel-Background-Cropper\__tests__\customize-screen.test.tsx`
  - ensure preview-related refactors do not break existing screen rendering assumptions

## Task 1: Persist One Saved Calibration Per Mode

**Files:**
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\storage.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\quick-panel-defaults.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\quick-panel-store.ts`

- [ ] Replace the single saved `CalibrationProfile` key with a saved-per-mode profile structure plus a persisted selected mode.
- [ ] Keep reading the legacy single-profile and legacy rect keys so older installs migrate cleanly.
- [ ] Initialize app state from the selected mode and its matching saved profile instead of whichever profile was saved last.
- [ ] Save calibration changes back only into the active mode slot.
- [ ] Commit the persistence changes.

## Task 2: Make Landing And Calibration State Mode-Driven

**Files:**
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\quick-panel-transitions.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\selectors.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\home\LandingScreen.tsx`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\components\CalibrationModeCard.tsx`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\i18next\locales\en.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\i18next\locales\zh.ts`

- [ ] When the user switches between `Default layout` and `Custom layout`, swap the active preset, calibration state, and editable draft to that mode's saved result.
- [ ] Keep `Start customizing` and `Recalibrate` bound to the currently selected mode only.
- [ ] Show a small mode-specific calibration status in the landing UI so the two saved workflows are visible.
- [ ] Keep the current overall layout and component structure intact; do not redesign the landing page beyond the mode-state polish.
- [ ] Commit the mode-driven UX changes.

## Task 3: Simplify Custom Preview And Remove Image Squash

**Files:**
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\customize\components\PanelSlice.tsx`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\customize\components\PanelOverlay.tsx`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\model\quickstar-crop.ts`

- [ ] Stop rendering `PanelOverlay` for custom-layout preview so the final preview becomes box-only.
- [ ] Replace the current per-axis image scaling in custom preview with one uniform cover scale derived from the snapped crop frame and visible panel box.
- [ ] Center the uniformly scaled preview content inside the visible panel box and clip tiny overflow instead of stretching the image.
- [ ] Keep the default-layout preview path unchanged, including its existing overlay treatment.
- [ ] Commit the preview-polish changes.

## Task 4: Verify Existing Behavior And Update Docs

**Files:**
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\README.md`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\CALIBRATION_PLAN.md`

- [ ] Document that custom preview is intentionally box-only and that export remains the source of truth for final panel output.
- [ ] Document that the app now keeps one saved calibration per mode.
- [ ] Run the repo's normal verification commands: `npm run lint` and `npm test -- --runInBand`.
- [ ] Run focused manual validation for:
  - saving both calibration modes without one replacing the other
  - switching modes on the landing page
  - confirming custom `buttonBox` preview no longer visibly squashes a face image
  - confirming custom preview no longer shows fake control overlays
- [ ] Commit the docs and verification updates.

## Implementation Notes

- Prefer small helpers over broad store refactors. The repo already has a compact state shape; extend it only where the dual-mode persistence truly needs it.
- Keep custom preview logic in the existing preview components unless a tiny helper extraction makes the math clearer.
- If existing tests need updates because the storage model changes, keep those updates focused on the new mode-indexed persistence rather than broad UI coverage.
- The preview fix should favor preserving subject proportions over perfectly filling every noisy calibration rectangle. Small center-cropped overflow is acceptable; geometric stretching is not.
