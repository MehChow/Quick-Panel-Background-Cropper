import { s25PlusOneUi85Preset } from "./preset";
import { getPanelUnion, scalePresetToUnion } from "./transform";
import type { PanelRect, PickedImage, QuickPanelPreset } from "./types";

const defaultHorizontalMarginRatio = 0.045;
const defaultTopRatio = 0.235;

export function getSuggestedCalibrationRect(screenshot: PickedImage): PanelRect {
  const baseUnion = getPanelUnion(s25PlusOneUi85Preset);
  const width = screenshot.width * (1 - defaultHorizontalMarginRatio * 2);
  const height = width * (baseUnion.height / baseUnion.width);
  const y = Math.min(
    screenshot.height - height,
    screenshot.height * defaultTopRatio
  );

  return {
    x: (screenshot.width - width) / 2,
    y: Math.max(0, y),
    width,
    height,
    radius: 0,
  };
}

export function getCalibratedPreset(rect: PanelRect): QuickPanelPreset {
  return scalePresetToUnion(s25PlusOneUi85Preset, rect);
}
