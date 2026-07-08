import { getPanelLabel, translate } from "./i18n";
import type { ControlPanelId, QuickPanelPreset } from "./types";

export const visualOrder: ControlPanelId[] = [
  "buttonBox",
  "brightness",
  "volume",
  "mediaPlayer",
];

export const goodLockOrder: ControlPanelId[] = [
  "buttonBox",
  "mediaPlayer",
  "brightness",
  "volume",
];

export const s25PlusOneUi85Preset: QuickPanelPreset = {
  id: "s25-plus-one-ui-8-5-default",
  label: translate("preset.defaultLabel"),
  mode: "default",
  width: 298,
  height: 654,
  customizationArea: { x: 14, y: 164, width: 272, height: 311, radius: 0 },
  visualOrder,
  goodLockOrder,
  panels: {
    buttonBox: {
      id: "buttonBox",
      family: "control",
      label: getPanelLabel("buttonBox"),
      fileName: "01-button-box.png",
      rect: { x: 14, y: 164, width: 272, height: 119, radius: 25 },
    },
    brightness: {
      id: "brightness",
      family: "control",
      label: getPanelLabel("brightness"),
      fileName: "03-brightness.png",
      rect: { x: 14, y: 291, width: 272, height: 56, radius: 28 },
    },
    volume: {
      id: "volume",
      family: "control",
      label: getPanelLabel("volume"),
      fileName: "04-volume.png",
      rect: { x: 14, y: 355, width: 272, height: 56, radius: 28 },
    },
    mediaPlayer: {
      id: "mediaPlayer",
      family: "control",
      label: getPanelLabel("mediaPlayer"),
      fileName: "02-media-player.png",
      rect: { x: 14, y: 419, width: 272, height: 56, radius: 28 },
    },
  },
};
