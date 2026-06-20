import type { PanelId } from "../../model/types";

export type AdvancedCalibrationPhase =
  | "outer"
  | "grid"
  | "buttonBox"
  | "brightness"
  | "volume"
  | "mediaPlayer"
  | "confirm";

export const advancedPanelPhases: PanelId[] = [
  "buttonBox",
  "brightness",
  "volume",
  "mediaPlayer",
];

const phaseOrder: AdvancedCalibrationPhase[] = [
  "outer",
  "grid",
  ...advancedPanelPhases,
  "confirm",
];

export function isPanelPhase(
  phase: AdvancedCalibrationPhase,
): phase is PanelId {
  return advancedPanelPhases.includes(phase as PanelId);
}

export function getNextPhase(
  phase: AdvancedCalibrationPhase,
): AdvancedCalibrationPhase | null {
  const index = phaseOrder.indexOf(phase);
  return phaseOrder[index + 1] ?? null;
}

export function getPreviousPhase(
  phase: AdvancedCalibrationPhase,
): AdvancedCalibrationPhase | null {
  const index = phaseOrder.indexOf(phase);
  return phaseOrder[index - 1] ?? null;
}

export function getVisiblePanelIds(phase: AdvancedCalibrationPhase): PanelId[] {
  if (phase === "outer" || phase === "grid") {
    return [];
  }
  if (phase === "confirm") {
    return advancedPanelPhases;
  }
  const index = advancedPanelPhases.indexOf(phase);
  return advancedPanelPhases.slice(0, index + 1);
}
