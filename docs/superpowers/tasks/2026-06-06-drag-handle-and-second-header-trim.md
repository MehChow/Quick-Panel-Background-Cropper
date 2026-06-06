# Drag Handle And Second Header Trim Tasks

Author: Codex, GPT-5
Date: 2026-06-06
Status: Ready for execution

## Minimal Executable Tasks

- [ ] Add `bottomCropTopY` to the runtime custom calibration session and reset it correctly.
- [ ] Extend custom calibration geometry helpers so merged height uses the trimmed visible portion of screenshot 2.
- [ ] Replace the current `PanResponder` seam with a stable `react-native-gesture-handler` vertical drag.
- [ ] Freeze the two-shot preparation canvas height during drag so upward overlap does not bounce back visually.
- [ ] Replace the small orange seam with a larger full-width seam band that is easier to see and hit.
- [ ] Add a bounded top trim control for screenshot 2 so the repeated phone header is excluded before confirmation.
- [ ] Carry the trimmed lower screenshot content into the merged custom calibration canvas and merged-height confirmation logic.
- [ ] Keep the one-shot custom calibration path unchanged.
- [ ] Update `README.md` and `CALIBRATION_PLAN.md` to describe the stable seam drag and second-header trim.
- [ ] Run `npm run lint`, `npm test -- --runInBand`, and final manual checks for one-shot and two-shot custom calibration.

## Execution Order

1. Session type and geometry helpers
2. Overlap aligner interaction and trim UI
3. Merged custom canvas and confirmation flow
4. Docs and verification
