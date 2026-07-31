# Controls + Buttons Combined Mode Design

**Date:** 2026-07-31
**Status:** Approved for implementation planning

## Purpose

Add a third Advanced target, `Controls + Buttons`, that applies one selected
image continuously across enabled Controls panels and selected Quick Panel
Buttons.

The combined target must use:

- one imported fully expanded Quick Panel screenshot;
- one combined outer calibration area;
- one required row and column grid;
- one coordinate system;
- one background image;
- one shared image transform; and
- one ordered export run containing both panel families.

Default, Advanced Controls-only, and Advanced Buttons-only remain independent
released workflows. The combined target adds a new workflow rather than
merging their saved calibrations.

This specification supersedes conflicting baseline, persistence, intensity,
visual-state, and testing notes in `docs/v4-idea.md`.

## Current baseline

The v1.2.0 app already provides the foundations required by combined mode:

- Advanced visibly branches into Controls-only and Buttons-only targets.
- Fixed Control IDs and dynamic Button IDs share the `PanelId` model.
- Every panel definition identifies its `control` or `button` family.
- Advanced calibration shares outer-area, grid, snapping, gesture, and canvas
  primitives between the two released targets.
- Buttons-only provides the reviewed 30-label searchable catalog, custom labels
  with required generic icons, grid-relative identifier layouts, and ordered
  dynamic panel instances.
- Customize preview and export already select intensity and identifier behavior
  by panel family.
- Preview and export use the same source-coordinate composition and image
  transform.
- Export mounts and captures one original-quality `1024 x 1024` surface at a
  time in `preset.goodLockOrder`.
- Button Customize appearance settings persist across app restarts.

The main new work is therefore the combined calibration model, workflow,
persistence, preset construction, and focused mixed-family coverage.

## Approved architectural approach

Implement combined mode as an independent calibration model and controller
that reuses released UI and composition primitives.

Do not extend every existing binary `target === "buttons"` branch with another
nested conditional. Do not refactor all three Advanced targets into one new
generic calibration engine. Both alternatives would place unnecessary risk on
the released Controls-only and Buttons-only workflows.

Keep the existing `/advanced-calibration` route. Its target-aware screen layer
may dispatch `combined` to a dedicated combined controller/module while the
current Controls-only and Buttons-only controller remains behaviorally
unchanged.

Keep new components and hooks small and feature-focused. Extract pure combined
state, phase, geometry, validation, preset, and naming helpers instead of
growing the existing large Advanced screen, hook, or store files.

## Mode selection

`AdvancedTarget` becomes:

```ts
type AdvancedTarget = "controls" | "buttons" | "combined";
```

The Select Mode flow remains:

1. Choose `Default` or `Advanced`.
2. If `Advanced`, choose one visible target:
   - `Controls only`
   - `Buttons only`
   - `Controls + Buttons`

Default remains Controls-only. Combined mode is not added as a top-level mode.

When a saved combined calibration exists, confirming the combined target goes
to Customize. Without one, it goes to Advanced calibration. Recalibrate from
Customize reopens the combined workflow. A successful combined export saves
`combined` as the last exported Advanced target so it is preselected next time
without skipping the visible target-selection step.

## Combined calibration model

Add an independent persisted model equivalent to:

```ts
interface AdvancedCombinedCalibration {
  screenshotWidth: number;
  screenshotHeight: number;
  grid: AdvancedSnapGrid;
  outerRect: PanelRect;
  enabledControls: ControlPanelId[];
  controlPanels: ControlPanelRects;
  buttons: ButtonCalibrationItem[];
}
```

The corresponding draft owns:

- the current screenshot;
- combined outer rectangle;
- enabled Controls;
- Control rectangles;
- selected Button items and rectangles; and
- the in-progress combined phase.

The saved screenshot URI is not persisted. Screenshot dimensions provide the
same rescaling reference used by the existing Advanced branches.

Control IDs remain the four stable IDs. Button IDs remain ordered dynamic
instances such as `button-1`. The two families cannot collide in the panel
dictionary.

## Storage and compatibility

Extend the current calibration payload additively:

```ts
interface SavedCalibrations {
  default: DefaultCalibration | null;
  advancedControls: AdvancedCalibration | null;
  advancedButtons: AdvancedButtonsCalibration | null;
  advancedCombined: AdvancedCombinedCalibration | null;
}
```

