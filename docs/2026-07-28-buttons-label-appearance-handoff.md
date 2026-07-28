# Buttons label appearance handoff

Date: 2026-07-28  
Branch: `feature/customize-icon-color`

## Implemented

- Added a transactional **Label appearance** dialog for Buttons-only Customize.
- Added shared glyph/label color using a picker plus validated six-digit HEX
  input.
- Added Brightness and Intensity tabs in one compact slider card.
- Added a manual icon-circle theme: Light `#FFFFFF` or Dark `#666666`.
- Cancel, backdrop dismissal, and Android Back discard drafts; Confirm persists
  color, intensity, and circle theme together.
- Persisted settings under `quick-panel.button-customize-settings`.
- Threaded committed appearance through the main preview and Button exports.
- Matched the dialog preview to the app gradient while clipping that gradient
  to panel shapes, leaving panel gaps on the dialog surface.
- Updated the v3 changelog, implementation notes, localization, and tests.

## Verification

- Jest: 53 suites / 222 tests passed.
- Expo lint, TypeScript, and `git diff --check` passed.
- No flow screenshots were changed.

## Handoff state

The work remains uncommitted. Preserve the existing dirty working tree. Manual
Android visual QA is the remaining recommended check.
