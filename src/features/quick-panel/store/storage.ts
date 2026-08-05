import { createMMKV, useMMKVString } from "react-native-mmkv";
import type {
  AdvancedCalibration,
  AdvancedButtonsCalibration,
  AdvancedCombinedCalibration,
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
import {
  defaultButtonIdentifierBackgroundTheme,
  defaultButtonIdentifierColor,
  normalizeButtonIdentifierBackgroundTheme,
  normalizeButtonIdentifierColor,
  type ButtonIdentifierBackgroundTheme,
} from "../customize/button-identifier-color";
import { panelIds } from "../model/panel-ids";
import {
  getBuiltInButtonLabel,
  isCustomButtonIconId,
} from "../model/button-labels";

const calibrationsKey = "quick-panel.calibrations";
const buttonCustomizeSettingsKey = "quick-panel.button-customize-settings";
const lastExportedModeKey = "quick-panel.last-exported-mode";
const lastExportedAdvancedTargetKey = "quick-panel.last-exported-advanced-target";
const seenHelpKey = "quick-panel.seen-help";
const releaseAnnouncementKey = "quick-panel.acknowledged-release-announcement";
const combinedButtonImageIntensityKey =
  "quick-panel.combined-button-image-intensity";
const lastImageDiskCacheClearAtKey =
  "quick-panel.last-image-disk-cache-clear-at";

export const activeReleaseAnnouncementId =
  "v1.3.1-cache-optimization-announcement";

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
  advancedCombined: AdvancedCombinedCalibration | null;
}

export interface ButtonCustomizeSettings {
  buttonIdentifierBackgroundTheme: ButtonIdentifierBackgroundTheme;
  buttonIdentifierColor: string;
  buttonIdentifierOpacity: number;
  buttonPanelOpacity: number;
  horizontalIdentifierPosition: number;
  showButtonIdentifiers: boolean;
  verticalIdentifierPosition: number;
}

export const defaultButtonCustomizeSettings: ButtonCustomizeSettings = {
  buttonIdentifierBackgroundTheme: defaultButtonIdentifierBackgroundTheme,
  buttonIdentifierColor: defaultButtonIdentifierColor,
  buttonIdentifierOpacity: 70,
  buttonPanelOpacity: 78,
  horizontalIdentifierPosition: 50,
  showButtonIdentifiers: true,
  verticalIdentifierPosition: 50,
};

export const defaultCombinedButtonImageIntensity = 78;

type SavedSeenHelp = Partial<Record<HelpEntryId, true>>;

export function loadCalibrations(): SavedCalibrations {
  return parseCalibrations(storage.getString(calibrationsKey)) ?? {
    default: null,
    advancedControls: null,
    advancedButtons: null,
    advancedCombined: null,
  };
}

export function saveCalibrations(calibrations: SavedCalibrations) {
  storage.set(calibrationsKey, JSON.stringify(calibrations));
}

export function loadButtonCustomizeSettings(): ButtonCustomizeSettings {
  return parseButtonCustomizeSettings(storage.getString(buttonCustomizeSettingsKey));
}

export function saveButtonCustomizeSettings(settings: ButtonCustomizeSettings) {
  storage.set(buttonCustomizeSettingsKey, JSON.stringify(settings));
}

export function loadCombinedButtonImageIntensity(): number {
  const saved = Number(storage.getString(combinedButtonImageIntensityKey));
  return parsePercentage(
    Number.isFinite(saved) ? saved : undefined,
    defaultCombinedButtonImageIntensity,
  );
}

export function saveCombinedButtonImageIntensity(value: number) {
  storage.set(combinedButtonImageIntensityKey, String(value));
}

export function loadLastImageDiskCacheClearAt(): number | null {
  const value = Number(storage.getString(lastImageDiskCacheClearAtKey));
  return Number.isFinite(value) && value >= 0 ? value : null;
}

