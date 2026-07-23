# Customize Source Context Boundary and Footer Handoff

## Goal

Simplify the Customize source-context UI so it explains only the overall image
movement boundary, and move the eye toggle into the fixed footer beside
`Select another image`.

Work inline in the current checkout. Do not commit, push, use subagents, reset
the working tree, or clear/migrate persisted app data.

## Read first

1. `AGENTS.md`
2. `docs/styling.md`
3. `docs/superpowers/specs/2026-07-20-customize-source-image-context-design.md`
4. `docs/superpowers/plans/2026-07-20-customize-source-image-context.md`
5. `docs/2026-07-20-customize-source-context-followup-handoff.md`
6. This handoff, which supersedes every per-panel crop-square and preview-row
   requirement in those earlier documents
7. `src/features/quick-panel/customize/CustomizeScreen.tsx`
8. `src/features/quick-panel/customize/components/CustomizeActions.tsx`
9. `src/features/quick-panel/customize/components/CustomizePreviewSection.tsx`
10. `src/features/quick-panel/customize/components/QuickPanelPreview.tsx`
11. `src/features/quick-panel/customize/components/SourceImageContext.tsx`
12. `src/features/quick-panel/customize/components/SourceImageContextToggle.tsx`
13. `src/features/quick-panel/customize/source-image-context-geometry.ts`

Before editing production code, read the exact Expo 56 Image and SVG docs:

- <https://docs.expo.dev/versions/v56.0.0/sdk/image/>
- <https://docs.expo.dev/versions/v56.0.0/sdk/svg/>

## Current working tree

The source-context feature and its first stabilization follow-up are complete
but intentionally uncommitted. Preserve all existing work.

The current implementation already provides:

- persisted default-on MMKV preference under
  `quick-panel.show-source-image-context`;
- one static `getImagePlacementBounds(preset)` preview stage in both eye states;
- stable mounted shared and per-panel `expo-image` nodes across toggles;
- SVG panel backings and inverse dim treatment;
- exact colored crop-square outlines for every panel;
- a separate eye-control row above the preview;
- localized English and Traditional Chinese accessibility labels;
- preview/export isolation; and
- focused regression coverage.

Verification after the stabilization follow-up passed with 45 Jest suites / 160
tests, TypeScript, Expo lint, `git diff --check`, and an Android Expo export.

## User feedback and confirmed direction

The exact per-panel square outlines are technically correct but difficult to
read. Wide Controls panels produce overlapping horizontal square edges, so the
different colors look like unrelated bands stacked through the image.

The eye icon also feels detached when it sits above the preview. The fixed
footer already owns Customize actions and is a more stable, discoverable home.

The approved direction is:

- the overall movement boundary is enough;
- do not show or inspect individual panel crop squares; and
- place the eye toggle beside `Select another image` in the fixed footer, using
  the same row spacing and height.

The supplied screenshot was:

`/var/folders/47/jh63_12d55g251gtmd2ngw600000gn/T/codex-clipboard-8449ac32-4be0-4f17-8127-f84bcc91513e.png`

The handoff is self-contained if that temporary file is unavailable.

## Approved replacement contract

### One overall movement boundary

- Remove all per-panel crop-square outlines from the preview.
- Delete `SourceContextCropSquare`, `getSourceContextCropSquares()`, and the
  deterministic HSL stroke helper if they have no remaining callers.
- Keep `getCustomizePreviewFrame(preset)` returning
  `getImagePlacementBounds(preset)`. Do not change fit, pan, pinch, clamp, focal
  mapping, or export geometry.
- While source context is visible, draw one outline for the complete placement
  frame used by the preview and gesture clamp.
- Render the boundary as one SVG `Rect` in the existing logical viewBox:
  - `fill="none"`;
  - amber helper accent `#f5d6aa` at approximately 55% stroke opacity;
  - two-point visual stroke through `strokeWidth={2 / layoutScale}`;
  - inset each edge by `1 / layoutScale` so the stroke is not clipped by the
    stage's `overflow: "hidden"`; and
  - no label, legend, dash animation, warning, or per-panel color.
