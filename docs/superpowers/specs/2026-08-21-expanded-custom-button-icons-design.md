# Expanded Custom Button Icons Design

Date: 2026-08-21
Target release: v1.5.0
Source: `docs/2026-08-20-v1.5.0-expanded-custom-button-icons-handoff.md`

## Goal

Expand the reviewed Lucide icon catalog for custom Button labels from 8 choices
to 24 while preserving saved calibrations, built-in Button mappings, preview,
export, and calibration behavior.

## Scope

The canonical `customButtonIconChoices` catalog will keep its existing eight
IDs in their current order and append these IDs in order: `heart`, `bell`,
`bookmark`, `briefcase-business`, `calendar-days`, `car`, `cloud`, `coffee`,
`gift`, `key-round`, `lightbulb`, `palette`, `rocket`, `shield`,
`shopping-bag`, and `timer`.

Each new choice will use a translation key in the existing
`advancedCalibration` namespace. English and Traditional Chinese will provide
a visible label for every choice.

The icon dialog will render the catalog as a data-driven four-column grid in a
vertically scrollable region. The region will have a screen-relative maximum
height so the dialog title, description, and Cancel action stay outside the
scroll area and remain visible on short phones. Icon controls remain square,
retain a minimum 48-point touch target, expose their translated label as the
accessibility label, and select the stable catalog ID.

## Architecture

`src/features/quick-panel/model/button-labels.ts` remains the single source of
truth for accepted custom icon IDs and their translation keys. Its existing
literal `as const` catalog continues to derive `CustomButtonIconId`, so adding
records automatically broadens validation without a migration or duplicate
type declaration.

`CustomButtonIconDialog` will derive four-item rows from the catalog at render
time and place them inside a React Native `ScrollView`. This keeps the existing
four-column sizing behavior and avoids adding a virtualized list or dependency
for only 24 items. `useWindowDimensions` will cap the scroll region at the
smaller of 320 points and 45 percent of the current screen height.

## Data and Compatibility

- The original eight IDs and their order are immutable.
- Existing saved IDs remain accepted; no migration or reset runs.
- `isCustomButtonIconId` accepts all 24 IDs through the canonical catalog.
- `builtInButtonIconNames` and the 30 built-in Button labels do not change.
- Calibration records, Button ordering, Customize preview, and export continue
  consuming the same `CustomButtonIconId` string values.
- No release version, Android `versionCode`, or announcement state changes.

## Localization

The new English labels are Heart, Bell, Bookmark, Briefcase, Calendar, Car,
Cloud, Coffee, Gift, Key, Lightbulb, Palette, Rocket, Shield, Shopping Bag, and
Timer. Traditional Chinese labels will be concise equivalents under the same
locale namespace. Existing translation keys are unchanged.

## Testing

Automated tests will verify:

- the exact 24 IDs and order;
- uniqueness and `isCustomButtonIconId` acceptance for every ID;
- presence of every ID in the installed Lucide glyph map;
- no overlap between the 16 additions and the 30 built-in icon mappings;
- rendering of all 24 translated accessibility labels;
- selection of a newly added icon and cancellation behavior;
- English and Traditional Chinese values for all new translation keys.

Focused Jest suites will run first. Final automated verification will run the
relevant Jest suites, the full TypeScript check, lint, and `git diff --check`.
Phone-size scrolling and visual QA remain user-owned.

## Out of Scope

- Imported images, cropping, or a persistent My Icons library
- Original or Tint rendering modes
- New icon-source models or storage fields
- Calibration geometry, ordering, preview, or export changes
- Release metadata or release announcement changes
- New dependencies or unrelated refactoring
