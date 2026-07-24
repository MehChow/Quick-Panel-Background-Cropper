# Buttons-only Performance Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:executing-plans`. Execute inline only; do not use subagents.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove per-frame global calibration updates, bound and compositor-
animate the Customize preview image, and export Buttons through one reusable
surface without changing output or persisted data.

**Architecture:** Advanced panel gestures keep a Reanimated draft rectangle on
the UI thread and commit once at gesture end. Customize renders a transient
1080-long-edge preview proxy using transform-only animation while retaining the
normalized original for export. A sequential export controller mounts, waits
for, captures, and replaces one 1024-square surface at a time.

**Tech Stack:** Expo 56, React Native 0.85, TypeScript 6, Expo Image, Expo Image
Manipulator, Expo FileSystem, React Native Gesture Handler, Reanimated 4,
Worklets, Zustand, `react-native-view-shot`, Jest, and React Native Testing
Library.

## Global Constraints

- Read <https://docs.expo.dev/versions/v56.0.0/>, the Expo Image page, and the
  Expo ImageManipulator page before implementation.
- Work inline only. Do not use subagents, worktrees, or browser demos.
- Never stage, commit, or push; provide a suggested commit message only.
- Add no dependencies and do not regenerate native folders.
- Do not reset, migrate, rename, or delete persisted calibration/preference
  keys.
- Keep 1024x1024 PNG output, alpha, filenames, Good Lock order, identifier
  appearance, and image composition unchanged.
- Keep the original normalized image as the export source; preview proxies are
  transient and never persisted.
- Do not use `useMemo`, `useCallback`, or `React.memo` outside AniUI.
- Use interfaces, avoid `any`, and keep new/materially changed component files
  below 150 lines.
- Follow TDD: add each focused test, observe the expected failure, then add the
  smallest implementation.
- Performance claims require a local `apk` release build on `SM-S9360`; Metro
  dev-client measurements are diagnostic only.

## File Structure

**Create:**

- `__tests__/advanced-panel-gesture.test.ts`
- `__tests__/advanced-panel-box-gesture.test.tsx`
- `__tests__/customize-preview-image.test.ts`
- `__tests__/panel-image-transform.test.ts`
- `__tests__/sequential-export.test.tsx`
- `src/features/quick-panel/calibration/advanced/advanced-panel-gesture.ts`
- `src/features/quick-panel/calibration/advanced/hooks/useAdvancedPanelMoveGesture.ts`
- `src/features/quick-panel/calibration/advanced/hooks/useAdvancedPanelResizeGesture.ts`
- `src/features/quick-panel/customize/services/create-customize-preview-image.ts`
- `src/features/quick-panel/customize/hooks/useCustomizePreviewImage.ts`
- `src/features/quick-panel/customize/panel-image-transform.ts`
- `src/features/quick-panel/customize/components/ExportSurfaceHost.tsx`
- `src/features/quick-panel/customize/hooks/useSequentialExport.ts`

**Modify:**

- Advanced geometry/worklets: `advanced-grid.ts`, `advanced-snap-axis.ts`,
  `advanced-snap-key.ts`, `advanced-resize-edges.ts`, `panel-constraints.ts`,
  and `calibration/shared/calibration-rect.ts`
- Advanced components: `AdvancedPanelBox.tsx`,
  `AdvancedPanelResizeHandle.tsx`, `AdvancedPanelCanvas.tsx`
- Advanced screen hook: `useAdvancedCalibrationScreen.ts`
- Customize preview: `CustomizeScreen.tsx`, `QuickPanelPreview.tsx`,
  `PanelSlice.tsx`
- Customize orchestration: `useCustomizeScreen.ts`, `useCustomizeActions.ts`,
  `schedule-export-work.ts`
- Export: `ExportSurface.tsx`, `export-surface-readiness.ts`,
  `services/export-files.ts`
- Existing tests: advanced geometry, Customize screen, image normalization,
  export readiness/surfaces/files, panel image intensity, and scheduling
- Documentation: `docs/notes.md`

**Delete after replacement:**

- `src/features/quick-panel/calibration/advanced/hooks/useAdvancedPanelMoveResponder.ts`
- `src/features/quick-panel/calibration/advanced/hooks/useAdvancedPanelResizeResponder.ts`
- `src/features/quick-panel/customize/components/ExportSurfaces.tsx`

