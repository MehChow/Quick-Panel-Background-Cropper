# Button Appearance Focused Inspector Design

**Date:** 2026-08-04
**Status:** Awaiting user review

## Purpose

Improve Button identifier appearance editing on Customize when the calibrated
layout contains a tall Controls + Buttons union.

The full-layout preview correctly fits every calibrated panel into the available
portrait screen. In a large combined layout, however, this necessarily makes
each Button identifier small. The current appearance dialog repeats that same
full union inside a height-limited read-only preview, so glyph color, opacity,
and Light/Dark circle differences are difficult to inspect.

The approved direction separates the two editing contexts:

- the main Customize preview remains the composition overview for the shared
  image transform; and
- the appearance dialog becomes a magnified, export-faithful inspector for one
  real Button panel at a time.

## Product intent

The user has already calibrated a Samsung Quick Panel layout and selected the
background image. On Customize, they need to position that image across the
whole layout, then judge whether the shared Button identifier style remains
readable against the actual Button crops.

The inspector should feel like a precise loupe attached to the existing Quick
Panel editor: focused, immediate, and faithful to the exported composition.

Its signature element is a magnified rendering of an actual calibrated Button,
not a generic sample icon or an enlarged color swatch.

## Scope

This change applies to any Customize target containing Button panels:

- Advanced Buttons-only; and
- Advanced Controls + Buttons.

The dialog continues to edit the shared Button identifier settings already
owned by `quick-panel.button-customize-settings`:

- glyph color;
- identifier opacity; and
- Light/Dark identifier background style.

The focused panel is only an inspection choice. It does not introduce
per-Button appearance settings.

## Main Customize screen

Keep the main Customize composition unchanged in this iteration:

- continue fitting the complete visible panel union;
- continue using one source image and one shared `{ x, y, scale }` transform;
- continue allowing the existing pan and zoom gestures;
- keep the current Button controls card and appearance trigger; and
- keep export actions and reset behavior unchanged.

Do not add a second `Layout / Button detail` mode to the main screen. Do not
overload the existing image-transform gestures with display-only preview zoom.

A collapsible Button controls card may be considered separately later, but it
is not required to solve the appearance-inspection problem.

## Appearance dialog layout

Keep the existing modal, keyboard-safe behavior, scrolling picker content, and
sticky Cancel/Confirm footer. Replace its full-layout preview with this focused
header area:

```text
┌────────────────────────────────┐
│ Button appearance              │
│                                │
│    magnified real Button       │
│    [ icon ]  Wi-Fi             │
│                                │
│  ‹   Wi-Fi · 1 of 4        ›   │
│          Before | New          │
├────────────────────────────────┤
│ Color wheel and adjustments    │
│ HEX                  Light/Dark│
├────────────────────────────────┤
│ Cancel                 Confirm │
└────────────────────────────────┘
```

The focused preview receives the space currently assigned to the complete
layout preview. It should fit one entire Button panel within the available
width and a roughly 160–190dp height budget without cropping or distorting its
aspect ratio. Keep the focused preview surface centered at roughly 70% of the
available inspector width so the navigation controls remain in the outside
gutters. Horizontal, vertical, square, and larger square Buttons retain their
calibrated shapes.

The picker may scroll on short screens, but the title and action footer must
remain usable. Existing maximum card width and safe-area behavior remain.

## Focused Button selection

Build the inspector list by filtering `preset.visualOrder` to Button-family
panels. Controls never appear in the inspector selector.

Behavior:

- open on the first Button in visual/export order;
- keep the focused Button label in the preview's accessibility name without
  adding a visible label/count row;
- show Previous and Next controls only when more than one Button exists;
- place the explicit Previous and Next controls at the vertically centered left
  and right edges of the focused preview, with at least 44×44dp hit areas;
- cycle from the first Button to the last and from the last to the first; and
- keep the focused index screen-local and reset it whenever the dialog closes.

Changing focus must not change selection, calibration, visual order, export
order, filenames, image transform, or persisted state.

## Export-faithful focused rendering

The focused preview must render the selected panel through the existing
preview composition path rather than constructing a mock sample.

It shows the calibrated applied Button shape, not the raw square PNG capture
surface. Here, export-faithful means that preview and export share the same
source-coordinate composition inputs and committed appearance settings; it
does not imply a pixel-identical simulation of One UI or QuickStar clipping.

It uses the selected panel's real:

- calibrated rectangle and aspect ratio;
- source-coordinate image crop;
- normalized preview image URI and logical source dimensions;
- shared `{ x, y, scale }` image transform;
- Button image intensity for the current target;
- identifier definition, icon, and label;
- reference-cell-relative identifier metrics;
- horizontal or vertical identifier position;
- glyph color and opacity; and
- Light/Dark identifier background style.

