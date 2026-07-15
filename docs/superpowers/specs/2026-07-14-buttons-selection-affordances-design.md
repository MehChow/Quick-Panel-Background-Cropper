# Buttons Selection Affordances

## Scope

Clarify selection and removal on the Advanced Buttons-only label selection page without changing its data flow or layout.

## Design

- Remove the trailing On/Off text from every label row.
- Keep the whole row tappable to select or deselect its label.
- Preserve the existing emerald styling for selected rows.
- Expose each selectable row as a checked or unchecked checkbox to assistive technology rather than as an On/Off switch.
- Add a small Lucide `x` icon after the text in every selected chip.
- Keep the whole chip tappable to remove its label and give it a label-specific accessibility removal hint.

## Implementation

Update only `ButtonPanelSelection.tsx`. Use the already-installed Lucide icon package and add no dependencies or persistence changes.

## Verification

Run the repository lint and TypeScript checks. Confirm from the diff that selection, deselection, custom labels, and chip removal still use the existing handlers.