---

### Task 1: Record a clean performance baseline

**Files:**

- Modify after measurement: `docs/notes.md`

**Interfaces:** Produces the baseline table used by Tasks 2, 4, and 5. This
task changes no app behavior or local app data.

- [ ] **Step 1: Build and install the release APK variant**

Run:

```bash
npm run build-apk
```

Expected: Gradle exits zero and reports the release APK artifact. Install the
artifact through the existing APK workflow without uninstalling or clearing
the dev or production variants.

- [ ] **Step 2: Prepare the exact fixture**

Use the 1920x1080 PNG and a six-Button mixed layout from the design spec. Start
the APK variant from a fresh process, but do not clear app data.

- [ ] **Step 3: Capture gesture baselines**

Before each five-second gesture sample, run:

```bash
adb shell dumpsys gfxinfo com.meh_chow.quickpanelbackgroundcropper.apk reset
```

After the sample, run:

```bash
adb shell dumpsys gfxinfo com.meh_chow.quickpanelbackgroundcropper.apk framestats
adb shell dumpsys meminfo com.meh_chow.quickpanelbackgroundcropper.apk
```

Record total frames, janky/missed-deadline frames, slow UI-thread frames, slow
bitmap uploads, 90th/95th/99th percentiles, total PSS, graphics PSS, and swap
PSS for move, resize, pan, and pinch.

- [ ] **Step 4: Capture export baseline**

Run three complete exports. For each run, record wall-clock duration, peak
`meminfo`, `gfxinfo` during the loading state, output count, and whether the
spinner/pulse visibly freezes.

- [ ] **Step 5: Add the baseline table to `docs/notes.md`**

Add a table under this exact heading:

```markdown
### 2026-07-17: Buttons-only performance baseline
```

Record the device, One UI version, QuickStar version, build type, source-image
dimensions and size, selected Buttons, and grid in a fixture paragraph. Add one
row each for calibration move, calibration resize, Customize pan, Customize
pinch, and export. Use these columns: sample, janky/deadline rate, p95 frame
time, slow UI frames, slow bitmap uploads, duration, peak PSS, graphics memory,
swap, visible result, and notes. Populate every applicable cell from the
commands above. Do not estimate unavailable values; write `unavailable:` plus
the concrete reason.

- [ ] **Step 6: Verify documentation only**

```bash
git diff --check
```

Expected: exits zero. Do not stage or commit.

---

### Task 2: Move advanced panel gestures off React and Zustand

**Files:**

- Create: `src/features/quick-panel/calibration/advanced/advanced-panel-gesture.ts`
- Create: `src/features/quick-panel/calibration/advanced/hooks/useAdvancedPanelMoveGesture.ts`
- Create: `src/features/quick-panel/calibration/advanced/hooks/useAdvancedPanelResizeGesture.ts`
- Create test: `__tests__/advanced-panel-gesture.test.ts`
- Create test: `__tests__/advanced-panel-box-gesture.test.tsx`
- Modify: advanced snap/constraint files listed under File Structure
- Modify: `AdvancedPanelBox.tsx`
- Modify: `AdvancedPanelResizeHandle.tsx`
- Modify: `AdvancedPanelCanvas.tsx`
- Modify: `useAdvancedCalibrationScreen.ts`
- Delete after GREEN: both `useAdvancedPanel*Responder.ts` files

**Interfaces:**

```ts
export interface AdvancedPanelMoveInput {
  dx: number;
  dy: number;
  grid: AdvancedSnapGrid;
  outerRect: PanelRect;
  scale: number;
  startRect: PanelRect;
}

export interface AdvancedPanelResizeInput extends AdvancedPanelMoveInput {
  position: HandlePosition;
}

export function getAdvancedPanelMoveResult(
  input: AdvancedPanelMoveInput,
): SnapResult;

export function getAdvancedPanelResizeResult(
  input: AdvancedPanelResizeInput,
): SnapResult;
```

- [ ] **Step 1: Write failing gesture-geometry tests**

Create `__tests__/advanced-panel-gesture.test.ts` with move, resize, scale, snap,
and outer-bound cases. Include these core assertions:

