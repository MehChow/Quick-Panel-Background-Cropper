# Buttons Selection Affordances Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan inline. Do not use sub-agents.

**Goal:** Make Advanced Buttons-only label selection read as selection and removal rather than an On/Off control.

**Architecture:** Keep the current `ButtonPanelSelection` state and handlers. Change only presentation and accessibility metadata in the existing component.

**Tech Stack:** Expo 56, React Native, TypeScript, Uniwind, `@react-native-vector-icons/lucide`

## Global Constraints

- Modify only `ButtonPanelSelection.tsx` for product code.
- Add no dependency, persistence, calibration, or navigation changes.
- Do not add tests because repository instructions require tests only when explicitly requested.
- Do not use sub-agents or browser demos.

---

### Task 1: Clarify selection and chip removal

**Files:**
- Modify: `src/features/quick-panel/calibration/advanced/components/ButtonPanelSelection.tsx`

**Interfaces:**
- Consumes: existing `toggleLabel(label: string): void` behavior.
- Produces: checkbox-style label rows and removable chips with visible `x` icons.

- [x] **Step 1: Import the existing Lucide icon component**

```tsx
import { Lucide } from "@react-native-vector-icons/lucide";
```

- [x] **Step 2: Add the chip removal affordance**

Render the existing chip `Pressable` as a horizontal row, add a label-specific accessibility label, and append the icon:

```tsx
<Pressable
  accessibilityLabel={`${t("advancedCalibration.remove")} ${label}`}
  accessibilityRole="button"
  className="flex-row items-center gap-1.5 rounded-full border border-emerald-300/40 bg-emerald-300/10 px-3 py-1.5"
  onPress={() => toggleLabel(label)}
>
  <Text className="text-xs font-semibold text-emerald-100">{label}</Text>
  <Lucide name="x" size={12} color="#d1fae5" />
</Pressable>
```

- [x] **Step 3: Remove the row-side On/Off copy**

Keep the existing selected-row colors, change the role to `checkbox`, and delete the trailing state `Text`:

```tsx
<Pressable
  accessibilityRole="checkbox"
  accessibilityState={{ checked: selectedLabels.includes(item.label) }}
  className={`min-h-11 justify-center rounded-xl border px-3 ${
    selectedLabels.includes(item.label)
      ? "border-emerald-300/40 bg-emerald-300/10"
      : "border-white/10 bg-zinc-800/70"
  }`}
  onPress={() => toggleLabel(item.label)}
>
  <Text className="font-semibold text-white">{item.label}</Text>
</Pressable>
```

- [x] **Step 4: Run static verification**

Run:

```bash
npm run lint
npx tsc --noEmit
git diff --check
```

Expected: all commands exit successfully with no lint, type, or whitespace errors.

- [x] **Step 5: Review scope**

Confirm the product-code diff contains only the import, chip affordance, row accessibility role, and removal of row-side state text. Do not commit because the user did not request a commit.
