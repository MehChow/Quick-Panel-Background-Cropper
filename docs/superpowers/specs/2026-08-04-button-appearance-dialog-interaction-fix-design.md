# Button Appearance Dialog Interaction Fix Design

**Date:** 2026-08-04
**Status:** Approved for implementation planning

## Purpose

Polish the implemented focused Button appearance inspector after device use
revealed two interaction problems:

- the `Before / New` comparison tabs add height and interaction without helping
  the normal color-adjustment workflow; and
- dragging the color wheel or its sliders can also move the dialog's outer
  scroll view, making the picker feel unstable and laggy.

The revised dialog should always show the current valid draft and give the
picker exclusive control of a drag while it is active.

## Evidence and diagnosis

The focused inspector correctly keeps continuous color updates in Reanimated
shared values. It does not send every picker frame through React state, so a
per-frame React render is not the primary source of the observed lag.

The focused preview and selector made the modal content tall enough that its
outer `ScrollView` now scrolls on realistic device sizes. That scroll view
remains enabled while `Panel3`, Brightness, or Opacity handles a drag. The
picker and parent scroll recognizers therefore compete, and movement of the
image-heavy modal subtree increases the perceived cost of the interaction.

Removing the comparison row reduces height and state work, but the gesture
ownership conflict must also be fixed explicitly. Device QA should confirm the
result because this diagnosis is source-grounded rather than profiler-measured.

## Revised user experience

Keep the magnified real-Button preview and Previous/Next Button navigation.
Remove the `Before / New` tabs completely.

The focused preview always renders the latest valid draft:

- color-wheel, brightness, opacity, valid HEX, and Light/Dark changes appear
  immediately;
- invalid HEX retains the last valid preview and disables Confirm;
- Confirm commits the valid draft; and
- Cancel, backdrop dismissal, and Android Back discard it.

No comparison state, copy, accessibility nodes, or persistence is retained.
Opening the dialog still starts from the currently committed appearance, so
Cancel remains the way to compare indirectly with the applied result.

## Gesture ownership

The dialog owns a screen-local `isPickerInteracting` boolean. The modal frame
receives `scrollEnabled={!isPickerInteracting}` and applies it to the existing
gesture-handler `ScrollView`.

Only the interactive picker surface participates in the lock:

- start the lock when a touch begins inside the `ColorPicker` region;
- release it on touch end or touch cancellation; and
- also release it from `onCompleteJS` as a defensive completion path.

The region includes `Panel3`, Brightness, and Opacity because all three are
children of `ColorPicker`. Do not lock scrolling for the HEX input or
Light/Dark selector. A user must still be able to start ordinary dialog
scrolling from those non-picker areas.

One React update at interaction start and one at interaction end are
acceptable. Continuous picker values must remain in the existing Reanimated
worklet/shared-value path; do not introduce `onChangeJS` or React state updates
per frame.

## Performance boundary

This iteration removes the confirmed gesture conflict and redundant comparison
UI. It does not rewrite the focused preview, cache new bitmaps, lower preview
quality, debounce live feedback, or add a dependency.

If device testing still shows material lag after the scroll lock, capture a
separate profiler-backed investigation. Do not pre-emptively weaken the live,
export-faithful preview.

## Preserved behavior

The following remain unchanged:

- focused Button ordering and cyclic Previous/Next navigation;
- actual calibrated Button shape, crop, label, icon, and identifier position;
- shared source image, dimensions, transform, and target-specific intensity;
- main Customize preview and its pan/pinch gestures;
- global Button appearance rather than per-Button settings;
- persisted settings schema and defaults;
- preview/export composition and sequential export behavior;
- keyboard avoidance, backdrop dismissal, sticky actions, and safe areas; and
- Controls-only Customize behavior.

## Accessibility and localization

Remove the English and Traditional Chinese Before/New strings and their tab
semantics. Preserve the focused Button name/count and Previous/Next accessible
controls.

Disabling the parent scroll view must not disable picker accessibility or the
dialog actions. The scroll lock is temporary and must always be released after
end, cancel, or picker completion.

## Automated coverage

Update focused tests to prove:

- the inspector controls render Button navigation without comparison tabs;
- the dialog always passes the animated valid draft to the focused preview;
- the dialog frame scrolls normally when idle;
- picker touch start disables outer scrolling;
- touch end and touch cancel restore scrolling;
- picker completion also restores scrolling;
- continuous color updates still use `onChange`, not `onChangeJS`;
- Confirm/Cancel/backdrop/Back and invalid-HEX behavior remain transactional;
  and
- English and Traditional Chinese locale keys remain in parity after removing
  comparison copy.

## Manual acceptance criteria

On a short Samsung portrait screen:

1. Open Button appearance and verify there is no Before/New row.
2. Switch among Buttons and confirm the focused preview remains correct.
3. Drag around the color wheel continuously; the dialog must not scroll and the
   preview must update smoothly.
4. Drag Brightness and Opacity; the dialog must remain stationary.
5. Release or cancel a picker drag, then scroll from outside the picker and
   confirm normal scrolling returns.
6. Open the keyboard from HEX, dismiss it, and confirm both picker and scrolling
   still work.
7. Verify invalid HEX, Cancel, backdrop, Android Back, and Confirm keep their
   existing transactional results.

Physical device and Good Lock QA remain with the user.

## Non-goals

- Redesigning the main Customize screen
- Removing modal scrolling
- Adding preview zoom or picker swipe navigation
- Changing export rendering or saved settings
- Profiling or optimizing unrelated image/export paths

## Supersession

This design supersedes only the `Before / New` comparison behavior and the
unlocked picker-versus-scroll interaction described by
`2026-08-04-button-appearance-focused-inspector-design.md`. The focused real
Button inspector and all other approved behavior remain authoritative.
