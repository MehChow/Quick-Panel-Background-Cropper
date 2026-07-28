# Buttons Label Color Picker Design

**Date:** 2026-07-27
**Status:** Approved for implementation planning

## Purpose

Buttons-only Customize currently offers one light/dark identifier style and a
separate Label intensity tab. Expand identifier appearance into a transactional
color editor where users can choose any shared icon-and-label color, adjust its
brightness and opacity, choose a light or dark neutral icon-circle background,
enter an exact HEX value, and see immediate feedback in the current Quick Panel
composition.

## Scope

This change applies only to Advanced Buttons-only Customize previews and
exports. It includes:

- a compact color-swatch trigger replacing the light/dark style toggle;
- a dimmed dialog with a read-only Quick Panel preview;
- hue/saturation, tabbed brightness/intensity, and HEX controls;
- shared color for Button icon glyphs and label text;
- a user-selected light or dark neutral icon circle;
- transactional Cancel and Confirm behavior;
- persisted color as a replacement for the existing light/dark setting; and
- matching preview and export output.

It does not change calibration, image placement, Button selection, icon
mappings, filenames, export order, Controls rendering, or per-Button settings.

## Dependency Decision

Use `reanimated-color-picker` rather than implementing a color picker locally.
The reviewed version is `5.1.2`; revalidate that exact release immediately
before installation and lock the resolved version.

The package already targets Expo, React Native Gesture Handler, and Reanimated,
all of which exist in this Expo 56 app. Use only these library pieces:

- `Panel3` for the hue/saturation wheel;
- `BrightnessSlider`;
- `OpacitySlider`.

Use an app-owned controlled HEX field synchronized through the picker's
imperative color API. Version `5.1.2` of the library deliberately omits raw
text-change and focus callbacks from `InputWidget`, so that widget cannot expose
an incomplete or invalid draft to our inline validation or Confirm button.
Keeping the field app-owned preserves the approved validation behavior without
reimplementing color gestures or conversion.

A custom picker would duplicate gesture handling, HSV/RGB conversion,
accessibility, thumb behavior, synchronized inputs, and edge-case validation.

Do not drive React state from the library's continuous `onChangeJS` event. The
library warns against this for performance, and an Android/Fabric crash has
been reported for that pattern. Continuous feedback must use a worklet
`onChange` callback and Reanimated shared values. Commit ordinary React/MMKV
state only when the user confirms.

## Approved Main Controls

Keep the compact top row:

```text
┌────────────────────────────────────┐
│ Show labels                ON [●]  │
│ [Image]       [Horiz.]      [Vert.]│
│                                    │
│ BUTTON IMAGE INTENSITY         78% │
│ ───────────────○─────────────────  │
└────────────────────────────────────┘
```

- Replace the sun/moon style toggle with a 44-point color-swatch button.
- The swatch fill shows the committed identifier color and includes a visible
  palette affordance so it reads as an action, not decoration.
- Disable and dim the swatch while Show labels is off.
- Remove the Labels tab and its shared-slider presentation.
- Keep Image, Horiz., and Vert. tabs with their existing visibility rules,
  values, and behavior.
- If labels are hidden while a position tab is active, return to Image as
  today.

## Label Appearance Dialog

Pressing the swatch opens a centered, dimmed dialog:

```text
┌────────────────────────────────────┐
│ Label appearance                   │
│                                    │
│ [read-only current layout preview] │
│                                    │
│          [color wheel]             │
│ [Brightness] [Intensity]           │
│ VALUE 70%        ─────○──────────  │
│ [ #FFFFFF                    ] [☀] │
│                                    │
│              [Cancel] [Confirm]    │
└────────────────────────────────────┘
```

- Show the full current Buttons composition using the selected image, current
  transform, calibrated panel rectangles, identifier positions, and image
  intensity.
- Keep the dialog preview read-only. Pan and pinch gestures remain available
  only on the main Customize preview.
- Update icon glyphs, label text, icon-circle theme, and opacity in real time
  as any picker control changes.
