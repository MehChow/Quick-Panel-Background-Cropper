import type { PanelRect } from "../model/types";

interface PreviewViewportSizeParams {
  containerWidth: number;
  maxHeight: number;
  panelUnion: PanelRect;
}

export function getPreviewViewportSize({
  containerWidth,
  maxHeight,
  panelUnion,
}: PreviewViewportSizeParams) {
  const heightAtFullWidth = containerWidth * (panelUnion.height / panelUnion.width);

  if (heightAtFullWidth <= maxHeight) {
    return {
      height: heightAtFullWidth,
      width: containerWidth,
    };
  }

  return {
    height: maxHeight,
    width: maxHeight * (panelUnion.width / panelUnion.height),
  };
}
