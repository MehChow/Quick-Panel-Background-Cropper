import { advancedPanelPhases } from "../advanced-steps";
import { arePanelsValid } from "../advanced-geometry";
import type {
  ButtonCalibrationItem,
  ControlPanelId,
  PanelId,
  PanelRects,
  PanelRect,
} from "../../../model/types";

export type CombinedCalibrationPhase =
  | "outer"
  | "controlSelection"
  | "buttonSelection"
  | "grid"
  | PanelId
  | "confirm";

export type CombinedActivePanelError = "invalid" | "overlap" | null;

export function getCombinedPanelOrder(
  enabledControls: ControlPanelId[],
  buttons: ButtonCalibrationItem[],
): PanelId[] {
  return [
    ...advancedPanelPhases.filter((id) => enabledControls.includes(id)),
    ...buttons.map((button) => button.id),
  ];
}

export function getCombinedPhaseOrder(
  enabledControls: ControlPanelId[],
  buttons: ButtonCalibrationItem[],
): CombinedCalibrationPhase[] {
  return [
    "outer",
    "controlSelection",
    "buttonSelection",
    "grid",
    ...getCombinedPanelOrder(enabledControls, buttons),
    "confirm",
  ];
}

export function getNextCombinedPhase(
  phase: CombinedCalibrationPhase,
  panelOrder: PanelId[],
): CombinedCalibrationPhase | null {
  const phaseOrder = getCombinedPhaseOrderFromPanelOrder(panelOrder);
  const index = phaseOrder.indexOf(phase);
  return phaseOrder[index + 1] ?? null;
}

export function getPreviousCombinedPhase(
  phase: CombinedCalibrationPhase,
  panelOrder: PanelId[],
): CombinedCalibrationPhase | null {
  const phaseOrder = getCombinedPhaseOrderFromPanelOrder(panelOrder);
  const index = phaseOrder.indexOf(phase);
  return phaseOrder[index - 1] ?? null;
}

export function getVisibleCombinedPanelIds(
  phase: CombinedCalibrationPhase,
  panelOrder: PanelId[],
): PanelId[] {
  if (["outer", "controlSelection", "buttonSelection", "grid"].includes(phase)) {
    return [];
  }
  if (phase === "confirm") {
    return panelOrder;
  }
  const index = panelOrder.indexOf(phase as PanelId);
  return index < 0 ? [] : panelOrder.slice(0, index + 1);
}

export function getCombinedActivePanelError(
  activeId: PanelId,
  visiblePanelIds: PanelId[],
  panels: PanelRects,
  outerRect: PanelRect,
): CombinedActivePanelError {
  const activeRect = panels[activeId];
  if (!activeRect || !arePanelsValid({ [activeId]: activeRect }, outerRect, [activeId])) {
    return "invalid";
  }
  const completedIds = visiblePanelIds.filter((id) => id !== activeId);
  return arePanelsValid(
    panels,
    outerRect,
    [...completedIds, activeId],
  ) ? null : "overlap";
}

function getCombinedPhaseOrderFromPanelOrder(
  panelOrder: PanelId[],
): CombinedCalibrationPhase[] {
  return [
    "outer",
    "controlSelection",
    "buttonSelection",
    "grid",
    ...panelOrder,
    "confirm",
  ];
}
