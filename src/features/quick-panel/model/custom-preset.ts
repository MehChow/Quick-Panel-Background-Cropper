import { getCalibratedPreset } from "../calibration/calibration";
import type {
  CalibrationProfile,
  CustomPanelsCalibrationProfile,
} from "./calibration-profile";
import { translate } from "./i18n";
import { goodLockOrder, s25PlusOneUi85Preset, visualOrder } from "./preset";
import type { PanelId, PanelRect, QuickPanelPreset } from "./types";

export function getPresetFromCalibrationProfile(
  profile: CalibrationProfile,
): QuickPanelPreset {
  if (profile.mode === "default-union") {
    return getCalibratedPreset(profile.rect);
  }

  return buildCustomPreset(profile);
}

export function buildCustomPreset(
  profile: CustomPanelsCalibrationProfile,
): QuickPanelPreset {
  const presentIds = getPresentPanelIds(profile);
  if (presentIds.length === 0) {
    throw new Error("At least one panel must be present in a custom layout.");
  }

  const union = getCustomPanelUnion(profile, presentIds);
  const panels = { ...s25PlusOneUi85Preset.panels };

  for (const id of presentIds) {
    const panel = profile.panels[id];
    panels[id] = {
      ...panels[id],
      rect: panel.rect as PanelRect,
    };
  }

  return {
    ...s25PlusOneUi85Preset,
    id: "custom-layout-calibrated",
    label: translate("preset.customLabel"),
    width: Math.ceil(union.x * 2 + union.width),
    height: Math.ceil(union.y + union.height),
    panels,
    visualOrder: visualOrder.filter((id) => presentIds.includes(id)),
    goodLockOrder: goodLockOrder.filter((id) => presentIds.includes(id)),
  };
}

function getPresentPanelIds(
  profile: CustomPanelsCalibrationProfile,
): PanelId[] {
  return visualOrder.filter((id) => {
    const panel = profile.panels[id];
    return panel.status === "present" && panel.rect !== null;
  });
}

function getCustomPanelUnion(
  profile: CustomPanelsCalibrationProfile,
  presentIds: PanelId[],
): PanelRect {
  const rects = presentIds.map((id) => profile.panels[id].rect as PanelRect);
  const left = Math.min(...rects.map((rect) => rect.x));
  const top = Math.min(...rects.map((rect) => rect.y));
  const right = Math.max(...rects.map((rect) => rect.x + rect.width));
  const bottom = Math.max(...rects.map((rect) => rect.y + rect.height));

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
    radius: 0,
  };
}

