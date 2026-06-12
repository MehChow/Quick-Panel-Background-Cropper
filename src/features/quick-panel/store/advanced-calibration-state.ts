import {
  arePanelsValid,
  scalePanelsToOuter,
} from "../calibration/advanced/advanced-geometry";
import type {
  AdvancedCalibration,
  AdvancedCalibrationDraft,
  PanelRect,
  PickedImage,
} from "../model/types";

export function createAdvancedDraft(
  screenshot: PickedImage,
  suggestedOuter: PanelRect,
  saved: AdvancedCalibration | null,
): AdvancedCalibrationDraft {
  if (!saved) {
    return { screenshot, outerRect: suggestedOuter, panels: null };
  }
  const outerRect = scaleRect(
    saved.outerRect,
    screenshot.width / saved.screenshotWidth,
    screenshot.height / saved.screenshotHeight,
  );
  return {
    screenshot,
    outerRect,
    panels: scalePanelsToOuter(saved.panels, saved.outerRect, outerRect),
  };
}

export function getCalibrationFromDraft(
  draft: AdvancedCalibrationDraft | null,
): AdvancedCalibration | null {
  if (
    !draft?.screenshot ||
    !draft.outerRect ||
    !draft.panels ||
    !arePanelsValid(draft.panels, draft.outerRect)
  ) {
    return null;
  }
  return {
    screenshotWidth: draft.screenshot.width,
    screenshotHeight: draft.screenshot.height,
    outerRect: draft.outerRect,
    panels: draft.panels,
  };
}

function scaleRect(rect: PanelRect, scaleX: number, scaleY: number): PanelRect {
  return {
    x: rect.x * scaleX,
    y: rect.y * scaleY,
    width: rect.width * scaleX,
    height: rect.height * scaleY,
    radius: rect.radius * Math.min(scaleX, scaleY),
  };
}
