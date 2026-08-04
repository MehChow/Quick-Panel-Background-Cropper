# Customize Page Redesign Handoff

Date: 2026-08-04
Branch: `feature/v4-combined`
Status: Automated implementation complete; user-owned Samsung and QuickStar QA
pending.

## What was implemented

Customize now keeps the full calibrated layout as the image-positioning canvas,
while Button appearance editing uses a focused inspector:

- The main Customize preview still renders the complete visible panel union
  from one image and one shared `{ x, y, scale }` transform.
- The Button appearance dialog filters the preset to real Button panels and
  shows one calibrated Button at a time in an export-faithful, read-only
  preview.
- Previous/Next controls cycle the focused Button in visual order through
  vertically centered 44dp buttons in the outside gutters of a centered 70%
  preview surface; the visible position label row is intentionally omitted.
  This is screen-local display state and does not change calibration,
  selection, export order, filenames, or persisted settings.
- The dialog uses a transactional appearance draft. Color, opacity, HEX, and
  Light/Dark changes update the draft preview; only Confirm persists them.
  Cancel, backdrop dismissal, and Android Back discard the draft.
- Picker touches temporarily disable the dialog's outer scroll view so wheel,
  Brightness, and Opacity gestures do not compete with modal scrolling.
- The color wheel is 150dp square to reduce vertical pressure on short portrait
  screens.
- The dialog title row has a top-right eye action. It opens a separate,
  read-only full-layout preview overlay using the existing static
  `QuickPanelPreview` composition. It reflects the current image, transform,
  panel intensity, identifier settings, and latest valid draft appearance.
- The overall preview closes from the dimmed backdrop or Android Back and does
  not create a second native Modal, crop, transform, export surface, or
  persistence path.
- English and Traditional Chinese labels and accessibility copy were added for
  the focused inspector and overall preview actions.

## Main implementation boundaries

The main entry point remains
`src/features/quick-panel/customize/components/CustomizePreviewSection.tsx`.
It owns the main preview, Button controls card, and appearance-dialog open
state. The existing `QuickPanelPreview` remains the authoritative composition
for interactive and static preview rendering.

Appearance-dialog responsibilities are split across:

- `ButtonLabelAppearanceDialog.tsx` — local focused-panel state, draft wiring,
  confirm/cancel actions, and overall-preview state.
- `focused-button-inspector.ts` — ordered Button filtering and cyclic focus
  logic.
- `FocusedButtonAppearancePreview.tsx` — magnified rendering of one real
  calibrated Button through `QuickPanelPreviewStage`.
- `ButtonAppearanceInspectorControls.tsx` — edge navigation buttons over the
  focused preview.
- `ButtonLabelAppearanceDialogFrame.tsx` — modal, keyboard-safe shell, scroll
  container, footer, and top-right preview trigger.
- `ButtonLabelColorPicker.tsx` — picker controls and gesture-region callbacks.
- `ButtonAppearanceOverallPreviewOverlay.tsx` — read-only full-layout content
  rendered inside the existing modal replacement slot, backed by static
  `QuickPanelPreview`.
- `ButtonAdjustmentSlider.tsx`, `ButtonAdjustmentTabs.tsx`, and
  `src/components/ani-ui/slider.tsx` — live stepped slider feedback with one
  completion callback per gesture.
- `useButtonCustomizeControls.ts` — transient slider state separated from
  completion-based persistence, with combined-target intensity still isolated.

The relevant durable behavior is also recorded in `docs/notes.md` and the
design contract is in
`docs/superpowers/specs/2026-08-04-button-appearance-overall-preview-design.md`.

## Performance implementation boundary

The investigation identified the former nested-overlay state as the primary
target: the appearance flow could keep three render roots/contexts active
while the underlying interactive preview, focused inspector, and overall
preview were all mounted. The implementation now keeps one native Modal and
mounts either the focused inspector or the overall preview inside it.

- The underlying interactive `QuickPanelPreview` is suspended while appearance
  editing is open, but its slot and controlled `{ x, y, scale }` inputs remain
  stable so closing or confirming remounts the same composition.
- Slider values remain live in React for immediate feedback. AniUI Slider
  suppresses duplicate rounded steps and sends one final value on gesture
  finalization; only that completion writes the persistent setting.
- Preview proxy size, source-coordinate composition, panel geometry,
  identifier rendering, and sequential original-quality export are unchanged.

Development-client `gfxinfo` and `meminfo` counters remain directional
diagnostics, not release-build performance claims. If base pan/pinch lag still
appears in user testing, a single masked stage image is a separate future
investigation and is outside this change.

## User-owned manual checks

On the S25+, verify:

1. Open the nine-panel combined Customize page and confirm pan/pinch remains
   continuous.
2. Drag Image, Horizontal, and Vertical sliders; confirm live preview feedback
   and restart persistence.
3. Open Label appearance; confirm the focused Button and picker behavior are
   visually unchanged.
4. Open the eye preview; confirm the full layout replaces the inspector rather
   than visually stacking another modal.
5. Press Android Back once to return to the inspector, then again to discard
   the draft.
6. Close and reopen appearance repeatedly; confirm the main preview never
   enlarges, flashes, or loses its transform.
7. Confirm appearance, export, and verify the same Good Lock order, filenames,
   image placement, identifier styling, and `1024 x 1024` PNG output.

Automated checks are reported separately from this manual acceptance. Physical
Samsung, QuickStar, Good Lock, and release-build performance QA remain
user-owned.

## Automated verification

- Focused Customize, appearance, preview, slider, hook, and advanced-grid
  checks passed: 9 suites, 35 tests.
- Full Jest suite passed: 65 suites, 285 tests.
- `npm run lint` passed.
- `npx tsc --noEmit` passed.
- `git diff --check` passed.

## Files to read first when continuing

1. `AGENTS.md`
2. This handoff
3. `docs/notes.md`
4. `docs/superpowers/specs/2026-08-04-button-appearance-focused-inspector-design.md`
5. `docs/superpowers/specs/2026-08-04-button-appearance-overall-preview-design.md`
6. `src/features/quick-panel/customize/components/CustomizePreviewSection.tsx`
7. `src/features/quick-panel/customize/components/QuickPanelPreview.tsx`
8. `src/features/quick-panel/customize/components/QuickPanelPreviewStage.tsx`
9. `src/features/quick-panel/customize/hooks/useButtonCustomizeControls.ts`

Preserve the existing combined-mode changes in the dirty worktree. Do not
stage, commit, push, or broaden the performance work beyond measured evidence.