```ts
it("converts screen movement to calibration coordinates", () => {
  expect(getAdvancedPanelMoveResult({
    dx: 20,
    dy: 10,
    grid: { columns: 1, rows: 1 },
    outerRect: { x: 0, y: 0, width: 300, height: 400, radius: 0 },
    scale: 0.5,
    startRect: { x: 50, y: 60, width: 80, height: 100, radius: 0 },
  }).rect).toMatchObject({ x: 90, y: 80 });
});

it("resizes from the committed start rectangle", () => {
  expect(getAdvancedPanelResizeResult({
    dx: 15,
    dy: 20,
    grid: { columns: 1, rows: 1 },
    outerRect: { x: 0, y: 0, width: 300, height: 400, radius: 0 },
    position: "bottomRight",
    scale: 1,
    startRect: { x: 50, y: 60, width: 80, height: 100, radius: 0 },
  }).rect).toMatchObject({ width: 95, height: 120 });
});
```

- [ ] **Step 2: Verify RED**

```bash
npm test -- --runInBand __tests__/advanced-panel-gesture.test.ts
```

Expected: FAIL because `advanced-panel-gesture.ts` does not exist.

- [ ] **Step 3: Add worklet-compatible gesture helpers**

Create `advanced-panel-gesture.ts`:

```ts
import type { PanelRect } from "../../model/types";
import { resizeRect, type HandlePosition } from "../shared/calibration-rect";
import {
  snapMovedPanelRect,
  snapResizedPanelRect,
  type AdvancedSnapGrid,
  type SnapResult,
} from "./advanced-grid";

export interface AdvancedPanelMoveInput {
  dx: number;
  dy: number;
  grid: AdvancedSnapGrid;
  outerRect: PanelRect;
  scale: number;
  startRect: PanelRect;
}

export interface AdvancedPanelResizeInput extends AdvancedPanelMoveInput {
  position: HandlePosition;
}

export function getAdvancedPanelMoveResult({
  dx, dy, grid, outerRect, scale, startRect,
}: AdvancedPanelMoveInput): SnapResult {
  "worklet";
  return snapMovedPanelRect({
    ...startRect,
    x: startRect.x + dx / scale,
    y: startRect.y + dy / scale,
  }, startRect, outerRect, grid);
}

export function getAdvancedPanelResizeResult({
  dx, dy, grid, outerRect, position, scale, startRect,
}: AdvancedPanelResizeInput): SnapResult {
  "worklet";
  return snapResizedPanelRect(
    resizeRect(startRect, position, dx / scale, dy / scale),
    startRect,
    outerRect,
    grid,
    position,
  );
}
```

Add `"worklet";` to every function in the invoked snap/constraint call graph.
Do not fork or rewrite its formulas. Run existing advanced grid tests after
each file to catch output drift.

- [ ] **Step 4: Verify pure geometry GREEN**

```bash
npm test -- --runInBand __tests__/advanced-panel-gesture.test.ts __tests__/calibration-area-geometry.test.ts
```

Expected: PASS with unchanged snap expectations.

- [ ] **Step 5: Write failing commit-frequency component tests**

Mock Gesture Handler builders so the test can invoke captured `onBegin`,
`onUpdate`, `onEnd`, and `onFinalize` handlers. Assert:

```tsx
it("updates the animated draft without committing during move updates", () => {
  const onChange = jest.fn();
  render(<AdvancedPanelBox {...baseProps} onChange={onChange} />);

  moveHandlers.onBegin();
  moveHandlers.onUpdate({ translationX: 12, translationY: 8 });
  moveHandlers.onUpdate({ translationX: 24, translationY: 16 });
  expect(onChange).not.toHaveBeenCalled();

  moveHandlers.onEnd();
  expect(onChange).toHaveBeenCalledTimes(1);
});

it("commits the last valid resize rectangle when cancelled", () => {
  const onChange = jest.fn();
  render(<AdvancedPanelBox {...baseProps} onChange={onChange} />);

  resizeHandlers.bottomRight.onBegin();
  resizeHandlers.bottomRight.onUpdate({ translationX: 20, translationY: 20 });
  resizeHandlers.bottomRight.onFinalize(false);
  expect(onChange).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 6: Verify component RED**

```bash
npm test -- --runInBand __tests__/advanced-panel-box-gesture.test.tsx
```

Expected: FAIL because the current PanResponders commit every update.

- [ ] **Step 7: Implement UI-thread gesture hooks**

In `AdvancedPanelBox`, create one shared draft rect and animated box style:

```tsx
const draftRect = useSharedValue(props.rect);

