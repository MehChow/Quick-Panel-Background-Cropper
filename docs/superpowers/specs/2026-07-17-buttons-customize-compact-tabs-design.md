# Buttons Customize Compact Tabs Design

**Date:** 2026-07-17

## Problem

Adding independent identifier position sliders made the Buttons Customize card
taller than the available phone viewport. Users must scroll the controls away
from the preview, which separates slider input from its live visual feedback.

## Goals

- Keep the Button preview and complete adjustment panel visible together on the
  S25+ phone baseline.
- Preserve all existing intensity, visibility, position, reset, preview, and
  export behavior.
- Make each adjustment reachable with one tab press and one shared slider.
- Reuse the installed AniUI Tabs component without changing its public API.

## Non-goals

- Do not persist the selected tab or any Button Customize values.
- Do not change slider ranges, defaults, safe-position constraints, or export
  readiness behavior.
- Do not change Default or Advanced Controls Customize UI.

## Approved UI

Replace the stacked slider card with one compact card:

```text
┌────────────────────────────────────┐
│ Show Button identifiers        ON  │
│                                    │
│ [Image] [Identifier] [Horiz.] [Vert.] │
│                                    │
│ HORIZONTAL POSITION           21%  │
│ ─────────○───────────────────────  │
└────────────────────────────────────┘
```

- Keep the identifier visibility action as a compact top row with a minimum
  44-point hit target.
- Use filled AniUI `Tabs` with `size="sm"` and `defaultValue="image"`.
- Provide direct tabs with the localized visible labels Image, Identifier,
  Horiz., and Vert.
- Give the shortened position tabs full localized Horizontal identifier
  position and Vertical identifier position accessibility labels.
- Render Horizontal and Vertical tabs only when those orientations exist in the
  active preset.
- Show exactly one label, percentage, and slider below the tab list.
- Keep the slider region at a stable height when tabs change.

## Interaction States

- Selecting a tab changes which existing value and callback the shared slider
  receives. It does not reset any value.
- Image remains enabled at all times.
- When identifiers are hidden, Identifier and all visible position tabs become
  disabled and dimmed.
- If Identifier, Horiz., or Vert. is active when identifiers are hidden, the
  selected adjustment returns to Image and the image intensity slider appears.
- Re-enabling identifiers restores those tabs and their unchanged values while
  Image remains selected.
- Leaving and reopening Customize keeps the existing screen-local reset
  behavior: Image 78, Identifier 70, Horizontal 50, and Vertical 50.

## Component and Data Design

- `ButtonCustomizeControls` owns only the tab presentation through AniUI Tabs.
- Existing control values and setters continue to come from
  `useButtonCustomizeControls` through typed props.
- A small internal adjustment descriptor maps each tab to its localized label,
  value, callback, test ID, and disabled state.
- Each available tab renders one `TabsContent` containing the same compact
  slider presentation.
- The newly installed `src/components/ani-ui/tabs.tsx` remains a reusable base
  component and is not specialized for this feature.
- No storage, preset, calibration, preview, or export types change.

## Visual Direction

- Preserve the dark Quick Panel workbench styling from `docs/styling.md`.
- The preview remains the focal element; the control card is deliberately dense
  and secondary.
- Reuse zinc surfaces, low-opacity borders, white values, and emerald only for
  the identifier enabled state.
- Use the existing radius scale with a `rounded-2xl` card, `rounded-lg` tabs,
  and a smaller concentric slider surface.
- Dynamic percentages use tabular numeric styling.

## Accessibility

- Rely on AniUI Tabs roles and selected/disabled accessibility state.
- Give each tab a full localized accessibility label even if its visible label
  is shortened.
- Preserve the identifier control's switch role and checked state.
- Preserve Slider semantics and disabled state.

## Testing

Update focused component tests first to verify:

1. Image is selected by default and the shared slider routes to image intensity.
2. Each tab shows the correct current value and routes changes to its existing
   callback.
3. Orientation tabs only render for orientations present in the preset.
4. Hiding identifiers from an identifier-related tab returns to Image, disables
   the identifier tabs, and preserves their values.
5. The visibility switch behavior remains unchanged.

Then run the complete Jest suite, lint, TypeScript checking, and
`git diff --check`.

## Acceptance Criteria

- On the supplied SM-S9360 viewport, the preview and complete compact control
  card are visible together without scrolling the slider controls.
- All four adjustments remain available with at most one tab press before
  dragging.
- Live preview and exports produce the same output as before this UI-only
  redesign.
- No dependency, persistence, calibration, or export contract changes are made.
