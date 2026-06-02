import type {
  ImageTransform,
  PanelDefinition,
  PanelRect,
  PickedImage,
  QuickPanelPreset,
} from "./types";
import { translate } from "./i18n";

export const exportSidePixels = 2048;

export function getPanelUnion(preset: QuickPanelPreset): PanelRect {
  const rects = preset.visualOrder.map((id) => preset.panels[id].rect);
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

export function getCoverScale(image: PickedImage, preset: QuickPanelPreset) {
  const panelUnion = getImageBounds(preset);
  return Math.max(
    panelUnion.width / image.width,
    panelUnion.height / image.height
  );
}

export function getFitTransform(
  image: PickedImage,
  preset: QuickPanelPreset
): ImageTransform {
  const panelUnion = getPanelUnion(preset);
  const scale = getCoverScale(image, preset);
  return {
    scale,
    x: panelUnion.x + (panelUnion.width - image.width * scale) / 2,
    y: panelUnion.y + (panelUnion.height - image.height * scale) / 2,
  };
}

export function clampTransform(
  transform: ImageTransform,
  image: PickedImage,
  preset: QuickPanelPreset
): ImageTransform {
  const panelUnion = getImageBounds(preset);
  const minScale = getCoverScale(image, preset);
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

export function getImageBounds(preset: QuickPanelPreset): PanelRect {
  const rects = preset.visualOrder.map((id) => getExportSquareRect(preset.panels[id]));
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

export function scalePresetToUnion(
  basePreset: QuickPanelPreset,
  targetUnion: PanelRect
): QuickPanelPreset {
  const baseUnion = getPanelUnion(basePreset);
  const scaleX = targetUnion.width / baseUnion.width;
  const scaleY = targetUnion.height / baseUnion.height;
  const panels = { ...basePreset.panels };

  for (const id of basePreset.visualOrder) {
    const panel = basePreset.panels[id];
    panels[id] = {
      ...panel,
      rect: {
        x: targetUnion.x + (panel.rect.x - baseUnion.x) * scaleX,
        y: targetUnion.y + (panel.rect.y - baseUnion.y) * scaleY,
        width: panel.rect.width * scaleX,
        height: panel.rect.height * scaleY,
        radius: panel.rect.radius * Math.min(scaleX, scaleY),
      },
    };
  }

  return {
    ...basePreset,
    id: `${basePreset.id}-calibrated`,
    label: translate("preset.calibratedLabel", { label: basePreset.label }),
    width: targetUnion.x * 2 + targetUnion.width,
    height: targetUnion.y + targetUnion.height,
    panels,
  };
}
