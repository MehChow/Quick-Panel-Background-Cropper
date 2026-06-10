export function clampBottomOffsetYWorklet(
  offsetY: number,
  topScreenshotHeight: number,
) {
  "worklet";
  return Math.max(0, Math.min(topScreenshotHeight, offsetY));
}
