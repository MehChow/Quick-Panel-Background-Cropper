# Styling guide

This app should feel like a focused Samsung Quick Panel workbench: dark,
phone-first, preview-heavy, and calm until the user is adjusting calibration
geometry. Use this file when adding or restyling app components.

This guide is based on the current screens in `src/features/quick-panel`, the
AniUI primitives in `src/components/ani-ui`, and the v2 flow screenshots under
`flow/`.

## Core direction

- Keep the UI phone-first. The S25+ flow screenshots are the normal layout
  baseline.
- Keep the background dark aubergine/black. The user-selected image and Quick
  Panel preview should carry the visual energy, not the chrome.
- Use white text, zinc supporting text, and low-opacity borders for structure.
- Use color only for meaning: white/black actions, green confirmation, amber
  help/selection/examples, red errors, emerald success, orange advanced panel
  boxes, green calibration rectangles, red/blue grid examples.
- Favor dense, stable workflow screens over decorative layouts. Most screens
  should be a centered phone column with a persistent footer action area.

## Shared layout

Use `QuickPanelScreenShell` for normal app screens.

- Outer screen: `SafeAreaView` with `style={{ flex: 1 }}`.
- Horizontal padding: `px-5`.
- Header top padding: `pt-8`.
- Main column: `phoneColumnClassName`.
- Footer column: `phoneFooterClassName`.
- Default max widths:
  - normal: `max-w-[430px]`
  - `min-[480px]`: `max-w-[460px]`
  - `min-[600px]`: `max-w-[520px]`
- Footer separator: `border-t border-white/10`.
- Keep primary actions in the footer for calibration, mode selection,
  customize-with-image, and result screens.
- Use scrolling only when content can overflow on short phones. Do not add a
  scroll view just for wide screens.

Only use local `useWindowDimensions` or measured layout state for real fitting
problems: calibration canvases, image previews, export result grids, help-sheet
media, and landing example height.

## Backgrounds and surfaces

App background:

- Use `AppGradientBackground`: `#261E1E` to `#341F3A`.
- Avoid new decorative gradients, blobs, or image overlays behind app chrome.

Dark surfaces:

- Standard panel/card: `rounded-2xl border border-zinc-800 bg-zinc-900`.
- Glass panel: `rounded-2xl border border-white/10 bg-zinc-900/80` or
  `bg-zinc-900/90`.
- Preview frames: `rounded-2xl` to `rounded-[28px]`, black or near-black fill.
- Footer/screen dividers: `border-white/10`.
- Avoid heavy shadows. Depth should come from dark fill, subtle borders, and
  opacity.

Bottom sheets:

- Background: `#18181b`.
- Border: `#27272a`.
- Radius: `32`.
- Handle: `#52525b`, `48 x 6`.
- Backdrop opacity: `0.6`.
- Content padding: `px-5`, `pt-8` or the shared insets helper.
- Sheet titles: white `text-lg font-semibold`.
- Sheet body: `text-sm leading-6 text-zinc-300`.

## Radius scale

- Buttons, inputs, alerts, inline labels: `rounded-md`.
- Small chips and footer control panels: `rounded-xl`.
- Product cards, previews, helper buttons, success panels: `rounded-2xl`.
- Bottom sheets and large tutorial cards: `rounded-3xl` or `borderRadius: 32`.
- Full circular controls and resize handles: `rounded-full`.

Keep nested radii concentric. If a child sits inside a padded rounded parent,
its radius should be smaller than the parent.

## Typography

Use `Text` from `src/components/ani-ui/text.tsx` unless a React Native primitive
is required.

- App title / landing title: `text-2xl` to `text-4xl`, `font-semibold` or
  `font-extrabold`, white.
- Subpage title: `text-2xl font-semibold leading-7 text-white`.
- Card title: `text-lg font-semibold text-white`.
- Body copy: `text-sm leading-5` or `leading-6`.
- Secondary copy: `text-zinc-400`.
- Sheet body copy: `text-zinc-300`.
- Labels and helper headings: `font-semibold`.
- Grid/control metadata: `text-xs` or `text-[10px]`, uppercase when it improves
  scanning.

Do not make routine screen headings larger than the screenshot baseline. The
main object is usually the phone preview or calibration canvas, not the title.

## Buttons and actions

Start with `Button` from `src/components/ani-ui/button.tsx`.

Main actions:

