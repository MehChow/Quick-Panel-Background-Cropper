# Custom Labels with Preset Button Icons Design

Date: 2026-08-25
Target release: v1.6.0
Status: Approved direction

## Goal

Let users match region- or device-specific Quick Panel wording by creating a
custom Button label that reuses any of the 30 existing preset Button icons.
Keep the implementation additive and preserve the current Button calibration,
preview, export, and persistence shapes.

For example, a user whose device displays `快速分享` instead of the app's
localized `快速共享` can enter `快速分享`, open the existing icon picker, choose
the Quick Share preset icon, and continue through calibration normally.

## User experience

The existing Button search/custom-label flow remains the entry point:

1. The user types the exact wording shown on the device.
2. The existing Add action opens the Button icon dialog.
3. The dialog opens on a `Preset buttons` / `預設按鈕` tab containing the 30
   existing preset Button icons in canonical catalog order.
4. An `Other icons` / `其他圖示` tab contains the existing 24 generic custom
   icon choices in their existing order.
5. Tapping an icon immediately adds the literal custom label with that icon
   and closes the dialog, matching today's selection behavior.

Both tabs use the existing bounded, vertically scrollable four-column grid.
Each tile shows its Lucide glyph and a concise localized name below it, exposes
the same localized name as its accessibility label, keeps a minimum 48-point
touch target, and does not require a separate confirmation action.

`Tabs` owns the temporary tab selection internally. Key the `Tabs` instance by
the pending custom label so every newly opened dialog starts on `Preset
buttons` without adding feature-level React state. The dialog title,
description, Cancel behavior, and dark AniUI surface remain unchanged.

## Domain model

The feature deliberately reuses the existing `ButtonCalibrationItem` storage
shape:

```ts
interface ButtonCalibrationItem {
  id: ButtonPanelId;
  label: string;
  customIconId: CustomButtonIconId | null;
  rect: PanelRect;
}
```

A canonical preset selection continues to store its canonical English label
and `customIconId: null`. A regional or otherwise custom label stores the
literal user-entered label and the selected glyph name in `customIconId`, even
when that glyph came from the preset catalog.

Do not add `labelOverride`, `canonicalButtonId`, an edit mode, or a migration.
The persisted property name `customIconId` also remains unchanged for
compatibility. Its TypeScript union and runtime validator broaden to accept:

- all 24 existing generic custom-icon IDs; and
- all 30 glyph names already mapped by `builtInButtonIconNames`.

Keep `customButtonIconChoices` as the exact 24-item generic catalog. Preserve
the literal value types from `builtInButtonIconNames` with `as const satisfies
Record<string, LucideIconName>`, derive the preset glyph union from that map,
and define `CustomButtonIconId` as the union of generic and preset glyph IDs.
`isCustomButtonIconId` must validate the same complete union at runtime so a
custom label using a preset icon survives storage reload.

`getButtonIconName` keeps the existing precedence rule: a canonical built-in
label always resolves its mapped preset icon, while a custom label resolves
its non-null `customIconId`.

## Catalog and component boundaries

`src/features/quick-panel/model/button-labels.ts` remains the source of truth
for both catalogs:

- `buttonLabelCatalog` supplies the 30 preset glyphs, stable order, and
  localized label keys;
- `customButtonIconChoices` supplies the 24 generic glyphs, stable order, and
  localized label keys.

Add a focused `ButtonIconChoiceGrid` component beside the dialog. It accepts
already-localized `{ id, label }` choices plus `onSelect` and renders the
shared four-column bounded grid. `CustomButtonIconDialog` owns only catalog
adaptation, Tabs composition, window-height sizing, and selection forwarding.
This keeps each production component below 150 lines without duplicating grid
markup.

The grid pads an incomplete final row with non-interactive flex spacers. The
30-item preset catalog therefore keeps four equal columns instead of stretching
its final two tiles across half the dialog width.

Do not add search inside the dialog. Thirty preset choices in the existing
bounded grid are small enough, and avoiding another query preserves the
minimal-state goal.

## Persistence and compatibility

- Existing built-in and custom Button calibrations remain valid without a
  version bump, reset, or transformation.
- `parseButtonItems` continues requiring `customIconId: null` for canonical
  built-in labels.
- `parseButtonItems` accepts any validated generic or preset glyph for a
  non-canonical custom label.
- Invalid glyph names still reject only the affected calibration branch under
  the existing parser behavior.
- Buttons-only and Controls + Buttons continue sharing the same Button item
  representation.
