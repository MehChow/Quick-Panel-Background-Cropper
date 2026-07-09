# Advanced Calibration Leave Guard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Warn users before leaving advanced calibration after they have confirmed the green outer rectangle and moved into later calibration steps.

**Architecture:** Keep the guard local to advanced calibration. Treat `phase !== "outer"` as dirty because `confirmAdvancedOuterRect()` is the existing transition that initializes the advanced draft panel work. Intercept the shared top-left header back press and Android hardware back, then show the existing AniUI `AlertDialog`; do not persist a dirty flag.

**Tech Stack:** Expo 56, Expo Router, React Native `BackHandler`, AniUI `AlertDialog`, Zustand, i18next.

---

## Approach Check

The proposed approach is good. The prompt should start after the green rect is confirmed, not while the user is still dragging/importing the first screenshot. That avoids warning users before they have real advanced-mode work to lose.

Use the existing advanced calibration phase as the dirty signal:

```ts
const shouldConfirmLeave = phase !== "outer";
```

Skipped: tracking every field edit or writing draft state to MMKV. Add that only if users later need resumable calibration after leaving.

## Files

- Modify: `src/features/quick-panel/shared/BackButton.tsx`
- Modify: `src/features/quick-panel/shared/SubPageHeader.tsx`
- Modify: `src/features/quick-panel/calibration/advanced/hooks/useAdvancedCalibrationScreen.ts`
- Modify: `src/features/quick-panel/calibration/advanced/AdvancedCalibrationScreen.tsx`
- Create: `src/features/quick-panel/calibration/advanced/components/AdvancedCalibrationLeaveDialog.tsx`
- Modify: `i18next/locales/en.ts`
- Modify: `i18next/locales/zh.ts`
- Test: `__tests__/advanced-calibration-leave-guard.test.tsx`

## Task 1: Let Shared Header Back Be Overridden

- [ ] **Step 1: Add an optional press handler to `BackButton`**

```tsx
interface BackButtonProps {
  className?: string;
  onPress?: () => void;
}

export function BackButton({ className = "mb-5", onPress }: BackButtonProps) {
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="button"
      className={cn(
        "h-11 w-11 items-center justify-center rounded-full bg-zinc-900 active:opacity-80",
        className,
      )}
      onPress={onPress ?? (() => router.back())}
    >
      <Lucide color="#fafafa" name="arrow-left" size={24} />
    </Pressable>
  );
}
```

- [ ] **Step 2: Thread the handler through `SubPageHeader`**

```tsx
interface SubPageHeaderProps {
  actionAccessibilityLabel?: string;
  actionHelpId?: HelpEntryId;
  actionIcon?: React.ComponentProps<typeof Lucide>["name"];
  actionVariant?: HeaderActionVariant;
  onActionPress?: () => void;
  onBackPress?: () => void;
  title: string;
  subtitle: string;
}
```

Render:

```tsx
<BackButton className="" onPress={onBackPress} />
```

- [ ] **Step 3: Run typecheck**

Run:

```bash
npx tsc --noEmit
```

Expected: no new TypeScript errors from `BackButton` or `SubPageHeader`.

## Task 2: Add Leave Guard State

- [ ] **Step 1: Add locale strings**

In `i18next/locales/en.ts` under `advancedCalibration`:

```ts
leaveTitle: "Leave advanced calibration?",
leaveBody: "Your current advanced calibration changes will not be saved.",
leaveConfirm: "Leave",
```

In `i18next/locales/zh.ts` under `advancedCalibration`:

```ts
leaveTitle: "離開進階校正？",
leaveBody: "目前的進階校正變更不會被保留。",
leaveConfirm: "離開",
```

- [ ] **Step 2: Add route-leave state in `useAdvancedCalibrationScreen.ts`**

Imports:

```ts
import { BackHandler } from "react-native";
import { useEffect, useState } from "react";
```

Inside the hook, after `displayedPhase` is available:

```ts
const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
const shouldConfirmLeave = displayedPhase !== "outer";

const leaveCalibration = () => {
  router.back();
};

const closeLeaveDialog = () => {
  setIsLeaveDialogOpen(false);
};

const requestLeaveCalibration = () => {
  if (!shouldConfirmLeave) {
    leaveCalibration();
    return true;
  }

  setIsLeaveDialogOpen(true);
  return true;
};
```

- [ ] **Step 3: Intercept Android hardware back**

Still inside `useAdvancedCalibrationScreen.ts`:

```ts
useEffect(() => {
  const subscription = BackHandler.addEventListener(
    "hardwareBackPress",
    requestLeaveCalibration,
  );

  return () => subscription.remove();
});
```

The effect intentionally has no dependency array so it always uses the latest phase without adding `useCallback`, which this repo avoids outside AniUI components.

- [ ] **Step 4: Return the dialog state and handlers**

Add to the returned hook object:

```ts
closeLeaveDialog,
isLeaveDialogOpen,
leaveCalibration,
requestLeaveCalibration,
```

## Task 3: Add the AniUI Leave Dialog

- [ ] **Step 1: Create `src/features/quick-panel/calibration/advanced/components/AdvancedCalibrationLeaveDialog.tsx`**

Match the existing `GoodLockUnavailableDialog` pattern and reuse `src/components/ani-ui/alert-dialog.tsx`:

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ani-ui/alert-dialog";
import { useTranslation } from "react-i18next";

interface AdvancedCalibrationLeaveDialogProps {
  onClose: () => void;
  onLeave: () => void;
  open: boolean;
}

