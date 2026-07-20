# Customize Source Context Follow-up Handoff

## Goal

Fix the newly implemented Customize source-image context so the eye control is
outside the preview, toggling never resizes or refreshes the preview, and each
panel's real QuickStar square crop is visible as a differently colored outline
while source context is enabled.

Work inline in the current checkout. Do not commit, push, use subagents, reset
the working tree, or clear/migrate any persisted app data.

## Read first

1. `AGENTS.md`
2. `docs/superpowers/specs/2026-07-20-customize-source-image-context-design.md`
3. `docs/superpowers/plans/2026-07-20-customize-source-image-context.md`
4. This handoff, which supersedes the two-frame and conditional-mount details
   in those earlier documents
5. `src/features/quick-panel/customize/components/QuickPanelPreview.tsx`
6. `src/features/quick-panel/customize/components/SourceImageContext.tsx`
7. `src/features/quick-panel/customize/components/PanelSlice.tsx`
8. `src/features/quick-panel/customize/source-image-context-geometry.ts`
9. `src/features/quick-panel/customize/hooks/useQuickPanelPreviewGestures.ts`
10. `src/features/quick-panel/model/panel-geometry.ts`

Review the user recording:

`/Users/mac/Downloads/WhatsApp Video 2026-07-20 at 12.40.38.mp4`

It is a 5.01-second, 1080x2340 Android recording. It clearly shows the eye
moving with the preview, the preview stage changing height, and a visible flash
when the source-context state changes.

## Current working tree

The first source-context implementation is complete but intentionally
uncommitted. Preserve it. It already provides:

- persisted default-on MMKV preference under
  `quick-panel.show-source-image-context`;
- one shared transformed source image in source-context mode;
- SVG panel backing and inverse dim layers;
- overlay-only panel slices in source-context mode;
- localized English and Traditional Chinese eye/helper copy;
- image-placement helper sheet;
- preview/export isolation tests; and
- `react-native-svg@15.15.4` installed through Expo 56.

Before this follow-up, verification passed with 45 Jest suites / 158 tests,
TypeScript, Expo lint, `git diff --check`, and an Android Expo export. A normal
cached Jest run can intermittently time out in the pre-existing
`calibration-area-preview.test.tsx`; its isolated run and uncached full runs
pass, and no calibration file belongs in this follow-up.

## Confirmed root cause

`QuickPanelPreview` currently calls:

```ts
getCustomizePreviewFrame(preset, showSourceImageContext)
```

The eye therefore switches between `preset.customizationArea` and
`getImagePlacementBounds(preset)`. Those frames have different heights and
aspect ratios. The frame-keyed gesture layout temporarily returns
`layoutScale = null`, the stage collapses/re-expands, and the screen content
moves.

The render tree also conditionally swaps between one shared
`SourceImageContext` image and the per-panel `PanelSlice` images. Even though
all images use the same bounded proxy URI and `cachePolicy="memory-disk"`, the
conditional mount creates another opportunity for a visible blank frame.

The transform itself is not jumping. The problem is presentation-frame and
image-layer lifecycle churn.

## Approved replacement contract

### Static control and preview geometry

- Put the 44-point eye control in a dedicated row directly above the preview,
  right-aligned to the preview width.
- The eye must not be absolutely positioned over the image and must remain
  outside `GestureDetector`.
- Always use `getImagePlacementBounds(preset)` as the preview stage frame,
  whether source context is visible or hidden.
- Keep the same stage width, height, origin, aspect ratio, `layoutScale`, and
  gesture focal mapping across eye toggles.
- The clean state intentionally reserves the full placement-frame height; the
  area outside the panel shapes is simply visually empty.
- Do not animate or crossfade the stage size.

### Stable image layers

- Keep the shared source image and every per-panel image mounted across eye
  toggles. Toggle only visual opacity/background treatment.
- Source context on:
  - shared source image, SVG panel backings, inverse dim layer, and crop-square
    outlines are visible;
  - per-panel image layers and their `bg-white/10` backing are visually hidden;
  - existing panel borders, Controls overlays, Button overlays, and identifiers
    remain visible above the source layers.
- Source context off:
  - shared source image, its SVG backings, dim layer, and crop-square outlines
    are visually hidden;
  - per-panel images and `bg-white/10` backing are visible;
  - no image component is unmounted or recreated.
- Use an immediate state change, not an opacity animation. The requirement is
  zero flash and zero layout movement.
- Reusing invisible preview-proxy images is an approved tradeoff. This
  supersedes the earlier source-mode test that required exactly one mounted
  `expo-image` instance. Exports still mount independently and remain unchanged.

### Exact crop-square outlines

- Derive every outline from the existing `getExportSquareRect(panel)` helper.
  Do not approximate the square from the visible panel or placement union.
- Keep one square node mounted per `preset.visualOrder` entry and make its
  stroke visible only while source context is enabled.
- Use no fill, label, legend, warning, or animation.
- Use a two-point visual stroke. When drawing in the logical SVG viewBox, set
  `strokeWidth={2 / layoutScale}` so the rendered line stays two points wide.
- Give squares deterministic contrasting colors by visual index. Use this
  helper:

```ts
function getCropSquareStroke(index: number) {
  const hue = Math.round(index * 137.508) % 360;
  return `hsl(${hue}, 85%, 65%)`;
}
```

- Draw the outline SVG above the inverse dim layer but below `PanelSlice`, so
  hidden square edges remain legible while panel borders and overlays retain
  priority.
- The outlines are preview-only and must never reach export components.

## Earlier requirements that are now obsolete

Do not carry forward these parts of the original spec/plan:

- the clean/source two-presentation-frame model;
- the statement that switching the eye may resize the preview;
- frame-key invalidation driven by the eye state;
- conditional mounting of `SourceImageContext` versus per-panel images;
- the source-mode assertion that only one `expo-image` node is mounted; or
- the floating absolute eye position inside the preview wrapper.