- Button order, generated geometry, label appearance, preview composition,
  1024 x 1024 export, and filename generation remain unchanged.
- Exact-string duplicate prevention remains unchanged. The feature does not
  infer that two differently worded labels represent the same Samsung Button.

## Localization

Add these dialog tab labels under `advancedCalibration`:

| Key                   | English          | Traditional Chinese |
| --------------------- | ---------------- | ------------------- |
| `customIconPresetTab` | `Preset buttons` | `預設按鈕`          |
| `customIconOtherTab`  | `Other icons`    | `其他圖示`          |

Preset tile names reuse each existing `buttonLabels.*` translation. Generic
tile names reuse the existing `advancedCalibration.customIcon*` translations.
No new per-icon copy is required.

## v1.6.0 release announcement

Follow `docs/release-announcement-guideline.md` and reuse the global
announcement host, descriptor, dialog, and isolated acknowledgement storage.

### Audience and behavior

- Audience: every fresh install or upgrading user who has not acknowledged
  this reason-specific announcement ID.
- Stable ID: `v1.6.0-custom-label-preset-icons-announcement`.
- CTA: the existing `Got it` / `知道了` acknowledgement.
- Acknowledgement and platform dismissal store only the new ID and close the
  dialog without navigation.
- No calibration, language, help, last-mode, or Customize preference changes
  occur.
- No data migration is required.

### Exact localized copy

English:

```text
Title: v1.6.0 Updates 🌟
Body: • New: Custom Button labels can now use any preset Button icon, so you can match the wording shown on your device.
CTA: Got it
Media accessibility label: Custom Button label choosing from preset Button icons
```

Traditional Chinese:

```text
Title: v1.6.0 更新內容 🌟
Body: • 新功能：自訂按鈕標籤現在可使用任何預設按鈕圖示，方便配合你裝置上顯示的用字。
CTA: 知道了
Media accessibility label: 自訂按鈕標籤選擇預設按鈕圖示
```

The locale object key is `releaseAnnouncement.v1_6_0` with `title`, `body`,
`gotIt`, and `mediaAccessibilityLabel` properties.

### Temporary and final media

Use the stable bundled path `assets/announcement/v1_6_0.webp`. During feature
implementation, copy the existing 1024 x 1024 `assets/images/appicon.png` to
that path as the explicitly temporary development image. The descriptor
requires `assets/announcement/v1_6_0.webp`, so the final feature screenshot can
replace the file in place later without another code or locale change.

The temporary app-icon image must not ship in the v1.6.0 release candidate.
Replacing it with the user-provided feature screenshot is a release gate. The
shared dialog renders the complete image with `contentFit="contain"` after the
body and before the CTA.

## Testing

Automated coverage will prove:

- the original 24 generic IDs and order remain unchanged;
- every one of the 30 preset glyph IDs is accepted as a valid
  `CustomButtonIconId`;
- all selectable IDs exist in the installed Lucide glyph map;
- a custom regional label resolves and persists with a preset glyph;
- canonical built-in labels still require `customIconId: null` in storage;
- invalid custom glyphs remain rejected;
- both tabs render with their exact localized names;
- all 30 preset choices and all 24 generic choices render accessibly;
- the dialog opens on `Preset buttons`, switches tabs, selects from either
  catalog, resets to the preset tab for a new pending label, and cancels
  without selection;
- the v1.6.0 announcement uses the new ID, exact bilingual copy, media
  accessibility label, and bundled media;
- acknowledgement and platform dismissal persist the new ID, while an already
  acknowledged ID suppresses the dialog;
- announcement acknowledgement remains independent from calibration and
  preferences.

Focused Jest suites run before final TypeScript, lint, and whitespace checks.
Phone-size grid layout, tab interaction, temporary/final announcement image
layout, fresh-install behavior, upgraded-install behavior, and end-to-end
preview/export remain user-owned manual QA.

## Out of scope

- Editing a selected canonical preset label in place
- Persisting a canonical Button ID plus a separate display-label override
- Automatically detecting equivalent regional wording
- Preventing semantically duplicate Buttons with different literal labels
- Changing the 30 preset mappings or the 24 generic icon catalog
- Adding search, icon import, My Icons, Original/Tint modes, or dependencies
- Changing calibration geometry, Button order, Customize controls, export
  dimensions, or filename rules
- Updating Expo version, app version metadata, Android `versionCode`, or store
  listing copy
- Shipping the temporary app-icon announcement image in the release candidate
