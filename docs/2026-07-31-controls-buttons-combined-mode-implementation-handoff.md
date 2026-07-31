# Controls + Buttons Combined Mode Implementation Handoff

Date: 2026-07-31
Branch: `dev`

## Status

The product design and implementation plan are complete and approved. No
application code, dependency, configuration, release copy, or flow screenshot
has been changed.

## Read first

1. `AGENTS.md`
2. Expo 56 docs: `https://docs.expo.dev/versions/v56.0.0/`
3. `docs/superpowers/specs/2026-07-31-controls-buttons-combined-mode-design.md`
4. `docs/superpowers/plans/2026-07-31-controls-buttons-combined-mode.md`
5. `docs/v4-idea.md` for historical context only; the approved design
   supersedes its conflicting details.

## How to continue

Use `superpowers:executing-plans` and execute the eight plan tasks inline in
order, beginning with Task 1's failing persistence tests. Do not use subagents,
do not stage/commit/push, do not use a browser demo, and leave physical Samsung
and Good Lock QA to the user.

The main implementation boundary is additive: introduce an independent
`combined` calibration/storage/controller path while keeping released Default,
Controls-only, and Buttons-only behavior intact. Preview, sequential export,
and Result are already family-aware and should remain shared.

Important approved rules:

- one outer area, required `1–8` grid, image, transform, and coordinate system;
- at least one Control and one Button;
- active rectangles may overlap while editing, but Next and final save reject
  overlap with completed rectangles;
- combined Button intensity defaults to `78%` and persists only for combined;
- other Button identifier settings remain shared with Buttons-only; and
- export enabled Controls first in Good Lock order, then Buttons in selected
  order, using contiguous family-aware filenames.

Run the focused suites after each task and finish with the full Jest, Expo lint,
TypeScript, and `git diff --check` gate documented in Task 8.
