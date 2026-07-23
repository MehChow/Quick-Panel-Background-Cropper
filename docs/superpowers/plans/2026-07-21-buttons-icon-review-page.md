# Buttons Icon Review Page Implementation Plan

> **For agentic workers:** Execute this plan inline in the current workspace. Do not use sub-agents or commit changes.

**Goal:** Temporarily show all 59 built-in Buttons-only labels and Lucide icons in a two-column review page at app startup.

**Architecture:** Add a focused screen under the Quick Panel feature area that reads `buttonLabelCatalog`, renders it with a two-column `FlatList`, and displays each label with its icon and icon name. Temporarily re-export that screen from `src/app/index.tsx`; leave all normal flow routes unchanged.

**Tech Stack:** Expo SDK 56, Expo Router, React Native, Uniwind, `@react-native-vector-icons/lucide`, Jest Expo, React Native Testing Library.

## Global Constraints

- Use the existing 59-item catalog; do not duplicate button labels or icon mappings.
- Keep the page static with no exit control.
- Keep the startup redirect temporary and isolated to the root route.
- Use interfaces for props/state and avoid `any`.
- Do not add `useMemo`, `useCallback`, or `React.memo`.
- Do not commit or push.

---

### Task 1: Add the catalog-backed review screen

**Files:**
- Create: `src/features/quick-panel/dev/ButtonsIconReviewScreen.tsx`
- Test: `__tests__/buttons-icon-review-screen.test.tsx`

**Interfaces:**
- Consumes: `buttonLabelCatalog` items with `label` and `iconName`.
- Produces: a default React Native screen component rendering 59 review cards in two columns.

- [ ] **Step 1: Write the failing render test**

Create a test that renders the screen, asserts the catalog size is 59, checks the first and last labels are present, and verifies every catalog label is represented in the rendered tree.

```tsx
import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { buttonLabelCatalog } from "@/features/quick-panel/model/button-labels";
import ButtonsIconReviewScreen from "@/features/quick-panel/dev/ButtonsIconReviewScreen";

jest.mock("@react-native-vector-icons/lucide", () => ({
  Lucide: ({ name }: { name: string }) => <Text>{name}</Text>,
}));

test("renders every built-in button icon and label", () => {
  const { getByText } = render(<ButtonsIconReviewScreen />);

  expect(buttonLabelCatalog).toHaveLength(59);
  expect(getByText("Wi-Fi")).toBeTruthy();
  expect(getByText("Hotspot 2.0")).toBeTruthy();

  for (const item of buttonLabelCatalog) {
    expect(getByText(item.label)).toBeTruthy();
    expect(getByText(item.iconName)).toBeTruthy();
  }
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- --runInBand __tests__/buttons-icon-review-screen.test.tsx`

Expected: FAIL because `ButtonsIconReviewScreen.tsx` does not exist yet.

- [ ] **Step 3: Implement the minimal two-column screen**

Create a safe-area-aware, scrollable screen with a title and `FlatList` configured with `numColumns={2}`. Use `buttonLabelCatalog` as the data source and render each card with the `Lucide` icon, canonical label, and icon name. Keep the component static and do not add navigation controls.

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `npm test -- --runInBand __tests__/buttons-icon-review-screen.test.tsx`

Expected: PASS with one test passing.

### Task 2: Temporarily route app startup to the review screen

**Files:**
- Modify: `src/app/index.tsx`

**Interfaces:**
- Consumes: the default export from `@/features/quick-panel/dev/ButtonsIconReviewScreen`.
- Produces: the temporary startup page while preserving all other routes.

- [ ] **Step 1: Replace only the root route export**

Change `src/app/index.tsx` to:

```tsx
export { default } from "@/features/quick-panel/dev/ButtonsIconReviewScreen";
```

- [ ] **Step 2: Run focused tests and static checks**

Run: `npm test -- --runInBand __tests__/buttons-icon-review-screen.test.tsx`

Expected: PASS.

Run: `npm run lint`

Expected: Expo lint exits with code 0 and no errors.

Run: `npx tsc --noEmit`

Expected: TypeScript exits with code 0 and no type errors.

- [ ] **Step 3: Inspect the final diff**

Run: `git diff -- src/app/index.tsx src/features/quick-panel/dev/ButtonsIconReviewScreen.tsx __tests__/buttons-icon-review-screen.test.tsx docs/superpowers/specs/2026-07-21-buttons-icon-review-page-design.md docs/superpowers/plans/2026-07-21-buttons-icon-review-page.md`

Confirm that only the temporary root export, the catalog-backed screen, its focused test, and the design/plan docs are included. Do not commit.
