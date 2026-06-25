# Helper Help Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a first-time-only animated header helper cue that persists per help context with MMKV and stops immediately once that help is opened.

**Architecture:** Keep persistence in the existing Quick Panel MMKV storage module, keep the animation inside the shared header helper button path, and let screens pass stable help ids plus their existing help-open handlers. Advanced calibration maps its current help context to explicit ids so each help sheet has its own first-time state.

**Tech Stack:** Expo 56, React Native 0.85, react-native-reanimated 4.3.1, react-native-mmkv, Zustand, TypeScript

---

### Task 1: Add typed MMKV helpers for seen help entries

**Files:**
- Modify: `src/features/quick-panel/store/storage.ts`

- [ ] **Step 1: Add explicit help ids and parse helpers**

Add a typed union and parser near the other storage constants:

```ts
const seenHelpKey = "quick-panel.seen-help";

export const helpEntryIds = [
  "select-mode",
  "default-calibration",
  "advanced-calibration-outer",
  "advanced-calibration-panel-alignment",
  "advanced-calibration-panel-review",
] as const;

export type HelpEntryId = (typeof helpEntryIds)[number];

type SavedSeenHelp = Partial<Record<HelpEntryId, true>>;
```

- [ ] **Step 2: Add load and read helpers**

Implement MMKV readers that ignore invalid payloads and unknown keys:

```ts
export function loadSeenHelp(): SavedSeenHelp {
  return parseSeenHelp(storage.getString(seenHelpKey));
}

export function hasSeenHelp(helpId: HelpEntryId): boolean {
  return loadSeenHelp()[helpId] === true;
}
```

- [ ] **Step 3: Add the write helper**

Persist merged state instead of replacing unrelated entries:

```ts
export function markHelpSeen(helpId: HelpEntryId) {
  storage.set(
    seenHelpKey,
    JSON.stringify({
      ...loadSeenHelp(),
      [helpId]: true,
    }),
  );
}
```

- [ ] **Step 4: Add the internal parser**

Filter the parsed object to the known ids only:

```ts
function parseSeenHelp(value: string | undefined): SavedSeenHelp {
  try {
    const parsed = value ? JSON.parse(value) as Record<string, unknown> : {};
    return helpEntryIds.reduce<SavedSeenHelp>((result, id) => {
      if (parsed[id] === true) {
        result[id] = true;
      }
      return result;
    }, {});
  } catch {
    return {};
  }
}
```

### Task 2: Add an animated helper-button state with reduced-motion fallback

**Files:**
- Modify: `src/features/quick-panel/shared/HeaderActionButton.tsx`
- Modify: `src/features/quick-panel/shared/SubPageHeader.tsx`

- [ ] **Step 1: Extend the shared header button API**

Accept an optional help id so helper buttons can opt into seen-state behavior:

```ts
import { hasSeenHelp, type HelpEntryId } from "../store/storage";

interface HeaderActionButtonProps {
  accessibilityLabel: string;
  helpId?: HelpEntryId;
  icon?: React.ComponentProps<typeof Lucide>["name"];
  onPress: () => void;
  variant?: HeaderActionVariant;
}
```

- [ ] **Step 2: Add reduced-motion and animation state**

Use `AccessibilityInfo` plus Reanimated shared values to disable motion when needed and to drive a repeating micro-shake plus pulse waves when `helpId` is unseen.

- [ ] **Step 3: Render subtle pulse layers and animated icon transform**

Keep the current button geometry, then layer in:

```tsx
<Animated.View style={[styles.pulse, firstPulseStyle]} />
<Animated.View style={[styles.pulse, secondPulseStyle]} />
<Animated.View style={iconAnimatedStyle}>
  <Lucide color={theme.iconColor} name={iconName} size={theme.iconSize} />
</Animated.View>
```

The active loop should be brief, followed by a longer idle gap.

- [ ] **Step 4: Thread the API through `SubPageHeader`**

Add `actionHelpId?: HelpEntryId` and pass it through unchanged:

```tsx
<HeaderActionButton
  accessibilityLabel={actionAccessibilityLabel ?? t("calibration.helpButton")}
  helpId={actionHelpId}
  icon={actionIcon}
  onPress={onActionPress}
  variant={actionVariant}
/>
```

### Task 3: Wire screens so opening help marks the current entry as seen

**Files:**
- Modify: `src/features/quick-panel/select-mode/SelectModeScreen.tsx`
- Modify: `src/features/quick-panel/calibration/default/CalibrationScreen.tsx`
- Modify: `src/features/quick-panel/calibration/default/hooks/useCalibrationScreen.ts`
- Modify: `src/features/quick-panel/calibration/advanced/AdvancedCalibrationScreen.tsx`

- [ ] **Step 1: Wire select mode**

Mark the help as seen before opening the help sheet and pass the stable id:

```ts
import { markHelpSeen } from "../store/storage";

const openHelp = () => {
  markHelpSeen("select-mode");
  setIsHelpOpen(true);
};
```

and:

```tsx
<SubPageHeader
  actionHelpId="select-mode"
  actionVariant="helper-balanced"
  onActionPress={openHelp}
  title={t("mode.title")}
  subtitle={t("mode.subtitle")}
/>
```

- [ ] **Step 2: Wire default calibration**

Move the MMKV write into the existing `openHelp` path so the current behavior stays centralized:

```ts
import { markHelpSeen } from "../../../store/storage";

openHelp: () => {
  markHelpSeen("default-calibration");
  setIsHelpOpen(true);
},
```

and pass:

```tsx
actionHelpId="default-calibration"
```

- [ ] **Step 3: Wire advanced calibration by help context**

Add a small mapper:

```ts
import { markHelpSeen, type HelpEntryId } from "@/features/quick-panel/store/storage";

function getAdvancedHelpId(phase: AdvancedCalibrationPhase): HelpEntryId | null {
  if (phase === "outer") return "advanced-calibration-outer";
  if (isPanelPhase(phase)) return "advanced-calibration-panel-alignment";
  if (phase === "confirm") return "advanced-calibration-panel-review";
  return null;
}
```

Use that id to mark seen before opening and to drive the shared header button.

- [ ] **Step 4: Keep grid help out of scope**

Do not change the inline grid help button. The top-right helper button should stay animated only for the outer, panel-alignment, and review help contexts.

### Task 4: Verify the change manually and with a type check

**Files:**
- Modify: `docs/notes.md` if a repo note becomes necessary during implementation

- [ ] **Step 1: Run a type check**

Run: `npx tsc --noEmit`

Expected: exit code `0`

- [ ] **Step 2: Run targeted Jest coverage only if implementation forces it**

Per repo guidance, do not add or broaden tests unless explicitly requested. If an existing targeted test needs an update, run only that file.

- [ ] **Step 3: Manual behavior checklist**

Verify on device or emulator:

- `select-mode` helper animates before first open, then stops permanently after first open
- `default-calibration` helper animates only while the top-right button is present
- advanced calibration helper animates separately for outer, panel-alignment, and review contexts
- reduced-motion fallback remains static if enabled
- grid help button behavior is unchanged
