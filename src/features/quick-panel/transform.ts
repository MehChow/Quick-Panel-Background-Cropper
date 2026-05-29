import { s25PlusOneUi85Preset } from "./preset";
import type { ImageTransform, PanelDefinition, PanelRect, PickedImage } from "./types";

export const exportSidePixels = 2048;

export function getPanelUnion(): PanelRect {
  const rects = s25PlusOneUi85Preset.visualOrder.map(
    (id) => s25PlusOneUi85Preset.panels[id].rect
  );
  const left = Math.min(...rects.map((rect) => rect.x));
  const top = Math.min(...rects.map((rect) => rect.y));
  const right = Math.max(...rects.map((rect) => rect.x + rect.width));
  const bottom = Math.max(...rects.map((rect) => rect.y + rect.height));

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
    radius: 0,
  };
}

export function getCoverScale(image: PickedImage) {
  const panelUnion = getImageBounds();
  return Math.max(
    panelUnion.width / image.width,
    panelUnion.height / image.height
  );
}

export function getFitTransform(image: PickedImage): ImageTransform {
  const panelUnion = getPanelUnion();
  const scale = getCoverScale(image);
  return {
    scale,
    x: panelUnion.x + (panelUnion.width - image.width * scale) / 2,
    y: panelUnion.y + (panelUnion.height - image.height * scale) / 2,
  };
}

export function clampTransform(
  transform: ImageTransform,
  image: PickedImage
): ImageTransform {
  const panelUnion = getImageBounds();
  const minScale = getCoverScale(image);
  const scale = Math.max(minScale, Math.min(minScale * 8, transform.scale));
  const width = image.width * scale;
  const height = image.height * scale;

  return {
    scale,
    x: clampAxis(transform.x, width, panelUnion.x, panelUnion.width),
    y: clampAxis(transform.y, height, panelUnion.y, panelUnion.height),
  };
}

export function getExportSquareRect(panel: PanelDefinition): PanelRect {
  return {
    x: panel.rect.x,
    y: panel.rect.y + (panel.rect.height - panel.rect.width) / 2,
    width: panel.rect.width,
    height: panel.rect.width,
    radius: 0,
  };
}

export function getImageBounds(): PanelRect {
  const rects = s25PlusOneUi85Preset.visualOrder.map((id) =>
    getExportSquareRect(s25PlusOneUi85Preset.panels[id])
  );
  const left = Math.min(...rects.map((rect) => rect.x));
  const top = Math.min(...rects.map((rect) => rect.y));
  const right = Math.max(...rects.map((rect) => rect.x + rect.width));
  const bottom = Math.max(...rects.map((rect) => rect.y + rect.height));

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
    radius: 0,
  };
}

function clampAxis(
  value: number,
  contentSize: number,
  frameStart: number,
  frameSize: number
) {
  const min = frameStart + frameSize - contentSize;
  const max = frameStart;

  if (contentSize <= frameSize) {
    return frameStart + (frameSize - contentSize) / 2;
  }

  return Math.max(min, Math.min(max, value));
}
