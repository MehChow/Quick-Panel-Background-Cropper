import type { PanelRect, PickedImage } from "./types";

export type HandlePosition =
  | "top"
  | "topLeft"
  | "topRight"
  | "right"
  | "bottom"
  | "bottomLeft"
  | "bottomRight"
  | "left";

export function clampRect(rect: PanelRect, screenshot: PickedImage): PanelRect {
  const minSize = Math.min(screenshot.width, screenshot.height) * 0.1;
  const width = Math.max(minSize, Math.min(screenshot.width, rect.width));
  const height = Math.max(minSize, Math.min(screenshot.height, rect.height));

  return {
    x: Math.max(0, Math.min(screenshot.width - width, rect.x)),
    y: Math.max(0, Math.min(screenshot.height - height, rect.y)),
    width,
    height,
    radius: 0,
  };
}

export function resizeRect(
  rect: PanelRect,
  position: HandlePosition,
  dx: number,
  dy: number
): PanelRect {
  if (position === "top") {
    return { ...rect, y: rect.y + dy, height: rect.height - dy };
  }
  if (position === "topLeft") {
    return {
      ...rect,
      x: rect.x + dx,
      y: rect.y + dy,
      width: rect.width - dx,
      height: rect.height - dy,
    };
  }
  if (position === "topRight") {
    return {
      ...rect,
      y: rect.y + dy,
      width: rect.width + dx,
      height: rect.height - dy,
    };
  }
  if (position === "right") {
    return { ...rect, width: rect.width + dx };
  }
  if (position === "bottom") {
    return { ...rect, height: rect.height + dy };
  }
  if (position === "bottomLeft") {
    return {
      ...rect,
      x: rect.x + dx,
      width: rect.width - dx,
      height: rect.height + dy,
    };
  }
  if (position === "left") {
    return { ...rect, x: rect.x + dx, width: rect.width - dx };
  }
  return { ...rect, width: rect.width + dx, height: rect.height + dy };
}
