# Advanced Calibration Atomic Panel Commit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:executing-plans` to implement this plan inline, task-by-task.
> Steps use checkbox (`- [ ]`) syntax for tracking. Project instructions prohibit
> subagents, commits, and pushes.

**Goal:** Prevent a late Advanced-calibration gesture callback from moving an
already-confirmed box or advancing Combined calibration before the visible
active rectangle has been committed and overlap-validated.

**Architecture:** Replace whole-map panel writes with atomic
`(panelId, rect)` store actions so one gesture can mutate only its own panel.
Wrap every shared move/resize gesture in a panel-and-token transaction: JS marks
the active transaction at gesture begin, commits the matching final rectangle,
and keeps Next disabled until that commit is reflected in Zustand. Ignore stale
begin/commit callbacks whose panel, token, or current phase no longer matches.

**Tech Stack:** Expo 56.0.8, React Native 0.85.3, React 19.2.3, TypeScript,
Zustand 5, React Native Reanimated 4.3.1, React Native Worklets 0.8.3, React
Native Gesture Handler 2.31, Jest, React Native Testing Library, Uniwind, AniUI.

## Global Constraints

- Work inline only; do not use or suggest subagents.
- Never stage, commit, or push.
- Read the exact [Expo SDK 56 documentation](https://docs.expo.dev/versions/v56.0.0/)
  before production-code edits.
- Do not add dependencies.
- Do not use `useMemo`, `useCallback`, or `React.memo` outside
  `src/components/ani-ui`; use refs and focused hooks for current callback/state
  access.
- Preserve the existing UI-thread draft rectangle and one JS/Zustand write per
  completed or cancelled gesture.
- Preserve snapping, snap sensitivity, haptics, outer-bound constraints, panel
  order, colors, labels, and canvas geometry.
- Preserve independent Default, Advanced Controls, Advanced Buttons, and
  Advanced Combined calibration persistence; do not change stored schemas or
  keys.
- Confirmed boxes must never be changed by another panel's gesture callback.
- Combined Next must validate the exact rectangle visible when the active
  gesture ended; it must never advance while that rectangle awaits its JS
  commit.
- Controls-only and Buttons-only receive the same stale-callback protection even
  though they do not perform Combined's per-step overlap check.
- A stale callback is ignored silently and cannot clear or supersede a newer
  transaction.
- Leave physical-device QA to the user; report automated and manual evidence
  separately.
- Keep each new production component/hook file under 150 lines.

---

### Task 1: Replace Whole-Map Writes with Atomic Panel Actions

**Files:**

- Modify: `src/features/quick-panel/store/quick-panel-store.ts:66-296`
- Modify: `src/features/quick-panel/store/selectors.ts:23-56`
- Create: `__tests__/advanced-panel-atomic-store.test.ts`

**Interfaces:**

- Consumes: existing `ControlPanelId`, `ButtonPanelId`, `PanelId`, `PanelRect`,
  `advancedDraft`, `advancedButtonsDraft`, and `advancedCombinedDraft`.
- Produces:
  - `setAdvancedPanel(id: ControlPanelId, rect: PanelRect): void`
  - `setAdvancedButtonPanel(id: ButtonPanelId, rect: PanelRect): void`
  - `setCombinedPanel(id: PanelId, rect: PanelRect): void`
- Removes runtime use of the plural `setAdvancedPanels`,
  `setAdvancedButtonPanels`, and `setCombinedPanels` actions.

- [ ] **Step 1: Write failing atomic-store regressions**

Create `__tests__/advanced-panel-atomic-store.test.ts`. Reset Zustand in
`beforeEach` with `createInitialQuickPanelStateData()`. Define local
`rect(x, y, width, height)`, `screenshot`, and `outerRect` fixtures.

Write three concrete tests:

```ts
it("changes only the requested Controls-only panel", () => {
  const originalButtonBox = rect(0, 0, 80, 80);
  const originalBrightness = rect(0, 100, 80, 40);
  useQuickPanelStore.setState({
    ...createInitialQuickPanelStateData(),
    selectedMode: "advanced",
    selectedAdvancedTarget: "controls",
    advancedDraft: {
      screenshot,
      outerRect,
      enabledPanels: ["buttonBox", "brightness"],
      panels: {
        buttonBox: originalButtonBox,
        brightness: originalBrightness,
        volume: rect(0, 150, 80, 40),
        mediaPlayer: rect(0, 200, 80, 40),
      },
    },
  });

  useQuickPanelStore.getState().setAdvancedPanel(
    "brightness",
    rect(100, 100, 80, 40),
  );

  const panels = useQuickPanelStore.getState().advancedDraft?.panels;
  expect(panels?.buttonBox).toEqual(originalButtonBox);
  expect(panels?.brightness).toEqual(rect(100, 100, 80, 40));
});
```

- Buttons-only: seed `button-1` and `button-2`, update `button-2`, and assert
  `button-1` remains byte-for-byte equal.
- Combined: seed `buttonBox`, `brightness`, `button-1`, and `button-2`; update
  `button-2`; assert both Controls and `button-1` remain equal.

No test may pass a complete `PanelRects` map to an action.

- [ ] **Step 2: Run the store regression and verify RED**

Run:

```bash
npm test -- --runInBand --no-cache __tests__/advanced-panel-atomic-store.test.ts
```

Expected: FAIL because the three atomic action names do not exist.

- [ ] **Step 3: Add atomic action signatures and implementations**

In `QuickPanelState`, replace the three plural signatures with the atomic
signatures from **Interfaces**.

Implement `setAdvancedPanel` as a functional Zustand update:

```ts
setAdvancedPanel: (id, rect) => set((state) => ({
  advancedDraft: state.advancedDraft?.panels
    ? {
        ...state.advancedDraft,
        panels: { ...state.advancedDraft.panels, [id]: rect },
      }
    : state.advancedDraft,
  error: null,
})),
```

Implement `setAdvancedButtonPanel` by mapping the current Button array and
replacing only the matching `button.id`.

Implement `setCombinedPanel` as one functional update:

1. Find a matching Control ID in `draft.enabledControls`.
2. If found and `controlPanels` exists, replace only that Control property.
3. Otherwise map `draft.buttons` and replace only the matching Button.
4. Preserve every unmatched Control and Button.
5. If the ID matches neither family, return the existing draft unchanged.
6. Preserve the current `error: null` behavior after a valid write.

- [ ] **Step 4: Expose only atomic actions through selectors**

Replace plural entries in `quickPanelSelectors.advancedCalibrationScreen` with
`setAdvancedPanel` and `setAdvancedButtonPanel`. Replace `setCombinedPanels` in
`combinedCalibrationScreen` with `setCombinedPanel`.

- [ ] **Step 5: Run the store regression and verify GREEN**

Run the Step 2 command.

Expected: PASS with 3 tests. Draft writes must not invoke persistence.

---

### Task 2: Add a Shared Stale-Gesture Transaction Gate

**Files:**

- Create: `src/features/quick-panel/calibration/advanced/hooks/useAdvancedPanelCommitGate.ts`
- Create: `__tests__/advanced-panel-commit-gate.test.tsx`

**Interfaces:**

- Consumes `activePanelId: PanelId | null` and
  `commitPanel(id: PanelId, rect: PanelRect): void`.
- Produces:

```ts
export interface PanelGestureIdentity {
  panelId: PanelId;
  token: number;
}

export interface AdvancedPanelCommitGate {
  beginPanelGesture(panelId: PanelId, token: number): void;
  commitPanelGesture(panelId: PanelId, token: number, rect: PanelRect): void;
  isPanelGesturePending: boolean;
}
```

- [ ] **Step 1: Write failing hook tests**

Create a `HookProbe` following the existing calibration controller tests. Cover:

```ts
it("blocks until the matching commit", () => {
  act(() => gate().beginPanelGesture("buttonBox", 1));
  expect(gate().isPanelGesturePending).toBe(true);

  act(() => gate().commitPanelGesture("buttonBox", 1, finalRect));
  expect(commitPanel).toHaveBeenCalledWith("buttonBox", finalRect);
  expect(gate().isPanelGesturePending).toBe(false);
});

it("ignores an older commit without clearing the newer transaction", () => {
  act(() => gate().beginPanelGesture("buttonBox", 1));
  act(() => gate().beginPanelGesture("buttonBox", 2));
  act(() => gate().commitPanelGesture("buttonBox", 1, staleRect));

  expect(commitPanel).not.toHaveBeenCalled();
  expect(gate().isPanelGesturePending).toBe(true);
});
```

Also test that a commit is ignored and pending is cleared after the active panel
changes, and that a begin callback arriving after its panel was completed is
ignored without setting pending.

- [ ] **Step 2: Run the gate test and verify RED**

Run:

```bash
npm test -- --runInBand --no-cache __tests__/advanced-panel-commit-gate.test.tsx
```

Expected: FAIL because the hook does not exist.

- [ ] **Step 3: Implement the transaction hook**

Use `useRef`, `useState`, and one cleanup `useEffect`; do not add memo hooks.

```ts
const activePanelIdRef = useRef(activePanelId);
const commitPanelRef = useRef(commitPanel);
const pendingRef = useRef<PanelGestureIdentity | null>(null);
const [isPanelGesturePending, setIsPanelGesturePending] = useState(false);

activePanelIdRef.current = activePanelId;
commitPanelRef.current = commitPanel;
```

`beginPanelGesture` accepts a transaction only when `panelId` equals the current
active panel. `commitPanelGesture` writes only when panel ID, token, and current
active panel all match. A mismatched older token does nothing and cannot clear a
newer transaction.

Use an effect keyed by `activePanelId` to clear a pending transaction whose ID
no longer matches. This handles Back, selection changes, or a Next event that
raced ahead of the begin callback.

- [ ] **Step 4: Run the gate test and verify GREEN**

Run the Step 2 command.

Expected: PASS with 4 tests.

---

### Task 3: Give Every Gesture a Panel-Scoped Token

**Files:**

- Modify: `src/features/quick-panel/calibration/advanced/components/AdvancedPanelBox.tsx:19-113`
- Modify: `src/features/quick-panel/calibration/advanced/components/AdvancedPanelResizeHandle.tsx:10-38`
- Modify: `src/features/quick-panel/calibration/advanced/hooks/useAdvancedPanelMoveGesture.ts:12-72`
- Modify: `src/features/quick-panel/calibration/advanced/hooks/useAdvancedPanelResizeGesture.ts:11-74`
- Modify: `__tests__/advanced-panel-box-gesture.test.tsx`

**Interfaces:**

`AdvancedPanelBox` produces RN-runtime callbacks:

```ts
onGestureBegin: (panelId: PanelId, token: number) => void;
onGestureCommit: (
  panelId: PanelId,
  token: number,
  rect: PanelRect,
) => void;
```

The old `onChange(rect)` prop is removed from the box and both gesture hooks.

- [ ] **Step 1: Make the Worklets test mock asynchronous**

Replace the immediate `scheduleOnRN` mock with a FIFO job array:

```ts
interface ScheduledJob {
  args: unknown[];
  callback: (...args: unknown[]) => unknown;
}

const scheduledJobs: ScheduledJob[] = [];

jest.mock("react-native-worklets", () => ({
  ...jest.requireActual("react-native-worklets/src/mock"),
  scheduleOnRN: (
    callback: (...args: unknown[]) => unknown,
    ...args: unknown[]
  ) => scheduledJobs.push({ callback, args }),
}));
```

Add `flushScheduledJobs()` and clear the queue in `beforeEach`. Account for snap
haptic jobs without treating them as panel transactions.

- [ ] **Step 2: Write failing transaction expectations**

Test that move and resize gestures:

- schedule begin with the rendered panel ID and token `1`;
- call no RN callback synchronously;
- schedule exactly one matching final commit after end or cancelled finalize;
- share one increasing token counter across move and every resize handle; and
- do not double-commit after successful `onEnd` plus `onFinalize(..., true)`.

Representative assertion:

```ts
act(() => {
  moveHandlers.onBegin?.();
  moveHandlers.onUpdate?.({ translationX: 24, translationY: 16 });
  moveHandlers.onEnd?.();
});
expect(baseProps.onGestureBegin).not.toHaveBeenCalled();

act(flushScheduledJobs);
expect(baseProps.onGestureBegin).toHaveBeenCalledWith("button-1", 1);
expect(baseProps.onGestureCommit).toHaveBeenCalledWith(
  "button-1",
  1,
  expect.objectContaining({ x: 74, y: 76 }),
);
```

- [ ] **Step 3: Run the component test and verify RED**

Run:

```bash
npm test -- --runInBand --no-cache __tests__/advanced-panel-box-gesture.test.tsx
```

Expected: FAIL because transaction callbacks and tokens do not exist.

- [ ] **Step 4: Add one shared token counter per panel box**

In `AdvancedPanelBox`, add `const gestureToken = useSharedValue(0)`. Pass
`label`, `gestureToken`, `onGestureBegin`, and `onGestureCommit` to the move hook
and every resize handle. Keep `draftRect` synchronization unchanged.

- [ ] **Step 5: Schedule begin and matching commit from both hooks**

Add a `currentToken` shared value per gesture hook. In `onBegin`:

```ts
const token = gestureToken.get() + 1;
gestureToken.set(token);
currentToken.set(token);
didCommit.set(false);
startRect.set({ ...draftRect.get() });
scheduleOnRN(onGestureBegin, panelId, token);
```

Retain `didCommit` and schedule exactly one final callback:

```ts
scheduleOnRN(
  onGestureCommit,
  panelId,
  currentToken.get(),
  draftRect.get(),
);
```

Keep snap haptics separate and retain zero per-frame Zustand writes.

- [ ] **Step 6: Run gesture tests and verify GREEN**

Run:

```bash
npm test -- --runInBand --no-cache \
  __tests__/advanced-panel-box-gesture.test.tsx \
  __tests__/advanced-panel-gesture.test.ts
```

Expected: PASS with unchanged pure geometry expectations.

---

### Task 4: Wire Atomic Commits and Gate Next in Every Advanced Target

**Files:**

- Modify: `src/features/quick-panel/calibration/advanced/components/AdvancedPanelCanvas.tsx:21-140`
- Modify: `src/features/quick-panel/calibration/advanced/hooks/useAdvancedCalibrationScreen.ts:32-259`
- Modify: `src/features/quick-panel/calibration/advanced/combined/hooks/useCombinedCalibrationScreen.ts:35-220`
- Modify: `src/features/quick-panel/calibration/advanced/AdvancedCalibrationScreen.tsx:39-247`
- Modify: `src/features/quick-panel/calibration/advanced/combined/CombinedCalibrationScreen.tsx:19-130`
- Modify: `__tests__/advanced-panel-canvas-grid.test.tsx`
- Modify: `__tests__/advanced-calibration-leave-guard.test.tsx`
- Modify: `__tests__/combined-calibration-controller.test.ts`
- Modify: `__tests__/advanced-calibration-screen-empty-state.test.tsx`
- Modify: `__tests__/combined-calibration-screen.test.tsx`

**Interfaces:**

- `AdvancedPanelCanvas` receives `onGestureBegin` and `onGestureCommit` with the
  Task 3 signatures.
- Both screen hooks return `beginPanelGesture`, `commitPanelGesture`, and
  `isPanelGesturePending`.
- Existing footer `isNextDisabled` additionally includes pending panel commits.

- [ ] **Step 1: Write the canvas atomic-callback regression**

Replace `onPanelsChange` in `advanced-panel-canvas-grid.test.tsx`. Invoke the
transaction callback captured from `AdvancedPanelBox` and assert the parent gets
only ID, token, and the `fromLocalRect` result. Assert no callback argument is a
whole `PanelRects` map containing another panel.

- [ ] **Step 2: Write pending-Next controller regressions**

For Released Controls:

1. Reach the `buttonBox` phase.
2. Begin token `1`.
3. Call `goForward()` and assert the phase remains `buttonBox`.
4. Commit token `1` and assert Zustand stores the final rectangle.
5. Call `goForward()` and assert the phase advances.

Repeat the routing assertion for Buttons-only with `button-1`.

For Combined, verify the same pending block and post-commit advancement. Add a
regression where a late `buttonBox` commit arrives after the phase has become
`brightness`; assert it is ignored and the stored `buttonBox` does not change.

- [ ] **Step 3: Run canvas/controller tests and verify RED**

Run:

```bash
npm test -- --runInBand --no-cache \
  __tests__/advanced-panel-canvas-grid.test.tsx \
  __tests__/advanced-calibration-leave-guard.test.tsx \
  __tests__/combined-calibration-controller.test.ts
```

Expected: FAIL because the canvas still emits whole maps and no gate is wired.

- [ ] **Step 4: Forward transactions without reading a panel snapshot**

Delete `changePanel` and `onPanelsChange` from `AdvancedPanelCanvas`. Adapt only
the supplied active rectangle from local to screenshot coordinates:

```tsx
onGestureCommit={(panelId, token, rect) =>
  onGestureCommit(panelId, token, fromLocalRect(rect, viewportRect))}
```

The `panels` prop remains read-only render input and is never spread in a write.

- [ ] **Step 5: Integrate the gate into the Released hook**

Derive `activePanelId` from `displayedPhase`. Define an atomic `commitPanel`
that routes a matching selected Control to `setAdvancedPanel`, or a matching
selected Button to `setAdvancedButtonPanel`. Ignore IDs absent from the current
target selection.

Pass that callback into `useAdvancedPanelCommitGate`. Guard `goForward` at its
first line when the current panel has a pending transaction. Return all three
gate outputs.

- [ ] **Step 6: Integrate the gate into the Combined hook**

Back `commitPanel` with `setCombinedPanel`. Guard `goForward` before overlap
validation:

```ts
if (activePanelId && isPanelGesturePending) {
  return;
}
```

After pending becomes false, `getCombinedActivePanelError` must validate the
fresh Zustand rectangle before phase advancement.

- [ ] **Step 7: Wire both screens and footer disabled state**

Pass gate callbacks to `AdvancedPanelCanvas`.

Released:

```ts
const isNextDisabled =
  (isPanelSelectionPhase && enabledPanels.length === 0) ||
  (isPanelStep && isPanelGesturePending);
```

Combined:

```ts
const isNextDisabled =
  (isControlSelectionPhase && !advancedDraft?.enabledControls.length) ||
  (isButtonSelectionPhase && !advancedDraft?.buttons.length) ||
  (activePanelId !== null && isPanelGesturePending);
```

Add no new copy, spinner, modal, or persisted flag. Update screen mocks for the
new hook outputs and renamed atomic actions.

- [ ] **Step 8: Run controller and screen tests and verify GREEN**

Run:

```bash
npm test -- --runInBand --no-cache \
  __tests__/advanced-panel-canvas-grid.test.tsx \
  __tests__/advanced-calibration-leave-guard.test.tsx \
  __tests__/combined-calibration-controller.test.ts \
  __tests__/advanced-calibration-screen-empty-state.test.tsx \
  __tests__/combined-calibration-screen.test.tsx
```

Expected: PASS. Combined overlap validation still applies to completed visible
panels and the newly committed active rectangle.

---

### Task 5: Regression Sweep and Maintenance Handoff

**Files:**

- Modify: `docs/notes.md`
- Verify: all files changed in Tasks 1-4

**Interfaces:**

- Consumes the completed atomic action and transaction-gate behavior.
- Produces a concise maintenance record and automated evidence; no schema or
  user-facing workflow changes beyond race prevention.

- [ ] **Step 1: Search for stale whole-map APIs**

Run:

```bash
rg -n "setAdvancedPanels|setAdvancedButtonPanels|setCombinedPanels|onPanelsChange" \
  src __tests__
```

Expected: no references. Keep `PanelRects` where it remains legitimate read-only
geometry or validation input.

- [ ] **Step 2: Run the complete focused regression set**

Run:

```bash
npm test -- --runInBand --no-cache \
  __tests__/advanced-panel-atomic-store.test.ts \
  __tests__/advanced-panel-commit-gate.test.tsx \
  __tests__/advanced-panel-box-gesture.test.tsx \
  __tests__/advanced-panel-gesture.test.ts \
  __tests__/advanced-panel-canvas-grid.test.tsx \
  __tests__/advanced-calibration-leave-guard.test.tsx \
  __tests__/combined-calibration-controller.test.ts \
  __tests__/combined-calibration-state.test.ts \
  __tests__/combined-calibration-steps.test.ts \
  __tests__/advanced-calibration-screen-empty-state.test.tsx \
  __tests__/combined-calibration-screen.test.tsx
```

Expected: all listed suites pass without overlapping `act(...)` warnings.

- [ ] **Step 3: Run static and full-suite verification**

Run separately:

```bash
npm run lint
npx tsc --noEmit
npm test -- --runInBand
git diff --check
```

Expected: every command exits `0`. Report totals from fresh output.

- [ ] **Step 4: Add a dated `docs/notes.md` entry**

Record the symptom, asynchronous whole-map root cause, atomic panel/token fix,
shared three-target scope, unchanged snapping/persistence/export invariants,
exact automated results, and unrun user-owned device QA.

- [ ] **Step 5: Hand off manual QA without executing it**

Ask the user to check on a physical device:

1. Move/resize every Control and Button, pressing Next immediately after lift.
2. Repeat with rapid short drags and each resize handle.
3. In Combined, confirm completed boxes never move while later boxes are edited.
4. Confirm active overlap still blocks Combined Next.
5. Exercise Controls-only and Buttons-only once each.
6. Exercise Back then Next around one panel step and confirm no box reverts.

Keep this checklist explicitly unrun until the user supplies results.

---

## Completion Criteria

- One gesture can write only its own `PanelId` rectangle.
- Next is disabled and guarded while the active transaction is pending.
- Only the matching current panel/token commits; older callbacks cannot clear or
  replace newer work.
- Combined validates overlap after the final visible rectangle reaches Zustand.
- Controls-only and Buttons-only use the same protection.
- No persistence schema, snapping, preview, Customize, or export behavior
  changes.
- Focused tests, full Jest, ESLint, TypeScript, and `git diff --check` pass.
- Physical-device QA remains user-owned and unrun.
