import { getImagePlacementBounds } from "../model/panel-geometry";
import type { PanelRect, QuickPanelPreset } from "../model/types";

const previewPanelRadius = 32;

export function getCustomizePreviewFrame(
  preset: QuickPanelPreset,
): PanelRect {
  return getImagePlacementBounds(preset);
}

export function getPreviewPanelRadius(
  rect: PanelRect,
  layoutScale: number,
) {
  return Math.min(
    previewPanelRadius,
    (rect.width * layoutScale) / 2,
    (rect.height * layoutScale) / 2,
  );
}

export function getSourceContextPanelRects(
  preset: QuickPanelPreset,
  layoutScale: number,
): PanelRect[] {
  return preset.visualOrder.map((id) => {
    const rect = preset.panels[id].rect;
    return {
      ...rect,
      radius: getPreviewPanelRadius(rect, layoutScale) / layoutScale,
    };
  });
}

export function getSourceContextDimPath(
  frame: PanelRect,
  panelRects: PanelRect[],
) {
  return [
    getRoundedRectPath({ ...frame, radius: 0 }),
    ...panelRects.map(getRoundedRectPath),
  ].join(" ");
}

export function getSourceContextImageOpacity(
  preset: QuickPanelPreset,
  buttonPanelOpacity: number,
) {
  const firstPanel = preset.visualOrder
    .map((id) => preset.panels[id])
    .find(Boolean);
  return firstPanel?.family === "button" ? buttonPanelOpacity : 0.5;
}

function getRoundedRectPath(rect: PanelRect) {
  const right = rect.x + rect.width;
  const bottom = rect.y + rect.height;
  const radius = Math.max(
    0,
    Math.min(rect.radius, rect.width / 2, rect.height / 2),
  );
  if (radius === 0) {
    return `M ${rect.x} ${rect.y} H ${right} V ${bottom} H ${rect.x} Z`;
  }
  return [
    `M ${rect.x + radius} ${rect.y}`,
    `H ${right - radius}`,
    `A ${radius} ${radius} 0 0 1 ${right} ${rect.y + radius}`,
    `V ${bottom - radius}`,
    `A ${radius} ${radius} 0 0 1 ${right - radius} ${bottom}`,
    `H ${rect.x + radius}`,
    `A ${radius} ${radius} 0 0 1 ${rect.x} ${bottom - radius}`,
    `V ${rect.y + radius}`,
    `A ${radius} ${radius} 0 0 1 ${rect.x + radius} ${rect.y}`,
    "Z",
  ].join(" ");
}
