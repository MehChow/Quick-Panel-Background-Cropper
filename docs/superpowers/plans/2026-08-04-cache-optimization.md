# Cache Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:executing-plans` to implement this plan inline task-by-task. Do
> not dispatch subagents. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep QPBC's image workflow cache bounded by deleting app-owned files
when their owner finishes, recovering interrupted work at cold start, and
periodically clearing Expo Image's disk cache without disrupting normal
background transitions.

**Architecture:** Add an explicit cache-ownership list to picked images and a
small cache service that deletes only URIs inside `Paths.cache`. Calibration
and Customize hooks retain files through their exit animations and release
them on replacement or unmount; Result owns successful export captures until
it unmounts. A cold-start maintenance service removes known stale directories
and legacy export files, then clears Glide only when the last successful clear
is at least seven days old.

**Tech Stack:** Expo 56, React Native 0.85, React 19 with React Compiler,
TypeScript 6, Expo FileSystem, Expo Image, Expo ImagePicker, Expo
ImageManipulator, Expo MediaLibrary, Zustand, MMKV, Jest 29, and React Native
Testing Library.

## Global Constraints

- Read the exact Expo 56 documentation at
  `https://docs.expo.dev/versions/v56.0.0/` before editing application code.
- Execute inline only. Do not use or suggest subagents or worktrees.
- Do not stage, commit, push, create a branch, or open a pull request.
- Leave physical-device, production, Good Lock, and Android Settings QA to the
  user.
- Do not use a browser demo or add dependencies.
- Use interfaces for props/state and do not introduce `any`.
- Do not add `useMemo`, `useCallback`, or `React.memo` outside AniUI.
- Keep new and materially changed component files below 150 lines.
- Preserve all calibration data, language, help state, release-announcement
  acknowledgement, last-exported choices, and Button Customize settings.
- Preserve the 1080-long-edge preview proxy, `memory-disk` preview/export
  policy, sequential export, Good Lock order, original-quality `1024 x 1024`
  PNGs, filenames, and all-or-nothing media saving.
- Never delete a URI outside `Paths.cache`.
- Never clear the whole `Paths.cache` directory.
- Never clear cache on `AppState` background/inactive transitions or depend on
  an app-termination callback.
- Cleanup failures are diagnostic only and must not block the user flow.
- The production baseline is the user-reported approximately 140 MB cache for
  `com.meh_chow.quickpanelbackgroundcropper`. The measured approximately 578
  KB belongs to `.dev` and is not a production baseline.
- Design and maintenance contract: `docs/cache-optimization.md`.

---

## File Map

**Create**

- `src/features/quick-panel/cache/cache-files.ts` — validate cache ownership,
  delete owned URIs, manage the dedicated export directory, and remove stale
  library/legacy files.
- `src/features/quick-panel/cache/useOwnedImageCache.ts` — retain cache URIs
  for one mounted workflow and release them on replacement or unmount.
- `src/features/quick-panel/cache/cache-maintenance.ts` — enforce the seven-day
  Expo Image disk-cache interval and run cold-start recovery.
- `__tests__/cache-files.test.ts` — cover cache-boundary safety, deduplication,
  the export directory, stale directories, and legacy filename filtering.
- `__tests__/owned-image-cache.test.tsx` — cover track, release, and unmount
  behavior.
- `__tests__/cache-maintenance.test.ts` — cover interval decisions, successful
  timestamps, failures, and startup recovery ordering.
- `__tests__/image-picker-cache-ownership.test.ts` — assert picker copies are
  explicitly marked as owned.
- `__tests__/default-calibration-cache-ownership.test.tsx` — cover default
  screenshot replacement and unmount cleanup.
- `__tests__/customize-cache-ownership.test.ts` — cover normalization failure,
  source replacement, and Customize unmount cleanup.

**Modify**

- `src/features/quick-panel/model/types.ts` — add optional owned cache URIs to
  `PickedImage` without changing persisted calibration shapes.
- `src/features/quick-panel/shared/pick-image-from-library.ts` — mark the
  picker-created local copy as owned.
- `src/features/quick-panel/customize/services/normalize-customize-image.ts` —
  transfer source ownership and add the generated normalized URI.
- `src/features/quick-panel/customize/hooks/useCustomizePreviewImage.ts` — use
  guarded cache deletion for owned proxies.
