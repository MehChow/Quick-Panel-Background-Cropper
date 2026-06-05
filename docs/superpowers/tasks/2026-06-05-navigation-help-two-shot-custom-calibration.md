# Navigation, Help, And Two-Screenshot Custom Calibration Tasks

Author: Codex, GPT-5
Date: 2026-06-05
Status: Ready for execution

## Minimal Executable Tasks

- [ ] Normalize landing-route navigation so completed calibration dismisses back to one real `/` root instead of stacking repeated home screens.
- [ ] Split calibration help content by mode while keeping the current bottom-sheet format and illustration card layout unchanged.
- [ ] Use `assets/calibrate_customized.jpg` for `Custom layout` help and keep the existing default help image for `Default layout`.
- [ ] Add runtime-only custom calibration session state for one-shot versus two-shot screenshot entry without persisting raw screenshots after save.
- [ ] Validate the second custom screenshot as same-width portrait input before allowing overlap alignment.
- [ ] Add a manual overlap-alignment step with a draggable vertical handle for the optional second screenshot.
- [ ] Render custom calibration against one merged coordinate space whether the user imported one screenshot or two.
- [ ] Keep the existing per-panel custom calibration, review, and save rules unchanged after the new alignment pre-step.
- [ ] Update `README.md` and `CALIBRATION_PLAN.md` to describe the navigation fix, mode-specific help, and maximum-two-screenshot custom flow.
- [ ] Run `npm run lint` and `npm test -- --runInBand`, then manually verify navigation, default help, custom help, one-shot custom calibration, and two-shot custom calibration.

## Execution Order

1. Navigation root cleanup
2. Mode-specific help content
3. Two-shot session model and validation
4. Overlap aligner and merged custom canvas
5. Docs and verification
