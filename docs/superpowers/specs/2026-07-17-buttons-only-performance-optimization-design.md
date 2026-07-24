# Buttons-only Performance Optimization Design

**Date:** 2026-07-17
**Status:** Draft for review

## Purpose

Advanced Buttons-only has accumulated three visible performance regressions:

- lower frame rate while moving or resizing blue Button boxes in advanced
  calibration;
- lag while panning or pinching the selected background image in Customize;
  and
- severe spinner and pulse stutter while Button PNGs are exported.

The implementation must reduce work at the source rather than hiding the lag
by removing feedback animations or lowering export quality.

## Evidence and root causes

The connected `SM-S9360` dev-app session showed 15.1% janky frames, 1,984 slow
UI-thread frames, 1,733 slow-bitmap-upload frames, and substantial accumulated
native/graphics memory pressure. The device runs at 120 Hz, leaving roughly
8.33 ms for each frame. These long-session values are directional evidence,
not the clean benchmark used for final acceptance.

Repository tracing found three separate scaling problems:

1. Advanced calibration sends every move/resize event through React and
   Zustand, rebuilding the draft and screen tree for every gesture update.
   The active box also recreates one move responder and eight resize responders
   as those renders occur.
2. Customize renders one animated `expo-image` instance per Button panel. Each
   frame changes image layout properties, while every Button also owns an icon
   and optional text overlay. The cost increases with selected Button count.
3. Export mounts every 1024-square off-screen surface simultaneously, waits for
   all images and measured identifiers, then captures and PNG-compresses each
   surface. The loading animation competes with image loading, layout,
   rasterization, and capture work.

The identifier overlay is a contributor in Customize and export, but it does
not directly cause calibration lag. The compact adjustment tabs are also not a
primary hot path because they mount only one active slider.

## Goals

- Keep calibration move/resize updates off React state and Zustand until the
  gesture finishes.
- Preserve snapping, resize constraints, haptics, visible box geometry, and
  the existing phase flow.
- Bound the bitmap used by the live Customize preview without changing the
  original image used for export.
- Animate Customize image placement with transform properties instead of
  changing image width, height, left, and top every frame.
- Reuse one off-screen export surface and capture Button PNGs sequentially.
- Keep identifiers, localized labels, opacity, position controls, filenames,
  Good Lock order, and 1024x1024 PNG output unchanged.
- Preserve all calibration and preference data across the app update.

## Non-goals

- Do not redesign the calibration or Customize UI.
- Do not remove the export spinner or pulse merely to hide contention.
- Do not lower export dimensions, PNG quality, or identifier fidelity.
- Do not add Skia, a native image pipeline, background tasks, or new packages.
- Do not change Default mode or Advanced Controls behavior except where they
  share the optimized advanced-calibration box implementation.
- Do not persist preview assets or add them to MMKV/Zustand calibration data.
- Do not reset or migrate existing local data.

## Alternatives considered

### 1. Micro-tune the current trees

Explicit image caching, responder stabilization, and fewer inline objects are
small changes. They can reduce overhead, but every calibration frame would
still update global state and export would still mount all surfaces at once.
This is insufficient as the primary solution.

### 2. Replace rendering/export with Skia or a custom native module

A single GPU canvas and native encoder could provide the highest ceiling, but
would add dependencies, native maintenance, and output-parity risk. The current
performance issue does not justify that expansion.

### 3. Optimize each existing boundary

Keep the current geometry and output contracts while changing where transient
work lives: Reanimated shared values for calibration, a preview-only proxy plus
transform animation for Customize, and one reusable export surface. This is the
selected approach because it directly removes the measured scaling behavior
without replacing the product architecture.

## Standard performance fixture

All before/after comparisons use the same fixture:

- device: `SM-S9360`, default 120 Hz display mode;
- build: local `apk` release variant, not Metro/dev-client profiling;
- image: the reported 1920x1080, approximately 3.58 MB PNG;
- layout: six Buttons containing two horizontal, two vertical, and two
  equal-span identifiers;
