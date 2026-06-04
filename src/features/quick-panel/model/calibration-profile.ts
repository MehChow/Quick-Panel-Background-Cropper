import type { PanelId, PanelRect } from "./types";

export const panelIds: PanelId[] = [
  "buttonBox",
  "brightness",
  "volume",
  "mediaPlayer",
];

export type CalibrationMode = "default-union" | "custom-panels";
export type PanelCalibrationStatus = "present" | "hidden" | "unconfigured";

export interface PanelCalibration {
  id: PanelId;
  rect: PanelRect | null;
  status: PanelCalibrationStatus;
}

export interface DefaultUnionCalibrationProfile {
  mode: "default-union";
  rect: PanelRect;
  version: 1;
}

export interface CustomPanelsCalibrationProfile {
  mode: "custom-panels";
  panels: Record<PanelId, PanelCalibration>;
  version: 1;
}

export type CalibrationProfile =
  | DefaultUnionCalibrationProfile
  | CustomPanelsCalibrationProfile;

export function createDefaultUnionCalibrationProfile(
  rect: PanelRect,
): DefaultUnionCalibrationProfile {
  return {
    mode: "default-union",
    rect,
    version: 1,
  };
}

export function isCustomPanelsCalibrationProfile(
  profile: CalibrationProfile,
): profile is CustomPanelsCalibrationProfile {
  return profile.mode === "custom-panels";
}

export function createEmptyPanelCalibration(id: PanelId): PanelCalibration {
  return {
    id,
    rect: null,
    status: "unconfigured",
  };
}

