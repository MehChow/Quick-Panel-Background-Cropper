# Production manual acceptance

Use current [product behavior](product-behavior.md) and
[architecture](architecture.md), not an old release's checklist. Record results
for the exact APK/AAB and package tested. Do not treat blank items as passes.

## Test record

- Version / versionCode / commit:
- Artifact SHA-256 / Play track:
- Package (production, .dev or .apk):
- Device / Android / One UI / QuickStar versions:
- Tester / date / result / remaining issues:

## Upgrade and startup

- [ ] Upgrade an existing installation without clearing data. Keep all valid
  calibrations, last successful choices, help state, intensity and appearance.
- [ ] Check legacy identifier visibility and saved custom icons where fixtures
  are available. No new recalibration requirement is introduced by a UI change.
- [ ] Active announcement appears once and acknowledgement survives relaunch.
- [ ] Clean install opens normally and resolves English, Traditional Chinese
  and Spanish device locales; unsupported locales fall back to English.

## Four paths

Run Default, Advanced Controls, Advanced Buttons, and Advanced Combined from
import through Result and QuickStar. Repeat entry using saved calibration.

- [ ] Default: outer rectangle scales the preset Controls correctly.
- [ ] Controls: disable missing panels; edit only enabled panels in guided order.
- [ ] Buttons: search localized/canonical labels, choose built-in and custom
  labels, use both preset and generic icon tabs, and preserve selection order.
- [ ] Combined: require a Control and Button, edit Controls then Buttons, and
  maintain one continuous background across both families.
- [ ] Each path retains independent calibration and Advanced grid counts.
- [ ] Reimport/recalibrate, back navigation and leave confirmation work.

## Calibration and gestures

- [ ] Grid axes accept 1 through 8, including single-row/column layouts.
- [ ] Low/Balanced/Strong snapping and haptics work at different canvas sizes.
- [ ] Move/resize stays within the outer area; completed boxes stay fixed.
- [ ] Overlap may occur during editing but blocks Next/save as appropriate.
- [ ] Rapid move/resize followed by Next cannot lose or misapply the final box.
- [ ] Back/Next and gesture cancellation cannot commit to the wrong panel.

## Images and appearance

- [ ] Small, large, rotated/mirrored and transparent inputs render correctly;
  large images use silent working-source preparation in every path.
- [ ] Cancel, failure, rapid repeated import and navigation preserve the prior
  selection and do not install a stale result.
- [ ] Pan/pinch and pointer lift preserve image position without blank areas.
- [ ] Both/Icon/None and horizontal/vertical position behave for square, long
  and multi-cell Buttons. None disables irrelevant appearance controls.
- [ ] Buttons-only and Combined share identifiers but keep separate intensity.
- [ ] Appearance Confirm persists; Cancel/backdrop/Back discards the draft.
- [ ] Full-layout preview returns to the same hue/brightness/alpha and tab,
  including hue at zero brightness. Android Back first closes full preview.
- [ ] Picker dragging does not accidentally scroll the modal.

## Export and recovery

- [ ] PNGs are 1024 square; QuickStar's centered clip matches preview alignment.
- [ ] Controls follow Good Lock order; Buttons follow selection order; Combined
  has one contiguous Controls-then-Buttons filename sequence.
- [ ] First export and immediate export after identifier changes wait for image
  and label readiness. No black tiles, clipped labels or stale appearance.
- [ ] Capture failure prevents a partial Result and cleans temporary captures.
- [ ] Permission denial/save failure reports an error. Check gallery behavior
  separately: media writes are not rolled back if a later write fails.
- [ ] Result images remain usable until leaving; opening Good Lock works or
  presents the unavailable-app fallback.
- [ ] Repeated imports/exports and cold restart clean only owned cache files;
  gallery exports and unrelated files remain intact.

## Layout and accessibility

- [ ] All changed screens and help sheets fit short phones and Fold widths.
- [ ] All three locales avoid clipping; keyboard entry leaves actions reachable.
- [ ] Touch targets, accessibility labels/states, disabled controls, Android
  Back, safe areas and reduced-motion behavior remain usable.
- [ ] Compare preview/export with QuickStar using a high-contrast alignment
  fixture and enough Buttons to expose panel-count-related performance issues.

A crash, data loss, blocked flow, invalid calibration or preview/export mismatch
blocks release. Record native performance observations separately from automated
checks; preserve results with the release record rather than duplicating this
checklist as another current specification.
