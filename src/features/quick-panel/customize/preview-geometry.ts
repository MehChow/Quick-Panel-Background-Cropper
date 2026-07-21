import { getImagePlacementBounds, getPanelUnion } from "../model/panel-geometry";
import type { PanelRect, QuickPanelPreset } from "../model/types";

const previewPanelRadius = 32;

export function getCustomizePreviewFrame(
  preset: QuickPanelPreset,
): PanelRect {
  return getImagePlacementBounds(preset);
}

export function getCustomizePreviewDisplayFrame(
  preset: QuickPanelPreset,
): PanelRect {
  return preset.visualOrder.length > 0
    ? getPanelUnion(preset)
    : getCustomizePreviewFrame(preset);
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
