import { createMMKV, useMMKVString } from "react-native-mmkv";
import type {
  AdvancedCalibration,
  AdvancedButtonsCalibration,
  AdvancedSnapGrid,
  AdvancedTarget,
  ButtonCalibrationItem,
  ButtonPanelId,
  ControlPanelId,
  ControlPanelRects,
  CustomizationMode,
  DefaultCalibration,
  PanelRect,
} from "../model/types";
import { panelIds } from "../model/panel-ids";

const calibrationFlagKey = "quick-panel.is-calibrated";
const calibrationRectKey = "quick-panel.calibration-rect";
const calibrationsV2Key = "quick-panel.calibrations-v2";
const calibrationsV3Key = "quick-panel.calibrations-v3";
const lastExportedModeKey = "quick-panel.last-exported-mode";
const lastExportedAdvancedTargetKey = "quick-panel.last-exported-advanced-target";
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
  version: 3;
  default: DefaultCalibration | null;
  advancedControls: AdvancedCalibration | null;
  advancedButtons: AdvancedButtonsCalibration | null;
}

interface SavedCalibrationsV2 {
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
  const saved = parseCalibrationsV3(storage.getString(calibrationsV3Key));
  if (saved) {
    return saved;
  }
  const v2 = parseCalibrationsV2(storage.getString(calibrationsV2Key));
  if (v2) {
    return {
      version: 3,
      default: v2.default,
      advancedControls: v2.advanced,
      advancedButtons: null,
    };
  }

  const legacy = loadCalibration();
  return {
    version: 3,
    default: legacy.rect ? { rect: legacy.rect } : null,
    advancedControls: null,
    advancedButtons: null,
  };
}

export function saveCalibrations(calibrations: SavedCalibrations) {
  storage.set(calibrationsV3Key, JSON.stringify(calibrations));
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

export function loadLastExportedAdvancedTarget(): AdvancedTarget | null {
  const savedTarget = storage.getString(lastExportedAdvancedTargetKey);
  return isAdvancedTarget(savedTarget) ? savedTarget : null;
}

export function saveLastExportedAdvancedTarget(target: AdvancedTarget) {
  storage.set(lastExportedAdvancedTargetKey, target);
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

function parseCalibrationsV3(value: string | undefined): SavedCalibrations | null {
  try {
    const parsed = value ? JSON.parse(value) as Partial<SavedCalibrations> : null;
    if (!parsed || parsed.version !== 3) {
      return null;
    }

    return {
      version: 3,
      default: parseDefaultCalibration(parsed.default),
      advancedControls: parseAdvancedCalibration(parsed.advancedControls),
      advancedButtons: parseAdvancedButtonsCalibration(parsed.advancedButtons),
    };
  } catch {
    return null;
  }
}

function parseCalibrationsV2(value: string | undefined): SavedCalibrationsV2 | null {
  try {
    const parsed = value ? JSON.parse(value) as Partial<SavedCalibrationsV2> : null;
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

function parseEnabledPanels(value: unknown): ControlPanelId[] {
  if (!Array.isArray(value)) {
    return panelIds;
  }
  const panels = value.filter((item): item is ControlPanelId =>
    typeof item === "string" && panelIds.includes(item as ControlPanelId)
  );
  const uniquePanels = panels.filter((id, index) => panels.indexOf(id) === index);
  return uniquePanels.length > 0
    ? panelIds.filter((id) => uniquePanels.includes(id))
    : panelIds;
}

function parsePanelRects(value: unknown): ControlPanelRects | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const panels = value as Partial<ControlPanelRects>;
  const buttonBox = parseRectValue(panels.buttonBox);
  const brightness = parseRectValue(panels.brightness);
  const volume = parseRectValue(panels.volume);
  const mediaPlayer = parseRectValue(panels.mediaPlayer);
  return buttonBox && brightness && volume && mediaPlayer
    ? { buttonBox, brightness, volume, mediaPlayer }
    : null;
}

function parseAdvancedButtonsCalibration(value: unknown): AdvancedButtonsCalibration | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const item = value as Partial<AdvancedButtonsCalibration>;
  const outerRect = parseRectValue(item.outerRect);
  const grid = parseAdvancedGrid(item.grid);
  const buttons = parseButtonItems(item.buttons);
  if (
    typeof item.screenshotWidth !== "number" ||
    typeof item.screenshotHeight !== "number" ||
    !grid ||
    !outerRect ||
    buttons.length === 0
  ) {
    return null;
  }
  return {
    screenshotWidth: item.screenshotWidth,
    screenshotHeight: item.screenshotHeight,
    grid,
    outerRect,
    buttons,
  };
}

function parseButtonItems(value: unknown): ButtonCalibrationItem[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item): ButtonCalibrationItem[] => {
    if (!item || typeof item !== "object") {
      return [];
    }
    const button = item as Partial<ButtonCalibrationItem>;
    const rect = parseRectValue(button.rect);
    return isButtonPanelId(button.id) && typeof button.label === "string" && button.label.trim() && rect
      ? [{ id: button.id, label: button.label, rect }]
      : [];
  });
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

function isAdvancedTarget(value: unknown): value is AdvancedTarget {
  return value === "controls" || value === "buttons";
}

function isButtonPanelId(value: unknown): value is ButtonPanelId {
  return typeof value === "string" && /^button-\d+$/.test(value);
}
