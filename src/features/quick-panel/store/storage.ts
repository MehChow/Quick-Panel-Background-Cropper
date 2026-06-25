import { createMMKV, useMMKVString } from "react-native-mmkv";
import type {
  AdvancedCalibration,
  AdvancedSnapGrid,
  CustomizationMode,
  DefaultCalibration,
  PanelId,
  PanelRect,
  PanelRects,
} from "../model/types";
import { panelIds } from "../model/panel-ids";

const calibrationFlagKey = "quick-panel.is-calibrated";
const calibrationRectKey = "quick-panel.calibration-rect";
const calibrationsV2Key = "quick-panel.calibrations-v2";
const lastExportedModeKey = "quick-panel.last-exported-mode";
const seenHelpKey = "quick-panel.seen-help";

export const supportedLanguages = ["en", "zh"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];
export const helpEntryIds = [
  "select-mode",
  "calibration-outer",
  "advanced-calibration-panel-alignment",
  "advanced-calibration-panel-review",
] as const;
export type HelpEntryId = (typeof helpEntryIds)[number];

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

type SavedSeenHelp = Partial<Record<HelpEntryId, true>>;

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

export function loadLastExportedMode(): CustomizationMode | null {
  const savedMode = storage.getString(lastExportedModeKey);
  return isCustomizationMode(savedMode) ? savedMode : null;
}

export function saveLastExportedMode(mode: CustomizationMode) {
  storage.set(lastExportedModeKey, mode);
}

export function loadSeenHelp(): SavedSeenHelp {
  return parseSeenHelp(storage.getString(seenHelpKey));
}

export function hasSeenHelp(helpId: HelpEntryId): boolean {
  return loadSeenHelp()[helpId] === true;
}

export function useHasSeenHelp(helpId: HelpEntryId | null | undefined): boolean {
  const [seenHelpValue] = useMMKVString(seenHelpKey, storage);
  if (!helpId) {
    return false;
  }
  return parseSeenHelp(seenHelpValue)[helpId] === true;
}

export function markHelpSeen(helpId: HelpEntryId) {
  storage.set(
    seenHelpKey,
    JSON.stringify({
      ...loadSeenHelp(),
      [helpId]: true,
    }),
  );
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

function parseSeenHelp(value: string | undefined): SavedSeenHelp {
  try {
    const parsed = value ? JSON.parse(value) as Record<string, unknown> : {};
    return helpEntryIds.reduce<SavedSeenHelp>((result, helpId) => {
      if (parsed[helpId] === true) {
        result[helpId] = true;
      }
      return result;
    }, {});
  } catch {
    return {};
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
  const grid = parseAdvancedGrid(item.grid);
  const enabledPanels = parseEnabledPanels(item.enabledPanels);
  if (
    typeof item.screenshotWidth !== "number" ||
    typeof item.screenshotHeight !== "number" ||
    !grid ||
    !outerRect ||
    !panels
  ) {
    return null;
  }
  return {
    screenshotWidth: item.screenshotWidth,
    screenshotHeight: item.screenshotHeight,
    grid,
    outerRect,
    enabledPanels,
    panels,
  };
}

function parseEnabledPanels(value: unknown): PanelId[] {
  if (!Array.isArray(value)) {
    return panelIds;
  }
  const panels = value.filter((item): item is PanelId =>
    typeof item === "string" && panelIds.includes(item as PanelId)
  );
  const uniquePanels = panels.filter((id, index) => panels.indexOf(id) === index);
  return uniquePanels.length > 0
    ? panelIds.filter((id) => uniquePanels.includes(id))
    : panelIds;
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

function parseAdvancedGrid(value: unknown): AdvancedSnapGrid | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const grid = value as Partial<AdvancedSnapGrid>;
  return isGridValue(grid.columns) && isGridValue(grid.rows)
    ? { columns: grid.columns, rows: grid.rows }
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

function isGridValue(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 8;
}

function isCustomizationMode(value: unknown): value is CustomizationMode {
  return value === "default" || value === "advanced";
}