- Use `Panel3` because it controls hue and saturation without duplicating the
  separate brightness slider.
- Use the app-owned controlled HEX field for exact entry. Synchronize valid
  values into the picker while keeping opacity separate and out of the HEX
  field.
- Put Brightness and Intensity in one shared adjustment card with two tabs.
  Render only the active slider and show its live percentage without
  per-frame React state.
- Place a 44-point light/dark icon-background toggle beside the HEX input,
  matching the existing Show labels plus palette layout.
- Accept normalized six-digit `#RRGGBB` values. The input may accept a missing
  leading `#`, but displayed and persisted values include it.
- Incomplete or invalid input does not change the preview. Show an inline error
  and disable Confirm until the input becomes valid.
- Keep Cancel and Confirm visible. On short screens, use a Gesture Handler
  scroll container for the preview and picker content while the actions remain
  fixed.

## Transactional Interaction

Opening the dialog copies the committed color, opacity, and icon-background
theme into a draft.

- Wheel, active adjustment slider, valid HEX, and background-theme changes
  update the same draft.
- The wheel, tabbed slider, input, theme toggle, and dialog preview stay
  synchronized.
- Brightness is part of the chosen color and is not a separate persisted
  setting.
- Opacity ranges from `0` to `100` and uses the existing Label intensity value.
- Cancel, Android Back, or backdrop dismissal discards the draft.
- Confirm atomically commits color, opacity, and background theme, persists
  them, closes the dialog, and updates the main preview.
- Export can only use committed values; an open draft never reaches an export
  surface.

## Color and Icon Background Rules

- One color applies to every selected Button's Lucide glyph and visible label
  text.
- Preserve the existing text shadow for legibility over artwork.
- Icon circles remain neutral rather than inheriting the selected color.
- The background-theme toggle changes only the icon circle:
  - Light uses `#FFFFFF`.
  - Dark uses `#666666`.
- The selected HEX continues to control the glyph and visible label regardless
  of background theme.
- Dialog preview, main preview, and export resolve the same confirmed theme.
- Opacity applies to the complete identifier overlay, including icon circle,
  glyph, label, and shadow, matching the current Label intensity behavior.

Per-Button colors, gradients, recent-color history, saved palettes, an alpha
HEX format, and independent text/icon colors are out of scope.

## Persistence and Replacement

Continue storing Buttons Customize settings under
`quick-panel.button-customize-settings`.

Replace `buttonIdentifierTheme` in the current normalized settings model with:

```ts
buttonIdentifierColor: string;
buttonIdentifierBackgroundTheme: "light" | "dark";
```

Keep `buttonIdentifierOpacity` as the persisted `0...100` opacity value.
Default a missing or invalid background theme to `dark`, preserving the current
white-label appearance. This is a new unreleased field, not a migration from
the removed legacy glyph theme.

Treat color as a direct replacement:

- use a valid saved `buttonIdentifierColor`;
- default a missing or invalid color to `#FFFFFF`;
- preserve all unrelated Customize settings.

Do not add migration or fallback mapping for `buttonIdentifierTheme`. The old
field is removed from the normalized and saved settings shape. Do not clear the
settings key, calibrations, language, help state, announcement acknowledgement,
or any unrelated preference.

## Rendering and Data Flow

The committed color, opacity, and icon-background theme continue through one
explicit path:

```text
MMKV settings
  -> useButtonCustomizeControls
    -> main QuickPanelPreview
    -> sequential ExportSurface
```

The dialog creates a temporary draft layer:

```text
committed settings
  -> dialog draft shared values
    -> read-only dialog preview
    -> Confirm -> committed settings
```

The dialog preview reuses the current panel geometry and identifier layout
components. It must not introduce alternate panel rectangles, crop transforms,
icon metrics, or label-position calculations.

Use animated color/opacity/background only for the open dialog's real-time
preview. The main preview and off-screen exports receive normalized static
committed values, keeping view-shot capture deterministic.

## Component Boundaries

