# Custom Layout Preview And Calibration Persistence Tasks

Author: Codex, GPT-5
Date: 2026-06-05
Status: Ready for execution

## Minimal Tasks

- [ ] Change calibration persistence from one global profile to one saved profile per mode plus a persisted selected mode.
- [ ] Migrate legacy calibration storage so existing users keep whichever saved mode they already had.
- [ ] Make landing-screen state, recalibration flow, and customize entry resolve against the currently selected mode.
- [ ] Add lightweight per-mode calibration status to the landing mode cards.
- [ ] Remove generic simulated control overlays from custom-layout preview only.
- [ ] Replace custom-layout preview's non-uniform X/Y image scaling with one uniform centered crop scale.
- [ ] Keep default-layout preview and default-layout calibration behavior unchanged.
- [ ] Update `README.md` and `CALIBRATION_PLAN.md` to describe the box-only custom preview and per-mode saved calibration behavior.
- [ ] Run `npm run lint` and `npm test -- --runInBand`, then manually validate both saved modes plus the custom `buttonBox` preview.
- [ ] Commit each completed implementation slice with focused messages.

## Execution Order

1. Per-mode persistence
2. Mode-driven landing and calibration state
3. Custom preview simplification and de-distortion
4. Docs and verification
