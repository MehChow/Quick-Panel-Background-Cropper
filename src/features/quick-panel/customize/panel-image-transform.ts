import type { ImageTransform } from "../model/types";

export interface PanelImageTransformInput {
  panelX: number;
  panelY: number;
  previewScale: number;
  transform: ImageTransform;
}

export interface PanelImageTransformResult {
  scale: number;
  translateX: number;
  translateY: number;
}

export function getPanelImageTransform({
  panelX,
  panelY,
  previewScale,
  transform,
}: PanelImageTransformInput): PanelImageTransformResult {
  "worklet";
  return {
    scale: transform.scale * previewScale,
    translateX: (transform.x - panelX) * previewScale,
    translateY: (transform.y - panelY) * previewScale,
  };
}
