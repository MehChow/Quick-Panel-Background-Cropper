import { createMMKV } from "react-native-mmkv";
import {
  createDefaultUnionCalibrationProfile,
  isSavableCustomPanelsCalibrationProfile,
  panelIds,
  type CalibrationProfile,
  type CustomPanelsCalibrationProfile,
  type PanelCalibration,
} from "../model/calibration-profile";
import type { CalibrationStateSnapshot, PanelId, PanelRect } from "../model/types";

const calibrationFlagKey = "quick-panel.is-calibrated";
const calibrationRectKey = "quick-panel.calibration-rect";
const calibrationProfileKey = "quick-panel.calibration-profile";

export const supportedLanguages = ["en", "zh"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

const storage = createMMKV({ id: "quick-panel" });

export interface SavedCalibration {
  isCalibrated: boolean;
  rect: PanelRect | null;
}

export function loadCalibrationProfile(): CalibrationProfile | null {
  const profileJson = storage.getString(calibrationProfileKey);
  const profile = profileJson ? parseCalibrationProfile(profileJson) : null;
  if (profile) {
    return profile;
  }

  const rect = loadLegacyCalibrationRect();
  return rect ? createDefaultUnionCalibrationProfile(rect) : null;
}

export function loadCalibration(): SavedCalibration {
  const profile = loadCalibrationProfile();
  if (!profile) {
    return {
      isCalibrated: false,
      rect: null,
    };
  }

  return {
    isCalibrated: true,
    rect: profile.mode === "default-union" ? profile.rect : null,
  };
}

export function loadCalibrationSnapshot(): CalibrationStateSnapshot {
  const profile = loadCalibrationProfile();
  if (!profile) {
    return {
      isCalibrated: false,
      mode: "default-union",
      profile: null,
      rect: null,
    };
  }

  return {
    isCalibrated: true,
    mode: profile.mode,
    profile,
    rect: profile.mode === "default-union" ? profile.rect : null,
  };
}

export function saveCalibrationProfile(profile: CalibrationProfile) {
  storage.set(calibrationProfileKey, JSON.stringify(profile));
  if (profile.mode === "default-union") {
    storage.set(calibrationFlagKey, true);
    storage.set(calibrationRectKey, JSON.stringify(profile.rect));
  }
}

export function saveCalibration(rect: PanelRect) {
  saveCalibrationProfile(createDefaultUnionCalibrationProfile(rect));
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

function parseCalibrationProfile(value: string): CalibrationProfile | null {
  try {
    const parsed = JSON.parse(value) as Partial<CalibrationProfile>;
    if (
      parsed.mode === "default-union" &&
      parsed.version === 1 &&
      parsed.rect &&
      typeof parsed.rect === "object"
    ) {
      return createDefaultUnionCalibrationProfile(parsed.rect as PanelRect);
    }

    if (parsed.mode === "custom-panels" && parsed.version === 1) {
      const panels = parsePanelCalibrations(
        (parsed as Partial<CustomPanelsCalibrationProfile>).panels,
      );
      if (panels) {
        const profile = {
          mode: "custom-panels",
          panels,
          version: 1,
        } satisfies CustomPanelsCalibrationProfile;
        if (isSavableCustomPanelsCalibrationProfile(profile)) {
          return profile;
        };
      }
    }
  } catch {
    return null;
  }

  return null;
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
