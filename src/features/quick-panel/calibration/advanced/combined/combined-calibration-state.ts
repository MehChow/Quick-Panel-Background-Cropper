import {
  arePanelsValid,
  getInitialAdvancedPanels,
  scaleControlPanelsToOuter,
  scalePanelsToOuter,
} from "../advanced-geometry";
import { advancedPanelPhases } from "../advanced-steps";
import { getButtonPanelRects } from "../buttons-geometry";
import { getButtonLabel, getPanelLabel } from "../../../model/i18n";
import type {
  AdvancedCombinedCalibration,
  AdvancedCombinedDraft,
  AdvancedSnapGrid,
  EditablePanelItem,
  PanelRect,
  PanelRects,
  PickedImage,
} from "../../../model/types";
import { getCombinedPanelOrder } from "./combined-steps";

export function createAdvancedCombinedDraft(
  screenshot: PickedImage,
  suggestedOuter: PanelRect,
  saved: AdvancedCombinedCalibration | null,
): AdvancedCombinedDraft {
  if (!saved) {
    return {
      screenshot,
      outerRect: suggestedOuter,
      enabledControls: [...advancedPanelPhases],
      controlPanels: null,
      buttons: [],
    };
  }

  const scaleX = screenshot.width / saved.screenshotWidth;
  const scaleY = screenshot.height / saved.screenshotHeight;
  const outerRect = scaleRect(saved.outerRect, scaleX, scaleY);
  const scaledButtons = scalePanelsToOuter(
    getButtonPanelRects(saved.buttons),
    saved.outerRect,
    outerRect,
  );

  return {
    screenshot,
    outerRect,
    enabledControls: [...saved.enabledControls],
    controlPanels: scaleControlPanelsToOuter(
      saved.controlPanels,
      saved.outerRect,
      outerRect,
    ),
    buttons: saved.buttons.map((button) => ({
      ...button,
      rect: { ...scaledButtons[button.id], radius: 0 },
    })),
  };
}

export function initializeCombinedControlPanels(
  draft: AdvancedCombinedDraft,
): AdvancedCombinedDraft {
  if (!draft.outerRect || draft.controlPanels) {
    return draft;
  }
  return {
    ...draft,
    controlPanels: getInitialAdvancedPanels(draft.outerRect),
  };
}

export function scaleCombinedDraftToOuter(
  draft: AdvancedCombinedDraft,
  outerRect: PanelRect,
): AdvancedCombinedDraft {
  if (!draft.outerRect) {
    return { ...draft, outerRect };
  }

  const buttons = scalePanelsToOuter(
    getButtonPanelRects(draft.buttons),
    draft.outerRect,
    outerRect,
  );
  return {
    ...draft,
    outerRect,
    controlPanels: draft.controlPanels
      ? scaleControlPanelsToOuter(draft.controlPanels, draft.outerRect, outerRect)
      : null,
    buttons: draft.buttons.map((button) => ({
      ...button,
      rect: { ...buttons[button.id], radius: 0 },
    })),
  };
}

export function getCombinedCalibrationFromDraft(
  draft: AdvancedCombinedDraft | null,
  grid: AdvancedSnapGrid,
): AdvancedCombinedCalibration | null {
  const panelRects = draft ? getCombinedPanelRects(draft) : null;
  if (
    !draft?.screenshot ||
    !draft.outerRect ||
    !draft.controlPanels ||
    !panelRects ||
    draft.enabledControls.length === 0 ||
    draft.buttons.length === 0
  ) {
    return null;
  }

  const panelOrder = getCombinedPanelOrder(draft.enabledControls, draft.buttons);
  if (!arePanelsValid(panelRects, draft.outerRect, panelOrder)) {
    return null;
  }

  return {
    screenshotWidth: draft.screenshot.width,
    screenshotHeight: draft.screenshot.height,
    grid,
    outerRect: draft.outerRect,
    enabledControls: [...draft.enabledControls],
    controlPanels: draft.controlPanels,
    buttons: draft.buttons.map((button) => ({
      ...button,
      rect: { ...button.rect, radius: 0 },
    })),
  };
}

export function getCombinedPanelItems(
  draft: AdvancedCombinedDraft,
): EditablePanelItem[] {
  if (!draft.controlPanels) {
    return [];
  }
  const controls = advancedPanelPhases
    .filter((id) => draft.enabledControls.includes(id))
    .map((id) => ({
      id,
      label: getPanelLabel(id),
      family: "control" as const,
    }));
  const buttons: EditablePanelItem[] = draft.buttons.map((button) => ({
    id: button.id,
    label: getButtonLabel(button.label),
    family: "button" as const,
  }));
  return [...controls, ...buttons];
}

export function getCombinedPanelRects(
  draft: AdvancedCombinedDraft,
): PanelRects | null {
  if (!draft.controlPanels) {
    return null;
  }
  const controlPanels = draft.controlPanels;
  const controls: [string, PanelRect][] = advancedPanelPhases
    .filter((id) => draft.enabledControls.includes(id))
    .map((id) => [id, controlPanels[id]]);
  const buttons = draft.buttons.map((button) => [button.id, button.rect] as const);
  return Object.fromEntries([...controls, ...buttons]);
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