- identifiers: visible, opacity 70, horizontal position 50, vertical position
  50, image intensity 78;
- calibration: 4-column by 5-row snap grid;
- gesture samples: five seconds of continuous move, five seconds of corner
  resize, five seconds of pan, and five seconds of pinch;
- export sample: three complete six-Button export runs from a fresh process.

Capture Android frame and memory evidence before implementation and after each
optimization stage. The benchmark process may reset `gfxinfo` counters but must
not clear app data.

## Performance acceptance gates

Under the standard fixture:

- calibration move and resize perform no Zustand panel writes until gesture
  end;
- live Customize gesture frames perform no React transform-state writes until
  gesture end;
- calibration and Customize each reduce Android missed-deadline/janky-frame
  rate by at least 50% from their clean baseline and finish below 10%;
- no calibration or Customize gesture produces a frame longer than 100 ms;
- only one off-screen 1024x1024 export surface is mounted at any time;
- peak export PSS is at least 25% below the clean baseline;
- total six-Button export time does not regress by more than 15%; and
- exported PNG dimensions, order, filenames, alpha treatment, identifier
  placement, and visible image composition remain unchanged.

If a device counter is unavailable, retain the architectural gate and record
the unavailable metric explicitly; do not replace it with an estimate.

## Calibration architecture

### Gesture-local draft

`AdvancedPanelBox` owns a Reanimated shared `PanelRect` for the active panel.
Gesture Handler pan and resize gestures update that shared rectangle on the UI
thread. The box and its handles render from animated styles.

At gesture begin:

- copy the current committed rect into a shared start rectangle;
- clear the last snap key; and
- do not call `onChange`.

During gesture update:

- calculate move/resize geometry in unscaled calibration coordinates;
- apply the existing snap and outer-bound constraints;
- update the shared draft rectangle;
- schedule haptics on the React Native runtime only when the snap key changes;
  and
- do not update React state or Zustand.

At gesture end:

- schedule exactly one `onChange(finalRect)` call on the React Native runtime;
- keep the final shared rectangle visible while the store commit propagates;
  and
- clear gesture-local snap state.

If a gesture is cancelled, commit the last valid visible rectangle so the UI
and stored draft cannot diverge.

### Shared snap math

Keep one implementation of snapping and constraints. Mark the existing pure
snap call graph as worklet-compatible rather than creating a second geometry
model. Existing Jest geometry coverage remains authoritative for both runtime
contexts.

### Screen effects

The hardware-back subscription must no longer reinstall after every screen
render. Its handler should read the latest phase through a stable effect event
or ref while the subscription itself mounts once.

## Customize preview architecture

### Preview-only proxy

Create a screen-local preview asset from the already-normalized export image:

- if the source long edge is at most 1080 pixels, reuse its URI;
- otherwise resize the long edge to 1080 with preserved aspect ratio;
- save the proxy as PNG so preview alpha semantics are preserved;
- keep original image dimensions as the geometry coordinate system; and
- use the proxy URI only as the displayed image source.

The original normalized URI remains the sole export source. The proxy URI is
never persisted. Delete an owned proxy when the image changes or Customize
unmounts; never delete the user-selected or normalized export source.

Preview generation failure is non-fatal. Fall back to the normalized export
URI and keep Customize usable while reporting the error only through existing
Crashlytics-safe diagnostics without user file paths.

### Transform-only animation

Each `PanelSlice` keeps fixed base image dimensions and applies translation and
scale through one Reanimated transform style with a top-left transform origin.
A pure helper converts the existing screenshot-coordinate transform into the
panel-local preview transform. The helper receives explicit numeric inputs and
is covered at fit, pan, and zoom positions.

Set `cachePolicy="memory-disk"` for repeated preview and export image views.
Expo SDK 56 documents disk-only caching as the default and specifically notes
that memory caching is useful when a high-resolution image is rendered many
times. The same SDK documentation states that downscaling does not apply to
`contentFit="fill"`, which is why the bounded proxy is required.

