# Directional Snap Candidates Fix Handoff

Date: 2026-08-07
Branch: `feature/snapping-sens-slider`

## Status

The snapping inconsistency has been reproduced and traced to edge-agnostic
candidate selection. The corrective design and implementation plan are ready.
This handoff/planning pass changes documentation only; it does not modify the
current sensitivity-slider implementation, snapping runtime, tests, locales,
storage, dependencies, or release assets.

The worktree already contains a large uncommitted implementation of the
three-stop Low/Balanced/Strong sensitivity control. Treat every pre-existing
modified and untracked file as user work. Do not reset, replace, stage, commit,
or push it.

## Reported behavior

While resizing the purple panel box, an internal grid line currently exposes
two valid geometric snap candidates: one immediately before the dotted line and
one immediately after it. The runtime selects whichever candidate is nearest to
the dragged coordinate, so crossing the center of the dotted line can silently
switch the selected side.

The supplied screenshots demonstrate the bottom-edge case:

- image 1: the bottom edge is being dragged toward the second dotted row;
- image 2: correct result, with the purple bottom edge above the row; and
- image 3: incorrect result, with the edge switched to the other side and
  appearing on top of the row.

The screenshot files were supplied from temporary paths and may not survive a
later session:

- `/var/folders/47/jh63_12d55g251gtmd2ngw600000gn/T/codex-clipboard-08c281de-7074-4749-a6ec-d5de13373210.png`
- `/var/folders/47/jh63_12d55g251gtmd2ngw600000gn/T/codex-clipboard-68cfebb6-e66e-4284-bae0-965f1c2f2b69.png`
- `/var/folders/47/jh63_12d55g251gtmd2ngw600000gn/T/codex-clipboard-ff53f7ea-9105-4e20-a895-4d83202b2a1b.png`

## Confirmed root cause

The defect is in
`src/features/quick-panel/calibration/advanced/advanced-snap-axis.ts`:

1. `createSnapAxis()` emits both `line - gapOffset` and
   `line + gapOffset` into one undifferentiated `candidates` array for every
   internal grid line.
2. `getNearestCandidate()` searches the whole array without receiving the edge
   being dragged.
3. `getNearestMatch()` and `maybeSnap()` attach the edge name only after the
   nearest candidate has already been chosen.

For a grid line at `100` with a `6`-unit half-gap, the candidates are `94` and
`106`. A coordinate at `99` selects `94`, but a coordinate at `101` selects
`106`. That nearest-side rule explains why tiny finger movement, frame timing,
or rounding around the grid center produces different final sides.

The Low/Balanced/Strong control is not the root cause. It changes only the
capture and release distances. Strong makes the old ambiguity easier to enter
because its capture range is larger, but all three sensitivity values must snap
to the same edge-owned destination once captured.

## Approved directional contract

Every editable panel edge owns one side of an internal grid line:

| Dragged edge | Required destination | Candidate |
| --- | --- | --- |
| Bottom | Above the horizontal grid line | `line - gapOffset` |
| Top | Below the horizontal grid line | `line + gapOffset` |
| Right | Left of the vertical grid line | `line - gapOffset` |
| Left | Right of the vertical grid line | `line + gapOffset` |

Outer-area boundaries remain exact grid-line candidates for both relevant edge
directions. This preserves the ability to align a box exactly to the confirmed
outer rectangle.

The contract applies to both resize and whole-box movement. During movement,
the left/top edges evaluate only their after-side candidates, while the
right/bottom edges evaluate only their before-side candidates; the existing
smallest-offset comparison still decides which box edge wins.

## Corrective architecture

Keep the existing public `candidates` list for compatibility and diagnostics,
but add worklet-safe directional candidate lists to `SnapAxis`:

- `beforeCandidates`: internal `line - gapOffset`, with exact outer boundaries;
- `afterCandidates`: internal `line + gapOffset`, with exact outer boundaries.

Select the list from the dragged edge before both origin/hysteresis lookup and
nearest-current lookup:

- `bottom` and `right` use `beforeCandidates`;
- `top` and `left` use `afterCandidates`.

Passing the same filtered list through `getOriginCandidate()` and
`getNearestCandidate()` is important. Filtering only the final lookup would
leave release hysteresis tied to a candidate the edge is no longer allowed to
own.

No drag-direction history, previous-side stickiness, velocity heuristic, or
new persistent state is needed. The edge itself provides the deterministic
semantic rule.

## Scope and non-goals

The fix is limited to directional candidate ownership and regression coverage.
It must not change:

- the three sensitivity values, multipliers, slider UI, or MMKV preference;
- grid rows, columns, dotted-line rendering, or grid-point placement;
- gap size, candidate coordinates, capture/release formulas, or canvas scaling;
- snap keys, haptic behavior, resize handles, clamping, overlap validation, or
  calibration persistence;
- Default calibration, image adjustment, previews, exports, filenames, or
  output quality; or
- Controls-only, Buttons-only, or Combined phase ordering.

## Implementation touchpoints

Primary runtime file:

- `src/features/quick-panel/calibration/advanced/advanced-snap-axis.ts`

Regression tests:

- `__tests__/advanced-snap-axis.test.ts`
- `__tests__/advanced-panel-gesture.test.ts`

The gesture suite currently expects a moved left edge near the first internal
line to snap to `94`. Under the approved left-edge contract, that destination
becomes the after-side candidate `106`. Update those existing assertions and
retune their sensitivity-distance fixture before adding the bottom/right
resize regressions; do not preserve the old expectation as compatibility.

Release note entry after the fix:

- `docs/notes.md`

`advanced-grid.ts`, `advanced-panel-gesture.ts`, gesture hooks, panel
components, screens, storage, and locales should not require runtime changes.
Their existing calls already supply the correct edge names.

## Verification boundary

Automated verification in the implementation pass should include:

```bash
npm test -- --runInBand --no-cache \
  __tests__/advanced-snap-axis.test.ts \
  __tests__/advanced-panel-gesture.test.ts
npm test -- --runInBand
npm run lint
npx tsc --noEmit
git diff --check
```

Before this handoff was written, the two focused suites passed with 10 tests,
showing that existing coverage does not yet assert directional side ownership.
The implementation plan adds those missing regressions first.

Leave physical-device QA to the user. The manual matrix should cover all four
edges at Low, Balanced, and Strong, approaching each dotted line from both
sides, plus exact outer-boundary snapping in Controls-only, Buttons-only, and
Combined.

## How to continue

1. Read `AGENTS.md` and the exact Expo SDK 56 documentation before production
   code edits.
2. Read
   `docs/superpowers/plans/2026-08-07-directional-snap-candidates-fix.md`.
3. Use `superpowers:executing-plans` inline and follow its test-first tasks in
   order.
4. Preserve the existing dirty sensitivity-slider worktree and do not stage,
   commit, push, delegate, or perform device QA.
