# Directional Snap Candidates Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:executing-plans` to implement this plan inline, task-by-task.
> Steps use checkbox (`- [ ]`) syntax for tracking. Project instructions prohibit
> subagents, staging, commits, and pushes.

**Goal:** Make every draggable panel edge snap deterministically to its intended
side of an internal dotted grid line, regardless of which side the finger
approaches from, while preserving the implemented Low/Balanced/Strong capture
sensitivity.

**Architecture:** Extend `SnapAxis` with worklet-safe before-side and after-side
candidate arrays. Resolve the allowed array from the semantic edge before
origin hysteresis and nearest-candidate selection. Keep the existing combined
candidate list and all candidate coordinates intact, so this changes ownership
only—not grid geometry, sensitivity thresholds, haptics, persistence, or
exports.

**Tech Stack:** Expo 56, React Native 0.85, React 19.2.3, TypeScript,
Reanimated/Worklets, React Native Gesture Handler, Jest.

## Global constraints

- Work inline only; do not use or suggest subagents.
- Do not stage, commit, or push.
- Preserve all pre-existing modified and untracked files in the dirty
  `feature/snapping-sens-slider` worktree.
- Read the exact [Expo SDK 56 documentation](https://docs.expo.dev/versions/v56.0.0/)
  before production-code edits.
- Use explicit TypeScript interfaces and typed unions; do not use `any`.
- Do not add dependencies, persistence keys, component state, or gesture
  history.
- Do not add `useMemo`, `useCallback`, or `React.memo` outside AniUI.
- Bottom/right edges always own `line - gapOffset` for internal grid lines.
- Top/left edges always own `line + gapOffset` for internal grid lines.
- Exact first/last axis boundaries remain valid for both directional arrays.
- Both origin-candidate hysteresis and current candidate selection must use the
  same edge-filtered list.
- Keep `SnapAxis.candidates` and its current ordering unless a failing test
  proves a compatibility issue.
- Do not change sensitivity multipliers, capture/release threshold formulas,
  gap calculations, snap keys, haptics, clamping, overlap rules, saved
  calibration data, preview, or export behavior.
- Leave all physical-device QA to the user.

---

### Task 1: Specify edge-owned candidate selection with failing unit tests

**Files:**

- Modify: `__tests__/advanced-snap-axis.test.ts`
- Modify: `src/features/quick-panel/calibration/advanced/advanced-snap-axis.ts`

**Interfaces:**

- Extends `SnapAxis` with:
  - `beforeCandidates: number[]`
  - `afterCandidates: number[]`
- Keeps `SnapAxis.candidates: number[]` for existing tests and callers.
- Keeps the exported signatures of `createSnapAxis()`, `getBestMoveMatch()`,
  and `maybeSnap()` unchanged.

- [ ] **Step 1: Add failing direction tests around one internal line**

Update the test import:

```ts
import {
  createSnapAxis,
  maybeSnap,
} from "@/features/quick-panel/calibration/advanced/advanced-snap-axis";
```

Add this regression table to `__tests__/advanced-snap-axis.test.ts`:

```ts
it.each([
  ["bottom", 99, 94],
  ["bottom", 101, 94],
  ["top", 99, 106],
  ["top", 101, 106],
  ["right", 99, 94],
  ["right", 101, 94],
  ["left", 99, 106],
  ["left", 101, 106],
] as const)(
  "keeps the %s edge on its owned side when dragged to %i",
  (edge, value, expected) => {
    const axis = createSnapAxis(0, 400, 4, {
      scale: 1,
      sensitivity: "balanced",
    });

    expect(maybeSnap(value, 50, axis, edge).value).toBe(expected);
  },
);
```

Here the line is `100`, `gapOffset` is `6`, and the two current candidates are
`94` and `106`. The `99`/`101` pairs prove that crossing the line center cannot
flip an edge to the other side.

- [ ] **Step 2: Run the unit suite and confirm the existing bug**

Run:

```bash
npm test -- --runInBand --no-cache __tests__/advanced-snap-axis.test.ts
```

Expected: FAIL for at least `top` at `99`, `bottom` at `101`, `left` at `99`,
and `right` at `101`, because the current nearest-candidate search ignores the
edge until after selection.

- [ ] **Step 3: Add failing sensitivity-invariance and boundary tests**

Add:

```ts
it.each(["low", "balanced", "strong"] as const)(
  "keeps directional destinations unchanged at %s sensitivity",
  (sensitivity) => {
    const axis = createSnapAxis(0, 400, 4, { scale: 1, sensitivity });

    expect(maybeSnap(100, 50, axis, "bottom").value).toBe(94);
    expect(maybeSnap(100, 50, axis, "top").value).toBe(106);
    expect(maybeSnap(100, 50, axis, "right").value).toBe(94);
    expect(maybeSnap(100, 50, axis, "left").value).toBe(106);
  },
);

it("keeps exact outer boundaries available to both directions", () => {
  const axis = createSnapAxis(0, 400, 4, {
    scale: 1,
    sensitivity: "balanced",
  });

  expect(maybeSnap(3, 50, axis, "left").value).toBe(0);
  expect(maybeSnap(3, 50, axis, "right").value).toBe(0);
  expect(maybeSnap(397, 350, axis, "left").value).toBe(400);
  expect(maybeSnap(397, 350, axis, "right").value).toBe(400);
});
```

Expected before implementation: the sensitivity test exposes side switching;
the boundary test documents behavior that must remain passing.

- [ ] **Step 4: Build directional candidate arrays without changing geometry**

Extend `SnapAxis`:

```ts
export interface SnapAxis {
  lines: number[];
  candidates: number[];
  beforeCandidates: number[];
  afterCandidates: number[];
  captureThreshold: number;
  releaseThreshold: number;
}
```

In `createSnapAxis()`, retain the existing `candidates` calculation and add:

```ts
const beforeCandidates = lines.map((line, index) =>
  index === 0 || index === lines.length - 1 ? line : line - gapOffset,
);
const afterCandidates = lines.map((line, index) =>
  index === 0 || index === lines.length - 1 ? line : line + gapOffset,
);
```

Return both arrays with the existing fields. Do not derive `lines` from
candidates and do not alter `gap`, `gapOffset`, or the public combined list.

- [ ] **Step 5: Filter both origin and current lookup by edge**

Add a worklet-safe selector:

```ts
function getCandidatesForEdge(axis: SnapAxis, edge: SnapEdge) {
  "worklet";
  return edge === "bottom" || edge === "right"
    ? axis.beforeCandidates
    : axis.afterCandidates;
}
```

Change the private signatures to accept `edge`:

```ts
function getOriginCandidate(
  value: number,
  axis: SnapAxis,
  edge: SnapEdge,
) {
  "worklet";
  const candidates = getCandidatesForEdge(axis, edge);
  // Existing threshold search over candidates.
}

function getNearestCandidate(
  value: number,
  originValue: number,
  axis: SnapAxis,
  edge: SnapEdge,
) {
  "worklet";
  const candidates = getCandidatesForEdge(axis, edge);
  const originCandidate = getOriginCandidate(originValue, axis, edge);
  // Existing release/capture selection over candidates.
}
```

Replace each internal loop over `axis.candidates` with its local `candidates`.
Forward `edge` from both call sites:

```ts
const candidate = getNearestCandidate(value, originValue, axis, edge);
```

This must be done in both `getNearestMatch()` and `maybeSnap()`. Do not filter
only the final current-value search; origin hysteresis must use the same owned
side.

- [ ] **Step 6: Run the axis suite and verify all unit regressions pass**

Run the Step 2 command.

Expected: PASS. Existing threshold, scale-normalization, and combined-candidate
tests must remain unchanged and passing.

Do not stage or commit.

---

### Task 2: Align movement coverage and lock the screenshot scenarios

**Files:**

- Modify: `__tests__/advanced-panel-gesture.test.ts`

**Interfaces:**

- Uses the existing `getAdvancedPanelResizeResult()` input contract.
- Does not modify `advanced-panel-gesture.ts`, `advanced-grid.ts`, gesture hooks,
  or component props unless the new tests reveal a separate confirmed defect.

- [ ] **Step 1: Update existing movement expectations to the owned side**

The two existing movement tests use `dx: 47`, which produces a raw left edge at
`97`. They currently assert the nearest before-side candidate `94`. Update both
to the new semantic destination:

```ts
expect(snapped.rect.x).toBe(106);
expect(snapped.snapKey).toContain("left:x:106.00");
```

and:

```ts
expect(result.rect.x).toBe(106);
expect(result.snapKey).toContain("left:x:106.00");
```

In `"changes movement capture distance without changing the target"`, change
`dx` from `29` to `40`. The raw left edge then becomes `90`: Low remains outside
its 10-unit capture threshold, while Balanced captures the left edge's owned
candidate at `106`. Update the final assertion:

```ts
expect(balanced.snapKey).toContain("left:x:106.00");
```

These are required contract updates, not snapshots to preserve. Do not change
the right-resize sensitivity test; its owned destination remains `194`.

- [ ] **Step 2: Add the bottom-edge regression from the screenshots**

Using the existing `outerRect` and `startRect` fixtures, add:

```ts
it.each([39, 41])(
  "keeps the bottom edge above the row when raw bottom crosses it with dy %i",
  (dy) => {
    const result = getAdvancedPanelResizeResult({
      dx: 0,
      dy,
      grid: { columns: 3, rows: 4 },
      outerRect,
      position: "bottom",
      scale: 1,
      snapSensitivity: "balanced",
      startRect,
    });

    expect(result.rect.y + result.rect.height).toBe(194);
    expect(result.rect.height).toBe(134);
    expect(result.snapKey).toContain("bottom:y:194.00");
  },
);
```

The unsnapped bottom coordinates are `199` and `201` around the horizontal
line at `200`. Both must resolve to its above-side candidate `194`.

- [ ] **Step 3: Add the right-edge regression requested by the user**

Add:

```ts
it.each([69, 71])(
  "keeps the right edge left of the column when raw right crosses it with dx %i",
  (dx) => {
    const result = getAdvancedPanelResizeResult({
      dx,
      dy: 0,
      grid: { columns: 3, rows: 4 },
      outerRect,
      position: "right",
      scale: 1,
      snapSensitivity: "balanced",
      startRect,
    });

    expect(result.rect.x + result.rect.width).toBe(194);
    expect(result.rect.width).toBe(144);
    expect(result.snapKey).toContain("right:x:194.00");
  },
);
```

The unsnapped right coordinates are `199` and `201` around the vertical line at
`200`. Both must resolve to its left-side candidate `194`.

- [ ] **Step 4: Run the focused snapping suites**

Run:

```bash
npm test -- --runInBand --no-cache \
  __tests__/advanced-snap-axis.test.ts \
  __tests__/advanced-panel-gesture.test.ts
```

Expected: PASS. The pre-fix baseline was 2 suites and 10 tests; the new total
must include all added direction, sensitivity, boundary, and integration cases.

- [ ] **Step 5: Inspect the focused diff for accidental scope expansion**

Run:

```bash
git diff -- \
  src/features/quick-panel/calibration/advanced/advanced-snap-axis.ts \
  __tests__/advanced-snap-axis.test.ts \
  __tests__/advanced-panel-gesture.test.ts
```

Confirm:

- all internal candidate coordinates are unchanged;
- capture and release math is unchanged;
- the edge decides only which side-array is searched;
- both origin and current searches use that array;
- no gesture direction, velocity, or persisted state was added; and
- no existing dirty sensitivity work was removed.

Do not stage or commit.

---

### Task 3: Document the fix and run non-device verification

**Files:**

- Modify: `docs/notes.md`

- [ ] **Step 1: Add a narrow current-date note**

Append a concise 2026-08-07 entry explaining:

- internal grid candidates are now owned by the dragged edge;
- bottom/right select the before/upper-left side and top/left select the
  after/lower-right side;
- approaching or crossing a dotted line no longer flips the snapped side;
- Low/Balanced/Strong still changes capture/release distance only; and
- calibration storage, grid geometry, previews, and exports are unchanged.

Preserve the existing uncommitted sensitivity note and all unrelated notes.

- [ ] **Step 2: Run the complete automated test suite**

Run:

```bash
npm test -- --runInBand
```

Expected: all suites PASS. If an unrelated pre-existing failure appears, record
the exact suite and error separately; do not modify unrelated code to hide it.

- [ ] **Step 3: Run static verification**

Run:

```bash
npm run lint
npx tsc --noEmit
git diff --check
```

Expected: all commands exit successfully. Report each command separately and
do not claim physical-device verification.

- [ ] **Step 4: Review final scope without staging**

Run:

```bash
git status --short
git diff --stat
git diff -- \
  src/features/quick-panel/calibration/advanced/advanced-snap-axis.ts \
  __tests__/advanced-snap-axis.test.ts \
  __tests__/advanced-panel-gesture.test.ts \
  docs/notes.md
```

Confirm the fix touched only the directional axis model, focused regression
tests, and the existing notes file. Distinguish these changes from the
pre-existing sensitivity implementation in the handoff report.

- [ ] **Step 5: Hand off manual QA to the user**

Ask the user to verify on the physical Samsung/QuickStar setup:

- bottom edge stays above a dotted row when approached from either side;
- top edge stays below it;
- right edge stays left of a dotted column;
- left edge stays right of it;
- each case behaves identically at Low, Balanced, and Strong once captured;
- exact outer-area boundary snapping still works; and
- Controls-only, Buttons-only, and Combined retain their normal haptics,
  clamping, overlap checks, and saved geometry.

Do not perform, simulate, or claim this manual QA.

Do not stage, commit, or push.