- Keep the boundary node mounted across eye toggles. Set its stroke opacity to
  zero when source context is hidden.
- Draw the boundary above the inverse dim layer and below every `PanelSlice`.
- Keep the shared source image, SVG panel backings, inverse dim layer, stable
  per-panel image nodes, panel borders, overlays, identifiers, and current
  opacity behavior unchanged.
- The boundary is preview-only and must never reach `ExportSurface`,
  `ExportSurfaceHost`, `useSequentialExport`, or file-saving services.

### Eye toggle in the fixed footer

- Remove the `source-image-context-controls` row from `QuickPanelPreview`.
- `QuickPanelPreview` should receive only `showSourceImageContext`; remove
  `onShowSourceImageContextChange` from its props.
- Remove the same callback pass-through from `CustomizePreviewSection`.
- Keep `showSourceImageContext` in the preview path because it controls layer
  visibility. Eye state must still never reach export code.
- Add `showSourceImageContext` and
  `onShowSourceImageContextChange(value: boolean)` to `CustomizeActions`.
- In `CustomizeScreen`, pass the persisted value/setter to `CustomizeActions`
  and pass only the value to `CustomizePreviewSection`.
- In the first footer row, render:
  - `Select another image` as the existing white button with `flex-1`; and
  - the eye toggle immediately to its right as a square button.
- Use `flex-row gap-3` for the row. The eye button must match the image button's
  48-point `min-h-12` height: `h-12 w-12 p-0 rounded-md`.
- Keep the eye button visually secondary with a black surface, subtle white
  border, and white 20-point `eye` / `eye-off` icon.
- Prefer the shared AniUI `Button` primitive inside
  `SourceImageContextToggle` instead of a standalone `Pressable`.
- Preserve localized state-specific accessibility labels, button semantics,
  `accessibilityState={{ selected: value }}`, and
  `testID="source-image-context-toggle"`.
- Disable the eye button whenever `CustomizeActions` is busy
  (`isExporting || isProcessingImage`), matching the adjacent footer action.
- Keep the toggle visible only when an image exists, as today.
- Toggling remains immediate and changes no `ImageTransform`, preview URI,
  export state, Button adjustment state, or persisted key.

## Requirements that are now obsolete

Do not carry forward these parts of the earlier spec, plan, or handoff:

- one differently colored crop square per panel;
- `getExportSquareRect()` as preview-outline geometry;
- HSL colors by visual index;
- `source-context-crop-square` nodes or tests;
- a dedicated eye-control row above the preview; or
- preview-owned toggle callbacks and interaction tests.

The static preview frame and stable mounted image-layer lifecycle from the first
follow-up remain required. Moving the control must not reintroduce preview
resize, flash, or remount behavior.

## Test-first implementation sequence

Use systematic debugging and TDD. Update tests and confirm the current code
fails the new contract before editing production files.

### 1. Replace crop squares with the movement boundary

Update `__tests__/source-image-context-geometry.test.ts`:

- remove Controls and Buttons crop-square tests and their
  `getExportSquareRect()` imports;
- keep the authoritative placement-frame, panel-radius, dim-path, and opacity
  tests; and
- do not add a second geometry source for the boundary: it is the existing
  preview `frame`.

Update `__tests__/source-image-context.test.tsx` to assert:

- exactly one `source-context-movement-boundary` node exists for both Controls
  and Buttons presets;
- its `x`, `y`, `width`, and `height` equal the inset placement frame;
- it uses `fill="none"`, the approved stroke, and
  `strokeWidth={2 / layoutScale}`;
- `strokeOpacity` is visible with source context on and zero with it off;
- no `source-context-crop-square` node exists; and
- shared image, backing, dim, intensity, and hidden-layer assertions still
  pass.

Run the two suites and confirm they fail against the current colored-square
implementation.

Then remove the crop-square geometry and render the one stable boundary in
`SourceImageContext`.

### 2. Move eye interaction into `CustomizeActions`

