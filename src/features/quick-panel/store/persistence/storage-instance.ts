import { createMMKV } from "react-native-mmkv";

export const calibrationsKey = "quick-panel.calibrations";
export const buttonCustomizeSettingsKey = "quick-panel.button-customize-settings";
export const lastExportedModeKey = "quick-panel.last-exported-mode";
export const lastExportedAdvancedTargetKey =
  "quick-panel.last-exported-advanced-target";
export const seenHelpKey = "quick-panel.seen-help";
export const releaseAnnouncementKey = "quick-panel.acknowledged-release-announcement";
export const declinedPlayUpdateKey = "quick-panel.declined-play-update";
export const combinedButtonImageIntensityKey =
  "quick-panel.combined-button-image-intensity";
export const snapSensitivityKey = "quick-panel.snap-sensitivity";
export const lastImageDiskCacheClearAtKey =
  "quick-panel.last-image-disk-cache-clear-at";

export const storage = createMMKV({ id: "quick-panel" });
