# Unified Silent Image Import Implementation Plan

Restored after the previous implementation was reset. Approved design: use one
pipeline for Customize and all calibration imports. Keep small images unchanged;
silently downsample large images to a 3072-pixel long edge, JPEG quality 90 or PNG
to preserve transparency. Respect orientation, never upscale, and never reject
solely because of input dimensions/file size. The 5152 x 7728 regression must
produce 2048 x 3072 and open adjustment without a compression warning.

1. Replace Customize-only normalization with shared preparation. Decode at a
   bounded resolution before encoding; retain accurate metadata and ownership.
2. Share selection lifecycle: synchronous duplicate guard, temporary busy state,
   stale/unmount protection, cleanup, old-image preservation on cancel/failure.
   Integrate Default, Advanced Controls/Buttons, Combined, and Customize.
3. Gate preview on proxy readiness, release native resources, retain the working
   source and shared coordinate system for exports. Show only real import errors.
4. Run regression tests, TypeScript/lint, and Codex API 36 emulator checks. Verify
   exact-size JPEG, orientation, transparency, replacements and export. Review
   further optimizations only after the core flow works.

No new selectable formats or animation handling. Preserve all persisted data,
calibrations, localization (English/Traditional Chinese/Spanish), and existing
1024-square Button export behavior. Read Expo 57 docs and repository styling.

## Execution record (2026-09-22)

- Clean reset confirmed on hotfix/1.7.1; user explicitly requested implementation
  here, so keep this checkout rather than creating another worktree.
- Ruling: use existing Expo Image.loadAsync with maxWidth/maxHeight, followed by
  ImageManipulator.manipulate(ImageRef), rather than a new native module. Verified
  installed Android ImageLoadTask uses Glide centerInside + submit(size); iOS
  uses thumbnail pixel size. Manipulator accepts the decoded native reference.
  This avoids decoding the full source again, and adds no native dependency.
- Tasks 1-4 implemented. Added shared preparation/lifecycle regression coverage
  and integration tests for Default, Advanced Controls/Buttons, and Combined.
- Verification: 81 suites / 434 tests passed; TypeScript and lint passed; Android
  debug build installed successfully on Codex API 36. Exact 5152 x 7728 JPEG
  produced 2048 x 3072, reached adjustment, and exported four Default panels.
- Native cases also passed: 54MP JPEG, rotated and mirrored EXIF, transparent
  PNG, 1 x 10000 PNG, unchanged small JPEG, cancellation, and cache replacement.
  Native Advanced calibration/export flows were not repeated; their import
  branches were checked through hook integration tests.
- Follow-up optimization: release preview/manipulator native references, avoid
  rendering the working image while its proxy is pending, and clamp narrow
  resize dimensions. The strip fallback was reproduced and verified natively.
- Self-review completed. The requested independent reviewer was unavailable
  because its usage limit was reached; no independent-review claim is made.
