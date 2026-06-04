import type { PanelRect } from "../model/types";

export function clampPanelRect(rect: PanelRect, outer: PanelRect): PanelRect {
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