- `ButtonCustomizeControls` owns the Show labels row, swatch trigger, and
  remaining compact tabs.
- A feature-level `ButtonLabelAppearanceDialog` owns dialog presentation and
  draft lifecycle.
- A small read-only preview wrapper reuses the existing Quick Panel composition
  without enabling image gestures.
- A pure appearance utility owns HEX normalization, validation, theme
  normalization, defaults, and neutral-circle resolution.
- Shared identifier visuals receive explicit color, background theme, and
  opacity values.
- Storage parsing validates the replacement color and background-theme fields.

Keep new component files under 150 lines. Extract dialog sections or pure
helpers when needed rather than expanding one large component.

## Accessibility and Localization

- Localize all new English and Traditional Chinese labels, hints, validation
  copy, and action text.
- Give the swatch an accessible button name that includes the current HEX
  color.
- Give the wheel, both adjustment tabs, active slider, theme toggle, and HEX
  input distinct labels and hints.
- Preserve slider values as accessible percentages.
- Keep visible Cancel and Confirm actions with minimum 44-point targets.
- Keep color from being the only state cue: the HEX field exposes the selected
  value and the thumb remains visibly outlined.
- Respect the library's color-announcement support without producing
  continuous duplicate announcements during fast dragging.

## Error and Lifecycle Handling

- Invalid persisted colors fall back safely to white.
- Invalid HEX drafts never overwrite the last valid preview or committed value.
- Reopening the dialog always starts from the latest committed values.
- Repeated open/close cycles must not retain a canceled draft.
- Closing the Customize screen while the dialog is open discards the draft.
- Hiding labels disables the entry point but does not reset committed color or
  opacity or background theme.

## Testing

Add focused coverage for:

1. valid, normalized, missing, and malformed persisted colors;
2. preserving all unrelated persisted settings during replacement;
3. the swatch replacing the theme toggle and the Labels tab being removed;
4. disabling the swatch while labels are hidden;
5. dialog opening from committed values;
6. wheel, tabbed brightness/intensity slider, theme toggle, and valid HEX
   controls sharing one draft;
7. invalid HEX behavior and disabled Confirm;
8. Cancel, Android Back, and backdrop dismissal discarding the draft;
9. Confirm atomically saving color, opacity, and background theme;
10. color applying to both glyphs and label text;
11. manual light/dark circle resolution;
12. main preview and export receiving identical committed values;
13. exports ignoring unconfirmed draft values;
14. Controls previews and exports remaining unchanged; and
15. repeated dialog mount/unmount without leaked draft state.

Run the focused Jest tests first, then the complete Jest suite, lint, TypeScript
checking, Expo Android export, and `git diff --check`.

## Device QA

On the target Samsung device:

- rapidly drag the wheel and both tabbed adjustment modes;
- toggle light/dark circle backgrounds against representative HEX colors;
- type valid and invalid HEX values;
- repeatedly open, cancel, confirm, and reopen the dialog;
- verify the full dialog on normal and short viewport heights;
- compare the main preview with representative horizontal, vertical, square,
  and corner-layout exports;
- apply those exports in Good Lock; and
- repeat the rapid-drag test in a release-like build.

Specifically watch for Android/Fabric freezes or crashes associated with
continuous JavaScript state updates. No implementation is accepted if the
real-time preview uses a per-frame React `setState` path.

## Acceptance Criteria

- Users can choose any shared icon-and-label color from a wheel or exact HEX.
- Brightness and intensity share one tabbed slider box.
- The previous Labels slider tab is removed without losing its persisted value.
- Dialog feedback is continuous and visually matches confirmed preview/export
  output.
- Cancel paths never mutate committed settings.
- Confirm persists color, opacity, and icon-background theme across screen
  visits and app restarts.
- The light/dark icon-background toggle changes only the neutral circle.
- Unrelated preferences remain intact.
- Icon circles use the user's confirmed Light or Dark background theme.
- Android rapid dragging remains responsive and stable.
- Default, Advanced Controls, calibration, export order, filenames, and image
  placement behavior are unchanged.
