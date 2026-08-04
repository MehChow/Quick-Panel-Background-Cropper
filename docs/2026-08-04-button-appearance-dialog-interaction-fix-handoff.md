# Button Appearance Dialog Interaction Fix Handoff

Date: 2026-08-04
Branch: `feature/v4-combined`

## Status

The corrective design and implementation plan are complete. No application
code, test, locale, dependency, configuration, or release asset was changed in
this planning pass.

## Diagnosis

The current picker already keeps continuous color changes on Reanimated shared
values, so per-frame React rendering is not the primary source-level issue.
The focused inspector made the modal genuinely scrollable, while its outer
scroll view remains enabled during wheel and slider drags. Those recognizers
compete and the dialog can move under the picker, which accounts for both the
accidental scrolling and much of the perceived lag.

The approved correction is deliberately narrow:

- remove Before/New and always show the latest valid draft;
- retain the magnified real-Button preview and Button navigation;
- disable only the dialog's outer scrolling while the wheel, Brightness, or
  Opacity surface owns an active touch; and
- keep continuous values on the UI thread and persistence on Confirm only.

If physical-device testing still shows material lag after this gesture fix,
profile it as a separate issue rather than weakening the live preview
speculatively.

## Read first

1. `AGENTS.md`
2. Expo 56 docs: `https://docs.expo.dev/versions/v56.0.0/`
3. `docs/superpowers/specs/2026-08-04-button-appearance-dialog-interaction-fix-design.md`
4. `docs/superpowers/plans/2026-08-04-button-appearance-dialog-interaction-fix.md`
5. `docs/superpowers/specs/2026-08-04-button-appearance-focused-inspector-design.md`
   for the still-valid focused-inspector contract; its Before/New section is
   superseded by item 3.

## How to continue

Use `superpowers:executing-plans` and execute the three plan tasks inline in
order. Start from the focused tests, preserve the dirty combined-mode
worktree, and do not stage, commit, push, create a browser demo, or delegate to
subagents.

The important implementation boundary is gesture-specific. The scroll lock
must cover the `ColorPicker` subtree containing `Panel3`, Brightness, and
Opacity, but not HEX or Light/Dark. Release it on touch end, touch cancel, and
picker completion. Do not replace the existing Reanimated `onChange` worklet
with `onChangeJS`.

Finish with the focused suites, full Jest, Expo lint, TypeScript, and
`git diff --check`. Leave Samsung, QuickStar, Good Lock, keyboard, and
short-screen manual QA to the user.
