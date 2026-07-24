import type { PanelRect } from "../../model/types";
import type { HandlePosition } from "../shared/calibration-rect";
import { getResizeEdges } from "./advanced-resize-edges";

export function clampPanelRect(rect: PanelRect, outer: PanelRect): PanelRect {
  "worklet";
  const minSize = Math.min(outer.width, outer.height) * 0.05;
  const width = Math.max(minSize, Math.min(outer.width, rect.width));
  const height = Math.max(minSize, Math.min(outer.height, rect.height));

  return {
    x: Math.max(outer.x, Math.min(outer.x + outer.width - width, rect.x)),
    y: Math.max(outer.y, Math.min(outer.y + outer.height - height, rect.y)),
    width,
    height,
    radius: 0,
  };
}

export function clampResizedPanelRect(
  rect: PanelRect,
  outer: PanelRect,
  position: HandlePosition,
): PanelRect {
  "worklet";
  const minSize = Math.min(outer.width, outer.height) * 0.05;
  const edges = getResizeEdges(position);
  let left = rect.x;
  let top = rect.y;
  let right = rect.x + rect.width;
  let bottom = rect.y + rect.height;
  const outerRight = outer.x + outer.width;
  const outerBottom = outer.y + outer.height;

  if (edges.includes("left")) {
    left = Math.max(outer.x, Math.min(left, right - minSize));
  } else if (edges.includes("right")) {
    right = Math.min(outerRight, Math.max(right, left + minSize));
  }

  if (edges.includes("top")) {
    top = Math.max(outer.y, Math.min(top, bottom - minSize));
  } else if (edges.includes("bottom")) {
    bottom = Math.min(outerBottom, Math.max(bottom, top + minSize));
  }

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
    radius: 0,
  };
}
