# v1.2.0 Release Announcement Design

## Goal

Show a one-time v1.2.0 startup announcement describing the Buttons-only icon
color customization and removal of snapping-grid toggling, with the supplied
animated GIF at the bottom of the dialog.

## Content

The English announcement uses:

- Title: `v1.2.0 Major Updates 🌟`
- `New feature - added icon color customization in Buttons-only mode`
- `Removed snapping grid toggling feature`
- CTA: `Got it`

Traditional Chinese provides equivalent localized copy and keeps the existing
`知道了` CTA. The old v1.1.0 recalibration reminder is not included.

## Layout

Keep the existing AniUI release-announcement shell. Render the optional media
after the localized body and before the footer action, so the supplied
`assets/announcement/icon-color-picker.gif` is the last content item in the
dialog. Use `expo-image`, preserve the full `324:642` aspect ratio with
`contentFit="contain"`, and center it at a compact height that keeps the dialog
usable on a phone screen.

## Behavior and persistence

Use a new reason-specific active ID,
`v1.2.0-buttons-icon-color-announcement`. Existing v1.1.0 acknowledgements do
not suppress the new dialog. Acknowledging the dialog stores only the active
announcement ID, closes the dialog, and performs no navigation or preference
reset.

The reusable descriptor gains optional media metadata. Releases without media
can continue using the same dialog without a release-specific component.

## Verification

Focused tests cover:

- the v1.2.0 title, body, action, and active acknowledgement ID;
- the supplied GIF rendering below the body;
- dismissal and already-acknowledged behavior;
- English and Traditional Chinese announcement copy.

Run the focused announcement, locale, and storage tests, then lint, TypeScript,
and `git diff --check`. Device QA remains manual for the user.