export function saveLastImageDiskCacheClearAt(timestamp: number) {
  storage.set(lastImageDiskCacheClearAtKey, String(timestamp));
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

export function loadAcknowledgedReleaseAnnouncement(): string | null {
  return storage.getString(releaseAnnouncementKey) ?? null;
}

export function acknowledgeReleaseAnnouncement(id: string) {
  storage.set(releaseAnnouncementKey, id);
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
      advancedCombined: parseAdvancedCombinedCalibration(parsed.advancedCombined),
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

function parseButtonCustomizeSettings(value: string | undefined): ButtonCustomizeSettings {
  try {
    const parsed = value ? JSON.parse(value) as Partial<ButtonCustomizeSettings> : {};
    if (!parsed || typeof parsed !== "object") {
      return defaultButtonCustomizeSettings;
    }
    return {
      buttonIdentifierBackgroundTheme:
        normalizeButtonIdentifierBackgroundTheme(
          parsed.buttonIdentifierBackgroundTheme,
        ) ?? defaultButtonIdentifierBackgroundTheme,
      buttonIdentifierColor:
        normalizeButtonIdentifierColor(parsed.buttonIdentifierColor)
        ?? defaultButtonIdentifierColor,
      buttonIdentifierOpacity: parsePercentage(
        parsed.buttonIdentifierOpacity,
        defaultButtonCustomizeSettings.buttonIdentifierOpacity,
      ),
      buttonPanelOpacity: parsePercentage(
        parsed.buttonPanelOpacity,
        defaultButtonCustomizeSettings.buttonPanelOpacity,
      ),
      horizontalIdentifierPosition: parsePercentage(
        parsed.horizontalIdentifierPosition,
        defaultButtonCustomizeSettings.horizontalIdentifierPosition,
      ),
      showButtonIdentifiers: typeof parsed.showButtonIdentifiers === "boolean"
        ? parsed.showButtonIdentifiers
        : defaultButtonCustomizeSettings.showButtonIdentifiers,
      verticalIdentifierPosition: parsePercentage(
        parsed.verticalIdentifierPosition,
        defaultButtonCustomizeSettings.verticalIdentifierPosition,
      ),
    };
  } catch {
    return defaultButtonCustomizeSettings;
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

function parseCombinedEnabledControls(value: unknown): ControlPanelId[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const controls = value.filter((item): item is ControlPanelId =>
    typeof item === "string" && panelIds.includes(item as ControlPanelId)
  );
  const uniqueControls = controls.filter(
    (id, index) => controls.indexOf(id) === index,
  );
  return uniqueControls.length > 0
    ? panelIds.filter((id) => uniqueControls.includes(id))
    : null;
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
    outerRect,
    buttons,
  };
}

function parseAdvancedCombinedCalibration(value: unknown): AdvancedCombinedCalibration | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const item = value as Partial<AdvancedCombinedCalibration>;
  const outerRect = parseRectValue(item.outerRect);
  const grid = parseAdvancedGrid(item.grid);
  const controlPanels = parsePanelRects(item.controlPanels);
  const enabledControls = parseCombinedEnabledControls(item.enabledControls);
  const buttons = parseButtonItems(item.buttons);
  if (
    typeof item.screenshotWidth !== "number" ||
    typeof item.screenshotHeight !== "number" ||
    !grid ||
    !outerRect ||
    !enabledControls ||
    !controlPanels ||
    !buttons ||
    buttons.length === 0
  ) {
    return null;
  }
  return {
    screenshotWidth: item.screenshotWidth,
    screenshotHeight: item.screenshotHeight,
    grid,
    outerRect,
    enabledControls,
    controlPanels,
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

function parsePercentage(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100
    ? value
    : fallback;
}

function isCustomizationMode(value: unknown): value is CustomizationMode {
  return value === "default" || value === "advanced";
}

function isAdvancedTarget(value: unknown): value is AdvancedTarget {
  return value === "controls" || value === "buttons" || value === "combined";
}

function isButtonPanelId(value: unknown): value is ButtonPanelId {
  return typeof value === "string" && /^button-\d+$/.test(value);
}
