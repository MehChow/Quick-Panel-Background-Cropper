# Quick Panel Background Cropper

Create Samsung Good Lock Quick Panel background PNGs from a single image.

## What it does

This app helps you turn one wallpaper or photo into the square panel images used by Samsung Good Lock's Quick Panel customization.

It includes:

- one-time Quick Panel calibration using a screenshot
- live preview for Button box, Brightness, Volume, and Media player
- pan and zoom adjustment before export
- PNG export in the same order you need to apply them in Good Lock

## Target devices

This app is only intended for:

- Samsung phones
- Android 16
- One UI 8.5
- default Quick Panel layout
- mainly Galaxy S series and A series slab phones

Not intended for:

- Fold, Flip, or tablets
- DeX or external-display layouts
- heavily customized Quick Panel layouts
- older or different One UI versions

## User flow

1. Import a fully expanded Quick Panel screenshot.
2. Adjust the green calibration box around the whole customizable panel stack.
3. Save calibration.
4. Choose one image from your album.
5. Pan and zoom it in the preview.
6. Export the PNGs.
7. Apply them in Good Lock in the shown order.

## How calibration works

The app uses a Galaxy S25+ on One UI 8.5 as the base reference layout, then adapts that layout to your phone using your screenshot.

This works best because the supported phones are expected to have a very similar Quick Panel structure. The full calibration logic and assumptions are documented in [CALIBRATION_PLAN.md](/D:/quick-panel-crop-exporter/CALIBRATION_PLAN.md).

## Screenshots

<img src="./assets/screenshots/landing.jpeg" alt="Landing" width="200">
<img src="./assets/screenshots/calibrate.jpeg" alt="Landing" width="200">
<img src="./assets/screenshots/customize.jpeg" alt="Landing" width="200">
<img src="./assets/screenshots/exported.jpeg" alt="Landing" width="200">

## Notes

- Use a fully expanded Quick Panel screenshot when calibrating.
- Keep the default Quick Panel layout for best results.
- Good Lock availability depends on Samsung support in your region and device setup.

## Development

```bash
npm install
npx expo run:android
```