- `src/features/quick-panel/calibration/default/hooks/useCalibrationScreen.ts`
  — own imported screenshots through replacement and default-screen exit.
- `src/features/quick-panel/calibration/advanced/hooks/useAdvancedCalibrationScreen.ts`
  — own imported Controls/Buttons screenshots through replacement/exit.
- `src/features/quick-panel/calibration/advanced/combined/hooks/useCombinedCalibrationScreen.ts`
  — own imported combined screenshots through replacement/exit.
- `src/features/quick-panel/customize/hooks/useCustomizeActions.ts` — clean a
  failed pick, release a replaced source, and retain the active source until
  Customize unmounts.
- `src/features/quick-panel/customize/services/export-files.ts` — write captures
  under `qpbc-exports` and use guarded cleanup.
- `src/features/quick-panel/result/ResultScreen.tsx` — release successful
  capture files only after Result unmounts.
- `src/features/quick-panel/store/storage.ts` — persist the last successful
  Expo Image disk-cache clear timestamp independently.
- `src/app/_layout.tsx` — trigger best-effort cold-start maintenance once.
- `__tests__/advanced-calibration-leave-guard.test.tsx` and
  `__tests__/combined-calibration-controller.test.ts` — extend current exit
  behavior with screenshot ownership assertions.
- Focused normalization, proxy, export, Result, and storage tests listed in the
  tasks below.
- `docs/cache-optimization.md` and `docs/notes.md` — record implemented status
  and durable guardrails.

**Intentionally unchanged**

- `PanelSlice.tsx` and `ExportSurface.tsx` retain `cachePolicy="memory-disk"`.
- `useSequentialExport.ts` retains best-effort `memory-disk` prefetch,
  one-surface sequencing, readiness tokens, and failure cleanup.
- Media-library albums/assets and exported gallery copies are never deleted.
- Calibration persistence and MMKV schemas other than the independent
  maintenance timestamp remain unchanged.
- No `AppState`, background task, native module, size scanner, or user-facing
  Clear Cache control is added.

---

### Task 1: Add cache-boundary and image-ownership primitives

**Files:**

- Create: `src/features/quick-panel/cache/cache-files.ts`
- Create: `src/features/quick-panel/cache/useOwnedImageCache.ts`
- Create: `__tests__/cache-files.test.ts`
- Create: `__tests__/owned-image-cache.test.tsx`
- Modify: `src/features/quick-panel/model/types.ts`

**Interfaces:**

```ts
import type { CrashlyticsContext } from "@/lib/crashlytics";

export interface PickedImage {
  uri: string;
  width: number;
  height: number;
  fileName?: string | null;
  originalWidth?: number;
  originalHeight?: number;
  wasOptimized?: boolean;
  ownedCacheUris?: string[];
}

export interface OwnedImageCache {
  release: (image: PickedImage | null) => void;
  track: (image: PickedImage | null) => void;
}

export function deleteOwnedCacheUris(
  uris: readonly string[],
  context: CrashlyticsContext,
): void;

export function getExportCacheFile(fileName: string): File;
export function cleanupStaleAppOwnedCache(): void;
export function useOwnedImageCache(): OwnedImageCache;
```

- [ ] **Step 1: Write failing cache safety tests**

Create `__tests__/cache-files.test.ts` with a lightweight FileSystem mock and
cases equivalent to:

```ts
it("deletes each owned cache URI once and ignores non-cache URIs", () => {
  deleteOwnedCacheUris([
    "file:///cache/ImagePicker/source.jpg",
    "file:///cache/ImagePicker/source.jpg",
    "file:///photos/original.jpg",
  ], { action: "cleanup_test" });

  expect(mockDelete).toHaveBeenCalledTimes(1);
  expect(mockDelete).toHaveBeenCalledWith(
    "file:///cache/ImagePicker/source.jpg",
  );
});

it("creates and returns a file inside qpbc-exports", () => {
  expect(getExportCacheFile("01-button-box.png").uri).toBe(
    "file:///cache/qpbc-exports/01-button-box.png",
  );
  expect(mockDirectoryCreate).toHaveBeenCalledWith({ idempotent: true });
});
```

Also assert that `cleanupStaleAppOwnedCache()` deletes existing
`ImagePicker`, `ImageManipulator`, and `qpbc-exports` directories plus root
files matching `NN-<slug>.png`, while preserving `image_manager_disk_cache`,
`WebView`, unrelated root files, and the cache root itself.