useEffect(() => {
  draftRect.set(props.rect);
}, [draftRect, props.rect]);

const animatedStyle = useAnimatedStyle(() => ({
  height: draftRect.get().height * props.scale,
  left: draftRect.get().x * props.scale,
  top: draftRect.get().y * props.scale,
  width: draftRect.get().width * props.scale,
}));
```

`useAdvancedPanelMoveGesture` and `useAdvancedPanelResizeGesture` must:

- copy `draftRect` to a shared start rect in `onBegin`;
- call the Task 2 helper in `onUpdate`;
- set `draftRect` without scheduling React work;
- schedule `triggerSnapHaptic` only for a changed non-null snap key; and
- schedule exactly one `onChange(draftRect.get())` from `onEnd` or cancelled
  `onFinalize`.

Use a shared finish guard so Gesture Handler calling both lifecycle callbacks
cannot commit twice:

```ts
const didCommit = useSharedValue(false);

const commitDraft = () => {
  "worklet";
  if (didCommit.get()) {
    return;
  }
  didCommit.set(true);
  scheduleOnRN(onChange, draftRect.get());
};
```

Set `didCommit` to `false` in `onBegin`, call `commitDraft` in `onEnd`, and call
it from `onFinalize` only when the gesture did not finish successfully. The
component tests must also simulate `onEnd` followed by `onFinalize(true)` and
assert a single commit.

Wrap the move region and resize handles with `GestureDetector`. Remove the old
PanResponder imports and files only after the tests pass.

- [ ] **Step 8: Stabilize the hardware-back subscription**

In `useAdvancedCalibrationScreen`, store the latest leave decision in a ref and
subscribe once:

```ts
const requestLeaveRef = useRef(requestLeaveCalibration);
requestLeaveRef.current = requestLeaveCalibration;

useEffect(() => {
  const subscription = BackHandler.addEventListener(
    "hardwareBackPress",
    () => requestLeaveRef.current(),
  );
  return () => subscription.remove();
}, []);
```

Extend `advanced-calibration-leave-guard.test.tsx` to rerender after draft
changes and assert one add/remove subscription lifecycle.

- [ ] **Step 9: Verify Task 2**

```bash
npm test -- --runInBand __tests__/advanced-panel-gesture.test.ts __tests__/advanced-panel-box-gesture.test.tsx __tests__/advanced-calibration-leave-guard.test.tsx
npx tsc --noEmit
npm run lint
git diff --check
```

Expected: PASS. Confirm the deleted responder filenames have no remaining
imports. Do not stage or commit.

Suggested checkpoint message: `perf: keep calibration gestures on UI thread`

---

### Task 3: Create and own a bounded Customize preview image

**Files:**

- Create: `src/features/quick-panel/customize/services/create-customize-preview-image.ts`
- Create: `src/features/quick-panel/customize/hooks/useCustomizePreviewImage.ts`
- Create test: `__tests__/customize-preview-image.test.ts`
- Modify: `CustomizeScreen.tsx`
- Modify test: `customize-screen.test.tsx`

**Interfaces:**

```ts
export interface CustomizePreviewImage {
  isOwned: boolean;
  uri: string;
}

export function getCustomizePreviewResize(
  width: number,
  height: number,
): { width: number; height: number } | null;

export async function createCustomizePreviewImage(
  image: PickedImage,
): Promise<CustomizePreviewImage>;

export interface CustomizePreviewImageState {
  previewUri: string;
  isPreparingPreview: boolean;
}
```

- [ ] **Step 1: Write failing proxy tests**

Cover the no-resize threshold, landscape/portrait resize math, PNG save format,
fallback ownership, and deletion of owned files. Core expectations:

```ts
it("reuses images whose long edge is at most 1080", async () => {
  await expect(createCustomizePreviewImage({
    uri: "file:///source.png",
    width: 1080,
    height: 720,
    fileName: "source.png",
  })).resolves.toEqual({ isOwned: false, uri: "file:///source.png" });
});

