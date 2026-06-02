import { getPanelLabel, translate } from "./i18n";
import type { PanelId, QuickPanelPreset } from "./types";

export const visualOrder: PanelId[] = [
  "buttonBox",
  "brightness",
  "volume",
  "mediaPlayer",
];

export const goodLockOrder: PanelId[] = [
  "buttonBox",
  "mediaPlayer",
  "brightness",
  "volume",
];

export const s25PlusOneUi85Preset: QuickPanelPreset = {
  id: "s25-plus-one-ui-8-5-default",
  label: translate("preset.defaultLabel"),
  width: 298,
  height: 654,
  visualOrder,
  goodLockOrder,
  panels: {
    buttonBox: {
      id: "buttonBox",
      label: getPanelLabel("buttonBox"),
      fileName: "01-button-box.png",
      rect: { x: 14, y: 164, width: 272, height: 119, radius: 25 },
    },
    brightness: {
      id: "brightness",
      label: getPanelLabel("brightness"),
      fileName: "03-brightness.png",
      rect: { x: 14, y: 291, width: 272, height: 56, radius: 28 },
    },
    volume: {
      id: "volume",
      label: getPanelLabel("volume"),
      fileName: "04-volume.png",
      rect: { x: 14, y: 355, width: 272, height: 56, radius: 28 },
    },
    mediaPlayer: {
      id: "mediaPlayer",
      label: getPanelLabel("mediaPlayer"),
      fileName: "02-media-player.png",
      rect: { x: 14, y: 419, width: 272, height: 56, radius: 28 },
    },
  },
};
