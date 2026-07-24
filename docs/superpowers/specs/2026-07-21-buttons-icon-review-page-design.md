# Buttons Icon Review Page

## Goal

Create a temporary development page that shows every built-in Buttons-only icon beside its corresponding label so the icon mappings can be visually reviewed.

## Design

- Add a dedicated Expo Router route for the review page.
- Render the existing built-in button catalog rather than duplicating the 59 labels or icon mappings.
- Display items in two columns with a scrollable `FlatList`.
- Each item shows the Lucide icon, the user-facing label, and the underlying icon name.
- Keep the page static and omit an exit control because it is temporary development tooling.
- Temporarily make the app root render this page on startup. Leave the existing landing and selection routes unchanged so the temporary entry point can be removed independently.

## Verification

- TypeScript/lint checks pass for the changed files.
- A focused test verifies that all 59 catalog items are rendered and that the route uses the catalog-backed icon names.
- Review the page on the target app startup path to confirm the two-column layout and icon-label pairings.
