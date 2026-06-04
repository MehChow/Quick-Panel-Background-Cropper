# Quick Panel Background Cropper

Create Samsung Good Lock Quick Panel background PNGs from a single image.

## What it does

This app helps you turn one wallpaper or photo into the square panel images used by Samsung Good Lock's Quick Panel customization.

It includes:

- Default and Advanced layout customization modes
- one-time Quick Panel calibration using a screenshot
- live preview for Button box, Brightness, Volume, and Media player
- pan and zoom adjustment before export
- PNG export in the same order you need to apply them in Good Lock

## Target devices

This app is only intended for:

- Samsung phones
- Android 16
- One UI 8.5
- mainly Galaxy S series and A series slab phones

Not intended for:

- Fold, Flip, or tablets
- DeX or external-display layouts
- older or different One UI versions

## User flow

1. Press **Start customizing** and choose Default or Advanced mode.
2. Calibrate the layout with a fully expanded Quick Panel screenshot.
3. Choose one image from your album.
4. Pan and zoom it in the preview.
5. Export the PNGs.
6. Apply them in Good Lock in the shown order.

## How calibration works

Default mode adapts a Galaxy S25+ reference layout using one outer rectangle.
Advanced mode lets you mark the outer area and adjust each of the four panel
boxes independently.

The full calibration logic and assumptions are documented in [CALIBRATION_PLAN.md](/D:/quick-panel-crop-exporter/CALIBRATION_PLAN.md).

## Screenshots

<div style="display: flex; gap: 10px; flex-wrap: nowrap;">
  <img src="./assets/screenshots/landing.jpeg" alt="Landing" width="200">
  <img src="./assets/screenshots/calibrate.jpeg" alt="Calibrate" width="200">
  <img src="./assets/screenshots/customize.jpeg" alt="Customize" width="200">
  <img src="./assets/screenshots/exported.jpeg" alt="Exported" width="200">
</div>

## Notes

- Use a fully expanded Quick Panel screenshot when calibrating.
- Use Advanced mode when the four supported panels have been rearranged or resized.
- Good Lock availability depends on Samsung support in your region and device setup.

## Development

```bash
npm install
npx expo run:android
```