Loading an existing v1.2.0 payload with no `advancedCombined` field returns a
null combined calibration while preserving all existing branches. An invalid
combined branch is rejected independently and must not discard valid Default,
Controls-only, or Buttons-only data.

Widen last-exported-target parsing to accept `combined`. Existing `controls`
and `buttons` values remain valid.

No calibration reset, global storage reset, or automatic copying of rectangles
between targets is allowed. Preserve language, help state, announcement
acknowledgement, existing calibrations, last exported choices, Button
appearance, and every unrelated preference across the update.

## Calibration flow

Combined calibration uses this exact sequence:

1. Import a fully expanded Quick Panel screenshot.
2. Draw one green outer area around every intended Control and Button.
3. Select enabled Controls.
4. Select included Buttons.
5. Configure the shared row and column grid.
6. Adjust enabled Controls.
7. Adjust selected Buttons.
8. Review every rectangle together.
9. Confirm and save.

At least one Control and at least one Button are required. A user who needs
only one family should use its existing Advanced target.

The grid is required and shared by every combined rectangle. Rows and columns
remain integer values from `1` through `8`. The existing grid controls,
overlay, snap haptics, move/resize gestures, and outer-area constraints are
reused.

Controls use the established adjustment order:

1. Button box
2. Brightness
3. Volume
4. Media player

Disabled Controls are skipped. Buttons follow their selected order, which also
becomes their export order.

The existing leave-warning boundary remains: leaving is unguarded during the
outer phase and guarded after the outer rectangle has been confirmed. The
footer Back action moves between combined phases without opening the route
leave warning.

## Selection behavior

The Control-selection step reuses the current Control toggle surface and
enforces at least one enabled Control.

The Button-selection step reuses the current:

- searchable 30-label built-in catalog;
- selected-chip summary;
- localized label display;
- custom-label entry;
- eight generic custom-icon choices; and
- stable canonical labels and icon mappings.

At least one Button is required. Selected order remains stable through
calibration, Customize, export, and Result.

When recalibrating an existing combined target, scale its saved outer area and
rectangles to the newly imported screenshot using the saved screenshot
dimensions. Preserve its selections and grid as the starting draft.

## Initial rectangles and overlap confirmation

On a first combined calibration, Controls start from the existing preset-based
Control geometry scaled into the combined outer area. Buttons start from the
current ordered Button rectangle generator. These independently generated
families are allowed to overlap initially.

Only completed rectangles and the active rectangle need to be shown. Future
rectangles remain hidden. This makes an overlapping active rectangle an
obvious starting guide rather than a saved result.

Overlap rules are:

- The active rectangle may overlap completed rectangles while it is being
  moved or resized.
- Pressing Next is blocked while the active rectangle overlaps any visible
  completed rectangle.
- Hidden future rectangles do not block the current phase because they have
  not been confirmed yet.
- Going Back makes the earlier rectangle active again. Later rectangles become
  pending and are revalidated as the user advances again.
- Final confirmation validates every enabled Control and selected Button
  together as a safety net.

All active rectangles remain constrained to the outer area. Valid rectangles
must have positive dimensions, remain inside the outer area, and not overlap
another confirmed rectangle. Use the existing overlap tolerance rather than
introducing exact floating-point edge equality.

If the outer area changes, rescale both panel families consistently from the
old outer rectangle into the new one. Their relative cross-family overlap may
temporarily return and is resolved through the same confirmation flow.

## Calibration visual semantics

Preserve the established color language:

- Green: combined outer area
- Purple: active Control rectangle
- Blue: active Button rectangle
- Orange: completed Control or Button rectangle

The final review shows every rectangle in the shared completed orange state.
Labels identify the individual Control or Button. Do not restore the older
proposal where both families keep separate purple/blue colors after
completion.

## Combined preset

Create a pure combined-preset builder that merges the existing Control and
Button definition rules into one `QuickPanelPreset`.

The preset must use:

- screenshot dimensions for preset width and height;
- the combined outer rectangle as `customizationArea`;
- enabled Control definitions with their calibrated rectangles;
- selected Button definitions with labels, icons, grid spans, and calibrated
  rectangles;
- Controls followed by Buttons in the approved export order; and
- one Button identifier reference-cell size derived from the shared combined
  grid.

The preset contains both `control` and `button` families. It must not create a
second transform, family-specific coordinate origin, per-panel source image,
or export-only crop state.