- [ ] **Step 2: Write failing ownership-hook tests**

Create `__tests__/owned-image-cache.test.tsx` and mock
`deleteOwnedCacheUris`. Cover explicit release and unmount recovery:

```tsx
it("releases a tracked image once", () => {
  const hook = renderHook(() => useOwnedImageCache());
  const image = {
    height: 100,
    ownedCacheUris: ["file:///cache/ImagePicker/source.jpg"],
    uri: "file:///cache/ImagePicker/source.jpg",
    width: 100,
  };

  act(() => hook.result.current.track(image));
  act(() => hook.result.current.release(image));
  hook.unmount();

  expect(mockDeleteOwnedCacheUris).toHaveBeenCalledTimes(1);
});

it("releases every still-tracked URI on unmount", () => {
  const hook = renderHook(() => useOwnedImageCache());
  act(() => hook.result.current.track(optimizedImage));
  hook.unmount();

  expect(mockDeleteOwnedCacheUris).toHaveBeenCalledWith(
    optimizedImage.ownedCacheUris,
    { action: "cleanup_owned_image" },
  );
});
```

- [ ] **Step 3: Run the new tests and verify RED**

```bash
npm test -- --runInBand \
  __tests__/cache-files.test.ts \
  __tests__/owned-image-cache.test.tsx
```

Expected: FAIL because the cache modules and `ownedCacheUris` do not exist.

- [ ] **Step 4: Implement guarded cache deletion**

In `cache-files.ts`, use `Directory`, `File`, and `Paths` from
`expo-file-system`. Normalize the cache prefix with one trailing slash, dedupe
URIs with `Set`, and delete only files whose URI begins with that prefix.

Each deletion is best-effort. Catch per-file/per-directory errors and call
`recordCrashlyticsError` with the supplied `CrashlyticsContext`. This lets
export cleanup retain `panelId`. Do not throw from cleanup.

Use these exact owned directories and legacy filename rule:

```ts
const staleDirectoryNames = [
  "ImagePicker",
  "ImageManipulator",
  "qpbc-exports",
] as const;

const legacyExportPattern = /^\d{2}-[a-z0-9-]+\.png$/;
```

Create `qpbc-exports` with `{ idempotent: true }` before returning its target
file. Never delete `Paths.cache`, `image_manager_disk_cache`, or `WebView`.

- [ ] **Step 5: Implement the ownership hook**

Use one `useRef<Set<string>>` per mounted workflow. `track` adds only the
image's `ownedCacheUris`. `release` removes those URIs from the set and calls
`deleteOwnedCacheUris`. The effect cleanup snapshots and clears the set before
deleting remaining URIs, making React Strict Mode cleanup idempotent.

Do not memoize callbacks; React Compiler handles ordinary hook optimization.

- [ ] **Step 6: Re-run Task 1 tests**

Run the Step 3 command. Expected: PASS.

---

### Task 2: Track picker, normalization, calibration, and Customize files

**Files:**

- Modify: `src/features/quick-panel/shared/pick-image-from-library.ts`
- Modify: `src/features/quick-panel/customize/services/normalize-customize-image.ts`
- Modify: `src/features/quick-panel/customize/hooks/useCustomizePreviewImage.ts`
- Modify: `src/features/quick-panel/calibration/default/hooks/useCalibrationScreen.ts`
- Modify: `src/features/quick-panel/calibration/advanced/hooks/useAdvancedCalibrationScreen.ts`
- Modify: `src/features/quick-panel/calibration/advanced/combined/hooks/useCombinedCalibrationScreen.ts`
- Modify: `src/features/quick-panel/customize/hooks/useCustomizeActions.ts`
- Create: `__tests__/image-picker-cache-ownership.test.ts`
- Create: `__tests__/default-calibration-cache-ownership.test.tsx`
- Create: `__tests__/customize-cache-ownership.test.ts`
- Modify: `__tests__/customize-image-normalization.test.ts`
- Modify: `__tests__/customize-preview-image.test.ts`
- Modify: `__tests__/advanced-calibration-leave-guard.test.tsx`
- Modify: `__tests__/combined-calibration-controller.test.ts`

**Ownership flow:**

```text
ImagePicker copy -> track picker URI
  -> unchanged source -> active PickedImage owns picker URI
  -> normalized source -> active PickedImage owns picker URI + result URI
  -> preview proxy -> useCustomizePreviewImage owns proxy URI only
```

