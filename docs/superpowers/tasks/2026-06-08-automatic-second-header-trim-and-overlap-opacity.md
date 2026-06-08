# Automatic Second Header Trim And Alignment Opacity Tasks

Author: Codex, GPT-5
Date: 2026-06-08
Status: Ready for execution

## Minimal Executable Tasks

- [ ] Add one pure helper that computes automatic runtime trim for screenshot 2 from screenshot width and existing trim bounds.
- [ ] Replace the current fixed `120` trim seed with that automatic helper when screenshot 2 is imported.
- [ ] Remove the manual second-header trim gesture and trim label from the two-shot alignment screen.
- [ ] Render screenshot 2 with fixed partial opacity during the alignment step only.
- [ ] Keep the existing seam drag, upward-overlap behavior, merged-height calculation, and one-shot custom path unchanged.
- [ ] Clean up any now-unused trim-copy keys and stale props created by removing manual trim control.
- [ ] Update `README.md` and `CALIBRATION_PLAN.md` to describe automatic trim plus translucent alignment.
- [ ] Run `npm run lint`, `npm test -- --runInBand`, and manual two-shot plus one-shot verification.

## Execution Order

1. Automatic trim helper and import seeding
2. Alignment-surface simplification and opacity
3. Docs and verification