The visible preview order contains enabled Controls in the existing Control
visual order, followed by Buttons in selected order. Because confirmed panels
cannot overlap, this deterministic family grouping does not change output
composition.

## Customize composition

Combined Customize reuses the current image selection, normalization, preview,
pan/zoom gestures, reset-to-fit action, and export controls.

One normalized source image and one `{ x, y, scale }` transform are
authoritative for every panel. The temporary 1080-pixel-long-edge preview proxy
remains preview-only. Original-quality export uses the normalized original
image URI and original logical dimensions.

Family treatment remains:

- Controls preview with the established 50% image-contribution approximation.
- Control PNG exports at full image intensity so One UI applies its own
  treatment once.
- Buttons preview and exports use combined-mode Button image intensity.
- Button identifier visibility, intensity, position, glyph color, and
  Light/Dark style affect Buttons only.

The preview is an estimate because it cannot reproduce the device wallpaper
blur and tint behind Controls. It must nevertheless show one continuous source
composition across both families.

No per-panel image selection, crop, transform, opacity, or identifier settings
are introduced.

## Button Customize persistence

Combined Button image intensity:

- defaults to `78%` the first time combined mode opens;
- uses the existing Button image intensity slider;
- affects combined Button preview and exports only; and
- persists only for combined mode under
  `quick-panel.combined-button-image-intensity`.

Do not add a separate `Match Controls` action. The existing slider is the only
combined intensity control.

The current `quick-panel.button-customize-settings` payload continues to own:

- Buttons-only image intensity;
- shared identifier visibility;
- shared identifier intensity;
- shared horizontal and vertical positions;
- shared glyph color; and
- shared Light/Dark identifier style.

Combined Customize reads and writes the shared identifier fields from that
existing payload but ignores its Buttons-only image intensity. Updating a
shared identifier field in either target is visible in the other target.
Updating combined image intensity never changes Buttons-only image intensity,
and updating Buttons-only image intensity never changes combined intensity.

Missing, invalid, or out-of-range combined intensity falls back to `78%`.

## Export order and filenames

One combined export run uses this order:

1. Enabled Controls in existing Good Lock order:
   - Button box
   - Media player
   - Brightness
   - Volume
2. Selected Buttons in their selection/calibration order.

Disabled Controls are omitted without leaving ordering ambiguity. Result uses
the same order as capture and save.

For example, with Media player and Volume disabled, combined filenames use one
contiguous sequence plus a family segment:

```text
01-control-button-box.png
02-control-brightness.png
03-button-wi-fi.png
04-button-my-scene.png
```

The actual sequence number reflects included panels, not the fixed ordinal of
a disabled Control. Button filenames use canonical labels, preserve duplicate
suffix behavior, and include the `button` family segment. Family-aware names
prevent a custom Button label from colliding with a Control cache filename.

Existing Controls-only and Buttons-only filenames remain unchanged.

## Sequential export and Result

Reuse the existing transactional sequential export pipeline:

- mount one active `1024 x 1024` surface;
- prefetch the original image as a best effort;
- wait for the active image to load;
- also wait for measured horizontal identifier position when required;
- capture the current panel;
- advance through `goodLockOrder` using run and panel readiness tokens;
- save to the media library only after every capture succeeds; and
- show the existing Result screen after the complete save succeeds.

Control exports remain fully opaque and contain no app-rendered Button
identifiers. Button exports use combined intensity and the committed shared
identifier settings.

Any capture, permission, media-save, or readiness failure aborts the run,
cleans only files created by that run, and avoids partial Result navigation.
The Result grid shows the real localized/custom labels in the same
Controls-first, Buttons-second order.

## Validation and error handling

Provide localized errors for:

- no Control selected;
- no Button selected;
- missing outer area or screenshot;
- active rectangle overlapping a completed rectangle;
- invalid final combined geometry; and
- the existing image processing, capture, permission, media save, and Good
  Lock failures.

Selection errors should use the correct Control or Button terminology. The
active-overlap message should tell the user to move or resize the current box
before continuing, rather than reporting a generic invalid calibration.

Final validation must check only enabled Controls and selected Buttons. Stored
rectangles for disabled Controls do not participate.

## Component boundaries

Keep responsibilities separated:

- Model types define combined saved and draft shapes.
- A pure combined state module creates, rescales, validates, and serializes
  combined drafts.