it("preserves aspect ratio at a 1080 landscape long edge", () => {
  expect(getCustomizePreviewResize(1920, 1080)).toEqual({
    width: 1080,
    height: 608,
  });
});
```

- [ ] **Step 2: Verify RED**

```bash
npm test -- --runInBand __tests__/customize-preview-image.test.ts
```

Expected: FAIL because the preview service does not exist.

- [ ] **Step 3: Implement the preview service**

Use `ImageManipulator.manipulate(image.uri)`, apply one resize, render, and save
with `{ compress: 1, format: SaveFormat.PNG }`. Return the source URI with
`isOwned: false` when no resize is needed. Keep the 1080 constant local to this
service and do not change `normalizeCustomizeImage` or `PickedImage`.

- [ ] **Step 4: Implement race-safe screen ownership**

`useCustomizePreviewImage(image)` starts with `image.uri`, creates the proxy in
an effect, and returns to the original URI on failure. The cleanup must delete
only `isOwned` proxy files using `new File(uri).delete()`.

Use a cancelled flag so a late result is deleted instead of installed after an
image replacement or unmount. Record generation failures with action
`create_customize_preview_image`, without URI/file metadata.

- [ ] **Step 5: Thread the source separately from geometry**

In `CustomizeScreen`:

```tsx
const previewImage = useCustomizePreviewImage(image);

<QuickPanelPreview
  image={image}
  previewUri={previewImage.previewUri}
  {...existingPreviewProps}
/>
```

Do not pass `previewUri` to `ExportSurfaceHost` or any export service. Extend the
screen test to assert the preview receives the proxy URI while export receives
the original `PickedImage` URI.

- [ ] **Step 6: Verify Task 3**

```bash
npm test -- --runInBand __tests__/customize-preview-image.test.ts __tests__/customize-screen.test.tsx __tests__/customize-image-normalization.test.ts
npx tsc --noEmit
npm run lint
git diff --check
```

Expected: PASS. Do not stage or commit.

Suggested checkpoint message: `perf: bound Customize preview images`

---

### Task 4: Animate preview images with transforms and memory caching

**Files:**

- Create: `src/features/quick-panel/customize/panel-image-transform.ts`
- Create test: `__tests__/panel-image-transform.test.ts`
- Modify: `QuickPanelPreview.tsx`
- Modify: `PanelSlice.tsx`
- Modify test: `panel-image-intensity.test.tsx`

**Interfaces:**

```ts
export interface PanelImageTransformInput {
  panelX: number;
  panelY: number;
  previewScale: number;
  transform: ImageTransform;
}

export interface PanelImageTransformResult {
  scale: number;
  translateX: number;
  translateY: number;
}