All persistence, localization, helper-sheet, opacity, transform, caching, and
export-isolation requirements from the original documents remain active.

## Test-first implementation sequence

Use systematic debugging and TDD. Read the exact Expo 56 Image and SVG docs
before editing production code.

### 1. Lock the preview frame and control position

Update `__tests__/source-image-context-geometry.test.ts` so
`getCustomizePreviewFrame(preset)` always equals
`getImagePlacementBounds(preset)`. Remove the eye boolean from that helper.

Update `__tests__/quick-panel-preview-source-context.test.tsx` to rerender the
same preview from eye-on to eye-off and assert:

- the gesture hook receives the same `previewFrame` object values both times;
- the preview stage keeps the same aspect ratio and width;
- `onTransformChange` is never called;
- the source component and panel slices remain mounted; and
- `source-image-context-toggle` is inside a separate
  `source-image-context-controls` row, not inside the gesture host.

Run the two suites and confirm they fail for the current two-frame/absolute-eye
implementation before changing source files.

Then update `QuickPanelPreview.tsx` and `SourceImageContextToggle.tsx`:

- use one placement frame regardless of the eye value;
- render a stable right-aligned controls row above the stage;
- remove absolute-positioning classes from the toggle; and
- always render `SourceImageContext` and every `PanelSlice`.

### 2. Keep image nodes mounted while toggling visibility

Change `SourceImageContext` to accept `visible: boolean`. Keep its `Image` and
SVG nodes mounted, but set source-image opacity, backing opacity, dim opacity,
and outline opacity to zero when hidden.

Change `PanelSlice` from conditional image rendering to the visibility prop
`isImageLayerVisible: boolean`. Its `Animated.View` and `Image` must remain
in the tree; use opacity zero and transparent backing while source context is
on.

Replace the existing test named "omits the duplicate image and backing in
overlay-only mode" with a regression asserting that the image node still
exists but is visually hidden. Add a rerender assertion that the same number of
`expo-image` nodes exists before and after each eye toggle.

Run:

```bash
npm test -- --runInBand \
  __tests__/panel-image-intensity.test.tsx \
  __tests__/source-image-context.test.tsx \
  __tests__/quick-panel-preview-source-context.test.tsx
```

### 3. Draw the authoritative crop squares

Add this pure geometry interface in
`source-image-context-geometry.ts`:

```ts
export interface SourceContextCropSquare {
  id: PanelId;
  rect: PanelRect;
  stroke: string;
}

export function getSourceContextCropSquares(
  preset: QuickPanelPreset,
): SourceContextCropSquare[]
```

Each rectangle must equal `getExportSquareRect(preset.panels[id])`, have equal
width/height, retain visual order, and receive a distinct deterministic stroke.

Write failing pure tests for the four Controls panels plus representative
horizontal, vertical, and square Buttons. Add rendering assertions for:

- one `source-context-crop-square` per visible panel;
- `fill="none"`;
- correct `x`, `y`, `width`, and `height`;
- distinct stroke values; and
- `strokeWidth={2 / layoutScale}`.

Render the outline SVG in `SourceImageContext` after the dim SVG. Keep it
mounted with zero stroke opacity while the eye is off.

### 4. Preserve the rest of the feature

Keep these unchanged:

- `quick-panel.show-source-image-context` and its default-on behavior;
- `ImageTransform` and all clamp/export geometry;
- Controls preview intensity at `0.5`;
- Button preview/export intensity from the screen-local slider;
- Button identifier controls;
- the preview proxy URI and `cachePolicy="memory-disk"`;
- English and Traditional Chinese strings;
- helper-sheet behavior; and
- `ExportSurface`, `ExportSurfaceHost`, `useSequentialExport`, and file-saving
  services.

Update the original design, implementation plan, and `docs/notes.md` so they no
longer describe two presentation frames or conditional image mounting.

## Verification

Run:

```bash
npm test -- --runInBand \
  __tests__/source-image-context-geometry.test.ts \
  __tests__/source-image-context.test.tsx \
  __tests__/quick-panel-preview-source-context.test.tsx \
  __tests__/quick-panel-preview-gestures.test.tsx \
  __tests__/panel-image-intensity.test.tsx \
  __tests__/panel-image-transform.test.ts \
  __tests__/customize-screen.test.tsx \
  __tests__/customize-screen-export-surfaces.test.tsx
npm test -- --runInBand --no-cache
npx tsc --noEmit
npm run lint
git diff --check
npx expo export --platform android --output-dir /tmp/qpbc-source-context-followup
```

Inspect the final diff to confirm no existing MMKV key changed, no source
context prop reached export code, and every component remains below 150 lines.

## Required Android QA

On the S25+ baseline, verify Default, Advanced Controls, and Advanced Buttons:

1. The eye stays in the same right-aligned row above the preview.
2. Toggling repeatedly causes no resize, vertical movement, blank frame, source
   reload, transform reset, or gesture interruption.
3. The clean preview remains visually equivalent to the prior panel-only view,
   apart from reserving the fixed placement-frame height.
4. Source mode shows one exact differently colored crop square per panel.
5. At every pan boundary, the relevant crop-square edge and real source-image
   edge make the movement restriction understandable.
6. Zooming creates additional movement room without moving the control row.
7. Button intensity and identifiers still behave correctly.
8. Leaving/reopening Customize and restarting the app preserves the eye choice.
9. Exports retain the same dimensions, filenames, order, composition, and
   applied QuickStar result as before this follow-up.
10. English and Traditional Chinese accessibility labels remain correct.

Suggested commit message for the user to run after QA:

`fix: stabilize source context preview`
