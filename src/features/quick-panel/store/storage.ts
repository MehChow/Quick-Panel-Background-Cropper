import { createMMKV } from "react-native-mmkv";
import {
  createDefaultUnionCalibrationProfile,
  createEmptySavedCalibrationProfiles,
  getCalibrationProfileForMode,
  isSavableCustomPanelsCalibrationProfile,
  panelIds,
  upsertSavedCalibrationProfile,
  type CalibrationMode,
  type CalibrationProfile,
  type CustomPanelsCalibrationProfile,
  type PanelCalibration,
  type SavedCalibrationProfiles,
} from "../model/calibration-profile";
import type { CalibrationStateSnapshot, PanelId, PanelRect } from "../model/types";

const calibrationFlagKey = "quick-panel.is-calibrated";
const calibrationRectKey = "quick-panel.calibration-rect";
const calibrationProfileKey = "quick-panel.calibration-profile";
const calibrationProfilesKey = "quick-panel.calibration-profiles";
const calibrationModeKey = "quick-panel.calibration-mode";

export const supportedLanguages = ["en", "zh"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

const storage = createMMKV({ id: "quick-panel" });

export interface SavedCalibration {
  isCalibrated: boolean;
  rect: PanelRect | null;
}

export function loadCalibrationProfile(): CalibrationProfile | null {
  return loadCalibrationSnapshot().profile;
}

export function loadCalibration(): SavedCalibration {
  const snapshot = loadCalibrationSnapshot();

  return {
    isCalibrated: snapshot.isCalibrated,
    rect: snapshot.rect,
  };
}

export function loadCalibrationSnapshot(): CalibrationStateSnapshot {
  const savedProfiles = loadSavedCalibrationProfiles();
  const mode = loadSelectedCalibrationMode(savedProfiles);
  const profile = getCalibrationProfileForMode(mode, savedProfiles);

  return {
    isCalibrated: profile !== null,
    mode,
    profile,
    rect: profile?.mode === "default-union" ? profile.rect : null,
    savedProfiles,
  };
}

export function saveCalibrationProfile(profile: CalibrationProfile) {
  const savedProfiles = upsertSavedCalibrationProfile(
    loadSavedCalibrationProfiles(),
    profile,
  );
  storage.set(calibrationProfilesKey, JSON.stringify(savedProfiles));
  saveCalibrationMode(profile.mode);
  if (profile.mode === "default-union") {
    storage.set(calibrationFlagKey, true);
    storage.set(calibrationRectKey, JSON.stringify(profile.rect));
  }
}

export function saveCalibration(rect: PanelRect) {
  saveCalibrationProfile(createDefaultUnionCalibrationProfile(rect));
}

export function saveCalibrationMode(mode: CalibrationMode) {
  storage.set(calibrationModeKey, mode);
}

export function isSupportedLanguage(
  language: string | undefined,
): language is SupportedLanguage {
  return supportedLanguages.includes(language as SupportedLanguage);
}

function parseRect(value: string): PanelRect | null {
  try {
    const parsed = JSON.parse(value) as Partial<PanelRect>;
    if (
      typeof parsed.x === "number" &&
      typeof parsed.y === "number" &&
      typeof parsed.width === "number" &&
      typeof parsed.height === "number" &&
      typeof parsed.radius === "number"
    ) {
      return {
        x: parsed.x,
        y: parsed.y,
        width: parsed.width,
        height: parsed.height,
        radius: parsed.radius,
      };
    }
  } catch {
    return null;
  }

  return null;
}

function loadLegacyCalibrationRect(): PanelRect | null {
  const isCalibrated = storage.getBoolean(calibrationFlagKey) ?? false;
  const rectJson = storage.getString(calibrationRectKey);
  const rect = rectJson ? parseRect(rectJson) : null;
  return isCalibrated && rect ? rect : null;
}

function loadSavedCalibrationProfiles(): SavedCalibrationProfiles {
  const profilesJson = storage.getString(calibrationProfilesKey);
  const savedProfiles = profilesJson ? parseSavedCalibrationProfiles(profilesJson) : null;
  if (savedProfiles && hasSavedCalibrationProfiles(savedProfiles)) {
    return savedProfiles;
  }

  const legacyProfile = loadLegacyCalibrationProfile();
  if (legacyProfile) {
    return upsertSavedCalibrationProfile(
      createEmptySavedCalibrationProfiles(),
      legacyProfile,
    );
  }

  const legacyRect = loadLegacyCalibrationRect();
  if (legacyRect) {
    return upsertSavedCalibrationProfile(
      createEmptySavedCalibrationProfiles(),
      createDefaultUnionCalibrationProfile(legacyRect),
    );
  }

  return savedProfiles
    ? savedProfiles
    : createEmptySavedCalibrationProfiles();
}

function loadSelectedCalibrationMode(
  savedProfiles: SavedCalibrationProfiles,
): CalibrationMode {
  const mode = storage.getString(calibrationModeKey);
  if (mode === "default-union" || mode === "custom-panels") {
    return mode;
  }

  return savedProfiles["default-union"]
    ? "default-union"
    : savedProfiles["custom-panels"]
      ? "custom-panels"
      : "default-union";
}

function hasSavedCalibrationProfiles(savedProfiles: SavedCalibrationProfiles) {
  return (
    savedProfiles["custom-panels"] !== null ||
    savedProfiles["default-union"] !== null
  );
}

function loadLegacyCalibrationProfile(): CalibrationProfile | null {
  const profileJson = storage.getString(calibrationProfileKey);
  return profileJson ? parseCalibrationProfile(profileJson) : null;
}

function parseSavedCalibrationProfiles(
  value: string,
): SavedCalibrationProfiles | null {
  try {
    const parsed = JSON.parse(value) as
      | Partial<Record<CalibrationMode, unknown>>
      | null;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const defaultProfile = parseCalibrationProfileValue(parsed["default-union"]);
    const customProfile = parseCalibrationProfileValue(parsed["custom-panels"]);
    return {
      "custom-panels": customProfile?.mode === "custom-panels" ? customProfile : null,
      "default-union":
        defaultProfile?.mode === "default-union" ? defaultProfile : null,
    };
  } catch {
    return null;
  }
}

function parseCalibrationProfile(value: string): CalibrationProfile | null {
  try {
    return parseCalibrationProfileValue(JSON.parse(value));
  } catch {
    return null;
  }
}

function parseCalibrationProfileValue(value: unknown): CalibrationProfile | null {
  const parsed = value as Partial<CalibrationProfile> | null;
  if (!parsed || typeof parsed !== "object") {
    return null;
  }
  if (
    parsed.mode === "default-union" &&
    parsed.version === 1 &&
    parsed.rect &&
    typeof parsed.rect === "object"
  ) {
    return createDefaultUnionCalibrationProfile(parsed.rect as PanelRect);
  }

  if (parsed.mode !== "custom-panels" || parsed.version !== 1) {
    return null;
  }

  const panels = parsePanelCalibrations(
    (parsed as Partial<CustomPanelsCalibrationProfile>).panels,
  );
  if (!panels) {
    return null;
  }

  const profile = {
    mode: "custom-panels",
    panels,
    version: 1,
  } satisfies CustomPanelsCalibrationProfile;
  return isSavableCustomPanelsCalibrationProfile(profile) ? profile : null;
}

function parsePanelCalibrations(
  value: unknown,
): Record<PanelId, PanelCalibration> | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const panels = {} as Record<PanelId, PanelCalibration>;
  for (const id of panelIds) {
    const panel = (value as Partial<Record<PanelId, Partial<PanelCalibration>>>)[id];
    if (!panel || panel.id !== id) {
      return null;
    }
    if (
      panel.status !== "present" &&
      panel.status !== "hidden" &&
      panel.status !== "unconfigured"
    ) {
      return null;
    }

    const rect = panel.rect ? parseRect(JSON.stringify(panel.rect)) : null;
    panels[id] = {
      id,
      rect,
      status: panel.status,
    };
  }

  return panels;
}