- Primary start/import/back/re-import: `bg-white`, text `font-semibold
  text-black` or `text-zinc-900`.
- Secondary dark action: `bg-black`, text `font-semibold text-white`.
- Confirm/next/export: `bg-green-200/90`, text `font-semibold text-green-900`.
- Destructive/error actions should use the existing AniUI destructive variant
  unless the screen already has a stronger local pattern.
- Disabled/loading: rely on `Button` opacity and loading state first.

Sizing:

- Default button minimum hit area is `min-h-12 min-w-12`.
- Full-width footer button: `w-full`.
- Two-up footer buttons: parent `flex-row gap-3 py-4`, each button `flex-1`.
- When equal-width labels need stable layout, use `px-0` on the button and
  `w-full` on text.

Avoid one-off colors for actions. If a new action color is needed, it should
represent a new semantic state used in more than one place.

## Icons and helper actions

- Use `@react-native-vector-icons/lucide` for header/action icons.
- Header icon hit area: `h-11 w-11`.
- Default header action: `rounded-full bg-white`, black icon.
- Helper action: amber-accent dark surface:
  - `rounded-2xl border border-[#f3c992]/35 bg-[#2c2328]`
  - icon `#f5d6aa`
  - pressed: `scale-95 border-[#f3c992]/55 bg-[#34282f]`
- First-time helper attention uses soft amber pulse rings. Respect reduced
  motion through the existing hook.

## Cards and previews

Use cards for actual content containers, not for whole page sections.

- Mode cards: dark image frame, `rounded-2xl border border-white/15
  bg-zinc-900/80`, unselected `opacity-55`.
- Image picker card: `rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-8`.
- Calibration empty card: `rounded-2xl border-zinc-800 bg-zinc-900`, responsive
  max width from the existing classes.
- Result success card: emerald-tinted only because it confirms completion:
  `border-emerald-400/30 bg-emerald-800/10`.
- Preview images should use `expo-image`.
- Preview frames should preserve aspect ratio with explicit `aspectRatio`,
  measured width, or the existing geometry helpers.

## Calibration and geometry colors

These colors are functional, not decorative.

- Default outer rectangle: emerald/green line and handles.
- Advanced panel boxes: orange line and orange label.
- Advanced outer/grid confirmation: green outline.
- Snap/grid dots: low-opacity white.
- Grid tutorial examples: red for columns, blue for rows.
- Supported panel overlays should stay translucent so the screenshot/image is
  still readable.

Do not reuse calibration colors for generic app decoration. They teach the user
what can be moved, resized, or confirmed.

## Notices and errors

- Success/notice inline message: `rounded-md bg-green-500/15 p-3 text-sm
  text-green-100`.
- Error inline message: `rounded-md bg-red-500/15 p-3 text-sm text-red-100`.
- Completion/success panels may use emerald if the whole screen is a success
  state.
- Keep messages close to the action area or the preview they describe.

## Responsive rules

- Preserve the normal phone layout first.
- Use shared class constants for structural width limits.
- Keep bottom actions outside scroll content when the workflow depends on a
  stable action area.
- For Fold/tablet widths, prefer a centered phone-like column. Add a new wide
  layout only when the current centered layout wastes the task-critical content.
- For short screens, shrink media/previews with measured available height
  before shrinking text or hiding actions.

## Reuse checklist

Before adding a component or style:

1. Can an existing screen shell, AniUI component, help sheet, header, button, or
   card pattern do it?
2. Is the color semantic and already present here?
3. Is the radius from the scale above?
4. Does it fit inside the centered phone column and footer pattern?
5. Does it keep a 44-ish point touch target for controls?
6. Does it use `expo-image` for raster images?
7. Does it avoid `useMemo`, `useCallback`, and `React.memo` outside AniUI?

If the same class string appears in two real places, extract a small shared
component or constant. If it appears once, keep it local.

## Token guidance

Current reusable theme values live in `global.css` and AniUI variants. Prefer
semantic classes such as `bg-primary`, `bg-secondary`, `text-muted-foreground`,
and `border-border` inside base components. Feature screens may use the
established product colors above when they are part of the v2 flow language.

If a repeated raw color becomes app-wide, promote it to `global.css` and verify
that Uniwind generates the intended utility classes before replacing call sites.

Skipped: a full token migration. Add it only when repeated raw colors start
causing real drift.
