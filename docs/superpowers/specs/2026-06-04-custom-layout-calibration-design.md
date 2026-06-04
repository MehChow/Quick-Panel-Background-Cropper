# Quick Panel Custom Layout Calibration Design

Author: Codex, GPT-5
Date: 2026-06-04
Status: Draft for review

## Summary

The app currently supports Samsung Galaxy phones on Android 16 and One UI 8.5 only when the Quick Panel uses the default layout. That implementation calibrates one outer rectangle and scales a fixed Galaxy S25+ reference preset into the user's screenshot.

This design adds support for customized Quick Panel layouts on the same target platform while preserving the current fast path for default layouts.

## Research Summary

### Repo and product context

- The current app stores one calibrated outer rectangle and derives all export surfaces from a fixed `s25PlusOneUi85Preset`.
- `README.md` and `CALIBRATION_PLAN.md` explicitly scope the current app to the default Quick Panel layout.
- `CALIBRATION_PLAN.md` already identifies advanced per-panel calibration as the likely next step for broader layout coverage.

### Tech stack constraints

- Expo Router must follow Expo SDK 56 routing rules and app config conventions.
- `expo-image` remains the correct image component for preview rendering.
- `expo-image-picker` and `expo-media-library` remain the correct image import and export path for Android builds.
- Uniwind requires complete class names at build time, so conditional styling must use explicit mappings instead of dynamic string construction.
- Zustand can support versioned persistence and migration cleanly.
- AniUI components are source-owned components and can be extended locally without introducing another UI dependency.

### Samsung behavior constraints

- Samsung's public One UI 8.5 materials say the Quick Panel can be moved, resized, added to, and reduced.
- Samsung support guidance for One UI 8.5 describes individually editable Quick Panel controls.
- Good Lock QuickStar still focuses on theming and grid behavior, not a stable geometry API for this app.

## Product Goal

Support customized Quick Panel layouts on Samsung Galaxy S25+ running One UI 8.5 by letting users explicitly calibrate the exportable panel surfaces when the default one-box inference is no longer reliable.

## Scope

### In scope

- Preserve the current default-layout calibration flow as a fast path.
- Add a separate custom-layout calibration mode.
- Support the same four export targets:
  - `buttonBox`
  - `brightness`
  - `volume`
  - `mediaPlayer`
- Let users mark a panel as present or hidden in custom mode.
- Generate previews and exports from explicit per-panel geometry in custom mode.
- Migrate existing saved calibrations without breaking the current app flow.

### Out of scope

- Automatic Quick Panel layout detection from screenshots.
- Support for foldables, tablets, DeX, or non-One UI 8.5 devices.
- Support for export targets beyond the current four panels.
- OCR, computer vision, or Good Lock integration beyond the current export workflow.

## User Experience

### Landing flow

The landing flow keeps the current calibration entry point but adds a layout-mode choice:

- `Default layout`
- `Custom layout`

Default layout preserves the existing one-box calibration behavior.

Custom layout starts a per-panel calibration wizard.

### Custom layout calibration flow

1. Import one fully expanded Quick Panel screenshot.
2. Step through the four exportable panels in a fixed order.
3. For each panel:
   - place and adjust a rectangle, or
   - mark the panel as hidden.
4. Show a review step with all configured panels.
5. Save the custom calibration.
6. Continue to image selection, preview, and export.

### Completion rules

Custom calibration is complete only when:

- every panel is either `present` or `hidden`, and
- at least one panel is `present`.

Saving is blocked if any panel is still `unconfigured` or if all panels are hidden.

## Geometry Model

### Default mode

Default mode continues to use:

- one outer calibration rectangle
- the current `s25PlusOneUi85Preset`
- scaled preset derivation through the existing union-based logic

### Custom mode

Custom mode uses explicit panel geometry as the source of truth.

Each exportable panel has:

- `id`
- `status`
- `rect` when present

No inner geometry is inferred from the S25+ preset in custom mode. The preview and export surfaces are built directly from calibrated panel rectangles.

## Data Model

Introduce a versioned calibration profile that can represent both modes.

```ts
type CalibrationMode = "default-union" | "custom-panels";

type PanelCalibrationStatus = "present" | "hidden" | "unconfigured";

interface PanelCalibration {
  id: PanelId;
  status: PanelCalibrationStatus;
  rect: PanelRect | null;
}

interface DefaultUnionCalibration {
  mode: "default-union";
  rect: PanelRect;
}

interface CustomPanelsCalibration {
  mode: "custom-panels";
  panels: Record<PanelId, PanelCalibration>;
}

type SavedCalibrationProfile =
  | DefaultUnionCalibration
  | CustomPanelsCalibration;
```

## Persistence and migration

- Existing saved calibration data migrates to `mode: "default-union"`.
- New custom-layout calibrations save explicit per-panel geometry.
- The store should carry a schema version for future migrations.
- Existing users must not be forced to recalibrate.

## Store and state changes

The app should stop treating `activePreset` as persisted source-of-truth state.

Instead:

- persisted calibration data becomes the source of truth
- runtime geometry is derived from that calibration data
- the current preview/export flow reads the derived preset

New state will also need:

- selected calibration mode
- current custom wizard step
- temporary per-panel calibration edits before save

## Preview and export behavior

- Default mode preview remains unchanged.
- Custom mode preview renders only panels with `status: "present"`.
- Export order still follows the existing Good Lock order.
- Hidden panels are skipped during export.
- The current square export logic stays the same per present panel.

## Error handling

- Prevent save when a custom calibration is incomplete.
- Prevent export when no present panels exist.
- Show clear panel-specific guidance when a panel has not been configured yet.
- Keep the current media library and image import permission behavior unchanged for this feature.

## Testing strategy

Write focused tests for:

- migration from legacy saved calibration data
- custom calibration completion rules
- derived preset generation from per-panel geometry
- hidden-panel filtering in preview/export preparation
- regression coverage for the current default-layout flow

Manual verification should cover:

- default layout calibration still works
- custom layout calibration can save with mixed present and hidden panels
- preview matches calibrated panel placement
- export count and filenames match only the present panels

## Delivery plan

Implementation should proceed in this order:

1. Add new calibration types and storage migration.
2. Add derived preset generation for custom panel geometry.
3. Add layout-mode selection and restore flow.
4. Build the custom-layout calibration wizard UI.
5. Update preview and export filtering for hidden panels.
6. Update docs and build configuration for a testable APK artifact.

## Open decisions resolved

- Preserve both modes: yes.
- Start with manual per-panel calibration: yes.
- Support hidden panels in custom mode: yes.
- Keep the same four export targets first: yes.