- [ ] **Step 1: Add failing picker and normalization assertions**

Create `image-picker-cache-ownership.test.ts` and mock
`launchImageLibraryAsync` to return one successful asset. Expect:

```ts
expect(await pickImageFromLibrary()).toMatchObject({
  ownedCacheUris: ["file:///cache/ImagePicker/picked.jpg"],
  uri: "file:///cache/ImagePicker/picked.jpg",
});
```

Extend `customize-image-normalization.test.ts` so unchanged inputs preserve
their ownership list and generated results contain both URIs in source-first
order:

```ts
expect(result.image.ownedCacheUris).toEqual([
  "file:///cache/ImagePicker/original.jpg",
  "file:///cache/ImageManipulator/optimized.jpg",
]);
```

Extend `customize-preview-image.test.ts` to assert that proxy cleanup calls:

```ts
deleteOwnedCacheUris([preview.uri], {
  action: "cleanup_customize_preview_image",
});
```

Never supply the source image URI to proxy cleanup.

- [ ] **Step 2: Add failing lifecycle tests**

Mock `useOwnedImageCache` in the default, advanced, combined, and Customize
hook tests. Put default cases in
`default-calibration-cache-ownership.test.tsx`, Customize cases in
`customize-cache-ownership.test.ts`, and extend the two named advanced tests.
Assert:

- a successful import is tracked;
- replacing an imported screenshot releases only the previous screenshot;
- leaving calibration keeps the screenshot until hook unmount, preserving the
  existing exit-animation fallback;
- normalization failure releases the newly picked source;
- successful replacement installs/tracks the new normalized image before
  releasing the previous active image; and
- Customize unmount releases the active picker/normalized URI set.

- [ ] **Step 3: Run the focused tests and verify RED**

```bash
npm test -- --runInBand \
  __tests__/image-picker-cache-ownership.test.ts \
  __tests__/default-calibration-cache-ownership.test.tsx \
  __tests__/customize-cache-ownership.test.ts \
  __tests__/customize-image-normalization.test.ts \
  __tests__/customize-preview-image.test.ts \
  __tests__/advanced-calibration-leave-guard.test.tsx \
  __tests__/combined-calibration-controller.test.ts
```

Expected: FAIL because ownership is neither returned nor wired into the hooks.

- [ ] **Step 4: Mark picker and normalized files as owned**

In `pick-image-from-library.ts`, add `ownedCacheUris: [asset.uri]` to the
returned `PickedImage`.

In `normalize-customize-image.ts`, preserve `asset.ownedCacheUris` for an
unchanged source. For a generated result, set:

```ts
ownedCacheUris: [
  ...(asset.ownedCacheUris ?? []),
  result.uri,
],
```

Do not infer ownership from `wasOptimized`; the explicit URI list is the only
deletion contract.

- [ ] **Step 5: Wire calibration ownership without breaking exit animation**

Instantiate `useOwnedImageCache()` in each calibration controller. On
successful import: track the new screenshot, update the store/draft, then
release the previous screenshot after the new state is installed.

Do not release the accepted screenshot inside `saveCalibration`. The existing
`leavingCalibration`/`leavingDraft` state renders it during route dismissal.
Let the ownership hook release it when the screen actually unmounts.

- [ ] **Step 6: Wire Customize ownership and failure cleanup**

Read the current `image` from `quickPanelSelectors.customizeActions`. Track the
picker result before normalization so a thrown normalization still has an
owner. On success, track the returned image, install it with
`finishImageProcessing`, then release the previous image. On failure, release
the just-picked source before reporting the existing localized error.

The ownership hook's unmount cleanup releases the active source after export
has saved and Customize navigates to Result, or when the user leaves Customize.

- [ ] **Step 7: Route proxy deletion through the safety boundary**

Replace direct `new File(preview.uri).delete()` in
`useCustomizePreviewImage.ts` with `deleteOwnedCacheUris`. Preserve its current
cancelled-promise and unmount behavior.

- [ ] **Step 8: Re-run the focused tests**

Run the Step 3 command. Expected: PASS.

---

### Task 3: Give successful exports a dedicated Result-owned lifecycle

**Files:**

