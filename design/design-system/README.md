# QPBC — Charcoal + Amber design system

Version 1.0, 2026-10-03. The user approved this dark theme after three design
passes. This is the design source for the remaining screen work. It contains
editable Pen.dev components, semantic tokens, interaction specifications and
reference exports. Production styles and app behavior have not been changed.

The canvas now uses the [organized hierarchy](../remaining-screens/canvas-organization/README.md). All four board IDs, 27 reusable component IDs, 88 variables and six approved screen IDs are preserved within wrappers. Older review boards were removed from the canvas; historical PNGs remain archived.

## Source files

- [Tokens](tokens.json): canonical palette, type, spacing, radius, control sizing,
  layout and motion values.
- [Pen variables](pen-variables.json): the same foundations as 88 named variables.
- [Component manifest](components.json): canvas, board, component, slot and approved
  screen IDs for reuse through the Pen.dev MCP.
- [Remaining screen handoff](remaining-screens-handoff.md): scope and preserved contracts.
- Reference boards: [foundations](foundations.png), [components](components.png),
  [native patterns](patterns.png), [screen layout](screen-layout.png).

Editable document:
`C:/Users/Meh Chow/.pencil/documents/3a4c797f-62d3-46d2-a08a-dd33d6fadb46/pencil-new.pen`.
Access `.pen` through the MCP only. The file is encrypted. All four design-system
boards sit above the approved screens; previous review boards remain snapshots.

## Visual foundations

Charcoal backgrounds use `background` #141416, `surface` #202024 and `raised`
#29292E. Surface changes establish hierarchy without card shadows. Amber
`accent` #E2B77A with `onAccent` #2C2114 marks the primary action. Selected
controls use `accentTint` #433526 and `onAccentTint` #F3D6AA. Reserve amber for
actions, selection and interactive emphasis.

Text uses #F0EFEC, secondary #CAC6C0 and muted #B3B0AB. Disabled controls use
dedicated disabled colors; state must also affect interaction and accessibility.
Success, error and information each have a semantic foreground and surface.
Calibration retains its family colors: purple active Controls, blue active
Buttons, orange completed geometry and green outer bounds. Keep labels and
handles alongside color cues. The user's chosen glyph color is content data,
not a theme token; the example purple swatch may remain #6764A6.

Geist is the design typeface. Native implementation must support Traditional
Chinese and Spanish, using the documented Noto/system fallbacks where needed.
Use the named typography roles in tokens.json: 32 hero, 28 screen heading,
23 toolbar heading, 20 choice title, 18 section heading, 17 inspector heading,
16 action, 15 body, 14 label, 13 supporting text and 12 caption. Essential
instructions should use body text. Do not reduce type to fit translations.

Spacing follows 4/8/12/16/20/24/28/32/40/48. Screen padding is 24. Small controls
use 8 or 12 radius, primary actions 14, choice cards 20, inspectors 24 and sheets
32. Primary buttons are 54 high, settings rows 56 and segmented groups 52 with
4 inset; segments and icon buttons provide at least 44 touch height.

## Reusable component catalog

Each entry is a reusable canvas component. Use `type: ref` and override its named
slots. Set the instance's width and height explicitly for fixed-size controls
(especially primary buttons: height 54). The manifest supplies descendant IDs. State examples are connected
instances beside the base component, rather than separate competing components.

