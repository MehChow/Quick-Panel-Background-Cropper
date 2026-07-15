# Buttons Selection Area Preview

## Goal

Let users quickly recall which Quick Panel Buttons were inside the green area
they confirmed before reaching the Buttons-only label picker, without reducing
the space available for search results and selected labels.

## Scope

This change applies only to the Advanced Buttons-only `panelSelection` phase.
It adds a read-only preview of the confirmed outer area. It does not change the
outer rectangle, selected labels, generated Button rectangles, or saved
calibration data.

## Picker Layout

- Keep the page header action position reserved for the existing helper pattern.
- Place the search field and preview trigger in one row.
- Keep the search field flexible and place a square eye button to its right.
- Match the eye button to the search field's 48-point height, dark inset fill,
  subtle border, and rounded-xl radius.
- Use a white eye icon at rest. While the preview is visible, use an emerald
  border and subtle emerald fill to connect the trigger to the green outer area.
- Preserve the selected summary, label list, scrolling behavior, and footer.

## Interaction

Tap the eye button to open the read-only preview. Keep it open until the user
taps the dimmed backdrop. Opening the preview provides one light selection
haptic.

## Preview Card

- Overlay the Buttons selection panel rather than inserting content into its
  scroll layout.
- Dim the selection panel behind the preview with a 45% black layer while
  leaving the page header and footer visually stable.
- Center a read-only image card within the selection panel.
- Render only the part of the imported screenshot inside `outerRect`, preserving
  the confirmed crop's aspect ratio.
- Add the same emerald outline used for the confirmed outer area.
- Fit the crop within the panel with 16-point side margins and a 60% panel-height
  cap. Use contain-style sizing for unusually wide or tall outer rectangles.
- Do not create a new cropped image file or persist preview state.

## Motion

The preview should appear spatially connected to the eye button:

- Measure the eye button and final card centers in the selection panel.
- Enter by translating from the eye button toward the panel center while scaling
  from `0.65` to `1` and fading to full opacity.
- Use a 200 ms ease-out entrance.
- Fade the dimming layer in with the card.
- Exit by reversing toward the eye button in 140 ms.
- Animate only transform and opacity.
- When reduced motion is enabled, remove translation and scale and use a 120 ms
  opacity transition only.

## Component Boundaries

- Keep `ButtonPanelSelection` responsible for label selection and arranging the
  search row.
- Add a focused preview trigger/overlay component so the existing selection file
  remains under the repository's 150-line guideline.
- Pass the existing imported screenshot and `outerRect` into that component.
- Use `expo-image`, the installed Lucide icon package, Reanimated, the existing
  reduced-motion hook, and existing haptics support. Add no dependency.
- Calculate the visible crop from the screenshot dimensions and `outerRect` at
  render time.

## Accessibility

- Give the eye button a `Preview outlined area` accessibility label.
- Explain the tap and backdrop-dismiss behavior in its accessibility hint.
- Keep a minimum 44-point touch target.
- Treat the pinned preview as a dismissible overlay and return focus to the eye
  button when it closes.
- Do not expose the decorative green outline as a separate accessibility element.

## Edge Cases

- If the screenshot or confirmed rectangle is unavailable, hide the eye button
  and do not open an empty overlay.
- Clamp preview crop coordinates to the screenshot bounds.
- Preserve the preview aspect ratio on short phones and unusually shaped crops.
- Closing the screen, navigating back, or changing calibration phase must clear
  transient preview state.

## Verification

No new automated tests are required unless explicitly requested. Run lint and
TypeScript checks after implementation. Manually verify tap open/dismiss,
reduced motion, TalkBack labeling, short-screen sizing, and accurate crop
alignment against the prior green area.

## Non-goals

- Editing or returning to the outer rectangle from the preview.
- Keeping a thumbnail permanently visible in the picker.
- Replacing the header helper action.
- Persisting preview visibility or generating a cropped asset.
