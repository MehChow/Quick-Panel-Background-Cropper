import { s25PlusOneUi85Preset } from "../../model/preset";
import {
  getPanelUnion,
  scalePresetToUnion,
} from "../../model/panel-geometry";
import type {
  PanelRect,
  PickedImage,
  QuickPanelPreset,
} from "../../model/types";

const defaultHorizontalMarginRatio = 0.045;
const defaultVerticalMarginRatio = 0.045;
const defaultTopRatio = 0.235;

export function getSuggestedCalibrationRect(
  screenshot: PickedImage,
): PanelRect {
  const baseUnion = getPanelUnion(s25PlusOneUi85Preset);
  const aspectRatio = baseUnion.height / baseUnion.width;
  const horizontalInset = screenshot.width * defaultHorizontalMarginRatio;
  const verticalInset = screenshot.height * defaultVerticalMarginRatio;
  const maxWidth = Math.max(screenshot.width - horizontalInset * 2, 0);
  const maxHeight = Math.max(screenshot.height - verticalInset * 2, 0);
  const width = Math.min(maxWidth, maxHeight / aspectRatio);
  const height = width * aspectRatio;
  const preferredY = screenshot.height * defaultTopRatio;
  const maxY = screenshot.height - verticalInset - height;
  const y = Math.min(Math.max(verticalInset, preferredY), maxY);

  return {
    x: Math.max(horizontalInset, (screenshot.width - width) / 2),
    y,
    width,
    height,
    radius: 0,
  };
}

export function getCalibratedPreset(rect: PanelRect): QuickPanelPreset {
  return scalePresetToUnion(s25PlusOneUi85Preset, rect);
}
