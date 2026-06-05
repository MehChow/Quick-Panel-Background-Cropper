import { translate } from "./i18n";
import {
  getEnclosingSquareRect,
  usesQuickStarCropModel,
} from "./quickstar-crop";
import type { PanelDefinition, PanelRect, QuickPanelPreset } from "./types";

export const exportSidePixels = 1024;

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

function getWidthBasedExportSquareRect(panel: PanelDefinition): PanelRect {
  return {
    x: panel.rect.x,
    y: panel.rect.y + (panel.rect.height - panel.rect.width) / 2,
    width: panel.rect.width,
    height: panel.rect.width,
    radius: 0,
  };
}

export function getExportSquareRect(
  panel: PanelDefinition,
  presetId: string,
): PanelRect {
  return usesQuickStarCropModel(presetId)
    ? getEnclosingSquareRect(panel.rect)
    : getWidthBasedExportSquareRect(panel);
}

export function getImageBounds(preset: QuickPanelPreset): PanelRect {
  const rects = preset.visualOrder.map((id) =>
    getExportSquareRect(preset.panels[id], preset.id),
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

export function scalePresetToUnion(
  basePreset: QuickPanelPreset,
  targetUnion: PanelRect,
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
