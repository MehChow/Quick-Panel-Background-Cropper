export function clampBottomCropTopYWorklet(
  cropTopY: number,
  screenshotHeight: number,
) {
  "worklet";
  const maxTrim = Math.min(screenshotHeight * 0.2, 240);
  return Math.max(0, Math.min(maxTrim, cropTopY));
}

export function clampBottomOffsetYWorklet(
  offsetY: number,
  topScreenshotHeight: number,
) {
  "worklet";
  return Math.max(0, Math.min(topScreenshotHeight, offsetY));
}
