import {
  arePanelsValid,
  scalePanelsToOuter,
} from "../calibration/advanced/advanced-geometry";
import type {
  AdvancedCalibration,
  AdvancedCalibrationDraft,
  AdvancedSnapGrid,
  PanelId,
  PanelRect,
  PickedImage,
} from "../model/types";
import { panelIds } from "../model/panel-ids";

export function createAdvancedDraft(
  screenshot: PickedImage,
  suggestedOuter: PanelRect,
  saved: AdvancedCalibration | null,
): AdvancedCalibrationDraft {
  if (!saved) {
    return {
      screenshot,
      outerRect: suggestedOuter,
      enabledPanels: panelIds,
      panels: null,
    };
  }
  const outerRect = scaleRect(
    saved.outerRect,
    screenshot.width / saved.screenshotWidth,
    screenshot.height / saved.screenshotHeight,
  );
  return {
    screenshot,
    outerRect,
    enabledPanels: sanitizeEnabledPanels(saved.enabledPanels),
    panels: scalePanelsToOuter(saved.panels, saved.outerRect, outerRect),
  };
}

export function getCalibrationFromDraft(
  draft: AdvancedCalibrationDraft | null,
  grid: AdvancedSnapGrid,
): AdvancedCalibration | null {
  if (
    !draft?.screenshot ||
    !draft.outerRect ||
    !draft.panels ||
    !arePanelsValid(draft.panels, draft.outerRect, draft.enabledPanels)
  ) {
    return null;
  }
  return {
    screenshotWidth: draft.screenshot.width,
    screenshotHeight: draft.screenshot.height,
    grid,
    outerRect: draft.outerRect,
    enabledPanels: draft.enabledPanels,
    panels: draft.panels,
  };
}

export function sanitizeEnabledPanels(panels: PanelId[] | undefined): PanelId[] {
  const uniquePanels = panels?.filter((id, index) =>
    panelIds.includes(id) && panels.indexOf(id) === index
  ) ?? [];

  return uniquePanels.length > 0
    ? panelIds.filter((id) => uniquePanels.includes(id))
    : panelIds;
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
