# Remove Customize Source Image Context Implementation Plan

> **For agentic workers:** Execute inline in the current workspace; do not use subagents, commit, or push.

**Goal:** Remove the Customize source-image context preview, amber boundary, eye toggle, and persisted preference while retaining the normal panel preview and export flow.

**Architecture:** Simplify Customize so the preview always renders panel slices directly. Remove source-context-only storage, geometry, components, locale copy, and tests; keep the shared placement-frame calculation and panel-radius behavior only where still needed by the normal preview.

**Tech Stack:** Expo SDK 56, React Native, TypeScript, Jest, React Native Testing Library, Uniwind.

## Global Constraints

- Preserve existing calibration, image transform, Button identifier, and export behavior.
- Do not reset or modify unrelated persisted app data.
- Keep files under 150 lines where practical and use typed props/interfaces.
- Do not commit or push.

### Task 1: Update tests to describe the simplified preview

**Files:**
- Modify: `__tests__/customize-screen-export-surfaces.test.tsx`
- Modify: `__tests__/quick-panel-preview-source-context.test.tsx`
- Modify: `__tests__/customize-actions-source-context.test.tsx`
- Modify: `__tests__/locales.test.ts`
- Modify: `__tests__/storage.test.ts`

- [ ] Remove assertions and fixtures for source-context props, eye toggles, source-layer mounts, and the obsolete persisted key. Replace the preview suite with assertions that panel slices render without source-context props and preserve the placement frame.
- [ ] Run the focused suites and confirm they fail because production still exposes the removed behavior.

### Task 2: Remove source-context production wiring

**Files:**
- Modify: `src/features/quick-panel/customize/CustomizeScreen.tsx`
- Modify: `src/features/quick-panel/customize/components/CustomizeActions.tsx`
- Modify: `src/features/quick-panel/customize/components/CustomizePreviewSection.tsx`
- Modify: `src/features/quick-panel/customize/components/QuickPanelPreview.tsx`
- Modify: `src/features/quick-panel/customize/components/PanelSlice.tsx`
- Modify: `src/features/quick-panel/store/storage.ts`
- Modify: `i18next/locales/en.ts`
- Modify: `i18next/locales/zh.ts`
- Delete: `src/features/quick-panel/customize/components/SourceImageContext.tsx`
- Delete: `src/features/quick-panel/customize/components/SourceImageContextToggle.tsx`
- Delete: `src/features/quick-panel/customize/source-image-context-geometry.ts`

- [ ] Remove the hook, state, props, toggle rendering, source layer, conditional panel image opacity, and source-only geometry helpers.
- [ ] Keep `getCustomizePreviewFrame` and `getPreviewPanelRadius` in a focused shared geometry module if still required by the preview and panel slices.
- [ ] Remove only source-context locale keys; retain image-placement help copy because it explains the placement boundary independently.

### Task 3: Verify the removal

- [ ] Run the focused changed suites and confirm they pass.
- [ ] Search source, tests, and locales for active source-context identifiers; only historical docs may remain.
- [ ] Run TypeScript, lint, and `git diff --check` checks available in the repository.
- [ ] Review the final diff for unrelated changes and report the requested brief commit message without creating a commit.
