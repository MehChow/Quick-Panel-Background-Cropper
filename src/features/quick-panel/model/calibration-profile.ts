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

export interface SavedCalibrationProfiles {
  "default-union": DefaultUnionCalibrationProfile | null;
  "custom-panels": CustomPanelsCalibrationProfile | null;
}

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

export function createEmptySavedCalibrationProfiles(): SavedCalibrationProfiles {
  return {
    "custom-panels": null,
    "default-union": null,
  };
}

export function createEmptyPanelCalibration(id: PanelId): PanelCalibration {
  return {
    id,
    rect: null,
    status: "unconfigured",
  };
}

export function createEmptyCustomPanelsCalibrationProfile(): CustomPanelsCalibrationProfile {
  return {
    mode: "custom-panels",
    panels: Object.fromEntries(
      panelIds.map((id) => [id, createEmptyPanelCalibration(id)]),
    ) as Record<PanelId, PanelCalibration>,
    version: 1,
  };
}

export function cloneCustomPanelsCalibrationProfile(
  profile: CustomPanelsCalibrationProfile,
): CustomPanelsCalibrationProfile {
  return {
    mode: "custom-panels",
    panels: Object.fromEntries(
      panelIds.map((id) => [
        id,
        {
          ...profile.panels[id],
          rect: profile.panels[id].rect ? { ...profile.panels[id].rect } : null,
        },
      ]),
    ) as Record<PanelId, PanelCalibration>,
    version: profile.version,
  };
}

export function hasCalibrationForMode(
  mode: CalibrationMode,
  profile: CalibrationProfile | null,
) {
  return profile?.mode === mode;
}

export function getCalibrationProfileForMode(
  mode: CalibrationMode,
  savedProfiles: SavedCalibrationProfiles,
): CalibrationProfile | null {
  return savedProfiles[mode];
}

export function upsertSavedCalibrationProfile(
  savedProfiles: SavedCalibrationProfiles,
  profile: CalibrationProfile,
): SavedCalibrationProfiles {
  return profile.mode === "default-union"
    ? { ...savedProfiles, "default-union": profile }
    : { ...savedProfiles, "custom-panels": profile };
}

export function isSavableCustomPanelsCalibrationProfile(
  profile: CustomPanelsCalibrationProfile,
) {
  const panels = panelIds.map((id) => profile.panels[id]);

  return (
    panels.every(
      (panel) =>
        panel.status === "hidden" ||
        (panel.status === "present" && panel.rect !== null),
    ) &&
    panels.some(
      (panel) => panel.status === "present" && panel.rect !== null,
    )
  );
}
