# Buttons Identifier Position Controls Handoff

## Goal

Continue the shipped first-pass Buttons identifier overlay by adding constrained
position controls for long Buttons. Horizontal icon-and-label groups should move
left/right; vertical icons should move up/down; square-like identifiers should
stay exactly as they are.

## User-approved decisions

- Use two independent sliders, not one coupled slider.
- Horizontal position applies only when `columnSpan > rowSpan`.
- Vertical position applies only when `rowSpan > columnSpan`.
- Equal-span Buttons such as `1x1` and `2x2` ignore both values.
- Both values are screen-local, default to `50`, and reset on every Customize
  visit.
- Move the horizontal icon and label together.
- Constrain movement inside target-specific safe insets.
- Preview and export share normalized values but derive separate pixel offsets.
- Hide an orientation slider when the preset contains no Button of that shape.
- Do not add per-Button position controls in this pass.

## Visual evidence

The Samsung screenshot showed:

- Wi-Fi and Modes: horizontal identifiers felt too close to the left edge.
- Bluetooth and SmartThings: vertical icons felt too close to the top edge.
- Smart View and the custom Zap Button: square-like placement looked correct.

The captured device window was labelled `SM-S9360`. One UI and QuickStar
versions were not recorded. The original images came from temporary clipboard
paths and may need to be reattached in a future session.

## Read first

1. `AGENTS.md`
2. `docs/superpowers/specs/2026-07-17-buttons-identifier-position-controls-design.md`
3. `docs/superpowers/plans/2026-07-17-buttons-identifier-position-controls.md`
4. `docs/superpowers/specs/2026-07-17-buttons-identifier-overlay-design.md`
5. `docs/notes.md`

## Current code baseline

- Baseline commit: `d13e64a feat: add Button identifier overlays (one-shot)`
- Pure layout: `src/features/quick-panel/model/button-identifier-layout.ts`
- Shared renderer:
  `src/features/quick-panel/customize/components/ButtonIdentifierOverlay.tsx`
- Customize controls:
  `src/features/quick-panel/customize/components/ButtonCustomizeControls.tsx`
- Screen state: `src/features/quick-panel/customize/CustomizeScreen.tsx`
- Export readiness:
  `src/features/quick-panel/customize/export-surface-readiness.ts`

The first-pass implementation was verified at 34 Jest suites / 97 tests before
the baseline commit. Run a fresh baseline at the start of the next session.

## Important implementation detail

Horizontal movement needs the final localized icon-and-label group width. The
approved design measures that group, calculates its safe travel, and delays
export readiness until the positioned re-render has committed. Vertical
movement needs no content measurement because the icon size is already known.

Do not approximate localized text width from character count and do not allow
export capture to race the horizontal measurement.

## Constraints

- Read the Expo 56 docs before code changes.
- Work inline only; no subagents or browser demo.
- Do not commit or push.
- Add no dependencies or persistence.
- Preserve Default, Advanced Controls, calibration, filenames/order, the 78%
  Button image default, the 70% identifier default, and square-like output.
- No `useMemo`, `useCallback`, or `React.memo` outside AniUI.
- Keep materially changed components under 150 lines.

## Next-session start

Use `superpowers:executing-plans` and follow the saved plan task-by-task with
red/green test checkpoints. Finish with Samsung/Good Lock QA at `0`, `50`, and
`100` for both orientations and record the device, One UI, and QuickStar
versions.

Suggested final commit message for the user to run:

`feat: adjust long Button identifier positions`