export function getPanelImageTransform(
  input: PanelImageTransformInput,
): PanelImageTransformResult;
```

- [ ] **Step 1: Write failing transform tests**

```ts
it("maps screenshot coordinates to panel-local preview transforms", () => {
  expect(getPanelImageTransform({
    panelX: 100,
    panelY: 200,
    previewScale: 0.25,
    transform: { x: 40, y: 120, scale: 1.5 },
  })).toEqual({
    scale: 0.375,
    translateX: -15,
    translateY: -20,
  });
});
```

Add fit, positive/negative pan, and zoom cases.

- [ ] **Step 2: Verify RED**

```bash
npm test -- --runInBand __tests__/panel-image-transform.test.ts
```

Expected: FAIL because the helper does not exist.

- [ ] **Step 3: Implement the pure helper**

```ts
export function getPanelImageTransform({
  panelX,
  panelY,
  previewScale,
  transform,
}: PanelImageTransformInput): PanelImageTransformResult {
  "worklet";
  return {
    scale: transform.scale * previewScale,
    translateX: (transform.x - panelX) * previewScale,
    translateY: (transform.y - panelY) * previewScale,
  };
}
```

- [ ] **Step 4: Replace animated layout with an animated transform wrapper**

In `PanelSlice`, give the wrapper fixed original-image dimensions and a
top-left origin. Its animated style contains only `transform`; do not animate
`height`, `width`, `left`, or `top`:

```tsx
const imageStyle = useAnimatedStyle(() => {
  const placement = getPanelImageTransform({
    panelX: panel.rect.x,
    panelY: panel.rect.y,
    previewScale: previewScale.get(),
    transform: transform.get(),
  });
  return {
    transform: [
      { translateX: placement.translateX },
      { translateY: placement.translateY },
      { scale: placement.scale },
    ],
  };
});
```

Render a fixed `Animated.View` with `transformOrigin: [0, 0, 0]`, then place
`expo-image` inside it with original logical dimensions, `source={{ uri:
previewUri }}`, `contentFit="fill"`, and `cachePolicy="memory-disk"`.

- [ ] **Step 5: Preserve overlay and intensity behavior**

Keep Button opacity on the image layer only. Identifiers and `PanelOverlay`
remain outside the animated image wrapper and therefore remain fixed while the
background moves. Extend `panel-image-intensity.test.tsx` to assert the proxy
URI and `memory-disk` policy without changing current opacity expectations.

- [ ] **Step 6: Verify Task 4**

```bash
npm test -- --runInBand __tests__/panel-image-transform.test.ts __tests__/panel-image-intensity.test.tsx __tests__/button-identifier-overlay.test.tsx
npx tsc --noEmit
npm run lint
git diff --check
```

Expected: PASS. On device, visually compare fit/pan/pinch alignment before
continuing. Do not stage or commit.

Suggested checkpoint message: `perf: animate Button previews with transforms`

---

### Task 5: Export through one reusable surface

**Files:**

- Create: `src/features/quick-panel/customize/components/ExportSurfaceHost.tsx`
- Create: `src/features/quick-panel/customize/hooks/useSequentialExport.ts`
- Create test: `__tests__/sequential-export.test.tsx`
- Modify: `ExportSurface.tsx`
- Modify: `export-surface-readiness.ts`
- Modify: `services/export-files.ts`
- Modify: `useCustomizeActions.ts`
- Modify: `useCustomizeScreen.ts`
- Modify: `CustomizeScreen.tsx`
- Modify: `schedule-export-work.ts`
- Modify existing export tests
- Delete after GREEN: `ExportSurfaces.tsx`

**Interfaces:**

```ts
export interface ExportSurfaceToken {
  panelId: PanelId;
  runId: number;
}

export interface SequentialExportState {
  activePanel: PanelDefinition | null;
  activeToken: ExportSurfaceToken | null;
  exportRef: React.RefObject<View | null>;
  markIdentifierReady: (token: ExportSurfaceToken) => void;
  markImageReady: (token: ExportSurfaceToken) => void;
  startExport: () => void;
}

export async function capturePanelExport(
  ref: View,
  panel: PanelDefinition,
): Promise<GeneratedExport>;

export async function saveCapturedExports(
  files: GeneratedExport[],
): Promise<void>;
```

- [ ] **Step 1: Write failing sequence tests**

Use a three-Button preset and mocked prefetch/capture/save callbacks. Assert:

```tsx
it("mounts and captures one panel at a time in Good Lock order", async () => {
  const screen = render(<SequentialExportHarness preset={buttonsPreset} />);
  fireEvent.press(screen.getByText("start"));

  await screen.findByTestId("export-surface-button-1");
  expect(screen.queryByTestId("export-surface-button-2")).toBeNull();
  signalCurrentImageAndIdentifierReady();
  await waitFor(() => expect(capturePanelExport).toHaveBeenCalledWith(
    expect.anything(),
    buttonsPreset.panels["button-1"],
  ));

  await screen.findByTestId("export-surface-button-2");
  expect(screen.queryByTestId("export-surface-button-1")).toBeNull();
});
```

Also cover stale token callbacks, hidden/vertical/equal-span readiness, capture
failure, prefetch failure fallback, media-save failure, and no Result navigation
with partial files.

- [ ] **Step 2: Verify RED**

```bash
npm test -- --runInBand __tests__/sequential-export.test.tsx
```

Expected: FAIL because the sequential controller/host do not exist.

- [ ] **Step 3: Split capture from album saving**

Refactor `export-files.ts` without changing capture options:

```ts
export async function capturePanelExport(
  ref: View,
  panel: PanelDefinition,
): Promise<GeneratedExport> {
  let tmpUri: string;

  try {
    tmpUri = await captureRef(ref, {
      fileName: panel.fileName.replace(".png", ""),
      format: "png",
      height: exportSidePixels,
      quality: 1,
      result: "tmpfile",
      width: exportSidePixels,
    });
  } catch (error) {
    void recordCrashlyticsError(error, {
      action: "capture_export_panel",
      panelId: panel.id,
    });
    throw error;
  }

  try {
    const source = new File(tmpUri);
    const target = new File(Paths.cache, panel.fileName);
    await source.copy(target, { overwrite: true });
    return {
      fileName: panel.fileName,
      id: panel.id,
      label: panel.label,
      previewUri: target.uri,
      uri: target.uri,
    };
  } finally {
    releaseCapture(tmpUri);
  }
}

