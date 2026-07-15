# Buttons Selection Area Preview Handoff

## Implemented

Advanced Buttons-only `panelSelection` now has eye button beside search field.

- Tap eye to open read-only preview. No long-press behavior.
- Transparent modal dims full screen and blocks picker scrolling.
- Tap backdrop or Android back to close; accessibility focus returns to eye.
- Opening triggers one selection haptic.
- Preview crops imported screenshot to clamped `outerRect` bounds.
- Crop keeps aspect ratio, emerald outline, side margins, and short-screen cap.
- Reanimated entrance starts at eye center: scale `0.65`, translate, fade, 200 ms.
- Exit reverses in 140 ms. Reduced motion uses 120 ms fade only.
- Animation values reset before every open, preventing alternating center-origin bug.
- No new dependency, generated crop file, persistence, or calibration mutation.

## Main Files

- `src/features/quick-panel/calibration/advanced/components/ButtonAreaPreview.tsx`
- `src/features/quick-panel/calibration/advanced/components/ButtonAreaPreviewOverlay.tsx`
- `src/features/quick-panel/calibration/advanced/button-area-preview-animation.ts`
- `src/features/quick-panel/calibration/advanced/button-area-preview-geometry.ts`
- `src/features/quick-panel/calibration/advanced/components/ButtonPanelSelection.tsx`
- `__tests__/button-area-preview*.test.*`

Design source:
`docs/superpowers/specs/2026-07-15-buttons-selection-area-preview-design.md`

## Verification

Last run:

- `npm test -- --runInBand`: 24 suites, 53 tests passed.
- `npm run lint`: passed.
- `npx tsc --noEmit`: passed.
- `git diff --check`: passed.

## Manual QA

Check tap open, backdrop close, Android back, repeated origin animation,
short-screen crop sizing, accurate green-area crop, and TalkBack labels.