References:

- <https://docs.expo.dev/versions/v56.0.0/>
- <https://docs.expo.dev/versions/v56.0.0/sdk/image/>
- <https://docs.expo.dev/versions/v56.0.0/sdk/imagemanipulator/>

## Sequential export architecture

### Single surface host

Replace the `ExportRefs` collection with one non-collapsable `View` ref owned by
an `ExportSurfaceHost`. The host renders only the current Good Lock-order panel
at 1024 output pixels adjusted for device pixel ratio.

The export sequence advances through explicit stages:

1. mark export busy and prefetch the normalized source into memory;
2. mount the first panel surface;
3. wait for its image plus any horizontal identifier measurement;
4. yield one animation frame;
5. capture and copy that panel PNG;
6. unmount/switch the surface to the next panel;
7. repeat until all panels are captured;
8. save the completed files to the media-library album; and
9. finish export and navigate to Result.

Only one image, overlay, and render target exist in the off-screen host at any
time. The visible preview remains mounted during export.

### Readiness and stale events

Readiness is scoped by a monotonically increasing surface token containing the
export run and current panel index. Image-load or identifier-layout callbacks
from an older token are ignored. Horizontal identifiers still wait for their
measured final position; vertical and equal-span identifiers need only image
readiness.

### Failure behavior

Prefetch is an optimization, not an export prerequisite. If it returns `false`
or throws, record the failure and continue by letting the active export surface
load the original image normally.

On any surface, capture, file-copy, permission, or media-save failure:

- stop the sequence;
- unmount the off-screen surface;
- release temporary capture files already produced;
- retain the original image and Customize settings;
- route the error through the existing `failExport` and Crashlytics wrappers;
  and
- allow the user to retry from Customize.

Do not navigate to Result with a partial export set.

## Data and persistence

This work changes no persisted schema or key. Calibration presets, selected
Button labels/icons, help state, last successful mode/advanced target, and all
other local data remain intact across the app update.

Preview proxy state, gesture draft rectangles, export tokens, current export
index, and captured-in-progress files are transient only.

## Testing

Add focused automated coverage for:

- worklet-compatible snapping producing the same move/resize results;
- one committed panel change per completed or cancelled gesture and zero
  commits during updates;
- hardware-back subscription stability across draft changes;
- preview proxy threshold, resize dimensions, fallback, and owned-file cleanup;
- transform helper output for fit, pan, zoom, and different panel origins;
- preview using the proxy URI while export uses the normalized original URI;
- explicit memory-disk caching on repeated image surfaces;
- one export panel mounted at a time in Good Lock order;
- stale readiness callbacks being ignored;
- horizontal identifier measurement gating only the current panel;
- capture failure stopping the sequence and preventing media save/navigation;
- filenames, labels, opacity, position, and 1024-square capture options; and
- Default and Advanced Controls regression behavior.

Automated tests verify state, geometry, sequencing, and output contracts. They
do not substitute for physical-device frame and memory measurements.

## Device QA

Run the standard fixture on the physical Samsung device from a fresh process.
Record before/after `gfxinfo`, `meminfo`, gesture feel, export duration, One UI
version, and QuickStar version in `docs/notes.md`.

Visually compare preview and exported results at identifier positions 0, 50,
and 100. Apply one mixed export set in Good Lock and verify that all six images
retain their prior composition and identifier placement.

## Acceptance criteria

- All performance gates pass on the standard fixture or an unavailable device
  metric is explicitly recorded without estimation.
- Calibration writes exactly once when a gesture finishes or is cancelled.
- Customize uses a bounded transient preview source and transform-only gesture
  updates while export retains the original normalized source.
- Export mounts and captures exactly one Good Lock-order surface at a time.
- Existing visual output and local data remain unchanged.
- Focused tests, the full Jest suite, ESLint, TypeScript, and
  `git diff --check` pass.
