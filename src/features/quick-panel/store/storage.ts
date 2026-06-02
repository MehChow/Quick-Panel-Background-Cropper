import { createMMKV } from "react-native-mmkv";
import type { PanelRect } from "../model/types";

const calibrationFlagKey = "quick-panel.is-calibrated";
const calibrationRectKey = "quick-panel.calibration-rect";

export const supportedLanguages = ["en", "zh"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

const storage = createMMKV({ id: "quick-panel" });

export interface SavedCalibration {
  isCalibrated: boolean;
  rect: PanelRect | null;
}

export function loadCalibration(): SavedCalibration {
  const isCalibrated = storage.getBoolean(calibrationFlagKey) ?? false;
  const rectJson = storage.getString(calibrationRectKey);
  const rect = rectJson ? parseRect(rectJson) : null;

  if (!isCalibrated || !rect) {
    return { isCalibrated: false, rect: null };
  }

  return { isCalibrated: true, rect };
}

export function saveCalibration(rect: PanelRect) {
  storage.set(calibrationFlagKey, true);
  storage.set(calibrationRectKey, JSON.stringify(rect));
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
