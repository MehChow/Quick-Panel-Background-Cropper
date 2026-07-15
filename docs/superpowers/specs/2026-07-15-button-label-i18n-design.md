# Button Label i18n Design

## Goal

Translate all 60 built-in Quick Panel Button labels through i18next. Built-in
labels must follow the app's active language everywhere they are displayed,
while persisted values and exported PNG filenames remain English. Custom labels
must remain exactly as entered.

## Data Model

Keep the existing `ButtonCalibrationItem.label` field unchanged. Built-in
selections continue to store their canonical English label, so existing saved
calibrations remain valid and filename generation requires no migration.

Extend each built-in catalog item with a stable i18next key under
`buttonLabels`. Add matching entries to the English and Chinese locale files.
English translations match the current canonical labels; the initial Chinese
translations are editable placeholders for later review.

## Display and Search

Add shared model helpers that:

- resolve a canonical built-in English label to its localized display label;
- return unknown labels unchanged so custom labels are preserved;
- search built-in labels by either canonical English text or localized text.

Use the localized display label on the Buttons selection options and selected
chips, Advanced calibration boxes and subtitles, export errors, and export
result labels. Selection and removal continue to compare canonical English
values rather than translated text.

The app's existing device-language initialization remains unchanged. The
development-only language switch may update the active i18next language during
a development session, but this feature adds no language persistence.

## Export Contract

`createButtonFileNames` continues to receive canonical English labels. No
translated label is written into calibration storage or used to create a file
name. Custom-label filenames continue to use the custom text supplied by the
user.

## Testing

Add focused tests before implementation to verify:

- every catalog entry has a stable translation key;
- localized Chinese labels resolve from canonical English labels;
- localized and English queries find the same built-in entry;
- custom labels pass through unchanged;
- filename generation remains English and keeps its existing duplicate logic.

Run the focused Jest test first, then the complete test suite, ESLint, and
TypeScript verification.
