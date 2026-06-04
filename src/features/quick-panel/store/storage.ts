import { createMMKV } from "react-native-mmkv";
import type {
  AdvancedCalibration,
  DefaultCalibration,
  PanelRect,
  PanelRects,
} from "../model/types";

const calibrationFlagKey = "quick-panel.is-calibrated";
const calibrationRectKey = "quick-panel.calibration-rect";
const calibrationsV2Key = "quick-panel.calibrations-v2";

export const supportedLanguages = ["en", "zh"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

const storage = createMMKV({ id: "quick-panel" });

export interface SavedCalibrations {
  version: 2;
  default: DefaultCalibration | null;
  advanced: AdvancedCalibration | null;
}

export interface SavedCalibration {
  isCalibrated: boolean;
  rect: PanelRect | null;
}

export function loadCalibrations(): SavedCalibrations {
  const saved = parseCalibrations(storage.getString(calibrationsV2Key));
  if (saved) {
    return saved;
  }

  const legacy = loadCalibration();
  return {
    version: 2,
    default: legacy.rect ? { rect: legacy.rect } : null,
    advanced: null,
  };
}

export function saveCalibrations(calibrations: SavedCalibrations) {
  storage.set(calibrationsV2Key, JSON.stringify(calibrations));
}

export function loadCalibration(): SavedCalibration {
  const isCalibrated = storage.getBoolean(calibrationFlagKey) ?? false;
  const rect = parseRect(storage.getString(calibrationRectKey));
  return isCalibrated && rect
    ? { isCalibrated: true, rect }
    : { isCalibrated: false, rect: null };
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

function parseCalibrations(value: string | undefined): SavedCalibrations | null {
  try {
    const parsed = value ? JSON.parse(value) as Partial<SavedCalibrations> : null;
    if (!parsed || parsed.version !== 2) {
      return null;
    }

    return {
      version: 2,
      default: parseDefaultCalibration(parsed.default),
      advanced: parseAdvancedCalibration(parsed.advanced),
    };
  } catch {
    return null;
  }
}

function parseDefaultCalibration(value: unknown): DefaultCalibration | null {
  if (!value || typeof value !== "object" || !("rect" in value)) {
    return null;
  }
  const rect = parseRectValue(value.rect);
  return rect ? { rect } : null;
}

function parseAdvancedCalibration(value: unknown): AdvancedCalibration | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const item = value as Partial<AdvancedCalibration>;
  const outerRect = parseRectValue(item.outerRect);
  const panels = parsePanelRects(item.panels);
  if (
    typeof item.screenshotWidth !== "number" ||
    typeof item.screenshotHeight !== "number" ||
    !outerRect ||
    !panels
  ) {
    return null;
  }
  return { screenshotWidth: item.screenshotWidth, screenshotHeight: item.screenshotHeight, outerRect, panels };
}

function parsePanelRects(value: unknown): PanelRects | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const panels = value as Partial<PanelRects>;
  const buttonBox = parseRectValue(panels.buttonBox);
  const brightness = parseRectValue(panels.brightness);
  const volume = parseRectValue(panels.volume);
  const mediaPlayer = parseRectValue(panels.mediaPlayer);
  return buttonBox && brightness && volume && mediaPlayer
    ? { buttonBox, brightness, volume, mediaPlayer }
    : null;
}

function parseRect(value: string | undefined): PanelRect | null {
  try {
    return value ? parseRectValue(JSON.parse(value)) : null;
  } catch {
    return null;
  }
}

function parseRectValue(value: unknown): PanelRect | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const rect = value as Partial<PanelRect>;
  return ["x", "y", "width", "height", "radius"].every(
    (key) => typeof rect[key as keyof PanelRect] === "number",
  ) ? rect as PanelRect : null;
}