- A pure combined phase helper owns the two selection phases and ordered panel
  phases.
- A pure combined preset helper merges family definitions and creates unique
  filenames and orders.
- A dedicated combined controller owns screen-local phase and grid state.
- Existing selection, grid, canvas, gesture, help, Customize, export, and
  Result components remain shared wherever their current contracts fit.
- Storage owns additive combined calibration parsing and the separate combined
  intensity value.

Do not move unrelated Controls-only or Buttons-only logic solely to make the
new design look more generic.

## Automated testing

Add focused coverage for:

- rendering and selecting the third Advanced target;
- saving and restoring `combined` as the last exported Advanced target;
- loading current v1.2.0 calibration payloads without `advancedCombined`;
- independently accepting or rejecting the combined storage branch;
- preserving all existing calibration and preference branches;
- combined draft creation, screenshot rescaling, and outer-area rescaling;
- requiring at least one Control and one Button;
- keeping row and column values within `1` through `8`;
- exact combined phase order and Back/Next behavior;
- temporary active overlap being allowed during editing;
- Next blocking overlap with completed visible rectangles;
- later rectangles becoming pending after Back;
- final cross-family containment and overlap validation;
- active Control purple, active Button blue, and completed panels orange;
- combined preset family definitions, shared coordinates, grid spans,
  reference-cell sizing, visual order, and Good Lock order;
- contiguous family-aware filenames, custom labels, and duplicates;
- first-use combined intensity at `78%`;
- combined intensity round-trip and invalid-value fallback;
- shared identifier settings remaining synchronized between targets;
- Buttons-only and combined image intensities remaining independent;
- mixed preview family intensity and identifier behavior;
- mixed sequential export readiness, order, failure cleanup, and Result order;
  and
- unchanged Default, Controls-only, and Buttons-only behavior.

Use the existing Jest and React Native Testing Library infrastructure. Run
focused suites while implementing, then finish with:

```bash
npm test -- --runInBand
npm run lint
npx tsc --noEmit
git diff --check
```

## Manual QA boundary

Manual device QA remains with the user. Recommended physical Samsung coverage
includes:

- updating from v1.2.0 without losing existing data;
- first combined calibration and later recalibration;
- overlapping initial rectangles and per-step blocking;
- grid snapping, haptics, move/resize feel, and Back behavior;
- one shared image visibly continuing across Controls and Buttons;
- combined intensity starting at and persisting from `78%`;
- shared identifier settings and independent family intensity;
- Controls-first and Buttons-second export/result order;
- unique exported filenames; and
- applying every PNG through Good Lock QuickStar on the real device.

Automated checks validate state and composition contracts, not physical
QuickStar clipping, One UI rendering, real haptics, or visual matching on every
device.

## Non-goals

- Changing Default mode
- Replacing or merging Controls-only and Buttons-only
- Copying their saved rectangles into combined calibration
- Automatically reading Samsung's active Quick Settings Buttons
- Increasing the row or column limit beyond eight
- Adding optional or free-form grid behavior
- Adding per-panel images, transforms, intensity, or identifier settings
- Adding a `Match Controls` intensity action
- Saving a partial export run
- Changing existing target filenames
- Adding a dependency
- Broadly refactoring the released Advanced calibration engine
- Producing release announcements, changelogs, store assets, or version bumps
  as part of this feature implementation

## Acceptance criteria

- Advanced visibly offers Controls-only, Buttons-only, and Controls + Buttons.
- Combined calibration requires at least one panel from each family.
- All combined rectangles share one outer area, one required `1–8` grid, and
  one coordinate system.
- Generated active rectangles may initially overlap, but users cannot confirm
  overlapping completed geometry.
- Existing purple, blue, orange, green, snapping, haptic, and leave-warning
  semantics remain consistent.
- One selected image and one transform produce a continuous preview and export
  composition across every included panel.
- Controls keep their current preview approximation and full-intensity export.
- Combined Buttons start at `78%`, persist that intensity independently, and
  share existing identifier settings with Buttons-only.
- Exports are original-quality `1024 x 1024` PNGs, Controls first and Buttons
  second, with unique family-aware contiguous filenames.
- Export remains sequential and all-or-nothing.
- Existing v1.2.0 data and all three released workflows remain intact.
- Focused and full automated checks pass; physical Samsung and Good Lock QA is
  left to the user.
