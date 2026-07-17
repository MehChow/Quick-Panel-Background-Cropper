# Smooth Buttons Calibration and Customization

**Last verified:** 2026-07-17

## Purpose

This guide explains the performance architecture used by Advanced Buttons
calibration, Customize preview rendering, and Button export. Preserve these
boundaries when changing the flow so continuous gestures do not return to the
React state, layout, and bitmap bottlenecks that previously caused visible lag.

Advanced Controls also benefits from the calibration changes because it shares
the optimized advanced panel-box implementation.

## Version scope

The production v2 app still uses the previous performance method described in
this guide. The optimized calibration, Customize preview, and sequential export
architecture is introduced by v3. Therefore, the smooth device-QA result below
applies to the v3 build and must not be attributed to the current v2 production
release.

## Method comparison

| Area | Previous method (v2) | Current method (v3) | Performance effect |
| --- | --- | --- | --- |
| Calibration move/resize | `PanResponder` sent every gesture update through `onChange`, React, and Zustand. Re-renders recreated the active move and resize responders. | Gesture Handler and Reanimated update a shared draft rectangle on the UI thread. React/Zustand receives one final rectangle when the gesture ends or is cancelled. | Continuous geometry work no longer rebuilds the React screen tree every frame. Store writes change from many per gesture to one. |
| Customize image source | Every selected Button panel rendered the full normalized image, even when the source was much larger than the visible preview. | Sources above a 1080-pixel long edge receive a temporary 1080-long-edge PNG proxy. Smaller sources reuse their existing URI. | Reduces repeated large-bitmap decoding, upload, and memory pressure across multiple panel previews. |
| Customize animation | Each frame changed image layout properties such as width, height, left, and top. | The image layer keeps fixed base dimensions and Reanimated changes only translation and scale transforms. | Avoids repeated layout work while panning and pinching. |
| Image reuse | Repeated preview/export image views relied on their prior cache behavior. | Repeated image views use `memory-disk` caching. | Improves reuse when the same bitmap appears in several panel slices or export surfaces. |
| Export surfaces | Every 1024-square panel surface was mounted together, then export waited for all images and identifier measurements before capturing them. | One 1024-square surface is mounted, prepared, captured, and replaced with the next panel in Good Lock order. | Bounds the expensive off-screen render tree to one panel and reduces peak graphics and bitmap pressure. |
| Export readiness | Readiness represented the whole mounted export set. | Readiness belongs only to the active surface. Run/panel tokens reject late callbacks from older surfaces. | Prevents stale image or layout events from advancing or capturing the wrong panel. |

## Calibration hot path

`AdvancedPanelBox` owns a Reanimated shared `draftRect` for the active panel.

During a gesture:

1. The current rectangle is copied into a shared start rectangle.
2. Move or resize math runs in calibration coordinates on the UI thread.
3. Existing snap and outer-bound constraints produce the next draft rectangle.
4. The animated box and handles render directly from that shared rectangle.
5. Snap haptics cross to the React Native runtime only when the snap key changes.

When the gesture ends, `onChange(finalRect)` runs once. A cancelled gesture also
commits its last valid visible rectangle so the UI and stored calibration cannot
diverge.

Do not add a second snapping model for gestures. The worklet-compatible geometry
helpers must remain the single source of truth for snapping and constraints.

## Customize preview hot path

The preview and export deliberately use different image URIs for different
jobs:

- `previewUri` is a screen-local, bounded asset for responsive interaction.
- The normalized original URI remains the export source and geometry reference.

If the normalized image has a long edge above 1080 pixels, Customize creates a
temporary PNG proxy with preserved aspect ratio. The proxy is not persisted and
is deleted when the image changes or Customize unmounts. If proxy preparation
fails, Customize falls back to the normalized original rather than blocking the
flow. The cleanup path must never delete the selected or normalized source.

Each panel still clips the image to its own shape. Inside that clip, the bitmap
has fixed base dimensions and a top-left transform origin. Translation and scale
move the layer without resizing or repositioning it through layout properties on
every animation frame.

This separation is important: using the proxy for export would reduce output
fidelity, while using an unnecessarily large original for every preview panel
would restore the bitmap pressure that caused lag.

## Sequential export

Export continues to produce original-quality 1024x1024 PNGs:

1. Best-effort prefetch the normalized original image.
2. Mount the first panel in Good Lock order.
3. Wait for its image and, only when required, its horizontal identifier
   measurement.
4. Capture and copy that panel.
5. Unmount it and mount the next panel.
6. Save to the media library only after every capture succeeds.

Prefetch failure is non-fatal; the active surface can load the image normally.
If capture or saving fails, the run stops, temporary captures are cleaned up,
and the app does not navigate to Result with a partial export set.

Sequential rendering favors stable peak memory over maximum parallelism. Total
export duration may therefore scale with the number of selected Buttons, but
only one expensive export target exists at a time.

## Performance evidence

The architectural improvements are directly verifiable:

- zero React/Zustand panel writes during calibration gesture updates;
- one panel-state commit when a gesture finishes or is cancelled;
- a maximum 1080-pixel long edge for generated Customize proxies;
- transform-only image movement during Customize gestures; and
- exactly one mounted 1024-square export surface at a time.

User device QA on 2026-07-17 found no lag in either calibration or
customization after the optimization. This is the current practical acceptance
result.

A controlled before/after APK benchmark was not captured, so do not claim a
numeric frame-rate, jank-rate, memory, or export-duration improvement. The old
long-session device counters were directional evidence only and are not a clean
baseline. If quantitative performance is needed later, collect both sides with
the same device, build type, source image, Button layout, and gesture duration.

## Regression guardrails

- Never call React or Zustand `onChange` from each calibration gesture update.
- Keep calibration drafts transient; persist only the committed final rectangle.
- Keep preview proxy dimensions bounded and keep exports on the normalized
  original URI.
- Animate preview placement with transforms, not per-frame layout dimensions or
  offsets.
- Keep repeated image surfaces explicitly cached with `memory-disk` unless a
  measured reason justifies changing the policy.
- Do not mount all export panels together. Preserve one-surface sequencing,
  Good Lock order, readiness tokens, and all-or-nothing media saving.
- Preserve existing snapping, haptics, constraints, identifiers, opacity,
  filenames, 1024-square output, and visible composition.
- This optimization adds no storage schema change or reset. Existing calibration
  and preference data must remain intact across app updates.

For routine physical-device QA, use the normal Android workflow such as
`npm run android`. A signed APK performance benchmark is optional unless a task
specifically requires release-build measurements.

## Main implementation references

- Calibration gestures: `src/features/quick-panel/calibration/advanced/hooks/useAdvancedPanelMoveGesture.ts`
- Calibration resize: `src/features/quick-panel/calibration/advanced/hooks/useAdvancedPanelResizeGesture.ts`
- Animated panel box: `src/features/quick-panel/calibration/advanced/components/AdvancedPanelBox.tsx`
- Preview proxy service: `src/features/quick-panel/customize/services/create-customize-preview-image.ts`
- Preview proxy ownership: `src/features/quick-panel/customize/hooks/useCustomizePreviewImage.ts`
- Transform-only panel rendering: `src/features/quick-panel/customize/components/PanelSlice.tsx`
- Sequential export controller: `src/features/quick-panel/customize/hooks/useSequentialExport.ts`
- Single export host: `src/features/quick-panel/customize/components/ExportSurfaceHost.tsx`

Related context:

- [`docs/2026-07-17-buttons-customize-tabs-handoff.md`](../2026-07-17-buttons-customize-tabs-handoff.md)
- [`docs/notes.md`](../notes.md)
