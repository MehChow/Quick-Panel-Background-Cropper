import { getImagePlacementBounds, getPanelUnion } from "../model/panel-geometry";
import type { PanelRect, QuickPanelPreset } from "../model/types";
import type { ViewStyle } from "react-native";

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

export function getPreviewPanelFrameStyle(
  rect: PanelRect,
  layoutScale: number,
  originX: number,
  originY: number,
): ViewStyle {
  return {
    borderRadius: getPreviewPanelRadius(rect, layoutScale),
    height: rect.height * layoutScale,
    left: (rect.x - originX) * layoutScale,
    position: "absolute",
    top: (rect.y - originY) * layoutScale,
    width: rect.width * layoutScale,
  };
}
