# Controls Preview and Button Image Intensity Handoff

## Start Here

Read `AGENTS.md`, `docs/v4-idea.md`, and this file before changing code. Follow
the Expo 56 documentation required by the repo instructions. Work inline only;
do not use subagents or a browser demo.

## Goal

Bring the current v3 Customize preview and wording in line with measured One UI
8.5 behavior without implementing the future Controls + Buttons flow.

## Confirmed Device Evidence

The lossless chart under `docs/testing-assets/` was applied to Wi-Fi, Bluetooth,
Button box, Brightness, Volume, and Media player.

- Buttons at 100% preserved 100% of the source contrast.
- All four Controls retained about 50% of the source contrast.
- Buttons exported at 50% matched Controls exactly when both families were
  measured in the same system screenshot.
- Neutral source tiles picked up wallpaper tint on Controls, confirming alpha
  compositing over One UI's blurred/tinted panel background.
- PNG alpha alone is sufficient; no brightness, contrast, blur, or dark overlay
  is needed for the basic match.

The test method and full v4 decisions are recorded in `docs/v4-idea.md`.

## Implement Now

1. Correct the Controls preview in
   `src/features/quick-panel/customize/components/PanelSlice.tsx`:
   - Render Controls images at `opacity: 0.5`.
   - Remove the Controls-only `bg-black/10` overlay.
   - Keep Buttons preview opacity driven by the existing slider value.
2. Preserve export behavior in `ExportSurface.tsx`:
   - Controls export at opacity `1`.
   - Buttons export using the selected Button opacity.
3. Rename only the user-facing slider copy:
   - English: `Button image intensity`
   - Traditional Chinese: `按鈕圖片強度`
   - The existing i18n key and internal `buttonPanelOpacity` names may remain;
     they still accurately describe the alpha implementation and avoiding a
     mechanical prop-chain rename keeps the patch narrow.
4. Keep the current Buttons-only default at 78% and keep the value local to the
   Customize screen.
5. Add a short `docs/notes.md` entry after implementation with the measured 50%
   result and the preview/export distinction.

## Do Not Implement Yet

- Do not add a Controls-only slider.
- Do not change Controls export opacity.
- Do not change the current Buttons-only default to 50%.
- Do not add persistence or storage migration.
- Do not add the v4 Controls + Buttons target, mixed calibration, or mixed-mode
  50% default in this pass.
- Do not add image-processing dependencies or brightness/contrast filters.

## Main Files

- `src/features/quick-panel/customize/components/PanelSlice.tsx`
- `src/features/quick-panel/customize/components/ExportSurface.tsx`
- `i18next/locales/en.ts`
- `i18next/locales/zh.ts`
- `docs/notes.md`

Reference assets:

- `docs/testing-assets/one-ui-8-5-gray-patches.png`
- `docs/testing-assets/one-ui-8-5-gray-patches.svg`

## Verification

Run:

- `npm test -- --runInBand`
- `npm run lint`
- `npx tsc --noEmit`
- `git diff --check`

Add focused coverage for the preview family behavior if the current component
test setup can inspect the animated image style without production-only test
hooks. Do not introduce an abstraction solely for the test.

Manual QA:

- Controls preview looks approximately half-strength instead of merely 10%
  darker.
- Buttons preview still follows the slider live.
- Buttons-only still starts at 78% on a fresh Customize visit.
- Controls PNG exports remain fully opaque.
- Buttons PNG exports retain the selected alpha.
- Both locale labels fit the existing slider card.
