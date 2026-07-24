import type { ControlPanelId, PanelId } from "../../model/types";

export type AdvancedCalibrationPhase =
  | "outer"
  | "panelSelection"
  | "grid"
  | PanelId
  | "confirm";

export const advancedPanelPhases: ControlPanelId[] = [
  "buttonBox",
  "brightness",
  "volume",
  "mediaPlayer",
];

export function isPanelPhase(
  phase: AdvancedCalibrationPhase,
): phase is PanelId {
  return typeof phase === "string" &&
    !["outer", "panelSelection", "grid", "confirm"].includes(phase);
}

export function getNextPhase(
  phase: AdvancedCalibrationPhase,
  enabledPanels: PanelId[],
): AdvancedCalibrationPhase | null {
  const phaseOrder = getPhaseOrder(enabledPanels);
  const index = phaseOrder.indexOf(phase);
  return phaseOrder[index + 1] ?? null;
}

export function getPreviousPhase(
  phase: AdvancedCalibrationPhase,
  enabledPanels: PanelId[],
): AdvancedCalibrationPhase | null {
  const phaseOrder = getPhaseOrder(enabledPanels);
  const index = phaseOrder.indexOf(phase);
  return phaseOrder[index - 1] ?? null;
}

export function getVisiblePanelIds(
  phase: AdvancedCalibrationPhase,
  enabledPanels: PanelId[],
): PanelId[] {
  if (phase === "outer" || phase === "panelSelection" || phase === "grid") {
    return [];
  }
  if (phase === "confirm") {
    return enabledPanels;
  }
  const index = enabledPanels.indexOf(phase);
  return enabledPanels.slice(0, index + 1);
}

export function getPhaseOrder(
  enabledPanels: PanelId[],
): AdvancedCalibrationPhase[] {
  const panelPhases = enabledPanels.every((id) => advancedPanelPhases.includes(id as ControlPanelId))
    ? advancedPanelPhases.filter((id) => enabledPanels.includes(id))
    : enabledPanels;
  return ["outer", "panelSelection", "grid", ...panelPhases, "confirm"];
}