- Modify: `src/features/quick-panel/customize/services/export-files.ts`
- Modify: `src/features/quick-panel/result/ResultScreen.tsx`
- Modify: `__tests__/export-files.test.ts`
- Modify: `__tests__/result-screen-layout.test.tsx`

- [ ] **Step 1: Write failing export-directory tests**

Update the FileSystem mock in `export-files.test.ts` and expect capture copy to
target:

```ts
expect(mockCopy).toHaveBeenCalledWith(
  expect.objectContaining({
    uri: "file:///cache/qpbc-exports/01-button-box.png",
  }),
  { overwrite: true },
);
```

Keep the existing assertions that view-shot temporary files are always
released and failed runs delete only their own captures.

- [ ] **Step 2: Write the failing Result ownership test**

Mock `cleanupCapturedExports` in `result-screen-layout.test.tsx`, render Result
with two successful exports, and assert they remain while mounted. Unmount and
expect one cleanup call containing the exact two exports.

Also cover Back Home: pressing the button clears store/navigation as before;
the files are deleted by unmount cleanup, not before the Result preview has
finished using them.

- [ ] **Step 3: Run focused tests and verify RED**

```bash
npm test -- --runInBand \
  __tests__/export-files.test.ts \
  __tests__/result-screen-layout.test.tsx \
  __tests__/sequential-export.test.tsx
```

Expected: FAIL because captures still use the cache root and Result does not
own cleanup.

- [ ] **Step 4: Move captures into the dedicated directory**

Replace `new File(Paths.cache, panel.fileName)` with
`getExportCacheFile(panel.fileName)`. Keep overwrite semantics, filenames,
capture dimensions, PNG settings, returned URI shape, and media-library save
order unchanged.

Route `cleanupCapturedExports` through the guarded cache deleter while
preserving per-panel Crashlytics context.

- [ ] **Step 5: Release successful captures after Result unmounts**

Add an effect in `ResultScreen` whose cleanup snapshots the rendered exports
and calls `void cleanupCapturedExports(exports)`. Do not delete on initial
render, before `Asset.create` completes, when Good Lock backgrounds the app, or
while Result remains mounted.

- [ ] **Step 6: Re-run export tests**

Run the Step 3 command. Expected: PASS with existing sequential, failure, and
all-or-nothing behavior unchanged.

---

### Task 4: Add cold-start recovery and seven-day Glide maintenance

**Files:**

- Create: `src/features/quick-panel/cache/cache-maintenance.ts`
- Create: `__tests__/cache-maintenance.test.ts`
- Modify: `src/features/quick-panel/store/storage.ts`
- Modify: `src/app/_layout.tsx`
- Modify: `__tests__/storage.test.ts`

**Interfaces:**

```ts
export const imageDiskCacheMaxAgeMs = 7 * 24 * 60 * 60 * 1000;

export function loadLastImageDiskCacheClearAt(): number | null;
export function saveLastImageDiskCacheClearAt(timestamp: number): void;

export function shouldClearImageDiskCache(
  now: number,
  lastClearedAt: number | null,
): boolean;

export async function runColdStartCacheMaintenance(
  now?: number,
): Promise<void>;
```

- [ ] **Step 1: Add failing timestamp storage tests**

In `storage.test.ts`, remove `quick-panel.last-image-disk-cache-clear-at` in
test setup and cover missing, valid, malformed, negative, and non-finite
values. A valid timestamp must round-trip without changing any calibration or
preference keys.

- [ ] **Step 2: Add failing maintenance-policy tests**

Mock `cleanupStaleAppOwnedCache`, Expo Image, timestamp storage, and
Crashlytics. Cover these exact decisions:

```ts
expect(shouldClearImageDiskCache(now, null)).toBe(true);
expect(shouldClearImageDiskCache(now, now - maxAge + 1)).toBe(false);
expect(shouldClearImageDiskCache(now, now - maxAge)).toBe(true);
expect(shouldClearImageDiskCache(now, now + 1)).toBe(true);
```

Assert every run performs app-owned stale cleanup. Assert Glide clearing only
runs when due, stores `now` only when `Image.clearDiskCache()` resolves `true`,
and records but swallows thrown failures.

- [ ] **Step 3: Run focused tests and verify RED**

```bash
npm test -- --runInBand \
  __tests__/storage.test.ts \
  __tests__/cache-maintenance.test.ts
```

Expected: FAIL because the storage key and maintenance service do not exist.

- [ ] **Step 4: Implement independent timestamp storage**

