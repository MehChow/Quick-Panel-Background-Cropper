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