The selected panel is visually magnified by changing only the display scale and
focused preview frame. Do not create another crop, image transform, per-panel
opacity value, export surface, or persisted preview state.

The focused preview remains read-only. Pan, pinch, and drag gestures stay on the
main Customize preview.

## Live draft and comparison behavior

Preserve the dialog's transactional draft model:

- opening captures the currently committed appearance as `Before`;
- color-wheel, brightness, intensity, HEX, and Light/Dark changes update the
  valid `New` draft;
- the focused preview shows `New` by default and updates live;
- selecting `Before` renders the opening committed appearance without changing
  the draft;
- any subsequent valid appearance adjustment automatically returns the
  comparison selection to `New`;
- Confirm commits the latest valid draft; and
- Cancel, backdrop dismissal, and Android Back discard the draft.

`Before / New` is a display comparison only. It must not call the persisted
settings setter, overwrite draft controls, or affect export before Confirm.

Invalid HEX input continues to show the existing validation error and disables
Confirm. It must not replace the last valid focused preview appearance.

## Accessibility and localization

Add accessibility labels for:

- Previous Button;
- Next Button;
- Before appearance; and
- New appearance.

The focused preview should expose the current Button label as its accessible
name. Previous/Next and comparison controls must expose selected or disabled
state as appropriate. Button hit areas remain at least 44×44dp.

When only one Button exists, omit the redundant Previous/Next controls. The
focused Button label remains available through the preview's accessibility
name.

## Empty and defensive states

The appearance trigger is already shown only when the preset contains Button
panels. Retain that boundary.

If the focused list is unexpectedly empty, the dialog must avoid rendering an
invalid panel. Show a small localized unavailable state, keep Cancel available,
and disable Confirm. Do not crash, auto-close, or synthesize a fake Button.

## Component boundaries

Keep responsibilities focused:

- `ButtonLabelAppearanceDialog` owns modal composition, transactional actions,
  focused index, and comparison selection.
- A focused Button preview component owns fitting and rendering one real panel.
- A small pure helper derives the ordered Button panel IDs and normalizes the
  focused index.
- Existing `PanelSlice`, identifier layout, animated appearance, image
  transform, and color-picker primitives remain authoritative.

Do not grow the main `CustomizeScreen`, add another store field, or fork the
preview/export composition model.

## Testing

Add focused automated coverage for:

- filtering the preset to Button panels in stable visual order;
- opening on the first Button;
- rendering only the focused Button rather than the whole combined union;
- edge Previous/Next cycling through multiple Button shapes and labels;
- the single-Button state without navigation controls;
- the absence of a visible position label row;
- focus changes remaining screen-local and non-persistent;
- the focused renderer receiving the current image transform, target-specific
  Button intensity, identifier positions, and actual panel definition;
- live draft color, opacity, and Light/Dark updates;
- `Before` rendering the opening committed appearance;
- valid draft changes returning comparison to `New`;
- Confirm committing the latest valid draft;
- Cancel, backdrop, and Android Back discarding it;
- invalid HEX preserving the last valid preview and disabling Confirm;
- Controls-only Customize remaining unchanged; and
- English and Traditional Chinese locale-key parity.

Finish implementation verification with the focused suites, full Jest, Expo
lint, TypeScript, and `git diff --check`. Physical Samsung and Good Lock visual
QA remains for the user.

## Manual acceptance criteria

On the primary Samsung portrait device:

1. Open a combined layout containing several Button shapes.
2. Confirm the main preview still pans and zooms the continuous image normally.
3. Open Button appearance and verify the glyph is clearly inspectable without
   enlarging the full layout.
4. Cycle through every Button and confirm each uses its real image crop, label,
   icon, shape, and identifier position.
5. Adjust color, opacity, and Light/Dark style and confirm the focused preview
   responds immediately.
6. Compare Before and New, then Cancel and confirm the main preview remains on
   the previous committed appearance.
7. Reopen, adjust, Confirm, export, and verify the focused appearance matches
   the applied QuickStar result within the app's existing preview limitations.

## Non-goals

- Enlarging or redesigning the entire combined Customize layout
- Adding display zoom to the main preview
- Adding a second image transform or focused-panel crop
- Adding per-Button colors, opacity, themes, positions, or images
- Changing calibration, grid, panel geometry, or export order
- Changing Button image-intensity persistence
- Changing Controls preview or export treatment
- Changing the `1024 x 1024` sequential export pipeline
- Adding new color-analysis, contrast scoring, or automatic color suggestions

## Success criteria

- A Button glyph is large enough to judge while editing appearance on a
  portrait phone.
- The inspector shows actual calibrated Button output rather than an abstract
  sample.
- Users can inspect every selected Button without changing the exported
  composition.
- Appearance editing remains transactional and shared across Buttons-only and
  combined targets.
- Main preview gestures, source-coordinate parity, persistence, and sequential
  export remain unchanged.
