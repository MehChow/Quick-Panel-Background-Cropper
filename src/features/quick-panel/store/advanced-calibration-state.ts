import {
  arePanelsValid,
  scaleControlPanelsToOuter,
} from "../calibration/advanced/advanced-geometry";
import type {
  AdvancedCalibration,
  AdvancedButtonsCalibration,
  AdvancedButtonsDraft,
  AdvancedCalibrationDraft,
  AdvancedSnapGrid,
  ControlPanelId,
  PanelRect,
  PickedImage,
} from "../model/types";
import { panelIds } from "../model/panel-ids";
import { areButtonsValid } from "../calibration/advanced/buttons-geometry";

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
    panels: scaleControlPanelsToOuter(saved.panels, saved.outerRect, outerRect),
  };
}

export function getCalibrationFromDraft(
  draft: AdvancedCalibrationDraft | null,
  grid: AdvancedSnapGrid,
  isGridEnabled: boolean,
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
    isGridEnabled,
    outerRect: draft.outerRect,
    enabledPanels: draft.enabledPanels,
    panels: draft.panels,
  };
}

export function createAdvancedButtonsDraft(
  screenshot: PickedImage,
  suggestedOuter: PanelRect,
  saved: AdvancedButtonsCalibration | null,
): AdvancedButtonsDraft {
  if (!saved) {
    return {
      screenshot,
      outerRect: suggestedOuter,
      buttons: [],
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
    buttons: saved.buttons.map((button) => ({
      ...button,
      rect: scaleRect(button.rect, screenshot.width / saved.screenshotWidth, screenshot.height / saved.screenshotHeight),
    })),
  };
}

export function getButtonsCalibrationFromDraft(
  draft: AdvancedButtonsDraft | null,
  grid: AdvancedSnapGrid,
  isGridEnabled: boolean,
): AdvancedButtonsCalibration | null {
  if (
    !draft?.screenshot ||
    !draft.outerRect ||
    !areButtonsValid(draft.buttons, draft.outerRect)
  ) {
    return null;
  }
  return {
    screenshotWidth: draft.screenshot.width,
    screenshotHeight: draft.screenshot.height,
    grid,
    isGridEnabled,
    outerRect: draft.outerRect,
    buttons: draft.buttons,
  };
}

export function sanitizeEnabledPanels(panels: ControlPanelId[] | undefined): ControlPanelId[] {
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