Add focused coverage for `CustomizeActions` (create
`__tests__/customize-actions-source-context.test.tsx` if no suitable suite
exists). Assert:

- the eye is in the same first-row container as `Select another image`;
- the image button is flexible and the eye button is `h-12 w-12`;
- pressing the localized hide action calls the setter with `false`;
- rerendering off exposes the localized show action and pressing it calls the
  setter with `true`;
- accessibility selected state tracks the persisted value; and
- both first-row actions are disabled during export or image processing.

Update `__tests__/quick-panel-preview-source-context.test.tsx`:

- remove translation, icon, press, and `source-image-context-controls` tests;
- rerender the preview directly from on to off and back on;
- retain assertions for the same placement frame, stage aspect ratio/width,
  image-node counts, zero source/panel remounts, and zero transform commits; and
- assert `source-image-context-toggle` is absent from the preview tree.

Update screen integration tests to capture both `CustomizeActions` and preview
props:

- `CustomizeActions` receives the persisted value and setter;
- `QuickPanelPreview` receives the value but no toggle callback; and
- export surfaces receive neither source-context prop nor callback.

Run the focused footer, preview, screen, and export-isolation suites before and
after production changes.

### 3. Update durable documentation

Update all three artifacts so they no longer present colored per-panel squares
or a preview-level eye row as current behavior:

- `docs/superpowers/specs/2026-07-20-customize-source-image-context-design.md`
- `docs/superpowers/plans/2026-07-20-customize-source-image-context.md`
- `docs/notes.md`

Keep this handoff as the final authority if historical descriptions remain in
the earlier follow-up handoff.

## Preserve without changes

- `quick-panel.show-source-image-context`, its default-on behavior, and all
  existing MMKV data;
- static placement-frame preview geometry;
- stable mounted shared and per-panel `expo-image` nodes;
- preview proxy URI and `cachePolicy="memory-disk"`;
- Controls preview intensity at `0.5`;
- screen-local Button image intensity and identifier controls;
- image transform, clamp, and gesture worklets;
- English and Traditional Chinese copy;
- image-placement helper sheet behavior; and
- all export rendering, ordering, filenames, dimensions, and saving services.

## Verification

Run:

```bash
npm test -- --runInBand \
  __tests__/source-image-context-geometry.test.ts \
  __tests__/source-image-context.test.tsx \
  __tests__/customize-actions-source-context.test.tsx \
  __tests__/quick-panel-preview-source-context.test.tsx \
  __tests__/quick-panel-preview-gestures.test.tsx \
  __tests__/panel-image-intensity.test.tsx \
  __tests__/customize-screen.test.tsx \
  __tests__/customize-screen-export-surfaces.test.tsx
npm test -- --runInBand --no-cache
npx tsc --noEmit
npm run lint
git diff --check
npx expo export --platform android --output-dir /tmp/qpbc-source-context-boundary-footer
```

Inspect the final diff to confirm:

- no existing MMKV key changed;
- crop-square production code and tests were removed;
- only one movement-boundary node remains;
- no eye control remains in the preview tree;
- source-context state reaches the footer and preview only, never export code;
- affected/new component files stay below 150 lines; and
- no unrelated working-tree changes were overwritten.

## Required Android QA

On the S25+ baseline, verify Default, Advanced Controls, and Advanced Buttons:

1. Source mode shows one understandable overall movement boundary and no
   colored horizontal crop bands.
2. The eye button sits to the right of `Select another image`, with matching
   height, radius, row gap, and footer padding.
3. Toggling repeatedly causes no preview resize, vertical movement, blank
   frame, source reload, transform reset, or gesture interruption.
4. The eye icon, selected state, and English/Traditional Chinese accessibility
   labels update correctly.
5. At each pan boundary, the source-image edge and overall guide explain why
   movement stops; zooming creates additional movement room.
6. Button intensity and identifiers remain unchanged.
7. Leaving/reopening Customize and restarting the app preserves the eye choice.
8. Exports retain the same dimensions, filenames, order, composition, and
   applied QuickStar result.

Suggested commit message for the user to run after QA:

`fix: simplify source context controls`
