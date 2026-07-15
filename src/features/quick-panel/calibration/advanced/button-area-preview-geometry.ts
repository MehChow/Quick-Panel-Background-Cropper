import type { PanelRect, PickedImage } from "../../model/types";

export interface ButtonAreaPreviewSize {
  height: number;
  scale: number;
  width: number;
}

export function clampButtonAreaPreviewRect(
  rect: PanelRect,
  screenshot: PickedImage,
): PanelRect {
  const left = clamp(rect.x, 0, screenshot.width);
  const top = clamp(rect.y, 0, screenshot.height);
  const right = clamp(rect.x + Math.max(rect.width, 0), 0, screenshot.width);
  const bottom = clamp(rect.y + Math.max(rect.height, 0), 0, screenshot.height);

  return {
    x: left,
    y: top,
    width: Math.max(right - left, 0),
    height: Math.max(bottom - top, 0),
    radius: 0,
  };
}

export function fitButtonAreaPreview(
  crop: PanelRect,
  maxWidth: number,
  maxHeight: number,
): ButtonAreaPreviewSize {
  if (crop.width <= 0 || crop.height <= 0 || maxWidth <= 0 || maxHeight <= 0) {
    return { height: 0, scale: 0, width: 0 };
  }

  const scale = Math.min(maxWidth / crop.width, maxHeight / crop.height);
  return {
    height: crop.height * scale,
    scale,
    width: crop.width * scale,
  };
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}
