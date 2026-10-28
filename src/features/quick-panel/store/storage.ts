import { useMMKVString } from "react-native-mmkv";
import {
  defaultCombinedButtonImageIntensity,
  type ButtonCustomizeSettings,
} from "../model/button-customize-settings";
import {
  normalizeSnapSensitivity,
  type SnapSensitivity,
} from "../model/snap-sensitivity";
import type {
  AdvancedTarget,
  CustomizationMode,
} from "../model/types";
import {
  parseCalibrations,
  type SavedCalibrations,
} from "./persistence/calibration-codecs";
import {
  parseButtonCustomizeSettings,
  parsePercentage,
} from "./persistence/customize-settings-codec";
import {
  buttonCustomizeSettingsKey,
  calibrationsKey,
  combinedButtonImageIntensityKey,
  declinedPlayUpdateKey,
  lastExportedAdvancedTargetKey,
  lastExportedModeKey,
  lastImageDiskCacheClearAtKey,
  releaseAnnouncementKey,
  seenHelpKey,
  snapSensitivityKey,
  storage,
} from "./persistence/storage-instance";

export {
  isSupportedLanguage,
  supportedLanguages,
  type SupportedLanguage,
} from "../../../../i18next/languages";
export {
  defaultButtonCustomizeSettings,
  defaultCombinedButtonImageIntensity,
  type ButtonCustomizeSettings,
} from "../model/button-customize-settings";

export type { SavedCalibrations } from "./persistence/calibration-codecs";

export const activeReleaseAnnouncementId =
  "v1.7.4-large-image-custom-icons-announcement";

export const helpEntryIds = [
  "select-mode",
  "calibration-outer",
  "advanced-calibration-panel-alignment",
  "advanced-calibration-panel-review",
  "customize-image-placement",
] as const;
export type HelpEntryId = (typeof helpEntryIds)[number];

type SavedSeenHelp = Partial<Record<HelpEntryId, true>>;

export function loadCalibrations(): SavedCalibrations {
  return (
    parseCalibrations(storage.getString(calibrationsKey)) ?? {
      default: null,
      advancedControls: null,
      advancedButtons: null,
      advancedCombined: null,
    }
  );
}

export function saveCalibrations(calibrations: SavedCalibrations) {
  storage.set(calibrationsKey, JSON.stringify(calibrations));
}

export function loadButtonCustomizeSettings(): ButtonCustomizeSettings {
  return parseButtonCustomizeSettings(
    storage.getString(buttonCustomizeSettingsKey),
  );
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

export function loadSnapSensitivity(): SnapSensitivity {
  return normalizeSnapSensitivity(storage.getString(snapSensitivityKey));
}

export function saveSnapSensitivity(value: SnapSensitivity) {
  storage.set(snapSensitivityKey, value);
}

export function useSnapSensitivityPreference(): {
  snapSensitivity: SnapSensitivity;
  setSnapSensitivity: (value: SnapSensitivity) => void;
} {
  const [savedValue, setSavedValue] = useMMKVString(
    snapSensitivityKey,
    storage,
  );
  const snapSensitivity = normalizeSnapSensitivity(savedValue);
  const setSnapSensitivity = (value: SnapSensitivity) => {
    setSavedValue(value);
  };

  return { snapSensitivity, setSnapSensitivity };
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

export function usePlayUpdatePreferences() {
  const [declinedVersion, setDeclinedVersion] = useMMKVString(declinedPlayUpdateKey, storage);
  const [announcement] = useMMKVString(releaseAnnouncementKey, storage);
  return { declinedVersion, setDeclinedVersion, announcementAcknowledged: announcement === activeReleaseAnnouncementId };
}

export function loadSeenHelp(): SavedSeenHelp {
  return parseSeenHelp(storage.getString(seenHelpKey));
}

export function hasSeenHelp(helpId: HelpEntryId): boolean {
  return loadSeenHelp()[helpId] === true;
}

export function useHasSeenHelp(
  helpId: HelpEntryId | null | undefined,
): boolean {
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

function parseSeenHelp(value: string | undefined): SavedSeenHelp {
  try {
    const parsed = value ? (JSON.parse(value) as Record<string, unknown>) : {};
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

function isCustomizationMode(value: unknown): value is CustomizationMode {
  return value === "default" || value === "advanced";
}

function isAdvancedTarget(value: unknown): value is AdvancedTarget {
  return value === "controls" || value === "buttons" || value === "combined";
}
