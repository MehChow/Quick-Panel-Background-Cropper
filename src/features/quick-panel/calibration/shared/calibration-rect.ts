import type { PanelRect, PickedImage } from "../../model/types";

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

export function clampResizedRect(
  rect: PanelRect,
  screenshot: PickedImage,
  position: HandlePosition,
): PanelRect {
  const minSize = Math.min(screenshot.width, screenshot.height) * 0.1;
  let left = rect.x;
  let top = rect.y;
  let right = rect.x + rect.width;
  let bottom = rect.y + rect.height;

  if (position === "left" || position === "topLeft" || position === "bottomLeft") {
    left = Math.max(0, Math.min(left, right - minSize));
  } else if (
    position === "right" ||
    position === "topRight" ||
    position === "bottomRight"
  ) {
    right = Math.min(screenshot.width, Math.max(right, left + minSize));
  }

  if (position === "top" || position === "topLeft" || position === "topRight") {
    top = Math.max(0, Math.min(top, bottom - minSize));
  } else if (
    position === "bottom" ||
    position === "bottomLeft" ||
    position === "bottomRight"
  ) {
    bottom = Math.min(screenshot.height, Math.max(bottom, top + minSize));
  }

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
    radius: 0,
  };
}

export function resizeRect(
  rect: PanelRect,
  position: HandlePosition,
  dx: number,
  dy: number,
): PanelRect {
  "worklet";
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
