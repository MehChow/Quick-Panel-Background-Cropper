import type { PanelDefinition, PanelId, PanelRect } from "./types";

interface QuickStarRatio {
  width: number;
  height: number;
  value: number;
}

export const customLayoutPresetId = "custom-layout-calibrated";

const defineRatio = (width: number, height: number): QuickStarRatio => ({
  width,
  height,
  value: width / height,
});

const buttonBoxRatios = [
  defineRatio(1, 1),
  defineRatio(2, 1),
  defineRatio(3, 1),
  defineRatio(4, 1),
  defineRatio(1, 2),
  defineRatio(3, 2),
  defineRatio(1, 3),
  defineRatio(2, 3),
  defineRatio(4, 3),
];
const brightnessRatios = [
  defineRatio(1, 1),
  defineRatio(1, 2),
  defineRatio(1, 3),
  defineRatio(1, 4),
  defineRatio(2, 1),
  defineRatio(2, 3),
  defineRatio(3, 1),
  defineRatio(3, 2),
  defineRatio(3, 4),
  defineRatio(4, 1),
  defineRatio(4, 3),
];
const mediaPlayerRatios = [
  defineRatio(1, 1),
  defineRatio(1, 2),
  defineRatio(2, 3),
  defineRatio(3, 4),
  defineRatio(2, 1),
  defineRatio(3, 1),
  defineRatio(3, 2),
  defineRatio(4, 1),
  defineRatio(4, 3),
];

const supportedRatiosByPanel: Record<PanelId, QuickStarRatio[]> = {
  brightness: brightnessRatios,
  buttonBox: buttonBoxRatios,
  mediaPlayer: mediaPlayerRatios,
  volume: brightnessRatios,
};

export function usesQuickStarCropModel(presetId: string) {
  return presetId === customLayoutPresetId;
}

export function getNearestQuickStarRatio(
  panelId: PanelId,
  aspectRatio: number,
): QuickStarRatio {
  return supportedRatiosByPanel[panelId].reduce((closest, candidate) =>
    Math.abs(candidate.value - aspectRatio) <
    Math.abs(closest.value - aspectRatio)
      ? candidate
      : closest,
  );
}

export function getEnclosingSquareRect(rect: PanelRect): PanelRect {
  const side = Math.max(rect.width, rect.height);
  return getCenteredRect(rect, side, side, 0);
}

export function getSnappedPanelRect(panel: PanelDefinition): PanelRect {
  const square = getEnclosingSquareRect(panel.rect);
  const ratio = getNearestQuickStarRatio(
    panel.id,
    panel.rect.width / panel.rect.height,
  ).value;

  return ratio >= 1
    ? getCenteredRect(square, square.width, square.height / ratio, panel.rect.radius)
    : getCenteredRect(square, square.width * ratio, square.height, panel.rect.radius);
}

function getCenteredRect(
  rect: PanelRect,
  width: number,
  height: number,
  radius: number,
): PanelRect {
  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;

  return {
    x: centerX - width / 2,
    y: centerY - height / 2,
    width,
    height,
    radius,
  };
}