export async function saveCapturedExports(
  files: GeneratedExport[],
): Promise<void> {
  const permission = await requestPermissionsAsync(true);

  if (permission.status !== "granted") {
    throw new Error(translate("errors.mediaLibraryPermission"));
  }

  if (Platform.OS !== "android") {
    for (const file of files) {
      await Asset.create(file.uri);
    }
    return;
  }

  const albumName = translate("export.albumName");
  const existingAlbum = await Album.get(albumName);

  if (existingAlbum) {
    for (const file of files) {
      await Asset.create(file.uri, existingAlbum);
    }
    return;
  }

  const [firstFile, ...remainingFiles] = files;
  if (!firstFile) {
    return;
  }

  const album = await Album.create(albumName, [firstFile.uri]);
  for (const file of remainingFiles) {
    await Asset.create(file.uri, album);
  }
}

export async function cleanupCapturedExports(
  files: GeneratedExport[],
): Promise<void> {
  for (const file of files) {
    try {
      new File(file.uri).delete();
    } catch (error) {
      await recordCrashlyticsError(error, {
        action: "cleanup_export_file",
        panelId: file.id,
      });
    }
  }
}
```

The controller passes only the stable cache files created by the current failed
run to `cleanupCapturedExports`; never glob or delete older Result files.

- [ ] **Step 4: Reduce readiness to the active panel**

Replace multi-id readiness with:

```ts
export function createExportSurfaceReadiness(
  waitsForIdentifier: boolean,
) {
  let isImageReady = false;
  let isIdentifierReady = !waitsForIdentifier;
  return {
    markIdentifierReady() {
      isIdentifierReady = true;
      return isImageReady && isIdentifierReady;
    },
    markImageLoaded() {
      isImageReady = true;
      return isImageReady && isIdentifierReady;
    },
  };
}
```

Update readiness tests for visible horizontal, vertical, square, and hidden
identifiers.

- [ ] **Step 5: Implement `ExportSurfaceHost`**

Render exactly one `ExportSurface` for `activePanel`. Key it by
`${runId}:${panelId}`, pass the same original image/transform/intensity/
identifier props, and set `cachePolicy="memory-disk"` on its image. Every
ready callback must echo the token it received at mount.

- [ ] **Step 6: Implement `useSequentialExport`**

The controller must:

- increment `runId` and mark the store exporting immediately;
- call `ExpoImage.prefetch(image.uri, "memory-disk")` before mounting index 0;
- continue with the original URI if prefetch returns false or throws;
- ignore ready callbacks whose token differs from the active token;
- schedule capture after readiness through `scheduleExportWork`;
- append one result and advance one index after capture;
- yield one animation frame before mounting/capturing the next panel;
- call `saveCapturedExports` only after the final capture;
- call the existing finish/navigate path only after media save succeeds; and
- cleanup/unmount/fail exactly once on any error.

Use refs for in-progress results and run cancellation so captured arrays do not
cause intermediate screen rerenders.

- [ ] **Step 7: Integrate the controller**

Remove `ExportRefs`, `exportLoadToken`, `readyExportLoadToken`, and
`shouldRenderExportSurfaces` from `useCustomizeScreen`. `CustomizeScreen`
renders `ExportSurfaceHost` only when `activePanel` and `activeToken` are
non-null. `CustomizeActions.onExport` calls `startExport`.

Keep `isExporting` in Zustand so button disabled/loading behavior and result
transitions remain unchanged.

- [ ] **Step 8: Update export tests**

Rewrite `export-files.test.ts`, `export-surface-readiness.test.ts`,
`export-surfaces-position-readiness.test.tsx`, and
`customize-screen-export-surfaces.test.tsx` around the single-host contract.
Preserve exact assertions for:

- 1024 width/height, PNG, quality 1, and tmpfile capture;
- dynamic Button label and filename;
- Good Lock order;
- identifier position/opacity/visibility;
- original source URI, never `previewUri`; and
- result navigation only after all media writes.

- [ ] **Step 9: Verify Task 5**

```bash
npm test -- --runInBand __tests__/sequential-export.test.tsx __tests__/export-files.test.ts __tests__/export-surface-readiness.test.ts __tests__/export-surfaces-position-readiness.test.tsx __tests__/customize-screen-export-surfaces.test.tsx __tests__/schedule-export-work.test.ts
npx tsc --noEmit
npm run lint
git diff --check
```

Expected: PASS and `rg "ExportSurfaces|ExportRefs" src __tests__` returns no
stale production contract. Do not stage or commit.

Suggested checkpoint message: `perf: export one Button surface at a time`

---

### Task 6: Run full verification and performance acceptance

**Files:**

- Modify: `docs/notes.md`
- Review: `docs/2026-07-17-buttons-customize-tabs-handoff.md`

**Interfaces:** Produces final evidence and the implementation handoff. No new
runtime interface is introduced.

- [ ] **Step 1: Run the complete automated suite**

```bash
npm test -- --runInBand
npm run lint
npx tsc --noEmit
git diff --check
```

Expected: all suites/tests pass, lint and TypeScript exit zero, and no
whitespace errors are reported.

- [ ] **Step 2: Check component size and forbidden memo hooks**

```bash
wc -l src/features/quick-panel/calibration/advanced/components/AdvancedPanelBox.tsx src/features/quick-panel/calibration/advanced/components/AdvancedPanelResizeHandle.tsx src/features/quick-panel/customize/components/PanelSlice.tsx src/features/quick-panel/customize/components/ExportSurfaceHost.tsx
rg -n "useMemo|useCallback|React\.memo" src/features/quick-panel/calibration/advanced src/features/quick-panel/customize
```

Expected: changed feature components are below 150 lines and no new forbidden
memo hooks were introduced outside AniUI.

- [ ] **Step 3: Rebuild the APK release variant**

```bash
npm run build-apk
```

Expected: Gradle exits zero and produces the APK artifact.

- [ ] **Step 4: Repeat the standard fixture measurements**

Repeat Task 1 with the same device, build type, Button layout, image, gesture
durations, and three export runs. Calculate relative improvements from the
recorded baseline; do not compare release results with the dev-client session.

- [ ] **Step 5: Verify output fidelity**

Confirm six output files, 1024x1024 dimensions, Good Lock order, filenames,
transparency/intensity, identifiers at positions 0/50/100, and preview/export
composition. Apply one mixed set in Good Lock.

- [ ] **Step 6: Verify persistence safety**

Update/install over an existing app data set and confirm calibration presets,
selected labels/icons, seen-help flags, last mode, and last Advanced target are
unchanged. Do not clear app data.

- [ ] **Step 7: Record final evidence in `docs/notes.md`**

Add the same metric rows as the baseline plus relative improvement and pass/
fail for every acceptance gate. Record device, One UI, and QuickStar versions.
Explain any unavailable metric explicitly.

- [ ] **Step 8: Update the existing handoff**

Append a concise `Later follow-up: Buttons-only performance optimization`
section to `docs/2026-07-17-buttons-customize-tabs-handoff.md` listing the
implemented architecture, focused/full verification, device metrics, and any
remaining measured limitation. Do not create another dated handoff unless the
user asks.

- [ ] **Step 9: Final diff review**

```bash
git status --short
git diff --stat
git diff --check
```

Expected: only intended source, test, and documentation files changed; no
generated APK, capture image, device log, local secret, or native build output
is tracked.

Suggested final commit message: `perf: optimize Buttons calibration and export`