Add the MMKV key
`quick-panel.last-image-disk-cache-clear-at`. Store the value as a decimal
string. Load only a finite, non-negative number; otherwise return `null`.

This key is maintenance metadata, not a user preference. Never reset any
existing key when it is missing or malformed.

- [ ] **Step 5: Implement cold-start maintenance**

`runColdStartCacheMaintenance` must:

1. call `cleanupStaleAppOwnedCache()` on every cold start;
2. load the previous successful Glide clear timestamp;
3. return without touching Glide when the interval has not elapsed;
4. await `Image.clearDiskCache()` when due;
5. save `now` only when it returns `true`; and
6. record and swallow any error.

Do not call `Image.clearMemoryCache`, do not enumerate/delete Glide's hashed
files, and do not change any image component's cache policy.

- [ ] **Step 6: Trigger maintenance once from RootLayout**

Add one mount effect in `_layout.tsx`:

```ts
useEffect(() => {
  void runColdStartCacheMaintenance();
}, []);
```

Run it immediately after the first root render commit rather than from
`AppState` or
an idle callback that could race a very fast image import. The function is
idempotent and best-effort, so React Strict Mode does not make deletion unsafe.

- [ ] **Step 7: Re-run maintenance tests**

Run the Step 3 command. Expected: PASS.

---

### Task 5: Document, verify, and hand off production measurement

**Files:**

- Modify: `docs/cache-optimization.md`
- Modify: `docs/notes.md`

- [ ] **Step 1: Update durable documentation**

Change the cache guide status to `Implemented` and add the verification date.
Record in `docs/notes.md` that:

- cache deletion is URI-ownership based and cache-root guarded;
- Result owns successful captures until unmount;
- cold start recovers stale QPBC-owned files;
- Glide is cleared at most once per seven-day interval;
- background/termination callbacks are not cleanup boundaries; and
- production and `.dev` storage measurements are never mixed.

- [ ] **Step 2: Run focused cache and export verification**

```bash
npm test -- --runInBand --no-cache \
  __tests__/cache-files.test.ts \
  __tests__/owned-image-cache.test.tsx \
  __tests__/cache-maintenance.test.ts \
  __tests__/image-picker-cache-ownership.test.ts \
  __tests__/default-calibration-cache-ownership.test.tsx \
  __tests__/customize-cache-ownership.test.ts \
  __tests__/customize-image-normalization.test.ts \
  __tests__/customize-preview-image.test.ts \
  __tests__/advanced-calibration-leave-guard.test.tsx \
  __tests__/combined-calibration-controller.test.ts \
  __tests__/export-files.test.ts \
  __tests__/result-screen-layout.test.tsx \
  __tests__/sequential-export.test.tsx \
  __tests__/storage.test.ts
```

Expected: all focused suites pass with no open handles.

- [ ] **Step 3: Run repository verification**

```bash
npm test -- --runInBand --no-cache
npm run lint
npx tsc --noEmit
git diff --check
```

Expected: every command exits 0. Do not perform physical QA in this execution
session.

- [ ] **Step 4: Prepare user-run cache acceptance**

The user should verify the same package before and after repeated work. Record
package names beside every result.

For a debuggable dev build, inspect directories with:

```bash
adb exec-out run-as com.meh_chow.quickpanelbackgroundcropper.dev \
  sh -c 'du -ak cache' | sort -n | tail -50
```

For production, `run-as` is unavailable because the installed package is not
debuggable. Use Android Settings for the cache total and, when supported:

```bash
adb shell cmd package get-package-storage-stats \
  com.meh_chow.quickpanelbackgroundcropper
```

Manual acceptance belongs to the user:

1. Launch the updated build once and confirm it reaches Landing normally.
2. Import and replace screenshots in Default, Advanced Controls, Advanced
   Buttons, and Combined calibration.
3. Replace at least two large Customize images, then complete an export with
   multiple Buttons.
4. Open Good Lock and return; confirm Result previews remain available.
5. Return Home, force-stop, relaunch, and confirm all saved gallery PNGs remain.
6. Compare cache totals for the same package. Repeated completed flows must not
   show continuing growth from picker, manipulator, or export files; Glide may
   rebuild between scheduled seven-day clears.

No git action is part of this plan. When implementation and automated checks
finish, provide only the brief commit-message suggestion required by
`AGENTS.md`.
