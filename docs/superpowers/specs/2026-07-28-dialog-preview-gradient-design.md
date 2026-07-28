# Dialog Preview Gradient Design

**Date:** 2026-07-28
**Status:** Approved

## Goal

Make transparent artwork look consistent between the Buttons Customize preview
and the Label appearance dialog preview.

## Current mismatch

- The page-level preview is transparent over the app-wide
  `AppGradientBackground` (`#261E1E` to `#341F3A`).
- The dialog preview is transparent over the dialog's `bg-slate-950` surface.
- Transparent areas therefore look different even though both previews use the
  same image composition.

## Approved design

Add an optional app-gradient backdrop to the shared Quick Panel preview stage.
Enable it only for the Label appearance dialog.

- Reuse `AppGradientBackground`; do not duplicate its gradient colors.
- Render one backdrop per visible panel inside `QuickPanelPreviewStage`, using
  the same scaled panel rectangle and radius as its `PanelSlice`. The dialog
  surface must remain visible in gaps and outer corners between panels.
- Keep the gradient outside the preview content's existing `0.9` opacity so it
  matches the full-strength page background; move that opacity to a full-size
  panel-content layer without changing panel rendering.
- Keep the normal Customize preview transparent so it continues to reveal the
  existing app-wide gradient.
- Keep the dialog card, picker controls, preview geometry, image opacity,
  identifier appearance, and exports unchanged.
- Do not add the gradient to export surfaces.

## Testing

- Add a focused preview-stage test proving the optional backdrop renders only
  when requested and is clipped to the panel frame.
- Assert that the dialog requests the backdrop.
- Run the focused dialog/preview tests, full Jest suite, lint, TypeScript, and
  `git diff --check`.

## Out of scope

- Changing the app gradient colors or direction.
- Changing the whole dialog background.
- Changing image transparency or export rendering.
- Updating flow screenshots.
