# Cache Optimization

**Status:** Implemented (verified 2026-08-05)

## Purpose

QPBC processes full-quality screenshots, source images, preview proxies, and
`1024 x 1024` PNG exports locally. Temporary storage is expected, but it must
remain disposable and must not grow indefinitely across completed sessions.

The reported production app cache is about 140 MB. A separate inspection of
`com.meh_chow.quickpanelbackgroundcropper.dev` showed only about 578 KB, so
variant measurements must not be compared as if they were the same app data.

## Graceful cache handling

QPBC follows an ownership-based cleanup policy:

- ImagePicker copies and ImageManipulator results are tracked as app-owned
  cache files. They are deleted when replaced or when their calibration or
  Customize screen finishes using them.
- Preview proxies remain temporary and are deleted when Customize changes
  source or unmounts.
- Export captures live in a dedicated `qpbc-exports` cache directory. They stay
  available long enough to render Result, then are deleted after Result
  unmounts. The copies already saved to the media library are unaffected.
- A cold-start maintenance pass removes stale QPBC-owned files left by a crash,
  force-stop, or interrupted export. It does not wipe the whole app cache.
- Expo Image keeps its existing `memory-disk` behavior for responsive preview
  and sequential export. Its bounded Glide disk cache is cleared at cold start
  only when the previous successful clear is at least seven days old.

Cleanup is best-effort. A deletion failure is recorded for diagnostics but
must not block calibration, customization, export, Result navigation, or app
startup.

## Lifecycle rules

QPBC does not clear cache when the app merely enters the background. Image
selection and opening Good Lock both background the app during normal use.

QPBC also does not depend on an "app closed" callback because Android may kill
the process without running JavaScript cleanup. Normal ownership cleanup is
the first line of defense; the next cold start recovers anything it could not
finish.

## Measurement

Always measure the intended package:

- Production: `com.meh_chow.quickpanelbackgroundcropper`
- Development: `com.meh_chow.quickpanelbackgroundcropper.dev`
- Local APK variant: `com.meh_chow.quickpanelbackgroundcropper.apk`

Production is not debuggable, so `run-as` cannot list its private cache files.
Use Android Settings for the production cache total, or use Android's package
storage summary when supported:

```bash
adb shell cmd package get-package-storage-stats \
  com.meh_chow.quickpanelbackgroundcropper
```

Use `run-as` only for a debuggable variant when a directory-level breakdown is
needed.
