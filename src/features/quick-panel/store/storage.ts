import { createMMKV, useMMKVBoolean, useMMKVString } from "react-native-mmkv";
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
import {
  getBuiltInButtonLabel,
  isCustomButtonIconId,
} from "../model/button-labels";

const calibrationsKey = "quick-panel.calibrations";
const lastExportedModeKey = "quick-panel.last-exported-mode";
const lastExportedAdvancedTargetKey = "quick-panel.last-exported-advanced-target";
const seenHelpKey = "quick-panel.seen-help";
const showSourceImageContextKey = "quick-panel.show-source-image-context";

export const supportedLanguages = ["en", "zh"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];
export const helpEntryIds = [
  "select-mode",
  "calibration-outer",
  "advanced-calibration-panel-alignment",
  "advanced-calibration-panel-review",
  "customize-image-placement",
] as const;
export type HelpEntryId = (typeof helpEntryIds)[number];

const storage = createMMKV({ id: "quick-panel" });

export interface SavedCalibrations {
  default: DefaultCalibration | null;
  advancedControls: AdvancedCalibration | null;
  advancedButtons: AdvancedButtonsCalibration | null;
}

type SavedSeenHelp = Partial<Record<HelpEntryId, true>>;

export function loadCalibrations(): SavedCalibrations {
  return parseCalibrations(storage.getString(calibrationsKey)) ?? {
    default: null,
    advancedControls: null,
    advancedButtons: null,
  };
}

export function saveCalibrations(calibrations: SavedCalibrations) {
  storage.set(calibrationsKey, JSON.stringify(calibrations));
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

export function useShowSourceImageContext() {
  const [savedValue, setSavedValue] = useMMKVBoolean(
    showSourceImageContextKey,
    storage,
  );

  return [savedValue ?? true, setSavedValue] as const;
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
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return {
      default: parseDefaultCalibration(parsed.default),
      advancedControls: parseAdvancedCalibration(parsed.advancedControls),
      advancedButtons: parseAdvancedButtonsCalibration(parsed.advancedButtons),
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
    isGridEnabled: parseGridEnabled(item.isGridEnabled),
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
    !buttons || buttons.length === 0
  ) {
    return null;
  }
  return {
    screenshotWidth: item.screenshotWidth,
    screenshotHeight: item.screenshotHeight,
    grid,
    isGridEnabled: parseGridEnabled(item.isGridEnabled),
    outerRect,
    buttons,
  };
}

function parseButtonItems(value: unknown): ButtonCalibrationItem[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const buttons: ButtonCalibrationItem[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") {
      return null;
    }
    const button = item as Partial<ButtonCalibrationItem>;
    const rect = parseRectValue(button.rect);
    const isBuiltIn = typeof button.label === "string"
      && Boolean(getBuiltInButtonLabel(button.label));
    if (
      !isButtonPanelId(button.id)
      || typeof button.label !== "string"
      || !button.label.trim()
      || !rect
    ) {
      return null;
    }
    let customIconId: ButtonCalibrationItem["customIconId"];
    if (isBuiltIn) {
      if (button.customIconId !== null) return null;
      customIconId = null;
    } else {
      if (!isCustomButtonIconId(button.customIconId)) return null;
      customIconId = button.customIconId;
    }
    buttons.push({
      id: button.id,
      label: button.label,
      customIconId,
      rect,
    });
  }
  return buttons;
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

function parseGridEnabled(value: unknown): boolean {
  return typeof value === "boolean" ? value : true;
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