export function AdvancedCalibrationLeaveDialog({
  onClose,
  onLeave,
  open,
}: AdvancedCalibrationLeaveDialogProps) {
  const { t } = useTranslation();

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="border border-slate-700 bg-slate-950">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("advancedCalibration.leaveTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("advancedCalibration.leaveBody")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onPress={onClose} className="border-0">
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction onPress={onLeave}>
            {t("advancedCalibration.leaveConfirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

- [ ] **Step 2: Wire the header and dialog in `AdvancedCalibrationScreen.tsx`**

Import:

```ts
import { AdvancedCalibrationLeaveDialog } from "./components/AdvancedCalibrationLeaveDialog";
```

Read these values from the hook:

```ts
closeLeaveDialog,
isLeaveDialogOpen,
leaveCalibration,
requestLeaveCalibration,
```

Pass the handler only to the `SubPageHeader` used after the outer step:

```tsx
<SubPageHeader
  actionAccessibilityLabel={actionAccessibilityLabel}
  actionHelpId={activeHelpId ?? undefined}
  actionVariant={showHelpButton ? "helper-balanced" : undefined}
  onActionPress={showHelpButton ? openActiveHelp : undefined}
  onBackPress={requestLeaveCalibration}
  title={t("advancedCalibration.title")}
  subtitle={getSubtitle(phase, t)}
/>
```

Render the dialog next to the existing help sheets:

```tsx
<AdvancedCalibrationLeaveDialog
  onClose={closeLeaveDialog}
  onLeave={leaveCalibration}
  open={isLeaveDialogOpen}
/>
```

Do not change the footer `Back` button. That button moves between calibration phases and must not show the leave dialog.

## Task 4: Add One Focused Test

- [ ] **Step 1: Create `__tests__/advanced-calibration-leave-guard.test.tsx`**

```tsx
import { act, render } from "@testing-library/react-native";
import { useAdvancedCalibrationScreen } from "@/features/quick-panel/calibration/advanced/hooks/useAdvancedCalibrationScreen";
import { pickImageFromLibrary } from "@/features/quick-panel/shared/pick-image-from-library";
import { useQuickPanelStore } from "@/features/quick-panel/store/quick-panel-store";

const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack, dismissTo: jest.fn() }),
}));

jest.mock("@/features/quick-panel/shared/pick-image-from-library", () => ({
  pickImageFromLibrary: jest.fn(),
}));

function HookProbe() {
  const hook = useAdvancedCalibrationScreen();
  (globalThis as typeof globalThis & {
    __advancedCalibrationHook?: ReturnType<typeof useAdvancedCalibrationScreen>;
  }).__advancedCalibrationHook = hook;
  return null;
}

const screenshot = {
  uri: "file:///quick-panel.png",
  width: 1000,
  height: 2000,
};

describe("advanced calibration leave guard", () => {
  beforeEach(() => {
    useQuickPanelStore.setState({
      advancedDraft: null,
      advancedCalibration: null,
      error: null,
      errorKey: null,
    });
    mockBack.mockClear();
    (pickImageFromLibrary as jest.Mock).mockResolvedValue(screenshot);
  });

  afterEach(() => {
    delete (globalThis as typeof globalThis & {
      __advancedCalibrationHook?: ReturnType<typeof useAdvancedCalibrationScreen>;
    }).__advancedCalibrationHook;
  });

  it("leaves on the outer step, then opens the dialog after the green rect is confirmed", async () => {
    render(<HookProbe />);

    await act(async () => {
      await (globalThis as typeof globalThis & {
        __advancedCalibrationHook: ReturnType<typeof useAdvancedCalibrationScreen>;
      }).__advancedCalibrationHook.importScreenshot();
    });

    act(() => {
      (globalThis as typeof globalThis & {
        __advancedCalibrationHook: ReturnType<typeof useAdvancedCalibrationScreen>;
      }).__advancedCalibrationHook.requestLeaveCalibration();
    });

    expect(mockBack).toHaveBeenCalledTimes(1);
    expect((globalThis as typeof globalThis & {
      __advancedCalibrationHook: ReturnType<typeof useAdvancedCalibrationScreen>;
    }).__advancedCalibrationHook.isLeaveDialogOpen).toBe(false);
    mockBack.mockClear();

    act(() => {
      (globalThis as typeof globalThis & {
        __advancedCalibrationHook: ReturnType<typeof useAdvancedCalibrationScreen>;
      }).__advancedCalibrationHook.goForward();
    });

    act(() => {
      (globalThis as typeof globalThis & {
        __advancedCalibrationHook: ReturnType<typeof useAdvancedCalibrationScreen>;
      }).__advancedCalibrationHook.requestLeaveCalibration();
    });

    expect(mockBack).not.toHaveBeenCalled();
    expect((globalThis as typeof globalThis & {
      __advancedCalibrationHook: ReturnType<typeof useAdvancedCalibrationScreen>;
    }).__advancedCalibrationHook.isLeaveDialogOpen).toBe(true);
  });
});
```

- [ ] **Step 2: Run the focused test**

Run:

```bash
npm test -- advanced-calibration-leave-guard.test.tsx
```

Expected: PASS.

- [ ] **Step 3: Run typecheck**

Run:

```bash
npx tsc --noEmit
```

Expected: PASS.

## Task 5: Manual Android Check

- [ ] Open advanced mode calibration.
- [ ] Import a Quick Panel screenshot.
- [ ] Press the top-left back button before confirming the green rect.
- [ ] Expected: leaves without dialog.
- [ ] Re-enter, import screenshot, confirm the green rect.
- [ ] Press the top-left back button.
- [ ] Expected: AniUI alert dialog appears; Cancel stays on the same step; Leave returns to select mode.
- [ ] Re-enter, confirm the green rect, press Android hardware Back.
- [ ] Expected: same AniUI dialog behavior.
- [ ] Press the footer Back button between panel steps.
- [ ] Expected: moves to the previous calibration step without dialog.