| Component | Canvas ID | Slots and usage |
| --- | --- | --- |
| Primary button | v1pDNb | Label, optional leading/trailing icon; default, pressed, disabled, busy |
| Secondary button | Qx8Ge | Label and optional icon; quiet action or Cancel |
| Icon button | G3vwCY | Glyph; 44 target, accessible action label required in app |
| Choice card | mD70J | Title, supporting body, radio/check; selected and unselected |
| Two-way segmented group | jlStl | Labels and selected item; Image/Identifiers or axes |
| Three-way segmented group | x2kHS | Labels and selected item; Both/Icon/None or snapping |
| Concern row | rlmA6 | Icon, title, optional summary or swatch, chevron; disabled/pressed |
| Slider | lYUj6 | Label, formatted value, fill and thumb; measured track in app |
| Labeled text input | tAKwT | Label, field content and error; default/focus/error |
| Inline notice | tByDP | Icon and text; info, success, error |
| Toggle row | U8fIoI | Icon, label and checked state; Control inclusion |
| Removable chip | anTfd | Glyph, label and removal action; selected Button |
| Grid count | fZmSj | Label, value, decrement/increment; bounds 1–8 |
| Image frame | htKKV | Replace image fill; preserve aspect ratio and crop meaning |
| Preview preparation | yJmVb | Spinner and status; defer ready interactions |
| Header | hTcmv | Title, back and help icons; 44 targets |
| Footer actions | AF8wQ | Back/Next labels, primary busy/disabled state |
| Sheet | Lvqvs | Title, close, content body; scroll body and respect safe area |
| Confirmation dialog | pxKli | Title, body, secondary and primary actions |
| Empty import | wgcrD | Title, guidance, choose action; screenshot or background |
| Export tile | SYrss | Square PNG image, panel label and family |
| Export success | fnJNZ | Heading and brief save confirmation |
| Calibration rectangle | xEjqg | Family color, label, fill and four corner handles |
| Snap strength | fYu2a | Three choices matching the existing snap model |
| Identifier content | wkDDo | Both/Icon/None; affects availability of concern rows |
| Identifier position | y1ZpM | Back, axes and slider; focused inspector state |
| Workflow screen shell | dUnt8 | Header, flexible body and footer; 412×915 reference |

The Appearance row composes Concern row and opens the existing editor. It is not
a duplicate settings model. Complex editor content belongs inside Sheet/Dialog
slots, composed from inputs, sliders, segmented controls and a color wheel.
Tutorial images, selected icons, screenshot geometry and working-image transforms
remain feature content, not decorative replacements.

## Screen composition and interaction

Keep the task in view: header, short task heading, the largest usable image or
calibration area, then a reachable action footer. Use the workflow shell for
calibration. Customize uses a continuous image preview and the approved bottom
inspector. Concern overview and focused Position are separate inspector states.
Home retains only the headline, applied screenshot and Start action.

The reference viewport is 412×915. Treat its status bar and gesture area as
illustrations; implementation uses actual insets. On short phones, move secondary
content into a scrolling body while keeping the primary action reachable. On
wider devices, center the content column (430 phone / 520 Fold reference caps)
and preserve preview aspect ratio. Keyboard inputs scroll into view without
covering Confirm/Cancel. Avoid shrinking calibration handles or sliders.

Default/Controls-only Customize excludes Button intensity and identifier controls.
Buttons-only/Combined shows Image and Identifiers. Content None disables both
Appearance and Position; geometry determines available axes. Back from Position
returns to the overview. Appearance edits retain Confirm/Cancel transactions and
the overall preview returns to the same editor draft.

Pressed action uses `accentPressed`; busy retains an intelligible label and
spinner and blocks duplicate action. Error text appears by the relevant field
or geometry with a recovery action. Selection includes text/radio/check cues.
Supply accessibility roles, values, disabled state and descriptive icon labels.
Dynamic type, all three locales and actual TalkBack order require device review
during implementation. Small removable glyphs and rectangle handles receive
expanded touch areas without overlapping adjacent actions.

Motion: press 120 ms, inspector transition 200 ms, sheet 280 ms. Respect reduced
motion with zero-duration transitions; keep calibration gestures direct. Reuse
existing snapping haptics and commit semantics.

## Implementation mapping and limitations

Map semantic color roles into the existing `global.css` Uniwind/Tailwind v4
theme during the later implementation. Centralize additional native numeric
tokens as needed and reuse components by responsibility. Avoid a second
competing runtime theme. This design pass installs no dependencies and does not
change AniUI or Zustand state.

Pen numeric variables work for padding/radius/type. Width/height sizing aliases
did not resolve correctly on the workflow shell, so it uses literal 412×915;
the documented layout tokens remain canonical. Component slider examples use a
364-wide track; resize the track/fill/thumb together in static instances and
measure the actual available width in native implementation.

## Verification

All four design-system boards and six approved screen roots were inspected with
resolved instances/variables: zero enabled-node clipping problems. The library
contains 27 reusable components and 88 variables. Approved screens now use
semantic color/font variables and connected shared actions; the identifier
overview also uses shared concern rows and segmented controls. Reference PNGs
were exported at 2× and visually checked.

Calculated sRGB contrast: body/background 16.00:1, muted/raised 6.70:1,
primary action 8.46:1, selected segment 8.45:1. These checks cover the core text
pairs; this is a static design verification, not device or runtime testing.
